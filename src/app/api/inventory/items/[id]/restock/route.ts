import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getMongoDb } from "@/lib/mongodb";
import { parseToISTIsoString, getNowISTIsoString } from "@/lib/dateUtils";
import { createTransaction } from "@/lib/ledgerDb";
import { recordPartnerTransaction } from "@/lib/borrowingDb";
import { createInventoryItem } from "@/lib/inventoryDb";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const db = await getMongoDb();
    const itemsCol = db.collection<any>("inventory_items");

    // 1. Fetch original item to repopulate all specs, brand, model, category, etc.
    const originalItem = await itemsCol.findOne({ $or: [{ id }, { _id: id } as any] });
    if (!originalItem) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    const addedQty = parseInt(body.stockQuantity, 10);
    if (!addedQty || addedQty <= 0) {
      return NextResponse.json({ error: "Valid stock quantity is required" }, { status: 400 });
    }

    const purchasePrice = typeof body.purchasePrice === "number" ? body.purchasePrice : parseFloat(body.purchasePrice) || originalItem.purchasePrice || 0;
    const sellingPrice = typeof body.sellingPrice === "number" ? body.sellingPrice : parseFloat(body.sellingPrice) || originalItem.sellingPrice || 0;
    const totalPurchaseValue = purchasePrice * addedQty;

    const financeMode = body.financeMode || "wallet"; // "wallet" | "credit" | "partner_borrowing" | "none"
    const paymentMode = body.paymentMode || "Cash";
    const paymentRef = body.paymentRef?.trim() || "";
    const dealerId = body.dealerId || originalItem.dealerId || undefined;
    const dealerName = body.dealerName || originalItem.dealerName || undefined;
    const partnerId = body.partnerId || undefined;
    const partnerName = body.partnerName || "Partner";

    const serialList = Array.isArray(body.serialNumbers)
      ? body.serialNumbers.filter(Boolean)
      : typeof body.serialNumbers === "string"
      ? body.serialNumbers.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean)
      : [];

    const nowIST = getNowISTIsoString();

    // 2. Financial & Accounting Settlement
    if (totalPurchaseValue > 0) {
      // Option A: Paid from Shop Cash / UPI Wallet
      if (financeMode === "wallet") {
        try {
          await createTransaction({
            type: "debit",
            amount: totalPurchaseValue,
            paymentMode: (paymentMode as any) || "Cash",
            category: "Stock Purchase",
            reason: `Restock: ${originalItem.name} x${addedQty}${dealerName ? ` (${dealerName})` : ""}`,
            referenceNumber: paymentRef || originalItem.code,
            date: nowIST,
            dealerId,
            dealerName,
          });

          if (dealerId) {
            const { recordDealerPurchase, recordDealerPayment } = await import("@/lib/dealersDb");
            await recordDealerPurchase(dealerId, totalPurchaseValue, {
              description: `Restock (Paid on Delivery): ${originalItem.name} x${addedQty}`,
              itemId: originalItem.id,
              itemCode: originalItem.code,
              referenceNumber: paymentRef,
            });
            await recordDealerPayment(dealerId, totalPurchaseValue, {
              paymentMode: (paymentMode as any) || "Cash",
              description: `Restock payment: ${originalItem.name} x${addedQty}`,
              referenceNumber: paymentRef,
            });
          }
        } catch (ledgerErr) {
          console.error("Failed to auto-debit wallet ledger for restock:", ledgerErr);
        }
      }

      // Option B: Bought on Dealer Credit
      else if (financeMode === "credit" && dealerId) {
        try {
          const { recordDealerPurchase } = await import("@/lib/dealersDb");
          await recordDealerPurchase(dealerId, totalPurchaseValue, {
            description: `Restock on Credit: ${originalItem.name} x${addedQty}`,
            itemId: originalItem.id,
            itemCode: originalItem.code,
            referenceNumber: paymentRef || originalItem.code,
          });
        } catch (dealerErr) {
          console.error("Failed to update dealer balance for restock on credit:", dealerErr);
        }
      }

      // Option C: Paid Out-of-Pocket by Partner
      else if (financeMode === "partner_borrowing" && partnerId) {
        try {
          // Increase partner's borrowed debt (Shop owes partner reimbursement)
          await recordPartnerTransaction({
            partnerId,
            type: "borrow",
            amount: totalPurchaseValue,
            paymentMode: (paymentMode as any) || "UPI",
            date: nowIST,
            reason: `Restock Out-of-Pocket paid by ${partnerName}: ${originalItem.name} x${addedQty}`,
            referenceNumber: paymentRef,
            syncMainLedger: false, // Strictly false: cash drawer is not inflated!
          });
        } catch (partnerErr) {
          console.error("Failed to record partner out-of-pocket restock:", partnerErr);
        }
      }
    }

    // 3. Stock Update: Keep in SAME item while tracking each unit & batch separately
    const currentStock = Number(originalItem.stockQuantity) || 0;
    const currentAvailable = typeof originalItem.availableQuantity === "number" ? originalItem.availableQuantity : currentStock;

    const newStockQuantity = currentStock + addedQty;
    const newAvailableQuantity = currentAvailable + addedQty;

    // Existing unit tracking array or backfilled from original stock
    let unitTracking: any[] = Array.isArray(originalItem.unitTracking) ? [...originalItem.unitTracking] : [];
    if (unitTracking.length === 0 && currentStock > 0) {
      // Backfill initial stock units
      const existingSerials = Array.isArray(originalItem.serialNumbers) ? originalItem.serialNumbers : [];
      const allocatedRecords = Array.isArray(originalItem.allocatedRecords) ? originalItem.allocatedRecords : [];
      let totalAllocated = allocatedRecords.reduce((acc: number, r: any) => acc + (r.quantity || 0), 0);

      for (let i = 0; i < currentStock; i++) {
        const isAllocated = i < totalAllocated;
        unitTracking.push({
          unitId: existingSerials[i] || `${originalItem.code}-U${i + 1}`,
          serialNumber: existingSerials[i] || undefined,
          restockBatchId: "INITIAL-STOCK",
          dateAdded: originalItem.createdAt ? new Date(originalItem.createdAt).toISOString() : nowIST,
          purchasePrice: originalItem.purchasePrice || 0,
          sellingPrice: originalItem.sellingPrice || 0,
          status: isAllocated ? "allocated" : "available",
        });
      }
    }

    const startUnitIndex = unitTracking.length;
    const batchId = `RST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newUnits: any[] = [];

    for (let i = 0; i < addedQty; i++) {
      const serial = serialList[i] || undefined;
      const unitId = serial || `${originalItem.code}-U${startUnitIndex + i + 1}`;
      const unitObj = {
        unitId,
        serialNumber: serial,
        restockBatchId: batchId,
        dateAdded: nowIST,
        purchasePrice,
        sellingPrice,
        status: "available",
      };
      newUnits.push(unitObj);
      unitTracking.push(unitObj);
    }

    // Restock Batch record
    const restockBatch = {
      id: batchId,
      date: nowIST,
      quantity: addedQty,
      purchasePrice,
      sellingPrice,
      financeMode,
      dealerId,
      dealerName,
      partnerId,
      partnerName,
      paymentMode,
      paymentRef,
      serialNumbers: serialList,
      unitIds: newUnits.map((u) => u.unitId),
      notes: body.notes || "",
    };

    const restockHistory = Array.isArray(originalItem.restockHistory)
      ? [...originalItem.restockHistory, restockBatch]
      : [restockBatch];

    // Combined unique serial numbers
    const allSerials = Array.from(
      new Set([
        ...(Array.isArray(originalItem.serialNumbers) ? originalItem.serialNumbers : []),
        ...serialList,
      ])
    );

    const updateDoc: any = {
      stockQuantity: newStockQuantity,
      availableQuantity: newAvailableQuantity,
      purchasePrice,
      sellingPrice,
      serialNumbers: allSerials,
      unitTracking,
      restockHistory,
      updatedAt: new Date(),
    };

    if (dealerId) updateDoc.dealerId = dealerId;
    if (dealerName) updateDoc.dealerName = dealerName;

    await itemsCol.updateOne(
      { $or: [{ id }, { _id: id } as any] },
      { $set: updateDoc }
    );

    const updated = await itemsCol.findOne({ $or: [{ id }, { _id: id } as any] });

    return NextResponse.json({
      success: true,
      item: updated,
      addedQuantity: addedQty,
      newStockQuantity,
      newAvailableQuantity,
      batchId,
      newUnits,
      message: `Restocked +${addedQty} units for ${originalItem.name}. Total available in same item: ${newAvailableQuantity}`,
    });
  } catch (error: any) {
    console.error("Error in POST /api/inventory/items/[id]/restock:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to restock inventory item" },
      { status: 500 }
    );
  }
}

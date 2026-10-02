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

      // Option C: Paid Out-of-Pocket by Partner (Middle Way: Atomic Pair with Zero Wallet Mismatch!)
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
            syncMainLedger: false,
          });

          // Atomic Paired Credit: Lent by Partner
          await createTransaction({
            type: "credit",
            amount: totalPurchaseValue,
            paymentMode: (paymentMode as any) || "UPI",
            category: "Partner Borrowing",
            reason: `Lent by ${partnerName} [Restock Out-of-Pocket: ${originalItem.name} x${addedQty}]`,
            referenceNumber: paymentRef,
            date: nowIST,
          });

          // Atomic Paired Debit: Stock Purchase Expense
          await createTransaction({
            type: "debit",
            amount: totalPurchaseValue,
            paymentMode: (paymentMode as any) || "UPI",
            category: "Stock Purchase",
            reason: `Restock Purchase: ${originalItem.name} x${addedQty} (Paid directly by ${partnerName})`,
            referenceNumber: paymentRef,
            date: nowIST,
          });
        } catch (partnerErr) {
          console.error("Failed to record partner out-of-pocket restock:", partnerErr);
        }
      }
    }

    // 3. Stock Update: Increment Existing Item vs Split Units
    const splitUnits = Boolean(body.splitUnits);

    if (splitUnits) {
      // Create new unit items with unique RRTS item codes
      const createdBatch = [];
      for (let i = 0; i < addedQty; i++) {
        const unitItem = await createInventoryItem({
          name: originalItem.name,
          category: originalItem.category,
          subcategory: originalItem.subcategory || "General",
          brand: originalItem.brand || "",
          model: originalItem.model || "",
          condition: originalItem.condition || "Brand New",
          serialNumbers: serialList[i] ? [serialList[i]] : [],
          specs: originalItem.specs || {},
          purchasePrice,
          sellingPrice,
          stockQuantity: 1,
          dealerId,
          dealerName,
          boughtOnCredit: financeMode === "credit",
          location: originalItem.location || "",
          notes: body.notes || originalItem.notes || "",
        });
        createdBatch.push(unitItem);
      }

      return NextResponse.json({
        success: true,
        restockedType: "batch",
        count: createdBatch.length,
        items: createdBatch,
        message: `Restocked ${createdBatch.length} new units for ${originalItem.name}`,
      });
    } else {
      // Increment existing SKU quantity
      const currentStock = Number(originalItem.stockQuantity) || 0;
      const currentAvailable = typeof originalItem.availableQuantity === "number" ? originalItem.availableQuantity : currentStock;

      const newStockQuantity = currentStock + addedQty;
      const newAvailableQuantity = currentAvailable + addedQty;

      const updateDoc: any = {
        stockQuantity: newStockQuantity,
        availableQuantity: newAvailableQuantity,
        purchasePrice,
        sellingPrice,
        updatedAt: new Date(),
      };

      if (dealerId) updateDoc.dealerId = dealerId;
      if (dealerName) updateDoc.dealerName = dealerName;

      if (serialList.length > 0) {
        updateDoc.$push = { serialNumbers: { $each: serialList } };
      }

      await itemsCol.updateOne(
        { $or: [{ id }, { _id: id } as any] },
        {
          $set: updateDoc,
          ...(serialList.length > 0 ? { $addToSet: { serialNumbers: { $each: serialList } } } : {}),
        }
      );

      const updated = await itemsCol.findOne({ $or: [{ id }, { _id: id } as any] });

      return NextResponse.json({
        success: true,
        restockedType: "increment",
        item: updated,
        addedQuantity: addedQty,
        newStockQuantity,
        newAvailableQuantity,
        message: `Restocked +${addedQty} units for ${originalItem.name}. Total available: ${newAvailableQuantity}`,
      });
    }
  } catch (error: any) {
    console.error("Error in POST /api/inventory/items/[id]/restock:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to restock inventory item" },
      { status: 500 }
    );
  }
}

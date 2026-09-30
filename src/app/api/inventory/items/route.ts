import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getInventoryItems, createInventoryItem } from "@/lib/inventoryDb";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const subcategory = searchParams.get("subcategory") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const items = await getInventoryItems({ category, subcategory, search });
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ error: "Item name and category are required" }, { status: 400 });
    }

    const qty = Math.max(1, parseInt(body.stockQuantity, 10) || 1);
    const splitUnits = Boolean(body.splitUnits && qty > 1);

    const serialList = Array.isArray(body.serialNumbers)
      ? body.serialNumbers.filter(Boolean)
      : typeof body.serialNumbers === "string"
      ? body.serialNumbers.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean)
      : [];

    if (splitUnits) {
      const createdItems = [];
      for (let i = 0; i < qty; i++) {
        const unitItem = await createInventoryItem({
          name: body.name.trim(),
          category: body.category,
          subcategory: body.subcategory || "General",
          brand: body.brand?.trim() || "",
          model: body.model?.trim() || "",
          condition: body.condition || "Brand New",
          serialNumbers: serialList[i] ? [serialList[i]] : [],
          specs: body.specs || {},
          purchasePrice: Number(body.purchasePrice) || 0,
          sellingPrice: Number(body.sellingPrice) || 0,
          stockQuantity: 1,
          dealerId: body.dealerId || undefined,
          dealerName: body.dealerName || undefined,
          boughtOnCredit: Boolean(body.boughtOnCredit),
          location: body.location || "",
          notes: body.notes || "",
        });
        createdItems.push(unitItem);
      }

      if (body.dealerId && Number(body.purchasePrice) > 0 && body.boughtOnCredit) {
        try {
          const { recordDealerPurchase } = await import("@/lib/dealersDb");
          const totalPurchaseValue = (Number(body.purchasePrice) || 0) * qty;
          const codesSummary = createdItems.map((c) => c.code).join(", ");
          await recordDealerPurchase(body.dealerId, totalPurchaseValue, {
            description: `Stock on Credit: ${body.name} x${qty} (${codesSummary})`,
            itemId: createdItems[0].id,
            itemCode: codesSummary,
            referenceNumber: createdItems[0].code,
          });
        } catch (dealerErr) {
          console.error("Failed to update dealer purchase balance:", dealerErr);
        }
      }

      return NextResponse.json({ item: createdItems[0], items: createdItems, count: createdItems.length }, { status: 201 });
    }

    const item = await createInventoryItem({
      name: body.name.trim(),
      code: body.code?.trim(),
      category: body.category,
      subcategory: body.subcategory || "General",
      brand: body.brand?.trim() || "",
      model: body.model?.trim() || "",
      condition: body.condition || "Brand New",
      serialNumbers: serialList,
      specs: body.specs || {},
      purchasePrice: Number(body.purchasePrice) || 0,
      sellingPrice: Number(body.sellingPrice) || 0,
      stockQuantity: qty,
      dealerId: body.dealerId || undefined,
      dealerName: body.dealerName || undefined,
      boughtOnCredit: Boolean(body.boughtOnCredit),
      location: body.location || "",
      notes: body.notes || "",
    });

    if (body.dealerId && Number(body.purchasePrice) > 0 && body.boughtOnCredit) {
      try {
        const { recordDealerPurchase } = await import("@/lib/dealersDb");
        const totalPurchaseValue = (Number(body.purchasePrice) || 0) * qty;
        await recordDealerPurchase(body.dealerId, totalPurchaseValue, {
          description: `Stock on Credit: ${item.name} (${item.code}) x${qty}`,
          itemId: item.id,
          itemCode: item.code,
          referenceNumber: item.code,
        });
      } catch (dealerErr) {
        console.error("Failed to update dealer purchase balance:", dealerErr);
      }
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create item" }, { status: 500 });
  }
}

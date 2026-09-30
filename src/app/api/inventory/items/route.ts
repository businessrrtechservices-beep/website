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

    const item = await createInventoryItem({
      name: body.name.trim(),
      code: body.code?.trim(),
      category: body.category,
      subcategory: body.subcategory || "General",
      brand: body.brand?.trim() || "",
      model: body.model?.trim() || "",
      condition: body.condition || "Brand New",
      serialNumbers: Array.isArray(body.serialNumbers)
        ? body.serialNumbers.filter(Boolean)
        : typeof body.serialNumbers === "string"
        ? body.serialNumbers.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean)
        : [],
      specs: body.specs || {},
      purchasePrice: Number(body.purchasePrice) || 0,
      sellingPrice: Number(body.sellingPrice) || 0,
      stockQuantity: Number(body.stockQuantity) || 1,
      location: body.location || "",
      notes: body.notes || "",
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create item" }, { status: 500 });
  }
}

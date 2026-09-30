import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getCategories, addCategory, addSubcategory } from "@/lib/inventoryDb";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // If adding a subcategory to an existing category
    if (body.action === "add_subcategory" && body.categoryId && body.subcategoryName) {
      await addSubcategory(body.categoryId, body.subcategoryName);
      const categories = await getCategories();
      return NextResponse.json({ categories });
    }

    // Creating a whole new category
    if (!body.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const id = body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await addCategory({
      id,
      name: body.name.trim(),
      subcategories: Array.isArray(body.subcategories) ? body.subcategories : [],
    });

    const categories = await getCategories();
    return NextResponse.json({ category, categories }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to save category" }, { status: 500 });
  }
}

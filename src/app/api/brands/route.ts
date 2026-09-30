import { NextRequest, NextResponse } from "next/server";
import { getBrands, createBrand } from "@/lib/brandsDb";
import { verifyAdminRequest } from "@/lib/auth";

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json({ brands });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const brand = await createBrand({
      name: body.name.trim(),
      category: body.category,
      description: body.description,
    });

    const brands = await getBrands();
    return NextResponse.json({ brand, brands }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create brand" }, { status: 500 });
  }
}

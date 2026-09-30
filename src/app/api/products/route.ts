import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, createProduct } from "@/lib/productsDb";
import { verifyAdminRequest } from "@/lib/auth";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Product name and price are required" },
        { status: 400 }
      );
    }

    const newProduct = {
      id:
        body.id ||
        body.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
          "-" +
          Date.now().toString().slice(-4),
      name: body.name,
      brand: body.brand || "Dell",
      model: body.model || body.name,
      specs: {
        cpu: body.specs?.cpu || "Intel Core i5",
        ram: body.specs?.ram || "16 GB DDR4",
        storage: body.specs?.storage || "512 GB SSD",
        screen: body.specs?.screen || "14\" FHD IPS",
        gpu: body.specs?.gpu || "",
      },
      condition: body.condition || "Excellent",
      price: Number(body.price),
      mrp: Number(body.mrp || Number(body.price) * 1.2),
      discount:
        Number(body.discount) ||
        Math.round(
          (((Number(body.mrp || Number(body.price) * 1.2) - Number(body.price)) /
            Number(body.mrp || Number(body.price) * 1.2)) *
            100)
        ),
      image: body.image || "/images/laptop-xps.jpg",
      badge: body.badge || "Top Pick",
      rating: Number(body.rating || 4.8),
      reviewCount: Number(body.reviewCount || 35),
      warrantyMonths: Number(body.warrantyMonths || 6),
      features: Array.isArray(body.features)
        ? body.features
        : ["Tested Battery", "Original Charger", "Fast SSD", "Warranty Included"],
    };

    const saved = await createProduct(newProduct as any);
    return NextResponse.json({ success: true, product: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

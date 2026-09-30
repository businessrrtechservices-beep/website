import { NextRequest, NextResponse } from "next/server";
import { seedProductsFromCode } from "@/lib/productsDb";
import { verifyAdminRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { force } = await req.json().catch(() => ({ force: false }));
    const count = await seedProductsFromCode(Boolean(force));
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${count} products into database`,
      count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to seed products" },
      { status: 500 }
    );
  }
}

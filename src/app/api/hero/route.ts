import { NextRequest, NextResponse } from "next/server";
import { getHeroConfig, updateHeroConfig } from "@/lib/heroDb";
import { verifyAdminRequest } from "@/lib/auth";

export async function GET() {
  try {
    const config = await getHeroConfig();
    return NextResponse.json({ success: true, hero: config });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load hero configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await updateHeroConfig(body);
    return NextResponse.json({ success: true, hero: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update hero configuration" },
      { status: 500 }
    );
  }
}

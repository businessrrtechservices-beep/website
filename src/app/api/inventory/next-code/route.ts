import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { generateNextItemCode } from "@/lib/inventoryDb";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get("prefix") || "RRTS-ITM";
  const code = await generateNextItemCode(prefix);
  return NextResponse.json({ code });
}

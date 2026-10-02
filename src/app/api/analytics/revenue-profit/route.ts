import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getRevenueProfitAnalytics } from "@/lib/revenueProfitDb";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getRevenueProfitAnalytics();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to compute revenue profit analytics:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to compute revenue analytics" },
      { status: 500 }
    );
  }
}

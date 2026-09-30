import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/analyticsDb";
import { verifyAdminRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}

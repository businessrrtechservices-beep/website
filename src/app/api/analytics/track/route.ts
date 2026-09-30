import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analyticsDb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const { type = "visit", path = "/", sectionId, cardId, buttonId, buttonText, targetUrl, metadata } = body;

    await recordAnalyticsEvent({
      type,
      path,
      sectionId,
      cardId,
      buttonId,
      buttonText,
      targetUrl,
      metadata,
      ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to log event" },
      { status: 500 }
    );
  }
}

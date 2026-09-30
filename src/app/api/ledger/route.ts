import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getWalletSummary, getTransactions, createTransaction } from "@/lib/ledgerDb";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "all") as any;
  const search = searchParams.get("search") || undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 100;

  try {
    const [summary, transactions] = await Promise.all([
      getWalletSummary(),
      getTransactions({ type, search, limit }),
    ]);

    return NextResponse.json({ summary, transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch ledger" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.amount || !body.type || !body.paymentMode || !body.reason) {
      return NextResponse.json(
        { error: "Amount, type (credit/debit), payment mode, and reason are required" },
        { status: 400 }
      );
    }

    const tx = await createTransaction({
      type: body.type,
      amount: Number(body.amount),
      paymentMode: body.paymentMode,
      category: body.category || "General",
      reason: body.reason,
      referenceNumber: body.referenceNumber || "",
      date: body.date || new Date().toISOString(),
      invoiceId: body.invoiceId,
      invoiceNumber: body.invoiceNumber,
    });

    const summary = await getWalletSummary();
    return NextResponse.json({ transaction: tx, summary }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create transaction" }, { status: 500 });
  }
}

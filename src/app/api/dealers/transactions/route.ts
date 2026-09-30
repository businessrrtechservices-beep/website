import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getDealerTransactions, recordDealerPayment } from "@/lib/dealersDb";
import { createTransaction } from "@/lib/ledgerDb";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dealerId = searchParams.get("dealerId") || undefined;

  try {
    const transactions = await getDealerTransactions(dealerId);
    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.dealerId || !body.amount) {
      return NextResponse.json({ error: "Dealer ID and amount are required" }, { status: 400 });
    }

    const amount = Number(body.amount);
    const date = body.date || new Date().toISOString();

    // 1. Record dealer payment
    await recordDealerPayment(body.dealerId, amount, {
      paymentMode: body.paymentMode || "Cash",
      referenceNumber: body.referenceNumber,
      description: body.description || `Payment to dealer`,
      date,
    });

    // 2. Also log a debit in the main wallet ledger if requested (default true)
    if (body.syncMainLedger !== false) {
      await createTransaction({
        type: "debit",
        amount,
        paymentMode: body.paymentMode || "Cash",
        category: "Stock Purchase",
        reason: body.description || `Payment to dealer: ${body.dealerName || body.dealerId}`,
        referenceNumber: body.referenceNumber || "",
        dealerId: body.dealerId,
        dealerName: body.dealerName,
        date,
      });
    }

    const transactions = await getDealerTransactions(body.dealerId);
    return NextResponse.json({ success: true, transactions }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to process payment" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import {
  getPartnerWallets,
  getBorrowingTransactions,
  recordPartnerTransaction,
} from "@/lib/borrowingDb";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partnerId") || undefined;

  try {
    const [wallets, transactions] = await Promise.all([
      getPartnerWallets(),
      getBorrowingTransactions(partnerId),
    ]);

    const totalOutstanding = wallets.reduce(
      (acc, w) => acc + (w.currentBorrowedBalance || 0),
      0
    );
    const totalBorrowedAll = wallets.reduce((acc, w) => acc + (w.totalBorrowed || 0), 0);
    const totalRepaidAll = wallets.reduce((acc, w) => acc + (w.totalRepaid || 0), 0);

    return NextResponse.json({
      wallets,
      transactions,
      summary: {
        totalOutstanding,
        totalBorrowedAll,
        totalRepaidAll,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch partner wallets" },
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

    if (!body.partnerId || !body.type || !body.amount) {
      return NextResponse.json(
        { error: "Partner ID, type (borrow/repayment), and amount are required" },
        { status: 400 }
      );
    }

    const tx = await recordPartnerTransaction({
      partnerId: body.partnerId,
      type: body.type,
      amount: Number(body.amount),
      paymentMode: body.paymentMode || "Cash",
      date: body.date,
      reason: body.reason,
      referenceNumber: body.referenceNumber,
      syncMainLedger: body.syncMainLedger !== false,
    });

    const wallets = await getPartnerWallets();
    return NextResponse.json({ transaction: tx, wallets }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to record borrowing transaction" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getExpenses, getExpenseSummary, createExpense } from "@/lib/expenseDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const [expenses, summary] = await Promise.all([
      getExpenses({ category, search, startDate, endDate, limit }),
      getExpenseSummary(),
    ]);

    return NextResponse.json({ expenses, summary });
  } catch (error: any) {
    console.error("Error in GET /api/expenses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch company expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Expense title is required" }, { status: 400 });
    }

    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valid expense amount is required" }, { status: 400 });
    }

    if (!body.category) {
      return NextResponse.json({ error: "Expense category is required" }, { status: 400 });
    }

    const newExpense = await createExpense({
      title: body.title.trim(),
      category: body.category,
      amount,
      date: body.date,
      vendor: body.vendor?.trim(),
      paymentMode: body.paymentMode || "UPI",
      referenceNumber: body.referenceNumber?.trim(),
      proofUrl: body.proofUrl?.trim(),
      proofPublicId: body.proofPublicId?.trim(),
      fundedBy: body.fundedBy || "shop_wallet",
      partnerId: body.partnerId,
      partnerName: body.partnerName,
      notes: body.notes?.trim(),
    });

    return NextResponse.json({ expense: newExpense }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/expenses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record company expense" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { deleteExpense } from "@/lib/expenseDb";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }

    const success = await deleteExpense(id);
    if (!success) {
      return NextResponse.json({ error: "Expense not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Expense deleted and linked ledger balance updated" });
  } catch (error: any) {
    console.error("Error in DELETE /api/expenses/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete expense" },
      { status: 500 }
    );
  }
}

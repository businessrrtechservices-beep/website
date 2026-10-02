import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getInvoiceById, deleteInvoice } from "@/lib/salesDb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json({ invoice });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === "record_payment" || body.amount) {
      const { recordInvoicePayment } = await import("@/lib/salesDb");
      const updated = await recordInvoicePayment(id, {
        amount: Number(body.amount),
        paymentMode: body.paymentMode || "Cash",
        referenceNumber: body.referenceNumber,
        proofUrl: body.proofUrl,
        proofPublicId: body.proofPublicId,
        date: body.date,
        notes: body.notes,
      });

      if (!updated) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, invoice: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update invoice payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const success = await deleteInvoice(id);
    if (!success) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete invoice" }, { status: 500 });
  }
}

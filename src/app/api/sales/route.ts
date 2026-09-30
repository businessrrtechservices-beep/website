import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getInvoices, createInvoice, generateNextInvoiceNumber } from "@/lib/salesDb";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const paymentStatus = searchParams.get("paymentStatus") || undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 100;

  try {
    const invoices = await getInvoices({ search, paymentStatus, limit });
    
    // Calculate summary statistics
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const totalBilled = invoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const totalPending = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
    const totalUnitsSold = invoices.reduce(
      (acc, inv) => acc + inv.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      0
    );

    const nextInvoiceNumber = await generateNextInvoiceNumber();

    return NextResponse.json({
      invoices,
      stats: {
        totalRevenue,
        totalBilled,
        totalPending,
        totalInvoices: invoices.length,
        totalUnitsSold,
      },
      nextInvoiceNumber,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.customer?.name || !body.customer?.phone) {
      return NextResponse.json({ error: "Customer name and phone number are required" }, { status: 400 });
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "At least one sale item is required" }, { status: 400 });
    }

    const invoice = await createInvoice({
      invoiceNumber: body.invoiceNumber,
      date: body.date || new Date().toISOString().substring(0, 10),
      dueDate: body.dueDate,
      customer: body.customer,
      items: body.items,
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      taxRate: Number(body.taxRate) || 0,
      taxAmount: Number(body.taxAmount) || 0,
      grandTotal: Number(body.grandTotal) || 0,
      paymentStatus: body.paymentStatus || "Paid",
      paymentMode: body.paymentMode || "Cash",
      amountPaid: Number(body.amountPaid) || 0,
      balanceDue: Number(body.balanceDue) || 0,
      notes: body.notes || "",
      termsAndConditions: body.termsAndConditions || "Warranty valid as per brand policy. Goods once sold are not returnable without inspection.",
      recordedInLedger: body.recordedInLedger !== false,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create invoice" }, { status: 500 });
  }
}

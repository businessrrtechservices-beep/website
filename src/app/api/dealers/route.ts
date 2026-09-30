import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getDealers, createDealer } from "@/lib/dealersDb";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dealers = await getDealers();

    const totalPurchased = dealers.reduce((acc, d) => acc + (d.totalPurchased || 0), 0);
    const totalPaid = dealers.reduce((acc, d) => acc + (d.totalPaid || 0), 0);
    const totalOutstanding = dealers.reduce((acc, d) => acc + (d.outstandingBalance || 0), 0);

    return NextResponse.json({
      dealers,
      summary: {
        totalDealers: dealers.length,
        totalPurchased,
        totalPaid,
        totalOutstanding,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch dealers" },
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

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { error: "Dealer name and phone number are required" },
        { status: 400 }
      );
    }

    const dealer = await createDealer({
      name: body.name.trim(),
      contactPerson: body.contactPerson?.trim() || "",
      phone: body.phone.trim(),
      email: body.email?.trim() || "",
      address: body.address?.trim() || "",
      gstin: body.gstin?.trim() || "",
      categories: Array.isArray(body.categories) ? body.categories : [],
      notes: body.notes?.trim() || "",
    });

    return NextResponse.json({ dealer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create dealer" },
      { status: 500 }
    );
  }
}

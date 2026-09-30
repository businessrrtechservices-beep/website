import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { getDealerById, updateDealer, deleteDealer } from "@/lib/dealersDb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dealer = await getDealerById(id);
  if (!dealer) {
    return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
  }

  return NextResponse.json({ dealer });
}

export async function PUT(
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

    const success = await updateDealer(id, body);
    if (!success) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }

    const updated = await getDealerById(id);
    return NextResponse.json({ dealer: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update dealer" },
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
    const success = await deleteDealer(id);
    if (!success) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete dealer" },
      { status: 500 }
    );
  }
}

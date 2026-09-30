import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { isMongoConfigured, getMongoDb } from "@/lib/mongodb";
import { isCloudinaryConfigured } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let mongoConnected = false;
  try {
    const db = await getMongoDb();
    mongoConnected = Boolean(db);
  } catch {
    mongoConnected = false;
  }

  return NextResponse.json({
    authenticated: true,
    system: {
      mongoConfigured: isMongoConfigured(),
      mongoConnected,
      cloudinaryConfigured: isCloudinaryConfigured(),
    },
  });
}

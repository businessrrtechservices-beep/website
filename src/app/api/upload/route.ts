import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { verifyAdminRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminRequest(req);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            "Cloudinary credentials missing in .env.local. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
          configured: false,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImageToCloudinary(buffer, "rrtechservices/products");

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

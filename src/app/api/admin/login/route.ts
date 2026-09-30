import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, COOKIE_NAME } from "@/lib/auth";
import { verifyUserCredentials } from "@/lib/userDb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const authResult = await verifyUserCredentials(username, password);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Invalid username/email or password" },
        { status: 401 }
      );
    }

    const token = await createAdminToken(authResult.user.username);

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: authResult.user,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

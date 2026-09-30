import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const COOKIE_NAME = "admin_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "rrtechservices_default_secret_key_2026_super_safe";
  return new TextEncoder().encode(secret);
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME?.trim() || "admin",
    password: process.env.ADMIN_PASSWORD?.trim() || "admin123",
  };
}

export async function createAdminToken(username: string): Promise<string> {
  const secret = getJwtSecret();
  return await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as { username: string; role: string };
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const session = await verifyAdminToken(token);
    return Boolean(session && session.role === "admin");
  } catch {
    return false;
  }
}

export async function verifyAdminRequest(req: NextRequest): Promise<boolean> {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const session = await verifyAdminToken(token);
    return Boolean(session && session.role === "admin");
  } catch {
    return false;
  }
}

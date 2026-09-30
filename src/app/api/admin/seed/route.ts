import { NextResponse } from "next/server";
import { ensureAdminUser } from "@/lib/userDb";
import { getHeroConfig } from "@/lib/heroDb";

export async function POST() {
  try {
    // Ensure Admin User exists using credentials configured in .env.local
    await ensureAdminUser();

    // Ensure default hero layout exists if needed
    const hero = await getHeroConfig();

    return NextResponse.json({
      success: true,
      message: "Admin and Hero configuration initialized. Catalog, categories, dealers and borrowers are managed manually.",
      initialized: {
        hero: Boolean(hero),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to initialize admin system" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

import { NextResponse } from "next/server";
import { ensureAdminUser } from "@/lib/userDb";
import { seedProductsFromCode } from "@/lib/productsDb";
import { getHeroConfig } from "@/lib/heroDb";
import { getCategories } from "@/lib/inventoryDb";
import { getPartnerWallets } from "@/lib/borrowingDb";

export async function POST() {
  try {
    // 1. Ensure Admin User is created
    await ensureAdminUser();

    // 2. Feed Products
    const productCount = await seedProductsFromCode(false);

    // 3. Feed Hero Config
    const hero = await getHeroConfig();

    // 4. Feed Categories
    const categories = await getCategories();

    // 5. Feed Partner Wallets (Nauman, Dinesh, Subhan)
    const wallets = await getPartnerWallets();

    return NextResponse.json({
      success: true,
      message: "Database tables seeded successfully!",
      seeded: {
        adminUser: "business.rrtechservices@gmail.com / business.rrtrchservices@gmail.com",
        productCount,
        heroInitialized: Boolean(hero),
        categoriesCount: categories.length,
        partnerWallets: wallets.map((w) => w.name),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

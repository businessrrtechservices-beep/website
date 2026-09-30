import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RefurbishedListing from "@/components/RefurbishedListing";
import { getAllProducts } from "@/lib/productsDb";

export const metadata = {
  title: "Refurbished Laptops & MacBooks | Certified Pre-Owned with Warranty",
  description:
    "Buy quality-tested refurbished laptops from Dell, HP, Lenovo & Apple. 100% functional, verified specs, 6-month warranty and free PAN India delivery.",
};

export default async function RefurbishedLaptopsPage() {
  const products = await getAllProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <RefurbishedListing initialProducts={products} />
      </main>
      <Footer />
    </>
  );
}

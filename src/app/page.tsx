import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryStrip from "@/components/CategoryStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustStrip from "@/components/TrustStrip";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import { getHeroConfig } from "@/lib/heroDb";
import { getAllProducts } from "@/lib/productsDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [heroConfig, products] = await Promise.all([
    getHeroConfig(),
    getAllProducts(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero initialConfig={heroConfig} />
        <CategoryStrip />
        <FeaturedProducts initialProducts={products} />
        <TrustStrip />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
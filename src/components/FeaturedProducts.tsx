import { getAllProducts } from "@/lib/productsDb";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react";

const PHONE = "9209095278";
const WA_HREF = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
  "Hi RR Tech Services, I'd like to enquire about refurbished laptops. Please share available models and pricing."
)}`;

export default async function FeaturedProducts() {
  const allProducts = await getAllProducts();
  const featured = allProducts.slice(0, 4);

  return (
    <section
      id="featured"
      className="relative w-full bg-white py-6 sm:py-8 lg:py-8
                 lg:min-h-[calc(100dvh-96px)] flex flex-col justify-center"
    >
      <div className="mx-auto w-full max-w-7xl px-3.5 xs:px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-5 lg:mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-500 uppercase border-b-2 border-blue-600 pb-0.5 inline-block">
              Featured Collection
            </span>
            <h2 className="mt-2 sm:mt-2.5 text-lg xs:text-xl sm:text-2xl lg:text-[1.6rem] font-black text-slate-900 tracking-tight leading-tight">
              Top Picks <span className="text-blue-600">This Week</span>
            </h2>
            <p className="mt-1 hidden sm:block text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Hand-picked for value, performance &amp; condition.
            </p>
          </div>

          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Enquire on WhatsApp about refurbished laptops"
            className="group hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-800 outline-none transition-all duration-200 hover:-translate-y-px hover:border-emerald-600 hover:text-emerald-700 hover:shadow-sm active:translate-y-0 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <span>Enquire Now</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="grid gap-3 sm:gap-3.5 lg:gap-4 grid-cols-2 lg:grid-cols-4">
          {featured.map((product, idx) => (
            <div
              key={product.id}
              className="transition-transform duration-300 hover:-translate-y-1"
            >
              <ProductCard product={product} priority={idx < 2} />
            </div>
          ))}
        </div>

        <div className="mt-5 sm:hidden text-center">
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Enquire on WhatsApp about refurbished laptops"
            className="group inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-800 outline-none transition-all duration-200 hover:border-emerald-600 hover:text-emerald-700 active:scale-[.98] focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <span>Enquire Now</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
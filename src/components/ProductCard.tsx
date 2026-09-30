"use client";

import Image from "next/image";
import { Star, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Product, formatPrice } from "@/lib/productTypes";
import { trackInterest, trackSectionView } from "@/lib/analyticsClient";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  useEffect(() => {
    trackSectionView("featured_products", product.id);
  }, [product.id]);

  const whatsappMsg = encodeURIComponent(
    `Hi RR Tech Services,\n\nI'm interested in:\n${product.name} (${product.model})\nPrice: ${formatPrice(product.price)}\n\nPlease share more details.`
  );
  const whatsappUrl = `https://wa.me/919209095278?text=${whatsappMsg}`;

  const handleEnquireClick = () => {
    trackInterest(`Enquire: ${product.name}`, {
      buttonId: `enquire_${product.id}`,
      section: "featured_products",
      targetUrl: whatsappUrl,
      metadata: { productId: product.id, price: product.price, brand: product.brand },
    });
  };

  return (
    <article className="group relative flex flex-col h-full overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/10">
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-2 left-2 z-10 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm shadow-blue-900/20">
          {product.badge}
        </span>
      )}

      {/* Discount tag */}
      <span className="absolute top-2 right-2 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm shadow-emerald-900/20">
        {product.discount}% OFF
      </span>

      {/* Image */}
      <div className="relative h-36 xs:h-40 sm:h-40 lg:h-44 w-full shrink-0 overflow-hidden bg-slate-50/80 flex items-center justify-center">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-2.5 transition-transform duration-500 ease-out group-hover:scale-105"
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />

        {/* WhatsApp floating button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleEnquireClick}
          aria-label={`Enquire about ${product.name} on WhatsApp`}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-emerald-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-emerald-600 hover:text-white"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        {/* Meta row — brand · rating */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {product.brand}
          </span>
          <span className="h-2.5 w-px bg-slate-200" aria-hidden="true" />
          <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-700">{product.rating}</span>
            <span className="text-slate-400">({product.reviewCount})</span>
          </span>
        </div>

        {/* Title + model */}
        <h3 className="mt-1 text-[13px] xs:text-sm font-extrabold text-slate-900 leading-snug line-clamp-1 transition-colors duration-200 group-hover:text-blue-600">
          {product.name}
        </h3>
        <p className="mt-0.5 text-[10.5px] xs:text-[11px] text-slate-500 leading-snug line-clamp-1">
          {product.model}
        </p>

        {/* Spec chips */}
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] xs:text-[10px] font-semibold text-slate-600 leading-tight">
            {product.specs.ram}
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] xs:text-[10px] font-semibold text-slate-600 leading-tight">
            {product.specs.storage}
          </span>
          <span className="hidden sm:inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] xs:text-[10px] font-semibold text-slate-600 leading-tight">
            {product.specs.cpu.replace(/\s*\(.*?\)/g, "")}
          </span>
        </div>

        {/* Warranty row */}
        <div className="mt-2 flex items-center gap-1 text-[10.5px] xs:text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-700">
            {product.warrantyMonths}M Warranty
          </span>
        </div>

        {/* Price + CTA pinned to bottom */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base xs:text-lg font-black text-slate-900 tabular-nums leading-none">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10.5px] xs:text-[11px] text-slate-400 line-through leading-none">
              {formatPrice(product.mrp)}
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleEnquireClick}
            aria-label={`Enquire on WhatsApp about ${product.name}`}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs transition-all duration-200 hover:bg-blue-700 active:scale-[.98]"
          >
            <span>Enquire Now</span>
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
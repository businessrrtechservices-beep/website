"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  Wrench,
  MessageCircle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { trackInterest, trackSectionView } from "@/lib/analyticsClient";

const PHONE = "9209095278";
const WA_REPAIR = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
  "Hi RR Tech Services, I'd like to book a laptop repair."
)}`;

const benefits = [
  { icon: ShieldCheck, text: "Genuine Parts Guaranteed" },
  { icon: Wrench, text: "6-Month Warranty" },
  { icon: MessageCircle, text: "Free Diagnosis Included" },
];

const stats = [
  { label: "Laptops Repaired", value: "1000+" },
  { label: "Refurbished Units Sold", value: "300+" },
  { label: "Happy Customers", value: "500+" },
  { label: "Warranty Claims Resolved", value: "99%" },
];

export default function CtaBanner() {
  useEffect(() => {
    trackSectionView("cta_banner");
  }, []);

  return (
    <section className="relative w-full bg-blue-600 py-10 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-7xl px-3.5 xs:px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 lg:items-center">
          {/* ---------- Left: headline + benefits + CTAs ---------- */}
          <div className="lg:col-span-7">
            <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-blue-100 uppercase border-b-2 border-white/60 pb-0.5 inline-block">
              Ready When You Are
            </span>

            <h2 className="mt-3 sm:mt-4 text-2xl xs:text-3xl sm:text-4xl lg:text-[2.1rem] font-black text-white tracking-tight leading-[1.15]">
              Give Your Laptop a Second Life
            </h2>

            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-blue-100 max-w-lg leading-relaxed">
              Repair it, upgrade it, or trade it in for a certified refurbished unit —
              simple, transparent, and affordable.
            </p>

            {/* Benefits */}
            <div className="mt-5 sm:mt-6 grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.text}
                    className="flex items-center gap-2.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-2"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11px] xs:text-xs sm:text-[13px] font-semibold text-white leading-snug">
                      {b.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="mt-5 sm:mt-6 flex flex-col xs:flex-row gap-2.5 sm:gap-3">
              <Link
                href="/refurbished-laptops"
                onClick={() =>
                  trackInterest("CTA Banner Shop Laptops", {
                    buttonId: "cta_shop_laptops",
                    section: "cta_banner",
                    targetUrl: "/refurbished-laptops",
                  })
                }
                className="group inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-700 outline-none transition-all duration-200 hover:-translate-y-px hover:bg-blue-50 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Shop Laptops</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <a
                href={WA_REPAIR}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackInterest("CTA Banner Book Repair", {
                    buttonId: "cta_book_repair",
                    section: "cta_banner",
                    targetUrl: WA_REPAIR,
                  })
                }
                className="group inline-flex items-center justify-center gap-1.5 rounded-md border border-white/40 bg-transparent px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white outline-none transition-all duration-200 hover:-translate-y-px hover:border-white hover:bg-white/10 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Book a Repair</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* ---------- Right: stats ---------- */}
          <div className="lg:col-span-5">
            <div className="rounded-lg border border-white/15 bg-white/5 p-4 sm:p-5">
              <p className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-blue-100 uppercase leading-none">
                By The Numbers
              </p>

              <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2.5 sm:py-3"
                  >
                    <p className="text-xl xs:text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] xs:text-[10.5px] sm:text-[11px] font-medium text-blue-100 leading-snug">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-3 sm:mt-4 text-center text-[10.5px] xs:text-[11px] text-blue-100/80 leading-snug">
                Backed by 6-month warranty on every refurbished unit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
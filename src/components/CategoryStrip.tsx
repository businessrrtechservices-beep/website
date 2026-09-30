"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { trackInterest, trackSectionView } from "@/lib/analyticsClient";

const PHONE = "9209095278";

const waLink = (text: string) =>
  `https://wa.me/91${PHONE}?text=${encodeURIComponent(text)}`;

const categories = [
  {
    label: "Laptop & PC Repair",
    image: "/images/repair.png",
    desc: "Screen, battery, keyboard, motherboard",
    tag: "Popular",
    waText:
      "Hi RR Tech Services, I'd like to enquire about Laptop & PC Repair. Please share details.",
  },
  {
    label: "Chip-Level Repair",
    image: "/images/chip.png",
    desc: "Motherboard component-level fixes",
    waText:
      "Hi RR Tech Services, I'd like to enquire about Chip-Level Repair. Please share details.",
  },
  {
    label: "Upgrades",
    image: "/images/upgrade.png",
    desc: "RAM, SSD, performance boost",
    waText:
      "Hi RR Tech Services, I'd like to enquire about Laptop Upgrades (RAM / SSD). Please share details.",
  },
  {
    label: "Refurbished Laptops",
    image: "/images/laptops.png",
    desc: "Certified, warrantied, tested",
    tag: "Sale",
    waText:
      "Hi RR Tech Services, I'd like to enquire about Refurbished Laptops. Please share available models and pricing.",
  },
  {
    label: "Accessories",
    image: "/images/accesories.png",
    desc: "Chargers, batteries, bags & more",
    waText:
      "Hi RR Tech Services, I'd like to enquire about Laptop Accessories. Please share details.",
  },
  {
    label: "Doorstep Service",
    image: "/images/doorstep.png",
    desc: "We come to you across Pune",
    tag: "Pune",
    waText:
      "Hi RR Tech Services, I'd like to book a Doorstep Service in Pune. Please confirm availability.",
  },
];

export default function CategoryStrip() {
  useEffect(() => {
    trackSectionView("explore_our_services");
  }, []);

  return (
    <section className="relative w-full bg-slate-50/60 border-y border-slate-200 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-7xl px-3.5 xs:px-4 sm:px-6 lg:px-8">
        {/* ---------- Section header ---------- */}
        <div className="mb-5 sm:mb-6 lg:mb-8">
          <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-500 uppercase border-b-2 border-blue-600 pb-0.5 inline-block">
            What We Do
          </span>
          <h2 className="mt-2.5 text-xl xs:text-2xl sm:text-3xl lg:text-[2rem] font-black text-slate-900 tracking-tight leading-tight">
            Explore Our <span className="text-blue-600">Services</span>
          </h2>
          <p className="mt-1 hidden sm:block text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Repairs, upgrades, refurbished laptops &amp; doorstep service — all under one roof.
          </p>
        </div>

        {/* ---------- Horizontal scroll strip ---------- */}
        <div className="-mx-3.5 xs:-mx-4 sm:-mx-6 lg:mx-0">
          <div
            className="no-scrollbar flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-3.5 xs:px-4 sm:px-6 lg:px-0
                       snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <a
                key={cat.label}
                href={waLink(cat.waText)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackInterest(`Service: ${cat.label}`, {
                    buttonId: `service_${cat.label
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "_")}`,
                    section: "explore_our_services",
                    targetUrl: waLink(cat.waText),
                  })
                }
                aria-label={`Enquire on WhatsApp about ${cat.label}`}
                className="group relative flex w-[190px] xs:w-[210px] sm:w-[230px] lg:w-auto lg:flex-1 lg:min-w-[190px]
                           shrink-0 snap-start flex-col overflow-hidden rounded-xl
                           border border-slate-200 bg-white
                           outline-none transition-all duration-300
                           hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/10
                           focus-visible:ring-2 focus-visible:ring-blue-600/40 focus-visible:ring-offset-2"
              >
                {/* Image area — contain (fit), not cover */}
                <div className="relative h-32 xs:h-36 sm:h-40 w-full shrink-0 overflow-hidden bg-slate-50 p-3 sm:p-4">
                  <div className="relative h-full w-full">
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      width={400}
                      height={300}
                      sizes="(max-width: 640px) 210px, (max-width: 1024px) 230px, 220px"
                      className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                  </div>

                  {cat.tag && (
                    <span className="absolute top-2 right-2 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm shadow-blue-900/20">
                      {cat.tag}
                    </span>
                  )}
                </div>

                {/* Text area */}
                <div className="flex flex-1 flex-col p-3 sm:p-3.5">
                  <p className="text-[13px] xs:text-sm font-extrabold text-slate-900 leading-snug">
                    {cat.label}
                  </p>

                  {/* Description — fixed 2-line height + guaranteed gap below */}
                  <p className="mt-1 mb-3 min-h-[2.75em] text-[10.5px] xs:text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {cat.desc}
                  </p>

                  {/* Enquire button pinned to bottom */}
                  <div className="mt-auto pt-3">
                    <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-800 transition-all duration-200 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-sm group-hover:shadow-blue-600/20">
                      <span>Enquire Now</span>
                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>

                {/* Bottom accent bar on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-blue-600 transition-transform duration-300 ease-out group-hover:scale-x-100"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { ShieldCheck, Award, Star, Search } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Parts",
    desc: "Original components only — verified & sealed",
  },
  {
    icon: Award,
    title: "6-Month Warranty",
    desc: "Every laptop covered, no fine print",
  },
  {
    icon: Star,
    title: "happy customers",
    desc: "500+ happy customers trust us",
  },
  {
    icon: Search,
    title: "Transparent Pricing",
    desc: "Free diagnosis, upfront quote, no hidden fees",
  },
];

export default function TrustStrip() {
  return (
    <section className="relative w-full bg-slate-50/60 border-y border-slate-200 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-7xl px-3.5 xs:px-4 sm:px-6 lg:px-8">
        {/* ---------- Section header ---------- */}
        <div className="mb-5 sm:mb-6 lg:mb-8">
          <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-500 uppercase border-b-2 border-blue-600 pb-0.5 inline-block">
            Why Choose Us
          </span>
          <h2 className="mt-2.5 text-xl xs:text-2xl sm:text-3xl lg:text-[2rem] font-black text-slate-900 tracking-tight leading-tight">
            Built On <span className="text-blue-600">Trust</span>
          </h2>
          <p className="mt-1 hidden sm:block text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Every purchase &amp; repair backed by our promise — no fine print, no surprises.
          </p>
        </div>

        {/* ---------- Grid ---------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative flex flex-col items-start gap-2.5 sm:gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 sm:p-4
                           transition-all duration-300
                           hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/10"
              >
                {/* Icon badge */}
                <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                </span>

                {/* Text */}
                <div className="min-w-0">
                  <p className="text-[12.5px] xs:text-[13px] sm:text-sm font-extrabold text-slate-900 leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[10.5px] xs:text-[11px] sm:text-xs text-slate-500 leading-snug">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom accent bar on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-blue-600 transition-transform duration-300 ease-out group-hover:scale-x-100"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
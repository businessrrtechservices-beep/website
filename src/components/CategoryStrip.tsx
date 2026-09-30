"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    trackSectionView("explore_our_services");
  }, []);

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 12);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 12);

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("a[data-service-card]")
    );
    if (cards.length === 0) return;

    let closestIdx = 0;
    let minDiff = Infinity;
    const scrollTarget = scrollLeft + 30;

    cards.forEach((card, idx) => {
      const cardLeft = card.offsetLeft - container.offsetLeft;
      const diff = Math.abs(cardLeft - scrollTarget);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setActiveIndex(closestIdx);
  }, []);

  const pauseAutoPlay = useCallback(() => {
    isInteractingRef.current = true;
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
  }, []);

  const resumeAutoPlay = useCallback(() => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 4500);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("a[data-service-card]")
    );
    if (cards[index]) {
      const card = cards[index];
      const targetLeft = card.offsetLeft - container.offsetLeft - 16;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  }, []);

  const scrollNext = () => {
    pauseAutoPlay();
    const nextIdx = (activeIndex + 1) % categories.length;
    scrollToIndex(nextIdx);
    resumeAutoPlay();
  };

  const scrollPrev = () => {
    pauseAutoPlay();
    const prevIdx = (activeIndex - 1 + categories.length) % categories.length;
    scrollToIndex(prevIdx);
    resumeAutoPlay();
  };

  // Auto-scroll loop on mobile/scrollable view
  useEffect(() => {
    updateScrollState();

    const interval = setInterval(() => {
      if (isInteractingRef.current) return;
      const container = scrollContainerRef.current;
      if (!container) return;

      // Don't auto-scroll if desktop is already showing all cards without scrollbar
      if (container.scrollWidth <= container.clientWidth + 15) return;

      setActiveIndex((prev) => {
        const next = (prev + 1) % categories.length;
        const cards = Array.from(
          container.querySelectorAll<HTMLElement>("a[data-service-card]")
        );
        if (cards[next]) {
          const targetLeft = cards[next].offsetLeft - container.offsetLeft - 16;
          container.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: "smooth",
          });
        }
        return next;
      });
    }, 3800);

    return () => {
      clearInterval(interval);
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [updateScrollState]);

  useEffect(() => {
    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState]);

  return (
    <section className="relative w-full bg-slate-50/60 border-y border-slate-200 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-7xl px-3.5 xs:px-4 sm:px-6 lg:px-8">
        {/* ---------- Section header with Controls ---------- */}
        <div className="mb-5 sm:mb-6 lg:mb-8 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-500 uppercase border-b-2 border-blue-600 pb-0.5 inline-block">
                What We Do
              </span>
            </div>
            <h2 className="mt-2 text-xl xs:text-2xl sm:text-3xl lg:text-[2rem] font-black text-slate-900 tracking-tight leading-tight">
              Explore Our <span className="text-blue-600">Services</span>
            </h2>
            <p className="mt-1 hidden sm:block text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Repairs, upgrades, refurbished laptops &amp; doorstep service — all under one roof.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              aria-label="Previous service"
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition-all duration-200 hover:border-blue-300 hover:text-blue-600 active:scale-95 ${!canScrollLeft
                ? "opacity-40 cursor-not-allowed"
                : "hover:shadow-sm"
                }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollRight}
              aria-label="Next service"
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition-all duration-200 hover:border-blue-300 hover:text-blue-600 active:scale-95 ${!canScrollRight
                ? "opacity-40 cursor-not-allowed"
                : "hover:shadow-sm"
                }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ---------- Horizontal scroll strip wrapper with edge hints ---------- */}
        <div className="relative -mx-3.5 xs:-mx-4 sm:-mx-6 lg:mx-0">
          {/* Left subtle gradient fade when scrolled */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-0 bottom-4 w-8 sm:w-14 bg-gradient-to-r from-slate-50 via-slate-50/70 to-transparent z-10 transition-opacity duration-300 ${canScrollLeft ? "opacity-100" : "opacity-0"
              }`}
          />

          {/* Right subtle gradient fade indicating more cards */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute right-0 top-0 bottom-4 w-8 sm:w-14 bg-gradient-to-l from-slate-50 via-slate-50/70 to-transparent z-10 transition-opacity duration-300 ${canScrollRight ? "opacity-100" : "opacity-0"
              }`}
          />

          <div
            ref={scrollContainerRef}
            onScroll={updateScrollState}
            onTouchStart={pauseAutoPlay}
            onTouchEnd={resumeAutoPlay}
            onMouseEnter={pauseAutoPlay}
            onMouseLeave={resumeAutoPlay}
            className="no-scrollbar flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 px-3.5 xs:px-4 sm:px-6 lg:px-0
                       snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat, idx) => (
              <a
                key={cat.label}
                data-service-card="true"
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
                className="group relative flex w-[76vw] xs:w-[225px] sm:w-[240px] lg:w-auto lg:max-w-none lg:flex-1 lg:min-w-[185px] max-w-[270px]
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
                      sizes="(max-width: 640px) 240px, (max-width: 1024px) 250px, 220px"
                      className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                  </div>

                  {cat.tag && (
                    <span className="absolute top-2 right-2 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs shadow-blue-900/20">
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
                    <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-800 transition-all duration-200 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xs group-hover:shadow-blue-600/20">
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

        {/* ---------- Mobile Pagination Indicator Dots ---------- */}
        <div className="flex sm:hidden items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-1.5">
            {categories.map((cat, idx) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => {
                  pauseAutoPlay();
                  scrollToIndex(idx);
                  resumeAutoPlay();
                }}
                aria-label={`Go to ${cat.label}`}
                className={`h-1.5 transition-all duration-300 rounded-full ${activeIndex === idx
                  ? "w-6 bg-blue-600"
                  : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
              />
            ))}
          </div>

          <span className="text-[11px] font-semibold text-slate-500">
            {activeIndex + 1} of {categories.length}
          </span>
        </div>
      </div>
    </section>
  );
}
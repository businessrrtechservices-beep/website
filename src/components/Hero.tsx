"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Phone, ArrowRight, Check } from "lucide-react";
import { defaultHeroConfig, HeroConfig } from "@/lib/heroTypes";
import { trackInterest, trackSectionView } from "@/lib/analyticsClient";

const PHONE = "9209095278";
const PHONE_HREF = `tel:+91${PHONE}`;
const WHATSAPP_HREF = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
  "Hi RR Tech Services, I'd like to book a doorstep appointment."
)}`;
const WHATSAPP_DEALS_HREF = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
  "Hi RR Tech Services, I'd like to enquire about refurbished laptops."
)}`;
const WHATSAPP_REPAIR_HREF = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
  "Hi RR Tech Services, I'd like to book a laptop repair."
)}`;

export default function Hero({ initialConfig }: { initialConfig?: HeroConfig } = {}) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [hero, setHero] = useState<HeroConfig>(initialConfig || defaultHeroConfig);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSlides = 3;
  const slideDuration = 6000;

  useEffect(() => {
    trackSectionView("hero");
    fetch("/api/hero")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.hero) setHero(data.hero);
      })
      .catch(() => { });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => setCurrent(index);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, slideDuration);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused, current]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsPaused(false);
      return;
    }
    const distance = touchStart - touchEnd;
    if (distance > 45) nextSlide();
    else if (distance < -45) prevSlide();
    setTouchStart(null);
    setTouchEnd(null);
    setIsPaused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  };

  const logCta = (buttonText: string, section: string, targetUrl: string) => {
    trackInterest(buttonText, {
      section,
      targetUrl,
    });
  };

  return (
    <section
      className="relative w-full select-none overflow-hidden bg-white
                 flex flex-col justify-center
                 lg:min-h-[calc(100dvh-96px)] max-h-[1100px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="RR Tech Services Highlights"
    >
      {/* Slides Track */}
      <div
        className="flex w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {/* ============================================================ */}
        {/* SLIDE 1                                                     */}
        {/* ============================================================ */}
        <div
          className="w-full flex-shrink-0 min-w-full flex items-center
                     px-3.5 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
                     py-6 sm:py-7 lg:py-8"
          role="group"
          aria-roledescription="slide"
          aria-label="1 of 3: Doorstep Laptop & Desktop Service"
        >
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center">
              <div className="w-full lg:col-span-7 flex flex-col">
                <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-500 uppercase border-b-2 border-blue-600 pb-0.5 inline-block self-start">
                  {hero.slide1.topBadge}
                </span>

                <h1 className="mt-2.5 sm:mt-3 text-[1.55rem] xs:text-3xl sm:text-4xl md:text-[2.4rem] lg:text-4xl xl:text-[2.9rem] 2xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  {hero.slide1.headingPrefix} <span className="text-blue-600">{hero.slide1.headingHighlight}</span> {hero.slide1.headingSuffix}
                </h1>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base font-semibold text-slate-500">
                  {hero.slide1.subtitle}
                </p>

                <p className="hidden sm:block mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  {hero.slide1.description}
                </p>

                <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-3.5 md:gap-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5 xs:p-3 sm:p-4 shadow-2xs hover:border-blue-400 transition-colors">
                    <p className="font-extrabold text-slate-900 text-xs xs:text-[13px] sm:text-base">
                      Basic Servicing
                    </p>
                    <p className="mt-1 text-[10px] xs:text-[11px] sm:text-xs text-slate-500 leading-snug">
                      Dust &amp; Port Cleaning • Speed Check
                      <br className="hidden sm:inline" />
                      Software &amp; OS Tuning
                    </p>
                    <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-100 flex items-baseline gap-1">
                      <span className="text-lg xs:text-xl sm:text-3xl font-black text-blue-600">
                        ₹{hero.slide1.basicServicePrice}
                      </span>
                      <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-slate-500">
                        only
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-2.5 xs:p-3 sm:p-4 shadow-2xs hover:border-blue-400 transition-colors">
                    <p className="font-extrabold text-slate-900 text-xs xs:text-[13px] sm:text-base">
                      Deep Servicing
                    </p>
                    <p className="mt-1 text-[10px] xs:text-[11px] sm:text-xs text-slate-500 leading-snug">
                      Complete Disassembly • Thermal Paste
                      <br className="hidden sm:inline" />
                      Fan Cleaning • Full Diagnostics
                    </p>
                    <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-100 flex items-baseline gap-1">
                      <span className="text-lg xs:text-xl sm:text-3xl font-black text-blue-600">
                        ₹{hero.slide1.deepServicePrice}
                      </span>
                      <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-slate-500">
                        only
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price-badge callout */}
                <div className="mt-3 sm:mt-4 flex items-center gap-2.5 sm:gap-3 rounded-lg border border-slate-200 bg-white p-2 sm:p-2.5 shadow-2xs">
                  <div className="flex shrink-0 flex-col items-center rounded-md border border-blue-100 bg-blue-50/70 px-2.5 sm:px-3 py-1.5 sm:py-2">
                    <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700/80 leading-none">
                      Visit Fee
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5 whitespace-nowrap">
                      {hero.slide1.visitFeeOriginal > 0 && (
                        <span className="text-[11px] xs:text-xs sm:text-sm font-bold text-slate-400 line-through decoration-red-500 decoration-[1.5px]">
                          ₹{hero.slide1.visitFeeOriginal}
                        </span>
                      )}
                      <span className="text-xl xs:text-2xl sm:text-[26px] font-black text-blue-600 leading-none">
                        ₹{hero.slide1.visitFeeCurrent}
                      </span>
                    </div>
                  </div>

                  <div className="h-9 w-px shrink-0 bg-slate-200" aria-hidden="true" />

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] xs:text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      At your doorstep
                    </p>
                    <p className="mt-0.5 text-[10px] xs:text-[11px] sm:text-xs font-medium text-slate-500 leading-snug">
                      No extra charges — pay only for the service.
                    </p>
                  </div>

                  <span className="hidden lg:inline self-center whitespace-nowrap text-[10px] text-slate-400">
                    *T&amp;C apply
                  </span>
                </div>

                <div className="mt-4 sm:mt-5 flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3">
                  <a
                    href={WHATSAPP_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logCta(hero.slide1.ctaPrimaryText || "Book Doorstep Service", "hero_slide_1", WHATSAPP_HREF)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
                  >
                    <span>{hero.slide1.ctaPrimaryText || "Book Doorstep Service"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href={PHONE_HREF}
                    onClick={() => logCta(hero.slide1.ctaSecondaryText || `Call ${PHONE}`, "hero_slide_1", PHONE_HREF)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 hover:border-blue-600 hover:text-blue-600 active:scale-95 transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    <span>{hero.slide1.ctaSecondaryText || `Call ${PHONE}`}</span>
                  </a>
                </div>
              </div>

              <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
                <div className="relative w-full flex items-center justify-center">
                  <Image
                    src="/images/doorstep.png"
                    alt="RR Tech Services Doorstep Computer Service Technician"
                    width={640}
                    height={460}
                    priority
                    className="w-full max-w-[460px] xl:max-w-[520px] h-auto max-h-[360px] xl:max-h-[420px] object-contain transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SLIDE 2                                                     */}
        {/* ============================================================ */}
        <div
          className="w-full flex-shrink-0 min-w-full flex items-center
                     px-3.5 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
                     py-6 sm:py-7 lg:py-8"
          role="group"
          aria-roledescription="slide"
          aria-label="2 of 3: Certified Refurbished Laptops"
        >
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center">
              <div className="w-full lg:col-span-7 flex flex-col">
                <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-500 uppercase border-b-2 border-blue-600 pb-0.5 inline-block self-start">
                  {hero.slide2.topBadge}
                </span>

                <h2 className="mt-2.5 sm:mt-3 text-[1.55rem] xs:text-3xl sm:text-4xl md:text-[2.4rem] lg:text-4xl xl:text-[2.9rem] 2xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  {hero.slide2.headingPrefix} <span className="text-blue-600">{hero.slide2.headingHighlight}</span> {hero.slide2.headingSuffix}
                </h2>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base font-semibold text-slate-500">
                  {hero.slide2.subtitle}
                </p>

                <p className="hidden sm:block mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  {hero.slide2.description}
                </p>

                <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-3.5 md:gap-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5 xs:p-3 sm:p-4 shadow-2xs hover:border-blue-400 transition-colors">
                    <p className="font-extrabold text-slate-900 text-xs xs:text-[13px] sm:text-base">
                      Business Series
                    </p>
                    <p className="mt-1 text-[10px] xs:text-[11px] sm:text-xs text-slate-500 leading-snug">
                      Dell, HP &amp; Lenovo
                      <br className="hidden sm:inline" />
                      Intel Core i5 / i7 + SSD
                    </p>
                    <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-100 flex items-baseline gap-1">
                      <span className="text-lg xs:text-xl sm:text-3xl font-black text-blue-600">
                        ₹{hero.slide2.businessSeriesPrice?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-slate-500">
                        starting
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-2.5 xs:p-3 sm:p-4 shadow-2xs hover:border-blue-400 transition-colors">
                    <p className="font-extrabold text-slate-900 text-xs xs:text-[13px] sm:text-base">
                      Apple MacBooks
                    </p>
                    <p className="mt-1 text-[10px] xs:text-[11px] sm:text-xs text-slate-500 leading-snug">
                      MacBook Air &amp; MacBook Pro
                      <br className="hidden sm:inline" />
                      Retina Display • Tested Battery
                    </p>
                    <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-100 flex items-baseline gap-1">
                      <span className="text-lg xs:text-xl sm:text-3xl font-black text-blue-600">
                        ₹{hero.slide2.macbookPrice?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-slate-500">
                        starting
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xs">
                  <span className="text-[9.5px] xs:text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700/80 shrink-0">
                    Free with every laptop
                  </span>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {(hero.slide2.freeAccessories || [
                      "Mouse",
                      "Mouse Pad",
                      "Laptop Sleeve",
                      "Original Adaptor",
                    ]).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 text-[10.5px] xs:text-[11px] sm:text-xs font-semibold text-slate-700"
                      >
                        <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="hidden sm:block h-5 w-px bg-slate-200" aria-hidden="true" />

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-base xs:text-lg sm:text-xl font-black text-blue-600 leading-none">
                      {hero.slide2.warrantyMonths || 6}M
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-extrabold text-slate-900 leading-tight">
                      Warranty
                    </span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3">
                  <Link
                    href="/refurbished-laptops"
                    onClick={() => logCta(hero.slide2.ctaPrimaryText || "Shop All Laptops", "hero_slide_2", "/refurbished-laptops")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
                  >
                    <span>{hero.slide2.ctaPrimaryText || "Shop All Laptops"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={WHATSAPP_DEALS_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logCta(hero.slide2.ctaSecondaryText || "Enquire Now", "hero_slide_2", WHATSAPP_DEALS_HREF)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 hover:border-blue-600 hover:text-blue-600 active:scale-95 transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    <span>{hero.slide2.ctaSecondaryText || "Enquire Now"}</span>
                  </a>
                </div>
              </div>

              <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
                <div className="relative w-full flex items-center justify-center">
                  <Image
                    src="/images/laptops.png"
                    alt="Certified Refurbished Apple MacBook and Windows Laptops"
                    width={640}
                    height={460}
                    className="w-full max-w-[460px] xl:max-w-[520px] h-auto max-h-[360px] xl:max-h-[420px] object-contain transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SLIDE 3                                                     */}
        {/* ============================================================ */}
        <div
          className="w-full flex-shrink-0 min-w-full flex items-center
                     px-3.5 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
                     py-6 sm:py-7 lg:py-8"
          role="group"
          aria-roledescription="slide"
          aria-label="3 of 3: Expert Laptop & Mac Repair"
        >
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center">
              <div className="w-full lg:col-span-7 flex flex-col">
                <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-500 uppercase border-b-2 border-blue-600 pb-0.5 inline-block self-start">
                  {hero.slide3.topBadge}
                </span>

                <h2 className="mt-2.5 sm:mt-3 text-[1.55rem] xs:text-3xl sm:text-4xl md:text-[2.4rem] lg:text-4xl xl:text-[2.9rem] 2xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  {hero.slide3.headingPrefix} <span className="text-blue-600">{hero.slide3.headingHighlight}</span> {hero.slide3.headingSuffix}
                </h2>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base font-semibold text-slate-500">
                  {hero.slide3.subtitle}
                </p>

                <p className="hidden sm:block mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  {hero.slide3.description}
                </p>

                <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-3.5 md:gap-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5 xs:p-3 sm:p-4 shadow-2xs hover:border-blue-400 transition-colors">
                    <p className="font-extrabold text-slate-900 text-xs xs:text-[13px] sm:text-base">
                      Screen Replacement
                    </p>
                    <p className="mt-1 text-[10px] xs:text-[11px] sm:text-xs text-slate-500 leading-snug">
                      Original OEM Panels
                      <br className="hidden sm:inline" />
                      Fitting On All Brands
                    </p>
                    <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-100 flex items-baseline gap-1">
                      <span className="text-lg xs:text-xl sm:text-3xl font-black text-blue-600">
                        ₹{hero.slide3.screenReplacementPrice?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-slate-500">
                        starting
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-2.5 xs:p-3 sm:p-4 shadow-2xs hover:border-blue-400 transition-colors">
                    <p className="font-extrabold text-slate-900 text-xs xs:text-[13px] sm:text-base">
                      Chip &amp; Board Repair
                    </p>
                    <p className="mt-1 text-[10px] xs:text-[11px] sm:text-xs text-slate-500 leading-snug">
                      BGA Micro-Soldering Fix
                      <br className="hidden sm:inline" />
                      Power, Charging &amp; Liquid Damage
                    </p>
                    <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-100 flex items-baseline gap-1">
                      <span className="text-lg xs:text-xl sm:text-3xl font-black text-blue-600">
                        ₹{hero.slide3.chipRepairPrice?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-slate-500">
                        starting
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex items-center gap-2.5 sm:gap-3 rounded-lg border border-slate-200 bg-white p-2 sm:p-2.5 shadow-2xs">
                  <div className="flex shrink-0 flex-col items-center rounded-md border border-blue-100 bg-blue-50/70 px-2.5 sm:px-3 py-1.5 sm:py-2">
                    <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700/80 leading-none">
                      Check Fee
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5 whitespace-nowrap">
                      {hero.slide3.checkFeeOriginal > 0 && (
                        <span className="text-[11px] xs:text-xs sm:text-sm font-bold text-slate-400 line-through decoration-red-500 decoration-[1.5px]">
                          ₹{hero.slide3.checkFeeOriginal}
                        </span>
                      )}
                      <span className="text-xl xs:text-2xl sm:text-[26px] font-black text-blue-600 leading-none">
                        ₹{hero.slide3.checkFeeCurrent}
                      </span>
                    </div>
                  </div>

                  <div className="h-9 w-px shrink-0 bg-slate-200" aria-hidden="true" />

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] xs:text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      Free diagnosis
                    </p>
                    <p className="mt-0.5 text-[10px] xs:text-[11px] sm:text-xs font-medium text-slate-500 leading-snug">
                      Pay only after successful repair.
                    </p>
                  </div>

                  <span className="hidden lg:inline self-center whitespace-nowrap text-[10px] text-slate-400">
                    *No fix, no fee
                  </span>
                </div>

                <div className="mt-4 sm:mt-5 flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3">
                  <a
                    href={WHATSAPP_REPAIR_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logCta(hero.slide3.ctaPrimaryText || "Book A Repair", "hero_slide_3", WHATSAPP_REPAIR_HREF)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
                  >
                    <span>{hero.slide3.ctaPrimaryText || "Book A Repair"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href={PHONE_HREF}
                    onClick={() => logCta(hero.slide3.ctaSecondaryText || "Free Diagnosis Call", "hero_slide_3", PHONE_HREF)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 hover:border-blue-600 hover:text-blue-600 active:scale-95 transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    <span>{hero.slide3.ctaSecondaryText || "Free Diagnosis Call"}</span>
                  </a>
                </div>
              </div>

              <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
                <div className="relative w-full flex items-center justify-center">
                  <Image
                    src="/images/repair.png"
                    alt="Precision Chip and Motherboard Repair"
                    width={640}
                    height={460}
                    className="w-full max-w-[460px] xl:max-w-[520px] h-auto max-h-[360px] xl:max-h-[420px] object-contain transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================ ARROWS ============================ */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden xs:flex absolute left-1.5 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-20
                   h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center
                   rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200
                   transition hover:bg-blue-600 hover:text-white hover:border-blue-600 focus:outline-none"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden xs:flex absolute right-1.5 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-20
                   h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center
                   rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200
                   transition hover:bg-blue-600 hover:text-white hover:border-blue-600 focus:outline-none"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* ========================== INDICATORS ========================== */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-1.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-1.5 shadow-sm">
          {[0, 1, 2].map((index) => {
            const isActive = current === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={`transition-all duration-300 rounded-full focus:outline-none ${isActive
                  ? "w-6 sm:w-8 h-1.5 bg-blue-600"
                  : "w-2 h-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
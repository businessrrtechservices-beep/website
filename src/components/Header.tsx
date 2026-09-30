"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  Phone,
  X,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { trackInterest } from "@/lib/analyticsClient";

const navItems = [
  { label: "Shop Refurbished", href: "/refurbished-laptops" },
  { label: "Repair Services", href: "#services" },
  { label: "Doorstep Service", href: "#services" },
  { label: "Sell Your Laptop", href: "#sell" },
  { label: "About Us", href: "#about" },
];

const PHONE = "9209095278";
const PHONE_HREF = `tel:+91${PHONE}`;
const WHATSAPP_HREF = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
  "Hi RR Tech Services, I'd like to book a doorstep appointment."
)}`;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- Scroll shadow ---------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- Close (with exit animation) ---------- */
  const closeMenu = useCallback(() => {
    setClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setMobileOpen(false);
      setClosing(false);
    }, 220);
  }, []);

  const openMenu = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setClosing(false);
    setMobileOpen(true);
  }, []);

  /* ---------- Body scroll lock ---------- */
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  /* ---------- ESC to close ---------- */
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMenu]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  return (
    <>
      {/* ================= ANIMATION KEYFRAMES ================= */}
      <style>{`
        @keyframes rr-backdrop-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes rr-backdrop-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes rr-drawer-in    { from { transform: translate3d(100%,0,0) } to { transform: translate3d(0,0,0) } }
        @keyframes rr-drawer-out   { from { transform: translate3d(0,0,0) } to { transform: translate3d(100%,0,0) } }
        @keyframes rr-item-in      { from { opacity: 0; transform: translateX(14px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes rr-fade-down    { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }

        .rr-backdrop-in  { animation: rr-backdrop-in .24s ease-out both }
        .rr-backdrop-out { animation: rr-backdrop-out .22s ease-in both }
        .rr-drawer-in    { animation: rr-drawer-in .32s cubic-bezier(.22,1,.36,1) both }
        .rr-drawer-out   { animation: rr-drawer-out .22s cubic-bezier(.4,0,1,1) both }
        .rr-item-in      { animation: rr-item-in .38s cubic-bezier(.22,1,.36,1) both }
        .rr-fade-down    { animation: rr-fade-down .3s ease-out both }

        .rr-drawer      { will-change: transform }
        .rr-scroll-y    { -webkit-overflow-scrolling: touch; overscroll-behavior: contain }

        @media (prefers-reduced-motion: reduce) {
          .rr-backdrop-in, .rr-backdrop-out, .rr-drawer-in,
          .rr-drawer-out, .rr-item-in, .rr-fade-down { animation: none !important }
        }
      `}</style>

      {/* ======================= HEADER ======================= */}
      <header
        className={`sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md transition-all duration-300 ${scrolled
            ? "border-slate-200 shadow-[0_1px_12px_-4px_rgba(15,23,42,0.12)]"
            : "border-slate-100 shadow-none"
          }`}
      >
        <div className="flex h-16 w-full items-center justify-between gap-3 px-3 sm:h-20 sm:px-5 lg:h-24 lg:px-8">
          {/* ---------- Brand ---------- */}
          <Link
            href="/"
            aria-label="RR Tech Services — Home"
            className="group flex shrink-0 items-center rounded-md outline-none transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600/40 focus-visible:ring-offset-2"
          >
            <Image
              src="/assets/logo.png"
              alt="RR Tech Services"
              width={320}
              height={120}
              priority
              className="h-11 w-auto object-contain transition-opacity duration-200 group-hover:opacity-85 sm:h-14 lg:h-16"
            />
          </Link>

          {/* ---------- Desktop nav ---------- */}
          <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative rounded-md px-3 py-2 text-[13px] font-medium text-slate-700 outline-none transition-colors duration-200 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/40 xl:text-sm"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-3 right-3 h-[2px] origin-left scale-x-0 rounded-full bg-blue-600 transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </Link>
            ))}
          </nav>

          {/* ---------- Actions ---------- */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            {/* Call */}
            <a
              href={PHONE_HREF}
              onClick={() => trackInterest("Header Call", { buttonId: "header_call", section: "header", targetUrl: PHONE_HREF })}
              aria-label={`Call ${PHONE}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none transition-all duration-200 hover:-translate-y-px hover:border-blue-600 hover:text-blue-600 hover:shadow-sm active:translate-y-0 active:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600/40 sm:px-3.5 sm:text-[13px]"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span className="hidden md:inline">{PHONE}</span>
              <span className="md:hidden">Call</span>
            </a>

            {/* Hamburger */}
            <button
              type="button"
              onClick={openMenu}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 outline-none transition-all duration-200 hover:border-blue-600 hover:bg-blue-50/60 hover:text-blue-600 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600/40 lg:hidden"
            >
              <Menu className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MOBILE DRAWER ==================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          {/* Backdrop */}
          <div
            onClick={closeMenu}
            aria-hidden="true"
            className={`fixed inset-0 bg-slate-900/50 backdrop-blur-[3px] ${closing ? "rr-backdrop-out" : "rr-backdrop-in"
              }`}
          />

          {/* Panel */}
          <aside
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className={`rr-drawer fixed inset-y-0 right-0 z-50 flex w-[86vw] max-w-[340px] flex-col border-l border-slate-200 bg-white shadow-2xl sm:w-[360px] sm:max-w-none ${closing ? "rr-drawer-out" : "rr-drawer-in"
              }`}
          >
            {/* --- Top: logo + close --- */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <Image
                src="/assets/logo.png"
                alt="RR Tech Services"
                width={240}
                height={90}
                className="h-12 w-auto object-contain sm:h-14"
              />
              <button
                type="button"
                onClick={closeMenu}
                autoFocus
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 outline-none transition-all duration-200 hover:rotate-90 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 active:scale-90 focus-visible:ring-2 focus-visible:ring-blue-600/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* --- Middle: scrollable links --- */}
            <nav className="rr-scroll-y flex-1 overflow-y-auto px-2.5 py-3">
              {navItems.map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  style={{ animationDelay: `${70 + i * 45}ms` }}
                  className="rr-item-in group flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-semibold text-slate-800 outline-none transition-colors duration-200 hover:bg-blue-50/70 hover:text-blue-600 focus-visible:bg-blue-50/70 focus-visible:text-blue-600"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </Link>
              ))}
            </nav>

            {/* --- Bottom: actions --- */}
            <div
              className="border-t border-slate-100 px-5 pt-4"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex flex-col gap-2.5">
                {/* Book Appointment → WhatsApp */}
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackInterest("Mobile Drawer Book Appointment", { buttonId: "mobile_book_appointment", section: "mobile_drawer", targetUrl: WHATSAPP_HREF })}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 outline-none transition-all duration-200 hover:bg-emerald-700 active:scale-[.98] focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Book Appointment</span>
                </a>

                {/* Call */}
                <a
                  href={PHONE_HREF}
                  onClick={() => trackInterest("Mobile Drawer Call", { buttonId: "mobile_call", section: "mobile_drawer", targetUrl: PHONE_HREF })}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all duration-200 hover:border-blue-600 hover:bg-blue-50/60 hover:text-blue-700 active:scale-[.98] focus-visible:ring-2 focus-visible:ring-blue-600/40"
                >
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>Call {PHONE}</span>
                </a>

                <div className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
                  <p>Doorstep Service across Pune</p>
                  <p className="mt-0.5 text-slate-400">
                    Mon – Sun: 9:00 AM – 9:00 PM
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
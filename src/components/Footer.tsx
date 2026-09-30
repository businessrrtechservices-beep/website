import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const PHONE = "9209095278";
const PHONE_HREF = `tel:+91${PHONE}`;
const WHATSAPP_HREF = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
  "Hi RR Tech Services, I'd like to enquire about your services."
)}`;
const EMAIL = "business@rrtechservices.com";

/* ---------- Brand SVG icons ---------- */
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const socials = [
  {
    label: "WhatsApp",
    href: WHATSAPP_HREF,
    Icon: MessageCircle,
    hoverClass: "hover:border-emerald-600 hover:text-emerald-400",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    Icon: InstagramIcon,
    hoverClass: "hover:border-pink-600 hover:text-pink-400",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/",
    Icon: FacebookIcon,
    hoverClass: "hover:border-blue-600 hover:text-blue-400",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    Icon: LinkedinIcon,
    hoverClass: "hover:border-sky-600 hover:text-sky-400",
  },
];

const quickLinks = [
  { label: "Shop Laptops", href: "/refurbished-laptops", external: false },
  { label: "Book a Repair", href: WHATSAPP_HREF, external: true },
  { label: "Customer Reviews", href: "#reviews", external: false },
  { label: "About Us", href: "#about", external: false },
  { label: "Contact", href: WHATSAPP_HREF, external: true },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="mx-auto w-full max-w-7xl px-3.5 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* ---------- Main content ---------- */}
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-5">
            <Link
              href="/"
              aria-label="RR Tech Services — Home"
              className="inline-flex items-center rounded-md outline-none transition-opacity duration-200 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-blue-600/40"
            >
              <Image
                src="/assets/logo.png"
                alt="RR Tech Services"
                width={280}
                height={104}
                className="h-11 w-auto object-contain sm:h-12"
              />
            </Link>

            <p className="mt-4 text-[12.5px] xs:text-[13px] sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              India&apos;s trusted laptop lifecycle partner — repair, upgrade, buy, sell.
              Genuine parts, transparent pricing, warranty-backed service.
            </p>

            {/* Social icons */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {socials.map((s) => {
                const Icon = s.Icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-400 outline-none transition-all duration-200 hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-blue-600/40 ${s.hoverClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] xs:text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((link) =>
                link.external ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-[12.5px] xs:text-[13px] sm:text-sm text-slate-400 outline-none transition-colors duration-200 hover:text-white focus-visible:text-white"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 text-blue-500 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-[12.5px] xs:text-[13px] sm:text-sm text-slate-400 outline-none transition-colors duration-200 hover:text-white focus-visible:text-white"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 text-blue-500 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact column */}
          <div className="lg:col-span-4">
            <h4 className="text-[10px] xs:text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Get In Touch
            </h4>
            <ul className="mt-3 space-y-2.5">
              <li>
                <a
                  href={PHONE_HREF}
                  className="group flex items-center gap-2.5 outline-none"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-blue-500 transition-colors duration-200 group-hover:bg-blue-600 group-hover:text-white">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[12.5px] xs:text-[13px] sm:text-sm text-slate-400 transition-colors duration-200 group-hover:text-white">
                    {PHONE}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="group flex items-center gap-2.5 outline-none"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-blue-500 transition-colors duration-200 group-hover:bg-blue-600 group-hover:text-white">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[12.5px] xs:text-[13px] sm:text-sm text-slate-400 transition-colors duration-200 group-hover:text-white">
                    {EMAIL}
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-blue-500">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span className="text-[12.5px] xs:text-[13px] sm:text-sm text-slate-400">
                  Pune, Maharashtra
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-blue-500">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <span className="text-[12.5px] xs:text-[13px] sm:text-sm text-slate-400">
                  Mon – Sun · 9 AM – 9 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ---------- Bottom bar ---------- */}
        <div className="mt-8 sm:mt-10 pt-5 border-t border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] xs:text-xs text-slate-500 text-center sm:text-left">
            © {year} RR Tech Services. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10.5px] xs:text-[11px] text-slate-500">
            <span>Genuine Parts</span>
            <span className="text-slate-700">•</span>
            <span>Transparent Pricing</span>
            <span className="text-slate-700">•</span>
            <span>6-Month Warranty</span>
            <span className="text-slate-700">•</span>
            <span>Trusted by 500+</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
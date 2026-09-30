"use client";

import { Star, MapPin, Verified } from "lucide-react";

const reviews = [
  {
    name: "Rahul Singh",
    location: "Pune",
    rating: 5,
    service: "Screen Replacement",
    text: "Got my Asus laptop screen replaced here. Genuine original panel, backed by a 1-year warranty. Working flawlessly — excellent, transparent, and fast service. Pricing was much lower than other shops I checked.",
    verified: true,
  },
  {
    name: "Dhananjay Mahadik",
    location: "Pune",
    rating: 5,
    service: "Refurbished Laptop Buyer",
    text: "I'm a regular customer here and have purchased multiple refurbished laptops. Every single unit is properly tested and delivered in excellent condition. You genuinely get the best value for your money.",
    verified: true,
  },
  {
    name: "Nauman Pathan",
    location: "Pune",
    rating: 4,
    service: "Refurbished Laptop Buyer",
    text: "Purchased a refurbished laptop for my daily coding work. It's been running fast and smooth with zero lag. Great value for money — delivery took a day longer than expected, but the laptop itself is flawless.",
    verified: true,
  },
  {
    name: "Sayyed Sofiyan",
    location: "Pune",
    rating: 5,
    service: "Refurbished Laptop Buyer",
    text: "Bought a refurbished laptop from RR Tech and I'm genuinely impressed. It arrived in excellent condition — looks and performs like new. Smooth performance, all accessories included, and the pricing was unbeatable. Highly recommended.",
    verified: true,
  },
  {
    name: "Narendra",
    location: "Pune",
    rating: 5,
    service: "Desktop Upgrade",
    text: "Upgraded my desktop with all genuine components, each covered under warranty. Transparent pricing throughout and I even got the whole setup at a discounted rate. Highly recommend for PC builds.",
    verified: true,
  },
  {
    name: "Dinesh Rathod",
    location: "Pune",
    rating: 4,
    service: "Deep Servicing + Upgrade",
    text: "My laptop was overheating badly and performing poorly. They offered a free diagnosis — the fan was choked with dust. After deep servicing and an upgrade, it now runs cool, smooth, and fast. Excellent work.",
    verified: true,
  },
];

export default function Testimonials() {
  return (
    <section
      id="reviews"
      className="relative w-full bg-slate-50/60 border-y border-slate-200 py-8 sm:py-10 lg:py-12"
    >
      <div className="mx-auto w-full max-w-7xl px-3.5 xs:px-4 sm:px-6 lg:px-8">
        {/* ---------- Section header ---------- */}
        <div className="mb-5 sm:mb-6 lg:mb-8">
          <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-500 uppercase border-b-2 border-blue-600 pb-0.5 inline-block">
            Customer Reviews
          </span>
          <h2 className="mt-2.5 text-xl xs:text-2xl sm:text-3xl lg:text-[2rem] font-black text-slate-900 tracking-tight leading-tight">
            Trusted By <span className="text-blue-600">500+ Customers</span>
          </h2>
          <p className="mt-1 hidden sm:block text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Real experiences from real customers — verified purchases &amp; services.
          </p>
        </div>

        {/* ---------- Reviews: horizontal scroll on mobile, grid on sm+ ---------- */}
        <div className="-mx-3.5 xs:-mx-4 sm:mx-0">
          <div
            className="flex sm:grid gap-2.5 sm:gap-3 lg:gap-4
                       overflow-x-auto sm:overflow-visible
                       pb-3 sm:pb-0 pt-1 px-3.5 xs:px-4 sm:px-0
                       snap-x snap-mandatory scroll-smooth
                       sm:snap-none sm:grid-cols-2 lg:grid-cols-3
                       [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((review) => (
              <article
                key={review.name}
                className="group relative flex w-[280px] xs:w-[300px] sm:w-auto shrink-0 sm:shrink
                           snap-start flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4
                           transition-all duration-300
                           hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/10"
              >
                {/* Rating row */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200"
                        }`}
                    />
                  ))}
                  {review.verified && (
                    <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                      <Verified className="h-2.5 w-2.5" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Message */}
                <blockquote className="mt-2.5 flex-1 text-[11.5px] xs:text-xs sm:text-[13px] leading-relaxed text-slate-700">
                  &ldquo;{review.text}&rdquo;
                </blockquote>

                {/* Service tag */}
                <span className="mt-2.5 inline-flex w-fit items-center rounded bg-blue-50 px-1.5 py-0.5 text-[9.5px] xs:text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  {review.service}
                </span>

                {/* Author */}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <p className="truncate text-[11.5px] xs:text-xs font-extrabold text-slate-900 leading-snug">
                    {review.name}
                  </p>
                  <div className="flex shrink-0 items-center gap-1 text-[10px] xs:text-[10.5px] text-slate-500 leading-snug">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    <span>{review.location}</span>
                  </div>
                </div>

                {/* Bottom accent bar on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-blue-600 transition-transform duration-300 ease-out group-hover:scale-x-100"
                />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
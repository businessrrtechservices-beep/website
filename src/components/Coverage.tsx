import { Laptop, MapPin, Truck } from "lucide-react";
import { site } from "@/lib/site";

const puneAreas = [
  "Baner",
  "Wakad",
  "Hinjewadi",
  "Kothrud",
  "Viman Nagar",
  "Hadapsar",
  "Aundh",
  "Pimple Saudagar",
  "Camp",
  "Deccan",
];

export default function Coverage() {
  return (
    <section className="bg-blue-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">
            Where We Serve
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Doorstep in Pune. Everywhere in India.
          </h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <MapPin className="h-7 w-7" />
            </span>
            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Doorstep Laptop Service — Pune
            </h3>
            <p className="mt-3 leading-relaxed text-slate-600">
              Our technician comes to your home or office, diagnoses the issue
              in front of you, and fixes most problems on the spot. Serving all
              major areas of Pune, including:
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {puneAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700"
                >
                  {area}
                </span>
              ))}
              <span className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white">
                + All of Pune
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-lg shadow-blue-900/20">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Truck className="h-7 w-7" />
            </span>
            <h3 className="mt-6 text-xl font-bold">
              Repair, Sales & Shipping — PAN India
            </h3>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3">
                <Laptop className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
                <p className="text-sm leading-relaxed text-blue-50">
                  <span className="font-semibold text-white">
                    Laptop repairing PAN India:
                  </span>{" "}
                  courier your laptop to us — we repair it and ship it back
                  safely with tracking.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
                <p className="text-sm leading-relaxed text-blue-50">
                  <span className="font-semibold text-white">
                    Refurbished laptops & accessories
                  </span>{" "}
                  are sold and shipped to every state in India with secure
                  packaging.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
                <p className="text-sm leading-relaxed text-blue-50">
                  <span className="font-semibold text-white">
                    Based in Pune —
                  </span>{" "}
                  {site.address}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

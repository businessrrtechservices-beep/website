import Image from "next/image";
import { ShieldCheck, Award, Users, Star, Target, HeartHandshake } from "lucide-react";

const values = [
  { icon: ShieldCheck, title: "Genuine Parts Only", desc: "We source directly from OEMs and authorized distributors. Every component is verified, sealed, and traceable — no grey market, no refurbished parts sold as new." },
  { icon: Award, title: "Transparent by Default", desc: "Free diagnosis, photo-documented repairs, and itemized quotes before any work begins. You approve every rupee spent — zero surprises on the final bill." },
  { icon: Users, title: "Certified Engineers", desc: "Our technicians hold CompTIA A+, Apple ACMT, and brand-specific certifications. Continuous training on latest architectures \u2014 from M-series MacBooks to 13th-gen Intel." },
  { icon: Target, title: "Right-Sized Solutions", desc: "We don\u2019t upsell. A 5-year-old laptop gets a cost-effective fix; a newer machine gets premium parts. Your budget and use-case drive our recommendation." },
  { icon: Star, title: "Warranty That Means Something", desc: "6 months on every refurbished laptop and repair. Claims handled in-house — no third-party runaround. 94% of warranty issues resolved in 48 hours." },
  { icon: HeartHandshake, title: "Data Privacy First", desc: "ISO 27001-aligned handling. BitLocker/FileVault respected, secure erase on request, zero data access without consent. Your files are yours." },
];

const stats = [
  { value: "12,000+", label: "Devices Serviced" },
  { value: "4.9 / 5.0", label: "Google Rating" },
  { value: "8+ Years", label: "In Business" },
  { value: "20,000+", label: "Pincodes Served" },
  { value: "98%", label: "First-Time Fix Rate" },
  { value: "6 Months", label: "Standard Warranty" },
];

export default function About() {
  return (
    <section id="about" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10">
            <Image
              src="/images/repair-engineer.jpg"
              alt="RR Tech Services technician repairing laptop"
              width={720}
              height={540}
              className="w-full h-auto"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white font-semibold">Certified Engineers • Genuine Parts • Transparent Process</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase">About RR Tech Services</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Built on Trust. Delivered with Precision.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Founded in 2016 in Pune, RR Tech Services started as a modest chip-level repair lab.
              Today, we\u2019re a full-stack laptop lifecycle partner \u2014 repairing, upgrading, refurbishing,
              and retailing across India \u2014 while keeping the same founding principles:
            </p>

            <ul className="mt-6 space-y-4">
              {values.map((value) => (
                <li key={value.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <value.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{value.title}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{value.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-slate-50">
                  <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
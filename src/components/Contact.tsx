"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { site } from "@/lib/site";

const contactItems = [
  { icon: Phone, label: "Call Us", value: site.phone, href: site.phoneHref },
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: MapPin, label: "Visit Us", value: site.address },
  { icon: Clock, label: "Working Hours", value: site.hours },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Laptop / PC Repair");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hi RR Tech Services!\n\nName: ${name}\nPhone: ${phone}\nService Needed: ${service}\nMessage: ${message}`,
    );
    window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
  }

  const inputClass =
    "w-full rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

  return (
    <section id="contact" className="scroll-mt-20 bg-blue-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">
              Get In Touch
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Book Your Repair Today
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Free diagnosis, honest advice and transparent pricing. Reach out —
              we usually respond within minutes.
            </p>

            <div className="mt-8 space-y-5">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-0.5 block text-sm font-semibold text-slate-900 hover:text-blue-700"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-900/5"
          >
            <h3 className="text-lg font-bold text-slate-900">
              Request a Callback
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Fill this in and we will get back to you on WhatsApp.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="service"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Service Needed
              </label>
              <select
                id="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className={inputClass}
              >
                <option>Laptop / PC Repair</option>
                <option>Chip-Level Repair</option>
                <option>Upgrade (RAM / SSD)</option>
                <option>Buy a Refurbished Laptop</option>
                <option>Sell My Old Laptop</option>
                <option>Accessories</option>
                <option>Doorstep Service (Pune)</option>
                <option>Ship My Laptop for Repair (PAN India)</option>
              </select>
            </div>

            <div className="mt-4">
              <label
                htmlFor="message"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Describe Your Issue
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Laptop not turning on, screen flickering…"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Send via WhatsApp
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

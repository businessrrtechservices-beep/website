import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RR Tech Services | Laptop & PC Repair, Upgrades & Refurbished Sales",
  description:
    "Trusted laptop and PC repair experts. Chip-level repairs, upgrades, refurbished laptop sales & purchase, and accessories. Doorstep service in Pune, shipping PAN India. 100% genuine parts and full transparency.",
  keywords: [
    "laptop repair pune",
    "pc repair",
    "chip level repair",
    "refurbished laptops",
    "laptop doorstep service pune",
    "laptop repair pan india",
    "laptop accessories",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}

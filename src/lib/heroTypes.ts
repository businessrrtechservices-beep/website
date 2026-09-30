export interface HeroConfig {
  slide1: {
    topBadge: string;
    headingPrefix: string;
    headingHighlight: string;
    headingSuffix: string;
    subtitle: string;
    description: string;
    basicServicePrice: number;
    deepServicePrice: number;
    visitFeeOriginal: number;
    visitFeeCurrent: number;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
  slide2: {
    topBadge: string;
    headingPrefix: string;
    headingHighlight: string;
    headingSuffix: string;
    subtitle: string;
    description: string;
    businessSeriesPrice: number;
    macbookPrice: number;
    warrantyMonths: number;
    freeAccessories: string[];
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
  slide3: {
    topBadge: string;
    headingPrefix: string;
    headingHighlight: string;
    headingSuffix: string;
    subtitle: string;
    description: string;
    screenReplacementPrice: number;
    chipRepairPrice: number;
    checkFeeOriginal: number;
    checkFeeCurrent: number;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
}

export const defaultHeroConfig: HeroConfig = {
  slide1: {
    topBadge: "At Your Home Or Office",
    headingPrefix: "Doorstep",
    headingHighlight: "Laptop & Desktop",
    headingSuffix: "Service",
    subtitle: "Fast. Reliable. Affordable.",
    description:
      "Expert computer technician arrives at your home or office. Complete servicing, cleaning, and diagnostics carried out right in front of you.",
    basicServicePrice: 499,
    deepServicePrice: 699,
    visitFeeOriginal: 299,
    visitFeeCurrent: 0,
    ctaPrimaryText: "Book Doorstep Service",
    ctaSecondaryText: "Call 9209095278",
  },
  slide2: {
    topBadge: "Festive Mega Sale • Up to 47% OFF",
    headingPrefix: "Premium",
    headingHighlight: "Refurbished",
    headingSuffix: "Laptops",
    subtitle: "Certified Pre-Owned. Warranty Backed. Free Delivery.",
    description:
      "Tested business laptops and MacBooks from Dell, HP, Lenovo & Apple. Includes 6-month warranty and free PAN India delivery.",
    businessSeriesPrice: 22000,
    macbookPrice: 40000,
    warrantyMonths: 6,
    freeAccessories: ["Mouse", "Mouse Pad", "Laptop Sleeve", "Original Adaptor"],
    ctaPrimaryText: "Shop All Laptops",
    ctaSecondaryText: "Enquire Now",
  },
  slide3: {
    topBadge: "Genuine Parts • Expert Engineers",
    headingPrefix: "Expert",
    headingHighlight: "Laptop & Mac",
    headingSuffix: "Repair",
    subtitle: "On-The-Spot Fix. Transparent Pricing. No Hidden Charges.",
    description:
      "Cracked screen, dead battery, liquid spill, or complex motherboard chip failure? Certified chip-level engineers repair your device fast with genuine OEM components.",
    screenReplacementPrice: 1499,
    chipRepairPrice: 999,
    checkFeeOriginal: 299,
    checkFeeCurrent: 0,
    ctaPrimaryText: "Book A Repair",
    ctaSecondaryText: "Free Diagnosis Call",
  },
};

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    screen: string;
    gpu?: string;
  };
  condition: string;
  price: number;
  mrp: number;
  discount: number;
  image: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  warrantyMonths: number;
  features: string[];
}

export const priceRanges = [
  { label: "Under ₹20,000", min: 0, max: 20000 },
  { label: "₹20,000 - ₹30,000", min: 20000, max: 30000 },
  { label: "₹30,000 - ₹40,000", min: 30000, max: 40000 },
  { label: "₹40,000 - ₹50,000", min: 40000, max: 50000 },
  { label: "Above ₹50,000", min: 50000, max: Infinity },
] as const;

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

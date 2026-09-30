export interface Product {
  id: string;
  name: string;
  brand: "Dell" | "HP" | "Lenovo" | "Apple" | "Acer" | "Asus" | "Microsoft";
  model: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    screen: string;
    gpu?: string;
  };
  condition: "Excellent" | "Very Good" | "Good" | "Like New";
  price: number;
  mrp: number;
  discount: number;
  image: string;
  badge?: "Best Seller" | "Like New" | "Limited Stock" | "Top Pick";
  rating: number;
  reviewCount: number;
  warrantyMonths: number;
  features: string[];
}

export const products: Product[] = [
  {
    id: "hp-elitebook-dragonfly-g2",
    name: "HP EliteBook Dragonfly G2 (2-in-1)",
    brand: "HP",
    model: "EliteBook Dragonfly G2",
    specs: {
      cpu: "Intel Core i7-1185G7 @ 3.00GHz (11th Gen)",
      ram: "16 GB",
      storage: "512 GB NVMe SSD",
      screen: "13.3\" FHD Touch (2-in-1 Convertible)",
      gpu: "Intel Iris Xe Graphics",
    },
    condition: "Excellent",
    price: 56000,
    mrp: 62000,
    discount: 10,
    image: "/images/laptop-surface.jpg",
    badge: "Top Pick",
    rating: 4.8,
    reviewCount: 42,
    warrantyMonths: 6,
    features: [
      "2-in-1 Convertible",
      "Touchscreen",
      "Intel Iris Xe Graphics",
      "Ultra-Light Premium Build",
    ],
  },
  {
    id: "dell-latitude-5420-16-512",
    name: "Dell Latitude 5420 (16GB / 512GB)",
    brand: "Dell",
    model: "Latitude 5420",
    specs: {
      cpu: "Intel Core i5-1135G7 (11th Gen)",
      ram: "16 GB DDR4",
      storage: "512 GB NVMe SSD",
      screen: "14\" FHD IPS Anti-Glare",
    },
    condition: "Excellent",
    price: 34499,
    mrp: 39000,
    discount: 12,
    image: "/images/laptop-xps.jpg",
    badge: "Best Seller",
    rating: 4.8,
    reviewCount: 124,
    warrantyMonths: 6,
    features: ["Backlit Keyboard", "Fingerprint Reader", "Thunderbolt 4", "Wi-Fi 6"],
  },
  {
    id: "dell-latitude-5420-8-256",
    name: "Dell Latitude 5420 (8GB / 256GB)",
    brand: "Dell",
    model: "Latitude 5420",
    specs: {
      cpu: "Intel Core i5-1135G7 (11th Gen)",
      ram: "8 GB DDR4",
      storage: "256 GB NVMe SSD",
      screen: "14\" FHD IPS Anti-Glare",
    },
    condition: "Excellent",
    price: 28000,
    mrp: 34000,
    discount: 18,
    image: "/images/laptop-xps.jpg",
    badge: "Top Pick",
    rating: 4.7,
    reviewCount: 98,
    warrantyMonths: 6,
    features: ["Backlit Keyboard", "Fingerprint Reader", "Thunderbolt 4", "Wi-Fi 6"],
  },
  {
    id: "macbook-air-2020-m1",
    name: "MacBook Air M1 2020",
    brand: "Apple",
    model: "MacBook Air (M1, 2020)",
    specs: {
      cpu: "Apple M1 Chip (8-core)",
      ram: "8 GB Unified",
      storage: "256 GB SSD",
      screen: "13.3\" Retina (2560x1600)",
    },
    condition: "Like New",
    price: 58000,
    mrp: 66000,
    discount: 12,
    image: "/images/laptop-thinkpad.jpg",
    badge: "Top Pick",
    rating: 4.9,
    reviewCount: 89,
    warrantyMonths: 6,
    features: ["M1 Performance", "18hr Battery", "Fanless", "Touch ID"],
  },
];

export const brands = ["All", "Dell", "HP", "Lenovo", "Apple", "Acer", "Asus", "Microsoft"] as const;
export const conditions = ["All", "Excellent", "Very Good", "Good"] as const;
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
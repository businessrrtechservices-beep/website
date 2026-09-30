export interface Brand {
  id: string;
  name: string;
  category?: string; // Optional: e.g. Laptops, Accessories, Storage
  description?: string;
  createdAt: Date;
}

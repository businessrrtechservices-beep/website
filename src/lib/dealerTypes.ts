export interface Dealer {
  id: string;
  name: string; // Dealer / Supplier / Wholesaler Name
  contactPerson?: string;
  phone: string;
  email?: string;
  address: string;
  gstin?: string;
  categories: string[]; // Type of categories supplied: Laptops, Accessories, RAM, Screens, etc.
  totalPurchased: number; // Total ₹ value of stock procured from this dealer
  totalPaid: number; // Total ₹ value paid to this dealer
  outstandingBalance: number; // totalPurchased - totalPaid (amount owed by shop to dealer)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

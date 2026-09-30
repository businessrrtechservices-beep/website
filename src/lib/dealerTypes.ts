export type DealerTransactionType = "credit_purchase" | "payment" | "adjustment";

export interface DealerTransaction {
  id: string;
  dealerId: string;
  dealerName: string;
  type: DealerTransactionType; // "credit_purchase" (stock procured on credit, shop owes dealer) | "payment" (shop pays dealer, debt decreases)
  amount: number;
  paymentMode?: string; // UPI, Cash, Bank Transfer, Cheque
  date: string; // ISO string
  description: string; // e.g. "Stock Purchase on Credit: 5x Dell Latitude 7490"
  itemId?: string;
  itemCode?: string;
  referenceNumber?: string; // UTR or Invoice/Bill No.
  balanceAfter: number; // Remaining amount owed to dealer after this entry
  createdAt: Date;
}

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
  history?: DealerTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

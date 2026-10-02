export type ExpenseCategory =
  | "Domains & Hosting"
  | "Meta & Digital Ads"
  | "Software & SaaS"
  | "Office & Utilities"
  | "Courier & Logistics"
  | "Spare Parts & Repairs"
  | "Hardware & Tools"
  | "Staff & Labor"
  | "Miscellaneous";

export type ExpenseFundedSource =
  | "shop_wallet" // Paid from shop cash/UPI wallet (auto-debits ledger)
  | "partner_personal" // Paid from partner's personal pocket (credits partner's equity investment)
  | "partner_investment"; // Deducted from partner's invested capital pool

export interface ExpenseRecord {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO IST string
  vendor?: string; // e.g. Meta, Google, GoDaddy, Hostinger, Landlord
  paymentMode: string; // UPI, Net Banking, Card, Cash
  referenceNumber?: string;
  proofUrl?: string; // Cloudinary receipt image/pdf URL
  proofPublicId?: string;
  fundedBy: ExpenseFundedSource;
  partnerId?: string;
  partnerName?: string;
  notes?: string;
  linkedLedgerTxId?: string;
  linkedBorrowingTxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  totalExpense: number;
  thisMonthExpense: number;
  lastMonthExpense: number;
  marketingAdsTotal: number;
  domainsHostingTotal: number;
  officeOpsTotal: number;
  byCategory: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
    count: number;
  }[];
  recentExpenses: ExpenseRecord[];
}

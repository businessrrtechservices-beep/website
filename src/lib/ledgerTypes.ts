export type TransactionType = "credit" | "debit";

export type PaymentMode = "Cash" | "UPI" | "Bank Transfer" | "Card" | "Cheque" | "Other";

export type TransactionCategory =
  | "Sale"
  | "Stock Purchase"
  | "Repair Service"
  | "Office Expense"
  | "Spare Parts"
  | "Owner Withdrawal"
  | "Capital Added"
  | "Partner Borrowing"
  | "Partner Repayment"
  | "Partner Investment"
  | "Other";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  paymentMode: PaymentMode;
  category: TransactionCategory | string;
  reason: string;
  referenceNumber?: string;
  proofUrl?: string; // Cloudinary image URL for receipt / proof / cheque / screenshot
  proofPublicId?: string;
  date: string; // ISO string or YYYY-MM-DDTHH:mm
  invoiceId?: string;
  invoiceNumber?: string;
  dealerId?: string;
  dealerName?: string;
  createdAt: Date;
}

export interface WalletSummary {
  balance: number;
  totalCredit: number;
  totalDebit: number;
  todayCredit: number;
  todayDebit: number;
  transactionCount: number;
}

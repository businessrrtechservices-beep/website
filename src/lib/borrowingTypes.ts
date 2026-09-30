import { PaymentMode } from "./ledgerTypes";

export type BorrowingType = "borrow" | "repayment";

export interface PartnerWallet {
  id: string; // e.g. "nauman", "dinesh", "subhan"
  name: string; // "Nauman", "Dinesh", "Subhan"
  phone?: string;
  notes?: string;
  currentBorrowedBalance: number; // Amount shop currently owes to partner (totalBorrowed - totalRepaid)
  totalBorrowed: number;
  totalRepaid: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BorrowingTransaction {
  id: string;
  partnerId: string;
  partnerName: string;
  type: BorrowingType; // "borrow" (shop gets money) or "repayment" (shop repays partner)
  amount: number;
  paymentMode: PaymentMode;
  date: string; // ISO string or YYYY-MM-DDTHH:mm
  reason: string;
  referenceNumber?: string;
  mainLedgerTxId?: string;
  createdAt: Date;
}

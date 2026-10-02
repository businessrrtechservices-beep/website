import { PaymentMode } from "./ledgerTypes";

export type BorrowingType =
  | "borrow"
  | "repayment"
  | "investment"
  | "investment_withdrawal"
  | "borrow_to_investment"
  | "investment_to_borrow";

export interface PartnerWallet {
  id: string; // e.g. "nauman", "dinesh", "subhan"
  name: string;
  phone?: string;
  notes?: string;
  // Borrowing / Loan (amount shop owes to partner)
  currentBorrowedBalance: number;
  totalBorrowed: number;
  totalRepaid: number;
  // Investment / Capital (partner equity stake in shop)
  currentInvestedBalance: number;
  totalInvested: number;
  totalInvestmentWithdrawn: number;
  // Total partner contribution (Borrowed + Invested)
  totalNetContribution: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BorrowingTransaction {
  id: string;
  partnerId: string;
  partnerName: string;
  type: BorrowingType;
  amount: number;
  paymentMode: PaymentMode;
  date: string; // ISO string or YYYY-MM-DDTHH:mm
  reason: string;
  referenceNumber?: string;
  proofUrl?: string; // Cloudinary proof / screenshot / voucher URL
  proofPublicId?: string;
  linkedTxId?: string;
  mainLedgerTxId?: string;
  createdAt: Date;
}

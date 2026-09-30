import { PaymentMode } from "./ledgerTypes";

export interface SaleItemLine {
  itemId: string;
  itemCode: string; // e.g. RRTS-ITM-1001
  itemName: string;
  category: string;
  brand: string;
  model: string;
  serialNumbers?: string[]; // Specific serial number(s) allocated to this customer
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. RRTS-INV-1001
  date: string; // YYYY-MM-DD
  dueDate?: string;
  customer: CustomerInfo;
  items: SaleItemLine[];
  subtotal: number;
  discount: number;
  taxRate: number; // e.g. 18 for 18% GST or 0
  taxAmount: number;
  grandTotal: number;
  paymentStatus: "Paid" | "Partial" | "Unpaid";
  paymentMode: PaymentMode;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  termsAndConditions?: string;
  recordedInLedger: boolean;
  createdAt: Date;
  updatedAt: Date;
}

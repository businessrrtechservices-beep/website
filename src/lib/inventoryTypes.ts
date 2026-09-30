export interface InventoryCategory {
  id: string;
  name: string;
  subcategories: string[];
}

export interface StockAllocationRecord {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  serialNumbers?: string[];
  date: string;
  sellingPrice: number;
  notes?: string;
}

export interface LaptopSpecs {
  processor?: string;
  ram?: string;
  storage?: string;
  screenSize?: string;
  graphics?: string;
  color?: string;
  batteryHealth?: string;
  warrantyPeriod?: string;
}

export interface InventoryItem {
  id: string;
  code: string; // Auto-generated code starting with "RRTS-" (e.g. RRTS-ITM-1001)
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  condition: "Brand New" | "Refurbished A-Grade" | "Refurbished B-Grade" | "Used";
  serialNumbers: string[]; // Serial numbers for individual units (e.g., for laptops, motherboard chips, SSDs)
  specs?: LaptopSpecs;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number; // Total units purchased/stocked
  availableQuantity: number; // Units currently in stock (stockQuantity - total allocated)
  allocatedRecords: StockAllocationRecord[]; // Audit trail: which customer/invoice holds each allocated unit
  dealerId?: string; // Linked dealer / supplier ID
  dealerName?: string; // Linked dealer name
  boughtOnCredit?: boolean; // Whether stock was procured on credit (supplier debt)
  location?: string; // Shelf / Rack (e.g. "Rack A-2")
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

import { getMongoDb } from "./mongodb";
import { Invoice, SaleItemLine } from "./salesTypes";
import { allocateStockItem } from "./inventoryDb";
import { createTransaction } from "./ledgerDb";

const COLLECTION_NAME = "sales_invoices";

/**
 * Generate next unique invoice number, e.g. RRTS-INV-1001
 */
export async function generateNextInvoiceNumber(): Promise<string> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<Invoice>(COLLECTION_NAME);

    const regex = /^RRTS-INV-(\d+)$/;
    const invoices = await collection
      .find({ invoiceNumber: { $regex: regex } })
      .project({ invoiceNumber: 1 })
      .toArray();

    let maxNum = 1000;
    for (const inv of invoices) {
      const match = inv.invoiceNumber?.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `RRTS-INV-${maxNum + 1}`;
  } catch {
    return `RRTS-INV-${Date.now().toString().slice(-4)}`;
  }
}

/**
 * Create a new customer sale & invoice:
 * 1. Inserts invoice into sales_invoices
 * 2. Allocates stock from inventory (decrements available quantity and logs customer allocation audit trail)
 * 3. Credits payment to wallet ledger if recordedInLedger is true and amountPaid > 0
 */
export async function createInvoice(
  data: Omit<Invoice, "id" | "createdAt" | "updatedAt"> & {
    invoiceNumber?: string;
  }
): Promise<Invoice> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);

  const invoiceNumber = data.invoiceNumber?.trim() || (await generateNextInvoiceNumber());

  const newInvoice: Invoice = {
    ...data,
    id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    invoiceNumber,
    subtotal: Number(data.subtotal) || 0,
    discount: Number(data.discount) || 0,
    taxRate: Number(data.taxRate) || 0,
    taxAmount: Number(data.taxAmount) || 0,
    grandTotal: Number(data.grandTotal) || 0,
    amountPaid: Number(data.amountPaid) || 0,
    balanceDue: Number(data.balanceDue) || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 1. Save invoice
  await collection.insertOne(newInvoice as any);

  // 2. Allocate inventory stock and update customer allocation records
  for (const item of newInvoice.items) {
    if (item.itemId) {
      await allocateStockItem(item.itemId, {
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        customerName: newInvoice.customer.name,
        customerPhone: newInvoice.customer.phone,
        quantity: item.quantity,
        serialNumbers: item.serialNumbers,
        date: newInvoice.date,
        sellingPrice: item.unitPrice,
        notes: `Sold via Invoice ${newInvoice.invoiceNumber}`,
      });
    }
  }

  // 3. Automatically record into Wallet Ledger if paid/partial and requested
  if (newInvoice.recordedInLedger && newInvoice.amountPaid > 0) {
    const itemsDescription = newInvoice.items.map((i) => `${i.quantity}x ${i.itemName}`).join(", ");
    await createTransaction({
      type: "credit",
      amount: newInvoice.amountPaid,
      paymentMode: newInvoice.paymentMode || "Cash",
      category: "Sale",
      reason: `Invoice ${newInvoice.invoiceNumber} - ${newInvoice.customer.name} (${itemsDescription})`,
      referenceNumber: newInvoice.invoiceNumber,
      date: newInvoice.date,
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
    });
  }

  return newInvoice;
}

export async function getInvoices(options?: {
  search?: string;
  paymentStatus?: string;
  limit?: number;
}): Promise<Invoice[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(COLLECTION_NAME);

    const query: any = {};
    if (options?.paymentStatus && options.paymentStatus !== "all") {
      query.paymentStatus = options.paymentStatus;
    }
    if (options?.search) {
      const term = options.search.trim();
      query.$or = [
        { invoiceNumber: { $regex: term, $options: "i" } },
        { "customer.name": { $regex: term, $options: "i" } },
        { "customer.phone": { $regex: term, $options: "i" } },
        { "items.itemName": { $regex: term, $options: "i" } },
        { "items.itemCode": { $regex: term, $options: "i" } },
      ];
    }

    const items = await collection
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(options?.limit || 100)
      .toArray();

    return items.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching invoices from Cloud MongoDB:", error);
    return [];
  }
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(COLLECTION_NAME);
    const doc = await collection.findOne({
      $or: [{ id }, { _id: id } as any, { invoiceNumber: id }],
    });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, id: rest.id || _id.toString() };
  } catch {
    return null;
  }
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);
  const result = await collection.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}

import { getMongoDb } from "./mongodb";
import { Dealer, DealerTransaction } from "./dealerTypes";
import { parseToISTIsoString, getNowISTIsoString } from "./dateUtils";

const DEALERS_COLLECTION = "dealers";
const DEALER_TX_COLLECTION = "dealer_transactions";

export async function getDealers(): Promise<Dealer[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(DEALERS_COLLECTION);

    const items = await collection.find({}).sort({ updatedAt: -1, createdAt: -1 }).toArray();
    return items.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
      totalPurchased: rest.totalPurchased || 0,
      totalPaid: rest.totalPaid || 0,
      outstandingBalance: (rest.totalPurchased || 0) - (rest.totalPaid || 0),
    }));
  } catch (error) {
    console.error("Error fetching dealers from Cloud MongoDB:", error);
    return [];
  }
}

export async function getDealerById(id: string): Promise<Dealer | null> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(DEALERS_COLLECTION);
    const doc = await collection.findOne({ $or: [{ id }, { _id: id } as any] });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return {
      ...rest,
      id: rest.id || _id.toString(),
      totalPurchased: rest.totalPurchased || 0,
      totalPaid: rest.totalPaid || 0,
      outstandingBalance: (rest.totalPurchased || 0) - (rest.totalPaid || 0),
    };
  } catch {
    return null;
  }
}

export async function createDealer(
  data: Omit<Dealer, "id" | "createdAt" | "updatedAt" | "totalPurchased" | "totalPaid" | "outstandingBalance">
): Promise<Dealer> {
  const db = await getMongoDb();
  const collection = db.collection<any>(DEALERS_COLLECTION);

  const newDealer: Dealer = {
    ...data,
    id: `DLR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    totalPurchased: 0,
    totalPaid: 0,
    outstandingBalance: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await collection.insertOne(newDealer as any);
  return newDealer;
}

export async function updateDealer(id: string, updates: Partial<Dealer>): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(DEALERS_COLLECTION);

  const result = await collection.updateOne(
    { $or: [{ id }, { _id: id } as any] },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return result.matchedCount > 0;
}

/**
 * Record a purchase from dealer (bought on credit / procurement)
 * Automatically writes to dealer credit history
 */
export async function recordDealerPurchase(
  dealerId: string,
  amount: number,
  details?: {
    description?: string;
    itemId?: string;
    itemCode?: string;
    referenceNumber?: string;
    date?: string;
  }
): Promise<boolean> {
  const db = await getMongoDb();
  const dealersCol = db.collection<any>(DEALERS_COLLECTION);
  const txCol = db.collection<any>(DEALER_TX_COLLECTION);

  const dealer = await dealersCol.findOne({ $or: [{ id: dealerId }, { _id: dealerId } as any] });
  if (!dealer) return false;

  const prevBalance = (dealer.totalPurchased || 0) - (dealer.totalPaid || 0);
  const newBalance = prevBalance + amount;

  // 1. Update dealer balances
  await dealersCol.updateOne(
    { _id: dealer._id },
    {
      $inc: { totalPurchased: amount, outstandingBalance: amount },
      $set: { updatedAt: new Date() },
    }
  );

  // 2. Insert transaction into dealer credit history
  const tx: DealerTransaction = {
    id: `DTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dealerId: dealer.id || dealer._id.toString(),
    dealerName: dealer.name,
    type: "credit_purchase",
    amount,
    date: details?.date ? parseToISTIsoString(details.date) : getNowISTIsoString(),
    description: details?.description || `Stock Purchase on Credit (${details?.itemCode || "Inventory"})`,
    itemId: details?.itemId,
    itemCode: details?.itemCode,
    referenceNumber: details?.referenceNumber,
    balanceAfter: newBalance,
    createdAt: new Date(),
  };

  await txCol.insertOne(tx as any);
  return true;
}

/**
 * Record payment to dealer (settling debt / credit)
 * Automatically writes to dealer credit history
 */
export async function recordDealerPayment(
  dealerId: string,
  amount: number,
  details?: {
    paymentMode?: string;
    referenceNumber?: string;
    description?: string;
    date?: string;
  }
): Promise<boolean> {
  const db = await getMongoDb();
  const dealersCol = db.collection<any>(DEALERS_COLLECTION);
  const txCol = db.collection<any>(DEALER_TX_COLLECTION);

  const dealer = await dealersCol.findOne({ $or: [{ id: dealerId }, { _id: dealerId } as any] });
  if (!dealer) return false;

  const prevBalance = (dealer.totalPurchased || 0) - (dealer.totalPaid || 0);
  const newBalance = Math.max(0, prevBalance - amount);

  // 1. Update dealer balances
  await dealersCol.updateOne(
    { _id: dealer._id },
    {
      $inc: { totalPaid: amount, outstandingBalance: -amount },
      $set: { updatedAt: new Date() },
    }
  );

  // 2. Insert transaction into dealer credit history
  const tx: DealerTransaction = {
    id: `DTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dealerId: dealer.id || dealer._id.toString(),
    dealerName: dealer.name,
    type: "payment",
    amount,
    paymentMode: details?.paymentMode || "Cash",
    date: details?.date ? parseToISTIsoString(details.date) : getNowISTIsoString(),
    description: details?.description || `Debt Payment to ${dealer.name}`,
    referenceNumber: details?.referenceNumber,
    balanceAfter: newBalance,
    createdAt: new Date(),
  };

  await txCol.insertOne(tx as any);
  return true;
}

/**
 * Fetch credit and payment history for a specific dealer or all dealers
 */
export async function getDealerTransactions(dealerId?: string): Promise<DealerTransaction[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(DEALER_TX_COLLECTION);

    const query: any = {};
    if (dealerId && dealerId !== "all") {
      query.dealerId = dealerId;
    }

    const items = await collection.find(query).sort({ date: -1, createdAt: -1 }).toArray();
    return items.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching dealer transactions from Cloud MongoDB:", error);
    return [];
  }
}

export async function deleteDealer(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(DEALERS_COLLECTION);
  const txCol = db.collection<any>(DEALER_TX_COLLECTION);

  await txCol.deleteMany({ dealerId: id });
  const result = await collection.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}

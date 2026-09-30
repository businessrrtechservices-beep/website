import { getMongoDb } from "./mongodb";
import { Dealer } from "./dealerTypes";

const COLLECTION_NAME = "dealers";

export async function getDealers(): Promise<Dealer[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(COLLECTION_NAME);

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
    const collection = db.collection<any>(COLLECTION_NAME);
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
  const collection = db.collection<any>(COLLECTION_NAME);

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
  const collection = db.collection<any>(COLLECTION_NAME);

  const result = await collection.updateOne(
    { $or: [{ id }, { _id: id } as any] },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return result.matchedCount > 0;
}

export async function recordDealerPurchase(dealerId: string, amount: number): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);
  const result = await collection.updateOne(
    { $or: [{ id: dealerId }, { _id: dealerId } as any] },
    {
      $inc: { totalPurchased: amount, outstandingBalance: amount },
      $set: { updatedAt: new Date() },
    }
  );
  return result.matchedCount > 0;
}

export async function recordDealerPayment(dealerId: string, amount: number): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);
  const result = await collection.updateOne(
    { $or: [{ id: dealerId }, { _id: dealerId } as any] },
    {
      $inc: { totalPaid: amount, outstandingBalance: -amount },
      $set: { updatedAt: new Date() },
    }
  );
  return result.matchedCount > 0;
}

export async function deleteDealer(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);
  const result = await collection.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}

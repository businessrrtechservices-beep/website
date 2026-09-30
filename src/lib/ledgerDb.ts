import { getMongoDb } from "./mongodb";
import { WalletTransaction, WalletSummary } from "./ledgerTypes";
import { getISTDateString, parseToISTIsoString, getNowISTIsoString } from "./dateUtils";

const COLLECTION_NAME = "wallet_transactions";

function getTodayRange(): { start: string; end: string } {
  const dateStr = getISTDateString();
  return {
    start: dateStr,
    end: `${dateStr}T23:59:59+05:30`,
  };
}

/**
 * Calculates current wallet balance and financial totals strictly from Cloud MongoDB
 */
export async function getWalletSummary(): Promise<WalletSummary> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(COLLECTION_NAME);

    const [creditAgg, debitAgg, todayCreditAgg, todayDebitAgg, count] = await Promise.all([
      collection
        .aggregate([
          { $match: { type: "credit" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
      collection
        .aggregate([
          { $match: { type: "debit" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
      collection
        .aggregate([
          {
            $match: {
              type: "credit",
              date: { $gte: getTodayRange().start.substring(0, 10) },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
      collection
        .aggregate([
          {
            $match: {
              type: "debit",
              date: { $gte: getTodayRange().start.substring(0, 10) },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
      collection.countDocuments(),
    ]);

    const totalCredit = creditAgg[0]?.total || 0;
    const totalDebit = debitAgg[0]?.total || 0;
    const todayCredit = todayCreditAgg[0]?.total || 0;
    const todayDebit = todayDebitAgg[0]?.total || 0;

    return {
      balance: totalCredit - totalDebit,
      totalCredit,
      totalDebit,
      todayCredit,
      todayDebit,
      transactionCount: count,
    };
  } catch (error) {
    console.error("Error computing wallet summary from Cloud MongoDB:", error);
    return {
      balance: 0,
      totalCredit: 0,
      totalDebit: 0,
      todayCredit: 0,
      todayDebit: 0,
      transactionCount: 0,
    };
  }
}

/**
 * Fetch transaction history with optional type filter or search
 */
export async function getTransactions(options?: {
  type?: "credit" | "debit" | "all";
  search?: string;
  limit?: number;
}): Promise<WalletTransaction[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(COLLECTION_NAME);

    const query: any = {};
    if (options?.type && options.type !== "all") {
      query.type = options.type;
    }

    if (options?.search) {
      const term = options.search.trim();
      query.$or = [
        { reason: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { referenceNumber: { $regex: term, $options: "i" } },
        { invoiceNumber: { $regex: term, $options: "i" } },
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
    console.error("Error fetching transactions from Cloud MongoDB:", error);
    return [];
  }
}

/**
 * Create a new credit or debit transaction in the ledger
 */
export async function createTransaction(
  data: Omit<WalletTransaction, "id" | "createdAt">
): Promise<WalletTransaction> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);

  const txDate = data.date ? parseToISTIsoString(data.date) : getNowISTIsoString();

  const newTx: WalletTransaction = {
    ...data,
    id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    amount: Number(data.amount) || 0,
    date: txDate,
    createdAt: new Date(),
  };

  await collection.insertOne(newTx as any);
  return newTx;
}

/**
 * Delete a transaction by ID
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);
  const result = await collection.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}

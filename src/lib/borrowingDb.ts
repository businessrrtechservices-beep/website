import { getMongoDb } from "./mongodb";
import { PartnerWallet, BorrowingTransaction, BorrowingType } from "./borrowingTypes";
import { createTransaction } from "./ledgerDb";
import { PaymentMode } from "./ledgerTypes";

const WALLETS_COLLECTION = "partner_wallets";
const TRANSACTIONS_COLLECTION = "borrowing_transactions";

export const INITIAL_PARTNERS: Array<{ id: string; name: string }> = [
  { id: "nauman", name: "Nauman" },
  { id: "dinesh", name: "Dinesh" },
  { id: "subhan", name: "Subhan" },
];

/**
 * Initializes or fetches the 3 partner wallets (Nauman, Dinesh, Subhan) strictly from Cloud MongoDB
 */
export async function getPartnerWallets(): Promise<PartnerWallet[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(WALLETS_COLLECTION);

    // Ensure all 3 initial partners exist
    for (const p of INITIAL_PARTNERS) {
      const exists = await collection.findOne({ id: p.id });
      if (!exists) {
        await collection.insertOne({
          id: p.id,
          name: p.name,
          currentBorrowedBalance: 0,
          totalBorrowed: 0,
          totalRepaid: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const items = await collection.find({}).sort({ createdAt: 1 }).toArray();
    return items.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
      currentBorrowedBalance: rest.currentBorrowedBalance || 0,
      totalBorrowed: rest.totalBorrowed || 0,
      totalRepaid: rest.totalRepaid || 0,
    }));
  } catch (error) {
    console.error("Error fetching partner wallets from Cloud MongoDB:", error);
    return INITIAL_PARTNERS.map((p) => ({
      id: p.id,
      name: p.name,
      currentBorrowedBalance: 0,
      totalBorrowed: 0,
      totalRepaid: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
}

/**
 * Record a borrow or repayment transaction:
 * - If borrow:
 *   - Partner wallet borrowed balance increases (+amount)
 *   - Main wallet receives CREDIT (+amount)
 * - If repayment:
 *   - Partner wallet borrowed balance decreases (-amount)
 *   - Main wallet records DEBIT (-amount)
 */
export async function recordPartnerTransaction(data: {
  partnerId: string;
  type: BorrowingType;
  amount: number;
  paymentMode: PaymentMode;
  date?: string;
  reason?: string;
  referenceNumber?: string;
  syncMainLedger?: boolean;
}): Promise<BorrowingTransaction> {
  const db = await getMongoDb();
  const walletsCol = db.collection<any>(WALLETS_COLLECTION);
  const txCol = db.collection<any>(TRANSACTIONS_COLLECTION);

  // 1. Fetch partner
  const partner = await walletsCol.findOne({ id: data.partnerId });
  const partnerName = partner?.name || data.partnerId;
  const amount = Number(data.amount) || 0;
  const txDate = data.date || new Date().toISOString();

  // 2. Sync with Main Wallet Ledger if requested (default true)
  let mainLedgerTxId: string | undefined = undefined;
  if (data.syncMainLedger !== false) {
    const isBorrow = data.type === "borrow";
    const mainTx = await createTransaction({
      type: isBorrow ? "credit" : "debit",
      amount,
      paymentMode: data.paymentMode || "Cash",
      category: isBorrow ? "Partner Borrowing" : "Partner Repayment",
      reason: isBorrow
        ? `Borrowed from ${partnerName}${data.reason ? `: ${data.reason}` : ""}`
        : `Repaid to ${partnerName}${data.reason ? `: ${data.reason}` : ""}`,
      referenceNumber: data.referenceNumber || "",
      date: txDate,
    });
    mainLedgerTxId = mainTx.id;
  }

  // 3. Create borrowing transaction
  const newTx: BorrowingTransaction = {
    id: `BORROW-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    partnerId: data.partnerId,
    partnerName,
    type: data.type,
    amount,
    paymentMode: data.paymentMode,
    date: txDate,
    reason: data.reason || (data.type === "borrow" ? "Capital borrowed" : "Loan repayment"),
    referenceNumber: data.referenceNumber,
    mainLedgerTxId,
    createdAt: new Date(),
  };

  await txCol.insertOne(newTx as any);

  // 4. Update Partner Wallet balance
  const updateQuery: any = { $set: { updatedAt: new Date() } };
  if (data.type === "borrow") {
    updateQuery.$inc = {
      totalBorrowed: amount,
      currentBorrowedBalance: amount,
    };
  } else {
    updateQuery.$inc = {
      totalRepaid: amount,
      currentBorrowedBalance: -amount,
    };
  }

  await walletsCol.updateOne({ id: data.partnerId }, updateQuery);

  return newTx;
}

/**
 * Fetch all borrowing transactions or filter by partner
 */
export async function getBorrowingTransactions(
  partnerId?: string
): Promise<BorrowingTransaction[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(TRANSACTIONS_COLLECTION);

    const query: any = {};
    if (partnerId && partnerId !== "all") {
      query.partnerId = partnerId;
    }

    const items = await collection.find(query).sort({ date: -1, createdAt: -1 }).toArray();
    return items.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching borrowing transactions from Cloud MongoDB:", error);
    return [];
  }
}

/**
 * Delete a borrowing transaction and reverse its balance impact
 */
export async function deleteBorrowingTransaction(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const txCol = db.collection<any>(TRANSACTIONS_COLLECTION);
  const walletsCol = db.collection<any>(WALLETS_COLLECTION);

  const tx = await txCol.findOne({ $or: [{ id }, { _id: id } as any] });
  if (!tx) return false;

  // Reverse balance in partner wallet
  const reverseQuery: any = { $set: { updatedAt: new Date() } };
  if (tx.type === "borrow") {
    reverseQuery.$inc = {
      totalBorrowed: -tx.amount,
      currentBorrowedBalance: -tx.amount,
    };
  } else {
    reverseQuery.$inc = {
      totalRepaid: -tx.amount,
      currentBorrowedBalance: tx.amount,
    };
  }

  await walletsCol.updateOne({ id: tx.partnerId }, reverseQuery);
  const result = await txCol.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}

import { getMongoDb } from "./mongodb";
import { PartnerWallet, BorrowingTransaction, BorrowingType } from "./borrowingTypes";
import { createTransaction } from "./ledgerDb";
import { PaymentMode } from "./ledgerTypes";
import { parseToISTIsoString, getNowISTIsoString } from "./dateUtils";

const WALLETS_COLLECTION = "partner_wallets";
const TRANSACTIONS_COLLECTION = "borrowing_transactions";

/**
 * Fetches all partner wallets strictly from Cloud MongoDB (no hardcoded partners)
 */
export async function getPartnerWallets(): Promise<PartnerWallet[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(WALLETS_COLLECTION);

    const items = await collection.find({}).sort({ createdAt: 1 }).toArray();
    return items.map(({ _id, ...rest }) => {
      const currentBorrowedBalance = Number(rest.currentBorrowedBalance) || 0;
      const currentInvestedBalance = Number(rest.currentInvestedBalance) || 0;
      return {
        ...rest,
        id: rest.id || _id.toString(),
        currentBorrowedBalance,
        totalBorrowed: Number(rest.totalBorrowed) || 0,
        totalRepaid: Number(rest.totalRepaid) || 0,
        currentInvestedBalance,
        totalInvested: Number(rest.totalInvested) || 0,
        totalInvestmentWithdrawn: Number(rest.totalInvestmentWithdrawn) || 0,
        totalNetContribution: currentBorrowedBalance + currentInvestedBalance,
      };
    });
  } catch (error) {
    console.error("Error fetching partner wallets from Cloud MongoDB:", error);
    return [];
  }
}

export async function createPartnerWallet(data: {
  name: string;
  phone?: string;
  notes?: string;
}): Promise<PartnerWallet> {
  const db = await getMongoDb();
  const collection = db.collection<any>(WALLETS_COLLECTION);

  const cleanId = data.name.toLowerCase().replace(/[^a-z0-9]/g, "-").trim() || `partner-${Date.now()}`;
  const newWallet: PartnerWallet = {
    id: cleanId,
    name: data.name.trim(),
    phone: data.phone?.trim(),
    notes: data.notes?.trim(),
    currentBorrowedBalance: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    currentInvestedBalance: 0,
    totalInvested: 0,
    totalInvestmentWithdrawn: 0,
    totalNetContribution: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await collection.insertOne(newWallet as any);
  return newWallet;
}

export async function deletePartnerWallet(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(WALLETS_COLLECTION);
  const result = await collection.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}

/**
 * Record a borrow, repayment, investment, or adjustment transaction:
 * - borrow: partner borrowed balance increases (+amount), main wallet credited (+amount)
 * - repayment: partner borrowed balance decreases (-amount), main wallet debited (-amount)
 * - investment: partner invested balance increases (+amount), main wallet credited (+amount)
 * - investment_withdrawal: partner invested balance decreases (-amount), main wallet debited (-amount)
 * - borrow_to_investment (Adjustment):
 *     borrowed balance decreases (-amount),
 *     invested balance increases (+amount),
 *     main wallet balance is UNCHANGED ("wallet same", because capital already exists in shop)
 * - investment_to_borrow (Adjustment):
 *     invested balance decreases (-amount),
 *     borrowed balance increases (+amount),
 *     main wallet balance is UNCHANGED
 */
export async function recordPartnerTransaction(data: {
  partnerId: string;
  type: BorrowingType;
  amount: number;
  paymentMode: PaymentMode;
  date?: string;
  reason?: string;
  referenceNumber?: string;
  proofUrl?: string;
  proofPublicId?: string;
  linkedTxId?: string;
  syncMainLedger?: boolean;
}): Promise<BorrowingTransaction> {
  const db = await getMongoDb();
  const walletsCol = db.collection<any>(WALLETS_COLLECTION);
  const txCol = db.collection<any>(TRANSACTIONS_COLLECTION);

  // 1. Fetch partner
  const partner = await walletsCol.findOne({ id: data.partnerId });
  const partnerName = partner?.name || data.partnerId;
  const amount = Number(data.amount) || 0;
  const txDate = data.date ? parseToISTIsoString(data.date) : getNowISTIsoString();

  // 2. Sync with Main Wallet Ledger if requested and if not a pure reclassification adjustment
  let mainLedgerTxId: string | undefined = undefined;
  const isAdjustment = data.type === "borrow_to_investment" || data.type === "investment_to_borrow";

  if (data.syncMainLedger !== false && !isAdjustment) {
    let ledgerType: "credit" | "debit" = "credit";
    let ledgerCategory = "Partner Borrowing";
    let defaultReason = "";

    switch (data.type) {
      case "borrow":
        ledgerType = "credit";
        ledgerCategory = "Partner Borrowing";
        defaultReason = `Borrowed from ${partnerName}`;
        break;
      case "repayment":
        ledgerType = "debit";
        ledgerCategory = "Partner Repayment";
        defaultReason = `Repaid to ${partnerName}`;
        break;
      case "investment":
        ledgerType = "credit";
        ledgerCategory = "Partner Investment";
        defaultReason = `Capital investment from ${partnerName}`;
        break;
      case "investment_withdrawal":
        ledgerType = "debit";
        ledgerCategory = "Owner Withdrawal";
        defaultReason = `Capital withdrawal by ${partnerName}`;
        break;
    }

    const mainTx = await createTransaction({
      type: ledgerType,
      amount,
      paymentMode: data.paymentMode || "Cash",
      category: ledgerCategory,
      reason: data.reason ? `${defaultReason}: ${data.reason}` : defaultReason,
      referenceNumber: data.referenceNumber || "",
      proofUrl: data.proofUrl,
      proofPublicId: data.proofPublicId,
      date: txDate,
    });
    mainLedgerTxId = mainTx.id;
  }

  // Determine standard reason if none provided
  let reasonText = data.reason?.trim();
  if (!reasonText) {
    if (data.type === "borrow") reasonText = "Capital loan borrowed";
    else if (data.type === "repayment") reasonText = "Loan repayment";
    else if (data.type === "investment") reasonText = "Direct equity investment";
    else if (data.type === "investment_withdrawal") reasonText = "Capital withdrawn";
    else if (data.type === "borrow_to_investment") reasonText = "Converted borrowing to equity investment";
    else if (data.type === "investment_to_borrow") reasonText = "Converted equity investment to repayable loan";
  }

  // 3. Create borrowing/investment transaction record
  const newTx: BorrowingTransaction = {
    id: `PARTNER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    partnerId: data.partnerId,
    partnerName,
    type: data.type,
    amount,
    paymentMode: data.paymentMode,
    date: txDate,
    reason: reasonText || "Partner transaction",
    referenceNumber: data.referenceNumber,
    proofUrl: data.proofUrl,
    proofPublicId: data.proofPublicId,
    linkedTxId: data.linkedTxId,
    mainLedgerTxId,
    createdAt: new Date(),
  };

  await txCol.insertOne(newTx as any);

  // 4. Update Partner Wallet balances in Cloud MongoDB
  const updateQuery: any = { $set: { updatedAt: new Date() } };

  switch (data.type) {
    case "borrow":
      updateQuery.$inc = {
        totalBorrowed: amount,
        currentBorrowedBalance: amount,
      };
      break;

    case "repayment":
      updateQuery.$inc = {
        totalRepaid: amount,
        currentBorrowedBalance: -amount,
      };
      break;

    case "investment":
      updateQuery.$inc = {
        totalInvested: amount,
        currentInvestedBalance: amount,
      };
      break;

    case "investment_withdrawal":
      updateQuery.$inc = {
        totalInvestmentWithdrawn: amount,
        currentInvestedBalance: -amount,
      };
      break;

    case "borrow_to_investment":
      // Reclassification: Borrow balance drops, Investment balance rises, Wallet unchanged!
      updateQuery.$inc = {
        totalRepaid: amount, // marks borrowed portion settled
        currentBorrowedBalance: -amount,
        totalInvested: amount,
        currentInvestedBalance: amount,
      };
      break;

    case "investment_to_borrow":
      updateQuery.$inc = {
        totalInvestmentWithdrawn: amount,
        currentInvestedBalance: -amount,
        totalBorrowed: amount,
        currentBorrowedBalance: amount,
      };
      break;
  }

  await walletsCol.updateOne({ id: data.partnerId }, updateQuery);

  return newTx;
}

/**
 * Fetch all partner transactions or filter by partner
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
 * Delete a borrowing or investment transaction and reverse its balance impact
 */
export async function deleteBorrowingTransaction(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const txCol = db.collection<any>(TRANSACTIONS_COLLECTION);
  const walletsCol = db.collection<any>(WALLETS_COLLECTION);

  const tx = await txCol.findOne({ $or: [{ id }, { _id: id } as any] });
  if (!tx) return false;

  const reverseQuery: any = { $set: { updatedAt: new Date() } };

  switch (tx.type) {
    case "borrow":
      reverseQuery.$inc = {
        totalBorrowed: -tx.amount,
        currentBorrowedBalance: -tx.amount,
      };
      break;

    case "repayment":
      reverseQuery.$inc = {
        totalRepaid: -tx.amount,
        currentBorrowedBalance: tx.amount,
      };
      break;

    case "investment":
      reverseQuery.$inc = {
        totalInvested: -tx.amount,
        currentInvestedBalance: -tx.amount,
      };
      break;

    case "investment_withdrawal":
      reverseQuery.$inc = {
        totalInvestmentWithdrawn: -tx.amount,
        currentInvestedBalance: tx.amount,
      };
      break;

    case "borrow_to_investment":
      reverseQuery.$inc = {
        totalRepaid: -tx.amount,
        currentBorrowedBalance: tx.amount,
        totalInvested: -tx.amount,
        currentInvestedBalance: -tx.amount,
      };
      break;

    case "investment_to_borrow":
      reverseQuery.$inc = {
        totalInvestmentWithdrawn: -tx.amount,
        currentInvestedBalance: tx.amount,
        totalBorrowed: -tx.amount,
        currentBorrowedBalance: -tx.amount,
      };
      break;
  }

  await walletsCol.updateOne({ id: tx.partnerId }, reverseQuery);
  const result = await txCol.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}

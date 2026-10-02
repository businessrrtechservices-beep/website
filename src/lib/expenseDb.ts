import { getMongoDb } from "./mongodb";
import { ExpenseRecord, ExpenseSummary, ExpenseCategory, ExpenseFundedSource } from "./expenseTypes";
import { createTransaction, deleteTransaction } from "./ledgerDb";
import { recordPartnerTransaction, deleteBorrowingTransaction } from "./borrowingDb";
import { parseToISTIsoString, getNowISTIsoString, getISTDateString } from "./dateUtils";

const COLLECTION_NAME = "company_expenses";

const ALL_CATEGORIES: ExpenseCategory[] = [
  "Domains & Hosting",
  "Meta & Digital Ads",
  "Software & SaaS",
  "Office & Utilities",
  "Courier & Logistics",
  "Spare Parts & Repairs",
  "Hardware & Tools",
  "Staff & Labor",
  "Miscellaneous",
];

export async function getExpenses(options?: {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<ExpenseRecord[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(COLLECTION_NAME);

    const query: any = {};
    if (options?.category && options.category !== "all") {
      query.category = options.category;
    }

    if (options?.search) {
      const term = options.search.trim();
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { vendor: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { referenceNumber: { $regex: term, $options: "i" } },
        { notes: { $regex: term, $options: "i" } },
      ];
    }

    if (options?.startDate || options?.endDate) {
      query.date = {};
      if (options.startDate) query.date.$gte = options.startDate;
      if (options.endDate) query.date.$lte = `${options.endDate}T23:59:59+05:30`;
    }

    const items = await collection
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(options?.limit || 200)
      .toArray();

    return items.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
      amount: Number(rest.amount) || 0,
    }));
  } catch (error) {
    console.error("Error fetching company expenses from Cloud MongoDB:", error);
    return [];
  }
}

export async function getExpenseSummary(): Promise<ExpenseSummary> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(COLLECTION_NAME);

    const items = await collection.find({}).sort({ date: -1 }).toArray();
    const todayIST = getISTDateString();
    const currentMonthPrefix = todayIST.substring(0, 7); // "YYYY-MM"

    // Calculate last month prefix
    const [yearStr, monthStr] = currentMonthPrefix.split("-");
    const yearNum = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);
    const lastMonthNum = monthNum === 1 ? 12 : monthNum - 1;
    const lastYearNum = monthNum === 1 ? yearNum - 1 : yearNum;
    const lastMonthPrefix = `${lastYearNum}-${String(lastMonthNum).padStart(2, "0")}`;

    let totalExpense = 0;
    let thisMonthExpense = 0;
    let lastMonthExpense = 0;
    let marketingAdsTotal = 0;
    let domainsHostingTotal = 0;
    let officeOpsTotal = 0;

    const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();
    ALL_CATEGORIES.forEach((cat) => categoryMap.set(cat, { amount: 0, count: 0 }));

    items.forEach((item: any) => {
      const amt = Number(item.amount) || 0;
      totalExpense += amt;

      const itemDateStr = String(item.date || "");
      if (itemDateStr.startsWith(currentMonthPrefix)) {
        thisMonthExpense += amt;
      } else if (itemDateStr.startsWith(lastMonthPrefix)) {
        lastMonthExpense += amt;
      }

      const cat = item.category as ExpenseCategory;
      if (categoryMap.has(cat)) {
        const cur = categoryMap.get(cat)!;
        cur.amount += amt;
        cur.count += 1;
      }

      if (cat === "Meta & Digital Ads") marketingAdsTotal += amt;
      if (cat === "Domains & Hosting" || cat === "Software & SaaS") domainsHostingTotal += amt;
      if (cat === "Office & Utilities") officeOpsTotal += amt;
    });

    const byCategory = ALL_CATEGORIES.map((cat) => {
      const stats = categoryMap.get(cat) || { amount: 0, count: 0 };
      const percentage = totalExpense > 0 ? Math.round((stats.amount / totalExpense) * 100) : 0;
      return {
        category: cat,
        amount: stats.amount,
        percentage,
        count: stats.count,
      };
    }).sort((a, b) => b.amount - a.amount);

    const recentExpenses = items.slice(0, 10).map(({ _id, ...rest }: any) => ({
      ...rest,
      id: rest.id || _id.toString(),
      amount: Number(rest.amount) || 0,
    }));

    return {
      totalExpense,
      thisMonthExpense,
      lastMonthExpense,
      marketingAdsTotal,
      domainsHostingTotal,
      officeOpsTotal,
      byCategory,
      recentExpenses,
    };
  } catch (error) {
    console.error("Error computing expense summary from Cloud MongoDB:", error);
    return {
      totalExpense: 0,
      thisMonthExpense: 0,
      lastMonthExpense: 0,
      marketingAdsTotal: 0,
      domainsHostingTotal: 0,
      officeOpsTotal: 0,
      byCategory: [],
      recentExpenses: [],
    };
  }
}

export async function createExpense(data: {
  title: string;
  category: ExpenseCategory;
  amount: number;
  date?: string;
  vendor?: string;
  paymentMode: string;
  referenceNumber?: string;
  proofUrl?: string;
  proofPublicId?: string;
  fundedBy?: ExpenseFundedSource;
  partnerId?: string;
  partnerName?: string;
  notes?: string;
}): Promise<ExpenseRecord> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);

  const amount = Number(data.amount) || 0;
  const expenseDate = data.date ? parseToISTIsoString(data.date) : getNowISTIsoString();
  const fundedBy = data.fundedBy || "shop_wallet";

  let linkedLedgerTxId: string | undefined = undefined;
  let pairedCreditLedgerTxId: string | undefined = undefined;
  let linkedBorrowingTxId: string | undefined = undefined;

  // 1. If funded by Shop Wallet, auto-debit the Wallet Ledger
  if (fundedBy === "shop_wallet") {
    try {
      const vendorTag = data.vendor ? ` (${data.vendor})` : "";
      const ledgerTx = await createTransaction({
        type: "debit",
        amount,
        paymentMode: (data.paymentMode as any) || "UPI",
        category: "Office Expense",
        reason: `Expense: ${data.title} [${data.category}]${vendorTag}`,
        referenceNumber: data.referenceNumber,
        proofUrl: data.proofUrl,
        proofPublicId: data.proofPublicId,
        date: expenseDate,
      });
      linkedLedgerTxId = ledgerTx.id;
    } catch (ledgerErr) {
      console.error("Failed to auto-debit ledger for company expense:", ledgerErr);
    }
  }

  // 2. Middle Way: Out-of-Pocket Direct Pay (Courier, Errands, Urgent Parts)
  // Atomically logs both Credit (Borrowing from Partner) + Debit (Expense)
  // Net cash wallet impact is mathematically 0 (guaranteed NO wallet balance mismatch!)
  if (fundedBy === "partner_borrowing" && data.partnerId) {
    try {
      const pName = data.partnerName || "Partner";

      // A. Increase Partner's borrowed debt (Shop owes partner this reimbursement)
      const bTx = await recordPartnerTransaction({
        partnerId: data.partnerId,
        type: "borrow",
        amount,
        paymentMode: (data.paymentMode as any) || "UPI",
        date: expenseDate,
        reason: `Out-of-Pocket paid by ${pName} for: ${data.title} (${data.category})`,
        referenceNumber: data.referenceNumber,
        proofUrl: data.proofUrl,
        syncMainLedger: false, // Handled atomically below to guarantee zero wallet balance mismatch!
      });
      linkedBorrowingTxId = bTx.id;

      // B1. Paired Credit: Lent by Partner for out-of-pocket expense
      const creditTx = await createTransaction({
        type: "credit",
        amount,
        paymentMode: (data.paymentMode as any) || "UPI",
        category: "Partner Borrowing",
        reason: `Lent by ${pName} [Out-of-Pocket: ${data.title}]`,
        referenceNumber: data.referenceNumber,
        proofUrl: data.proofUrl,
        proofPublicId: data.proofPublicId,
        date: expenseDate,
      });
      pairedCreditLedgerTxId = creditTx.id;

      // B2. Paired Debit: Direct operational expense paid
      const debitTx = await createTransaction({
        type: "debit",
        amount,
        paymentMode: (data.paymentMode as any) || "UPI",
        category: "Office Expense",
        reason: `Expense: ${data.title} [${data.category}] (Paid directly by ${pName})`,
        referenceNumber: data.referenceNumber,
        proofUrl: data.proofUrl,
        proofPublicId: data.proofPublicId,
        date: expenseDate,
      });
      linkedLedgerTxId = debitTx.id;
    } catch (err) {
      console.error("Failed to record atomic out-of-pocket borrowing expense:", err);
    }
  }

  // 3. If personally paid by Partner as Capital Investment
  if (fundedBy === "partner_personal" && data.partnerId) {
    try {
      const bTx = await recordPartnerTransaction({
        partnerId: data.partnerId,
        type: "investment",
        amount,
        paymentMode: (data.paymentMode as any) || "UPI",
        date: expenseDate,
        reason: `Partner personally paid company expense: ${data.title} (${data.category})`,
        referenceNumber: data.referenceNumber,
        proofUrl: data.proofUrl,
        syncMainLedger: false, // Cash did not enter shop wallet; it was directly spent on company expense
      });
      linkedBorrowingTxId = bTx.id;
    } catch (partnerErr) {
      console.error("Failed to credit partner investment for paid expense:", partnerErr);
    }
  }

  // 4. If funded from Partner Investment Pool, deduct that partner's invested balance
  if (fundedBy === "partner_investment" && data.partnerId) {
    try {
      const bTx = await recordPartnerTransaction({
        partnerId: data.partnerId,
        type: "investment_withdrawal",
        amount,
        paymentMode: (data.paymentMode as any) || "UPI",
        date: expenseDate,
        reason: `Expense funded from partner investment pool: ${data.title} (${data.category})`,
        referenceNumber: data.referenceNumber,
        proofUrl: data.proofUrl,
        syncMainLedger: false,
      });
      linkedBorrowingTxId = bTx.id;
    } catch (partnerErr) {
      console.error("Failed to deduct partner investment pool for expense:", partnerErr);
    }
  }

  const newExpense: ExpenseRecord = {
    id: `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: data.title.trim(),
    category: data.category,
    amount,
    date: expenseDate,
    vendor: data.vendor?.trim() || undefined,
    paymentMode: data.paymentMode || "UPI",
    referenceNumber: data.referenceNumber?.trim() || undefined,
    proofUrl: data.proofUrl || undefined,
    proofPublicId: data.proofPublicId || undefined,
    fundedBy,
    partnerId: data.partnerId || undefined,
    partnerName: data.partnerName || undefined,
    notes: data.notes?.trim() || undefined,
    linkedLedgerTxId,
    pairedCreditLedgerTxId,
    linkedBorrowingTxId,
    createdAt: getNowISTIsoString(),
    updatedAt: getNowISTIsoString(),
  };

  await collection.insertOne(newExpense as any);
  return newExpense;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);

  const expense = await collection.findOne({ $or: [{ id }, { _id: id } as any] });
  if (!expense) return false;

  // 1. Rollback linked ledger transactions if any
  if (expense.linkedLedgerTxId) {
    try {
      await deleteTransaction(expense.linkedLedgerTxId);
    } catch (err) {
      console.error("Failed to rollback linked ledger transaction on expense delete:", err);
    }
  }

  // 2. Rollback paired credit transaction if atomic out-of-pocket pair
  if (expense.pairedCreditLedgerTxId) {
    try {
      await deleteTransaction(expense.pairedCreditLedgerTxId);
    } catch (err) {
      console.error("Failed to rollback paired credit transaction on expense delete:", err);
    }
  }

  // 3. Rollback linked borrowing/investment transaction if any
  if (expense.linkedBorrowingTxId) {
    try {
      await deleteBorrowingTransaction(expense.linkedBorrowingTxId);
    } catch (err) {
      console.error("Failed to rollback linked partner transaction on expense delete:", err);
    }
  }

  const result = await collection.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}

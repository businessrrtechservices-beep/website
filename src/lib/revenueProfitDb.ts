import { getMongoDb } from "./mongodb";
import { getISTDateString, getISTWeekRange, getISTMonthRange, formatISTDate } from "./dateUtils";

export interface PeriodFinancialSummary {
  periodKey: "today" | "week" | "month" | "overall";
  periodTitle: string;
  periodSubtitle: string;
  grossSales: number; // Total sold at (selling price of invoices)
  inventoryCost: number; // Total purchased at (purchase price of sold units)
  grossProfit: number; // grossSales - inventoryCost
  otherExpenses: number; // Courier, petrol, travel, office, repair parts, general debits
  netProfit: number; // Actual what we got = grossSales - inventoryCost - otherExpenses
  cashCollected: number; // Cash actually collected on those invoices
  pendingDue: number; // Unpaid balance due from customers
  invoicesCount: number;
  unitsSoldCount: number;
  profitMarginPercent: number;
}

export interface RevenueProfitDashboardData {
  today: PeriodFinancialSummary;
  thisWeek: PeriodFinancialSummary;
  thisMonth: PeriodFinancialSummary;
  overall: PeriodFinancialSummary;
  updatedAt: string;
}

/**
 * Computes exact real-world revenue, inventory purchase cost (COGS), operating expenses,
 * and net profit ("Actual What We Got") for Today, This Week, This Month, and Overall.
 */
export async function getRevenueProfitAnalytics(): Promise<RevenueProfitDashboardData> {
  const db = await getMongoDb();
  const invoicesColl = db.collection<any>("sales_invoices");
  const itemsColl = db.collection<any>("inventory_items");
  const txColl = db.collection<any>("wallet_transactions");
  const expensesColl = db.collection<any>("company_expenses");

  // Current IST period ranges
  const todayStr = getISTDateString();
  const weekRange = getISTWeekRange();
  const monthRange = getISTMonthRange();

  // Fetch all necessary data in parallel
  const [allInvoices, allInventory, allTransactions, allExpenses] = await Promise.all([
    invoicesColl.find({}).toArray(),
    itemsColl.find({}).toArray(),
    txColl.find({ type: "debit" }).toArray(),
    expensesColl.find({ fundedBy: "partner_borrowing" }).toArray(),
  ]);

  // Build fast inventory item map: id -> itemDoc
  const inventoryMap = new Map<string, any>();
  for (const item of allInventory) {
    if (item.id) inventoryMap.set(item.id, item);
    if (item._id) inventoryMap.set(item._id.toString(), item);
  }

  // Helper to extract purchase cost for an invoice's items
  function calculateInvoiceInventoryCost(inv: any): number {
    let cost = 0;
    for (const line of inv.items || []) {
      const qty = Number(line.quantity) || 1;

      // 1. If line item has purchasePrice recorded
      if (typeof line.purchasePrice === "number" && line.purchasePrice > 0) {
        cost += line.purchasePrice * qty;
        continue;
      }

      // 2. Look up the inventory item
      const invItem = inventoryMap.get(line.itemId);
      if (invItem) {
        // If item has unitTracking, match units allocated to this invoice
        if (invItem.unitTracking && Array.isArray(invItem.unitTracking)) {
          const allocatedUnits = invItem.unitTracking.filter(
            (u: any) => u.allocatedInvoiceId === inv.id || u.allocatedInvoiceNumber === inv.invoiceNumber
          );
          if (allocatedUnits.length > 0) {
            const unitCostSum = allocatedUnits.reduce(
              (sum: number, u: any) => sum + (Number(u.purchasePrice) || Number(invItem.purchasePrice) || 0),
              0
            );
            cost += unitCostSum;
            continue;
          }
        }

        // Standard item purchase price
        const itemPurchasePrice = Number(invItem.purchasePrice) || 0;
        cost += itemPurchasePrice * qty;
      }
    }
    return cost;
  }

  // Filter helper by date string prefix or ISO format
  function isDateInRange(
    dateStr: string | undefined | null,
    filter: { type: "today" | "week" | "month" | "overall" }
  ): boolean {
    if (filter.type === "overall") return true;
    if (!dateStr) return false;
    const cleanDate = dateStr.slice(0, 10);

    if (filter.type === "today") {
      return cleanDate === todayStr;
    }
    if (filter.type === "week") {
      return cleanDate >= weekRange.start && cleanDate <= weekRange.end;
    }
    if (filter.type === "month") {
      return cleanDate.slice(0, 7) === monthRange.monthStr;
    }
    return true;
  }

  // Build summary for a given period
  function buildPeriodSummary(
    periodKey: "today" | "week" | "month" | "overall",
    periodTitle: string,
    periodSubtitle: string
  ): PeriodFinancialSummary {
    const periodInvoices = allInvoices.filter((inv) => isDateInRange(inv.date, { type: periodKey }));

    let grossSales = 0;
    let inventoryCost = 0;
    let cashCollected = 0;
    let pendingDue = 0;
    let unitsSoldCount = 0;

    for (const inv of periodInvoices) {
      grossSales += Number(inv.grandTotal) || 0;
      cashCollected += Number(inv.amountPaid) || 0;
      pendingDue += Number(inv.balanceDue) || 0;
      inventoryCost += calculateInvoiceInventoryCost(inv);
      unitsSoldCount += (inv.items || []).reduce(
        (sum: number, item: any) => sum + (Number(item.quantity) || 0),
        0
      );
    }

    const grossProfit = grossSales - inventoryCost;

    // Filter operating expenses (courier, petrol, shop, office, repairs, tools, ads)
    // Exclude stock purchase (already counted in inventory cost above), partner repayments, and owner withdrawals
    const periodDebits = allTransactions.filter((tx) => {
      if (!isDateInRange(tx.date, { type: periodKey })) return false;
      const cat = (tx.category || "").toLowerCase();
      // Exclude non-operational capital flows
      if (cat === "stock purchase") return false;
      if (cat === "partner repayment") return false;
      if (cat === "owner withdrawal") return false;
      return true;
    });

    let debitsTotal = periodDebits.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    // Also include partner out-of-pocket expenses for this period
    const periodPartnerExpenses = allExpenses.filter((exp) => isDateInRange(exp.date, { type: periodKey }));
    const partnerExpensesTotal = periodPartnerExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    const otherExpenses = debitsTotal + partnerExpensesTotal;
    const netProfit = grossProfit - otherExpenses;
    const profitMarginPercent = grossSales > 0 ? (netProfit / grossSales) * 100 : 0;

    return {
      periodKey,
      periodTitle,
      periodSubtitle,
      grossSales,
      inventoryCost,
      grossProfit,
      otherExpenses,
      netProfit,
      cashCollected,
      pendingDue,
      invoicesCount: periodInvoices.length,
      unitsSoldCount,
      profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
    };
  }

  const today = buildPeriodSummary("today", "Today's Revenue", formatISTDate(todayStr));
  const thisWeek = buildPeriodSummary(
    "week",
    "This Week's Revenue",
    `${formatISTDate(weekRange.start)} - ${formatISTDate(weekRange.end)}`
  );
  const thisMonth = buildPeriodSummary("month", "This Month's Revenue", monthRange.monthStr);
  const overall = buildPeriodSummary("overall", "Overall Revenue", "All-Time Lifetime Stats");

  return {
    today,
    thisWeek,
    thisMonth,
    overall,
    updatedAt: new Date().toISOString(),
  };
}

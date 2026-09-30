"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  RefreshCw,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
  Trash2,
  TrendingUp,
  TrendingDown,
  Truck,
  Users,
  X,
  Loader2,
} from "lucide-react";
import { WalletTransaction, WalletSummary, PaymentMode, TransactionType } from "@/lib/ledgerTypes";
import { Dealer } from "@/lib/dealerTypes";
import { getISTDateTimeLocal, formatISTDateTime, parseToISTIsoString } from "@/lib/dateUtils";

export default function AdminLedgerPage() {
  const [summary, setSummary] = useState<WalletSummary>({
    balance: 0,
    totalCredit: 0,
    totalDebit: 0,
    todayCredit: 0,
    todayDebit: 0,
    transactionCount: 0,
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New transaction form state
  const [formType, setFormType] = useState<TransactionType>("credit");
  const [formAmount, setFormAmount] = useState("");
  const [formPaymentMode, setFormPaymentMode] = useState<PaymentMode>("Cash");
  const [formCategory, setFormCategory] = useState("Sale");
  const [formReason, setFormReason] = useState("");
  const [formRef, setFormRef] = useState("");
  const [formDate, setFormDate] = useState(() => getISTDateTimeLocal());

  // Partner Borrowing / Repayment Flag
  const [isPartnerBorrowing, setIsPartnerBorrowing] = useState(false);
  const [partnerWallets, setPartnerWallets] = useState<{ id: string; name: string; currentBorrowedBalance?: number }[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [debitFlag, setDebitFlag] = useState<"borrower" | "dealer" | "expense">("dealer");

  // Dealer link
  const [selectedDealerId, setSelectedDealerId] = useState("");

  const fetchPartnerWallets = async () => {
    try {
      const res = await fetch("/api/borrowing");
      if (res.ok) {
        const data = await res.json();
        const list = data.wallets || [];
        setPartnerWallets(list);
        if (list.length > 0 && !selectedPartnerId) {
          setSelectedPartnerId(list[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load partner wallets:", err);
    }
  };

  const fetchDealers = async () => {
    try {
      const res = await fetch("/api/dealers");
      if (res.ok) {
        const data = await res.json();
        setDealers(data.dealers || []);
      }
    } catch (err) {
      console.error("Failed to load dealers:", err);
    }
  };

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/ledger", window.location.origin);
      if (filterType !== "all") url.searchParams.set("type", filterType);
      if (search.trim()) url.searchParams.set("search", search.trim());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
    fetchDealers();
    fetchPartnerWallets();
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLedger();
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    if (!formReason.trim()) {
      setError("Please enter a reason or description");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isPartnerBorrowing) {
        if (!selectedPartnerId) {
          throw new Error("Please select a partner wallet or create one in the Borrowing tab");
        }
        const pObj = partnerWallets.find((p) => p.id === selectedPartnerId);
        const pName = pObj?.name || selectedPartnerId;

        // Record borrowing / repayment transaction (syncs partner wallet + main wallet)
        const res = await fetch("/api/borrowing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerId: selectedPartnerId,
            type: formType === "credit" ? "borrow" : "repayment",
            amount: parseFloat(formAmount),
            paymentMode: formPaymentMode,
            date: parseToISTIsoString(formDate),
            reason: formReason.trim() || (formType === "credit" ? `Borrowed from ${pName}` : `Repaid to ${pName}`),
            referenceNumber: formRef.trim(),
            syncMainLedger: true,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to record borrowing transaction");
        }
      } else {
        const selectedDealer = dealers.find((d) => d.id === selectedDealerId);

        const res = await fetch("/api/ledger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: formType,
            amount: parseFloat(formAmount),
            paymentMode: formPaymentMode,
            category: formCategory,
            reason: formReason.trim(),
            referenceNumber: formRef.trim(),
            dealerId: selectedDealer?.id,
            dealerName: selectedDealer?.name,
            date: parseToISTIsoString(formDate),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to record transaction");
        }
      }

      // Reset form and reload
      setIsModalOpen(false);
      setFormAmount("");
      setFormReason("");
      setFormRef("");
      setSelectedDealerId("");
      setIsPartnerBorrowing(false);
      setFormDate(getISTDateTimeLocal());
      await fetchLedger();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction record?")) return;
    try {
      const res = await fetch(`/api/ledger/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchLedger();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span>Wallet &amp; Shop Ledger</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Live cashflow tracker, credits, debits &amp; automatic balance updates
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLedger}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => {
              setError(null);
              setFormDate(getISTDateTimeLocal());
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 p-2 bg-white/10 rounded-xl">
            <Wallet className="w-5 h-5 text-white/90" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">
            Wallet Balance
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-1">
            <span>₹</span>
            <span>{summary.balance.toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-1 text-[11px] text-blue-100/90 font-medium">
            Auto-calculated: Total Inflow minus Outflow
          </p>
        </div>

        {/* Total Inflow (Credits) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Inflow (Credit)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-600">
            +₹{summary.totalCredit.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-700">₹{summary.todayCredit.toLocaleString("en-IN")}</span>
            <span>received today</span>
          </div>
        </div>

        {/* Total Outflow (Debits) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Outflow (Debit)
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-rose-600">
            -₹{summary.totalDebit.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-rose-700">₹{summary.todayDebit.toLocaleString("en-IN")}</span>
            <span>spent today</span>
          </div>
        </div>

        {/* Today's Net Change */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Net Cash
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-xl sm:text-2xl font-black ${
              summary.todayCredit - summary.todayDebit >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {summary.todayCredit - summary.todayDebit >= 0 ? "+" : ""}
            ₹{(summary.todayCredit - summary.todayDebit).toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>{summary.transactionCount} total records</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterType === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({summary.transactionCount})
          </button>
          <button
            onClick={() => setFilterType("credit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              filterType === "credit"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            <ArrowDownLeft className="w-3 h-3" />
            Credits
          </button>
          <button
            onClick={() => setFilterType("debit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              filterType === "debit"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-rose-700"
            }`}
          >
            <ArrowUpRight className="w-3 h-3" />
            Debits
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reason, ref, invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">Transaction History</h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {transactions.length} entries
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>Loading ledger entries...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No transactions recorded yet</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Click &quot;Add Entry&quot; above to log a credit (sale, capital) or debit (stock buy, repair parts, bills).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description / Reason</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map((tx) => {
                  const isCredit = tx.type === "credit";
                  const formattedDate = formatISTDateTime(tx.date);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                            isCredit
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          )}
                          <span>{isCredit ? "CREDIT (+)" : "DEBIT (-)"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-semibold max-w-xs truncate">
                        {tx.reason}
                        {tx.invoiceNumber && (
                          <span className="ml-1.5 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-200">
                            Inv: {tx.invoiceNumber}
                          </span>
                        )}
                        {tx.dealerName && (
                          <span className="ml-1.5 text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-200 inline-flex items-center gap-0.5">
                            <Truck className="w-2.5 h-2.5" />
                            {tx.dealerName}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {tx.category || "General"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{tx.paymentMode}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {tx.referenceNumber || "-"}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-black text-sm whitespace-nowrap ${
                          isCredit ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Wallet Entry</h3>
                  <p className="text-xs text-slate-500 font-medium">Record a new credit or debit</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("credit");
                      setFormCategory("Sale");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      formType === "credit"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Credit (Cash In)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("debit");
                      setFormCategory("Stock Purchase");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      formType === "debit"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Debit (Cash Out)</span>
                  </button>
                </div>
              </div>

              {/* Amount & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="5000"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Mode *
                  </label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Debit 2-Flag System vs Credit Source */}
              {formType === "debit" ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Debit Purpose (2 Flags) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDebitFlag("borrower");
                          setIsPartnerBorrowing(true);
                          setSelectedDealerId("");
                          setFormCategory("Partner Repayment");
                          const curP = partnerWallets.find((p) => p.id === selectedPartnerId) || partnerWallets[0];
                          if (curP) {
                            setSelectedPartnerId(curP.id);
                            setFormReason(`Repayment to partner: ${curP.name}`);
                            if (curP.currentBorrowedBalance && curP.currentBorrowedBalance > 0) {
                              setFormAmount(String(curP.currentBorrowedBalance));
                            }
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center sm:flex-col justify-center gap-1.5 transition cursor-pointer text-left sm:text-center ${
                          debitFlag === "borrower"
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Users className="w-4 h-4 shrink-0" />
                        <span>Flag 1: Borrower Repayment</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDebitFlag("dealer");
                          setIsPartnerBorrowing(false);
                          setFormCategory("Stock Purchase");
                          const curD = dealers.find((d) => d.id === selectedDealerId) || dealers[0];
                          if (curD) {
                            setSelectedDealerId(curD.id);
                            setFormReason(`Payment to dealer: ${curD.name}`);
                            if (curD.outstandingBalance > 0) {
                              setFormAmount(String(curD.outstandingBalance));
                            }
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center sm:flex-col justify-center gap-1.5 transition cursor-pointer text-left sm:text-center ${
                          debitFlag === "dealer"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Truck className="w-4 h-4 shrink-0" />
                        <span>Flag 2: Dealer Credit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDebitFlag("expense");
                          setIsPartnerBorrowing(false);
                          setSelectedDealerId("");
                          setFormCategory("Spare Parts");
                          setFormReason("");
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center sm:flex-col justify-center gap-1.5 transition cursor-pointer text-left sm:text-center ${
                          debitFlag === "expense"
                            ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span>Shop Expense</span>
                      </button>
                    </div>
                  </div>

                  {/* Flag 1 Panel: Borrower Repayment */}
                  {debitFlag === "borrower" && (
                    <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900">
                          Select Partner to Repay:
                        </span>
                        <span className="text-[10.5px] text-blue-700 font-medium">
                          Decreases partner's borrowed debt towards ₹0
                        </span>
                      </div>
                      {partnerWallets.length === 0 ? (
                        <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                          No partner wallets found. Add a partner in the &ldquo;Borrowing&rdquo; section first.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {partnerWallets.map((p) => {
                            const isSelected = selectedPartnerId === p.id;
                            const balance = p.currentBorrowedBalance || 0;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPartnerId(p.id);
                                  setFormReason(`Repayment to partner: ${p.name}`);
                                  if (balance > 0) setFormAmount(String(balance));
                                }}
                                className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                    : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <div className="text-xs font-bold truncate">{p.name}</div>
                                <div className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-rose-600 font-semibold"}`}>
                                  Owed: ₹{balance.toLocaleString("en-IN")}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Flag 2 Panel: Dealer Credit Settlement */}
                  {debitFlag === "dealer" && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900">
                          Select Supplier / Dealer to Pay:
                        </span>
                        <span className="text-[10.5px] text-indigo-700 font-medium">
                          Settles debt for stock bought on credit
                        </span>
                      </div>
                      {dealers.length === 0 ? (
                        <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                          No dealers found. Add wholesale suppliers in the &ldquo;Dealers&rdquo; section.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <select
                            value={selectedDealerId}
                            onChange={(e) => {
                              const dId = e.target.value;
                              setSelectedDealerId(dId);
                              const d = dealers.find((x) => x.id === dId);
                              if (d) {
                                setFormReason(`Payment to dealer: ${d.name}`);
                                if (d.outstandingBalance > 0) {
                                  setFormAmount(String(d.outstandingBalance));
                                }
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            <option value="">-- Choose Dealer to Settle --</option>
                            {dealers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} &bull; Outstanding Debt: ₹{d.outstandingBalance.toLocaleString("en-IN")}
                              </option>
                            ))}
                          </select>
                          {selectedDealerId && (
                            <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-indigo-100">
                              <span className="text-slate-600">
                                Outstanding Credit:{" "}
                                <strong className="text-rose-600">
                                  ₹{dealers.find((d) => d.id === selectedDealerId)?.outstandingBalance.toLocaleString("en-IN") || 0}
                                </strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const bal = dealers.find((d) => d.id === selectedDealerId)?.outstandingBalance || 0;
                                  if (bal > 0) setFormAmount(String(bal));
                                }}
                                className="px-2.5 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold text-[10px] cursor-pointer"
                              >
                                Settle Full Amount (₹{dealers.find((d) => d.id === selectedDealerId)?.outstandingBalance.toLocaleString("en-IN") || 0})
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Credit (Cash In) Options */
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="partnerBorrowFlagCredit"
                        checked={isPartnerBorrowing}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsPartnerBorrowing(checked);
                          if (checked) {
                            setSelectedDealerId("");
                            setFormCategory("Partner Borrowing");
                            const curP = partnerWallets.find((p) => p.id === selectedPartnerId) || partnerWallets[0];
                            if (curP) {
                              setSelectedPartnerId(curP.id);
                              setFormReason(`Borrowed from ${curP.name}`);
                            }
                          } else {
                            setFormCategory("Sale");
                            setFormReason("");
                          }
                        }}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                      />
                      <label htmlFor="partnerBorrowFlagCredit" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Is this money borrowed from a Partner?
                      </label>
                    </div>
                  </div>

                  {isPartnerBorrowing && (
                    <div className="pt-2 border-t border-emerald-200/70 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Select Lending Partner:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {partnerWallets.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPartnerId(p.id);
                              setFormReason(`Borrowed from ${p.name}`);
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition cursor-pointer truncate ${
                              selectedPartnerId === p.id
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10.5px] text-slate-600">
                        Main wallet receives +₹{formAmount || "0"} &amp; partner borrowed balance increases.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {formType === "credit" ? (
                      <>
                        <option value="Sale">Sale (Laptop / Accessory)</option>
                        <option value="Repair Service">Repair Service Payment</option>
                        <option value="Capital Added">Capital / Investment Added</option>
                        <option value="Customer Advance">Customer Advance</option>
                        <option value="Other">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Stock Purchase">Stock / Accessory Purchase</option>
                        <option value="Spare Parts">Spare Parts (IC, Screen, SSD)</option>
                        <option value="Office Expense">Shop Rent / Electricity / Bills</option>
                        <option value="Owner Withdrawal">Owner Personal Withdrawal</option>
                        <option value="Tool Purchase">Tools &amp; Equipment</option>
                        <option value="Other">Other Expense</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Date &amp; Time (IST)
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormDate(getISTDateTimeLocal())}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                    >
                      Set to Now
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Reason / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bought 10 Logitech M170 Wireless Mice"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Reference / UTR */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reference / UTR / Cheque No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref 3294827491"
                  value={formRef}
                  onChange={(e) => setFormRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer flex items-center gap-1.5 ${
                    formType === "credit"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  } disabled:opacity-60`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Record {formType === "credit" ? "Credit" : "Debit"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

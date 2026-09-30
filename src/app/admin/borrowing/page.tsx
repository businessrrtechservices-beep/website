"use client";

import { useState, useEffect } from "react";
import {
  Handshake,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { PartnerWallet, BorrowingTransaction, BorrowingType } from "@/lib/borrowingTypes";
import { PaymentMode } from "@/lib/ledgerTypes";

export default function AdminBorrowingPage() {
  const [wallets, setWallets] = useState<PartnerWallet[]>([]);
  const [transactions, setTransactions] = useState<BorrowingTransaction[]>([]);
  const [summary, setSummary] = useState<any>({
    totalOutstanding: 0,
    totalBorrowedAll: 0,
    totalRepaidAll: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string>("all");

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPartnerId, setModalPartnerId] = useState("");
  const [modalType, setModalType] = useState<BorrowingType>("borrow");
  const [modalAmount, setModalAmount] = useState("");
  const [modalPaymentMode, setModalPaymentMode] = useState<PaymentMode>("Cash");
  const [modalReason, setModalReason] = useState("");
  const [modalRef, setModalRef] = useState("");
  const [modalDate, setModalDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [syncMainLedger, setSyncMainLedger] = useState(true);

  // New Partner Modal State
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerPhone, setNewPartnerPhone] = useState("");
  const [newPartnerNotes, setNewPartnerNotes] = useState("");
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBorrowingData = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/borrowing", window.location.origin);
      if (selectedPartnerFilter !== "all") {
        url.searchParams.set("partnerId", selectedPartnerFilter);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setWallets(data.wallets || []);
        setTransactions(data.transactions || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowingData();
  }, [selectedPartnerFilter]);

  const handleOpenActionModal = (partnerId: string, type: BorrowingType) => {
    setError(null);
    setModalPartnerId(partnerId);
    setModalType(type);
    setModalAmount("");
    setModalReason("");
    setModalRef("");
    setSyncMainLedger(true);
    setIsModalOpen(true);
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAmount || Number(modalAmount) <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/borrowing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: modalPartnerId,
          type: modalType,
          amount: parseFloat(modalAmount),
          paymentMode: modalPaymentMode,
          date: modalDate ? new Date(modalDate).toISOString() : new Date().toISOString(),
          reason: modalReason.trim(),
          referenceNumber: modalRef.trim(),
          syncMainLedger,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record transaction");
      }

      setIsModalOpen(false);
      await fetchBorrowingData();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this borrowing entry and reverse its balance?")) {
      return;
    }
    try {
      const res = await fetch(`/api/borrowing/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchBorrowingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim()) {
      setPartnerError("Partner name is required");
      return;
    }
    setPartnerSubmitting(true);
    setPartnerError(null);
    try {
      const res = await fetch("/api/borrowing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_partner",
          name: newPartnerName.trim(),
          phone: newPartnerPhone.trim(),
          notes: newPartnerNotes.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create partner wallet");
      }
      setIsAddPartnerOpen(false);
      setNewPartnerName("");
      setNewPartnerPhone("");
      setNewPartnerNotes("");
      await fetchBorrowingData();
    } catch (err: any) {
      setPartnerError(err.message || "Failed to create partner");
    } finally {
      setPartnerSubmitting(false);
    }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove partner account for "${name}"?`)) return;
    try {
      const res = await fetch(`/api/borrowing/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchBorrowingData();
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
            <Handshake className="w-5 h-5 text-blue-600" />
            <span>Borrowing &amp; Partner Wallets</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Manage borrowed funds &amp; repayments for Nauman, Dinesh &amp; Subhan with auto-sync to Main Wallet
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBorrowingData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => {
              setPartnerError(null);
              setIsAddPartnerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Partner Wallet</span>
          </button>

          {wallets.length > 0 && (
            <button
              onClick={() => handleOpenActionModal(wallets[0].id, "borrow")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Borrow / Repay</span>
            </button>
          )}
        </div>
      </div>

      {/* Partner Wallet Cards */}
      {wallets.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-slate-200 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No partner accounts added yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &ldquo;Add Partner Wallet&rdquo; above to manually add partners (e.g. Nauman, Dinesh, Subhan).
          </p>
          <button
            onClick={() => {
              setPartnerError(null);
              setIsAddPartnerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Partner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {wallets.map((wallet) => {
          const isOwed = wallet.currentBorrowedBalance > 0;

          return (
            <div
              key={wallet.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                      {wallet.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">{wallet.name}&apos;s Wallet</h2>
                      <span className="text-[10.5px] text-slate-400 font-medium">
                        Partner Account
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isOwed
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {isOwed ? "AMOUNT OWED" : "SETTLED (₹0)"}
                  </span>
                </div>

                {/* Balance Display */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
                    Current Borrowed Balance
                  </span>
                  <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    ₹{wallet.currentBorrowedBalance.toLocaleString("en-IN")}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {isOwed
                      ? `Shop owes ${wallet.name} ₹${wallet.currentBorrowedBalance.toLocaleString("en-IN")}`
                      : `All loans from ${wallet.name} are fully settled`}
                  </p>
                </div>

                {/* Stats Breakdown */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total Borrowed
                    </span>
                    <span className="font-black text-emerald-600">
                      ₹{wallet.totalBorrowed.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total Repaid
                    </span>
                    <span className="font-black text-rose-600">
                      ₹{wallet.totalRepaid.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenActionModal(wallet.id, "borrow")}
                  className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Borrow (+)</span>
                </button>

                <button
                  onClick={() => handleOpenActionModal(wallet.id, "repayment")}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Repay (-)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Aggregate Debt / Total Liabilities Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
            Total Outstanding Partner Borrowings
          </span>
          <div className="text-2xl sm:text-3xl font-black mt-1">
            ₹{summary.totalOutstanding?.toLocaleString("en-IN") || 0}
          </div>
          <p className="text-xs text-blue-200/80 mt-0.5">
            Combined sum currently owed to Nauman, Dinesh &amp; Subhan
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-blue-300 block">Lifetime Borrowed:</span>
            <span className="font-bold text-sm">₹{summary.totalBorrowedAll?.toLocaleString("en-IN") || 0}</span>
          </div>
          <div className="h-8 w-px bg-blue-700" />
          <div>
            <span className="text-blue-300 block">Lifetime Repaid:</span>
            <span className="font-bold text-sm">₹{summary.totalRepaidAll?.toLocaleString("en-IN") || 0}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">Borrowing &amp; Repayment History</h2>
            <p className="text-xs text-slate-500 font-medium">All financial transactions synced with shop ledger</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setSelectedPartnerFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedPartnerFilter === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({transactions.length})
            </button>
            {wallets.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedPartnerFilter(w.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedPartnerFilter === w.id
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>Loading borrowing logs...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Handshake className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No borrowing transactions recorded yet</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Click &quot;Borrow&quot; or &quot;Repay&quot; on any partner card above to record funds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Partner</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description / Reason</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map((tx) => {
                  const isBorrow = tx.type === "borrow";
                  const formattedDate = new Date(tx.date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {tx.partnerName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isBorrow
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isBorrow ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          )}
                          <span>{isBorrow ? "BORROWED (SHOP +)" : "REPAID (SHOP -)"}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {tx.reason || (isBorrow ? "Capital borrowed" : "Loan repayment")}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {tx.paymentMode}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {tx.referenceNumber || "-"}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-black text-sm whitespace-nowrap ${
                          isBorrow ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isBorrow ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
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

      {/* Record Borrow / Repay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {modalType === "borrow" ? "Record Borrowed Money" : "Record Loan Repayment"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Updates partner wallet &amp; shop cashflow simultaneously
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Partner Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Partner Wallet *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {wallets.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setModalPartnerId(w.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        modalPartnerId === w.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Borrow vs Repayment Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalType("borrow")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      modalType === "borrow"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Money Borrowed (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalType("repayment")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      modalType === "repayment"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Repayment to Partner (-)</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {modalType === "borrow"
                    ? "Shop receives cash. Partner's owed balance increases."
                    : "Shop pays back. Partner's owed balance decreases towards ₹0."}
                </p>
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
                      placeholder="10000"
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Mode *
                  </label>
                  <select
                    value={modalPaymentMode}
                    onChange={(e) => setModalPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Date & Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ref / UTR Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref"
                    value={modalRef}
                    onChange={(e) => setModalRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason / Description
                </label>
                <input
                  type="text"
                  placeholder={
                    modalType === "borrow"
                      ? "e.g. Stock purchase capital"
                      : "e.g. Weekly profit payout repayment"
                  }
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Auto-Sync Main Wallet Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="syncLedger"
                  checked={syncMainLedger}
                  onChange={(e) => setSyncMainLedger(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="syncLedger" className="text-xs font-semibold text-slate-700">
                  Auto-sync with Main Shop Wallet Ledger ({modalType === "borrow" ? "Credit" : "Debit"})
                </label>
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
                    modalType === "borrow"
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
                    <span>Record {modalType === "borrow" ? "Borrowing" : "Repayment"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Partner Wallet Modal */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Partner / Borrower</h3>
                  <p className="text-xs text-slate-500 font-medium">Create a new partner wallet</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPartnerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="p-4 sm:p-6 space-y-4">
              {partnerError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {partnerError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Partner / Borrower Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nauman, Dinesh, or Subhan"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98XXXXXXXX"
                  value={newPartnerPhone}
                  onChange={(e) => setNewPartnerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notes / Relationship (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partner, Angel Investor, Co-founder"
                  value={newPartnerNotes}
                  onChange={(e) => setNewPartnerNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={partnerSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {partnerSubmitting ? "Creating..." : "Create Partner Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

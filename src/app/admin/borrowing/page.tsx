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
  ArrowRightLeft,
  Sparkles,
  Check,
  UploadCloud,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { PartnerWallet, BorrowingTransaction, BorrowingType } from "@/lib/borrowingTypes";
import { PaymentMode } from "@/lib/ledgerTypes";
import { getISTDateTimeLocal, formatISTDateTime, parseToISTIsoString } from "@/lib/dateUtils";

export default function AdminBorrowingPage() {
  const [wallets, setWallets] = useState<PartnerWallet[]>([]);
  const [transactions, setTransactions] = useState<BorrowingTransaction[]>([]);
  const [summary, setSummary] = useState<any>({
    totalOutstanding: 0,
    totalActiveInvestment: 0,
    totalNetExposure: 0,
    totalBorrowedAll: 0,
    totalRepaidAll: 0,
    totalInvestedAll: 0,
    totalInvestmentWithdrawnAll: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPartnerId, setModalPartnerId] = useState("");
  const [modalType, setModalType] = useState<BorrowingType>("borrow");
  const [modalAmount, setModalAmount] = useState("");
  const [modalPaymentMode, setModalPaymentMode] = useState<PaymentMode>("Cash");
  const [modalReason, setModalReason] = useState("");
  const [modalRef, setModalRef] = useState("");
  const [modalDate, setModalDate] = useState(() => getISTDateTimeLocal());
  const [modalProofUrl, setModalProofUrl] = useState("");
  const [uploadingModalProof, setUploadingModalProof] = useState(false);
  const [syncMainLedger, setSyncMainLedger] = useState(true);

  // Lightbox Modal
  const [activeProofLightbox, setActiveProofLightbox] = useState<string | null>(null);

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
    setModalProofUrl("");
    setModalDate(getISTDateTimeLocal());
    setSyncMainLedger(true);
    setIsModalOpen(true);
  };

  const handleModalProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingModalProof(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "rrtechservices/partner_proofs");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to upload proof");
      }

      const d = await res.json();
      setModalProofUrl(d.url);
    } catch (err: any) {
      setError(err?.message || "Failed to upload proof");
    } finally {
      setUploadingModalProof(false);
    }
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
          date: parseToISTIsoString(modalDate),
          reason: modalReason.trim(),
          referenceNumber: modalRef.trim(),
          proofUrl: modalProofUrl || undefined,
          syncMainLedger,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record transaction");
      }

      setIsModalOpen(false);
      setModalAmount("");
      setModalReason("");
      setModalRef("");
      setModalProofUrl("");
      setModalDate(getISTDateTimeLocal());
      await fetchBorrowingData();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
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
          phone: newPartnerPhone.trim() || undefined,
          notes: newPartnerNotes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create partner account");
      }

      setIsAddPartnerOpen(false);
      setNewPartnerName("");
      setNewPartnerPhone("");
      setNewPartnerNotes("");
      await fetchBorrowingData();
    } catch (err: any) {
      setPartnerError(err?.message || "Failed to create partner");
    } finally {
      setPartnerSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner transaction? The wallet balances will be automatically reversed.")) {
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

  const selectedPartnerObj = wallets.find((w) => w.id === modalPartnerId) || wallets[0];

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedTypeFilter === "all") return true;
    if (selectedTypeFilter === "borrowings") return tx.type === "borrow";
    if (selectedTypeFilter === "repayments") return tx.type === "repayment";
    if (selectedTypeFilter === "investments") return tx.type === "investment" || tx.type === "investment_withdrawal";
    if (selectedTypeFilter === "adjustments") return tx.type === "borrow_to_investment" || tx.type === "investment_to_borrow";
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Handshake className="w-6 h-6 text-blue-600" />
            <span>Partners, Borrowing &amp; Investment Wallets</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Separate tracking for Loans (Borrowing) &amp; Equity Capital (Investment) with 1-click reclassification adjustment
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
              <span>New Transaction</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Financial Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Borrowing (Debt) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Borrowed Balance (Debt)
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono">
              ₹{(summary.totalOutstanding || 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-[11px] text-amber-700 font-medium">
              Shop currently owes to partners as short-term loans
            </p>
          </div>
        </div>

        {/* Active Partner Investment (Equity) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
              Invested Balance (Capital)
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-indigo-900 font-mono">
              ₹{(summary.totalActiveInvestment || 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-[11px] text-indigo-700 font-medium">
              Long-term equity &amp; partner capital deployed
            </p>
          </div>
        </div>

        {/* Net Total Exposure */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Total Partner Capital
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-blue-900 font-mono">
              ₹{(summary.totalNetExposure || 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-[11px] text-blue-700 font-medium">
              Combined exposure (Borrowing + Investment)
            </p>
          </div>
        </div>

        {/* Lifetime Repaid */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Lifetime Repaid / Returned
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono">
              ₹{(summary.totalRepaidAll || 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-[11px] text-emerald-700 font-medium">
              Total loan repayments returned to partners
            </p>
          </div>
        </div>
      </div>

      {/* Partner Dual-Wallet Cards */}
      {wallets.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-slate-200 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No partner accounts added yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &ldquo;Add Partner Wallet&rdquo; above to add partners (e.g. Nauman, Dinesh, Subhan).
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {wallets.map((wallet) => {
            const hasBorrowing = wallet.currentBorrowedBalance > 0;
            const hasInvestment = wallet.currentInvestedBalance > 0;

            return (
              <div
                key={wallet.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Partner Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                        {wallet.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-900 leading-tight">
                          {wallet.name}
                        </h2>
                        {wallet.phone && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {wallet.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Net Contribution
                      </span>
                      <span className="text-sm font-black font-mono text-slate-900">
                        ₹{(wallet.totalNetContribution || (wallet.currentBorrowedBalance + wallet.currentInvestedBalance)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Dual Wallets: Borrowing vs Investment */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {/* Borrowing Wallet */}
                    <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                        Borrowing (Debt)
                      </span>
                      <div className="text-xl font-black text-amber-900 font-mono">
                        ₹{wallet.currentBorrowedBalance.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-amber-700 flex justify-between pt-1 border-t border-amber-200/60">
                        <span>Lent: ₹{wallet.totalBorrowed.toLocaleString("en-IN")}</span>
                        <span>Paid: ₹{wallet.totalRepaid.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Investment Wallet */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block">
                        Investment (Equity)
                      </span>
                      <div className="text-xl font-black text-indigo-900 font-mono">
                        ₹{wallet.currentInvestedBalance.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-indigo-700 flex justify-between pt-1 border-t border-indigo-200/60">
                        <span>Total: ₹{wallet.totalInvested.toLocaleString("en-IN")}</span>
                        <span>Out: ₹{wallet.totalInvestmentWithdrawn.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {wallet.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      Note: {wallet.notes}
                    </p>
                  )}
                </div>

                {/* Comprehensive Actions for Both Wallets */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleOpenActionModal(wallet.id, "borrow")}
                      className="py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>+ Borrow Loan</span>
                    </button>

                    <button
                      onClick={() => handleOpenActionModal(wallet.id, "repayment")}
                      disabled={wallet.currentBorrowedBalance <= 0}
                      className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>↩ Repay Loan</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleOpenActionModal(wallet.id, "investment")}
                      className="py-1.5 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+ Direct Invest</span>
                    </button>

                    <button
                      onClick={() => handleOpenActionModal(wallet.id, "borrow_to_investment")}
                      disabled={wallet.currentBorrowedBalance <= 0}
                      className="py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs disabled:opacity-50"
                      title="Adjust borrowed funds directly into partner investment without affecting main cash wallet balance"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>⇄ Convert to Invest</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction History & Filter Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-slate-900">Partner Financial History</h2>
            <p className="text-xs text-slate-500 font-medium">
              Audit log of loans, repayments, equity additions, and balance adjustments
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Partner */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedPartnerFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedPartnerFilter === "all"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Partners
              </button>
              {wallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedPartnerFilter(w.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedPartnerFilter === w.id
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedTypeFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedTypeFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setSelectedTypeFilter("borrowings")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedTypeFilter === "borrowings" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                Borrow
              </button>
              <button
                onClick={() => setSelectedTypeFilter("investments")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedTypeFilter === "investments" ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                Invest
              </button>
              <button
                onClick={() => setSelectedTypeFilter("adjustments")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedTypeFilter === "adjustments" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                Adjust (⇄)
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>Loading partner transactions...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Handshake className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No transactions found for current filter</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Use the cards above to log a borrow, repayment, investment, or convert borrowing into investment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Partner</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description / Reason</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-center">Proof / Receipt</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTransactions.map((tx) => {
                  const isBorrow = tx.type === "borrow";
                  const isRepayment = tx.type === "repayment";
                  const isInvestment = tx.type === "investment";
                  const isAdjustment = tx.type === "borrow_to_investment" || tx.type === "investment_to_borrow";
                  const isWithdrawal = tx.type === "investment_withdrawal";

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatISTDateTime(tx.date)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                        {tx.partnerName}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isBorrow && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <ArrowDownLeft className="w-3 h-3 text-amber-600" />
                            <span>BORROW (+)</span>
                          </span>
                        )}
                        {isRepayment && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                            <span>REPAYMENT (-)</span>
                          </span>
                        )}
                        {isInvestment && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>INVESTMENT (+)</span>
                          </span>
                        )}
                        {isAdjustment && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-300">
                            <ArrowRightLeft className="w-3 h-3 text-blue-600" />
                            <span>ADJUSTMENT (⇄)</span>
                          </span>
                        )}
                        {isWithdrawal && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            <span>WITHDRAWAL (-)</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-900 font-semibold max-w-xs truncate">
                        {tx.reason}
                        {isAdjustment && (
                          <span className="ml-1 text-[10px] text-blue-600 font-normal">
                            (Wallet balance kept same)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {isAdjustment ? "Internal Reclassification" : tx.paymentMode}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {tx.referenceNumber || "-"}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {tx.proofUrl ? (
                          <button
                            type="button"
                            onClick={() => setActiveProofLightbox(tx.proofUrl!)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Proof</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-black text-sm whitespace-nowrap font-mono ${
                          isBorrow || isInvestment
                            ? "text-emerald-600"
                            : isAdjustment
                            ? "text-blue-700"
                            : "text-rose-600"
                        }`}
                      >
                        {isAdjustment ? "⇄ " : isBorrow || isInvestment ? "+" : "-"}₹
                        {tx.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete transaction and reverse balance"
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

      {/* Record Transaction / Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {modalType === "borrow"
                      ? "Record Borrowed Loan"
                      : modalType === "repayment"
                      ? "Record Loan Repayment"
                      : modalType === "investment"
                      ? "Record Direct Equity Investment"
                      : modalType === "borrow_to_investment"
                      ? "Convert Borrowing to Investment (Adjustment)"
                      : "Partner Transaction"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedPartnerObj?.name} &bull; Manage capital &amp; debt
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
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

              {/* Action Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Operation
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setModalType("borrow")}
                    className={`py-2 px-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      modalType === "borrow"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>+ Borrow Loan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalType("repayment")}
                    className={`py-2 px-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      modalType === "repayment"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>↩ Repay Loan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalType("investment")}
                    className={`py-2 px-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      modalType === "investment"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+ Direct Invest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalType("borrow_to_investment")}
                    className={`py-2 px-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      modalType === "borrow_to_investment"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>⇄ Borrow ➔ Invest</span>
                  </button>
                </div>
              </div>

              {/* Explanatory Banner for Adjustment Logic */}
              {modalType === "borrow_to_investment" && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-blue-800">
                    <ArrowRightLeft className="w-3.5 h-3.5" /> 1-Click Capital Reclassification
                  </span>
                  <p className="text-[11px] text-blue-800/90 leading-relaxed">
                    We borrowed money earlier and used it for stock. Instead of repaying and taking back cash, this reclassifies the debt as partner equity:
                  </p>
                  <ul className="list-disc pl-4 text-[10.5px] text-blue-800/80 space-y-0.5">
                    <li>Partner <strong>Borrowed Balance</strong> decreases by entered amount.</li>
                    <li>Partner <strong>Invested Balance</strong> increases by entered amount.</li>
                    <li><strong>Main Wallet Balance remains UNCHANGED</strong> (Wallet stays same, no cash leaves shop).</li>
                  </ul>
                </div>
              )}

              {modalType === "investment" && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                  <span className="font-bold block mb-0.5">Direct Equity Investment</span>
                  <p className="text-[11px] text-indigo-800">
                    Partner brings new capital into the business. Partner investment balance increases and Main Wallet receives CREDIT (+amount).
                  </p>
                </div>
              )}

              {/* Current Balances Context */}
              {selectedPartnerObj && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
                  <div>
                    <span className="text-slate-500 block">Borrowed Loan Balance:</span>
                    <span className="font-black text-amber-800 font-mono">
                      ₹{selectedPartnerObj.currentBorrowedBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Current Invested Capital:</span>
                    <span className="font-black text-indigo-800 font-mono">
                      ₹{selectedPartnerObj.currentInvestedBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="5000"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
                {selectedPartnerObj && selectedPartnerObj.currentBorrowedBalance > 0 && (
                  <div className="flex gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setModalAmount(selectedPartnerObj.currentBorrowedBalance.toString())}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Full Borrow Balance (₹{selectedPartnerObj.currentBorrowedBalance})
                    </button>
                    {selectedPartnerObj.currentBorrowedBalance > 1000 && (
                      <button
                        type="button"
                        onClick={() =>
                          setModalAmount(Math.round(selectedPartnerObj.currentBorrowedBalance / 2).toString())
                        }
                        className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                      >
                        50% (₹{Math.round(selectedPartnerObj.currentBorrowedBalance / 2)})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Mode (only for actual cash flows) */}
              {modalType !== "borrow_to_investment" && modalType !== "investment_to_borrow" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={modalPaymentMode}
                    onChange={(e) => setModalPaymentMode(e.target.value as PaymentMode)}
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
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason / Purpose (Optional)
                </label>
                <input
                  type="text"
                  placeholder={
                    modalType === "borrow"
                      ? "e.g. Stock purchase capital loan"
                      : modalType === "borrow_to_investment"
                      ? "e.g. Stock sold; converted loan to 5k investment"
                      : "e.g. Partner equity contribution"
                  }
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reference / UTR No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR 3294827491 / Cheque 0021"
                  value={modalRef}
                  onChange={(e) => setModalRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              {/* Proof / Attachment (Cloudinary) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Proof / Screenshot / Voucher (Cloudinary)
                </label>
                {modalProofUrl ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <img
                      src={modalProofUrl}
                      alt="Proof"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-300"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-emerald-700 block truncate flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Uploaded to Cloudinary
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveProofLightbox(modalProofUrl)}
                        className="text-[11px] text-blue-600 hover:underline block truncate font-semibold"
                      >
                        Preview full image &rarr;
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalProofUrl("")}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="partner-proof-upload"
                      onChange={handleModalProofUpload}
                      disabled={uploadingModalProof}
                      className="hidden"
                    />
                    <label
                      htmlFor="partner-proof-upload"
                      className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 transition cursor-pointer text-xs font-semibold text-slate-600"
                    >
                      {uploadingModalProof ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Uploading Proof to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-blue-600" />
                          <span>Upload Transfer Receipt / Voucher Screenshot</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingModalProof}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <span>Confirm Transaction</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Add New Partner Wallet</h3>
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
                  Partner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nauman, Dinesh, Subhan"
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
                  type="tel"
                  placeholder="+91 9876543210"
                  value={newPartnerPhone}
                  onChange={(e) => setNewPartnerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notes / Role (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Equity investor &amp; component financing"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {partnerSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Partner Wallet</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Lightbox Modal */}
      {activeProofLightbox && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slide-down">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Partner Voucher / Receipt Proof</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeProofLightbox}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
                >
                  <span>Open Original</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setActiveProofLightbox(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-900/5 min-h-[300px]">
              <img
                src={activeProofLightbox}
                alt="Proof Attachment"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

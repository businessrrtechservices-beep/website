"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Globe,
  Megaphone,
  Layers,
  Building2,
  Package,
  Wrench,
  Users,
  Coffee,
  X,
  Loader2,
  FileText,
  UploadCloud,
  ImageIcon,
  Trash2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Download,
  Wallet,
  Handshake,
  AlertCircle,
  HelpCircle,
  Receipt,
} from "lucide-react";
import { ExpenseRecord, ExpenseSummary, ExpenseCategory, ExpenseFundedSource } from "@/lib/expenseTypes";
import { formatISTDateTime, getISTDateTimeLocal } from "@/lib/dateUtils";

const CATEGORIES: { label: ExpenseCategory; icon: any; color: string; bg: string }[] = [
  { label: "Domains & Hosting", icon: Globe, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { label: "Meta & Digital Ads", icon: Megaphone, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { label: "Software & SaaS", icon: Layers, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  { label: "Office & Utilities", icon: Building2, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { label: "Courier & Logistics", icon: Package, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  { label: "Spare Parts & Repairs", icon: Wrench, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  { label: "Hardware & Tools", icon: Wrench, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
  { label: "Staff & Labor", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200" },
  { label: "Miscellaneous", icon: Coffee, color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
];

export default function CompanyExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalExpense: 0,
    thisMonthExpense: 0,
    lastMonthExpense: 0,
    marketingAdsTotal: 0,
    domainsHostingTotal: 0,
    officeOpsTotal: 0,
    byCategory: [],
    recentExpenses: [],
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [partnerWallets, setPartnerWallets] = useState<{ id: string; name: string }[]>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Meta & Digital Ads");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(() => getISTDateTimeLocal());
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [fundedBy, setFundedBy] = useState<ExpenseFundedSource>("shop_wallet");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [notes, setNotes] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);

  // Lightbox Modal
  const [activeProofLightbox, setActiveProofLightbox] = useState<string | null>(null);

  const fetchExpensesData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (search.trim()) params.set("search", search.trim());

      const [expRes, partRes] = await Promise.all([
        fetch(`/api/expenses?${params.toString()}`),
        fetch("/api/borrowing"),
      ]);

      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(data.expenses || []);
        if (data.summary) setSummary(data.summary);
      }

      if (partRes.ok) {
        const pData = await partRes.json();
        const wallets = pData.wallets || [];
        setPartnerWallets(wallets);
        if (wallets.length > 0 && !selectedPartnerId) {
          setSelectedPartnerId(wallets[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load company expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExpensesData();
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "rrtechservices/expenses_proofs");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setProofUrl(data.secure_url || data.url);
    } catch (err: any) {
      alert("Failed to upload expense bill proof: " + err.message);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleOpenAddModal = (defaultCat?: ExpenseCategory) => {
    setTitle("");
    setCategory(defaultCat || "Meta & Digital Ads");
    setAmount("");
    setVendor("");
    setDate(getISTDateTimeLocal());
    setPaymentMode("UPI");
    setReferenceNumber("");
    setFundedBy("shop_wallet");
    setNotes("");
    setProofUrl("");
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenCourierQuickPay = () => {
    setTitle("Courier Charges");
    setCategory("Courier & Logistics");
    setAmount("");
    setVendor("DTDC");
    setDate(getISTDateTimeLocal());
    setPaymentMode("UPI");
    setReferenceNumber("");
    setFundedBy("partner_borrowing");
    setNotes("Paid directly to courier delivery partner from personal money");
    setProofUrl("");
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setFormError("Please enter a valid expense amount");
      return;
    }

    if (!title.trim()) {
      setFormError("Please enter an expense description or service name");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const partnerObj = partnerWallets.find((p) => p.id === selectedPartnerId);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          amount: parsedAmount,
          date,
          vendor: vendor.trim() || undefined,
          paymentMode,
          referenceNumber: referenceNumber.trim() || undefined,
          fundedBy,
          partnerId: fundedBy !== "shop_wallet" ? selectedPartnerId : undefined,
          partnerName: fundedBy !== "shop_wallet" ? partnerObj?.name : undefined,
          proofUrl: proofUrl || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record expense");
      }

      setModalOpen(false);
      await fetchExpensesData();
    } catch (err: any) {
      setFormError(err.message || "Failed to record expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (exp: ExpenseRecord) => {
    if (
      !confirm(
        `Are you sure you want to delete "${exp.title}" (₹${exp.amount})?\n\nIf paid from Shop Wallet, the ledger debit will be automatically reversed.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/expenses/${exp.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete expense");
      }
      await fetchExpensesData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert("No expense records to export.");
      return;
    }

    const headers = [
      "Date",
      "Title",
      "Category",
      "Vendor",
      "Amount (INR)",
      "Payment Mode",
      "Funded By",
      "Reference",
      "Notes",
    ];

    const rows = expenses.map((e) => [
      `"${formatISTDateTime(e.date)}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${(e.vendor || "").replace(/"/g, '""')}"`,
      e.amount,
      `"${e.paymentMode}"`,
      `"${e.fundedBy}"`,
      `"${(e.referenceNumber || "").replace(/"/g, '""')}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RR_Tech_Company_Expenses_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Company Expenses &amp; Overheads
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wider">
              Operating Costs
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Track digital marketing (Meta Ads), domains, software, rent &amp; store expenses with automatic wallet ledger sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchExpensesData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleOpenCourierQuickPay}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            title="Log Courier or Errand paid directly from personal pocket without wallet mismatch"
          >
            <Package className="w-4 h-4" />
            <span>⚡ Quick Courier Pay</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Accounting Explanation Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/70 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 mt-0.5 shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block sm:inline">
              Single Source of Truth &amp; Ledger Integration:
            </span>{" "}
            <span className="text-slate-600">
              When paid from the <strong>Shop Wallet</strong>, expenses auto-debit your main cash/bank ledger. If a partner pays personally, select <strong>Partner Funded</strong> to give them investment equity credit without double data entry.
            </span>
          </div>
        </div>
        <Link
          href="/admin/ledger"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 whitespace-nowrap self-end md:self-center"
        >
          <span>View Wallet Ledger</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses All Time */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Expenses (All Time)
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">
              ₹{(summary.totalExpense || 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {expenses.length} operating expense record{expenses.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* This Month's Expenses */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              This Month&apos;s Overheads
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              ₹{(summary.thisMonthExpense || 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Last month: ₹{(summary.lastMonthExpense || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Meta & Digital Marketing Ads */}
        <div className="p-5 rounded-2xl bg-white border border-purple-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Meta &amp; Digital Ads
            </span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-700">
              ₹{(summary.marketingAdsTotal || 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Instagram, Facebook &amp; Google Ads spend
            </p>
          </div>
        </div>

        {/* Domains & Hosting */}
        <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Domains &amp; SaaS Tools
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-700">
              ₹{(summary.domainsHostingTotal || 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              GoDaddy, Hostinger, Vercel &amp; cloud tools
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown Visual Meter */}
      {summary.byCategory && summary.byCategory.length > 0 && summary.totalExpense > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Expenditure Breakdown by Category</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Sorted by highest spend
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.byCategory.map((cat) => {
              const info = CATEGORIES.find((c) => c.label === cat.category) || CATEGORIES[0];
              const Icon = info.icon;
              return (
                <div
                  key={cat.category}
                  onClick={() => setSelectedCategory(selectedCategory === cat.category ? "all" : cat.category)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    selectedCategory === cat.category
                      ? "border-purple-600 bg-purple-50/50 shadow-2xs"
                      : "border-slate-100 bg-slate-50/70 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${info.bg} ${info.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{cat.category}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      ₹{cat.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">{cat.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Chips and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === "all"
                ? "bg-purple-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Categories ({expenses.length})
          </button>
          {CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.label
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor, description, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </form>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            <span>Loading company expense records...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No company expenses found</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Click &quot;Add Expense&quot; to log your domain renewals, Meta ad campaigns, shop rent, or software tools.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record First Expense</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 sm:px-6">Date &amp; Time</th>
                  <th className="py-3 px-4">Expense &amp; Vendor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Funded Source</th>
                  <th className="py-3 px-4">Payment &amp; Ref</th>
                  <th className="py-3 px-4 text-center">Proof / Bill</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 sm:px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenses.map((exp) => {
                  const catInfo = CATEGORIES.find((c) => c.label === exp.category) || CATEGORIES[0];
                  const Icon = catInfo.icon;
                  const formattedDate = formatISTDateTime(exp.date);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                      {/* Date */}
                      <td className="py-3.5 px-4 sm:px-6 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {formattedDate}
                      </td>

                      {/* Title & Vendor */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {exp.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {exp.vendor && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                              {exp.vendor}
                            </span>
                          )}
                          {exp.notes && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {exp.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${catInfo.bg} ${catInfo.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{exp.category}</span>
                        </span>
                      </td>

                      {/* Funded Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {exp.fundedBy === "shop_wallet" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                            <Wallet className="w-3 h-3" />
                            <span>Shop Drawer (Ledger)</span>
                          </span>
                        ) : exp.fundedBy === "partner_borrowing" ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-300">
                              <Package className="w-3 h-3 text-amber-600" />
                              <span>Out-of-Pocket ({exp.partnerName || "Partner"})</span>
                            </span>
                            <span className="text-[9px] text-slate-400 block font-mono">
                              Owed to Partner &bull; Net ₹0 Wallet
                            </span>
                          </div>
                        ) : exp.fundedBy === "partner_personal" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <Handshake className="w-3 h-3" />
                            <span>Partner Equity ({exp.partnerName || "Partner"})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            <Layers className="w-3 h-3" />
                            <span>Invest Pool ({exp.partnerName || "Partner"})</span>
                          </span>
                        )}
                      </td>

                      {/* Payment & Ref */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-semibold text-xs flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{exp.paymentMode}</span>
                        </div>
                        {exp.referenceNumber && (
                          <span className="text-[10.5px] text-slate-400 font-mono block mt-0.5">
                            Ref: {exp.referenceNumber}
                          </span>
                        )}
                      </td>

                      {/* Proof / Bill */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {exp.proofUrl ? (
                          <button
                            type="button"
                            onClick={() => setActiveProofLightbox(exp.proofUrl!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition cursor-pointer"
                            title="View invoice / bill proof"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Bill Proof</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-black text-sm text-rose-600 whitespace-nowrap">
                        ₹{exp.amount.toLocaleString("en-IN")}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete expense & rollback ledger"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Expense Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  <span>Record Company Expense</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logged expenses auto-debit the Shop Wallet Ledger or credit Partner Investment.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitExpense} className="mt-4 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expense Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.label;
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setCategory(cat.label)}
                        className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? "border-purple-600 bg-purple-600 text-white shadow-2xs"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description / Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. GoDaddy Domain rrtechservices.in (2 Years) / Meta Ads Diwali"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 2499"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm font-black focus:outline-purple-600"
                  />
                </div>
              </div>

              {/* Vendor & Payment Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vendor / Platform
                  </label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Meta Ads, Google, GoDaddy, Hostinger, Landlord"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:outline-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-purple-600 bg-white"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Net Banking">Net Banking / IMPS</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Date & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Date &amp; Time (IST)
                    </label>
                    <button
                      type="button"
                      onClick={() => setDate(getISTDateTimeLocal())}
                      className="text-[10px] text-purple-600 hover:underline font-bold cursor-pointer"
                    >
                      Now
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-purple-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Reference / Transaction ID
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UPI UTR # or Invoice ID"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:outline-purple-600"
                  />
                </div>
              </div>

              {/* Source of Funds Accounting Selector */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Source of Funds (Accounting Impact) *
                  </label>
                  <span className="text-[10px] text-slate-500">Pick where money came from</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: Shop Wallet */}
                  <button
                    type="button"
                    onClick={() => setFundedBy("shop_wallet")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      fundedBy === "shop_wallet"
                        ? "border-blue-600 bg-blue-50 text-blue-900 shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Wallet className="w-4 h-4 text-blue-600" />
                      <span>Shop Cash Drawer</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                      Auto-debits shop wallet ledger immediately.
                    </p>
                  </button>

                  {/* Option 2: Middle Way Out-of-Pocket / Courier Pay */}
                  <button
                    type="button"
                    onClick={() => setFundedBy("partner_borrowing")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                      fundedBy === "partner_borrowing"
                        ? "border-amber-600 bg-amber-50 text-amber-900 shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Package className="w-4 h-4 text-amber-600" />
                      <span>Paid Out-of-Pocket</span>
                    </div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 text-[9px] font-black uppercase">
                      Zero Mismatch
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                      Courier/Errand: Auto-pairs Credit+Debit. Net ₹0 to cash drawer; shop owes you!
                    </p>
                  </button>

                  {/* Option 3: Personal Capital Investment */}
                  <button
                    type="button"
                    onClick={() => setFundedBy("partner_personal")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      fundedBy === "partner_personal"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Handshake className="w-4 h-4 text-emerald-600" />
                      <span>Capital Investment</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                      Partner equity: Adds to partner investment balance.
                    </p>
                  </button>
                </div>

                {fundedBy !== "shop_wallet" && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Select Paying Partner:
                    </label>
                    {partnerWallets.length === 0 ? (
                      <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        No partners found. Add partners in the &ldquo;Partners &amp; Investment&rdquo; section.
                      </p>
                    ) : (
                      <select
                        value={selectedPartnerId}
                        onChange={(e) => setSelectedPartnerId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-purple-600"
                      >
                        {partnerWallets.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Cloudinary Invoice / Bill Proof Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice / Receipt Proof (Cloudinary)
                </label>
                {proofUrl ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-900 truncate max-w-[220px]">
                        Bill proof uploaded
                      </span>
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-purple-700 underline"
                      >
                        Preview
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProofUrl("")}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-slate-50 hover:bg-purple-50/40 text-slate-600 cursor-pointer transition">
                    {uploadingProof ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-xs font-semibold text-purple-600">Uploading bill to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium">Upload invoice bill / tax receipt screenshot</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleProofUpload}
                      disabled={uploadingProof}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional details or reminder notes"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:outline-purple-600"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingProof}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Record Expense &amp; Sync Ledger</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High-Resolution Bill Lightbox Modal */}
      {activeProofLightbox && (
        <div
          onClick={() => setActiveProofLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Expense Receipt / Invoice Proof</span>
              <div className="flex items-center gap-2">
                <a
                  href={activeProofLightbox}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-purple-600 hover:underline font-bold inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Full Size</span>
                </a>
                <button
                  onClick={() => setActiveProofLightbox(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex-1 overflow-auto flex items-center justify-center bg-slate-900 rounded-xl p-2 min-h-[300px]">
              <img
                src={activeProofLightbox}
                alt="Expense Bill Proof"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

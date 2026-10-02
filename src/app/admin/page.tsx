"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  MessageSquare,
  Laptop,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  PhoneCall,
  Sliders,
  ExternalLink,
  Clock,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Boxes,
  Receipt,
  IndianRupee,
  Phone,
  MessageCircle,
  FileText,
  Check,
  AlertTriangle,
  X,
  Loader2,
  Handshake,
  UploadCloud,
  ImageIcon,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [heroConfig, setHeroConfig] = useState<any>(null);
  const [productCount, setProductCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalSalesRevenue, setTotalSalesRevenue] = useState(0);
  const [stockItemCount, setStockItemCount] = useState(0);

  // Sales and Invoices Status Lifecycle State
  const [salesInvoices, setSalesInvoices] = useState<any[]>([]);
  const [salesStats, setSalesStats] = useState<any>({
    totalRevenue: 0,
    totalBilled: 0,
    totalPending: 0,
    totalInvoices: 0,
  });
  const [lifecycleFilter, setLifecycleFilter] = useState<"pending" | "unpaid" | "partial" | "paid">("pending");

  // Partner Wallets Summary
  const [partnerSummary, setPartnerSummary] = useState<any>({
    totalOutstanding: 0,
    totalActiveInvestment: 0,
    totalNetExposure: 0,
  });

  // Collect Payment Modal State
  const [collectModalInvoice, setCollectModalInvoice] = useState<any | null>(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMode, setCollectMode] = useState<string>("UPI");
  const [collectRef, setCollectRef] = useState("");
  const [collectNotes, setCollectNotes] = useState("");
  const [collectProofUrl, setCollectProofUrl] = useState("");
  const [collectUploadingProof, setCollectUploadingProof] = useState(false);
  const [collectSubmitting, setCollectSubmitting] = useState(false);
  const [collectError, setCollectError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, heroRes, productsRes, ledgerRes, salesRes, inventoryRes, borrowingRes] = await Promise.all([
        fetch("/api/analytics/stats"),
        fetch("/api/hero"),
        fetch("/api/products"),
        fetch("/api/ledger"),
        fetch("/api/sales"),
        fetch("/api/inventory/items"),
        fetch("/api/borrowing"),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setStats(data.summary);
      }
      if (heroRes.ok) {
        const data = await heroRes.json();
        setHeroConfig(data.hero);
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProductCount(data.products?.length || 0);
      }
      if (ledgerRes.ok) {
        const data = await ledgerRes.json();
        setWalletBalance(data.summary?.balance || 0);
      }
      if (salesRes.ok) {
        const data = await salesRes.json();
        setTotalSalesRevenue(data.stats?.totalRevenue || 0);
        setSalesInvoices(data.invoices || []);
        setSalesStats(data.stats || {});
      }
      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        setStockItemCount(data.items?.length || 0);
      }
      if (borrowingRes.ok) {
        const data = await borrowingRes.json();
        setPartnerSummary(data.summary || {});
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Invoices and Lifecycle computations
  const pendingInvoices = salesInvoices.filter(
    (inv) => inv.paymentStatus !== "Paid" && Number(inv.balanceDue) > 0
  );
  const unpaidInvoices = salesInvoices.filter((inv) => inv.paymentStatus === "Unpaid");
  const partialInvoices = salesInvoices.filter(
    (inv) => inv.paymentStatus === "Partial" || (inv.amountPaid > 0 && inv.balanceDue > 0)
  );
  const paidInvoices = salesInvoices.filter(
    (inv) => inv.paymentStatus === "Paid" || inv.balanceDue <= 0
  );

  const displayedInvoices =
    lifecycleFilter === "pending"
      ? pendingInvoices
      : lifecycleFilter === "unpaid"
      ? unpaidInvoices
      : lifecycleFilter === "partial"
      ? partialInvoices
      : paidInvoices;

  const totalBilled = Number(salesStats.totalBilled) || 0;
  const totalRevenue = Number(salesStats.totalRevenue) || 0;
  const collectionRate = totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 100;

  const handleOpenCollectModal = (inv: any) => {
    setCollectModalInvoice(inv);
    setCollectAmount(inv.balanceDue > 0 ? inv.balanceDue.toString() : "");
    setCollectMode("UPI");
    setCollectRef("");
    setCollectNotes("");
    setCollectProofUrl("");
    setCollectError(null);
  };

  const handleUploadCollectProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCollectUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "rrtechservices/sales_proofs");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCollectProofUrl(data.secure_url || data.url);
    } catch (err: any) {
      alert("Proof upload failed: " + err.message);
    } finally {
      setCollectUploadingProof(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalInvoice) return;
    const pmt = parseFloat(collectAmount);
    if (!pmt || pmt <= 0) {
      setCollectError("Please enter a valid payment amount");
      return;
    }

    setCollectSubmitting(true);
    setCollectError(null);

    try {
      const res = await fetch(`/api/sales/${collectModalInvoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          amount: pmt,
          paymentMode: collectMode,
          referenceNumber: collectRef.trim(),
          notes: collectNotes.trim(),
          proofUrl: collectProofUrl || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record payment");
      }

      setCollectModalInvoice(null);
      await fetchDashboardData();
    } catch (err: any) {
      setCollectError(err.message || "Failed to record payment");
    } finally {
      setCollectSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Admin Dashboard</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">
              Live Metrics
            </span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Real-time site visits, user interest clicks &amp; store performance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-xs"
          >
            <span>Preview Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Visits */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today&apos;s Visits
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.todayVisits || 0}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Unique visits logged today</p>
        </div>

        {/* Total Visits */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Site Visits
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.totalVisits || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">lifetime</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Across all pages and devices</p>
        </div>

        {/* Interest Clicks (Leads) */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Interest Clicks (Leads)
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.totalInterests || 0}
            </span>
            <span className="text-xs text-indigo-600 font-bold">
              {stats?.todayInterests || 0} today
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">WhatsApp, calls &amp; bookings</p>
        </div>

        {/* Active Products */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Products In Catalog
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {productCount}
            </span>
            <Link
              href="/admin/products"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              Manage &rarr;
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Laptops &amp; refurb listings</p>
        </div>
      </div>

      {/* Enterprise Shop Suite Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance Card */}
        <Link
          href="/admin/ledger"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Wallet Balance
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition">
              ₹{walletBalance.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1 font-medium">
              <span>View ledger &amp; credit/debit entries</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </Link>

        {/* Stock & Inventory Card */}
        <Link
          href="/admin/inventory"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Stock &amp; Accessories
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition">
              {stockItemCount} SKUs
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1 font-medium">
              <span>Track allocations &amp; RRTS codes</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </Link>

        {/* Sales & Invoicing Card */}
        <Link
          href="/admin/sales"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sales Revenue
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition">
              ₹{totalSalesRevenue.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1 font-medium">
              <span>Create sales &amp; print tax invoices</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </Link>

        {/* Pending Receivables Card */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 transition shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Pending Receivables
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">
              ₹{(salesStats.totalPending || 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {pendingInvoices.length} customer invoice{pendingInvoices.length === 1 ? "" : "s"} awaiting settlement
            </p>
          </div>
        </div>
      </div>

      {/* Pending Sales Payments & Customer Lifecycle Tracker */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Header & Stats bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                <Receipt className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Pending Sales &amp; Invoice Payment Lifecycle
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Track outstanding customer dues, send 1-click WhatsApp reminders, and settle balances into the shop ledger.
            </p>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Billed</div>
              <div className="text-sm font-black text-slate-800">
                ₹{totalBilled.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-emerald-700">Collected</div>
              <div className="text-sm font-black text-emerald-700">
                ₹{totalRevenue.toLocaleString("en-IN")} ({collectionRate}%)
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-rose-700">Total Pending Due</div>
              <div className="text-sm font-black text-rose-700">
                ₹{(salesStats.totalPending || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 sm:px-6 pt-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setLifecycleFilter("pending")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              lifecycleFilter === "pending"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Pending Dues ({pendingInvoices.length})
          </button>
          <button
            onClick={() => setLifecycleFilter("unpaid")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              lifecycleFilter === "unpaid"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🔴 Completely Unpaid ({unpaidInvoices.length})
          </button>
          <button
            onClick={() => setLifecycleFilter("partial")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              lifecycleFilter === "partial"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🟡 Partially Paid ({partialInvoices.length})
          </button>
          <button
            onClick={() => setLifecycleFilter("paid")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              lifecycleFilter === "paid"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🟢 Settled Invoices ({paidInvoices.length})
          </button>
        </div>

        {/* Invoices List / Whom Pending */}
        <div className="overflow-x-auto">
          {displayedInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-600">No invoices in this status</p>
              <p className="text-xs text-slate-400 mt-1">All accounts are properly settled or no pending records exist.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Customer &amp; Contact</th>
                  <th className="py-3 px-4">Invoice &amp; Date</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4 text-right">Billed / Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedInvoices.map((inv) => {
                  const cleanPhone = (inv.customerPhone || "").replace(/\D/g, "");
                  const reminderMsg = encodeURIComponent(
                    `Hello ${inv.customerName || "Customer"}, gentle reminder regarding invoice #${inv.invoiceNumber} from RR Tech Services. Balance due: ₹${(inv.balanceDue || 0).toLocaleString("en-IN")}. Please arrange payment via UPI/Bank transfer. Thank you!`
                  );

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      {/* Customer */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 text-sm">
                          {inv.customerName || "Unnamed Customer"}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500 text-xs">{inv.customerPhone || "No Phone"}</span>
                          {cleanPhone && (
                            <>
                              <a
                                href={`https://wa.me/91${cleanPhone}?text=${reminderMsg}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Send WhatsApp Reminder"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                              <a
                                href={`tel:${cleanPhone}`}
                                title="Call Customer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call</span>
                              </a>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Invoice Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(inv.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {inv.items?.map((it: any) => it.description).join(", ")}
                        </div>
                      </td>

                      {/* Lifecycle Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {inv.balanceDue <= 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Fully Paid</span>
                            </span>
                          ) : inv.amountPaid > 0 ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-full w-fit">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Partially Paid</span>
                              </span>
                              <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, Math.round(((inv.amountPaid || 0) / (inv.grandTotal || 1)) * 100))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full w-fit">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Payment Unpaid</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Billed / Paid */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-800">
                          ₹{(inv.grandTotal || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                          Paid: ₹{(inv.amountPaid || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`font-black text-sm ${
                            inv.balanceDue > 0 ? "text-rose-600" : "text-slate-400"
                          }`}
                        >
                          ₹{(inv.balanceDue || 0).toLocaleString("en-IN")}
                        </div>
                        {inv.balanceDue > 0 && (
                          <span className="text-[10px] text-rose-500 font-medium">Pending Due</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/sales/invoice/${inv.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                            title="Open Full A4 Printable Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>A4</span>
                          </Link>
                          {inv.balanceDue > 0 ? (
                            <button
                              onClick={() => handleOpenCollectModal(inv)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                            >
                              <IndianRupee className="w-3 h-3" />
                              <span>Collect</span>
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Cleared
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Hero Prices Quick Snapshot & Controller Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-indigo-50/50 border border-blue-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Hero Live Pricing Controller
              </span>
            </div>
            <h2 className="mt-1 text-base sm:text-lg font-black text-slate-900">
              Active Front-Page Promotional Prices
            </h2>
            <div className="mt-3.5 flex flex-wrap gap-2.5 sm:gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
                  Basic Servicing
                </span>
                <span className="text-sm font-black text-blue-600">
                  ₹{heroConfig?.slide1?.basicServicePrice || 499}
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
                  Deep Servicing
                </span>
                <span className="text-sm font-black text-blue-600">
                  ₹{heroConfig?.slide1?.deepServicePrice || 699}
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
                  Refurb Business Start
                </span>
                <span className="text-sm font-black text-blue-600">
                  ₹{heroConfig?.slide2?.businessSeriesPrice?.toLocaleString("en-IN") || "22,000"}
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
                  Screen Repair Start
                </span>
                <span className="text-sm font-black text-blue-600">
                  ₹{heroConfig?.slide3?.screenReplacementPrice?.toLocaleString("en-IN") || "1,499"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/hero"
            className="inline-flex items-center gap-2 self-start md:self-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition"
          >
            <span>Edit Hero Prices &amp; Text</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid: Recent Leads & Section Views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Interest Clicks / Leads (8 cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Customer Interest &amp; Click Log</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Every action clicked on the website is logged here before redirection
              </p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              Full Analytics &rarr;
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            {!stats?.recentInterests || stats.recentInterests.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No interest clicks logged yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When a customer clicks WhatsApp or Call on the homepage, it will appear here instantly.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5 font-bold">Time</th>
                    <th className="pb-2.5 font-bold">Action / Button</th>
                    <th className="pb-2.5 font-bold">Section</th>
                    <th className="pb-2.5 font-bold">Destination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {stats.recentInterests.slice(0, 8).map((event: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 text-slate-500 whitespace-nowrap flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimeAgo(event.timestamp)}</span>
                      </td>
                      <td className="py-2.5 font-sans font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {event.buttonText}
                        </span>
                      </td>
                      <td className="py-2.5 font-sans text-slate-600">
                        {event.section || "Homepage"}
                      </td>
                      <td className="py-2.5 text-slate-500 truncate max-w-[200px]" title={event.targetUrl}>
                        {event.targetUrl?.includes("wa.me") ? (
                          <span className="text-emerald-700 font-sans font-semibold">WhatsApp Link</span>
                        ) : event.targetUrl?.includes("tel:") ? (
                          <span className="text-blue-700 font-sans font-semibold">Phone Call</span>
                        ) : (
                          event.targetUrl || "Internal"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Section Views & Attention Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 pb-3.5 border-b border-slate-100">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Section Views &amp; Attention</span>
            </h3>

            <div className="mt-4 space-y-3">
              {stats?.sectionViews && stats.sectionViews.length > 0 ? (
                stats.sectionViews.slice(0, 6).map((item: any, idx: number) => {
                  const maxCount = Math.max(...stats.sectionViews.map((s: any) => s.count), 1);
                  const percentage = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 capitalize">
                          {item.sectionId.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-slate-500 font-bold">{item.count} views</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <p>Viewing data accumulates as users scroll sections.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Database Status Banner */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">Database Engine</span>
              </div>
              {stats?.dbConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> MongoDB
                </span>
              ) : (
                <Link
                  href="/admin/settings"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Configure DB &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collect Payment Modal Dialog */}
      {collectModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Collect Invoice Payment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Invoice <span className="font-mono font-bold text-blue-600">{collectModalInvoice.invoiceNumber}</span> &bull; {collectModalInvoice.customerName}
                </p>
              </div>
              <button
                onClick={() => setCollectModalInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Billed</span>
                <span className="font-bold text-slate-800">
                  ₹{(collectModalInvoice.grandTotal || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">Paid</span>
                <span className="font-bold text-emerald-600">
                  ₹{(collectModalInvoice.amountPaid || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-rose-600 font-bold uppercase block">Balance Due</span>
                <span className="font-black text-rose-600">
                  ₹{(collectModalInvoice.balanceDue || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {collectError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{collectError}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Amount Being Collected (₹) *</label>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(collectModalInvoice.balanceDue.toString())}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Pay Full Due (₹{collectModalInvoice.balanceDue})
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-blue-600"
                  placeholder="e.g. 5000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={collectMode}
                    onChange={(e) => setCollectMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:outline-blue-600 bg-white"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Bank Transfer">Bank Transfer / IMPS</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ref / UTR Number</label>
                  <input
                    type="text"
                    value={collectRef}
                    onChange={(e) => setCollectRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-blue-600 font-mono"
                    placeholder="e.g. UPI Ref # / Cheque #"
                  />
                </div>
              </div>

              {/* Cloudinary Proof Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Proof / Screenshot (Cloudinary)
                </label>
                {collectProofUrl ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-900 truncate max-w-[200px]">
                        Payment proof attached
                      </span>
                      <a
                        href={collectProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-600 underline"
                      >
                        Preview
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCollectProofUrl("")}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 text-slate-600 cursor-pointer transition">
                    {collectUploadingProof ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-xs font-semibold text-blue-600">Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium">Upload receipt / UPI screenshot</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleUploadCollectProof}
                      disabled={collectUploadingProof}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-blue-600"
                  placeholder="Optional payment notes"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCollectModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={collectSubmitting || collectUploadingProof}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {collectSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Record Payment &amp; Credit Ledger</span>
                    </>
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

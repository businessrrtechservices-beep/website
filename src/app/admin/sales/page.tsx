"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Receipt,
  Plus,
  Search,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  Eye,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
  Boxes,
  ExternalLink,
  UploadCloud,
  Check,
  Share2,
} from "lucide-react";
import { Invoice, SaleItemLine, CustomerInfo } from "@/lib/salesTypes";
import { InventoryItem } from "@/lib/inventoryTypes";
import { PaymentMode } from "@/lib/ledgerTypes";
import { getISTDateString, formatISTDate } from "@/lib/dateUtils";
import A4InvoiceView from "@/components/A4InvoiceView";

export default function AdminSalesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalBilled: 0,
    totalPending: 0,
    totalInvoices: 0,
    totalUnitsSold: 0,
  });

  // Payment Settlement Modal State
  const [collectModalInvoice, setCollectModalInvoice] = useState<Invoice | null>(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMode, setCollectMode] = useState<PaymentMode>("Cash");
  const [collectRef, setCollectRef] = useState("");
  const [collectNotes, setCollectNotes] = useState("");
  const [collectProofUrl, setCollectProofUrl] = useState("");
  const [uploadingCollectProof, setUploadingCollectProof] = useState(false);
  const [collectSubmitting, setCollectSubmitting] = useState(false);
  const [collectError, setCollectError] = useState<string | null>(null);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);

  // New Sale Form
  const [nextInvNum, setNextInvNum] = useState("");
  const [saleDate, setSaleDate] = useState(() => getISTDateString());
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGst, setCustomerGst] = useState("");
  
  // Line items in sale
  const [saleItems, setSaleItems] = useState<SaleItemLine[]>([]);
  const [selectedStockId, setSelectedStockId] = useState("");
  const [selectedItemQty, setSelectedItemQty] = useState(1);
  const [selectedItemPrice, setSelectedItemPrice] = useState("");
  const [selectedItemSerials, setSelectedItemSerials] = useState("");

  // Payment & Financials
  const [discount, setDiscount] = useState("0");
  const [taxRate, setTaxRate] = useState("0"); // 0% or 18% GST
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Partial" | "Unpaid">("Paid");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [recordInLedger, setRecordInLedger] = useState(true);
  const [saleNotes, setSaleNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/sales", window.location.origin);
      if (statusFilter !== "all") url.searchParams.set("paymentStatus", statusFilter);
      if (search.trim()) url.searchParams.set("search", search.trim());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setStats(data.stats || {});
        setNextInvNum(data.nextInvoiceNumber || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory/items");
      if (res.ok) {
        const data = await res.json();
        setInventory(data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSalesData();
    fetchInventory();
  }, [statusFilter]);

  // Open modal
  const handleOpenNewSale = () => {
    setError(null);
    setSaleItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
    setCustomerGst("");
    setDiscount("0");
    setTaxRate("0");
    setPaymentStatus("Paid");
    setPaymentMode("Cash");
    setAmountPaid("");
    setRecordInLedger(true);
    setSaleDate(getISTDateString());
    fetchInventory();
    setIsNewSaleOpen(true);
  };

  // Add line item to sale list
  const handleAddLineItem = () => {
    if (!selectedStockId) return;
    const invItem = inventory.find((i) => i.id === selectedStockId);
    if (!invItem) return;

    const qty = Math.max(1, selectedItemQty);
    if (qty > invItem.availableQuantity) {
      alert(`Only ${invItem.availableQuantity} units available on shelf for ${invItem.name}`);
      return;
    }

    const price = parseFloat(selectedItemPrice) || invItem.sellingPrice || 0;
    const serialList = selectedItemSerials
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const newLine: SaleItemLine = {
      itemId: invItem.id,
      itemCode: invItem.code,
      itemName: invItem.name,
      category: invItem.category,
      brand: invItem.brand,
      model: invItem.model,
      serialNumbers: serialList,
      quantity: qty,
      unitPrice: price,
      total: qty * price,
    };

    setSaleItems([...saleItems, newLine]);

    // Reset picker
    setSelectedStockId("");
    setSelectedItemQty(1);
    setSelectedItemPrice("");
    setSelectedItemSerials("");
  };

  const handleRemoveLineItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedSubtotal = saleItems.reduce((acc, item) => acc + item.total, 0);
  const discountVal = parseFloat(discount) || 0;
  const taxableAmount = Math.max(0, calculatedSubtotal - discountVal);
  const taxRateVal = parseFloat(taxRate) || 0;
  const calculatedTax = (taxableAmount * taxRateVal) / 100;
  const calculatedGrandTotal = Math.round(taxableAmount + calculatedTax);
  const actualPaid =
    paymentStatus === "Paid"
      ? calculatedGrandTotal
      : paymentStatus === "Unpaid"
      ? 0
      : parseFloat(amountPaid) || 0;
  const calculatedBalanceDue = Math.max(0, calculatedGrandTotal - actualPaid);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Customer name and phone number are required");
      return;
    }
    if (saleItems.length === 0) {
      setError("Please add at least one stock item to this sale");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: nextInvNum,
          date: saleDate,
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim() || undefined,
            address: customerAddress.trim() || undefined,
            gstin: customerGst.trim() || undefined,
          },
          items: saleItems,
          subtotal: calculatedSubtotal,
          discount: discountVal,
          taxRate: taxRateVal,
          taxAmount: calculatedTax,
          grandTotal: calculatedGrandTotal,
          paymentStatus,
          paymentMode,
          amountPaid: actualPaid,
          balanceDue: calculatedBalanceDue,
          notes: saleNotes.trim(),
          recordedInLedger: recordInLedger,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create invoice");
      }

      const { invoice } = await res.json();
      setIsNewSaleOpen(false);
      await fetchSalesData();
      await fetchInventory();

      // Open printable invoice view immediately
      setSelectedInvoiceForView(invoice);
    } catch (err: any) {
      setError(err?.message || "Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice record?")) return;
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSalesData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenCollectModal = (inv: Invoice) => {
    setCollectModalInvoice(inv);
    setCollectAmount(inv.balanceDue > 0 ? inv.balanceDue.toString() : "");
    setCollectMode("UPI");
    setCollectRef("");
    setCollectNotes("");
    setCollectProofUrl("");
    setCollectError(null);
  };

  const handleCollectProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCollectProof(true);
    setCollectError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "rrtechservices/sales_proofs");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload payment proof");
      }

      const data = await res.json();
      setCollectProofUrl(data.url);
    } catch (err: any) {
      setCollectError(err.message || "Upload error");
    } finally {
      setUploadingCollectProof(false);
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
          proofUrl: collectProofUrl || undefined,
          notes: collectNotes.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record payment");
      }

      const data = await res.json();
      setCollectModalInvoice(null);
      await fetchSalesData();

      if (selectedInvoiceForView?.id === collectModalInvoice.id && data.invoice) {
        setSelectedInvoiceForView(data.invoice);
      }
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>Sales &amp; Tax Invoices</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Generate printable invoices, allocate stock items to customers &amp; auto-credit wallet
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSalesData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenNewSale}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale &amp; Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Revenue Collected
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            ₹{stats.totalRevenue?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Across all paid invoices</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Billed
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{stats.totalBilled?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Gross invoiced value</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Pending / Due Balance
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            ₹{stats.totalPending?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Receivable from customers</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Items &amp; Units Sold
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-600">
            {stats.totalUnitsSold || 0} Units
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{stats.totalInvoices || 0} total invoices</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("Paid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "Paid" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setStatusFilter("Partial")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "Partial" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600"
            }`}
          >
            Partial
          </button>
          <button
            onClick={() => setStatusFilter("Unpaid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "Unpaid" ? "bg-red-600 text-white shadow-2xs" : "text-slate-600"
            }`}
          >
            Unpaid
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSalesData()}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">Sales Invoices</h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {invoices.length} invoices
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>Loading invoices...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Receipt className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No invoices recorded yet</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Create a new sale above to generate an invoice and allocate items from your stock.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Allocated Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Invoice View</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {invoices.map((inv) => {
                  const isPaid = inv.paymentStatus === "Paid";
                  const isPartial = inv.paymentStatus === "Partial";

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {inv.invoiceNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatISTDate(inv.date)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inv.customer.name}</div>
                        <div className="text-[10.5px] text-slate-500 font-mono">
                          {inv.customer.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-slate-700 font-medium">
                          {inv.items.map((i) => `${i.quantity}x ${i.itemName}`).join(", ")}
                        </div>
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                          {inv.items.map((i) => i.itemCode).filter(Boolean).join(" • ")}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isPartial
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                          <span>{inv.paymentStatus}</span>
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Via {inv.paymentMode}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-black text-slate-900">
                        ₹{inv.grandTotal?.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {inv.balanceDue > 0 ? (
                          <span className="font-bold text-red-600">
                            ₹{inv.balanceDue?.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => handleOpenCollectModal(inv)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer border border-emerald-200"
                              title="Record payment settlement"
                            >
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span>Collect</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoiceForView(inv)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
                            title="View A4 Tax Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>A4 Invoice</span>
                          </button>
                          <Link
                            href={`/admin/sales/invoice/${inv.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Open full A4 page in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete invoice"
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

      {/* New Sale & Invoice Drawer/Modal */}
      {isNewSaleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[95vh] flex flex-col overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">New Sale &amp; Invoice</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Invoice #{nextInvNum} &bull; Allocates units from stock automatically
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewSaleOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Customer Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  1. Customer Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="customer@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Address / City (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Kothrud, Pune"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Items Allocation */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    2. Select Items to Sell / Allocate ({saleItems.length})
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold">
                    Deducts shelf stock in real-time
                  </span>
                </div>

                {/* Item Selector Box */}
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {/* Item dropdown */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Select Item from Stock
                      </label>
                      <select
                        value={selectedStockId}
                        onChange={(e) => {
                          setSelectedStockId(e.target.value);
                          const itm = inventory.find((i) => i.id === e.target.value);
                          if (itm) {
                            setSelectedItemPrice(String(itm.sellingPrice || ""));
                          }
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                      >
                        <option value="">-- Choose Stock Item --</option>
                        {inventory.map((inv) => (
                          <option
                            key={inv.id}
                            value={inv.id}
                            disabled={inv.availableQuantity === 0}
                          >
                            [{inv.code}] {inv.name} (Stock: {inv.availableQuantity} left)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Qty */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selectedItemQty}
                        onChange={(e) => setSelectedItemQty(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Unit Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="22000"
                        value={selectedItemPrice}
                        onChange={(e) => setSelectedItemPrice(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Serial input if serialized */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Assigned Serial Number(s) for this customer (e.g. for Laptop/Device)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SN-DELL-89312 (separate multiple with commas)"
                      value={selectedItemSerials}
                      onChange={(e) => setSelectedItemSerials(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      disabled={!selectedStockId}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      + Add to Invoice
                    </button>
                  </div>
                </div>

                {/* Line items table */}
                {saleItems.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Item / Code</th>
                          <th className="py-2.5 px-3">Serial(s)</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Price</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {saleItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3">
                              <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
                                {item.itemCode}
                              </span>
                              <span className="font-bold text-slate-900">{item.itemName}</span>
                            </td>
                            <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">
                              {item.serialNumbers?.join(", ") || "-"}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-800">
                              {item.quantity}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-700">
                              ₹{item.unitPrice.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-black text-slate-900">
                              ₹{item.total.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveLineItem(idx)}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No items added to invoice yet.</p>
                )}
              </div>

              {/* Financials & Payment */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  3. Pricing &amp; Payment Settlement
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      GST / Tax Rate (%)
                    </label>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                    >
                      <option value="0">0% (Exempt / Retail)</option>
                      <option value="18">18% GST (Standard)</option>
                      <option value="12">12% GST</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                    >
                      <option value="Paid">Fully Paid</option>
                      <option value="Partial">Partial Advance</option>
                      <option value="Unpaid">Unpaid / Credit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI (GPay/PhonePe)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card">Card</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                {paymentStatus === "Partial" && (
                  <div className="w-48">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Amount Paid Today (₹)
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="10000"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                )}

                {/* Grand Total Summary Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-500">
                      Subtotal: <span className="font-semibold text-slate-800">₹{calculatedSubtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {discountVal > 0 && (
                      <div className="text-rose-600">
                        Discount: -₹{discountVal.toLocaleString("en-IN")}
                      </div>
                    )}
                    {taxRateVal > 0 && (
                      <div className="text-slate-500">
                        GST ({taxRateVal}%): +₹{calculatedTax.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Grand Total
                    </span>
                    <div className="text-2xl font-black text-blue-600">
                      ₹{calculatedGrandTotal.toLocaleString("en-IN")}
                    </div>
                    {calculatedBalanceDue > 0 && (
                      <div className="text-xs font-bold text-red-600 mt-0.5">
                        Balance Due: ₹{calculatedBalanceDue.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Wallet Ledger Auto-Credit Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="recordLedger"
                    checked={recordInLedger}
                    onChange={(e) => setRecordInLedger(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <label htmlFor="recordLedger" className="text-xs font-semibold text-slate-700">
                    Automatically record this payment as a Credit in the Wallet Ledger
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewSaleOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || saleItems.length === 0}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Invoice...</span>
                    </>
                  ) : (
                    <span>Save Sale &amp; Print Invoice</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Viewer / Full A4 Printable Modal */}
      {selectedInvoiceForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden animate-slide-down">
            {/* Header controls (hidden in print) */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-bold text-sm text-slate-900 block leading-tight">
                    Full A4 Tax Invoice &bull; {selectedInvoiceForView.invoiceNumber}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Billed to: {selectedInvoiceForView.customer.name} ({selectedInvoiceForView.customer.phone})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/sales/invoice/${selectedInvoiceForView.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Page A4</span>
                </Link>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Full A4</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForView(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Invoice Sheet Container */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-200/60 flex justify-center print:bg-white print:p-0">
              <A4InvoiceView invoice={selectedInvoiceForView} />
            </div>
          </div>
        </div>
      )}

      {/* Payment Settlement Modal */}
      {collectModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Collect Payment &bull; {collectModalInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setCollectModalInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              {collectError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {collectError}
                </div>
              )}

              {/* Customer & Invoice summary */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Customer:</span>
                  <span>{collectModalInvoice.customer.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Invoice Total:</span>
                  <span>₹{collectModalInvoice.grandTotal?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Already Paid:</span>
                  <span>₹{collectModalInvoice.amountPaid?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1">
                  <span>Balance Due:</span>
                  <span>₹{collectModalInvoice.balanceDue?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Amount to Collect */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={collectModalInvoice.balanceDue}
                  step="any"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-base font-bold text-slate-900"
                  placeholder="Enter amount"
                  required
                />
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setCollectAmount(collectModalInvoice.balanceDue.toString())}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Full Balance (₹{collectModalInvoice.balanceDue})
                  </button>
                  {collectModalInvoice.balanceDue > 1000 && (
                    <button
                      type="button"
                      onClick={() => setCollectAmount((collectModalInvoice.balanceDue / 2).toString())}
                      className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                    >
                      50% (₹{Math.round(collectModalInvoice.balanceDue / 2)})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Cash", "UPI", "Bank Transfer", "Card", "Cheque", "Other"] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCollectMode(mode)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                        collectMode === mode
                          ? "bg-emerald-50 text-emerald-800 border-emerald-500 shadow-2xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* UTR / Ref Number */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reference / UTR Number (Optional)
                </label>
                <input
                  type="text"
                  value={collectRef}
                  onChange={(e) => setCollectRef(e.target.value)}
                  placeholder="e.g. UPI Ref / Cheque No."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Proof / Screenshot Upload (Cloudinary) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Proof / Screenshot (Cloudinary)
                </label>
                {collectProofUrl ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <img
                      src={collectProofUrl}
                      alt="Proof"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-300"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-emerald-700 block truncate flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Uploaded to Cloudinary
                      </span>
                      <a
                        href={collectProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline block truncate"
                      >
                        View full proof image &rarr;
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCollectProofUrl("")}
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
                      onChange={handleCollectProofUpload}
                      disabled={uploadingCollectProof}
                      id="collect-proof-input"
                      className="hidden"
                    />
                    <label
                      htmlFor="collect-proof-input"
                      className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 transition cursor-pointer text-xs font-semibold text-slate-600"
                    >
                      {uploadingCollectProof ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>Uploading Proof to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          <span>Upload UPI / Bank Receipt Screenshot</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Collection Note (Optional)
                </label>
                <input
                  type="text"
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  placeholder="e.g. Cleared 2nd installment via GPay"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCollectModalInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={collectSubmitting || uploadingCollectProof}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {collectSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Auto-Credit Wallet</span>
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

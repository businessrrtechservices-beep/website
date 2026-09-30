"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Search,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Tag,
  CreditCard,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { Dealer, DealerTransaction } from "@/lib/dealerTypes";
import { PaymentMode } from "@/lib/ledgerTypes";
import { InventoryCategory } from "@/lib/inventoryTypes";
import { formatISTDateTime, parseToISTIsoString } from "@/lib/dateUtils";

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [summary, setSummary] = useState<any>({
    totalDealers: 0,
    totalPurchased: 0,
    totalPaid: 0,
    totalOutstanding: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDealerForPay, setSelectedDealerForPay] = useState<Dealer | null>(null);

  // Credit Ledger Modal
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedDealerForLedger, setSelectedDealerForLedger] = useState<Dealer | null>(null);
  const [dealerTransactions, setDealerTransactions] = useState<DealerTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // New Dealer Form
  const [formName, setFormName] = useState("");
  const [formContactPerson, setFormContactPerson] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formGstin, setFormGstin] = useState("");
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<InventoryCategory[]>([]);
  const [formNotes, setFormNotes] = useState("");

  // Pay Dealer Form
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState<PaymentMode>("Bank Transfer");
  const [payRef, setPayRef] = useState("");
  const [payReason, setPayReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dealers");
      if (res.ok) {
        const data = await res.json();
        setDealers(data.dealers || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/inventory/categories");
      if (res.ok) {
        const data = await res.json();
        setDbCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    fetchDealers();
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setError(null);
    setFormName("");
    setFormContactPerson("");
    setFormPhone("");
    setFormEmail("");
    setFormAddress("");
    setFormGstin("");
    setFormCategories([]);
    setFormNotes("");
    setIsAddModalOpen(true);
  };

  const handleToggleCategory = (cat: string) => {
    if (formCategories.includes(cat)) {
      setFormCategories(formCategories.filter((c) => c !== cat));
    } else {
      setFormCategories([...formCategories, cat]);
    }
  };

  const handleCreateDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      setError("Dealer name and phone number are required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          contactPerson: formContactPerson.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          address: formAddress.trim(),
          gstin: formGstin.trim(),
          categories: formCategories,
          notes: formNotes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create dealer");
      }

      setIsAddModalOpen(false);
      await fetchDealers();
    } catch (err: any) {
      setError(err?.message || "Failed to save dealer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPayModal = (dealer: Dealer) => {
    setSelectedDealerForPay(dealer);
    setPayAmount(dealer.outstandingBalance > 0 ? String(dealer.outstandingBalance) : "");
    setPayMode("Bank Transfer");
    setPayReason(`Debt settlement for stock procured from ${dealer.name}`);
    setPayRef("");
    setIsPayModalOpen(true);
  };

  const handleOpenLedgerModal = async (dealer: Dealer) => {
    setSelectedDealerForLedger(dealer);
    setIsLedgerModalOpen(true);
    setLoadingTransactions(true);
    try {
      const res = await fetch(`/api/dealers/transactions?dealerId=${dealer.id}`);
      if (res.ok) {
        const data = await res.json();
        setDealerTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load dealer transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealerForPay || !payAmount || Number(payAmount) <= 0) return;

    setSubmitting(true);
    try {
      const amount = parseFloat(payAmount);

      // Record dealer payment via transactions endpoint (which also records in main ledger)
      const res = await fetch("/api/dealers/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId: selectedDealerForPay.id,
          dealerName: selectedDealerForPay.name,
          amount,
          paymentMode: payMode,
          referenceNumber: payRef.trim(),
          description: payReason || `Payment to dealer: ${selectedDealerForPay.name}`,
          date: parseToISTIsoString(),
          syncMainLedger: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process payment");
      }

      setIsPayModalOpen(false);
      await fetchDealers();

      // If ledger modal is open, refresh transactions
      if (selectedDealerForLedger && selectedDealerForLedger.id === selectedDealerForPay.id) {
        const txRes = await fetch(`/api/dealers/transactions?dealerId=${selectedDealerForPay.id}`);
        if (txRes.ok) {
          const txData = await txRes.json();
          setDealerTransactions(txData.transactions || []);
        }
      }
    } catch (err: any) {
      alert(err?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDealer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dealer and their entire transaction history?")) return;
    try {
      const res = await fetch(`/api/dealers/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchDealers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDealers = dealers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.toLowerCase().includes(search.toLowerCase()) ||
      d.categories?.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>Dealers &amp; Supplier Credit Ledger</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Track stock purchases on credit, supplier payables, settlement history &amp; dealer accounts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDealers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dealer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Registered Dealers
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {summary.totalDealers || 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Active vendors</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Stock Procured
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{summary.totalPurchased?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Cumulative inventory cost</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Paid to Dealers
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            ₹{summary.totalPaid?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Cleared via wallet debits</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Outstanding Payable (Credit)
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            ₹{summary.totalOutstanding?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Pending dealer bills</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dealer by name, phone, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredDealers.length} of {dealers.length} dealers
        </span>
      </div>

      {/* Dealers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>Loading dealers...</span>
          </div>
        ) : filteredDealers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Truck className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No dealers found</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Add your laptop and accessory wholesale suppliers above to link with stock procurement, credit tracking, and wallet debits.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Dealer Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Supplied Categories</th>
                  <th className="py-3 px-4 text-right">Procured</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Outstanding Credit</th>
                  <th className="py-3 px-4 text-center">Credit Ledger</th>
                  <th className="py-3 px-4 text-center">Quick Pay</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDealers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-sm">{d.name}</div>
                      {d.contactPerson && (
                        <div className="text-[11px] text-slate-500">Contact: {d.contactPerson}</div>
                      )}
                      {d.gstin && (
                        <div className="text-[10px] font-mono text-slate-400">GSTIN: {d.gstin}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-[11px] text-slate-800 font-semibold">{d.phone}</div>
                      {d.email && <div className="text-[10px] text-slate-400">{d.email}</div>}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {d.address || "-"}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {d.categories?.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[9.5px] font-bold border border-blue-200"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-700">
                      ₹{d.totalPurchased?.toLocaleString("en-IN") || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-semibold text-emerald-600">
                      ₹{d.totalPaid?.toLocaleString("en-IN") || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {d.outstandingBalance > 0 ? (
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          ₹{d.outstandingBalance.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ₹0 (Settled)
                        </span>
                      )}
                    </td>

                    {/* View Full Credit Ledger */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenLedgerModal(d)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
                        title="View complete credit purchases and payment history"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Credit History</span>
                      </button>
                    </td>

                    {/* Quick Pay */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenPayModal(d)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteDealer(d.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete dealer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit History & Ledger Modal */}
      {isLedgerModalOpen && selectedDealerForLedger && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-down">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>Credit Ledger &bull; {selectedDealerForLedger.name}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedDealerForLedger.phone}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Item-by-item stock purchases on credit &amp; settlement payment history
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-white border-b border-slate-100 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Total Procured
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900">
                  ₹{selectedDealerForLedger.totalPurchased?.toLocaleString("en-IN") || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Total Paid
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-700">
                  ₹{selectedDealerForLedger.totalPaid?.toLocaleString("en-IN") || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                  Outstanding Debt
                </span>
                <span className="text-sm sm:text-base font-black text-rose-700">
                  ₹{selectedDealerForLedger.outstandingBalance?.toLocaleString("en-IN") || 0}
                </span>
              </div>
            </div>

            {/* Transactions List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Transaction Audit Trail ({dealerTransactions.length})
                </h4>
                <button
                  onClick={() => {
                    handleOpenPayModal(selectedDealerForLedger);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Settle / Pay Debt</span>
                </button>
              </div>

              {loadingTransactions ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                  <span>Loading dealer credit history...</span>
                </div>
              ) : dealerTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-700">No credit history recorded yet</p>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    When you add stock items in Inventory and select this dealer with &ldquo;Bought on Credit&rdquo;, purchases will automatically appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[9.5px]">
                        <th className="py-2.5 px-3">Date &amp; Time</th>
                        <th className="py-2.5 px-3">Transaction Type</th>
                        <th className="py-2.5 px-3">Description / Item Code</th>
                        <th className="py-2.5 px-3">Ref / Mode</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {dealerTransactions.map((tx) => {
                        const isCredit = tx.type === "credit_purchase";
                        const formattedDate = formatISTDateTime(tx.date);

                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                              {formattedDate}
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isCredit
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {isCredit ? (
                                  <>
                                    <ArrowUpRight className="w-3 h-3 text-rose-600" />
                                    <span>Credit Purchase</span>
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                                    <span>Payment Settled</span>
                                  </>
                                )}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-slate-900 font-medium max-w-xs">
                              <div>{tx.description}</div>
                              {tx.itemCode && (
                                <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                  SKU: {tx.itemCode}
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                              {tx.paymentMode && (
                                <span className="font-semibold text-slate-700 mr-1.5">
                                  {tx.paymentMode}
                                </span>
                              )}
                              {tx.referenceNumber ? (
                                <span className="font-mono text-slate-500">#{tx.referenceNumber}</span>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td
                              className={`py-2.5 px-3 text-right whitespace-nowrap font-black text-xs ${
                                isCredit ? "text-rose-600" : "text-emerald-600"
                              }`}
                            >
                              {isCredit ? "+₹" : "-₹"}
                              {tx.amount?.toLocaleString("en-IN")}
                            </td>

                            <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-slate-900 text-xs">
                              ₹{tx.balanceAfter?.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-100 flex justify-end bg-slate-50/80">
              <button
                type="button"
                onClick={() => setIsLedgerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Dealer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add New Dealer / Supplier</h3>
                  <p className="text-xs text-slate-500 font-medium">Link with stock procurement &amp; payments</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDealer} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dealer / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Tech Wholesale"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mahesh Sharma"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9822019283"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="sales@apextech.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    placeholder="27ABCDE1234F1Z5"
                    value={formGstin}
                    onChange={(e) => setFormGstin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shop / Warehouse Address
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Shop No. 4, Sadashiv Peth, Pune"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Supplied Categories Checkboxes from DB */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Type of Categories Supplied</span>
                  <span className="text-[10px] text-slate-400 font-normal">(from MongoDB)</span>
                </label>
                {dbCategories.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                    No categories registered in database yet. Add categories in the{" "}
                    <a href="/admin/inventory" className="text-blue-600 font-bold hover:underline">
                      Inventory section
                    </a>.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {dbCategories.map((cat) => {
                      const isChecked = formCategories.includes(cat.name);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleToggleCategory(cat.name)}
                          className={`p-2 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? "bg-blue-50 border-blue-400 text-blue-800"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span>{cat.name}</span>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Dealer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Dealer Modal */}
      {isPayModalOpen && selectedDealerForPay && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Record Payment &bull; {selectedDealerForPay.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Auto-records a Debit in Main Wallet &amp; settles dealer credit balance
                </p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-4 sm:p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Payment Amount (₹) *
                  </label>
                  {selectedDealerForPay.outstandingBalance > 0 && (
                    <span className="text-[11px] font-bold text-rose-600">
                      Owed: ₹{selectedDealerForPay.outstandingBalance.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    UTR / Cheque Ref
                  </label>
                  <input
                    type="text"
                    placeholder="Ref number"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason / Bill Note
                </label>
                <input
                  type="text"
                  value={payReason}
                  onChange={(e) => setPayReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {submitting ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

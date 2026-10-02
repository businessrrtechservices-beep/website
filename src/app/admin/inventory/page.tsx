"use client";

import { useState, useEffect } from "react";
import {
  Boxes,
  Plus,
  Search,
  RefreshCw,
  Tag,
  Laptop,
  Layers,
  IndianRupee,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  Eye,
  FileText,
  SlidersHorizontal,
  Truck,
  Wallet,
  CreditCard,
  Handshake,
  Package,
} from "lucide-react";
import { InventoryCategory, InventoryItem, StockAllocationRecord } from "@/lib/inventoryTypes";
import { Dealer } from "@/lib/dealerTypes";
import { Brand } from "@/lib/brandTypes";

export default function AdminInventoryPage() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [selectedItemForAudit, setSelectedItemForAudit] = useState<InventoryItem | null>(null);

  // 1-Click Restock Modal State
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState("1");
  const [restockPurchasePrice, setRestockPurchasePrice] = useState("");
  const [restockSellingPrice, setRestockSellingPrice] = useState("");
  const [restockFinanceMode, setRestockFinanceMode] = useState<"wallet" | "credit" | "partner_borrowing" | "none">("wallet");
  const [restockPaymentMode, setRestockPaymentMode] = useState<"Cash" | "UPI" | "Bank Transfer" | "Card" | "Cheque">("Cash");
  const [restockPaymentRef, setRestockPaymentRef] = useState("");
  const [restockDealerId, setRestockDealerId] = useState("");
  const [restockPartnerId, setRestockPartnerId] = useState("");
  const [restockSerials, setRestockSerials] = useState("");
  const [restockSplitUnits, setRestockSplitUnits] = useState(false);
  const [restockSubmitting, setRestockSubmitting] = useState(false);
  const [restockError, setRestockError] = useState<string | null>(null);
  const [partnerWallets, setPartnerWallets] = useState<any[]>([]);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formSubcategory, setFormSubcategory] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formCondition, setFormCondition] = useState<any>("Brand New");
  const [formSerials, setFormSerials] = useState("");
  const [formPurchasePrice, setFormPurchasePrice] = useState("");
  const [formSellingPrice, setFormSellingPrice] = useState("");
  const [formStockQuantity, setFormStockQuantity] = useState("1");
  const [formDealerId, setFormDealerId] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formNotes, setFormNotes] = useState("");
  
  // Laptop specific specs
  const [formProcessor, setFormProcessor] = useState("");
  const [formRam, setFormRam] = useState("");
  const [formStorage, setFormStorage] = useState("");
  const [formScreen, setFormScreen] = useState("");

  // Subcategory modal state
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [targetCategoryForSub, setTargetCategoryForSub] = useState("");

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySubs, setNewCategorySubs] = useState("");

  // Brand modal state & Finance Settlement
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandOrigin, setNewBrandOrigin] = useState("");
  const [formBoughtOnCredit, setFormBoughtOnCredit] = useState(true);
  const [formSplitUnits, setFormSplitUnits] = useState(true);
  const [formFinanceMode, setFormFinanceMode] = useState<"credit" | "wallet" | "none">("credit");
  const [formPaymentMode, setFormPaymentMode] = useState<"Cash" | "UPI" | "Bank Transfer" | "Cheque">("Cash");
  const [formPaymentRef, setFormPaymentRef] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/inventory/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !formCategory) {
          setFormCategory(data.categories[0].name);
          setFormSubcategory(data.categories[0].subcategories[0] || "General");
        }
      }
    } catch (err) {
      console.error(err);
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

  const fetchItems = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/inventory/items", window.location.origin);
      if (selectedCategory !== "all") url.searchParams.set("category", selectedCategory);
      if (search.trim()) url.searchParams.set("search", search.trim());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextCode = async () => {
    try {
      const res = await fetch("/api/inventory/next-code");
      if (res.ok) {
        const data = await res.json();
        setFormCode(data.code);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch (err) {
      console.error("Failed to load brands:", err);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBrandName.trim(),
          origin: newBrandOrigin.trim() || undefined,
        }),
      });
      if (res.ok) {
        setIsBrandModalOpen(false);
        setFormBrand(newBrandName.trim());
        setNewBrandName("");
        setNewBrandOrigin("");
        await fetchBrands();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPartnerWallets = async () => {
    try {
      const res = await fetch("/api/borrowing");
      if (res.ok) {
        const data = await res.json();
        const wallets = data.wallets || [];
        setPartnerWallets(wallets);
        if (wallets.length > 0 && !restockPartnerId) {
          setRestockPartnerId(wallets[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load partner wallets:", err);
    }
  };

  const handleOpenRestockModal = (item: InventoryItem) => {
    setSelectedItemForRestock(item);
    setRestockQty("1");
    setRestockPurchasePrice(item.purchasePrice ? String(item.purchasePrice) : "");
    setRestockSellingPrice(item.sellingPrice ? String(item.sellingPrice) : "");
    setRestockFinanceMode(item.dealerId ? "credit" : "wallet");
    setRestockPaymentMode("Cash");
    setRestockPaymentRef("");
    setRestockDealerId(item.dealerId || "");
    setRestockSerials("");
    setRestockSplitUnits(false);
    setRestockError(null);
    if (partnerWallets.length > 0 && !restockPartnerId) {
      setRestockPartnerId(partnerWallets[0].id);
    }
  };

  const handleConfirmRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRestock) return;

    const qty = parseInt(restockQty, 10);
    if (!qty || qty <= 0) {
      setRestockError("Please enter a valid restock quantity");
      return;
    }

    setRestockSubmitting(true);
    setRestockError(null);

    try {
      const selectedDealer = dealers.find((d) => d.id === restockDealerId);
      const selectedPartner = partnerWallets.find((p) => p.id === restockPartnerId);

      const res = await fetch(`/api/inventory/items/${selectedItemForRestock.id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockQuantity: qty,
          purchasePrice: parseFloat(restockPurchasePrice) || 0,
          sellingPrice: parseFloat(restockSellingPrice) || 0,
          financeMode: restockFinanceMode,
          paymentMode: restockPaymentMode,
          paymentRef: restockPaymentRef.trim(),
          dealerId: restockDealerId || undefined,
          dealerName: selectedDealer?.name || undefined,
          partnerId: restockFinanceMode === "partner_borrowing" ? restockPartnerId : undefined,
          partnerName: restockFinanceMode === "partner_borrowing" ? selectedPartner?.name : undefined,
          serialNumbers: restockSerials ? restockSerials.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean) : [],
          splitUnits: restockSplitUnits,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to restock item");
      }

      setSelectedItemForRestock(null);
      await fetchItems();
    } catch (err: any) {
      setRestockError(err.message || "Failed to restock item");
    } finally {
      setRestockSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDealers();
    fetchBrands();
    fetchPartnerWallets();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  useEffect(() => {
    if (!formDealerId && formFinanceMode === "credit") {
      setFormFinanceMode("wallet");
    }
  }, [formDealerId, formFinanceMode]);

  const handleOpenAddModal = async () => {
    setError(null);
    await fetchNextCode();
    setIsAddModalOpen(true);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory) {
      setError("Item name and category are required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const serialList = formSerials
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const selectedDealer = dealers.find((d) => d.id === formDealerId);

      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          code: formCode.trim(),
          category: formCategory,
          subcategory: formSubcategory || "General",
          brand: formBrand.trim(),
          model: formModel.trim(),
          condition: formCondition,
          serialNumbers: serialList,
          purchasePrice: parseFloat(formPurchasePrice) || 0,
          sellingPrice: parseFloat(formSellingPrice) || 0,
          stockQuantity: parseInt(formStockQuantity, 10) || 1,
          splitUnits: Boolean(parseInt(formStockQuantity, 10) > 1 && formSplitUnits),
          dealerId: selectedDealer?.id,
          dealerName: selectedDealer?.name,
          boughtOnCredit: Boolean(selectedDealer && formFinanceMode === "credit"),
          autoDeductWallet: formFinanceMode === "wallet",
          paymentMode: formPaymentMode,
          paymentRef: formPaymentRef.trim() || undefined,
          location: formLocation.trim(),
          notes: formNotes.trim(),
          specs: {
            processor: formProcessor.trim() || undefined,
            ram: formRam.trim() || undefined,
            storage: formStorage.trim() || undefined,
            screenSize: formScreen.trim() || undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add inventory item");
      }

      setIsAddModalOpen(false);
      // Reset form
      setFormName("");
      setFormBrand("");
      setFormModel("");
      setFormSerials("");
      setFormPurchasePrice("");
      setFormSellingPrice("");
      setFormStockQuantity("1");
      setFormDealerId("");
      setFormFinanceMode("credit");
      setFormPaymentMode("Cash");
      setFormPaymentRef("");
      setFormLocation("");
      setFormProcessor("");
      setFormRam("");
      setFormStorage("");
      setFormScreen("");
      setFormNotes("");
      await fetchItems();
    } catch (err: any) {
      setError(err?.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const subs = newCategorySubs
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/inventory/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          subcategories: subs,
        }),
      });

      if (res.ok) {
        setIsCategoryModalOpen(false);
        setNewCategoryName("");
        setNewCategorySubs("");
        await fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim() || !targetCategoryForSub) return;

    try {
      const res = await fetch("/api/inventory/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_subcategory",
          categoryId: targetCategoryForSub,
          subcategoryName: newSubcategoryName.trim(),
        }),
      });

      if (res.ok) {
        setIsSubcategoryModalOpen(false);
        setNewSubcategoryName("");
        await fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;
    try {
      const res = await fetch(`/api/inventory/items/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Inventory stats
  const totalStockUnits = items.reduce((acc, i) => acc + (i.stockQuantity || 0), 0);
  const totalAvailableUnits = items.reduce((acc, i) => acc + (i.availableQuantity || 0), 0);
  const totalAllocatedUnits = totalStockUnits - totalAvailableUnits;
  const totalStockValue = items.reduce(
    (acc, i) => acc + (i.availableQuantity || 0) * (i.purchasePrice || 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <span>Internal Shop Stock &amp; Inventory</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Internal hardware units, RRTS- codes, supplier credit, shelf locations &amp; customer allocation audit trails
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Brand</span>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Category</span>
          </button>

          <button
            onClick={() => {
              if (categories.length > 0) setTargetCategoryForSub(categories[0].id);
              setIsSubcategoryModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>+ Subcategory</span>
          </button>

          <button
            onClick={fetchItems}
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
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Unique SKUs
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{items.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">Categorized products</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Available on Shelf
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {totalAvailableUnits} Units
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Ready for immediate sale</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Allocated / Sold
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-600">
            {totalAllocatedUnits} Units
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Assigned to customer invoices</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Shelf Valuation (Cost)
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{totalStockValue.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Inventory investment</span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.name
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, name, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchItems()}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">Inventory Items</h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {items.length} products
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>Loading stock inventory...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Boxes className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No stock items found</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Add your first stock item (laptop, mouse, RAM, SSD) with unique RRTS code tracking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-4">Item / Laptop Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Brand / Model</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Allocation Audit</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {items.map((item) => {
                  const allocatedCount = item.stockQuantity - item.availableQuantity;
                  const isOutOfStock = item.availableQuantity === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      {/* Code */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.code}
                        </span>
                      </td>

                      {/* Name & specs */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {item.specs && (item.specs.processor || item.specs.ram) && (
                          <div className="text-[10.5px] text-slate-500 truncate max-w-xs mt-0.5">
                            {[item.specs.processor, item.specs.ram, item.specs.storage]
                              .filter(Boolean)
                              .join(" • ")}
                          </div>
                        )}
                        {item.serialNumbers?.length > 0 && (
                          <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                            S/N: {item.serialNumbers.slice(0, 2).join(", ")}
                            {item.serialNumbers.length > 2 ? ` (+${item.serialNumbers.length - 2} more)` : ""}
                          </div>
                        )}
                        {item.dealerName && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                              <Truck className="w-3 h-3 text-indigo-500" />
                              <span>Supplier: {item.dealerName}</span>
                            </span>
                            {item.boughtOnCredit && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[9.5px] font-bold">
                                On Credit
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold block w-fit">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {item.subcategory}
                        </span>
                      </td>

                      {/* Brand & Model */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                        <div className="font-semibold">{item.brand || "-"}</div>
                        <div className="text-[10.5px] text-slate-500">{item.model || ""}</div>
                      </td>

                      {/* Condition */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[10.5px] font-semibold text-slate-600">
                          {item.condition}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isOutOfStock
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : item.availableQuantity <= 2
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {item.availableQuantity} / {item.stockQuantity}
                          </span>
                          <span className="text-[9.5px] text-slate-400 mt-0.5">
                            {allocatedCount} sold
                          </span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right whitespace-nowrap text-slate-600">
                        ₹{item.purchasePrice?.toLocaleString("en-IN") || 0}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                        ₹{item.sellingPrice?.toLocaleString("en-IN") || 0}
                      </td>

                      {/* Allocation Audit */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedItemForAudit(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition cursor-pointer"
                        >
                          <Users className="w-3 h-3" />
                          <span>Who has this? ({item.allocatedRecords?.length || 0})</span>
                        </button>
                      </td>

                      {/* Actions: Restock + Delete */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenRestockModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition cursor-pointer border border-emerald-200 shadow-2xs"
                            title="Restock item without re-entering product details"
                          >
                            <Plus className="w-3 h-3 text-emerald-600" />
                            <span>Restock</span>
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocation Audit Modal (Who has this stock item?) */}
      {selectedItemForAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedItemForAudit.code}
                </span>
                {selectedItemForAudit.dealerName && (
                  <span className="ml-2 inline-flex items-center gap-1 font-sans text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    <Truck className="w-3 h-3" /> Supplier: {selectedItemForAudit.dealerName}
                  </span>
                )}
                <h3 className="mt-1 text-base font-black text-slate-900">
                  Stock Allocation History &bull; {selectedItemForAudit.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedItemForAudit.availableQuantity} of {selectedItemForAudit.stockQuantity} units available on shelf
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForAudit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {(!selectedItemForAudit.allocatedRecords || selectedItemForAudit.allocatedRecords.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">All {selectedItemForAudit.stockQuantity} units currently in shop</p>
                  <p className="text-slate-400 mt-1">No units of this item have been sold or allocated yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Customer Allocation Records ({selectedItemForAudit.allocatedRecords.length})
                  </span>
                  {selectedItemForAudit.allocatedRecords.map((record, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{record.customerName}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{record.customerPhone}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                          Invoice: {record.invoiceNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-slate-600 flex-wrap">
                        <div>
                          <span className="text-slate-400">Allocated Units: </span>
                          <span className="font-bold text-slate-900">{record.quantity}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Sold Price: </span>
                          <span className="font-bold text-emerald-700">₹{record.sellingPrice?.toLocaleString("en-IN")}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Date: </span>
                          <span>{record.date}</span>
                        </div>
                      </div>

                      {record.serialNumbers && record.serialNumbers.length > 0 && (
                        <div className="pt-1 border-t border-slate-200/80">
                          <span className="text-slate-400 font-medium">Assigned Serial Numbers: </span>
                          <span className="font-mono font-bold text-blue-800">
                            {record.serialNumbers.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedItemForAudit(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Stock Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Stock Item</h3>
                  <p className="text-xs text-slate-500 font-medium">Laptops, mouse, screens &amp; accessories</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Item Code (SKU) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="RRTS-ITM-1001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Item / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dell Latitude 7490 or Logitech B100 USB Mouse"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Category, Subcategory & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Category *</span>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-blue-600 hover:underline text-[10px] font-bold"
                    >
                      + New
                    </button>
                  </label>
                  {categories.length > 0 ? (
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        setFormCategory(e.target.value);
                        const cat = categories.find((c) => c.name === e.target.value);
                        if (cat && cat.subcategories?.length > 0) {
                          setFormSubcategory(cat.subcategories[0]);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Laptops, Accessories"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Subcategory</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (categories.length > 0) setTargetCategoryForSub(categories[0].id);
                        setIsSubcategoryModalOpen(true);
                      }}
                      className="text-blue-600 hover:underline text-[10px] font-bold"
                    >
                      + New
                    </button>
                  </label>
                  {categories.find((c) => c.name === formCategory)?.subcategories?.length ? (
                    <select
                      value={formSubcategory}
                      onChange={(e) => setFormSubcategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {categories
                        .find((c) => c.name === formCategory)
                        ?.subcategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Business, Gaming, Mouse"
                      value={formSubcategory}
                      onChange={(e) => setFormSubcategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Condition
                  </label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Refurbished A-Grade">Refurbished A-Grade</option>
                    <option value="Refurbished B-Grade">Refurbished B-Grade</option>
                    <option value="Used">Used / Tested Working</option>
                  </select>
                </div>
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Brand *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsBrandModalOpen(true)}
                      className="text-blue-600 hover:underline text-[10px] font-bold cursor-pointer"
                    >
                      + New Brand
                    </button>
                  </div>
                  <input
                    type="text"
                    list="inventory-brands-list"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. Dell, HP, Apple, Logitech..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <datalist id="inventory-brands-list">
                    {brands.map((b) => (
                      <option key={b.id} value={b.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Model Number / Name
                  </label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="e.g. Latitude 7490"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Laptop Specs (Accordion / Inline for convenience) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Hardware Specifications (Laptops &amp; PCs)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Processor (e.g. i5 8th Gen)"
                    value={formProcessor}
                    onChange={(e) => setFormProcessor(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="RAM (e.g. 16GB DDR4)"
                    value={formRam}
                    onChange={(e) => setFormRam(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Storage (e.g. 512GB NVMe SSD)"
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Screen (e.g. 14 FHD IPS)"
                    value={formScreen}
                    onChange={(e) => setFormScreen(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Serial Numbers */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unit Serial Numbers (One per line or comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={formSerials}
                  onChange={(e) => setFormSerials(e.target.value)}
                  placeholder="e.g. 8GHY293, 8GHY294 (Useful for serialized laptops, motherboards & drives)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Pricing & Stock Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formStockQuantity}
                    onChange={(e) => setFormStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="15000"
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="22000"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Multi-unit ID Allocation Selector */}
              {parseInt(formStockQuantity, 10) > 1 && (
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      ID Assignment for {formStockQuantity} Units:
                    </label>
                    <span className="text-[10px] text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                      {formSplitUnits ? "Unique ID per Unit" : "1 Batch ID"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormSplitUnits(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-start gap-1 transition cursor-pointer text-left ${
                        formSplitUnits
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <Laptop className="w-3.5 h-3.5 shrink-0" />
                        <span>Separate Unique ID for each ({formCode || "RRTS-ITM-1001"}, 1002...)</span>
                      </div>
                      <span className={`text-[10.5px] font-normal ${formSplitUnits ? "text-blue-100" : "text-slate-500"}`}>
                        Recommended for laptops &amp; desktops.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormSplitUnits(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-start gap-1 transition cursor-pointer text-left ${
                        !formSplitUnits
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <Boxes className="w-3.5 h-3.5 shrink-0" />
                        <span>Single Batch ID (Qty = {formStockQuantity})</span>
                      </div>
                      <span className={`text-[10.5px] font-normal ${!formSplitUnits ? "text-blue-100" : "text-slate-500"}`}>
                        Recommended for mice, cables, RAM &amp; accessories.
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dealer Supplier & Shelf Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Procured From Dealer</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <select
                    value={formDealerId}
                    onChange={(e) => {
                      setFormDealerId(e.target.value);
                      if (e.target.value) setFormBoughtOnCredit(true);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">-- No Dealer / Direct / Customer --</option>
                    {dealers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.categories?.join(", ") || "General"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Storage Shelf / Rack
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rack A-1, Showcase 2"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Payment & Accounting Settlement */}
              {(() => {
                const totalCost = (parseFloat(formPurchasePrice) || 0) * (parseInt(formStockQuantity, 10) || 1);
                return (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-blue-600" />
                        Payment & Accounting Settlement
                      </label>
                      <span className="text-xs font-semibold text-slate-500">
                        Total Purchase: <span className="font-bold text-slate-900">₹{totalCost.toLocaleString("en-IN")}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Option 1: Auto Deduct from Wallet */}
                      <button
                        type="button"
                        onClick={() => setFormFinanceMode("wallet")}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          formFinanceMode === "wallet"
                            ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                            Auto-Deduct Wallet
                          </span>
                          <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${formFinanceMode === "wallet" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`}>
                            {formFinanceMode === "wallet" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          Paid on delivery. Debits shop wallet immediately.
                        </p>
                      </button>

                      {/* Option 2: Bought on Credit */}
                      <button
                        type="button"
                        disabled={!formDealerId}
                        onClick={() => formDealerId && setFormFinanceMode("credit")}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          !formDealerId
                            ? "border-slate-200 bg-slate-100/60 text-slate-400 opacity-60 cursor-not-allowed"
                            : formFinanceMode === "credit"
                            ? "border-amber-500 bg-amber-50/70 text-amber-950 ring-1 ring-amber-500 cursor-pointer"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                            Bought on Credit
                          </span>
                          <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${formFinanceMode === "credit" ? "border-amber-600 bg-amber-600" : "border-slate-300"}`}>
                            {formFinanceMode === "credit" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          {formDealerId ? "Supplier credit. Pay dealer later." : "Requires dealer selected above"}
                        </p>
                      </button>

                      {/* Option 3: No Financial Log */}
                      <button
                        type="button"
                        onClick={() => setFormFinanceMode("none")}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          formFinanceMode === "none"
                            ? "border-blue-500 bg-blue-50/70 text-blue-950 ring-1 ring-blue-500"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            Stock Only
                          </span>
                          <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${formFinanceMode === "none" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                            {formFinanceMode === "none" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          Record stock count only. No ledger or debt changes.
                        </p>
                      </button>
                    </div>

                    {/* Auto-Deduct Wallet Extra Fields */}
                    {formFinanceMode === "wallet" && (
                      <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                            Payment Mode (Source of Funds)
                          </label>
                          <select
                            value={formPaymentMode}
                            onChange={(e) => setFormPaymentMode(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                          >
                            <option value="Cash">Cash (Shop Drawer)</option>
                            <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                            <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                            <option value="Cheque">Cheque</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                            Reference / UTR No. (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. UPI Ref # or Bill #"
                            value={formPaymentRef}
                            onChange={(e) => setFormPaymentRef(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add to Stock</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {isSubcategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Add Subcategory</h3>
              <button
                onClick={() => setIsSubcategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubcategory} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Category</label>
                <select
                  value={targetCategoryForSub}
                  onChange={(e) => setTargetCategoryForSub(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Subcategory Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Keyboards"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubcategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Add Inventory Category</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptops, Desktops, Mouse, RAM"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subcategories (Comma-separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Business, Gaming, MacBooks"
                  value={newCategorySubs}
                  onChange={(e) => setNewCategorySubs(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Add Brand (MongoDB)</h3>
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBrand} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lenovo, Asus, Acer, Corsair, Crucial"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Country / Origin (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. USA, Taiwan, Japan"
                  value={newBrandOrigin}
                  onChange={(e) => setNewBrandOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Fast Restock Modal Dialog */}
      {selectedItemForRestock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                  ⚡ 1-Click Quick Restock
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Restock: {selectedItemForRestock.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Product specs and details are automatically repopulated. Enter only restocking quantities &amp; accounting.
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForRestock(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pre-populated Product Chip */}
            <div className="my-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-800">
                  {selectedItemForRestock.brand ? `${selectedItemForRestock.brand} ` : ""}
                  {selectedItemForRestock.model ? `• ${selectedItemForRestock.model}` : ""}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                  {selectedItemForRestock.category} / {selectedItemForRestock.subcategory}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-1.5">
                <span>
                  Current Stock:{" "}
                  <strong className="text-slate-800">
                    {selectedItemForRestock.availableQuantity} available
                  </strong>{" "}
                  ({selectedItemForRestock.stockQuantity} total)
                </span>
                <span className="font-mono text-slate-600">
                  SKU: {selectedItemForRestock.code}
                </span>
              </div>
            </div>

            {restockError && (
              <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{restockError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmRestock} className="space-y-4">
              {/* Restock Quantity, Cost, Selling Price */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    +Restock Qty *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-slate-900 text-sm font-black focus:outline-emerald-600 bg-emerald-50/30"
                    placeholder="e.g. 5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cost/Unit (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={restockPurchasePrice}
                    onChange={(e) => setRestockPurchasePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm font-bold focus:outline-blue-600"
                    placeholder="e.g. 1500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sell Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={restockSellingPrice}
                    onChange={(e) => setRestockSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm font-bold focus:outline-blue-600"
                    placeholder="e.g. 2200"
                  />
                </div>
              </div>

              {/* Total Restock Value Banner */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-semibold">Total Restock Purchase Value:</span>
                <span className="font-black text-emerald-800 text-sm font-mono">
                  ₹{(
                    (parseInt(restockQty, 10) || 0) * (parseFloat(restockPurchasePrice) || 0)
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Payment & Accounting Settlement Options */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Payment &amp; Accounting Settlement *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRestockFinanceMode("wallet")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      restockFinanceMode === "wallet"
                        ? "border-blue-600 bg-blue-50 text-blue-900 shadow-2xs font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Wallet className="w-3.5 h-3.5 text-blue-600" />
                      <span>Shop Cash / UPI Wallet</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                      Auto-debit ledger wallet drawer
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRestockFinanceMode("credit")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      restockFinanceMode === "credit"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Dealer Credit</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                      Increase supplier debt balance
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRestockFinanceMode("partner_borrowing")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      restockFinanceMode === "partner_borrowing"
                        ? "border-amber-600 bg-amber-50 text-amber-900 shadow-2xs font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Handshake className="w-3.5 h-3.5 text-amber-600" />
                      <span>Partner Out-of-Pocket</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                      Net ₹0 cash; shop owes partner
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRestockFinanceMode("none")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      restockFinanceMode === "none"
                        ? "border-slate-600 bg-slate-100 text-slate-900 shadow-2xs font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Boxes className="w-3.5 h-3.5 text-slate-500" />
                      <span>No Ledger Entry</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                      Stock count adjustment only
                    </span>
                  </button>
                </div>
              </div>

              {/* Conditional Partner / Dealer Selectors */}
              {restockFinanceMode === "partner_borrowing" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Paying Partner
                  </label>
                  <select
                    value={restockPartnerId}
                    onChange={(e) => setRestockPartnerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-amber-600"
                  >
                    {partnerWallets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Payment Mode & Reference (for wallet or partner) */}
              {(restockFinanceMode === "wallet" || restockFinanceMode === "partner_borrowing") && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={restockPaymentMode}
                      onChange={(e) => setRestockPaymentMode(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-blue-600"
                    >
                      <option value="Cash">Cash at Counter</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ref / UTR No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={restockPaymentRef}
                      onChange={(e) => setRestockPaymentRef(e.target.value)}
                      placeholder="e.g. UPI Ref / Challan #"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* Supplier / Dealer Selector (if credit or tracking) */}
              {dealers.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supplier / Dealer {restockFinanceMode === "credit" ? "*" : "(Optional)"}
                  </label>
                  <select
                    value={restockDealerId}
                    onChange={(e) => setRestockDealerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-blue-600"
                  >
                    <option value="">-- No Dealer Assigned --</option>
                    {dealers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} &bull; Outstanding Debt: ₹{(d.outstandingBalance || 0).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Serial Numbers / Batch Toggle */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Serial Numbers / IMEI (Optional)
                </label>
                <input
                  type="text"
                  value={restockSerials}
                  onChange={(e) => setRestockSerials(e.target.value)}
                  placeholder="Comma or line separated serials (e.g. SN1001, SN1002)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-blue-600"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedItemForRestock(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={restockSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {restockSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Restocking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Restock (+{restockQty || 1} Units)</span>
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

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
} from "lucide-react";
import { InventoryCategory, InventoryItem, StockAllocationRecord } from "@/lib/inventoryTypes";
import { Dealer } from "@/lib/dealerTypes";

export default function AdminInventoryPage() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [selectedItemForAudit, setSelectedItemForAudit] = useState<InventoryItem | null>(null);

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

  useEffect(() => {
    fetchCategories();
    fetchDealers();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

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
          dealerId: selectedDealer?.id,
          dealerName: selectedDealer?.name,
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
            <span>Stock &amp; Inventory Management</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Track laptops, computer accessories, RRTS codes &amp; customer allocation audit trails
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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
                          <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                            <Truck className="w-3 h-3 text-indigo-500" />
                            <span>Supplier: {item.dealerName}</span>
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

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete item"
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subcategory
                  </label>
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
                      )) || <option value="General">General</option>}
                  </select>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand (Dell, HP, Apple, Logitech...)
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. Dell"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
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

              {/* Dealer Supplier & Shelf Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Procured From Dealer</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <select
                    value={formDealerId}
                    onChange={(e) => setFormDealerId(e.target.value)}
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
    </div>
  );
}

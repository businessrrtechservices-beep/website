"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Upload,
  RefreshCw,
  Sparkles,
  Check,
  AlertCircle,
  X,
  Loader2,
  IndianRupee,
} from "lucide-react";
import { Product } from "@/lib/products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState<Product["brand"]>("Dell");
  const [formModel, setFormModel] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formCondition, setFormCondition] = useState<Product["condition"]>("Excellent");
  const [formBadge, setFormBadge] = useState<Product["badge"]>("Best Seller");
  const [formWarranty, setFormWarranty] = useState("6");
  const [formImage, setFormImage] = useState("");
  const [formCpu, setFormCpu] = useState("Intel Core i5");
  const [formRam, setFormRam] = useState("16 GB DDR4");
  const [formStorage, setFormStorage] = useState("512 GB SSD");
  const [formScreen, setFormScreen] = useState("14\" FHD IPS");
  const [formGpu, setFormGpu] = useState("");
  const [formFeatures, setFormFeatures] = useState("Tested Battery, Original Charger, Fast SSD, Warranty Included");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormBrand("Dell");
    setFormModel("");
    setFormPrice("");
    setFormMrp("");
    setFormCondition("Excellent");
    setFormBadge("Top Pick");
    setFormWarranty("6");
    setFormImage("/images/laptop-macbook-desk.jpg");
    setFormCpu("Intel Core i5");
    setFormRam("16 GB DDR4");
    setFormStorage("512 GB SSD");
    setFormScreen("14\" FHD IPS");
    setFormGpu("");
    setFormFeatures("Tested Battery, Original Charger, Fast SSD, Warranty Included");
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormModel(p.model);
    setFormPrice(p.price.toString());
    setFormMrp(p.mrp.toString());
    setFormCondition(p.condition);
    setFormBadge(p.badge || "Top Pick");
    setFormWarranty(p.warrantyMonths?.toString() || "6");
    setFormImage(p.image || "");
    setFormCpu(p.specs?.cpu || "");
    setFormRam(p.specs?.ram || "");
    setFormStorage(p.specs?.storage || "");
    setFormScreen(p.specs?.screen || "");
    setFormGpu(p.specs?.gpu || "");
    setFormFeatures(p.features?.join(", ") || "");
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Upload failed. Enter an image URL.");
      } else {
        setFormImage(data.url);
      }
    } catch (err: any) {
      alert("Upload failed: " + (err?.message || "Unknown error"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const priceNum = Number(formPrice);
    const mrpNum = Number(formMrp || priceNum * 1.2);
    const discountNum = Math.round(((mrpNum - priceNum) / mrpNum) * 100);

    const payload = {
      name: formName,
      brand: formBrand,
      model: formModel || formName,
      price: priceNum,
      mrp: mrpNum,
      discount: discountNum,
      condition: formCondition,
      badge: formBadge,
      warrantyMonths: Number(formWarranty) || 6,
      image: formImage || "/images/laptop-macbook-desk.jpg",
      specs: {
        cpu: formCpu,
        ram: formRam,
        storage: formStorage,
        screen: formScreen,
        gpu: formGpu,
      },
      features: formFeatures.split(",").map((f) => f.trim()).filter(Boolean),
    };

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update product");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create product");
      }

      setModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      setDeleteConfirmId(null);
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Feed and sync default products from products.ts into MongoDB?")) return;
    setSeedLoading(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/products/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: false }),
      });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage(`Done: ${data.message}`);
        await fetchProducts();
      } else {
        alert(data.error || "Failed to seed products");
      }
    } catch (err: any) {
      alert(err?.message || "Error seeding products");
    } finally {
      setSeedLoading(false);
      setTimeout(() => setSeedMessage(null), 4000);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = selectedBrand === "All" || p.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Product Catalog</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {products.length} Products
            </span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Manage refurbished laptops, specifications, prices &amp; Cloudinary photos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSeedDefaults}
            disabled={seedLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Populate or sync products from products.ts into MongoDB"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${seedLoading ? "animate-spin" : ""}`} />
            <span>Seed Default Products</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search laptops by name, model or specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-2xs"
          />
        </div>

        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {["All", "Dell", "HP", "Lenovo", "Apple", "Asus"].map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedBrand === brand
                  ? "bg-blue-600 text-white shadow-2xs font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading products from database...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <p className="text-sm font-bold text-slate-800">No products found</p>
            <p className="text-xs text-slate-500 mt-1">Try modifying your search or click &quot;Seed Default Products&quot; above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Brand &amp; Condition</th>
                  <th className="p-3.5">Key Specifications</th>
                  <th className="p-3.5">Price &amp; MRP</th>
                  <th className="p-3.5">Warranty</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              width={48}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400">No img</span>
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {p.name}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {p.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                        {p.brand}
                      </span>
                      <span className="ml-2 text-[11px] text-slate-500 font-medium">
                        {p.condition}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <p className="line-clamp-1 text-[11px]">
                        <span className="font-bold text-slate-800">{p.specs?.cpu}</span> &bull; {p.specs?.ram} &bull; {p.specs?.storage}
                      </p>
                      <p className="text-[10px] text-slate-400">{p.specs?.screen}</p>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-900">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                      {p.mrp && p.mrp > p.price && (
                        <span className="ml-1.5 text-[10px] text-slate-400 line-through">
                          ₹{p.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                      {p.discount ? (
                        <span className="ml-1 text-[10px] font-bold text-emerald-600">
                          ({p.discount}% OFF)
                        </span>
                      ) : null}
                    </td>

                    <td className="p-3.5 text-slate-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        {p.warrantyMonths || 6} Months
                      </span>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this laptop listing? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 cursor-pointer shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Refurbished Product"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dell Latitude 5420 (16GB / 512GB)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Brand</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    {["Dell", "HP", "Lenovo", "Apple", "Acer", "Asus", "Microsoft"].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Condition</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    {["Like New", "Excellent", "Very Good", "Good"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="28000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={formMrp}
                    onChange={(e) => setFormMrp(e.target.value)}
                    placeholder="34000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Badge</label>
                  <select
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    {["Best Seller", "Top Pick", "Like New", "Limited Stock"].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={formWarranty}
                    onChange={(e) => setFormWarranty(e.target.value)}
                    placeholder="6"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                {/* Cloudinary Image Upload Section */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <label className="block text-slate-800 font-bold">
                    Product Image (Cloudinary or URL)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-center">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="Image URL or upload via Cloudinary below"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none text-xs"
                      />
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition shrink-0 shadow-2xs">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload via Cloudinary</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formImage && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-500 font-medium">Preview:</span>
                      <div className="w-12 h-10 rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
                        <Image
                          src={formImage}
                          alt="Preview"
                          width={48}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hardware Specs */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">CPU / Processor</label>
                  <input
                    type="text"
                    value={formCpu}
                    onChange={(e) => setFormCpu(e.target.value)}
                    placeholder="Intel Core i5-1135G7"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">RAM</label>
                  <input
                    type="text"
                    value={formRam}
                    onChange={(e) => setFormRam(e.target.value)}
                    placeholder="16 GB DDR4"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Storage</label>
                  <input
                    type="text"
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value)}
                    placeholder="512 GB NVMe SSD"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Screen / Display</label>
                  <input
                    type="text"
                    value={formScreen}
                    onChange={(e) => setFormScreen(e.target.value)}
                    placeholder="14 FHD IPS Anti-Glare"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Features (comma separated)</label>
                  <input
                    type="text"
                    value={formFeatures}
                    onChange={(e) => setFormFeatures(e.target.value)}
                    placeholder="Backlit Keyboard, Fingerprint Reader, Thunderbolt 4, Wi-Fi 6"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 transition"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
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

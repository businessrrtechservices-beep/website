"use client";

import { useState, useMemo, useEffect } from "react";
import { Product, priceRanges } from "@/lib/productTypes";
import ProductCard from "./ProductCard";

export default function RefurbishedListing({ initialProducts = [] }: { initialProducts?: Product[] } = {}) {
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating" | "discount" | "newest">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProductList(initialProducts);
    } else {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.products?.length > 0) {
            setProductList(data.products);
          }
        })
        .catch(console.error);
    }
  }, [initialProducts]);

  // Dynamically extract brands and conditions directly from active database products
  const availableBrands = useMemo(() => {
    return Array.from(new Set(productList.map((p) => p.brand).filter(Boolean)));
  }, [productList]);

  const availableConditions = useMemo(() => {
    return Array.from(new Set(productList.map((p) => p.condition).filter(Boolean)));
  }, [productList]);

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      if (selectedBrands.length && !selectedBrands.includes(product.brand)) return false;
      if (selectedConditions.length && !selectedConditions.includes(product.condition)) return false;
      if (priceRange && (product.price < priceRange.min || product.price > priceRange.max)) return false;
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "rating": return b.rating - a.rating;
        case "discount": return b.discount - a.discount;
        case "newest": return 0;
        default: return 0;
      }
    });
  }, [productList, selectedBrands, selectedConditions, priceRange, sortBy]);

  const activeFilterCount = selectedBrands.length + selectedConditions.length + (priceRange ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Refurbished Laptops</h1>
              <p className="text-sm text-slate-500 mt-0.5">{filteredProducts.length} products found</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 lg:hidden"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters {activeFilterCount > 0 && <span className="rounded-full bg-blue-600 text-white text-xs px-2 py-0.5">{activeFilterCount}</span>}
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="newest">Featured &amp; Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="discount">Biggest Discount</option>
                </select>

                <div className="hidden items-center rounded-xl border border-slate-200 bg-white p-1 sm:flex">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg p-2 transition ${viewMode === "grid" ? "bg-slate-100 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                    aria-label="Grid view"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded-lg p-2 transition ${viewMode === "list" ? "bg-slate-100 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                    aria-label="List view"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 animate-slide-down lg:hidden">
              <FilterPanel
                availableBrands={availableBrands}
                availableConditions={availableConditions}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                selectedConditions={selectedConditions}
                setSelectedConditions={setSelectedConditions}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <FilterPanel
              availableBrands={availableBrands}
              availableConditions={availableConditions}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              selectedConditions={selectedConditions}
              setSelectedConditions={setSelectedConditions}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </aside>

          <main className="flex-1 min-w-0">
            {productList.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl p-8">
                <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No products added yet</h3>
                <p className="mt-2 text-slate-500">Products added via the Admin Panel will automatically appear here.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No products match your filters</h3>
                <p className="mt-2 text-slate-500">Try adjusting your filters or clearing them to see more options.</p>
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedConditions([]);
                    setPriceRange(null);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                  {filteredProducts.map((product, idx) => (
                    <ProductCard key={product.id} product={product} priority={idx < 4} />
                  ))}
                </div>

                {filteredProducts.length > 12 && (
                  <div className="mt-12 text-center">
                    <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">
                      Load More
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  availableBrands,
  availableConditions,
  selectedBrands,
  setSelectedBrands,
  selectedConditions,
  setSelectedConditions,
  priceRange,
  setPriceRange,
}: {
  availableBrands: string[];
  availableConditions: string[];
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
  selectedConditions: string[];
  setSelectedConditions: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: { min: number; max: number } | null;
  setPriceRange: React.Dispatch<React.SetStateAction<{ min: number; max: number } | null>>;
}) {
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  };
  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) => prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 sticky top-24 h-fit">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Filters</h3>
        <button
          onClick={() => {
            setSelectedBrands([]);
            setSelectedConditions([]);
            setPriceRange(null);
          }}
          className="text-xs text-blue-600 hover:underline hidden lg:inline cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {availableBrands.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-900 mb-3">Brand</h4>
          <div className="space-y-2">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {availableConditions.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-900 mb-3">Condition</h4>
          <div className="space-y-2">
            {availableConditions.map((condition) => (
              <label key={condition} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(condition)}
                  onChange={() => toggleCondition(condition)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{condition}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-slate-900 mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="price-range"
                checked={priceRange?.min === range.min && priceRange?.max === range.max}
                onChange={() => setPriceRange(priceRange?.min === range.min && priceRange?.max === range.max ? null : range)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import {
  Sliders,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Wrench,
  Laptop,
  Home,
  IndianRupee,
} from "lucide-react";
import { HeroConfig, defaultHeroConfig } from "@/lib/heroTypes";

export default function AdminHeroPage() {
  const [config, setConfig] = useState<HeroConfig>(defaultHeroConfig);
  const [activeTab, setActiveTab] = useState<"slide1" | "slide2" | "slide3">("slide1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/hero");
        if (res.ok) {
          const data = await res.json();
          setConfig(data.hero);
        }
      } catch (err) {
        console.error("Failed to load hero config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage(null);
    try {
      const res = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      setSavedMessage("Hero settings and live prices updated successfully!");
    } catch (err: any) {
      alert(err?.message || "Failed to update hero settings");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMessage(null), 4000);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset hero slides back to original factory defaults?")) {
      setConfig({ ...defaultHeroConfig });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span>Loading Hero Controller...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <span>Hero Price &amp; Content Controller</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Control live prices, discounts, and promotional banners for all 3 hero carousel slides
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Live Prices</span>
              </>
            )}
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Slide Navigation Tabs */}
      <div className="no-scrollbar flex border-b border-slate-200 gap-2 overflow-x-auto bg-white p-1.5 rounded-xl shadow-2xs border">
        <button
          onClick={() => setActiveTab("slide1")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
            activeTab === "slide1"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Slide 1: Doorstep Servicing</span>
        </button>

        <button
          onClick={() => setActiveTab("slide2")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
            activeTab === "slide2"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Slide 2: Refurbished Laptops</span>
        </button>

        <button
          onClick={() => setActiveTab("slide3")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
            activeTab === "slide3"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Slide 3: Repairs &amp; Chip-Level</span>
        </button>
      </div>

      {/* Tab 1: Doorstep Servicing Controller */}
      {activeTab === "slide1" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900">Slide 1: Doorstep Servicing Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Control pricing cards and doorstep visit fee</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Basic Servicing Price (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide1.basicServicePrice}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide1: { ...config.slide1, basicServicePrice: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-blue-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Currently ₹499 only</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Deep Servicing Price (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide1.deepServicePrice}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide1: { ...config.slide1, deepServicePrice: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-blue-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Currently ₹699 only</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Visit Fee Strikethrough (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide1.visitFeeOriginal}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide1: { ...config.slide1, visitFeeOriginal: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-slate-400 outline-none line-through"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Original visit price strike</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Doorstep Visit Fee Now (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-emerald-600 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide1.visitFeeCurrent}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide1: { ...config.slide1, visitFeeCurrent: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-emerald-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Set to 0 for FREE doorstep visit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Top Badge Text</label>
              <input
                type="text"
                value={config.slide1.topBadge}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    slide1: { ...config.slide1, topBadge: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Subtitle</label>
              <input
                type="text"
                value={config.slide1.subtitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    slide1: { ...config.slide1, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Description Paragraph</label>
              <textarea
                rows={2}
                value={config.slide1.description}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    slide1: { ...config.slide1, description: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Refurbished Laptops Controller */}
      {activeTab === "slide2" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900">Slide 2: Refurbished Laptops Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Control starting price for business laptops &amp; MacBooks</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Business Series Starting (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide2.businessSeriesPrice}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide2: { ...config.slide2, businessSeriesPrice: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-blue-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Dell, HP &amp; Lenovo Intel Core i5 / i7</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Apple MacBooks Starting (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide2.macbookPrice}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide2: { ...config.slide2, macbookPrice: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-blue-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">MacBook Air &amp; Pro Retina</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Warranty Period (Months)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={config.slide2.warrantyMonths}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide2: { ...config.slide2, warrantyMonths: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-emerald-600 outline-none"
                />
                <span className="text-slate-500 text-sm font-bold">Months</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Displayed on warranty badge</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Top Badge Text</label>
              <input
                type="text"
                value={config.slide2.topBadge}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    slide2: { ...config.slide2, topBadge: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Subtitle</label>
              <input
                type="text"
                value={config.slide2.subtitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    slide2: { ...config.slide2, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Free Accessories Included (comma separated)</label>
              <input
                type="text"
                value={config.slide2.freeAccessories?.join(", ")}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    slide2: {
                      ...config.slide2,
                      freeAccessories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Repair & Chip-Level Controller */}
      {activeTab === "slide3" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900">Slide 3: Repairs &amp; Chip-Level Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Control starting price for screens, chip repair &amp; diagnostic fee</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Screen Replacement (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide3.screenReplacementPrice}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide3: { ...config.slide3, screenReplacementPrice: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-blue-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Starting price for OEM display panels</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Chip &amp; Board Repair (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide3.chipRepairPrice}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide3: { ...config.slide3, chipRepairPrice: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-blue-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Starting price for micro-soldering</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Check Fee Strikethrough (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide3.checkFeeOriginal}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide3: { ...config.slide3, checkFeeOriginal: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-slate-400 outline-none line-through"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Diagnosis fee strike</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Diagnosis Fee Now (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-emerald-600 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={config.slide3.checkFeeCurrent}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slide3: { ...config.slide3, checkFeeCurrent: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-transparent font-black text-xl text-emerald-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Set to 0 for Free Diagnosis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Top Badge Text</label>
              <input
                type="text"
                value={config.slide3.topBadge}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    slide3: { ...config.slide3, topBadge: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Subtitle</label>
              <input
                type="text"
                value={config.slide3.subtitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    slide3: { ...config.slide3, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

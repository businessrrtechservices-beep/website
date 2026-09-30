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
} from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [heroConfig, setHeroConfig] = useState<any>(null);
  const [productCount, setProductCount] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, heroRes, productsRes] = await Promise.all([
        fetch("/api/analytics/stats"),
        fetch("/api/hero"),
        fetch("/api/products"),
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
    </div>
  );
}

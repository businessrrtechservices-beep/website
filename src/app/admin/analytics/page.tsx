"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Eye,
  PhoneCall,
  RefreshCw,
  Clock,
  Layers,
  MousePointerClick,
  ExternalLink,
  Loader2,
  Calendar,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.summary);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatTimestamp = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const filteredInterests = (stats?.recentInterests || []).filter((e: any) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      e.buttonText?.toLowerCase().includes(q) ||
      e.section?.toLowerCase().includes(q) ||
      e.targetUrl?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Audience Analytics &amp; Intent Tracking</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Track user views, section impressions &amp; actionable click leads before redirect
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Today&apos;s Visits</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats?.todayVisits || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">Unique user sessions today</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Site Visits</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats?.totalVisits || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">All-time tracked visitors</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Today&apos;s Inquiries</span>
            <PhoneCall className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats?.todayInterests || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">CTA clicks recorded today</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Inquiries</span>
            <MousePointerClick className="w-4 h-4 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats?.totalInterests || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">Lifetime buyer intents captured</span>
        </div>
      </div>

      {/* Grid: Top Clicked Buttons & Section View Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Clicked Action Buttons */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 pb-3.5 border-b border-slate-100">
            <MousePointerClick className="w-4 h-4 text-blue-600" />
            <span>High-Intent Buttons Clicked</span>
          </h2>

          <div className="mt-4 space-y-3">
            {!stats?.interestButtons || stats.interestButtons.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No buttons clicked yet. When users tap WhatsApp or Call, counts appear here.
              </p>
            ) : (
              stats.interestButtons.map((btn: any, idx: number) => {
                const max = Math.max(...stats.interestButtons.map((b: any) => b.count), 1);
                const percent = Math.round((btn.count / max) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{btn.buttonText}</span>
                      <span className="font-mono text-blue-600 font-bold">{btn.count} clicks</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section Views & Scroll Heat */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 pb-3.5 border-b border-slate-100">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Section Attention &amp; Scroll Impressions</span>
          </h2>

          <div className="mt-4 space-y-3">
            {!stats?.sectionViews || stats.sectionViews.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Section impression data will populate as visitors scroll the homepage.
              </p>
            ) : (
              stats.sectionViews.map((sec: any, idx: number) => {
                const max = Math.max(...stats.sectionViews.map((s: any) => s.count), 1);
                const percent = Math.round((sec.count / max) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 capitalize">
                        {sec.sectionId.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono text-blue-600 font-bold">{sec.count} views</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User Intent Leads Log Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Full User Intent &amp; Lead Audit Log</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Instant log recorded every time a user taps a CTA button before being redirected
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Filter leads by button or section..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {filteredInterests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching intent logs recorded.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 font-bold">
                <tr>
                  <th className="pb-2.5">Date &amp; Time</th>
                  <th className="pb-2.5">Button Text / Action</th>
                  <th className="pb-2.5">Origin Section</th>
                  <th className="pb-2.5">Redirect URL / Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredInterests.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 text-slate-500 whitespace-nowrap">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="py-2.5 font-sans font-bold text-slate-900">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.buttonText}
                      </span>
                    </td>
                    <td className="py-2.5 font-sans text-slate-600">
                      {item.section || "Homepage"}
                    </td>
                    <td className="py-2.5 text-slate-500 truncate max-w-xs font-sans">
                      {item.targetUrl ? (
                        <a
                          href={item.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span className="truncate">{item.targetUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

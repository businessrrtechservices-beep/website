"use client";

import React from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Tag,
  Truck,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PeriodFinancialSummary, RevenueProfitDashboardData } from "@/lib/revenueProfitDb";

interface RevenueProfitCardsProps {
  data: RevenueProfitDashboardData | null;
  loading?: boolean;
}

export default function RevenueProfitCards({ data, loading }: RevenueProfitCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-64 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between"
          >
            <div className="h-5 bg-slate-100 rounded w-1/2 mb-2" />
            <div className="h-10 bg-slate-100 rounded w-3/4 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded" />
              <div className="h-3 bg-slate-100 rounded" />
              <div className="h-3 bg-slate-100 rounded" />
            </div>
            <div className="h-8 bg-slate-100 rounded mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards: {
    summary: PeriodFinancialSummary;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    bgAccent: string;
    badgeText: string;
  }[] = [
    {
      summary: data.today,
      icon: Clock,
      accentColor: "text-blue-600",
      bgAccent: "bg-blue-50 border-blue-100",
      badgeText: "Today",
    },
    {
      summary: data.thisWeek,
      icon: Calendar,
      accentColor: "text-indigo-600",
      bgAccent: "bg-indigo-50 border-indigo-100",
      badgeText: "This Week",
    },
    {
      summary: data.thisMonth,
      icon: BarChart3,
      accentColor: "text-purple-600",
      bgAccent: "bg-purple-50 border-purple-100",
      badgeText: "This Month",
    },
    {
      summary: data.overall,
      icon: TrendingUp,
      accentColor: "text-emerald-600",
      bgAccent: "bg-emerald-50 border-emerald-100",
      badgeText: "Overall Lifetime",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-slate-900 text-white shadow-2xs">
              <IndianRupee className="w-4 h-4" />
            </span>
            <span>Real Revenue &amp; Net Profit Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real net earnings: <strong>Gross Sales (Sold At)</strong> &minus; <strong>Inventory Cost (Purchased At)</strong> &minus; <strong>Other Expenses (Courier, Petrol, Shop)</strong>
          </p>
        </div>
      </div>

      {/* 4 Responsive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {cards.map(({ summary, icon: Icon, accentColor, bgAccent, badgeText }) => {
          const isProfitable = summary.netProfit >= 0;

          return (
            <div
              key={summary.periodKey}
              className="rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Card Top / Header */}
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${bgAccent} ${accentColor} border`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">
                        {summary.periodTitle}
                      </h3>
                      <p className="text-[10.5px] font-semibold text-slate-500">
                        {summary.periodSubtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {badgeText}
                  </span>
                </div>

                {/* Main Net Profit Display ("Actual What We Got") */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Actual What We Got (Net Profit)
                  </span>
                  <div className="flex items-baseline justify-between gap-2">
                    <div
                      className={`text-2xl font-black tracking-tight font-mono ${
                        isProfitable ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {summary.netProfit < 0 ? "-" : "+"}₹
                      {Math.abs(summary.netProfit).toLocaleString("en-IN")}
                    </div>
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isProfitable
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isProfitable ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-rose-600" />
                      )}
                      <span>{summary.profitMarginPercent}% margin</span>
                    </span>
                  </div>
                </div>

                {/* Accounting Line-Item Breakdown */}
                <div className="mt-4 space-y-2 text-[11px] bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  {/* Gross Sales */}
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <ShoppingBag className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>Gross Sales (Sold At):</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{summary.grossSales.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Inventory Cost */}
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Inventory Cost (Bought At):</span>
                    </span>
                    <span className="font-mono font-bold text-amber-800">
                      &minus;₹{summary.inventoryCost.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Gross Sales Margin */}
                  <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-slate-200 text-slate-600">
                    <span className="font-semibold">Gross Profit (Sales &minus; Cost):</span>
                    <span className="font-mono font-bold text-slate-800">
                      ₹{summary.grossProfit.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Other Expenses (Courier, Petrol, Shop) */}
                  <div className="flex items-center justify-between text-slate-700 pt-0.5">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <Truck className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>Other Expenses (Courier/Petrol):</span>
                    </span>
                    <span className="font-mono font-bold text-rose-700">
                      &minus;₹{summary.otherExpenses.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Cash Flow Footer */}
              <div className="px-5 py-2.5 bg-slate-100/70 border-t border-slate-200 text-[10.5px] flex items-center justify-between">
                <div className="flex items-center gap-1 font-semibold text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Collected: </span>
                  <strong className="font-mono text-slate-900">
                    ₹{summary.cashCollected.toLocaleString("en-IN")}
                  </strong>
                </div>

                {summary.pendingDue > 0 ? (
                  <div className="flex items-center gap-1 text-rose-700 font-bold font-mono">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    <span>Due: ₹{summary.pendingDue.toLocaleString("en-IN")}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 font-semibold text-[10px]">
                    {summary.invoicesCount} {summary.invoicesCount === 1 ? "inv" : "invs"} &bull; {summary.unitsSoldCount} units
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

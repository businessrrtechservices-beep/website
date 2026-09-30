"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Database,
  Cloud,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [system, setSystem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchSystemStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/me");
      if (res.ok) {
        const data = await res.json();
        setSystem(data.system);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Settings &amp; Environment Status</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Check MongoDB connection, Cloudinary image service &amp; environment variables
          </p>
        </div>

        <button
          onClick={fetchSystemStatus}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
          <span>Re-check Connections</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MongoDB Status Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">MongoDB Integration</h2>
                <span className="text-xs text-slate-500 font-medium">Database storage for products, hero &amp; analytics</span>
              </div>
            </div>

            {system?.mongoConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> Local Fallback Mode
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <p className="text-slate-700 font-medium leading-relaxed">
              {system?.mongoConnected
                ? "MongoDB is actively connected! All product additions, hero modifications, and visits are securely stored in your cluster."
                : "MongoDB is operating in resilient local mode until the database password is added to .env.local."}
            </p>

            <div className="mt-2 pt-2.5 border-t border-slate-200">
              <span className="text-[11px] text-slate-600 block font-bold mb-1">
                How to activate live MongoDB Atlas:
              </span>
              <p className="text-[11px] text-slate-500 mb-2">
                Replace <code className="text-blue-700 font-bold">&lt;db_password&gt;</code> in <code className="text-blue-700 font-bold">.env.local</code> with your Atlas database password:
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-800">
                <span className="truncate">MONGODB_URI=mongodb+srv://...</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      "mongodb+srv://businessrrtechservices_db_user:<db_password>@rrtechservices.d2bdysu.mongodb.net/?appName=RRTechServices",
                      "mongo"
                    )
                  }
                  className="text-slate-400 hover:text-slate-700 shrink-0 ml-2"
                >
                  {copiedKey === "mongo" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cloudinary Status Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Cloudinary Image Storage</h2>
                <span className="text-xs text-slate-500 font-medium">Media upload service for product images</span>
              </div>
            </div>

            {system?.cloudinaryConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> Pending Keys
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <p className="text-slate-700 font-medium leading-relaxed">
              {system?.cloudinaryConfigured
                ? "Cloudinary credentials found in .env.local! Image uploads in the Product Manager are live."
                : "Add your Cloudinary credentials in .env.local to enable 1-click photo uploads for laptops."}
            </p>

            <div className="mt-2 pt-2.5 border-t border-slate-200">
              <span className="text-[11px] text-slate-600 block font-bold mb-1">
                Keys in .env.local:
              </span>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[10.5px] text-slate-800 space-y-1">
                <div>CLOUDINARY_CLOUD_NAME=rt7ah80i</div>
                <div>CLOUDINARY_API_KEY=619188593758578</div>
                <div>CLOUDINARY_API_SECRET=••••••••••••••••••••••••••••</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-black text-slate-900">Admin Security &amp; Access</h3>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Admin authentication is protected with encrypted sessions. Credentials can be managed directly in the MongoDB <code className="text-blue-700 font-bold">users</code> collection or environment variables.
        </p>
      </div>
    </div>
  );
}

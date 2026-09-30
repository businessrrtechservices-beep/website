"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Laptop,
  Sliders,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{
    mongoConfigured: boolean;
    mongoConnected: boolean;
    cloudinaryConfigured: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // If on login page, skip admin layout shell
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        setSystemStatus(data.system);
      } catch {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Loading Admin Portal...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Laptop },
    { label: "Hero Controller", href: "/admin/hero", icon: Sliders },
    { label: "Analytics & Leads", href: "/admin/analytics", icon: BarChart3 },
    { label: "Settings & DB", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Image
              src="/assets/logo.png"
              alt="RR Tech"
              width={100}
              height={26}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-200 shadow-xs ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-white">
              <Image
                src="/assets/logo.png"
                alt="RR Tech Services"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <span className="block text-[11px] font-black uppercase tracking-wider text-blue-600">
                Admin Hub
              </span>
              <span className="block text-[10px] font-medium text-slate-500">v1.0 &bull; Pune</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Status Box in Sidebar */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-600 font-bold flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Database
            </span>
            {systemStatus?.mongoConnected ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                MongoDB Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 font-bold text-[10px]">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Local Mode
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            {systemStatus?.mongoConnected
              ? "Connected to MongoDB collection"
              : "Using resilient fallback data"}
          </p>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-white">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

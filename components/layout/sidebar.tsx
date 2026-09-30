"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";
import {
  LayoutDashboard,
  Sprout,
  Truck,
  MapPin,
  Warehouse,
  ClipboardCheck,
  ShoppingCart,
  BarChart3,
  ShieldCheck,
  Settings,
  Database,
  Snowflake,
  Activity,
  Wifi,
  WifiOff,
  ChevronRight,
  Package,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  allowedRoles?: UserRole[];
  badge?: string;
  badgeVariant?: "live" | "gps" | "new" | "alert";
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    group: "Main",
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    group: "Main",
    label: "Produce Batches",
    href: "/batches",
    icon: Sprout,
    badge: "Live",
    badgeVariant: "live",
  },
  {
    group: "Logistics",
    label: "Cold Shipments",
    href: "/shipments",
    icon: Truck,
  },
  {
    group: "Logistics",
    label: "Fleet & GPS Tracking",
    href: "/tracking",
    icon: MapPin,
    badge: "GPS",
    badgeVariant: "gps",
  },
  {
    group: "Operations",
    label: "Cold Storage & Hubs",
    href: "/inventory",
    icon: Warehouse,
  },
  {
    group: "Operations",
    label: "Quality Inspection",
    href: "/quality",
    icon: ClipboardCheck,
  },
  {
    group: "Commerce",
    label: "Marketplace Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    group: "Intelligence",
    label: "Analytics & Reports",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    group: "Intelligence",
    label: "Audit Trail",
    href: "/audit",
    icon: ShieldCheck,
    allowedRoles: ["SUPER_ADMIN", "WAREHOUSE_ADMIN"],
  },
  {
    group: "System",
    label: "Settings & Config",
    href: "/settings",
    icon: Settings,
  },
];

const BADGE_STYLES: Record<string, string> = {
  live:  "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  gps:   "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  new:   "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  alert: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
};

const ACTIVE_BADGE: Record<string, string> = {
  live:  "bg-white/25 text-white border-white/20",
  gps:   "bg-white/25 text-white border-white/20",
  new:   "bg-white/25 text-white border-white/20",
  alert: "bg-white/25 text-white border-white/20",
};

function getGroups(items: NavItem[], userRole?: string) {
  const grouped = new Map<string, NavItem[]>();
  for (const item of items) {
    if (item.allowedRoles && userRole && !item.allowedRoles.includes(userRole as UserRole)) continue;
    const g = item.group || "Other";
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)!.push(item);
  }
  return grouped;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isOnline, isSimulatingOffline, pendingSyncCount } = useOfflineStore();

  const isActuallyOffline = !isOnline || isSimulatingOffline;
  const groups = getGroups(NAV_ITEMS, user?.role);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "app-sidebar",
          isOpen && "open"
        )}
      >
        {/* ─── Brand Header ─── */}
        <div className="px-4 py-4 border-b border-black/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group relative" onClick={onClose}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, hsl(152,68%,32%) 0%, hsl(168,60%,36%) 100%)",
                  boxShadow: "0 4px 16px hsl(152,68%,22%,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <Snowflake className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800 tracking-tight">AgriSupply</span>
                  <span
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200"
                  >
                    ColdIQ
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                  Smart Cold-Chain Platform
                </p>
              </div>
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Tenant Indicator ─── */}
        <div className="mx-3 mt-3 mb-1 rounded-lg px-3 py-2.5 neu-inset">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: isActuallyOffline ? "hsl(45,93%,55%)" : "hsl(152,68%,50%)",
                  boxShadow: isActuallyOffline ? "0 0 6px hsl(45,93%,55%)" : "0 0 6px hsl(152,68%,50%)",
                  animation: "pulse-green 2s ease-out infinite",
                }}
              />
              <span className="text-slate-700 font-medium text-[11px] truncate">
                {user?.tenantName ?? "PakAgri Cold-Chain Ltd."}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
              {user?.role?.split("_")[0] ?? "ADMIN"}
            </span>
          </div>
        </div>

        {/* ─── Navigation ─── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5 mt-1">
          {Array.from(groups.entries()).map(([groupName, items]) => (
            <div key={groupName} className="mb-2">
              <div className="text-[9.5px] uppercase font-bold text-slate-500 px-3 py-1.5 tracking-[0.1em]">
                {groupName}
              </div>
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all group relative overflow-hidden mb-1",
                      isActive
                        ? "neu-inset text-emerald-700"
                        : "text-slate-700 hover:text-slate-900 hover:neu-flat"
                    )}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                        style={{ background: "hsl(152,68%,40%)" }}
                      />
                    )}
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors",
                          isActive
                            ? "text-emerald-600"
                            : "text-slate-500 group-hover:text-emerald-500"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest",
                          isActive
                            ? (ACTIVE_BADGE[item.badgeVariant!] ?? "bg-white/20 text-white")
                            : (BADGE_STYLES[item.badgeVariant!] ?? "bg-white/10 text-white/60")
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ─── System Footer ─── */}
        <div className="p-3 border-t border-black/5 neu-inset m-2 rounded-lg">
          {/* Sync status bar */}
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Database className="w-3 h-3" />
              IndexedDB Sync
            </span>
            <span className={cn("font-semibold font-mono", pendingSyncCount > 0 ? "text-amber-600" : "text-emerald-600")}>
              {pendingSyncCount > 0 ? `${pendingSyncCount} queued` : "Synced ✓"}
            </span>
          </div>
          <div className="w-full rounded-full overflow-hidden h-1" style={{ background: "rgba(0,0,0,0.05)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: pendingSyncCount > 0 ? "60%" : "100%",
                background: pendingSyncCount > 0
                  ? "linear-gradient(90deg, hsl(45,93%,55%), hsl(24,94%,50%))"
                  : "linear-gradient(90deg, hsl(152,68%,45%), hsl(168,60%,50%))",
              }}
            />
          </div>
          {/* Network status */}
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-500 font-medium">ColdIQ Gateway v2.4</span>
            <span className={cn("flex items-center gap-1 font-medium", isActuallyOffline ? "text-amber-600" : "text-emerald-600")}>
              {isActuallyOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              {isActuallyOffline ? "Offline" : "99.98%"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

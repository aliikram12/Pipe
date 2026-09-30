'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useOfflineStore } from '@/stores/offline-store';
import { NotificationCenter } from '@/components/notifications/notification-center';
import {
  Search,
  Wifi,
  WifiOff,
  UserCheck,
  LogOut,
  ChevronDown,
  ShieldCheck,
  ThermometerSnowflake,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

const DEMO_USERS = [

  {
    role: 'FARMER' as UserRole,
    name: 'Chaudhry Tariq Mehmood',
    email: 'farmer@demo.com',
    label: 'Farmer — Bhalwal Citrus Orchards',
  },
  {
    role: 'TRANSPORTER' as UserRole,
    name: 'Asif Mahmood (NLC)',
    email: 'transporter@demo.com',
    label: 'Transporter — NLC Fleet & GPS',
  },
  {
    role: 'WAREHOUSE_ADMIN' as UserRole,
    name: 'Haji Bashir Gujjar',
    email: 'warehouse@demo.com',
    label: 'Warehouse — Lahore Cold-Chain Hub',
  },
  {
    role: 'RETAILER' as UserRole,
    name: 'Zubair Qureshi (Imtiaz)',
    email: 'retailer@demo.com',
    label: 'Retailer — Imtiaz Supermarket',
  },
];

export function Header() {
  const router = useRouter();
  const { user, setAuth, clearAuth } = useAuthStore();
  const { isSimulatingOffline, setSimulatingOffline } = useOfflineStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const handleRoleSwitch = async (targetEmail: string) => {
    setIsSwitchingRole(true);
    setRoleMenuOpen(false);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: 'Password123!' }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuth(data.user, data.accessToken, data.refreshToken);
        toast.success(`Switched role to: ${data.user.role}`, {
          description: `Logged in as ${data.user.name}`,
        });
        router.refresh();
      } else {
        toast.error('Failed to switch demo role');
      }
    } catch {
      toast.error('Network error during role switch');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30" style={{ background: "var(--color-bg)", borderBottom: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 4px 6px -1px rgba(163,177,198,0.3)" }}>
      {/* Search / Context */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search produce batch, shipment code, sensor ID..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm neu-inset placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
          />
        </div>
      </div>

      {/* Header Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Simulation Button */}
        <button
          onClick={() => {
            const nextState = !isSimulatingOffline;
            setSimulatingOffline(nextState);
            if (nextState) {
              toast.warning('Simulating Offline Network', {
                description: 'Actions will now queue to IndexedDB for offline resilience.',
              });
            } else {
              toast.success('Restored Online Network', {
                description: 'Syncing pending offline mutations to cloud API.',
              });
            }
          }}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border',
            isSimulatingOffline
              ? 'neu-inset text-amber-600'
              : 'neu-button text-slate-700'
          )}
          title="Toggle simulated network disconnection to test offline sync"
        >
          {isSimulatingOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden md:inline">Offline Mode: Active</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Simulate Offline</span>
            </>
          )}
        </button>

        {/* Quick Role Switcher (Crucial for testing all 5 roles) */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            disabled={isSwitchingRole}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold neu-button text-emerald-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-bold underline decoration-emerald-500">
              {user?.role?.replace(/_/g, ' ') || 'Switch'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 neu-flat" style={{ border: "1px solid rgba(255,255,255,0.4)" }}>
              <div className="px-3 py-1.5 border-b border-black/5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Instant Role Switch (RBAC)
              </div>
              <div className="divide-y divide-black/5">
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.email}
                    onClick={() => handleRoleSwitch(demo.email)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-xs flex flex-col hover:neu-inset transition',
                      user?.email === demo.email && 'neu-inset text-emerald-700 font-semibold'
                    )}
                  >
                    <span className="text-slate-800 font-bold flex items-center justify-between">
                      {demo.name}
                      {user?.email === demo.email && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </span>
                    <span className="text-[11px] text-slate-600">{demo.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Component */}
        <NotificationCenter />

        <div className="h-5 w-px bg-slate-300 mx-1 hidden sm:block" />

        {/* Current User Pill */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:neu-inset transition"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <span className="text-xs font-bold text-slate-800 hidden lg:inline max-w-[120px] truncate">
              {user?.name || 'Alexander Cross'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden lg:inline" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl neu-flat py-2 z-50">
              <div className="px-3 py-2 border-b border-black/5">
                <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-600 truncate">{user?.email}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  {user?.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:neu-inset flex items-center gap-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

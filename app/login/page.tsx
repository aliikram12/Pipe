'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Snowflake, Sprout, Truck, Warehouse, ShoppingCart, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

const DEMO_PRESETS = [
  {
    role: 'FARMER' as UserRole,
    title: 'Producer / Farmer',
    name: 'Chaudhry Tariq Mehmood',
    email: 'farmer@demo.com',
    icon: Sprout,
    color: 'from-green-500 to-emerald-700',
    desc: 'Harvest batch registration, QR generation & yield tracking',
  },
  {
    role: 'TRANSPORTER' as UserRole,
    title: 'NLC Fleet Transporter',
    name: 'Asif Mahmood (NLC)',
    email: 'transporter@demo.com',
    icon: Truck,
    color: 'from-sky-500 to-blue-700',
    desc: 'Live GPS dispatch, reefer telemetry & M-2/M-5 geofencing',
  },
  {
    role: 'WAREHOUSE_ADMIN' as UserRole,
    title: 'Cold Hub Manager',
    name: 'Haji Bashir Gujjar',
    email: 'warehouse@demo.com',
    icon: Warehouse,
    color: 'from-cyan-500 to-teal-700',
    desc: 'Lahore Hub chamber control, IoT thresholds & batch intake',
  },
  {
    role: 'RETAILER' as UserRole,
    title: 'Retailer & Buyer',
    name: 'Zubair Qureshi (Imtiaz)',
    email: 'retailer@demo.com',
    icon: ShoppingCart,
    color: 'from-amber-500 to-orange-700',
    desc: 'Produce procurement, cold-chain provenance & PKR invoicing',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('farmer@demo.com');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await res.json();
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}`, {
        description: `Authenticated as ${data.user.role}`,
      });
      router.push('/');
    } catch (err: any) {
      toast.error('Login Failed', {
        description: err.message || 'Please verify credentials or try a 1-click demo role.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--color-bg)" }}>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-neu-sm mb-4" style={{ background: "var(--color-bg)" }}>
          <Snowflake className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">AgriSupply ColdIQ</h1>
        <p className="mt-2 text-sm text-slate-500">
          Smart Cold-Chain Logistics & Agricultural Provenance Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl z-10">
        <div className="neu-flat p-6 sm:p-8">
          {/* Quick 1-Click Role Switcher Demo Box */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                ⚡ 1-Click Role Demonstration
              </span>
              <span className="text-[11px] text-slate-500">Click any role to log in instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_PRESETS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.email}
                    type="button"
                    onClick={() => performLogin(item.email, 'Password123!')}
                    disabled={isLoading}
                    className="flex items-start gap-3 p-3 neu-button hover:neu-inset text-left transition group"
                  >
                    <div className={cn('p-2 rounded-lg bg-gradient-to-tr text-white flex-shrink-0 shadow-sm', item.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700 transition">
                          {item.title}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 text-slate-500 font-medium" style={{ background: "var(--color-bg)" }}>Or enter credentials</span>
            </div>
          </div>

          {/* Standard Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Business Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@agricorp-global.com"
                  className="w-full pl-9 pr-4 py-2 text-sm neu-inset text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Account Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2 text-sm neu-inset text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 neu-button text-emerald-700 font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to ColdIQ Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Features Footer */}
          <div className="mt-6 pt-5 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              RBAC + JWT Dual-Token Rotation
            </span>
            <span>Local IndexedDB Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

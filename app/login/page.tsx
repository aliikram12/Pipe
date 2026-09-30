import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
import {
  Snowflake,
  Sprout,
  Truck,
  Warehouse,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Copy,
  Check,
  Eye,
  EyeOff,
  UserCheck,
  KeyRound,
  Info,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RolePreset {
  role: UserRole;
  title: string;
  name: string;
  email: string;
  password: string;
  icon: any;
  color: string;
  badgeColor: string;
  borderActive: string;
  desc: string;
  permissions: string[];
}

const DEMO_PRESETS: RolePreset[] = [
  {
    role: 'FARMER',
    title: 'Producer / Farmer',
    name: 'Chaudhry Tariq Mehmood',
    email: 'farmer@demo.com',
    password: 'Password123!',
    icon: Sprout,
    color: 'from-emerald-500 to-green-600',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40',
    desc: 'Bhalwal Export Citrus Orchards • Harvest registration, QR generation & yield tracking',
    permissions: ['Batch Management', 'QR Generation', 'Quality Testing Logs'],
  },
  {
    role: 'TRANSPORTER',
    title: 'NLC Fleet Transporter',
    name: 'Asif Mahmood (NLC)',
    email: 'transporter@demo.com',
    password: 'Password123!',
    icon: Truck,
    color: 'from-sky-500 to-blue-600',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    borderActive: 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40',
    desc: 'NLC Reefer Fleet • Live GPS dispatch, temperature telemetry & M-2/M-5 geofencing',
    permissions: ['Live GPS Tracking', 'Reefer Telemetry', 'Corridor Geofencing'],
  },
  {
    role: 'WAREHOUSE_ADMIN',
    title: 'Cold Hub Manager',
    name: 'Haji Bashir Gujjar',
    email: 'warehouse@demo.com',
    password: 'Password123!',
    icon: Warehouse,
    color: 'from-cyan-500 to-teal-600',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    borderActive: 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/40',
    desc: 'Lahore Central Hub • Chamber climate control, IoT thresholds & inventory intake',
    permissions: ['Chamber Monitoring', 'IoT Sensors', 'Stock Intake / Dispatch'],
  },
  {
    role: 'RETAILER',
    title: 'Retailer & Buyer',
    name: 'Zubair Qureshi (Imtiaz)',
    email: 'retailer@demo.com',
    password: 'Password123!',
    icon: ShoppingCart,
    color: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    borderActive: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40',
    desc: 'Imtiaz Supermarket • Produce procurement, cold-chain provenance & PKR invoicing',
    permissions: ['B2B Purchase Orders', 'PKR Invoicing', 'Provenance Traceability'],
  },
  {
    role: 'SUPER_ADMIN',
    title: 'System Super Admin',
    name: 'Malik Farooq Ahmad',
    email: 'admin@demo.com',
    password: 'Password123!',
    icon: ShieldCheck,
    color: 'from-purple-500 to-indigo-600',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    borderActive: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40',
    desc: 'PakAgri Governance • Enterprise tenant control, immutable audit logs & full system oversight',
    permissions: ['All Permissions', 'Security Audit Logs', 'Tenant Management'],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const { setAuth } = useAuthStore();

  // Inputs start empty by default as requested: no direct hardcoded auto-fill
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RolePreset>(DEMO_PRESETS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Populate inputs from selected role
  const handleFillCredentials = (preset: RolePreset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    toast.info(`Filled credentials for ${preset.title}`, {
      description: `Email: ${preset.email}`,
    });
  };

  // Role selector click
  const handleSelectRole = (preset: RolePreset) => {
    setSelectedRole(preset);
  };

  // Login handler
  const performLogin = async (loginEmail: string, loginPass: string) => {
    if (!loginEmail || !loginPass) {
      toast.error('Missing Credentials', {
        description: 'Please enter your email and password, or select a role and click Fill into Form.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      setAuth(data.user, data.accessToken, data.refreshToken);

      toast.success(`Welcome back, ${data.user.name}!`, {
        description: `Logged in as ${data.user.role.replace(/_/g, ' ')}`,
      });

      router.push(from);
    } catch (err: any) {
      toast.error('Authentication Error', {
        description: err.message || 'Please check your email and password.',
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
    <div
      className="min-h-screen w-full flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Background soft glow decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/40 via-sky-50/20 to-transparent pointer-events-none -z-0" />

      {/* Header / Brand Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-neu-sm mb-4 border border-white/60"
          style={{ background: 'var(--color-bg)' }}
        >
          <Snowflake className="w-9 h-9 text-emerald-600 animate-spin-slow" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800">
          AgriSupply ColdIQ
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          Pakistan Agricultural Cold-Chain Provenance & IoT Fleet Logistics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl z-10">
        <div className="neu-flat p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl">
          {/* ======================================================== */}
          {/* STEP 1: ROLE SELECTION (Above the form as requested)   */}
          {/* ======================================================== */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-black items-center justify-center">
                  1
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Select User Role / Demostration Persona
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Choose a role to view its credentials below
              </span>
            </div>

            {/* Role Buttons List */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DEMO_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedRole.role === preset.role;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleSelectRole(preset)}
                    className={cn(
                      'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all group',
                      isSelected
                        ? preset.borderActive
                        : 'border-slate-200 hover:border-slate-300 bg-white/70 hover:bg-white text-slate-700'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg bg-gradient-to-tr text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform',
                        preset.color
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold leading-tight line-clamp-1">
                      {preset.title.split('/')[0].trim()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {preset.role.replace('_', ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* STEP 2: DISPLAY ROLE CREDENTIALS CARD                    */}
          {/* ======================================================== */}
          {selectedRole && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl bg-gradient-to-tr text-white flex items-center justify-center shadow-md',
                      selectedRole.color
                    )}
                  >
                    <selectedRole.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900">{selectedRole.title}</h3>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                          selectedRole.badgeColor
                        )}
                      >
                        {selectedRole.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Demo Name: <strong className="text-slate-700">{selectedRole.name}</strong>
                    </p>
                  </div>
                </div>

                {/* Fill Button Action */}
                <button
                  type="button"
                  onClick={() => handleFillCredentials(selectedRole)}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-xl border border-emerald-300 transition active:scale-95 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Fill into Login Form</span>
                </button>
              </div>

              {/* Credential Data Badges */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email Box */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                      Username / Email
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 select-all block truncate">
                      {selectedRole.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedRole.email, 'Email')}
                    title="Copy Email"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                  >
                    {copiedField === 'Email' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Box */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                      Password
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 select-all block">
                      {selectedRole.password}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedRole.password, 'Password')}
                    title="Copy Password"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                  >
                    {copiedField === 'Password' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Context & Capabilities */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">{selectedRole.desc}</span>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                className="px-3 text-slate-500 font-bold tracking-wider"
                style={{ background: 'var(--color-bg)' }}
              >
                Sign In With Selected Credentials
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* STEP 3: LOGIN FORM (Inputs start empty, user submits)    */}
          {/* ======================================================== */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Business Email / Username
                </label>
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="text-[10px] text-slate-600 hover:text-slate-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. farmer@demo.com or admin@demo.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm neu-inset text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Account Password
                </label>
                {password && (
                  <button
                    type="button"
                    onClick={() => setPassword('')}
                    className="text-[10px] text-slate-600 hover:text-slate-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-11 py-2.5 text-sm neu-inset text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Helper Prompt if inputs are empty */}
            {!email && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-800 text-xs flex items-center justify-between">
                <span>
                  💡 Tip: Click <strong>&quot;Fill into Login Form&quot;</strong> above to auto-populate{' '}
                  <strong>{selectedRole.email}</strong>.
                </span>
                <button
                  type="button"
                  onClick={() => handleFillCredentials(selectedRole)}
                  className="font-bold underline ml-2 shrink-0 hover:text-amber-900"
                >
                  Fill Now
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 neu-button text-emerald-800 hover:text-emerald-900 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials & Generating JWT...</span>
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
          <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              JWT Dual-Token Rotation (Access 1d + Refresh 7d)
            </span>
            <span className="font-semibold text-slate-700">
              Neon PostgreSQL • Leaflet Map Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

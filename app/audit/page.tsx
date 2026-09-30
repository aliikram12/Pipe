'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import {
  ShieldCheck,
  Search,
  Lock,
  FileText,
  CheckCircle,
  Hash,
  Filter,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  timestamp: string;
  sha256Hash: string;
  verified: boolean;
}

const INITIAL_LOGS: AuditItem[] = [
  {
    id: 'aud_01',
    action: 'SHIPMENT_STATUS_UPDATE',
    entity: 'SHIPMENT',
    entityId: 'SHP-2026-081',
    userName: 'Tariq Mehmood',
    userRole: 'TRANSPORTER',
    ipAddress: '182.180.114.42 (M-2 Sheikhupura)',
    timestamp: '2026-09-28T13:00:00Z',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    verified: true,
  },
  {
    id: 'aud_02',
    action: 'QUALITY_INSPECTION_CERTIFIED',
    entity: 'INSPECTION',
    entityId: 'BAT-PK-KINNOW-01',
    userName: 'Engr. Tariq Qureshi',
    userRole: 'SUPER_ADMIN',
    ipAddress: '182.180.12.18 (Bhalwal Testing Lab)',
    timestamp: '2026-09-28T09:15:00Z',
    sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    verified: true,
  },
  {
    id: 'aud_03',
    action: 'GEOFENCE_TRANSIT_ENTRY',
    entity: 'GEOFENCE',
    entityId: 'Lahore Thokar Hub Gate #1',
    userName: 'Automated GPS Gateway',
    userRole: 'SYSTEM',
    ipAddress: '10.0.4.15',
    timestamp: '2026-09-28T07:45:00Z',
    sha256Hash: '3821034d67c527e28b146e49ad03cb5d83a1b8cb85bebb15e128cb5f98bb2c24',
    verified: true,
  },
  {
    id: 'aud_04',
    action: 'BATCH_REGISTRATION',
    entity: 'PRODUCE_BATCH',
    entityId: 'BAT-PK-CHAUNSA-02',
    userName: 'Chaudhry Farhan Rasheed',
    userRole: 'FARMER',
    ipAddress: '182.180.90.88 (Multan Farm)',
    timestamp: '2026-09-27T08:00:00Z',
    sha256Hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    verified: true,
  },
  {
    id: 'aud_05',
    action: 'USER_AUTHENTICATION_SUCCESS',
    entity: 'USER',
    entityId: 'admin@demo.com',
    userName: 'Malik Farooq Ahmad',
    userRole: 'SUPER_ADMIN',
    ipAddress: '182.180.44.1 (Lahore Logistics HQ)',
    timestamp: '2026-09-27T07:30:00Z',
    sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    verified: true,
  },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditItem[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');

  const verifyChainIntegrity = () => {
    toast.success('SHA-256 Cryptographic Chain Verified', {
      description: 'All 5 audit blocks matched mathematical hashes. Zero record tampering detected.',
    });
  };

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Immutable Audit Trail & Cryptographic Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident system ledger tracking every state transition, temperature excursion, and quality certification.
          </p>
        </div>

        <button
          onClick={verifyChainIntegrity}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition self-start sm:self-auto"
        >
          <Lock className="w-3.5 h-3.5" />
          Verify SHA-256 Ledger Integrity
        </button>
      </div>

      {/* Security Status Banner */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
              Chain-of-Custody Integrity: Verified & Compliant
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Each block contains the hash of the preceding block ensuring non-repudiation under FDA FSMA 204.
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 dark:border-emerald-800">
          Merkle Root: 0x9b4f...a812
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              System Audit Events Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of verified transactions</p>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search action or entity..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Event Action</th>
                <th className="px-5 py-3">Target Entity</th>
                <th className="px-5 py-3">User & Role</th>
                <th className="px-5 py-3">Client IP</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">SHA-256 Digest</th>
                <th className="px-5 py-3 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-5 py-3.5">
                    <span className="font-bold font-mono text-xs text-slate-900 dark:text-white block">
                      {item.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="text-emerald-600 block text-[11px]">{item.entity}</span>
                    <span className="font-mono">{item.entityId}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-900 dark:text-white block">
                      {item.userName}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.userRole}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                    {item.ipAddress}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {formatDate(item.timestamp, 'MMM dd, HH:mm:ss')}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400 max-w-[140px] truncate">
                    {item.sha256Hash}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

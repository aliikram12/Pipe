'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_CONFIG: Record<string, { bg: string; dot: string; label?: string }> = {
  // Supply Stages
  HARVESTED: { bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-500' },
  QUALITY_CHECK: { bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  READY_FOR_TRANSPORT: { bg: 'bg-sky-50 text-sky-800 border-sky-300', dot: 'bg-sky-500' },
  IN_TRANSIT: { bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
  COLD_STORAGE: { bg: 'bg-cyan-50 text-cyan-800 border-cyan-300', dot: 'bg-cyan-500' },
  DISTRIBUTION: { bg: 'bg-violet-50 text-violet-800 border-violet-300', dot: 'bg-violet-500' },
  DELIVERED: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  // Quality
  PENDING: { bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  APPROVED: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  CONDITIONAL: { bg: 'bg-orange-50 text-orange-800 border-orange-300', dot: 'bg-orange-500' },
  REJECTED: { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  // Shipment
  PLANNED: { bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  NEAR_DESTINATION: { bg: 'bg-teal-50 text-teal-800 border-teal-300', dot: 'bg-teal-500' },
  ARRIVED: { bg: 'bg-green-50 text-green-800 border-green-300', dot: 'bg-green-600' },
  DELAYED: { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  // Order
  CONFIRMED: { bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
  PREPARING: { bg: 'bg-indigo-50 text-indigo-800 border-indigo-300', dot: 'bg-indigo-500' },
  DISPATCHED: { bg: 'bg-violet-50 text-violet-800 border-violet-300', dot: 'bg-violet-500' },
  CANCELLED: { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  // Vehicle
  AVAILABLE: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  MAINTENANCE: { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  OFFLINE: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' },
  // Sensor
  ONLINE: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  ALERT: { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  // Invoice
  ISSUED: { bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
  PAID: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  OVERDUE: { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  // Driver
  ON_DUTY: { bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
  OFF_DUTY: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' },
  // General
  ACTIVE: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  INACTIVE: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' },
  SUSPENDED: { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  OPERATIONAL: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status?.toUpperCase()] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
  };

  const label = status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—';

  return (
    <span
      className={cn(
        'status-badge',
        config.bg,
        size === 'sm' ? 'text-[11px] py-0.5 px-2' : 'text-[12px] py-[3px] px-[9px]',
        className
      )}
    >
      <span className={cn('rounded-full flex-shrink-0', config.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  className?: string;
}

const PRIORITY_CONFIG = {
  INFO: { bg: 'bg-sky-50 text-sky-800 border-sky-300', icon: Info, color: 'text-sky-500' },
  WARNING: { bg: 'bg-amber-50 text-amber-800 border-amber-300', icon: AlertTriangle, color: 'text-amber-500' },
  CRITICAL: { bg: 'bg-rose-50 text-rose-800 border-rose-300', icon: XCircle, color: 'text-rose-500' },
  SUCCESS: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: CheckCircle2, color: 'text-emerald-600' },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.INFO;
  const Icon = config.icon;

  return (
    <span className={cn('status-badge', config.bg, className)}>
      <Icon className={cn('w-3 h-3', config.color)} />
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

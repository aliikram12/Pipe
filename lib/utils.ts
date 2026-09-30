import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, formatStr: string = 'MMM dd, yyyy HH:mm'): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, formatStr);
  } catch {
    return String(date);
  }
}

export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  if (currency === 'PKR') {
    return `₨ ${Number(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatTemperature(celsius: number): string {
  return `${celsius > 0 ? '+' : ''}${celsius.toFixed(1)}°C`;
}

export function formatHumidity(percentage: number): string {
  return `${percentage.toFixed(0)}%`;
}

export function getStatusColor(status: string): { bg: string; text: string; border: string; dot: string } {
  const s = status?.toUpperCase() || '';
  if (s.includes('APPROV') || s.includes('DELIVER') || s.includes('ACTIVE') || s.includes('OPERAT') || s.includes('PAID') || s.includes('SYNCED')) {
    return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700', border: 'border-emerald-500', dot: 'bg-emerald-500' };
  }
  if (s.includes('WARN') || s.includes('NEAR') || s.includes('CONDIT') || s.includes('PREPAR') || s.includes('PENDING') || s.includes('PLANNED')) {
    return { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-700', border: 'border-amber-500', dot: 'bg-amber-500' };
  }
  if (s.includes('ALERT') || s.includes('CRIT') || s.includes('REJECT') || s.includes('FAIL') || s.includes('DELAY') || s.includes('CANCEL')) {
    return { bg: 'bg-rose-50 text-rose-800 border-rose-200', text: 'text-rose-700', border: 'border-rose-500', dot: 'bg-rose-500' };
  }
  if (s.includes('TRANSIT') || s.includes('DISPATCH') || s.includes('CONFIRM') || s.includes('ONLINE') || s.includes('CHECK')) {
    return { bg: 'bg-sky-50 text-sky-800 border-sky-200', text: 'text-sky-700', border: 'border-sky-500', dot: 'bg-sky-500' };
  }
  return { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-600', border: 'border-slate-400', dot: 'bg-slate-400' };
}

export function getPriorityBadge(priority: string) {
  switch (priority.toUpperCase()) {
    case 'CRITICAL':
      return { label: 'Critical', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'WARNING':
      return { label: 'Warning', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'SUCCESS':
      return { label: 'Success', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    default:
      return { label: 'Info', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
  }
}

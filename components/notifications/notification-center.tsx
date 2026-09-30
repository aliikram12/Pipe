'use client';

import { useState } from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { useApiClient } from '@/hooks/use-api-client';
import { PriorityBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Filter,
  Flame,
  Thermometer,
  Truck,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const { notifications, unreadCount, isPanelOpen, togglePanel, closePanel, markAsRead, markAllAsRead } =
    useNotificationStore();
  const { apiFetch } = useApiClient();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'TEMPERATURE' | 'SHIPMENT'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'CRITICAL') return n.priority === 'CRITICAL';
    if (filter === 'TEMPERATURE') return n.type === 'TEMPERATURE' || n.type === 'IOT';
    if (filter === 'SHIPMENT') return n.type === 'SHIPMENT' || n.type === 'GPS';
    return true;
  });

  const handleMarkAllRead = async () => {
    markAllAsRead();
    try {
      await apiFetch('/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
    } catch {}
  };

  const handleMarkSingleRead = async (id: string) => {
    markAsRead(id);
    try {
      await apiFetch('/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ notificationIds: [id] }),
      });
    } catch {}
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={togglePanel}
        aria-label="Open notifications"
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Backdrop */}
      {isPanelOpen && (
        <div
          onClick={closePanel}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Slide-out Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-900 dark:text-white text-base">
              Alerts & Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute audio' : 'Enable audio'}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={closePanel}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Quick Actions */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'CRITICAL', 'TEMPERATURE', 'SHIPMENT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  'px-2.5 py-1 rounded-full font-medium transition',
                  filter === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium whitespace-nowrap pl-2"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500/40 mb-3" />
              <p className="font-medium text-slate-600 dark:text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No alerts matching your current filter.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkSingleRead(notif.id)}
                className={cn(
                  'p-3 rounded-lg transition border cursor-pointer group',
                  notif.read
                    ? 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/30'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {notif.priority === 'CRITICAL' && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                    )}
                    <h4
                      className={cn(
                        'text-xs font-semibold leading-snug',
                        notif.read ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-white font-bold'
                      )}
                    >
                      {notif.title}
                    </h4>
                  </div>
                  <PriorityBadge priority={notif.priority} className="text-[10px] py-0 px-1.5" />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(notif.createdAt, 'MMM dd, HH:mm')}
                  </span>
                  {!notif.read && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">
                      Mark as read
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>Real-time IoT & Geofence Streaming</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </aside>
    </div>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

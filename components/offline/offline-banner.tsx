'use client';

import { useOfflineStore } from '@/stores/offline-store';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { WifiOff, RefreshCw, AlertTriangle, CheckCircle, Cloud, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const { isOnline, isSimulatingOffline, pendingSyncCount, isSyncing, setSimulatingOffline } = useOfflineStore();
  const { syncQueue } = useOfflineSync();

  const isActuallyOffline = !isOnline || isSimulatingOffline;

  if (!isActuallyOffline && pendingSyncCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full px-6 py-3 text-sm flex items-center justify-between transition-all duration-300 z-50 mb-4 rounded-xl',
        isActuallyOffline
          ? 'neu-flat border-l-4 border-amber-500'
          : 'neu-flat border-l-4 border-emerald-500'
      )}
    >
      <div className="flex items-center space-x-3">
        {isActuallyOffline ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs animate-pulse shadow-sm">
            <WifiOff className="w-3.5 h-3.5" />
            {isSimulatingOffline ? 'SIMULATED OFFLINE MODE' : 'NETWORK OFFLINE'}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shadow-sm">
            <Cloud className="w-3.5 h-3.5" />
            ONLINE
          </span>
        )}

        <span className="text-xs sm:text-sm font-semibold text-slate-700">
          {isActuallyOffline
            ? 'Operating in offline mode. Changes are saved locally in IndexedDB and will auto-sync once connected.'
            : 'Reconnected! Ready to synchronize local changes.'}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {pendingSyncCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg neu-inset text-slate-700 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
            {pendingSyncCount} pending changes
          </span>
        )}

        <button
          onClick={() => syncQueue()}
          disabled={isSyncing || isActuallyOffline}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg neu-button text-emerald-700 hover:neu-inset disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>

        {isSimulatingOffline && (
          <button
            onClick={() => setSimulatingOffline(false)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg neu-button text-slate-700 hover:text-rose-600 transition"
          >
            Exit Simulation
          </button>
        )}
      </div>
    </div>
  );
}

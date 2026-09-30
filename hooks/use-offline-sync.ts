'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useOfflineStore } from '@/stores/offline-store';
import { useAuthStore } from '@/stores/auth-store';
import { getAllPendingQueueItems, getPendingSyncCount, offlineDb } from '@/lib/db/offline-db';
import { toast } from 'sonner';

export function useOfflineSync() {
  const { isOnline, isSimulatingOffline, setOnline, setPendingSyncCount, setIsSyncing, setLastSyncAt } = useOfflineStore();
  const { accessToken } = useAuthStore();
  const syncInProgress = useRef(false);

  // Monitor real browser online/offline events
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  // Count pending items periodically
  useEffect(() => {
    const refresh = async () => {
      const count = await getPendingSyncCount();
      setPendingSyncCount(count);
    };
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [setPendingSyncCount]);

  // Trigger sync when we come back online
  const syncQueue = useCallback(async () => {
    if (syncInProgress.current || !accessToken || !offlineDb) return;
    const pending = await getAllPendingQueueItems();
    if (pending.length === 0) return;

    syncInProgress.current = true;
    setIsSyncing(true);
    toast.loading(`Syncing ${pending.length} offline operations...`, { id: 'sync-toast' });

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ items: pending }),
      });

      if (response.ok) {
        const result = await response.json();
        // Mark synced items in IndexedDB
        for (const item of pending) {
          if (item.id !== undefined) {
            await offlineDb.syncQueue.update(item.id, { status: 'SYNCED', syncedAt: new Date().toISOString() });
          }
        }
        const newCount = await getPendingSyncCount();
        setPendingSyncCount(newCount);
        setLastSyncAt(new Date().toISOString());
        toast.success(`All changes synced (${result.synced} operations)`, { id: 'sync-toast' });
      } else {
        toast.error('Sync partially failed. Will retry.', { id: 'sync-toast' });
      }
    } catch (err) {
      toast.error('Sync failed. Items will retry when connection is stable.', { id: 'sync-toast' });
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
    }
  }, [accessToken, setIsSyncing, setPendingSyncCount, setLastSyncAt]);

  const effectiveOnline = isOnline && !isSimulatingOffline;

  useEffect(() => {
    if (effectiveOnline) {
      syncQueue();
    }
  }, [effectiveOnline, syncQueue]);

  return { syncQueue };
}

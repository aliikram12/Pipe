import { create } from 'zustand';

interface OfflineState {
  isOnline: boolean;
  isSimulatingOffline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  lastSyncAt: string | null;

  setOnline: (online: boolean) => void;
  setSimulatingOffline: (simulating: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  setIsSyncing: (syncing: boolean) => void;
  setLastSyncAt: (ts: string) => void;
}

export const useOfflineStore = create<OfflineState>()((set) => ({
  isOnline: true,
  isSimulatingOffline: false,
  pendingSyncCount: 0,
  isSyncing: false,
  lastSyncAt: null,

  setOnline: (online) => set({ isOnline: online }),
  setSimulatingOffline: (simulating) => set({ isSimulatingOffline: simulating }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSyncAt: (ts) => set({ lastSyncAt: ts }),
}));

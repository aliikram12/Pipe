import { create } from 'zustand';
import { NotificationType, NotificationPriority } from '@/lib/types';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isPanelOpen: boolean;
  panelOpen: boolean;

  addNotification: (n: NotificationItem) => void;
  addNotifications: (ns: NotificationItem[]) => void;
  markRead: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  markAllAsRead: () => void;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  closePanel: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isPanelOpen: false,
  panelOpen: false,

  addNotification: (n) => {
    set((state) => {
      const already = state.notifications.some((x) => x.id === n.id);
      if (already) return state;
      const list = [n, ...state.notifications].slice(0, 50);
      return { notifications: list, unreadCount: list.filter((x) => !x.read).length };
    });
  },

  addNotifications: (ns) => {
    set((state) => {
      const existing = new Set(state.notifications.map((x) => x.id));
      const fresh = ns.filter((n) => !existing.has(n.id));
      const list = [...fresh, ...state.notifications].slice(0, 50);
      return { notifications: list, unreadCount: list.filter((x) => !x.read).length };
    });
  },

  markRead: (id) => {
    set((state) => {
      const list = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { notifications: list, unreadCount: list.filter((x) => !x.read).length };
    });
  },

  markAsRead: (id) => {
    get().markRead(id);
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  markAllAsRead: () => {
    get().markAllRead();
  },

  setPanelOpen: (open) => set({ panelOpen: open, isPanelOpen: open }),
  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen, isPanelOpen: !state.isPanelOpen })),
  closePanel: () => set({ panelOpen: false, isPanelOpen: false }),
}));

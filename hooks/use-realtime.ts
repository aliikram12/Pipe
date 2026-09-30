'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { useAuthStore } from '@/stores/auth-store';
import { useOfflineStore } from '@/stores/offline-store';
import { toast } from 'sonner';
import { RealtimeMessage } from '@/lib/types';

// Simulate a WebSocket-like realtime service using polling + simulated WS events
// For production this would connect to a dedicated WS server
export function useRealtimeConnection() {
  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { accessToken, user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { isOnline, isSimulatingOffline } = useOfflineStore();
  const isMounted = useRef(true);

  const processMessage = useCallback((msg: RealtimeMessage) => {
    if (!isMounted.current) return;

    if (msg.type === 'notification:new') {
      const n = msg.payload;
      addNotification({
        id: n.id || `rt_${Date.now()}`,
        type: n.type,
        title: n.title,
        message: n.message,
        priority: n.priority,
        read: false,
        createdAt: n.createdAt || new Date().toISOString(),
      });

      if (n.priority === 'CRITICAL') {
        toast.error(`🚨 ${n.title}`, { description: n.message, duration: 8000 });
      } else if (n.priority === 'WARNING') {
        toast.warning(`⚠️ ${n.title}`, { description: n.message, duration: 6000 });
      }
    }

    if (msg.type === 'iot:alert') {
      toast.error(`🌡️ Temperature Alert: ${msg.payload.sensorCode}`, {
        description: msg.payload.alertReason,
        duration: 10000,
      });
    }

    if (msg.type === 'vehicle:geofence-enter') {
      toast.info(`📍 Vehicle entered ${msg.payload.geofenceName}`, {
        description: `Vehicle: ${msg.payload.vehicleNumber}`,
        duration: 5000,
      });
    }
  }, [addNotification]);

  // Try WebSocket connection first, fall back to polling
  const connectWS = useCallback(() => {
    if (!accessToken || !user || isSimulatingOffline || !isOnline) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      startPolling();
      return;
    }

    try {
      const ws = new WebSocket(`${wsUrl}?token=${accessToken}&tenantId=${user.tenantId}`);
      wsRef.current = ws;

      ws.onopen = () => console.log('[WS] Connected to realtime server');
      ws.onmessage = (event) => {
        try {
          const msg: RealtimeMessage = JSON.parse(event.data);
          processMessage(msg);
        } catch {}
      };
      ws.onclose = () => {
        wsRef.current = null;
        if (isMounted.current && isOnline) {
          // Reconnect after 5 seconds
          setTimeout(connectWS, 5000);
        }
      };
      ws.onerror = () => {
        ws.close();
        startPolling(); // Fall back to polling
      };
    } catch {
      startPolling();
    }
  }, [accessToken, user, isOnline, isSimulatingOffline, processMessage]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      if (!accessToken || !isOnline || isSimulatingOffline) return;
      try {
        const res = await fetch('/api/notifications?type=unread&limit=5', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const { notifications } = await res.json();
          notifications.forEach((n: any) => {
            addNotification({
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              priority: n.priority,
              read: n.read,
              createdAt: n.createdAt,
            });
          });
        }
      } catch {}
    }, 10000); // Poll every 10 seconds for real-time updates
  }, [accessToken, isOnline, isSimulatingOffline, addNotification]);

  useEffect(() => {
    isMounted.current = true;
    if (isOnline && !isSimulatingOffline && accessToken) {
      connectWS();
    }

    return () => {
      isMounted.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isOnline, isSimulatingOffline, accessToken, connectWS]);

  return { processMessage };
}

'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useCallback } from 'react';

export function useApiClient() {
  const { accessToken, refreshToken, setAuth, clearAuth } = useAuthStore();

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = new Headers(options.headers || {});
      headers.set('Content-Type', 'application/json');
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

      const response = await fetch(url, { ...options, headers });

      if (response.status === 401 && refreshToken) {
        // Try token refresh
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const { accessToken: newAccess, refreshToken: newRefresh, user } = await refreshRes.json();
            setAuth(user, newAccess, newRefresh);

            // Retry original request with new token
            headers.set('Authorization', `Bearer ${newAccess}`);
            return fetch(url, { ...options, headers });
          } else {
            clearAuth();
            window.location.href = '/login';
          }
        } catch {
          clearAuth();
          window.location.href = '/login';
        }
      }

      return response;
    },
    [accessToken, refreshToken, setAuth, clearAuth]
  );

  return { apiFetch };
}

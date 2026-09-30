'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { OfflineBanner } from '@/components/offline/offline-banner';
import { useAuthStore } from '@/stores/auth-store';
import { useRealtimeConnection } from '@/hooks/use-realtime';
import { usePathname, useRouter } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Initialize real-time WebSocket / polling connection
  useRealtimeConnection();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  // Don't wrap login page with sidebar/header
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-emerald-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Booting AgriSupply ColdIQ OS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-900" style={{ background: "var(--color-bg)" }}>
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="app-main flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Offline Banner alert if active or pending sync */}
        <OfflineBanner />

        {/* Global App Header */}
        <Header />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ background: "var(--color-bg)" }}>
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { AppLayout } from '@/components/layout/app-layout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AgriSupply Chain | Smart Cold-Chain Logistics Platform — Pakistan',
  description:
    'End-to-end Pakistani agricultural supply chain management with GPS tracking on M-2/M-5 corridors, cold-chain IoT monitoring, real-time analytics, and Neon PostgreSQL backend.',
  keywords: ['agricultural logistics', 'cold chain', 'supply chain Pakistan', 'IoT monitoring', 'GPS tracking', 'Kinnow', 'Mango', 'NLC fleet'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#166534',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-surface-muted text-slate-900`}>
        <Providers>
          <AppLayout>{children}</AppLayout>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              classNames: {
                toast: 'font-sans text-sm shadow-elevated border border-surface-border',
                title: 'font-semibold',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

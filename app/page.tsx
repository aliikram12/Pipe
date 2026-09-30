'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { StatusBadge } from '@/components/ui/status-badge';
import { TelemetryChart, TelemetryPoint } from '@/components/sensors/telemetry-chart';
import { PDFExporter } from '@/components/reports/pdf-exporter';
import { CSVExporter } from '@/components/reports/csv-exporter';
import { WeatherWidget } from '@/components/sensors/weather-widget';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Snowflake,
  Truck,
  Sprout,
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Dynamically import Google Maps component to avoid SSR errors
const LiveTrackingMap = dynamic(
  () => import('@/components/map/live-tracking-map').then((mod) => mod.LiveTrackingMap),
  { ssr: false, loading: () => <div className="h-[420px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-sm">Loading Live Map...</div> }
);

export default function DashboardPage() {
  const { user, accessToken } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [telemetryStream, setTelemetryStream] = useState<TelemetryPoint[]>([
    { time: '08:00', temperature: 3.2, humidity: 88 },
    { time: '09:00', temperature: 3.4, humidity: 87 },
    { time: '10:00', temperature: 3.1, humidity: 89 },
    { time: '11:00', temperature: 3.8, humidity: 86 },
    { time: '12:00', temperature: 4.2, humidity: 85 },
    { time: '13:00', temperature: 4.5, humidity: 84 },
    { time: '14:00', temperature: 4.1, humidity: 86 },
    { time: '15:00', temperature: 3.6, humidity: 88 },
    { time: '16:00', temperature: 3.3, humidity: 89 },
    { time: '17:00', temperature: 3.5, humidity: 88 },
  ]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh dashboard data every 30 seconds for real-time updates
    const refreshInterval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(refreshInterval);
  }, [accessToken]);

  // Demo simulator button: Trigger a simulated IoT temperature breach
  const simulateTemperatureExcursion = () => {
    const spikeTemp = 9.8; // Exceeds 6°C threshold
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTelemetryStream((prev) => [
      ...prev.slice(1),
      { time: timeLabel, temperature: spikeTemp, humidity: 76, isAlert: true },
    ]);

    addNotification({
      id: `spike_${Date.now()}`,
      type: 'TEMPERATURE',
      priority: 'CRITICAL',
      title: 'CRITICAL: Temperature Excursion in Kinnow Reefer LES-8842',
      message: `Cold-chain sensor detected +${spikeTemp}°C (Threshold: 6.0°C). Cargo: Kinnow Mandarin 25,000kg. Auto cooling boost triggered.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    toast.error('🚨 Temperature Excursion Triggered!', {
      description: `LES-8842 spiked to +${spikeTemp}°C near M-2 Corridor. Alert dispatched.`,
      duration: 6000,
    });
  };

  const mapMarkers = [
    {
      id: 'veh_1',
      type: 'VEHICLE' as const,
      name: 'NLC Hino 500 LES-8842',
      code: 'SHP-PK-2026-101',
      latitude: 31.854,
      longitude: 73.321,
      speed: 74,
      temperature: 4.2,
      status: 'IN_TRANSIT',
      cropType: 'Kinnow Mandarin — 25,000 kg',
    },
    {
      id: 'veh_2',
      type: 'VEHICLE' as const,
      name: 'NLC Reefer Semi KHI-9921',
      code: 'SHP-PK-2026-102',
      latitude: 27.558,
      longitude: 68.789,
      speed: 78,
      temperature: 11.2,
      status: 'IN_TRANSIT',
      cropType: 'Chaunsa Mangoes — 14,000 kg',
    },
    {
      id: 'hub_1',
      type: 'WAREHOUSE' as const,
      name: 'Lahore Central Cold-Chain Hub',
      latitude: 31.4697,
      longitude: 74.2728,
      status: 'OPERATIONAL',
    },
    {
      id: 'hub_2',
      type: 'WAREHOUSE' as const,
      name: 'Multan Southern Chilled Hub',
      latitude: 30.1984,
      longitude: 71.4687,
      status: 'OPERATIONAL',
    },
    {
      id: 'hub_3',
      type: 'WAREHOUSE' as const,
      name: 'Port Qasim Marine Export Terminal',
      latitude: 24.7833,
      longitude: 67.35,
      status: 'OPERATIONAL',
    },
    {
      id: 'farm_1',
      type: 'FARM' as const,
      name: 'Bhalwal Export Citrus Orchards',
      latitude: 32.268,
      longitude: 72.9,
      status: 'ACTIVE',
    },
    {
      id: 'farm_2',
      type: 'FARM' as const,
      name: 'Al-Raheem Chaunsa Groves, Multan',
      latitude: 30.1575,
      longitude: 71.45,
      status: 'ACTIVE',
    },
    {
      id: 'farm_3',
      type: 'FARM' as const,
      name: 'Swat Alpine Valley Orchards',
      latitude: 35.2227,
      longitude: 72.4258,
      status: 'ACTIVE',
    },
  ];

  const geofences = [
    {
      id: 'geo_1',
      name: 'Lahore M-2 Terminal Logistics Perimeter',
      latitude: 31.4697,
      longitude: 74.2728,
      radius: 2500,
      type: 'WAREHOUSE',
    },
    {
      id: 'geo_2',
      name: 'Bhalwal Citrus Pre-Cooling Gate',
      latitude: 32.268,
      longitude: 72.9,
      radius: 1800,
      type: 'FARM',
    },
    {
      id: 'geo_3',
      name: 'Port Qasim Marine Export Zone',
      latitude: 24.7833,
      longitude: 67.35,
      radius: 3000,
      type: 'WAREHOUSE',
    },
  ];

  // Route: Bhalwal → Lahore on M-2 motorway
  const routeBreadcrumbs: [number, number][] = [
    [32.268, 72.9],
    [32.12, 73.05],
    [31.96, 73.2],
    [31.854, 73.321],
    [31.65, 73.55],
    [31.47, 74.27],
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Executive Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 neu-flat p-5 rounded-2xl mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Cold-Chain Operations Command Center
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              99.4% Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring across farms, refrigerated fleets, cold storage chambers & retail distribution.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={simulateTemperatureExcursion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg neu-button text-rose-700 hover:text-rose-800 transition shadow-xs"
            title="Simulate a real-time temperature spike to verify alert handling"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Simulate Temp Excursion
          </button>

          <PDFExporter
            reportType="cold-chain"
            title="Cold Chain Compliance & Telemetry Audit"
            data={[]}
            buttonLabel="Compliance Certificate PDF"
          />

          <CSVExporter 
            data={telemetryStream}
            filename="cold_chain_telemetry"
            buttonLabel="Download CSV"
          />

          <Link
            href="/batches"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Batch
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Produce Under Management */}
        <div className="neu-flat p-4 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Active Produce Volume</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-110 transition shadow-sm">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {dashboardData?.batchesCount ? `${(dashboardData.batchesCount * 22300).toLocaleString()} kg` : '111,500 kg'}
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18%
            </span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">Kinnow, Mango, Potato, Cherry, Basmati</p>
        </div>

        {/* Metric 2: Active Reefer Fleet */}
        <div className="neu-flat p-4 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">In-Transit NLC Fleet</span>
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700 group-hover:scale-110 transition shadow-sm">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {dashboardData?.activeShipmentsCount || 2} Vehicles
            </span>
            <span className="text-xs font-bold text-sky-700">Live GPS</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">M-2 & M-5 Corridors — Avg 76 km/h</p>
        </div>

        {/* Metric 3: Cold Storage Chambers */}
        <div className="neu-flat p-4 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Chamber Mean Temp</span>
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700 group-hover:scale-110 transition shadow-sm">
              <Snowflake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-mono">+4.1°C</span>
            <span className="text-xs font-bold text-emerald-700">Optimal</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">4 active chambers — range: 2.5°C–12.5°C</p>
        </div>

        {/* Metric 4: Revenue PKR */}
        <div className="neu-flat p-4 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Cold Chain Integrity</span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 group-hover:scale-110 transition shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-mono">99.98%</span>
            <span className="text-xs font-bold text-emerald-700">0 Spoilage</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">Rs. 1.47M spoilage prevented this season</p>
        </div>
      </div>

      {/* Stage Progression Pipeline */}
      <div className="neu-flat p-5 rounded-2xl my-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm">
            Pakistan AgriSupply Pipeline — End-to-End Stage Status
          </h3>
          <span className="text-xs font-semibold text-slate-500">7 lifecycle stages • 5 active batches</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { stage: 'HARVESTED', label: '1. Harvested', count: 0, color: 'bg-emerald-500' },
            { stage: 'QUALITY_CHECK', label: '2. Inspection', count: 1, color: 'bg-amber-500' },
            { stage: 'READY_FOR_TRANSPORT', label: '3. Staged', count: 0, color: 'bg-sky-500' },
            { stage: 'IN_TRANSIT', label: '4. In-Transit', count: 2, color: 'bg-blue-600' },
            { stage: 'COLD_STORAGE', label: '5. Cold Storage', count: 1, color: 'bg-teal-500' },
            { stage: 'DISTRIBUTION', label: '6. Distribution', count: 1, color: 'bg-indigo-500' },
            { stage: 'DELIVERED', label: '7. Delivered', count: 0, color: 'bg-green-600' },
          ].map((step) => (
            <div
              key={step.stage}
              className="p-3 rounded-xl neu-inset flex flex-col justify-between"
            >
              <span className="text-[11px] font-bold text-slate-600">
                {step.label}
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-800">
                  {dashboardData?.batchesByStage?.[step.stage] ?? step.count}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">batches</span>
              </div>
              <div className="w-full bg-slate-200/50 h-1.5 rounded-full mt-2 overflow-hidden shadow-inner">
                <div
                  className={`${step.color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((dashboardData?.batchesByStage?.[step.stage] ?? step.count) * 40, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dual Grid: Live Fleet Map & IoT Telemetry Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Live Tracking Map */}
        <div className="neu-flat p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base">
                  Active Fleet & Corridor Geofences
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono shadow-sm">
                  LIVE GPS
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Pakistan M-2 (Sargodha→Lahore) & M-5 (Multan→Karachi) NLC Reefer Corridor
              </p>
            </div>
            <Link
              href="/tracking"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Full Screen Map <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <LiveTrackingMap
            markers={mapMarkers}
            geofences={geofences}
            routePath={routeBreadcrumbs}
            height="360px"
          />
        </div>

        {/* Right: IoT Telemetry + Weather */}
        <div className="flex flex-col gap-4">
          <div className="neu-flat p-5 rounded-2xl">
            <TelemetryChart
              data={telemetryStream}
              minTempThreshold={2.0}
              maxTempThreshold={6.0}
              title="Live Cold Storage & Reefer Telemetry"
              subtitle="Streaming from SNS-PK-LHR-01 (Citrus Zone) & NLC Reefer LES-8842"
            />
          </div>

          {/* Weather Widget */}
          <WeatherWidget city="Lahore" latitude={31.5204} longitude={74.3587} />
        </div>
      </div>

      {/* Bottom Table: Active In-Transit Shipments */}
      <div className="neu-flat rounded-2xl overflow-hidden mt-6">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Active Shipments & Cold-Chain Dispatch
            </h3>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Live location, vehicle assignment, and current cargo temperature
            </p>
          </div>
          <Link
            href="/shipments"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All Shipments <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-600 uppercase tracking-wider font-bold border-b border-black/5" style={{ background: "rgba(0,0,0,0.02)" }}>
              <tr>
                <th className="px-5 py-3">Shipment Ref</th>
                <th className="px-5 py-3">Produce Batch</th>
                <th className="px-5 py-3">Vehicle & Driver</th>
                <th className="px-5 py-3">Route Origin / Dest</th>
                <th className="px-5 py-3">Cargo Temp</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {(dashboardData?.recentShipments?.length
                ? dashboardData.recentShipments.map((s: any) => ({
                    id: s.id,
                    code: s.shipmentNumber,
                    batch: s.batch?.batchNumber || '-',
                    produce: s.batch?.produceType || '-',
                    vehicle: s.vehicle?.vehicleNumber || '-',
                    driver: s.driver?.name || '-',
                    origin: s.source || '-',
                    dest: s.destination || '-',
                    temp: s.status === 'IN_TRANSIT' ? 4.2 : null,
                    status: s.status,
                  }))
                : [
                    {
                      id: 'shp_01',
                      code: 'SHP-PK-2026-101',
                      batch: 'BAT-PK-KINNOW-01',
                      produce: 'Kinnow Mandarin',
                      vehicle: 'LES-8842 (Hino 500 Reefer)',
                      driver: 'Asif Mahmood (NLC)',
                      origin: 'Bhalwal, Sargodha (M-2)',
                      dest: 'Lahore Central Cold-Chain Hub',
                      temp: 4.2,
                      status: 'IN_TRANSIT',
                    },
                    {
                      id: 'shp_02',
                      code: 'SHP-PK-2026-102',
                      batch: 'BAT-PK-CHAUNSA-02',
                      produce: 'White Chaunsa Mango',
                      vehicle: 'KHI-9921 (NLC Semi-Trailer)',
                      driver: 'Rashid Ali Baloch',
                      origin: 'Shujabad, Multan (M-5)',
                      dest: 'Port Qasim Marine Terminal',
                      temp: 11.2,
                      status: 'IN_TRANSIT',
                    },
                    {
                      id: 'shp_03',
                      code: 'SHP-PK-2026-103',
                      batch: 'BAT-PK-RICE-05',
                      produce: 'Super Kernel Basmati',
                      vehicle: 'MN-4412 (Isuzu Reefer)',
                      driver: 'Muhammad Nawaz Bhatti',
                      origin: 'Okara Agrico Hub',
                      dest: 'Lahore Central Cold-Chain Hub',
                      temp: 3.2,
                      status: 'DELIVERED',
                    },
                  ]
              ).map((item: any) => (
                <tr key={item.id} className="hover:bg-black/5 transition">
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-900">
                    {item.code}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900 block">
                      {item.produce}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.batch}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-800 block">
                      {item.vehicle}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.driver}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <div>{item.origin}</div>
                    <div className="text-[11px] text-slate-400">➔ {item.dest}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        item.temp > 6.0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <Snowflake className="w-3 h-3" />
                      +{item.temp?.toFixed ? item.temp.toFixed(1) : (item.temp || '4.2')}°C
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/shipments/${item.id}`}
                      className="px-2.5 py-1 text-xs font-semibold rounded neu-button hover:neu-inset transition"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

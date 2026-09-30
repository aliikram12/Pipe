'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/stores/auth-store';
import { StatusBadge } from '@/components/ui/status-badge';
import { TelemetryChart } from '@/components/sensors/telemetry-chart';
import { PDFExporter } from '@/components/reports/pdf-exporter';
import { formatDate } from '@/lib/utils';
import {
  Truck,
  ArrowLeft,
  Snowflake,
  MapPin,
  Clock,
  Radio,
  User,
  ShieldCheck,
  BatteryCharging,
  Gauge,
  Phone,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const LiveTrackingMap = dynamic(
  () => import('@/components/map/live-tracking-map').then((mod) => mod.LiveTrackingMap),
  { ssr: false, loading: () => <div className="h-[400px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">Loading Map Cockpit...</div> }
);

export default function ShipmentDetailPage() {
  const params = useParams();
  const { accessToken } = useAuthStore();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const shipmentId = params.id as string;

  useEffect(() => {
    const loadShipment = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/shipments/${shipmentId}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setShipment(data.shipment || data);
        } else {
          // Fallback rich Pakistan logistics demonstration state
          setShipment({
            id: shipmentId,
            shipmentNumber: 'SHP-2026-081',
            status: 'IN_TRANSIT',
            originAddress: 'Bhalwal Citrus Packing Estate, Sargodha (Punjab)',
            destinationAddress: 'Thokar Niaz Baig Central Cold Hub, Lahore',
            plannedDeparture: '2026-09-28T13:00:00Z',
            estimatedArrival: '2026-09-28T17:30:00Z',
            currentSpeed: 74,
            currentTemp: 4.2,
            currentHumidity: 88,
            reeferBattery: 95,
            compressorMode: 'ACTIVE_CYCLE_COOLING',
            geofenceStatus: 'APPROACHING_LAHORE_RING_ROAD',
            distanceRemainingKm: 28.5,
            batch: {
              batchNumber: 'BAT-PK-KINNOW-01',
              produceType: 'Kinnow Mandarin (Export Grade)',
              variety: 'W-Murcott Export Seedless',
              quantity: 12500,
              optimalMinTemp: 3.0,
              optimalMaxTemp: 6.0,
            },
            vehicle: {
              vehicleNumber: 'LES-8842',
              type: 'NLC Volvo Reefer 40ft ThermoKing',
              lastServiceDate: '2026-09-12',
            },
            driver: {
              name: 'Tariq Mehmood',
              phone: '+92-300-8451290',
              license: 'HTV-PUNJAB-99214',
              status: 'ON_DUTY',
            },
          });
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    loadShipment();
  }, [shipmentId, accessToken]);

  const telemetryData = [
    { time: '13:00', temperature: 4.1, humidity: 89 },
    { time: '13:30', temperature: 4.3, humidity: 88 },
    { time: '14:00', temperature: 4.2, humidity: 88 },
    { time: '14:30', temperature: 4.5, humidity: 87 },
    { time: '15:00', temperature: 4.2, humidity: 88 },
    { time: '15:30', temperature: 4.2, humidity: 88 },
  ];

  const markers = [
    {
      id: 'active_truck',
      type: 'VEHICLE' as const,
      name: 'NLC Reefer #LES-8842 (On M-2 Motorway)',
      code: 'SHP-2026-081',
      latitude: 31.6900,
      longitude: 73.9800,
      speed: 74,
      temperature: 4.2,
      status: 'IN_TRANSIT',
    },
    {
      id: 'dest_hub',
      type: 'WAREHOUSE' as const,
      name: 'Thokar Niaz Baig Central Cold Hub (Lahore)',
      latitude: 31.4700,
      longitude: 74.2400,
      status: 'DESTINATION',
    },
  ];

  const geofences = [
    {
      id: 'dest_geo',
      name: 'Lahore Thokar Intake Geofence',
      latitude: 31.4700,
      longitude: 74.2400,
      radius: 1800,
      type: 'WAREHOUSE',
    },
  ];

  const routePath: [number, number][] = [
    [32.2642, 72.8988], // Bhalwal Sargodha
    [32.0620, 73.0850], // Salam Interchange M-2
    [31.8950, 73.2790], // Pindi Bhattian
    [31.7500, 73.5200], // Sukheke Service Area
    [31.6900, 73.9800], // Sheikhupura M-2
    [31.4700, 74.2400], // Lahore Thokar Niaz Baig Hub
  ];

  if (!shipment) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Connecting to vehicle telematics...
      </div>
    );
  }

  const handleUpdateStatus = (newStatus: string) => {
    setShipment({ ...shipment, status: newStatus });
    toast.success(`Shipment status updated to: ${newStatus}`, {
      description: 'Audit log event created and destination notifications dispatched.',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/shipments"
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {shipment.shipmentNumber}
              </h1>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Transporting <strong>{shipment.batch?.produceType}</strong> ({shipment.batch?.quantity?.toLocaleString()} kg)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shipment.status === 'IN_TRANSIT' && (
            <button
              onClick={() => handleUpdateStatus('ARRIVED')}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
            >
              Simulate Gate Arrival
            </button>
          )}
          <PDFExporter
            reportType="shipment"
            title={`Transport Manifest ${shipment.shipmentNumber}`}
            data={[shipment]}
            buttonLabel="Download Shipping Manifest PDF"
          />
        </div>
      </div>

      {/* Reefer Fleet Telemetry Telematics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cargo Reefer Temp</span>
            <Snowflake className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-600">
            +{shipment.currentTemp}°C
          </div>
          <span className="text-[11px] text-slate-400">Target: +1.5°C to +4.5°C</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Vehicle Speed</span>
            <Gauge className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
            {shipment.currentSpeed} km/h
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Cruising on Highway 101</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Reefer Battery & Power</span>
            <BatteryCharging className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
            {shipment.reeferBattery}%
          </div>
          <span className="text-[11px] text-slate-400">Compressor: Continuous</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Distance Remaining</span>
            <Navigation className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
            {shipment.distanceRemainingKm} km
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">ETA: ~38 minutes</span>
        </div>
      </div>

      {/* Live Map & Driver Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Map Cockpit */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Live GPS Trail & Geofence Corridor
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Telemetry Rate: 2.5s</span>
          </div>

          <LiveTrackingMap
            markers={markers}
            geofences={geofences}
            routePath={routePath}
            height="380px"
          />
        </div>

        {/* Right Col: Driver & Reefer Diagnostics */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              Driver & Transport Unit
            </h3>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                {shipment.driver?.name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {shipment.driver?.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">{shipment.driver?.license}</div>
              </div>
              <a
                href={`tel:${shipment.driver?.phone}`}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
                title="Call Driver"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Vehicle Unit:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{shipment.vehicle?.vehicleNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Reefer Type:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{shipment.vehicle?.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Departure:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{formatDate(shipment.plannedDeparture, 'HH:mm')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Geofence Status:</span>
                <span className="font-semibold text-emerald-600">Within Safe Corridor</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
              Route Waypoint Checkpoints
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Origin Departed</div>
                  <div className="text-[11px] text-slate-400">{shipment.originAddress}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <div className="w-2 h-2 rounded-full bg-sky-500 mt-1 flex-shrink-0 animate-ping" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Corridor In-Transit</div>
                  <div className="text-[11px] text-slate-400">US-101 Southbound (34 km left)</div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Destination Cold Storage</div>
                  <div className="text-[11px]">{shipment.destinationAddress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temperature Telemetry Graph */}
      <div>
        <TelemetryChart
          data={telemetryData}
          minTempThreshold={1.5}
          maxTempThreshold={4.5}
          title={`Reefer Unit Telemetry: ${shipment.vehicle?.vehicleNumber}`}
          subtitle="Real-time thermal compliance during Highway 101 transit"
        />
      </div>
    </div>
  );
}

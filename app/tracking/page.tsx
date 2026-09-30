'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/stores/auth-store';
import { MapMarkerItem, GeofenceZone } from '@/components/map/live-tracking-map';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  MapPin,
  Truck,
  Warehouse,
  Play,
  Pause,
  RotateCcw,
  Radio,
  Snowflake,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const LiveTrackingMap = dynamic(
  () => import('@/components/map/live-tracking-map').then((mod) => mod.LiveTrackingMap),
  { ssr: false, loading: () => <div className="h-[650px] w-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400">Initializing Satellite & Telemetry Map...</div> }
);

// Pakistan M-2 corridor: Sargodha → Lahore
const M2_WAYPOINTS = [
  [32.268, 72.9],    // Bhalwal, Sargodha
  [32.12, 73.05],
  [31.96, 73.2],
  [31.854, 73.321],  // Between Kharian & Gujranwala
  [31.65, 73.55],
  [31.47, 74.27],    // Lahore Hub
];

// Pakistan M-5 corridor: Multan → Karachi
const M5_WAYPOINTS = [
  [30.1575, 71.45],   // Multan / Shujabad
  [29.37, 70.34],
  [28.42, 69.21],
  [27.558, 68.789],   // Sukkur
  [26.2, 68.4],
  [24.95, 67.15],
  [24.7833, 67.35],   // Port Qasim, Karachi
];

const INITIAL_VEHICLES: MapMarkerItem[] = [
  {
    id: 'veh_1',
    type: 'VEHICLE',
    name: 'NLC Hino 500 LES-8842',
    code: 'SHP-PK-2026-101',
    latitude: 31.854,
    longitude: 73.321,
    speed: 74,
    temperature: 4.2,
    status: 'IN_TRANSIT',
    driverName: 'Asif Mahmood (NLC)',
    cropType: 'Kinnow Mandarin — 25,000 kg',
  },
  {
    id: 'veh_2',
    type: 'VEHICLE',
    name: 'NLC Reefer Semi KHI-9921',
    code: 'SHP-PK-2026-102',
    latitude: 27.558,
    longitude: 68.789,
    speed: 78,
    temperature: 11.2,
    status: 'IN_TRANSIT',
    driverName: 'Rashid Ali Baloch',
    cropType: 'Chaunsa Mangoes — 14,000 kg',
  },
  {
    id: 'veh_3',
    type: 'VEHICLE',
    name: 'Isuzu Reefer Van MN-4412',
    code: 'SHP-PK-2026-103',
    latitude: 30.1984,
    longitude: 71.4687,
    speed: 0,
    temperature: 3.2,
    status: 'AVAILABLE',
    driverName: 'Muhammad Nawaz Bhatti',
    cropType: 'Idle — Multan Hub',
  },
  {
    id: 'veh_4',
    type: 'VEHICLE',
    name: 'Heavy Reefer ISL-3311',
    code: 'MAINTENANCE',
    latitude: 33.7294,
    longitude: 73.0931,
    speed: 0,
    temperature: null as any,
    status: 'MAINTENANCE',
    driverName: 'In Workshop — Islamabad',
    cropType: 'Unit under servicing',
  },
  {
    id: 'hub_1',
    type: 'WAREHOUSE',
    name: 'Lahore Central Cold-Chain Hub',
    latitude: 31.4697,
    longitude: 74.2728,
    status: 'OPERATIONAL',
  },
  {
    id: 'hub_2',
    type: 'WAREHOUSE',
    name: 'Multan Southern Chilled Hub',
    latitude: 30.1984,
    longitude: 71.4687,
    status: 'OPERATIONAL',
  },
  {
    id: 'hub_3',
    type: 'WAREHOUSE',
    name: 'Port Qasim Marine Export Terminal',
    latitude: 24.7833,
    longitude: 67.35,
    status: 'OPERATIONAL',
  },
  {
    id: 'farm_1',
    type: 'FARM',
    name: 'Bhalwal Export Citrus Orchards',
    latitude: 32.268,
    longitude: 72.9,
    status: 'ACTIVE',
  },
  {
    id: 'farm_2',
    type: 'FARM',
    name: 'Al-Raheem Chaunsa Groves, Multan',
    latitude: 30.1575,
    longitude: 71.45,
    status: 'ACTIVE',
  },
  {
    id: 'farm_3',
    type: 'FARM',
    name: 'Okara Agrico Potato Fields',
    latitude: 30.8081,
    longitude: 73.4458,
    status: 'ACTIVE',
  },
  {
    id: 'farm_4',
    type: 'FARM',
    name: 'Swat Alpine Valley Orchards',
    latitude: 35.2227,
    longitude: 72.4258,
    status: 'ACTIVE',
  },
];

const GEOFENCES: GeofenceZone[] = [
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
    name: 'Multan M-5 Motorway Reefer Depot',
    latitude: 30.1984,
    longitude: 71.4687,
    radius: 2000,
    type: 'WAREHOUSE',
  },
  {
    id: 'geo_3',
    name: 'Bhalwal Citrus Pre-Cooling Gate',
    latitude: 32.268,
    longitude: 72.9,
    radius: 1800,
    type: 'FARM',
  },
  {
    id: 'geo_4',
    name: 'Port Qasim Marine Export Zone',
    latitude: 24.7833,
    longitude: 67.35,
    radius: 3000,
    type: 'WAREHOUSE',
  },
  {
    id: 'geo_5',
    name: 'Okara Potato Collection Point',
    latitude: 30.8081,
    longitude: 73.4458,
    radius: 1200,
    type: 'FARM',
  },
];

// M-2 simulation: vehicle moves along waypoints
let m2Step = 3; // start at current position
let m5Step = 3;

export default function TrackingPage() {
  const [markers, setMarkers] = useState<MapMarkerItem[]>(INITIAL_VEHICLES);
  const [activeMarkerId, setActiveMarkerId] = useState<string>('veh_1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'VEHICLES' | 'HUBS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // GPS Simulation Loop — moves vehicles along Pakistan motorway waypoints
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(() => {
        // Advance M-2 vehicle
        m2Step = (m2Step + 1) % M2_WAYPOINTS.length;
        m5Step = (m5Step + 1) % M5_WAYPOINTS.length;

        setMarkers((prev) =>
          prev.map((m) => {
            if (m.id === 'veh_1') {
              const [lat, lng] = M2_WAYPOINTS[m2Step];
              return {
                ...m,
                latitude: lat,
                longitude: lng,
                temperature: Number((4.1 + (Math.random() - 0.5) * 0.4).toFixed(1)),
                speed: Math.floor(68 + Math.random() * 10),
                status: m2Step >= M2_WAYPOINTS.length - 1 ? 'NEAR_DESTINATION' : 'IN_TRANSIT',
              };
            }
            if (m.id === 'veh_2') {
              const [lat, lng] = M5_WAYPOINTS[m5Step];
              return {
                ...m,
                latitude: lat,
                longitude: lng,
                temperature: Number((11.2 + (Math.random() - 0.5) * 0.5).toFixed(1)),
                speed: Math.floor(74 + Math.random() * 10),
                status: m5Step >= M5_WAYPOINTS.length - 1 ? 'NEAR_DESTINATION' : 'IN_TRANSIT',
              };
            }
            if (m.id === 'veh_3') {
              // idle at Multan with slight temperature fluctuation
              return {
                ...m,
                temperature: Number((3.2 + (Math.random() - 0.5) * 0.1).toFixed(1)),
              };
            }
            return m;
          })
        );
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const toggleSimulation = () => {
    const nextState = !isSimulating;
    setIsSimulating(nextState);
    if (nextState) {
      m2Step = 3;
      m5Step = 3;
      toast.success('GPS Fleet Simulation Started', {
        description: 'LES-8842 moving on M-2 (Sargodha→Lahore), KHI-9921 on M-5 (Multan→Karachi). Updates every 3.5s.',
      });
    } else {
      toast.info('GPS Simulation Paused');
    }
  };

  const filteredMarkers = markers.filter((m) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'VEHICLES' && m.type === 'VEHICLE') ||
      (filterType === 'HUBS' && (m.type === 'WAREHOUSE' || m.type === 'FARM'));

    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const activeMarker = markers.find((m) => m.id === activeMarkerId);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-600 animate-pulse" />
            Live Fleet & Corridor Geofence Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time GPS tracking of Pakistan fleet on M-2 (Sargodha→Lahore) and M-5 (Multan→Karachi) motorway corridors. Geofencing active at all cold hubs.
          </p>
        </div>

        {/* Live Simulation Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulation}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow transition ${
              isSimulating
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Movement
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Simulate Fleet Movement
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Map and Sidebar Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar: Vehicle List & Inspector */}
        <div className="neu-flat p-4 flex flex-col h-[650px]">
          {/* Search & Filter */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fleet or hubs..."
                className="w-full pl-9 pr-3 py-1.5 text-xs neu-inset text-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex gap-1 text-[11px]">
              {(['ALL', 'VEHICLES', 'HUBS'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`flex-1 py-1 rounded-md font-semibold transition ${
                    filterType === t
                      ? 'neu-inset text-emerald-700'
                      : 'neu-button text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-black/5">
            {filteredMarkers.map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveMarkerId(m.id)}
                className={`p-3 rounded-xl cursor-pointer transition border text-xs ${
                  activeMarkerId === m.id
                    ? 'neu-inset shadow-xs'
                    : 'neu-button border-transparent hover:neu-inset'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {m.type === 'VEHICLE' ? (
                      <Truck className="w-4 h-4 text-sky-600" />
                    ) : (
                      <Warehouse className="w-4 h-4 text-emerald-600" />
                    )}
                    <span className="font-bold text-slate-800 truncate">
                      {m.name}
                    </span>
                  </div>
                  {m.temperature != null && (
                    <span
                      className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
                        m.temperature > 6 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      +{m.temperature}°C
                    </span>
                  )}
                </div>

                {m.code && (
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    {m.code} • {m.cropType}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                  <span>{m.driverName || m.status}</span>
                  {m.speed !== undefined && (
                    <span className="font-mono font-semibold text-sky-600">{m.speed} km/h</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Active Marker Details Footer */}
          {activeMarker && (
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Selected Unit Telemetry
              </span>
              <div className="p-2.5 rounded-xl neu-inset space-y-1 mt-2">
                <div className="font-bold text-slate-800">{activeMarker.name}</div>
                <div className="text-[11px] text-slate-600 font-mono">
                  Coordinates: {activeMarker.latitude?.toFixed ? activeMarker.latitude.toFixed(4) : activeMarker.latitude}, {activeMarker.longitude?.toFixed ? activeMarker.longitude.toFixed(4) : activeMarker.longitude}
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-emerald-700 font-semibold">
                    {activeMarker.type === 'VEHICLE'
                      ? activeMarker.status === 'IN_TRANSIT' ? 'On Motorway Corridor' : activeMarker.status === 'NEAR_DESTINATION' ? 'Approaching Hub' : activeMarker.status
                      : 'Geofence Active'}
                  </span>
                  <span className="font-mono text-slate-800 font-semibold">Signal: 99%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 3 Cols: Full-Screen Interactive Leaflet Map */}
        <div className="lg:col-span-3">
          <LiveTrackingMap
            markers={markers}
            geofences={GEOFENCES}
            activeMarkerId={activeMarkerId}
            onSelectMarker={(m) => setActiveMarkerId(m.id)}
            height="650px"
          />
        </div>
      </div>
    </div>
  );
}

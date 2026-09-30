'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Modal } from '@/components/ui/modal';
import {
  Settings,
  MapPin,
  Thermometer,
  Shield,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Radio,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

interface GeofenceItem {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  radius: number;
  active: boolean;
}

const INITIAL_GEOFENCES: GeofenceItem[] = [
  {
    id: 'geo_1',
    name: 'Lahore Thokar Niaz Baig Central Cold Hub',
    type: 'WAREHOUSE',
    latitude: 31.4700,
    longitude: 74.2400,
    radius: 2000,
    active: true,
  },
  {
    id: 'geo_2',
    name: 'Sargodha Bhalwal Citrus Processing Estate',
    type: 'FARM',
    latitude: 32.2642,
    longitude: 72.8988,
    radius: 2500,
    active: true,
  },
  {
    id: 'geo_3',
    name: 'Port Qasim Marine Reefer Terminal (Karachi)',
    type: 'DISTRIBUTION_DEPOT',
    latitude: 24.7836,
    longitude: 67.3400,
    radius: 3000,
    active: true,
  },
  {
    id: 'geo_4',
    name: 'Multan Shujabad Mango Logistics Center',
    type: 'WAREHOUSE',
    latitude: 30.1575,
    longitude: 71.5249,
    radius: 2000,
    active: true,
  },
];

export default function SettingsPage() {
  const [geofences, setGeofences] = useState<GeofenceItem[]>(INITIAL_GEOFENCES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Geofence Modal State — Pakistan Defaults
  const [formName, setFormName] = useState('Okara Agri Storage Gate');
  const [formType, setFormType] = useState('WAREHOUSE');
  const [formLat, setFormLat] = useState(30.8080);
  const [formLng, setFormLng] = useState(73.4458);
  const [formRadius, setFormRadius] = useState(1500);

  // Sensor Thresholds State
  const [maxTemp, setMaxTemp] = useState(6.0);
  const [minTemp, setMinTemp] = useState(1.0);
  const [alertDurationMins, setAlertDurationMins] = useState(15);
  const [sampleRateSecs, setSampleRateSecs] = useState(30);

  const handleAddGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    const newGeo: GeofenceItem = {
      id: `geo_${Date.now()}`,
      name: formName,
      type: formType,
      latitude: Number(formLat),
      longitude: Number(formLng),
      radius: Number(formRadius),
      active: true,
    };
    setGeofences([...geofences, newGeo]);
    setIsModalOpen(false);
    toast.success(`Geofence boundary ${formName} registered!`);
  };

  const handleDeleteGeofence = (id: string) => {
    setGeofences(geofences.filter((g) => g.id !== id));
    toast.info('Geofence boundary removed');
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('IoT Cold-Chain Thresholds Updated', {
      description: 'Parameters synced to all active reefer and chamber gateway sensors.',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          System Settings, Geofences & IoT Parameters
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure circular geofence perimeters, thermal threshold excursion alerts, and tenant settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geofence Perimeter Manager */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Geofence Boundary Perimeters
                </h3>
                <p className="text-xs text-slate-500">Auto-triggers arrival and departure dispatch notifications</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Zone
              </button>
            </div>

            <div className="space-y-2.5">
              {geofences.map((geo) => (
                <div
                  key={geo.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{geo.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {geo.type} • Radius: {geo.radius}m ({geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                    <button
                      onClick={() => handleDeleteGeofence(geo.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* IoT Temperature Excursion Parameters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-emerald-600" />
              Thermal Alert Threshold Rules
            </h3>
            <p className="text-xs text-slate-500">Configure global automated excursion alarms</p>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Upper Critical Limit (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={maxTemp}
                  onChange={(e) => setMaxTemp(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Lower Freezing Limit (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={minTemp}
                  onChange={(e) => setMinTemp(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Excursion Tolerance Time (Mins)
                </label>
                <input
                  type="number"
                  value={alertDurationMins}
                  onChange={(e) => setAlertDurationMins(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  IoT Sensor Telemetry Rate (Secs)
                </label>
                <input
                  type="number"
                  value={sampleRateSecs}
                  onChange={(e) => setSampleRateSecs(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow transition"
              >
                <Save className="w-3.5 h-3.5" />
                Save Threshold Parameters
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Geofence Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Geofence Circular Boundary"
        subtitle="Define location coordinates and detection radius in meters"
      >
        <form onSubmit={handleAddGeofence} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Zone Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Oakland Port Cold Hub"
              required
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formLat}
                onChange={(e) => setFormLat(Number(e.target.value))}
                required
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formLng}
                onChange={(e) => setFormLng(Number(e.target.value))}
                required
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Detection Radius (meters)
            </label>
            <input
              type="number"
              value={formRadius}
              onChange={(e) => setFormRadius(Number(e.target.value))}
              required
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
            >
              Register Perimeter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

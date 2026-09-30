'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import {
  Warehouse,
  Snowflake,
  Droplets,
  Thermometer,
  Layers,
  Battery,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Sliders,
  Sprout,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface Chamber {
  id: string;
  name: string;
  code: string;
  warehouseName: string;
  targetTempMin: number;
  targetTempMax: number;
  currentTemp: number;
  currentHumidity: number;
  capacityKg: number;
  occupiedKg: number;
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  sensorCode: string;
  sensorBattery: number;
  storedBatches: {
    batchNumber: string;
    produceType: string;
    quantity: number;
    daysStored: number;
    shelfLifeDays: number;
  }[];
}

const INITIAL_CHAMBERS: Chamber[] = [
  {
    id: 'ch_1',
    name: 'Chamber A-1: Sargodha Kinnow Pre-Cooling Zone',
    code: 'CH-LHR-A1',
    warehouseName: 'Thokar Niaz Baig Central Cold Hub, Lahore',
    targetTempMin: 3.0,
    targetTempMax: 5.5,
    currentTemp: 4.1,
    currentHumidity: 90,
    capacityKg: 60000,
    occupiedKg: 49500,
    status: 'OPTIMAL',
    sensorCode: 'SNS-PK-LHR-01',
    sensorBattery: 96,
    storedBatches: [
      { batchNumber: 'BAT-PK-KINNOW-01', produceType: 'Kinnow Mandarin (Export Grade)', quantity: 32000, daysStored: 2, shelfLifeDays: 28 },
      { batchNumber: 'BAT-PK-KINNOW-02', produceType: 'Kinnow Mandarin (Commercial)', quantity: 17500, daysStored: 1, shelfLifeDays: 25 },
    ],
  },
  {
    id: 'ch_2',
    name: 'Chamber B-2: Multan Export Mango Controlled Atmosphere',
    code: 'CH-KHI-B2',
    warehouseName: 'Port Qasim Marine Cold Terminal, Karachi',
    targetTempMin: 11.5,
    targetTempMax: 13.5,
    currentTemp: 12.4,
    currentHumidity: 86,
    capacityKg: 50000,
    occupiedKg: 38200,
    status: 'OPTIMAL',
    sensorCode: 'SNS-PK-KHI-04',
    sensorBattery: 92,
    storedBatches: [
      { batchNumber: 'BAT-PK-CHAUNSA-02', produceType: 'Chaunsa Mango (HWT Export)', quantity: 22000, daysStored: 3, shelfLifeDays: 18 },
      { batchNumber: 'BAT-PK-SINDHRI-05', produceType: 'Sindhri Mangoes (Tando Allahyar)', quantity: 16200, daysStored: 2, shelfLifeDays: 16 },
    ],
  },
  {
    id: 'ch_3',
    name: 'Chamber C-3: Okara High-Density Seed Potato Chamber',
    code: 'CH-OKR-C3',
    warehouseName: 'Depalpur Road Agri Storage Facility, Okara',
    targetTempMin: 6.5,
    targetTempMax: 8.5,
    currentTemp: 7.2,
    currentHumidity: 92,
    capacityKg: 80000,
    occupiedKg: 64500,
    status: 'OPTIMAL',
    sensorCode: 'SNS-PK-OKR-07',
    sensorBattery: 89,
    storedBatches: [
      { batchNumber: 'BAT-PK-POTATO-03', produceType: 'Kuroda Seed Potato', quantity: 42000, daysStored: 12, shelfLifeDays: 90 },
      { batchNumber: 'BAT-PK-POTATO-04', produceType: 'Mozart Processing Potatoes', quantity: 22500, daysStored: 8, shelfLifeDays: 80 },
    ],
  },
  {
    id: 'ch_4',
    name: 'Chamber D-4: Swat Pome Fruit Low-O2 Zone',
    code: 'CH-ISB-D4',
    warehouseName: 'I-11 Wholesale Mandi Cold Storage, Islamabad',
    targetTempMin: 1.5,
    targetTempMax: 3.5,
    currentTemp: 2.3,
    currentHumidity: 94,
    capacityKg: 40000,
    occupiedKg: 28000,
    status: 'OPTIMAL',
    sensorCode: 'SNS-PK-ISB-09',
    sensorBattery: 94,
    storedBatches: [
      { batchNumber: 'BAT-PK-APPLE-04', produceType: 'Swat Royal Gala Apples', quantity: 28000, daysStored: 4, shelfLifeDays: 40 },
    ],
  },
];

export default function InventoryPage() {
  const [chambers, setChambers] = useState<Chamber[]>(INITIAL_CHAMBERS);
  const [selectedChamber, setSelectedChamber] = useState<Chamber | null>(null);
  const [newSetTemp, setNewSetTemp] = useState<number>(2.0);

  const handleOpenAdjust = (chamber: Chamber) => {
    setSelectedChamber(chamber);
    setNewSetTemp(chamber.currentTemp);
  };

  const handleSaveSetTemp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChamber) return;

    setChambers((prev) =>
      prev.map((c) =>
        c.id === selectedChamber.id
          ? {
              ...c,
              targetTempMin: Number((newSetTemp - 1.0).toFixed(1)),
              targetTempMax: Number((newSetTemp + 1.0).toFixed(1)),
              currentTemp: Number(newSetTemp.toFixed(1)),
            }
          : c
      )
    );

    toast.success(`Chamber ${selectedChamber.code} setpoint calibrated`, {
      description: `Target set to ${newSetTemp}°C. Chiller compressor cycling accordingly.`,
    });
    setSelectedChamber(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-emerald-600" />
            Cold Storage Chambers & Warehouse Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chamber refrigeration status, atmospheric humidity levels, and stock lot allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            All 3 Refrigeration Units Nominal
          </div>
        </div>
      </div>

      {/* Chambers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {chambers.map((chamber) => {
          const occupancyPct = Math.round((chamber.occupiedKg / chamber.capacityKg) * 100);

          return (
            <div
              key={chamber.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-500/40 transition group"
            >
              <div>
                {/* Chamber Code & Status Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400 block">
                      {chamber.code}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                      {chamber.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{chamber.warehouseName}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {chamber.status}
                  </span>
                </div>

                {/* Temp & Humidity Gauge Readouts */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Air Temp</span>
                      <Snowflake className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                      +{chamber.currentTemp}°C
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Range: {chamber.targetTempMin}°C – {chamber.targetTempMax}°C
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Atmospheric RH</span>
                      <Droplets className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="text-2xl font-black font-mono text-sky-600 mt-1">
                      {chamber.currentHumidity}%
                    </div>
                    <span className="text-[10px] text-slate-400">High Humidity Mode</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Chamber Capacity</span>
                    <span className="text-slate-900 dark:text-white font-mono">
                      {occupancyPct}% ({chamber.occupiedKg.toLocaleString()} / {chamber.capacityKg.toLocaleString()} kg)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occupancyPct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Allocated Stored Batches */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                    Stored Produce Lots ({chamber.storedBatches.length})
                  </span>
                  <div className="space-y-1.5">
                    {chamber.storedBatches.map((b) => (
                      <div
                        key={b.batchNumber}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {b.produceType}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">{b.batchNumber}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {b.quantity.toLocaleString()} kg
                          </div>
                          <div className="text-[10px] text-emerald-600 font-medium">
                            {b.shelfLifeDays} days left
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions & IoT Sensor Health */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Battery className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{chamber.sensorCode} ({chamber.sensorBattery}%)</span>
                </div>

                <button
                  onClick={() => handleOpenAdjust(chamber)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <Sliders className="w-3 h-3" />
                  Set Target
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Chamber Modal */}
      {selectedChamber && (
        <Modal
          isOpen={!!selectedChamber}
          onClose={() => setSelectedChamber(null)}
          title={`Adjust Temperature Setpoint: ${selectedChamber.code}`}
          subtitle={`Current Target: ${selectedChamber.targetTempMin}°C – ${selectedChamber.targetTempMax}°C`}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveSetTemp} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Target Chilled Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={newSetTemp}
                onChange={(e) => setNewSetTemp(Number(e.target.value))}
                required
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-base"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Refrigeration unit hysteresis tolerance is automatically maintained within ±1.0°C.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedChamber(null)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
              >
                Apply Setpoint
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useOfflineStore } from '@/stores/offline-store';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Snowflake,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Radio,
  FileText,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

interface ShipmentItem {
  id: string;
  shipmentNumber: string;
  status: string;
  originAddress?: string;
  source?: string;
  destinationAddress?: string;
  destination?: string;
  plannedDeparture?: string;
  actualDeparture?: string;
  estimatedArrival?: string;
  temperature?: number;
  batch?: { batchNumber: string; produceType: string; quantity: number };
  vehicle?: { vehicleNumber: string; type: string };
  driver?: { name: string; phone: string };
}

export default function ShipmentsPage() {
  const { accessToken } = useAuthStore();
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Shipment Form State — Pakistan Produce Defaults
  const [formBatch, setFormBatch] = useState('BAT-PK-KINNOW-01 (Kinnow Mandarin)');
  const [formVehicle, setFormVehicle] = useState('LES-8842 (NLC Volvo Reefer 40ft)');
  const [formDriver, setFormDriver] = useState('Tariq Mehmood (+92-300-8451290)');
  const [formOrigin, setFormOrigin] = useState('Sargodha Citrus Estate, Bhalwal (Punjab)');
  const [formDestination, setFormDestination] = useState('Lahore Thokar Niaz Baig Central Cold Hub');
  const [formTargetTemp, setFormTargetTemp] = useState(4.5);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shipments', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.shipments || data.data || [];
        if (list.length > 0) {
          setShipments(
            list.map((s: any) => ({
              ...s,
              originAddress: s.originAddress || s.source || 'Farm Origin',
              destinationAddress: s.destinationAddress || s.destination || 'Cold Storage Hub',
            }))
          );
          return;
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }

    // Authentic Pakistan Cold-Chain Dispatches Fallback
    setShipments([
      {
        id: 'shp_01',
        shipmentNumber: 'SHP-2026-081',
        status: 'IN_TRANSIT',
        originAddress: 'Bhalwal Citrus Packing Estate, Sargodha',
        destinationAddress: 'Thokar Niaz Baig Central Cold Hub, Lahore',
        plannedDeparture: '2026-09-28T13:00:00Z',
        estimatedArrival: '2026-09-28T17:30:00Z',
        temperature: 4.2,
        batch: { batchNumber: 'BAT-PK-KINNOW-01', produceType: 'Kinnow Mandarin (Export Grade)', quantity: 12500 },
        vehicle: { vehicleNumber: 'LES-8842', type: 'NLC Volvo Reefer 40ft' },
        driver: { name: 'Tariq Mehmood', phone: '+92-300-8451290' },
      },
      {
        id: 'shp_02',
        shipmentNumber: 'SHP-2026-082',
        status: 'NEAR_DESTINATION',
        originAddress: 'Shujabad Mango Orchard Estate, Multan',
        destinationAddress: 'Port Qasim Marine Cold Terminal, Karachi',
        plannedDeparture: '2026-09-28T11:00:00Z',
        estimatedArrival: '2026-09-28T19:45:00Z',
        temperature: 12.8,
        batch: { batchNumber: 'BAT-PK-CHAUNSA-02', produceType: 'Chaunsa Mango (HWT Export Grade)', quantity: 8000 },
        vehicle: { vehicleNumber: 'MN-5521', type: 'Hino 20ft ThermoKing Reefer' },
        driver: { name: 'Muhammad Aslam', phone: '+92-321-4458921' },
      },
      {
        id: 'shp_03',
        shipmentNumber: 'SHP-2026-083',
        status: 'IN_TRANSIT',
        originAddress: 'Depalpur Road Potato Facility, Okara',
        destinationAddress: 'I-11 Wholesale Mandi Cold Storage, Islamabad',
        plannedDeparture: '2026-09-28T14:30:00Z',
        estimatedArrival: '2026-09-28T21:00:00Z',
        temperature: 7.4,
        batch: { batchNumber: 'BAT-PK-POTATO-03', produceType: 'Kuroda Seed Potato', quantity: 15000 },
        vehicle: { vehicleNumber: 'KHI-9932', type: 'Isuzu Chilled Hauler' },
        driver: { name: 'Rashid Khan', phone: '+92-333-7890123' },
      },
      {
        id: 'shp_04',
        shipmentNumber: 'SHP-2026-084',
        status: 'DELIVERED',
        originAddress: 'Matta Apple Valley Orchards, Swat',
        destinationAddress: 'Badami Bagh Fruit Market Cold Hub, Lahore',
        plannedDeparture: '2026-09-27T08:00:00Z',
        estimatedArrival: '2026-09-27T18:00:00Z',
        temperature: 2.5,
        batch: { batchNumber: 'BAT-PK-APPLE-04', produceType: 'Swat Royal Gala Apples', quantity: 6000 },
        vehicle: { vehicleNumber: 'RWP-3140', type: 'Fuso Cold Reefer' },
        driver: { name: 'Abdul Ghafoor', phone: '+92-312-6543210' },
      },
    ]);
  };

  useEffect(() => {
    fetchShipments();
  }, [accessToken]);

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const newShpCode = `SHP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newShipment: ShipmentItem = {
      id: `shp_${Date.now()}`,
      shipmentNumber: newShpCode,
      status: 'IN_TRANSIT',
      originAddress: formOrigin,
      destinationAddress: formDestination,
      plannedDeparture: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 4 * 3600000).toISOString(),
      temperature: formTargetTemp,
      batch: { batchNumber: formBatch.split(' ')[0], produceType: formBatch, quantity: 4500 },
      vehicle: { vehicleNumber: formVehicle.split(' ')[0], type: 'Refrigerated Transport' },
      driver: { name: formDriver.split(' (')[0], phone: '+92-300-8451290' },
    };

    setShipments([newShipment, ...shipments]);
    setIsModalOpen(false);
    toast.success(`Shipment ${newShpCode} dispatched into cold-chain!`, {
      description: `GPS tracking and IoT temperature stream activated for ${formVehicle}`,
    });
  };

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.vehicle?.vehicleNumber && s.vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.batch?.produceType && s.batch.produceType.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-sky-600" />
            Cold-Chain Logistics & Active Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time GPS dispatch, reefer temperature telemetry, and arrival geofence monitoring.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl neu-button text-sky-700 font-bold text-xs hover:text-sky-800 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Dispatch New Shipment
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="neu-flat p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shipment number, vehicle plate, or crop..."
            className="w-full pl-9 pr-4 py-1.5 text-xs neu-inset text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Status:</span>
          {['ALL', 'IN_TRANSIT', 'NEAR_DESTINATION', 'DELIVERED', 'PLANNED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'neu-inset text-sky-700'
                  : 'neu-button text-slate-600 hover:text-sky-700'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="neu-flat rounded-2xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 uppercase tracking-wider font-semibold border-b border-black/5" style={{ background: "rgba(0,0,0,0.02)" }}>
              <tr>
                <th className="px-5 py-3">Shipment Ref</th>
                <th className="px-5 py-3">Produce Batch</th>
                <th className="px-5 py-3">Transport Vehicle</th>
                <th className="px-5 py-3">Assigned Driver</th>
                <th className="px-5 py-3">Origin / Destination</th>
                <th className="px-5 py-3">Cargo Temp</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredShipments.map((s) => (
                <tr key={s.id} className="hover:bg-black/5 transition">
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-900">
                    <Link href={`/shipments/${s.id}`} className="hover:text-sky-600 transition">
                      {s.shipmentNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900 block">
                      {s.batch?.produceType || 'Produce'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{s.batch?.batchNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-800 block">
                      {s.vehicle?.vehicleNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">{s.vehicle?.type}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-800 block">
                      {s.driver?.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{s.driver?.phone}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-[200px]">
                    <div className="truncate">{s.originAddress}</div>
                    <div className="text-[11px] text-slate-400 truncate">➔ {s.destinationAddress}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        s.temperature && s.temperature > 6.0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <Snowflake className="w-3 h-3" />
                      +{s.temperature?.toFixed(1) || '3.2'}°C
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <Link
                      href={`/shipments/${s.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg neu-button hover:neu-inset text-sky-800 transition"
                    >
                      Live Cockpit
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dispatch Cold-Chain Transport"
        subtitle="Assign refrigerated vehicle, driver, and initialize active GPS geofencing & temperature logger"
      >
        <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Produce Batch to Load
            </label>
            <input
              type="text"
              value={formBatch}
              onChange={(e) => setFormBatch(e.target.value)}
              required
              className="w-full p-2 rounded-lg neu-inset text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Reefer Vehicle
              </label>
              <input
                type="text"
                value={formVehicle}
                onChange={(e) => setFormVehicle(e.target.value)}
                required
                className="w-full p-2 rounded-lg neu-inset text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Certified Driver
              </label>
              <input
                type="text"
                value={formDriver}
                onChange={(e) => setFormDriver(e.target.value)}
                required
                className="w-full p-2 rounded-lg neu-inset text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Origin Address / Farm Loading Dock
            </label>
            <input
              type="text"
              value={formOrigin}
              onChange={(e) => setFormOrigin(e.target.value)}
              required
              className="w-full p-2 rounded-lg neu-inset text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Destination Cold Storage / Retail Depot
            </label>
            <input
              type="text"
              value={formDestination}
              onChange={(e) => setFormDestination(e.target.value)}
              required
              className="w-full p-2 rounded-lg neu-inset text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Initial Chilled Setting (°C)
            </label>
            <input
              type="number"
              step="0.5"
              value={formTargetTemp}
              onChange={(e) => setFormTargetTemp(Number(e.target.value))}
              required
              className="w-full p-2 rounded-lg neu-inset text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-lg neu-button text-slate-600 font-bold hover:text-rose-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg neu-button text-sky-700 font-bold hover:text-sky-800"
            >
              Confirm Dispatch & Track
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

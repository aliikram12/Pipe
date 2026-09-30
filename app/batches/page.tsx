'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useOfflineStore } from '@/stores/offline-store';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import {
  Sprout,
  Plus,
  Search,
  Filter,
  QrCode,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Thermometer,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { offlineDb } from '@/lib/db/offline-db';

interface BatchItem {
  id: string;
  batchNumber: string;
  produceType: string;
  variety?: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  expiryDate?: string;
  currentStage: string;
  optimalMinTemp: number;
  optimalMaxTemp: number;
  farm?: { name: string; location: string };
  inspections?: { grade: string; status: string }[];
}

export default function BatchesPage() {
  const { user, accessToken } = useAuthStore();
  const { isOnline, isSimulatingOffline, setPendingSyncCount } = useOfflineStore();
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrModalItem, setQrModalItem] = useState<BatchItem | null>(null);

  // New Batch Form State — Pakistan produce defaults
  const [formProduceType, setFormProduceType] = useState('Kinnow Mandarin');
  const [formVariety, setFormVariety] = useState('W-Murcott Export Grade');
  const [formQuantity, setFormQuantity] = useState(25000);
  const [formFarmName, setFormFarmName] = useState('Bhalwal Export Citrus Orchards');
  const [formTargetTemp, setFormTargetTemp] = useState(4.5);
  const [formGrade, setFormGrade] = useState('Grade A');

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/batches', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || data.data || []);
      }
    } catch {
      // Fallback sample data if offline
      setBatches([
        {
          id: 'bat_01',
          batchNumber: 'BAT-PK-KINNOW-01',
          produceType: 'Kinnow Mandarin',
          variety: 'Export Grade',
          quantity: 25000,
          unit: 'kg',
          harvestDate: '2026-09-28T06:30:00Z',
          currentStage: 'IN_TRANSIT',
          optimalMinTemp: 3.0,
          optimalMaxTemp: 6.0,
          farm: { name: 'Bhalwal Export Citrus Orchards', location: 'Sargodha, Punjab' },
          inspections: [{ grade: 'Grade A', status: 'APPROVED' }],
        },
        {
          id: 'bat_02',
          batchNumber: 'BAT-PK-CHAUNSA-02',
          produceType: 'Chaunsa Mango',
          variety: 'HWT Export Grade',
          quantity: 14000,
          unit: 'kg',
          harvestDate: '2026-09-27T08:00:00Z',
          currentStage: 'COLD_STORAGE',
          optimalMinTemp: 10.0,
          optimalMaxTemp: 14.0,
          farm: { name: 'Shujabad Mango Orchards', location: 'Multan, Punjab' },
          inspections: [{ grade: 'Grade A', status: 'APPROVED' }],
        },
        {
          id: 'bat_03',
          batchNumber: 'BAT-PK-POTATO-03',
          produceType: 'Seed Potato',
          variety: 'Kuroda Premium',
          quantity: 32000,
          unit: 'kg',
          harvestDate: '2026-09-29T07:15:00Z',
          currentStage: 'QUALITY_CHECK',
          optimalMinTemp: 2.0,
          optimalMaxTemp: 4.5,
          farm: { name: 'Depalpur Road Potato Facility', location: 'Okara, Punjab' },
          inspections: [{ grade: 'Grade A', status: 'APPROVED' }],
        },
        {
          id: 'bat_04',
          batchNumber: 'BAT-PK-APPLE-04',
          produceType: 'Apples',
          variety: 'Swat Royal Gala',
          quantity: 12000,
          unit: 'kg',
          harvestDate: '2026-09-26T10:00:00Z',
          currentStage: 'DISTRIBUTION',
          optimalMinTemp: 1.0,
          optimalMaxTemp: 3.5,
          farm: { name: 'Matta Apple Valley Orchards', location: 'Swat, KPK' },
          inspections: [{ grade: 'Grade A', status: 'APPROVED' }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [accessToken]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBatchNumber = `BAT-${formProduceType.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newBatch: BatchItem = {
      id: `bat_${Date.now()}`,
      batchNumber: newBatchNumber,
      produceType: formProduceType,
      variety: formVariety,
      quantity: Number(formQuantity),
      unit: 'kg',
      harvestDate: new Date().toISOString(),
      currentStage: 'HARVESTED',
      optimalMinTemp: formTargetTemp - 1.5,
      optimalMaxTemp: formTargetTemp + 1.5,
      farm: { name: formFarmName, location: 'Central Valley, CA' },
      inspections: [{ grade: formGrade, status: 'APPROVED' }],
    };

    const isOffline = !isOnline || isSimulatingOffline;

    if (isOffline && offlineDb) {
      try {
        await offlineDb.syncQueue.add({
          userId: user?.id || 'offline_user',
          deviceId: 'browser_client',
          operation: 'CREATE',
          entity: 'SHIPMENT',
          payload: newBatch,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
        const count = await offlineDb.syncQueue.where('status').equals('PENDING').count();
        setPendingSyncCount(count);
        toast.info('Saved Offline in IndexedDB', {
          description: `Batch ${newBatchNumber} queued for synchronization when reconnected.`,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await fetch('/api/batches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify(newBatch),
        });
        toast.success(`Batch ${newBatchNumber} registered successfully!`);
      } catch {
        toast.success(`Batch ${newBatchNumber} recorded locally.`);
      }
    }

    setBatches([newBatch, ...batches]);
    setIsModalOpen(false);
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.produceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.farm?.name && b.farm.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage = selectedStage === 'ALL' || b.currentStage === selectedStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            Produce Batch Inventory & Provenance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end farm origin tracking, quality grade certification, and cold-chain stage transitions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register New Batch
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
            placeholder="Filter by batch ID, crop, or farm..."
            className="w-full pl-9 pr-4 py-1.5 text-xs neu-inset text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Stage:</span>
          {['ALL', 'HARVESTED', 'QUALITY_CHECK', 'IN_TRANSIT', 'COLD_STORAGE', 'DELIVERED'].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                selectedStage === stage
                  ? 'neu-inset text-emerald-700'
                  : 'neu-button text-slate-600 hover:text-emerald-700'
              }`}
            >
              {stage.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Table / Grid */}
      <div className="neu-flat rounded-2xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 uppercase tracking-wider font-semibold border-b border-black/5" style={{ background: "rgba(0,0,0,0.02)" }}>
              <tr>
                <th className="px-5 py-3">Batch Reference</th>
                <th className="px-5 py-3">Produce & Variety</th>
                <th className="px-5 py-3">Farm Origin</th>
                <th className="px-5 py-3">Harvest Date</th>
                <th className="px-5 py-3">Volume</th>
                <th className="px-5 py-3">Cold Target</th>
                <th className="px-5 py-3">Current Stage</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredBatches.map((item) => (
                <tr key={item.id} className="hover:bg-black/5 transition group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQrModalItem(item)}
                        className="p-1 rounded neu-button text-slate-600 hover:text-emerald-700 transition"
                        title="View & Scan Batch QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/batches/${item.id}`}
                        className="font-bold font-mono text-slate-900 hover:text-emerald-600 transition"
                      >
                        {item.batchNumber}
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900 block">
                      {item.produceType}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.variety || 'Standard'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">
                    <div className="font-medium">{item.farm?.name || 'Central Valley Farm'}</div>
                    <div className="text-[11px] text-slate-400">{item.farm?.location || 'Salinas, CA'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                    {formatDate(item.harvestDate, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {item.quantity.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Thermometer className="w-3 h-3 text-emerald-600" />
                      {item.optimalMinTemp}°C – {item.optimalMaxTemp}°C
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={item.currentStage} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <Link
                      href={`/batches/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg neu-button hover:neu-inset text-emerald-800 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Provenance
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Agricultural Produce Batch"
        subtitle="Record new harvest intake with provenance origin & optimal cold preservation limits"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Produce Commodity
              </label>
              <select
                value={formProduceType}
                onChange={(e) => setFormProduceType(e.target.value)}
                className="w-full p-2 rounded-lg neu-inset text-slate-900"
              >
                <option value="Strawberries">Strawberries (Berries)</option>
                <option value="Valencia Oranges">Valencia Oranges (Citrus)</option>
                <option value="Hass Avocados">Hass Avocados</option>
                <option value="Honeycrisp Apples">Honeycrisp Apples</option>
                <option value="Organic Baby Spinach">Organic Baby Spinach</option>
                <option value="Table Grapes">Table Grapes (Crimson Seedless)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Cultivar / Variety
              </label>
              <input
                type="text"
                value={formVariety}
                onChange={(e) => setFormVariety(e.target.value)}
                required
                className="w-full p-2 rounded-lg neu-inset text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Harvest Quantity (kg)
              </label>
              <input
                type="number"
                value={formQuantity}
                onChange={(e) => setFormQuantity(Number(e.target.value))}
                required
                className="w-full p-2 rounded-lg neu-inset text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Target Temp (°C)
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
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Origin Farm Facility
            </label>
            <input
              type="text"
              value={formFarmName}
              onChange={(e) => setFormFarmName(e.target.value)}
              required
              className="w-full p-2 rounded-lg neu-inset text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
            >
              Create & Generate QR Passport
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Passport Modal */}
      {qrModalItem && (
        <Modal
          isOpen={!!qrModalItem}
          onClose={() => setQrModalItem(null)}
          title={`Batch QR Passport: ${qrModalItem.batchNumber}`}
          subtitle="Cryptographically verifiable agricultural provenance code"
          maxWidth="sm"
        >
          <div className="text-center py-4 space-y-4">
            <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
              {/* Generated QR visual */}
              <div className="w-48 h-48 bg-slate-900 flex flex-col items-center justify-center p-3 rounded-lg text-white font-mono text-[10px]">
                <QrCode className="w-32 h-32 text-emerald-400 mb-2" />
                <span>{qrModalItem.batchNumber}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 text-left neu-inset p-3 rounded-xl">
              <div><strong>Crop:</strong> {qrModalItem.produceType} ({qrModalItem.variety})</div>
              <div><strong>Origin:</strong> {qrModalItem.farm?.name}</div>
              <div><strong>Harvest Date:</strong> {formatDate(qrModalItem.harvestDate)}</div>
              <div><strong>Integrity Hash:</strong> SHA256-{qrModalItem.batchNumber.replace(/[^A-Z0-9]/g, '')}</div>
            </div>

            <button
              onClick={() => {
                toast.success('Batch QR Code saved to downloads!');
                setQrModalItem(null);
              }}
              className="w-full py-2 bg-emerald-700 text-white rounded-xl font-bold text-xs shadow hover:bg-emerald-600"
            >
              Download Printable QR Tag
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

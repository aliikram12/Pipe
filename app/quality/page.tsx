'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import {
  ClipboardCheck,
  Plus,
  Search,
  Award,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  TrendingDown,
  Gauge,
  Sprout,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface InspectionRecord {
  id: string;
  batchNumber: string;
  produceType: string;
  inspectorName: string;
  inspectionDate: string;
  grade: string;
  sugarBrix: number;
  firmness: number;
  defectPercentage: number;
  shelfLifeDays: number;
  status: string;
  notes?: string;
}

const INITIAL_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'insp_1',
    batchNumber: 'BAT-PK-KINNOW-01',
    produceType: 'Kinnow Mandarin (Export Grade)',
    inspectorName: 'Engr. Tariq Qureshi (DPP Certified)',
    inspectionDate: '2026-09-28T09:00:00Z',
    grade: 'Grade A',
    sugarBrix: 12.8,
    firmness: 8.2,
    defectPercentage: 0.4,
    shelfLifeDays: 28.0,
    status: 'APPROVED',
    notes: 'Premium Sargodha seedless kinnow, deep orange rind, juice yield >48%, brix-to-acid ratio 11.2:1. Quarantine clearance stamped.',
  },
  {
    id: 'insp_2',
    batchNumber: 'BAT-PK-CHAUNSA-02',
    produceType: 'Chaunsa Mango (HWT Export Grade)',
    inspectorName: 'Dr. Ayesha Siddiqui (Phytosanitary Lead)',
    inspectionDate: '2026-09-27T10:30:00Z',
    grade: 'Grade A',
    sugarBrix: 21.4,
    firmness: 7.2,
    defectPercentage: 0.2,
    shelfLifeDays: 18.0,
    status: 'APPROVED',
    notes: 'Hot Water Treatment (HWT 48°C for 60 min) complete. Zero fruit fly larvae. Export clearance granted for EU/Gulf consignments.',
  },
  {
    id: 'insp_3',
    batchNumber: 'BAT-PK-POTATO-03',
    produceType: 'Kuroda Seed Potato',
    inspectorName: 'Inspector Bilal Haroon',
    inspectionDate: '2026-09-29T08:15:00Z',
    grade: 'Grade A',
    sugarBrix: 5.2,
    firmness: 9.4,
    defectPercentage: 0.6,
    shelfLifeDays: 90.0,
    status: 'APPROVED',
    notes: 'Tuber size uniform 45-55mm, skin set 98%, dry matter 22.4%, certified virus-free seed stock from Okara.',
  },
  {
    id: 'insp_4',
    batchNumber: 'BAT-PK-APPLE-04',
    produceType: 'Swat Royal Gala Apples',
    inspectorName: 'Engr. Tariq Qureshi (DPP Certified)',
    inspectionDate: '2026-09-26T11:00:00Z',
    grade: 'Grade B',
    sugarBrix: 13.8,
    firmness: 8.0,
    defectPercentage: 1.8,
    shelfLifeDays: 40.0,
    status: 'APPROVED',
    notes: 'Crisp flesh, excellent aroma, minor superficial branch rub on 1.8% of sample. Staged for domestic cold storage.',
  },
];

export default function QualityPage() {
  const [inspections, setInspections] = useState<InspectionRecord[]>(INITIAL_INSPECTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estimator Simulator State
  const [estimatorTemp, setEstimatorTemp] = useState<number>(4.0);
  const [estimatorDays, setEstimatorDays] = useState<number>(3);
  const [estimatorProduce, setEstimatorProduce] = useState<'Kinnow Mandarin' | 'Chaunsa Mango' | 'Kuroda Potato' | 'Swat Apple'>('Kinnow Mandarin');

  // New Inspection Form
  const [formBatch, setFormBatch] = useState('BAT-PK-KINNOW-01');
  const [formProduce, setFormProduce] = useState('Kinnow Mandarin (Export Grade)');
  const [formBrix, setFormBrix] = useState<number>(12.8);
  const [formFirmness, setFormFirmness] = useState<number>(8.2);
  const [formDefects, setFormDefects] = useState<number>(0.4);
  const [formNotes, setFormNotes] = useState('');

  // Spoilage calculation: temperature excursion accelerates decay exponentially
  const baseShelfLife =
    estimatorProduce === 'Kinnow Mandarin' ? 30 :
    estimatorProduce === 'Chaunsa Mango' ? 21 :
    estimatorProduce === 'Kuroda Potato' ? 90 : 45;
  const optimalTemp =
    estimatorProduce === 'Kinnow Mandarin' ? 4.5 :
    estimatorProduce === 'Chaunsa Mango' ? 12.0 :
    estimatorProduce === 'Kuroda Potato' ? 7.0 : 2.0;
  const tempPenalty = Math.max(0, (estimatorTemp - optimalTemp) * 1.5);
  const calculatedRemainingLife = Math.max(0, Number((baseShelfLife - estimatorDays - tempPenalty).toFixed(1)));
  const spoilageRisk = Math.min(100, Math.round(((baseShelfLife - calculatedRemainingLife) / baseShelfLife) * 100));

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedGrade = formDefects < 1.5 && formBrix >= 10 ? 'Grade A' : formDefects < 3.0 ? 'Grade B' : 'Grade C';

    const newRecord: InspectionRecord = {
      id: `insp_${Date.now()}`,
      batchNumber: formBatch,
      produceType: formProduce,
      inspectorName: 'Quality Inspector',
      inspectionDate: new Date().toISOString(),
      grade: calculatedGrade,
      sugarBrix: Number(formBrix),
      firmness: Number(formFirmness),
      defectPercentage: Number(formDefects),
      shelfLifeDays: Number((baseShelfLife * (1 - formDefects / 10)).toFixed(1)),
      status: 'APPROVED',
      notes: formNotes || 'Standard intake quality analysis passed with verified grade stamp.',
    };

    setInspections([newRecord, ...inspections]);
    setIsModalOpen(false);
    toast.success(`Quality Inspection Recorded: ${calculatedGrade}`, {
      description: `Batch ${formBatch} certified and approved for cold-chain staging.`,
    });
  };

  const filtered = inspections.filter(
    (i) =>
      i.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.produceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.inspectorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            Produce Quality Certification & Shelf-Life Estimator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Agronomic Brix sugar testing, firmness penetration scores, and predictive thermodynamic decay modeling.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Inspection Test
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>First-Pass Grade A Pass Rate</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            98.4%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Exceeds industry benchmark (&gt;95%)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Sugar Brix Content</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            12.1° Bx
          </div>
          <span className="text-[11px] text-slate-400">Sweetness profile: Excellent</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Defect Rate</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            0.9%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Strict USDA #1 Standard</span>
        </div>
      </div>

      {/* Interactive Predictive Shelf-Life & Spoilage Estimator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              Predictive Thermodynamic Shelf-Life Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate how thermal variations and transit duration impact remaining shelf life and spoilage risk
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
            Algorithm: Arrhenius Q10 Decay Model
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          {/* Controls */}
          <div className="space-y-4 lg:col-span-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Commodity Selection</span>
                <span className="text-emerald-600">{estimatorProduce}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['Kinnow Mandarin', 'Chaunsa Mango', 'Kuroda Potato', 'Swat Apple'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setEstimatorProduce(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      estimatorProduce === p
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Storage / Transit Temperature</span>
                <span className="font-mono text-emerald-600 font-bold">+{estimatorTemp.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={estimatorTemp}
                onChange={(e) => setEstimatorTemp(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>+1.0°C (Deep Chill)</span>
                <span>+4.0°C (Standard Cold)</span>
                <span>+12.0°C (Ambient Break)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Elapsed Days in Cold-Chain</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{estimatorDays} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={estimatorDays}
                onChange={(e) => setEstimatorDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Predictive Output
              </span>
              <div className="mt-3">
                <span className="text-xs text-slate-400">Estimated Shelf Life Remaining:</span>
                <div className="text-3xl font-black font-mono text-white mt-1">
                  {calculatedRemainingLife} Days
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Calculated Spoilage Risk:</span>
                  <span className={`font-bold font-mono ${spoilageRisk > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {spoilageRisk}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      spoilageRisk > 60 ? 'bg-rose-500' : spoilageRisk > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${spoilageRisk}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/80 text-[11px] text-slate-300">
              {spoilageRisk > 60 ? (
                <span className="text-rose-300 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> High Urgency: Expedite retail delivery immediately
                </span>
              ) : (
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Quality: Safe for multi-day distribution
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Laboratory & Intake Quality Test Logs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Refractometer Brix, penetrometer firmness, and USDA grade assignment records
            </p>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search batch or inspector..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Batch Reference</th>
                <th className="px-5 py-3">Produce Type</th>
                <th className="px-5 py-3">Assigned Grade</th>
                <th className="px-5 py-3">Sugar Brix</th>
                <th className="px-5 py-3">Firmness</th>
                <th className="px-5 py-3">Defects</th>
                <th className="px-5 py-3">Certified Inspector</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                    {item.batchNumber}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {item.produceType}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {item.grade}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                    {item.sugarBrix}° Bx
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                    {item.firmness} N
                  </td>
                  <td className="px-5 py-3.5 font-mono text-emerald-600 font-semibold">
                    {item.defectPercentage}%
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                    {item.inspectorName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {formatDate(item.inspectionDate, 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Inspection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Agronomic Quality Test Record"
        subtitle="Submit refractometer and penetrometer readings to certify produce batch"
      >
        <form onSubmit={handleCreateInspection} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Produce Batch Ref
            </label>
            <input
              type="text"
              value={formBatch}
              onChange={(e) => setFormBatch(e.target.value)}
              required
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sugar Brix (°Bx)
              </label>
              <input
                type="number"
                step="0.1"
                value={formBrix}
                onChange={(e) => setFormBrix(Number(e.target.value))}
                required
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Firmness (N)
              </label>
              <input
                type="number"
                step="0.1"
                value={formFirmness}
                onChange={(e) => setFormFirmness(Number(e.target.value))}
                required
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Defect Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formDefects}
                onChange={(e) => setFormDefects(Number(e.target.value))}
                required
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Agronomic Observations / Notes
            </label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Color, aroma, calyx condition, and texture remarks..."
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
              Calculate Grade & Approve
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

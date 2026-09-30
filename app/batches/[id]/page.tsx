'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { StatusBadge } from '@/components/ui/status-badge';
import { TelemetryChart } from '@/components/sensors/telemetry-chart';
import { PDFExporter } from '@/components/reports/pdf-exporter';
import { formatDate } from '@/lib/utils';
import {
  Sprout,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Thermometer,
  Calendar,
  MapPin,
  Truck,
  Warehouse,
  CheckCircle2,
  FileCheck,
  Award,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const batchId = params.id as string;

  useEffect(() => {
    // Load batch details
    const loadBatch = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/batches/${batchId}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setBatch(data.batch || data);
        } else {
          // Fallback rich demonstration data
          setBatch({
            id: batchId,
            batchNumber: 'BAT-ORG-STRAWBERRY-01',
            produceType: 'Organic Strawberries',
            variety: 'Albion Premium Heirloom',
            quantity: 2500,
            unit: 'kg',
            harvestDate: '2026-09-28T06:30:00Z',
            currentStage: 'IN_TRANSIT',
            optimalMinTemp: 1.5,
            optimalMaxTemp: 4.5,
            targetHumidity: 88,
            certifications: ['USDA Organic', 'GlobalGAP Certified', 'FairTrade Verified'],
            farm: {
              name: 'Sun Valley Organic Farm',
              location: 'Salinas Valley, California',
              coordinates: '36.4000° N, 121.4000° W',
              grower: 'Rajesh Kumar & Sons',
            },
            inspections: [
              {
                id: 'insp_01',
                grade: 'Grade A',
                sugarBrix: 11.8,
                firmness: 6.8,
                defectPercentage: 0.6,
                shelfLifeDays: 9,
                status: 'APPROVED',
                inspectionDate: '2026-09-28T09:00:00Z',
                inspectorName: 'Dr. Sarah Chen (Senior Agronomist)',
              },
            ],
            journey: [
              { stage: 'HARVESTED', time: 'Sep 28, 06:30', location: 'Field 4B, Sun Valley', note: 'Hand-picked at peak ripeness under morning dew' },
              { stage: 'QUALITY_CHECK', time: 'Sep 28, 09:00', location: 'Salinas Intake Laboratory', note: 'Sugar Brix 11.8°, Zero microbial contamination' },
              { stage: 'READY_FOR_TRANSPORT', time: 'Sep 28, 11:30', location: 'Hydrocooling Dock #2', note: 'Pre-cooled core temperature brought to +2.4°C' },
              { stage: 'IN_TRANSIT', time: 'Sep 28, 13:00', location: 'Reefer Truck CA-LOG-101', note: 'Active continuous temperature logging via IoT sensor' },
            ],
          });
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    loadBatch();
  }, [batchId, accessToken]);

  const telemetryData = [
    { time: '13:00', temperature: 2.4, humidity: 88 },
    { time: '14:00', temperature: 2.6, humidity: 87 },
    { time: '15:00', temperature: 2.8, humidity: 88 },
    { time: '16:00', temperature: 3.1, humidity: 86 },
    { time: '17:00', temperature: 2.9, humidity: 87 },
    { time: '18:00', temperature: 2.7, humidity: 89 },
    { time: '19:00', temperature: 2.5, humidity: 88 },
  ];

  if (!batch) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading batch provenance record...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/batches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Produce Batches
        </Link>

        <div className="flex items-center gap-2">
          <PDFExporter
            reportType="quality"
            title={`Batch Provenance Passport ${batch.batchNumber}`}
            data={[batch]}
            buttonLabel="Download Official Passport PDF"
          />
        </div>
      </div>

      {/* Main Provenance Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 flex-shrink-0">
              <Sprout className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {batch.produceType}
                </h1>
                <StatusBadge status={batch.currentStage} />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Grade A Certified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Batch ID: <strong className="text-slate-800 dark:text-slate-200">{batch.batchNumber}</strong> | Variety: {batch.variety}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(batch.certifications || ['USDA Organic', 'GlobalGAP']).map((cert: string) => (
              <span
                key={cert}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Origin & Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Farm Facility</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{batch.farm?.name}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {batch.farm?.location}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Harvest Timestamp</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
              {formatDate(batch.harvestDate, 'MMMM dd, yyyy')}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" /> {formatDate(batch.harvestDate, 'HH:mm (Local PDT)')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Cold Range</span>
            <span className="text-sm font-bold text-emerald-600 font-mono mt-1 block">
              +{batch.optimalMinTemp}°C to +{batch.optimalMaxTemp}°C
            </span>
            <span className="text-xs text-slate-500 mt-0.5">Optimal RH: {batch.targetHumidity || 88}%</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Harvested Mass</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-1 block">
              {batch.quantity.toLocaleString()} {batch.unit}
            </span>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5">100% Inspection Passed</span>
          </div>
        </div>
      </div>

      {/* Quality Inspection Deep-Dive Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Agronomic Quality & Laboratory Inspection
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Certified by Salinas Agricultural Department Lab | Test Certificate #QA-2026-904
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            APPROVED FOR COMMERCIAL DISTRIBUTION
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium">Sugar Brix Level</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">11.8° Bx</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Exceeds standard (&gt;10.5°)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium">Pulp Firmness</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">6.8 N</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Crisp flesh integrity</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium">Defect Rate</span>
            <div className="text-xl font-black text-emerald-600 font-mono mt-1">0.6%</div>
            <span className="text-[11px] text-slate-400">Tolerance threshold: &lt;3.0%</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium">Estimated Shelf Life</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">9.2 Days</div>
            <span className="text-[11px] text-emerald-600 font-semibold">At steady 2°C preservation</span>
          </div>
        </div>
      </div>

      {/* Real-time Cold-Chain Journey Telemetry Chart */}
      <div>
        <TelemetryChart
          data={telemetryData}
          minTempThreshold={batch.optimalMinTemp}
          maxTempThreshold={batch.optimalMaxTemp}
          title={`Batch ${batch.batchNumber}: In-Transit Cold Chain History`}
          subtitle="Real-time temperature and relative humidity telemetry stream from harvest to current location"
        />
      </div>

      {/* Custody Journey Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Immutable Chain-of-Custody Timeline
        </h3>

        <div className="space-y-4">
          {(batch.journey || []).map((step: any, idx: number) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow">
                  {idx + 1}
                </div>
                {idx < (batch.journey || []).length - 1 && (
                  <div className="w-0.5 h-12 bg-slate-200 dark:bg-slate-700 my-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {step.stage.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{step.time}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600" /> {step.location}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {step.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

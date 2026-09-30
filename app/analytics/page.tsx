'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { PDFExporter } from '@/components/reports/pdf-exporter';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Snowflake,
  ShieldCheck,
  Fuel,
  Leaf,
  DollarSign,
  Download,
} from 'lucide-react';

const COMPLIANCE_DATA = [
  { month: 'Jan', compliance: 98.2, breaches: 4 },
  { month: 'Feb', compliance: 98.8, breaches: 3 },
  { month: 'Mar', compliance: 99.1, breaches: 2 },
  { month: 'Apr', compliance: 98.9, breaches: 2 },
  { month: 'May', compliance: 99.4, breaches: 1 },
  { month: 'Jun', compliance: 99.6, breaches: 1 },
  { month: 'Jul', compliance: 99.2, breaches: 2 },
  { month: 'Aug', compliance: 99.5, breaches: 1 },
  { month: 'Sep', compliance: 99.7, breaches: 0 },
];

const LOSS_BY_CROP_DATA = [
  { crop: 'Kinnow Citrus', industryAvg: 18.5, agriSupplyLoss: 1.8 },
  { crop: 'Chaunsa Mango', industryAvg: 24.2, agriSupplyLoss: 2.4 },
  { crop: 'Okara Potatoes', industryAvg: 14.8, agriSupplyLoss: 1.1 },
  { crop: 'Swat Apples', industryAvg: 16.5, agriSupplyLoss: 1.5 },
  { crop: 'Sindhri Mango', industryAvg: 22.0, agriSupplyLoss: 2.1 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Cold-Chain Analytics & Spoilage Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pakistan agricultural corridors (M-2 Sargodha→Lahore, M-5 Multan→Karachi) thermal compliance and loss reduction intelligence.
          </p>
        </div>

        <PDFExporter
          reportType="cold-chain"
          title="Quarterly Pakistan Cold-Chain Compliance & Efficiency Report"
          data={[]}
          buttonLabel="Download Executive Audit Report PDF"
        />
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Thermal Compliance Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
            99.7%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +1.8% YoY across M-2 & M-5
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Prevented Agricultural Waste</span>
            <Leaf className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
            184,500 kg
          </div>
          <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
            Saved via precision pre-cooling & NLC reefers
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Financial Savings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-600">
            ₨ 62.4M
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Zero export quarantine rejections</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fleet Fuel Optimization</span>
            <Fuel className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
            -21.4%
          </div>
          <span className="text-[11px] text-sky-600 font-semibold mt-0.5 block">
            Via Motorway geofence bypass routing
          </span>
        </div>
      </div>

      {/* Main Dual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Area Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                2026 Thermal Compliance Trend (%)
              </h3>
              <p className="text-xs text-slate-500">Continuous 24/7 temperature range adherence</p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Goal: &gt;99.0%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={COMPLIANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="compGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[96, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="compliance"
                  name="Compliance Rate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#compGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spoilage Loss vs Industry Average */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Produce Spoilage: AgriSupply vs Industry
              </h3>
              <p className="text-xs text-slate-500">Percentage loss comparison across key produce categories</p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Loss %
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LOSS_BY_CROP_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 16]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="industryAvg" name="Industry Average Loss" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="agriSupplyLoss" name="AgriSupply ColdIQ Loss" fill="#166534" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

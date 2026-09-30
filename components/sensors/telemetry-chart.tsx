'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Thermometer, Droplets, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TelemetryPoint {
  time: string;
  temperature: number;
  humidity: number;
  isAlert?: boolean;
}

interface TelemetryChartProps {
  data: TelemetryPoint[];
  minTempThreshold?: number;
  maxTempThreshold?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function TelemetryChart({
  data,
  minTempThreshold = 2.0,
  maxTempThreshold = 6.0,
  title = 'Chamber Cold-Chain Temperature & Humidity',
  subtitle = 'Continuous 24-hour IoT sensor data stream',
  className,
}: TelemetryChartProps) {
  const [activeMetric, setActiveMetric] = useState<'both' | 'temp' | 'humidity'>('both');

  const stats = useMemo(() => {
    if (!data || data.length === 0) return { currentTemp: 0, currentHum: 0, violations: 0, avgTemp: 0 };
    const latest = data[data.length - 1];
    const temps = data.map((d) => d.temperature);
    const sum = temps.reduce((a, b) => a + b, 0);
    const violations = data.filter((d) => d.isAlert || d.temperature > maxTempThreshold || d.temperature < minTempThreshold).length;
    return {
      currentTemp: latest.temperature,
      currentHum: latest.humidity,
      violations,
      avgTemp: (sum / temps.length).toFixed(1),
    };
  }, [data, minTempThreshold, maxTempThreshold]);

  const isCurrentExcursion =
    stats.currentTemp > maxTempThreshold || stats.currentTemp < minTempThreshold;

  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs', className)}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
            {isCurrentExcursion ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                EXCURSION DETECTED
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3" />
                COMPLIANT
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Quick Readout Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
            <Thermometer className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500">Current:</span>
            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
              {stats.currentTemp > 0 ? `+${stats.currentTemp.toFixed(1)}` : stats.currentTemp.toFixed(1)}°C
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs">
            <Droplets className="w-4 h-4 text-sky-600" />
            <span className="text-slate-500">Humidity:</span>
            <span className="font-bold font-mono text-sky-700 dark:text-sky-300">
              {stats.currentHum.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Control Filter Pills */}
      <div className="flex items-center justify-between mt-3 mb-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Show:</span>
          {(['both', 'temp', 'humidity'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMetric(mode)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-medium transition',
                activeMetric === mode
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {mode === 'both' ? 'Both' : mode === 'temp' ? 'Temperature (°C)' : 'Humidity (%)'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-0.5 bg-rose-500 inline-block" /> Max Limit: {maxTempThreshold}°C
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-0.5 bg-sky-500 inline-block" /> Min Limit: {minTempThreshold}°C
          </span>
        </div>
      </div>

      {/* Main Responsive Recharts Graph */}
      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
            <YAxis
              yAxisId="left"
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              unit="°C"
            />
            {activeMetric === 'both' && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                unit="%"
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            {/* Acceptable Safe Cold-Chain Range Area */}
            <ReferenceArea
              yAxisId="left"
              y1={minTempThreshold}
              y2={maxTempThreshold}
              fill="#10b981"
              fillOpacity={0.06}
            />

            {/* Threshold Guideline markers */}
            <ReferenceLine
              yAxisId="left"
              y={maxTempThreshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <ReferenceLine
              yAxisId="left"
              y={minTempThreshold}
              stroke="#3b82f6"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {(activeMetric === 'both' || activeMetric === 'temp') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={<CustomDot maxLimit={maxTempThreshold} minLimit={minTempThreshold} />}
                activeDot={{ r: 6, fill: '#10b981' }}
              />
            )}

            {(activeMetric === 'both' || activeMetric === 'humidity') && (
              <Line
                yAxisId={activeMetric === 'both' ? 'right' : 'left'}
                type="monotone"
                dataKey="humidity"
                name="Humidity (%)"
                stroke="#0284c7"
                strokeWidth={2}
                dot={false}
                strokeDasharray="2 2"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomDot(props: any) {
  const { cx, cy, payload, maxLimit, minLimit } = props;
  const isViolation = payload.temperature > maxLimit || payload.temperature < minLimit;

  if (isViolation) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth={2}
        className="animate-pulse"
      />
    );
  }
  return <circle cx={cx} cy={cy} r={2.5} fill="#10b981" />;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700 min-w-[140px]">
        <p className="font-semibold text-slate-300 pb-1 border-b border-slate-800 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3 py-0.5">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-mono font-bold">
              {entry.value}
              {entry.name.includes('Temp') ? '°C' : '%'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

import React, { useEffect, useState } from 'react';

export interface TopBundleInfo {
  id: string;
  conversions: number;
  revenue: number;
  epc: number;
  cr: number;
  platform?: string;
  headline?: string;
}

export interface FinancialKpiData {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueDeltaPct: string;
  topBundle: TopBundleInfo | null;
  networkEpc: string;
  overallCr: string;
  totalClicks: number;
  totalConversions: number;
  bundlesTracked: number;
  isLiveStream: boolean;
  lastUpdated: string;
}

// Sleek Mini Sparkline Component
export const MiniSparkline: React.FC<{
  dataPoints?: number[];
  color?: string;
  width?: number;
  height?: number;
}> = ({ dataPoints = [0, 0, 0, 0, 0, 0, 0], color = '#10B981', width = 75, height = 24 }) => {
  const max = Math.max(...dataPoints, 1);
  const min = Math.min(...dataPoints, 0);
  const range = max - min || 1;

  const points = dataPoints
    .map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={points} />
      {dataPoints.length > 0 && (
        <circle
          cx={(width).toFixed(1)}
          cy={(height - ((dataPoints[dataPoints.length - 1] - min) / range) * (height - 4) - 2).toFixed(1)}
          r="2.5"
          fill={color}
          className="animate-pulse"
        />
      )}
    </svg>
  );
};

export const FinancialMetricsWidget: React.FC<{
  apiBaseUrl?: string;
  refreshIntervalMs?: number;
  onSelectBundle?: (bundleId: string) => void;
}> = ({ apiBaseUrl = '', refreshIntervalMs = 4000, onSelectBundle }) => {
  const [data, setData] = useState<FinancialKpiData>({
    todayRevenue: 0.0,
    yesterdayRevenue: 0.0,
    revenueDeltaPct: '0.0%',
    topBundle: null,
    networkEpc: '$0.00',
    overallCr: '0.00%',
    totalClicks: 0,
    totalConversions: 0,
    bundlesTracked: 0,
    isLiveStream: false,
    lastUpdated: new Date().toLocaleTimeString(),
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Fetch KPI data via REST
  const fetchKpi = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/financials/kpi`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData((prev) => ({
            todayRevenue: json.todayRevenue ?? 0,
            yesterdayRevenue: json.yesterdayRevenue ?? 0,
            revenueDeltaPct: json.revenueDeltaPct ?? '0.0%',
            topBundle: json.topBundle || null,
            networkEpc: json.networkEpc || '$0.00',
            overallCr: json.overallCr || '0.00%',
            totalClicks: json.totalClicks ?? 0,
            totalConversions: json.totalConversions ?? 0,
            bundlesTracked: json.bundlesTracked ?? 0,
            isLiveStream: prev.isLiveStream,
            lastUpdated: new Date().toLocaleTimeString(),
          }));
        }
      }
    } catch {
      // Under zero demo data rule, keep genuine zeros on error
    } finally {
      setLoading(false);
    }
  };

  // Setup SSE stream with Polling fallback
  useEffect(() => {
    fetchKpi();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${apiBaseUrl}/api/stream/events`);

      eventSource.addEventListener('connected', () => {
        setData((prev) => ({ ...prev, isLiveStream: true }));
      });

      eventSource.addEventListener('telemetry_update', () => {
        fetchKpi();
      });

      eventSource.onerror = () => {
        setData((prev) => ({ ...prev, isLiveStream: false }));
        if (eventSource) eventSource.close();
      };
    } catch {
      setData((prev) => ({ ...prev, isLiveStream: false }));
    }

    const pollTimer = setInterval(fetchKpi, refreshIntervalMs);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollTimer);
    };
  }, [apiBaseUrl, refreshIntervalMs]);

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-emerald-900/60 rounded-xl p-5 font-mono text-xs text-slate-200 space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-base">
            💰
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                FINANCIAL TELEMETRY & CPA KPI // ДОХОД И EPC
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                data.isLiveStream
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{data.isLiveStream ? 'LIVE SSE STREAM' : 'POLLING 4s'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Сквозная аналитика: реальные постбеки сетей MyLead & LosPollos vs кликстрим Umami
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span className="text-slate-400">Обновлено: <strong className="text-slate-200">{data.lastUpdated}</strong></span>
          <button
            onClick={() => fetchKpi()}
            disabled={loading}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            ↻ Обновить
          </button>
        </div>
      </div>

      {/* KPI Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tile 1: Total Revenue Today */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Выручка сегодня (USD)</span>
            <span className="text-xs">💵</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              ${data.todayRevenue.toFixed(2)}
            </span>
            <div className="flex items-center space-x-1.5">
              <MiniSparkline color="#10B981" />
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                data.todayRevenue > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
              }`}>
                {data.revenueDeltaPct}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Вчера: ${data.yesterdayRevenue.toFixed(2)}</span>
            <span>Конверсий: {data.totalConversions}</span>
          </div>
        </div>

        {/* Tile 2: Network EPC */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Сквозной EPC</span>
            <span className="text-xs">🎯</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {data.networkEpc}
            </span>
            <MiniSparkline color="#06B6D4" />
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Доход на 1 клик</span>
            <span>Кликов: {data.totalClicks}</span>
          </div>
        </div>

        {/* Tile 3: Overall Conversion Rate (CR) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Конверсия (CR)</span>
            <span className="text-xs">⚡</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {data.overallCr}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Sales / Clicks ratio</span>
            <span>Сеть: MyLead/LosPollos</span>
          </div>
        </div>

        {/* Tile 4: Top Performing Bundle ID */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Top-Связка (Bundle)</span>
            <span className="text-xs">🏆</span>
          </div>
          <div className="mt-1">
            {data.topBundle ? (
              <div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSelectBundle?.(data.topBundle!.id)}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 underline font-mono text-left truncate max-w-[150px]"
                    title={`Открыть бандл ${data.topBundle.id}`}
                  >
                    {data.topBundle.id.slice(0, 12)}...
                  </button>
                  <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1 rounded">
                    +${data.topBundle.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  CR: {data.topBundle.cr}% | EPC: ${data.topBundle.epc.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic py-1">
                0 активных продаж
              </div>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Бандлов на трекинге:</span>
            <span className="text-slate-300 font-bold">{data.bundlesTracked}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMetricsWidget;

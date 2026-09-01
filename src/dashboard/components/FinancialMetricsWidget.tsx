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
    <div className="bg-[#161b22] border border-[#30363d] rounded-sm p-3 font-mono text-[11px] text-[#c9d1d9] space-y-2.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-[#30363d]">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#c9d1d9] text-xs">
            FINANCIAL TELEMETRY & CPA KPI
          </span>
          <span className={`px-1.5 py-0.2 rounded-sm text-[10px] font-bold ${
            data.isLiveStream
              ? 'bg-[#1b4725] text-[#3fb950] border border-[#2ea043]'
              : 'bg-[#1f242c] text-[#8b949e] border border-[#30363d]'
          }`}>
            {data.isLiveStream ? 'LIVE SSE' : 'POLLING 4s'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-[#8b949e]">
          <span>Обновлено: <strong className="text-[#c9d1d9]">{data.lastUpdated}</strong></span>
          <button
            onClick={() => fetchKpi()}
            disabled={loading}
            className="px-2 py-0.5 rounded-sm bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]"
          >
            ↻ Обновить
          </button>
        </div>
      </div>

      {/* KPI Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Tile 1: Total Revenue Today */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-sm p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider">Выручка сегодня (USD)</span>
            <span className="text-[10px] text-[#8b949e]">USD</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#3fb950] font-mono">
              ${data.todayRevenue.toFixed(2)}
            </span>
            <div className="flex items-center space-x-1">
              <MiniSparkline color="#2ea043" />
              <span className={`text-[9px] font-bold px-1 py-0.2 rounded-sm ${
                data.todayRevenue > 0 ? 'bg-[#1b4725] text-[#3fb950] border border-[#2ea043]' : 'bg-[#21262d] text-[#8b949e]'
              }`}>
                {data.revenueDeltaPct}
              </span>
            </div>
          </div>
          <div className="text-[9px] text-[#8b949e] mt-1 flex justify-between">
            <span>Вчера: ${data.yesterdayRevenue.toFixed(2)}</span>
            <span>Конверсий: {data.totalConversions}</span>
          </div>
        </div>

        {/* Tile 2: Network EPC */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-sm p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider">Сквозной EPC</span>
            <span className="text-[10px] text-[#8b949e]">EPC</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#58a6ff] font-mono">
              {data.networkEpc}
            </span>
            <MiniSparkline color="#58a6ff" />
          </div>
          <div className="text-[9px] text-[#8b949e] mt-1 flex justify-between">
            <span>Доход на 1 клик</span>
            <span>Кликов: {data.totalClicks}</span>
          </div>
        </div>

        {/* Tile 3: Overall Conversion Rate (CR) */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-sm p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider">Конверсия (CR)</span>
            <span className="text-[10px] text-[#8b949e]">CR%</span>
          </div>
          <div className="mt-1">
            <span className="text-xl font-bold text-[#d29922] font-mono">
              {data.overallCr}
            </span>
          </div>
          <div className="text-[9px] text-[#8b949e] mt-1 flex justify-between">
            <span>Sales / Clicks ratio</span>
            <span>Сети: MyLead/LosPollos</span>
          </div>
        </div>

        {/* Tile 4: Top Performing Bundle ID */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-sm p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider">Top-Связка (Bundle)</span>
            <span className="text-[10px] text-[#8b949e]">WINNER</span>
          </div>
          <div className="mt-1">
            {data.topBundle ? (
              <div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onSelectBundle?.(data.topBundle!.id)}
                    className="text-xs font-bold text-[#58a6ff] underline font-mono text-left truncate max-w-[130px]"
                    title={`Открыть бандл ${data.topBundle.id}`}
                  >
                    {data.topBundle.id.slice(0, 12)}...
                  </button>
                  <span className="text-[9px] bg-[#1b4725] text-[#3fb950] px-1 rounded-sm">
                    +${data.topBundle.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="text-[9px] text-[#8b949e] mt-0.5 truncate">
                  CR: {data.topBundle.cr}% | EPC: ${data.topBundle.epc.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="text-[#8b949e] text-[10px] italic py-0.5">
                0 активных продаж
              </div>
            )}
          </div>
          <div className="text-[9px] text-[#8b949e] mt-1 flex justify-between">
            <span>Бандлов на трекинге:</span>
            <span className="text-[#c9d1d9] font-bold">{data.bundlesTracked}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMetricsWidget;

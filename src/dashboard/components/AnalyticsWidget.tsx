import React, { useEffect, useState } from 'react';

export interface UmamiFunnelStep {
  stepName: string;
  count: number;
  dropoffRatePct: number;
  conversionRatePct: number;
}

export interface UmamiAnalyticsData {
  websiteId: string;
  totalVisitors: number;
  totalPageviews: number;
  todayVisitors?: number;
  todayPageviews?: number;
  bounceRatePct?: number;
  steps: UmamiFunnelStep[];
  overallConversionRatePct: number;
  topReferrers: { source: string; count: number; sharePct: number }[];
  cachedAt: number;
  isLive?: boolean;
}

export const AnalyticsWidget: React.FC<{ refreshIntervalMs?: number; websiteId?: string }> = ({
  refreshIntervalMs = 5000,
  websiteId = '8f92b7c4-2a1d-4e56-98c3-4d7a8b1e2f3a',
}) => {
  const [data, setData] = useState<UmamiAnalyticsData>({
    websiteId,
    totalVisitors: 0,
    totalPageviews: 0,
    todayVisitors: 0,
    todayPageviews: 0,
    bounceRatePct: 0,
    steps: [
      { stepName: '1. Просмотр прелендера (Land / Step 1)', count: 0, dropoffRatePct: 0, conversionRatePct: 0 },
      { stepName: '2. Прохождение квиза (Quiz Completed)', count: 0, dropoffRatePct: 0, conversionRatePct: 0 },
      { stepName: '3. Переход на оффер (CTA Redirect)', count: 0, dropoffRatePct: 0, conversionRatePct: 0 },
    ],
    overallConversionRatePct: 0,
    topReferrers: [],
    cachedAt: Date.now(),
    isLive: false,
  });

  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/umami/funnel?websiteId=${websiteId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.funnel) {
          setData({
            ...json.funnel,
            todayVisitors: json.stats?.todayVisitors || 0,
            todayPageviews: json.stats?.todayPageviews || 0,
            bounceRatePct: json.stats?.bounceRate || 0,
            isLive: true,
          });
        }
      }
    } catch {
      // Retain zero metrics under zero demo data rule
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const timer = setInterval(fetchAnalytics, refreshIntervalMs);
    return () => clearInterval(timer);
  }, [websiteId, refreshIntervalMs]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-900/60 rounded-xl p-5 font-mono text-xs text-slate-200 space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-base">
            📈
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                UMAMI TELEMETRY // ТЕЛЕМЕТРИЯ ПРЕЛЕНДЕРОВ
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>SELF-HOSTED 100% REAL</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Сквозная конверсия квиз-воронок, микро-клики и трафик-источники (Reddit/Quora/Organic)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAnalytics}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition active:scale-95"
          >
            🔄 Обновить
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Посетители (Всего / Сегодня)</div>
          <div className="text-lg font-extrabold text-indigo-300 mt-1 flex items-baseline space-x-1.5">
            <span>{data.totalVisitors}</span>
            <span className="text-xs text-emerald-400 font-normal">({data.todayVisitors || 0} сег.)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Уникальные IP без куков</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Просмотры (Pageviews)</div>
          <div className="text-lg font-extrabold text-sky-300 mt-1 flex items-baseline space-x-1.5">
            <span>{data.totalPageviews}</span>
            <span className="text-xs text-sky-400 font-normal">({data.todayPageviews || 0} сег.)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">События загрузки DOM</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Воронка Прелендера (CR)</div>
          <div className="text-lg font-extrabold text-emerald-400 mt-1">
            {data.overallConversionRatePct.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Сквозной переход на оффер</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Отказы (Bounce Rate)</div>
          <div className="text-lg font-extrabold text-amber-400 mt-1">
            {(data.bounceRatePct || 0).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Уход без взаимодействия</div>
        </div>
      </div>

      {/* Funnel Breakdown & Top Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Pre-lander Quiz Funnel Progress */}
        <div className="md:col-span-2 bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-1.5 border-b border-slate-900">
            <span className="text-indigo-400 flex items-center">
              <span className="mr-1.5">🎯</span> Воронка микро-шагов квиза (Pre-lander Drop-off)
            </span>
            <span className="text-[10px] text-slate-500">Авто-трекинг этапов</span>
          </div>

          <div className="space-y-2.5">
            {data.steps.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">{step.stepName}</span>
                  <span className="text-slate-400">
                    <strong className="text-slate-100">{step.count}</strong> соб. (
                    <span className="text-emerald-400">{step.conversionRatePct}%</span>)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, step.conversionRatePct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Traffic Sources & Referrers */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-1.5 border-b border-slate-900">
              <span className="text-sky-400 flex items-center">
                <span className="mr-1.5">🌐</span> Источники трафика
              </span>
              <span className="text-[10px] text-slate-500">Referrers</span>
            </div>

            <div className="space-y-2 mt-2">
              {data.topReferrers.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic text-center py-4">
                  Нет зарегистрированных рефереров.
                </div>
              ) : (
                data.topReferrers.map((ref, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] bg-slate-900/50 p-1.5 rounded border border-slate-800/50">
                    <span className="text-slate-300 truncate max-w-[140px]">{ref.source}</span>
                    <span className="text-sky-400 font-bold">{ref.count} ({ref.sharePct}%)</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900/80 text-[10px] text-slate-500 text-right">
            Синхронизировано с Umami API
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsWidget;

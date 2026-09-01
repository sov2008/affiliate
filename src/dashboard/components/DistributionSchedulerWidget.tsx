import React, { useEffect, useState } from 'react';

export interface SchedulerData {
  scheduler: {
    status: 'RUNNING' | 'COOLDOWN' | 'HALTED' | 'PAUSED' | 'STOPPED' | 'CIRCUIT_BROKEN';
    rawStatus: string;
    isRunning: boolean;
    pollIntervalMs: number;
    totalDispatched: number;
    totalFailed: number;
    nextDispatchCountdownMs: number;
    nextDispatchCountdownFormatted: string;
    circuitBreakerReason?: string;
    lastCycleAt?: string;
  };
  proxyHealth: {
    total: number;
    healthy: number;
    blacklisted: number;
    activeSessions: number;
  };
  recentDispatches: Array<{
    id: string;
    bundleId: string;
    campaignId: string;
    platform: string;
    publishedUrl: string;
    hook: string;
    dispatchedAt: string;
    status: string;
  }>;
}

export const DistributionSchedulerWidget: React.FC<{
  apiBaseUrl?: string;
  refreshIntervalMs?: number;
}> = ({ apiBaseUrl = '', refreshIntervalMs = 4000 }) => {
  const [data, setData] = useState<SchedulerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/scheduler/status`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch {
      // Retain previous state on fetch error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${apiBaseUrl}/api/stream/events`);
      eventSource.addEventListener('telemetry_update', () => {
        fetchStatus();
      });
    } catch {}

    const timer = setInterval(fetchStatus, refreshIntervalMs);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(timer);
    };
  }, [apiBaseUrl, refreshIntervalMs]);

  const handleToggleScheduler = async () => {
    setActionLoading('toggle');
    try {
      const res = await fetch(`${apiBaseUrl}/api/scheduler/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        setNotice(json.isRunning ? '🚀 Планировщик запущен' : '⏸️ Планировщик приостановлен');
        setTimeout(() => setNotice(null), 3000);
        fetchStatus();
      }
    } catch (err: any) {
      setNotice(`Ошибка: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceDispatch = async () => {
    setActionLoading('force');
    try {
      const res = await fetch(`${apiBaseUrl}/api/scheduler/dispatch-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success && json.result) {
        if (json.result.dispatched) {
          setNotice(`✅ Принудительно отправлен пост [${json.result.item?.id?.slice(0, 8)}]`);
        } else {
          setNotice(`⚠️ Не отправлено: ${json.result.reason || json.result.status}`);
        }
        setTimeout(() => setNotice(null), 3500);
        fetchStatus();
      }
    } catch (err: any) {
      setNotice(`Ошибка отправки: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const scheduler = data?.scheduler;
  const proxyHealth = data?.proxyHealth;
  const recentDispatches = data?.recentDispatches || [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'RUNNING':
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/60';
      case 'COOLDOWN':
        return 'text-sky-300 border-sky-500/50 bg-sky-950/60';
      case 'HALTED':
        return 'text-rose-400 border-rose-500/50 bg-rose-950/60';
      case 'CIRCUIT_BROKEN':
        return 'text-amber-400 border-amber-500/50 bg-amber-950/60';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-sky-900/60 rounded-xl p-5 font-mono text-xs text-slate-200 space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-300 text-base">
            📡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                DISTRIBUTION WORKERS & PROXY STATUS // ДИСТРИБУЦИЯ И ПРОКСИ
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(scheduler?.status)} flex items-center space-x-1.5`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span>{scheduler?.status || 'INITIALIZING'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Скрытная ротация очередей Playwright с контролем задержек, геотаргетингом и защитными размыкателями
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleScheduler}
            disabled={actionLoading !== null || loading}
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 border ${
              scheduler?.isRunning
                ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-600/50'
                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-600/50'
            }`}
          >
            <span>{scheduler?.isRunning ? '⏸️ Приостановить' : '▶️ Запустить'}</span>
          </button>

          <button
            onClick={handleForceDispatch}
            disabled={actionLoading !== null || loading}
            className="px-3 py-1.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-600/50 font-bold transition text-xs flex items-center space-x-1"
          >
            <span>⚡ Отправить следующий одобренный</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-2 rounded bg-sky-950/80 border border-sky-500/50 text-sky-300 text-xs flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-sky-400 ml-2">✕</button>
        </div>
      )}

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Next Scheduled Dispatch Countdown */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase">Следующая отправка</div>
          <div className="text-xl font-bold text-sky-400">
            {scheduler?.nextDispatchCountdownFormatted || 'Готов'}
          </div>
          <div className="text-[10px] text-slate-500">
            Гауссово окно: Reddit 45–90м | Quora 30–60м
          </div>
        </div>

        {/* Total Dispatches */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase">Опубликовано постов</div>
          <div className="text-xl font-bold text-emerald-400">
            {scheduler?.totalDispatched || 0}
          </div>
          <div className="text-[10px] text-slate-500">
            Ошибок / отмен: <span className="text-rose-400">{scheduler?.totalFailed || 0}</span>
          </div>
        </div>

        {/* Proxy Pool Health */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase">Здоровье пула прокси</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-emerald-400">
              {proxyHealth?.healthy || 0}
            </span>
            <span className="text-xs text-slate-400">
              / {proxyHealth?.total || 0} нод
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            В черном списке: <span className="text-rose-400 font-bold">{proxyHealth?.blacklisted || 0}</span>
          </div>
        </div>

        {/* Active Browser Contexts */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase">Активные Playwright сессии</div>
          <div className="text-xl font-bold text-indigo-400">
            {proxyHealth?.activeSessions || 0}
          </div>
          <div className="text-[10px] text-slate-500">
            Анти-детект профили активны
          </div>
        </div>
      </div>

      {/* Circuit Breaker Alert (if triggered) */}
      {scheduler?.circuitBreakerReason && (
        <div className="p-3 rounded bg-amber-950/60 border border-amber-500 text-amber-300 text-xs flex items-center space-x-2">
          <span>⚠️</span>
          <span><strong>Размыкатель цепи активен:</strong> {scheduler.circuitBreakerReason}</span>
        </div>
      )}

      {/* Queue Dispatched Log (Last 5 Posted URLs) */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-bold">
          <span>Последние 5 опубликованных ссылок (Live Dispatched URLs)</span>
          <span>Всего в архиве: {recentDispatches.length}</span>
        </div>

        {recentDispatches.length === 0 ? (
          <div className="p-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-lg text-center text-slate-500 text-xs">
            0 опубликованных постов в очереди. Одобрите связки для начала скрытной отправки.
          </div>
        ) : (
          <div className="space-y-2">
            {recentDispatches.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:border-slate-700 transition text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-sky-300 border border-slate-700">
                      {item.platform}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Bundle: {item.bundleId.slice(0, 8)}
                    </span>
                    <span className="text-[10px] text-emerald-400">✓ {item.status}</span>
                  </div>
                  <div className="text-slate-200 text-xs line-clamp-1">
                    &ldquo;{item.hook}&rdquo;
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-[11px] shrink-0">
                  <span className="text-slate-500 text-[10px]">
                    {new Date(item.dispatchedAt).toLocaleTimeString('ru-RU')}
                  </span>
                  {item.publishedUrl ? (
                    <a
                      href={item.publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/60 font-bold transition text-[11px] flex items-center space-x-1"
                    >
                      <span>Открыть пост</span>
                      <span>↗</span>
                    </a>
                  ) : (
                    <span className="text-slate-500 italic">URL не указан</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributionSchedulerWidget;

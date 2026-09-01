import React, { useEffect, useState } from 'react';

export interface VariantMetrics {
  clicks: number;
  conversions: number;
  revenue: number;
  epc: number;
  cr: number;
}

export interface MabCampaignState {
  campaignId: string;
  winnerVariant: string;
  weights: Record<string, number>;
  variants: Record<string, VariantMetrics>;
  totalClicks: number;
  totalRevenue: number;
  totalConversions: number;
  confidenceMet: boolean;
  status: 'COLLECTING_SAMPLE' | 'OPTIMIZED' | 'TIE';
  lastOptimizedAt: string;
}

export interface MabStateData {
  version: string;
  updatedAt: string;
  epsilon: number;
  minConfidenceClicks: number;
  campaigns: Record<string, MabCampaignState>;
}

export interface EvolutionHistoryItem {
  id: string;
  campaignId: string;
  fromVariant: string;
  toVariant: string;
  angleConcept: string;
  timestamp: string;
  status: string;
}

export const MabEvolutionWidget: React.FC<{
  apiBaseUrl?: string;
  refreshIntervalMs?: number;
}> = ({ apiBaseUrl = '', refreshIntervalMs = 5000 }) => {
  const [mabState, setMabState] = useState<MabStateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [evolutionLog, setEvolutionLog] = useState<EvolutionHistoryItem[]>([]);

  const fetchMabState = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/mab/status`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.state) {
          setMabState(json.state);
        }
      }
    } catch {
      // Retain previous state on network drop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMabState();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${apiBaseUrl}/api/stream/events`);
      eventSource.addEventListener('telemetry_update', () => {
        fetchMabState();
      });
    } catch {}

    const timer = setInterval(fetchMabState, refreshIntervalMs);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(timer);
    };
  }, [apiBaseUrl, refreshIntervalMs]);

  const handleOptimizeAll = async () => {
    setActionLoading('optimize_all');
    try {
      const res = await fetch(`${apiBaseUrl}/api/mab/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        setNotice('⚡ ИИ Multi-Armed Bandit: сплит-роутеры всех кампаний оптимизированы');
        setTimeout(() => setNotice(null), 4000);
        if (json.state) setMabState(json.state);
        else fetchMabState();
      }
    } catch (err: any) {
      setNotice(`Ошибка MAB: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceEvolution = async (campaignId: string, variant: string = 'v1') => {
    setActionLoading(`evolve_${campaignId}`);
    try {
      const res = await fetch(`${apiBaseUrl}/api/campaigns/${campaignId}/evolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant, angleConcept: 'Radical Hook Shift & 2-Step Reduced Friction' }),
      });
      const json = await res.json();
      if (json.success && json.result) {
        setNotice(`🧬 Создан и развернут новый претендент [${json.result.newVariant}] для ${campaignId}`);
        setTimeout(() => setNotice(null), 4500);

        setEvolutionLog((prev) => [
          {
            id: `${campaignId}_${Date.now()}`,
            campaignId,
            fromVariant: variant,
            toVariant: json.result.newVariant,
            angleConcept: json.result.angleConcept || 'Contrarian Curiosity Shift',
            timestamp: new Date().toISOString(),
            status: 'EVOLVED',
          },
          ...prev.slice(0, 9),
        ]);

        fetchMabState();
      }
    } catch (err: any) {
      setNotice(`Ошибка эволюции: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLockTraffic = async (campaignId: string, variant: string) => {
    setActionLoading(`lock_${campaignId}_${variant}`);
    try {
      const res = await fetch(`${apiBaseUrl}/api/campaigns/${campaignId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant }),
      });
      const json = await res.json();
      if (json.success) {
        setNotice(`🔒 Трафик зафиксирован на 100% [${variant}] для ${campaignId}`);
        setTimeout(() => setNotice(null), 4000);
        fetchMabState();
      }
    } catch (err: any) {
      setNotice(`Ошибка фиксации: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const campaigns = Object.values(mabState?.campaigns || {});

  const getStatusBadge = (status: MabCampaignState['status']) => {
    switch (status) {
      case 'OPTIMIZED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
            ✓ ОПТИМИЗИРОВАНО (85/15)
          </span>
        );
      case 'COLLECTING_SAMPLE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/80 text-sky-400 border border-sky-500/40">
            ● СБОР ВЫБОРКИ (&lt;20 кл)
          </span>
        );
      case 'TIE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">
            ⚖️ РАВЕНСТВО EPC (50/50)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-900/60 rounded-xl p-5 font-mono text-xs text-slate-200 space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300 text-base">
            🎲
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                MULTI-ARMED BANDIT (MAB) & VARIANT EVOLUTION // СИНТЕЗ ВАРИАНТОВ
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                &epsilon; = 0.15 (85/15)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Адаптивная максимизация EPC, отсев неконвертящих прелендингов и автономный синтез претендентов
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleOptimizeAll}
            disabled={actionLoading !== null || loading}
            className="px-3 py-1.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-600/50 font-bold transition text-xs flex items-center space-x-1.5"
          >
            <span>{actionLoading === 'optimize_all' ? '⏳ Оптимизация...' : '⚡ Оптимизировать MAB сплит'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-2.5 rounded bg-purple-950/90 border border-purple-500/60 text-purple-200 text-xs flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-purple-400 ml-2">✕</button>
        </div>
      )}

      {/* Campaign MAB Matrix Table */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-bold">
          <span>Матрица распределения трафика (Active Campaign MAB Matrix)</span>
          <span>Кампаний в ротации: {campaigns.length}</span>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-lg text-center text-slate-500 text-xs">
            {loading ? 'Загрузка матрицы MAB...' : '0 кампаний в ротации. Опубликуйте связки для активации Multi-Armed Bandit.'}
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => {
              const variantsList = Object.entries(c.variants || {});
              return (
                <div
                  key={c.campaignId}
                  className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-100 font-mono">
                        {c.campaignId}
                      </span>
                      {getStatusBadge(c.status)}
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-slate-400">
                        Клики: <strong className="text-sky-300">{c.totalClicks}</strong>
                      </span>
                      <span className="text-slate-400">
                        Выручка: <strong className="text-emerald-400">${c.totalRevenue.toFixed(2)}</strong>
                      </span>
                      <span className="text-slate-400">
                        Лиды: <strong className="text-purple-300">{c.totalConversions}</strong>
                      </span>
                      <button
                        onClick={() => handleForceEvolution(c.campaignId, c.winnerVariant || 'v1')}
                        disabled={actionLoading !== null}
                        className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 font-bold transition text-[11px] flex items-center space-x-1"
                      >
                        <span>🧬 Синтезировать {`v${variantsList.length + 1}`}</span>
                      </button>
                    </div>
                  </div>

                  {/* Traffic Split Progress Bars */}
                  <div className="space-y-2 pt-1 border-t border-slate-900">
                    <div className="w-full bg-slate-900 rounded-full h-3 flex overflow-hidden border border-slate-800">
                      {variantsList.map(([vKey], idx) => {
                        const weight = c.weights?.[vKey] || 0;
                        if (weight === 0) return null;
                        const colors = [
                          'bg-emerald-500',
                          'bg-sky-500',
                          'bg-indigo-500',
                          'bg-purple-500',
                          'bg-amber-500',
                        ];
                        const barColor = colors[idx % colors.length];
                        return (
                          <div
                            key={vKey}
                            style={{ width: `${weight}%` }}
                            className={`${barColor} h-full transition-all duration-500 flex items-center justify-center text-[9px] font-bold text-slate-950`}
                            title={`${vKey}: ${weight}%`}
                          >
                            {weight >= 15 ? `${vKey}: ${weight}%` : ''}
                          </div>
                        );
                      })}
                    </div>

                    {/* Variant KPI Tiles & Lock Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {variantsList.map(([vKey, vMetrics]) => {
                        const isWinner = c.winnerVariant === vKey && c.status === 'OPTIMIZED';
                        const weight = c.weights?.[vKey] || 0;
                        return (
                          <div
                            key={vKey}
                            className={`p-2 rounded border flex justify-between items-center ${
                              isWinner
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-xs">{vKey}</span>
                                {isWinner && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-slate-950 uppercase">
                                    Winner
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">({weight}%)</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                EPC: <span className="text-emerald-400 font-bold">${vMetrics.epc.toFixed(2)}</span> • CR:{' '}
                                <span className="text-sky-300">{vMetrics.cr.toFixed(1)}%</span> • Кликов: {vMetrics.clicks}
                              </div>
                            </div>

                            <button
                              onClick={() => handleLockTraffic(c.campaignId, vKey)}
                              disabled={actionLoading !== null}
                              title="Зафиксировать 100% входящего трафика на этом варианте"
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-bold transition"
                            >
                              🔒 100%
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evolution Log */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-bold">
          <span>Журнал эволюции и синтеза (Challenger Evolution Log)</span>
          <span className="text-[10px] text-slate-500">Автономный отсев</span>
        </div>

        {evolutionLog.length === 0 ? (
          <div className="p-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-lg text-center text-slate-500 text-xs">
            Синтезированные варианты будут отображаться здесь по мере обнаружения неконвертящих связок.
          </div>
        ) : (
          <div className="space-y-1.5">
            {evolutionLog.map((log) => (
              <div
                key={log.id}
                className="p-2 bg-slate-950/80 border border-slate-800 rounded flex justify-between items-center text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-indigo-400">🧬</span>
                  <span className="font-bold text-slate-200">{log.campaignId}</span>
                  <span className="text-slate-400">
                    {log.fromVariant} &rarr; <strong className="text-emerald-400">{log.toVariant}</strong>
                  </span>
                  <span className="text-[10px] text-slate-500 italic truncate max-w-xs">
                    ({log.angleConcept})
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MabEvolutionWidget;

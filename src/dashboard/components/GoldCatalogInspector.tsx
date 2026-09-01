import React, { useEffect, useState } from 'react';

export interface GoldEntryItem {
  id: string;
  platform: string;
  niche: string;
  complianceScore: number;
  performanceMetrics: {
    clicks: number;
    conversions: number;
    revenue: number;
  };
  inputContext: {
    platform: string;
    sourceUrl: string;
    topicTitle: string;
    sourceText: string;
    targetAudiencePain: string;
    metadata?: Record<string, unknown>;
  };
  approvedCreative: {
    headline: string;
    body: string;
    callToAction: string;
    prelanderSlug?: string;
    generatedPrompt?: string;
  };
  addedAt: string;
  updatedAt?: string;
  isPinned?: boolean;
}

export const GoldCatalogInspector: React.FC<{
  apiBaseUrl?: string;
  refreshIntervalMs?: number;
}> = ({ apiBaseUrl = '', refreshIntervalMs = 5000 }) => {
  const [entries, setEntries] = useState<GoldEntryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterNiche, setFilterNiche] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/agent/gold-catalog`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.entries)) {
          setEntries(json.entries);
        }
      }
    } catch {
      // Retain existing state on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${apiBaseUrl}/api/stream/events`);
      eventSource.addEventListener('telemetry_update', () => {
        fetchCatalog();
      });
    } catch {}

    const pollTimer = setInterval(fetchCatalog, refreshIntervalMs);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollTimer);
    };
  }, [apiBaseUrl, refreshIntervalMs]);

  const handlePin = async (id: string, currentPinStatus: boolean) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/agent/gold-catalog/${id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPinStatus }),
      });

      if (res.ok) {
        setActionNotice(!currentPinStatus ? `⭐ Образец закреплен на вершине каталога` : `Образец откреплен`);
        setTimeout(() => setActionNotice(null), 3000);
        fetchCatalog();
      }
    } catch (err: any) {
      setActionNotice(`Ошибка: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот образец из Gold Catalog?')) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/agent/gold-catalog/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setActionNotice(`❌ Образец успешно удален из каталога`);
        setTimeout(() => setActionNotice(null), 3000);
        fetchCatalog();
      }
    } catch (err: any) {
      setActionNotice(`Ошибка: ${err.message}`);
    }
  };

  // Filter entries
  const filtered = entries.filter((e) => {
    const matchPlat = filterPlatform === 'all' || e.platform.toLowerCase() === filterPlatform.toLowerCase();
    const matchNiche = filterNiche === 'all' || e.niche.toLowerCase() === filterNiche.toLowerCase();
    return matchPlat && matchNiche;
  });

  const uniqueNiches = Array.from(new Set(entries.map((e) => e.niche || 'general')));

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-amber-900/60 rounded-xl p-5 font-mono text-xs text-slate-200 space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-300 text-base">
            ⭐
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                FEW-SHOT GOLD CATALOG // ЗОЛОТОЙ ДАТАСЕТ АГЕНТОВ
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                <span>{entries.length} / 50 ОБРАЗЦОВ</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Проверенные конвертящие пары (Score ≥ 90 / Conversions &gt; 0), динамически внедряемые в системный промпт CopywriterAgent
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Все площадки</option>
            <option value="reddit">Reddit</option>
            <option value="quora">Quora</option>
            <option value="forum">Forum</option>
            <option value="x">X / Twitter</option>
          </select>

          <select
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Все ниши</option>
            {uniqueNiches.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <button
            onClick={() => fetchCatalog()}
            disabled={loading}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Action Toast Notice */}
      {actionNotice && (
        <div className="p-2 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-amber-400 ml-2">✕</button>
        </div>
      )}

      {/* Catalog Table / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
          <div className="text-2xl mb-1">📭</div>
          <p className="font-bold text-slate-300">Золотой датасет пуст или нет совпадений по фильтрам</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
            Образцы добавляются автоматически, когда оператор одобряет бандл со скорингом ≥ 90, либо при поступлении реальных конверсий из CPA-сетей.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item, idx) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`bg-slate-950/80 border rounded-lg p-3.5 transition ${
                  item.isPinned
                    ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[11px] font-bold text-slate-400">#{idx + 1}</span>
                    <button
                      onClick={() => handlePin(item.id, Boolean(item.isPinned))}
                      title={item.isPinned ? 'Открепить образец' : 'Закрепить образец на вершине'}
                      className={`text-sm px-1.5 py-0.5 rounded transition ${
                        item.isPinned
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                          : 'text-slate-400 hover:text-amber-400'
                      }`}
                    >
                      ⭐ {item.isPinned ? 'PINNED' : 'PIN'}
                    </button>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-sky-300 border border-slate-700">
                      {item.platform}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold lowercase bg-slate-800 text-emerald-300 border border-slate-700">
                      {item.niche}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      Score: {item.complianceScore}/100
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px]">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <span>Conv: <strong className="text-emerald-400">{item.performanceMetrics?.conversions || 0}</strong></span>
                      <span>Rev: <strong className="text-emerald-400">${(item.performanceMetrics?.revenue || 0).toFixed(2)}</strong></span>
                      <span>Clicks: <strong className="text-cyan-400">{item.performanceMetrics?.clicks || 0}</strong></span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                      >
                        {isExpanded ? '▲ Свернуть' : '▼ Промпт'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Удалить из каталога"
                        className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                {/* Headline Preview */}
                <div className="mt-2 text-xs font-semibold text-slate-100">
                  <span className="text-amber-400 font-bold mr-1.5">Hook:</span>
                  &ldquo;{item.approvedCreative?.headline}&rdquo;
                </div>

                {/* Expanded Details: Context -> Creative Pair */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    {/* Left: Input Context */}
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1.5">
                      <div className="text-sky-400 font-bold uppercase text-[10px]">Входной контекст (Input Context)</div>
                      <div><strong className="text-slate-400">Тема:</strong> {item.inputContext?.topicTitle}</div>
                      <div><strong className="text-slate-400">Боль ЦА:</strong> {item.inputContext?.targetAudiencePain}</div>
                      <div className="text-slate-400 text-[10px] max-h-24 overflow-y-auto">
                        {item.inputContext?.sourceText}
                      </div>
                    </div>

                    {/* Right: Approved Creative */}
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1.5">
                      <div className="text-emerald-400 font-bold uppercase text-[10px]">Одобренный креатив (Approved Creative)</div>
                      <div className="text-slate-300 whitespace-pre-wrap max-h-28 overflow-y-auto leading-relaxed">
                        {item.approvedCreative?.body}
                      </div>
                      <div className="text-emerald-300"><strong className="text-slate-400">CTA:</strong> {item.approvedCreative?.callToAction}</div>
                      {item.approvedCreative?.generatedPrompt && (
                        <div className="text-[10px] text-cyan-300"><strong className="text-slate-400">Prompt:</strong> {item.approvedCreative.generatedPrompt}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoldCatalogInspector;

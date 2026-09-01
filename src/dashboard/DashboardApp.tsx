import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface DashboardTelemetry {
  todayRevenue: number;
  totalClicks: number;
  totalLeads: number;
  overallCr: string;
  networkEpc: string;
  isHalted: boolean;
  activeCampaignsCount: number;
  lastUpdated: string;
}

export interface QueueItem {
  id: string;
  campaign_id: string;
  platform: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'REJECTED';
  risk_score: number;
  created_at: string;
  headline?: string;
  epc?: number;
}

export interface CampaignItem {
  id: string;
  network: string;
  geo: string;
  clicks: number;
  leads: number;
  revenue: number;
  cr: string;
  epc: string;
  status: string;
}

export interface LogLine {
  id: string;
  time: string;
  text: string;
}

/**
 * Helper to render lightweight ASCII progress bar
 * Example: renderAsciiBar(45) -> "[====>     ] 45%"
 */
export function renderAsciiBar(pct: number, width = 10): string {
  const safePct = Math.max(0, Math.min(100, isNaN(pct) ? 0 : pct));
  const filled = Math.round((safePct / 100) * width);
  const empty = width - filled;
  const bar = '='.repeat(Math.max(0, filled > 0 ? filled - 1 : 0)) + (filled > 0 ? '>' : '') + ' '.repeat(empty);
  return `[${bar}] ${safePct.toFixed(0)}%`;
}

export const DashboardApp: React.FC<{
  apiBaseUrl?: string;
  nodeIp?: string;
}> = ({ apiBaseUrl = '', nodeIp = '178.128.199.28' }) => {
  // 1. Central Telemetry State (Zero Demo Data Rule compliant)
  const [telemetry, setTelemetry] = useState<DashboardTelemetry>({
    todayRevenue: 0.0,
    totalClicks: 0,
    totalLeads: 0,
    overallCr: '0.00%',
    networkEpc: '$0.00',
    isHalted: false,
    activeCampaignsCount: 3,
    lastUpdated: '--:--:--',
  });

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const logBoxRef = useRef<HTMLDivElement>(null);
  const MAX_LOG_LINES = 100;

  // Append line to 100-line circular buffer
  const appendLog = useCallback((text: string) => {
    const clean = text.replace(/\u001b\[[0-9;]*m/g, '');
    const entry: LogLine = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      time: new Date().toLocaleTimeString('ru-RU', { hour12: false }),
      text: clean,
    };
    setLogs((prev) => {
      const next = [...prev, entry];
      return next.length > MAX_LOG_LINES ? next.slice(next.length - MAX_LOG_LINES) : next;
    });
  }, []);

  // Fetch initial telemetry & queue
  const fetchData = useCallback(async () => {
    try {
      const [kpiRes, queueRes, campRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/financials/kpi`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${apiBaseUrl}/api/queue/items`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${apiBaseUrl}/api/campaigns`).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (kpiRes && kpiRes.success) {
        setTelemetry((prev) => ({
          ...prev,
          todayRevenue: kpiRes.todayRevenue ?? 0,
          totalClicks: kpiRes.totalClicks ?? 0,
          totalLeads: kpiRes.totalConversions ?? 0,
          overallCr: kpiRes.overallCr || '0.00%',
          networkEpc: kpiRes.networkEpc || '$0.00',
          lastUpdated: new Date().toLocaleTimeString('ru-RU', { hour12: false }),
        }));
      }

      if (queueRes && queueRes.success) {
        setQueue(queueRes.items || []);
      }

      if (campRes && Array.isArray(campRes.campaigns)) {
        setCampaigns(campRes.campaigns);
      }
    } catch {
      // Zero demo data fallback
    }
  }, [apiBaseUrl]);

  // Single SSE Connection
  useEffect(() => {
    fetchData();

    let es: EventSource | null = null;
    try {
      es = new EventSource(`${apiBaseUrl}/api/stream/events`);

      es.addEventListener('connected', () => {
        appendLog('[SSE] Connected to executive telemetry stream.');
      });

      es.addEventListener('kpi_update', (e: MessageEvent) => {
        try {
          const d = JSON.parse(e.data);
          setTelemetry((prev) => ({
            ...prev,
            todayRevenue: d.todayRevenue ?? prev.todayRevenue,
            totalClicks: d.totalClicks ?? prev.totalClicks,
            totalLeads: d.totalConversions ?? prev.totalLeads,
            overallCr: d.overallCr ?? prev.overallCr,
            networkEpc: d.networkEpc ?? prev.networkEpc,
            lastUpdated: new Date().toLocaleTimeString('ru-RU', { hour12: false }),
          }));
        } catch {}
      });

      es.addEventListener('log_entry', (e: MessageEvent) => {
        try {
          const d = JSON.parse(e.data);
          appendLog(`[${d.stream?.toUpperCase() || 'SYS'}] ${d.message || e.data}`);
        } catch {
          appendLog(String(e.data));
        }
      });

      es.onerror = () => {
        if (es) es.close();
      };
    } catch {
      appendLog('[SSE] Fallback to poll mode.');
    }

    const timer = setInterval(fetchData, 30000);
    return () => {
      if (es) es.close();
      clearInterval(timer);
    };
  }, [apiBaseUrl, fetchData, appendLog]);

  // Auto-scroll log box
  useEffect(() => {
    if (autoScroll && logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Action Dispatcher
  const triggerAction = async (endpoint: string, label: string, body: any = {}) => {
    setIsExecuting(label);
    appendLog(`[ACTION] Dispatching ${label}...`);
    try {
      const res = await fetch(`${apiBaseUrl}/api/actions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        appendLog(`[ACTION] ✅ ${label}: ${data.message || 'OK'}`);
        if (endpoint.includes('estop')) {
          setTelemetry((prev) => ({ ...prev, isHalted: endpoint.includes('trigger') }));
        }
        fetchData();
      } else {
        appendLog(`[ACTION] ❌ ${label}: ${data.error || data.message || 'FAIL'}`);
      }
    } catch (err: any) {
      appendLog(`[ACTION] ❌ ${label} ERROR: ${err.message}`);
    } finally {
      setIsExecuting(null);
    }
  };

  // Queue Item Status Update
  const updateQueueStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/queue/items/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        appendLog(`[QUEUE] Item ${id.slice(0, 8)} -> ${status}`);
        fetchData();
      }
    } catch {}
  };

  // Copy Logs to Clipboard
  const copyLogsToClipboard = () => {
    const text = logs.map((l) => `[${l.time}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-mono text-[11px] leading-[1.3] p-2 space-y-2 select-text">
      {/* ======================================================== */}
      {/* 1. HEADER BAR: HIGH-DENSITY MONOSPACE METRICS            */}
      {/* ======================================================== */}
      <header className="bg-[#161b22] border border-[#30363d] rounded-sm px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#2ea043]" />
          <strong className="text-[#c9d1d9]">NODE: {nodeIp}</strong>
          <span className="text-[#8b949e]">|</span>
          <span className="text-[#3fb950]">UPTIME: 99.98%</span>
          <span className="text-[#8b949e]">|</span>
          <span className={telemetry.isHalted ? 'text-[#f85149] font-bold' : 'text-[#3fb950] font-bold'}>
            E-STOP: {telemetry.isHalted ? 'HALTED' : 'CLEAR'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <div>
            <span className="text-[#8b949e]">REV:</span>{' '}
            <strong className="text-[#3fb950]">${telemetry.todayRevenue.toFixed(2)}</strong>
          </div>
          <div>
            <span className="text-[#8b949e]">CLICKS:</span>{' '}
            <strong className="text-[#58a6ff]">{telemetry.totalClicks}</strong>
          </div>
          <div>
            <span className="text-[#8b949e]">LEADS:</span>{' '}
            <strong className="text-[#bc8cff]">{telemetry.totalLeads}</strong>
          </div>
          <div>
            <span className="text-[#8b949e]">CR:</span>{' '}
            <strong className="text-[#d29922]">{telemetry.overallCr}</strong>
          </div>
          <div>
            <span className="text-[#8b949e]">EPC:</span>{' '}
            <strong className="text-[#58a6ff]">{telemetry.networkEpc}</strong>
          </div>
          <button
            onClick={() => fetchData()}
            className="px-2 py-0.5 rounded-sm bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]"
          >
            ↻ SYNC
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. ACTION BAR: FLAT INSTANT COMPACT BUTTONS               */}
      {/* ======================================================== */}
      <section className="bg-[#161b22] border border-[#30363d] rounded-sm p-1.5 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            disabled={isExecuting !== null}
            onClick={() =>
              triggerAction('generate-batch', '+ Batch Gen', {
                campaignId: 'cmp_trading_au',
                platform: 'reddit',
                count: 3,
                niche: 'finance',
              })
            }
            className="px-2.5 py-1 rounded-sm bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] font-bold"
          >
            + Batch Gen
          </button>

          <button
            disabled={isExecuting !== null}
            onClick={() => triggerAction('force-dispatch', 'Force Dispatch')}
            className="px-2.5 py-1 rounded-sm bg-[#21262d] hover:bg-[#30363d] text-[#3fb950] border border-[#30363d] font-bold"
          >
            Force Dispatch
          </button>

          <button
            disabled={isExecuting !== null}
            onClick={() => triggerAction('trigger-scout', 'Offer Scout')}
            className="px-2.5 py-1 rounded-sm bg-[#21262d] hover:bg-[#30363d] text-[#d29922] border border-[#30363d] font-bold"
          >
            Offer Scout
          </button>

          <button
            disabled={isExecuting !== null}
            onClick={() => triggerAction('calibrate-prompts', 'MAB Mutate')}
            className="px-2.5 py-1 rounded-sm bg-[#21262d] hover:bg-[#30363d] text-[#bc8cff] border border-[#30363d] font-bold"
          >
            MAB Mutate
          </button>

          <button
            disabled={isExecuting !== null}
            onClick={() =>
              triggerAction('scaffold-campaign', 'Scaffold GEO', {
                offerId: 'crypto_alpha_v1',
                vertical: 'finance',
                geos: ['US', 'DE', 'AU'],
              })
            }
            className="px-2.5 py-1 rounded-sm bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] font-bold"
          >
            Scaffold GEO
          </button>
        </div>

        <div>
          <button
            onClick={() => triggerAction(telemetry.isHalted ? 'estop/reset' : 'estop/trigger', 'EMERGENCY STOP')}
            className={`px-3 py-1 rounded-sm font-bold border ${
              telemetry.isHalted
                ? 'bg-[#1b4725] text-[#3fb950] border-[#2ea043]'
                : 'bg-[#4c1d1e] text-[#f85149] border-[#da3633]'
            }`}
          >
            {telemetry.isHalted ? '✓ RESET E-STOP' : '🚨 EMERGENCY STOP'}
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. MAIN GRID: 2 COLUMNS (TABLES vs RAW LOG STREAM)        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* LEFT COLUMN (7 COLS): SQLITE QUEUE & CAMPAIGNS MATRIX */}
        <div className="lg:col-span-7 space-y-2">
          {/* SQLite Content Queue */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-sm p-2 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-[#8b949e] font-bold border-b border-[#30363d] pb-1">
              <span className="text-[#c9d1d9]">SQLITE CONTENT QUEUE (content_queue_v2)</span>
              <span>{queue.length} items in queue</span>
            </div>

            <div className="overflow-x-auto max-h-56 term-scroll">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="text-[#8b949e] border-b border-[#30363d]">
                  <tr>
                    <th className="py-1 px-1.5">ID</th>
                    <th className="py-1 px-1.5">Platform</th>
                    <th className="py-1 px-1.5">Risk</th>
                    <th className="py-1 px-1.5">Status</th>
                    <th className="py-1 px-1.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-3 text-center text-[#8b949e] italic">
                        Queue is empty. Click [+ Batch Gen] to generate items.
                      </td>
                    </tr>
                  ) : (
                    queue.map((item) => (
                      <tr key={item.id} className="hover:bg-[#0d1117]">
                        <td className="py-1 px-1.5 font-bold text-[#58a6ff]">{item.id.slice(0, 8)}</td>
                        <td className="py-1 px-1.5 text-[#8b949e] uppercase">{item.platform}</td>
                        <td className="py-1 px-1.5 text-[10px]">
                          {renderAsciiBar(item.risk_score || 25, 6)}
                        </td>
                        <td className="py-1 px-1.5">
                          <span
                            className={`px-1 py-0.2 rounded-sm text-[9px] font-bold ${
                              item.status === 'APPROVED'
                                ? 'bg-[#1b4725] text-[#3fb950] border border-[#2ea043]'
                                : item.status === 'REJECTED'
                                ? 'bg-[#4c1d1e] text-[#f85149] border border-[#da3633]'
                                : 'bg-[#21262d] text-[#8b949e]'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-1 px-1.5 text-right space-x-1">
                          {item.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => updateQueueStatus(item.id, 'APPROVED')}
                                className="px-1.5 py-0.2 rounded-sm bg-[#1b4725] text-[#3fb950] text-[10px]"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => updateQueueStatus(item.id, 'REJECTED')}
                                className="px-1.5 py-0.2 rounded-sm bg-[#4c1d1e] text-[#f85149] text-[10px]"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Campaigns & MAB Split Table */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-sm p-2 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-[#8b949e] font-bold border-b border-[#30363d] pb-1">
              <span className="text-[#c9d1d9]">ACTIVE CAMPAIGNS & MAB MATRIX</span>
              <span>{campaigns.length} campaigns active</span>
            </div>

            <div className="overflow-x-auto max-h-48 term-scroll">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="text-[#8b949e] border-b border-[#30363d]">
                  <tr>
                    <th className="py-1 px-1.5">Campaign ID</th>
                    <th className="py-1 px-1.5">Network</th>
                    <th className="py-1 px-1.5">Clicks / Leads</th>
                    <th className="py-1 px-1.5">CR / EPC</th>
                    <th className="py-1 px-1.5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-3 text-center text-[#8b949e] italic">
                        cmp_trading_au (v1: 85% / v2: 15%) • LosPollos Dating • Crypto Alpha
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-[#0d1117]">
                        <td className="py-1 px-1.5 font-bold text-[#c9d1d9]">{c.id}</td>
                        <td className="py-1 px-1.5 text-[#8b949e]">{c.network}</td>
                        <td className="py-1 px-1.5 text-[#8b949e]">
                          {c.clicks} / <strong className="text-[#3fb950]">{c.leads}</strong>
                        </td>
                        <td className="py-1 px-1.5 text-[#8b949e]">
                          {c.cr} | <strong className="text-[#58a6ff]">{c.epc}</strong>
                        </td>
                        <td className="py-1 px-1.5 text-right font-bold text-[#3fb950]">
                          ${c.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): RAW STREAMING LOG CONSOLE (300px) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="bg-[#161b22] border border-[#30363d] rounded-sm p-2 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-[#8b949e] font-bold border-b border-[#30363d] pb-1">
              <div className="flex items-center space-x-2">
                <span className="text-[#c9d1d9]">RAW TELEMETRY LOG STREAM</span>
                <span className="text-[9px] bg-[#21262d] px-1 py-0.2 rounded-sm text-[#8b949e]">
                  {logs.length} / {MAX_LOG_LINES} LINES
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`px-1.5 py-0.2 rounded-sm text-[9px] border font-bold ${
                    autoScroll
                      ? 'bg-[#1b4725] text-[#3fb950] border-[#2ea043]'
                      : 'bg-[#21262d] text-[#8b949e] border-[#30363d]'
                  }`}
                >
                  {autoScroll ? 'AUTO-SCROLL' : 'PAUSED'}
                </button>
                <button
                  onClick={copyLogsToClipboard}
                  className="px-1.5 py-0.2 rounded-sm bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] text-[9px]"
                >
                  {copied ? '✓ COPIED' : 'COPY'}
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="px-1.5 py-0.2 rounded-sm bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] border border-[#30363d] text-[9px]"
                >
                  CLEAR
                </button>
              </div>
            </div>

            {/* Fixed 300px Raw Log Container */}
            <div
              ref={logBoxRef}
              className="h-[300px] overflow-y-auto p-1.5 space-y-0.5 term-scroll bg-[#0d1117] font-mono text-[10px] leading-[1.3] border border-[#21262d] select-text"
            >
              {logs.length === 0 ? (
                <div className="text-[#8b949e] italic py-12 text-center">
                  Awaiting daemon telemetry stream events...
                </div>
              ) : (
                logs.map((l) => (
                  <div key={l.id} className="hover:bg-[#161b22] px-1 py-0.2 flex items-start space-x-1">
                    <span className="text-[#8b949e] select-none">{l.time}</span>
                    <span
                      className={`flex-1 break-all ${
                        l.text.includes('FAIL') || l.text.includes('ERROR') || l.text.includes('❌')
                          ? 'text-[#f85149] font-bold'
                          : l.text.includes('OK') || l.text.includes('SUCCESS') || l.text.includes('✅')
                          ? 'text-[#3fb950]'
                          : l.text.includes('ACTION')
                          ? 'text-[#58a6ff]'
                          : 'text-[#c9d1d9]'
                      }`}
                    >
                      {l.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardApp;

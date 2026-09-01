import React, { useState, useEffect, useRef } from 'react';

export type LogStreamType = 'all' | 'daemon' | 'scheduler' | 'telemetry';
export type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  timestamp: string;
  stream: 'daemon' | 'scheduler' | 'telemetry';
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  raw?: string;
}

export interface UnifiedLogTerminalProps {
  apiBaseUrl?: string;
  maxBufferLines?: number;
  sseEndpoint?: string;
}

export const UnifiedLogTerminal: React.FC<UnifiedLogTerminalProps> = ({
  apiBaseUrl = '',
  maxBufferLines = 200,
  sseEndpoint = '/api/stream/events',
}) => {
  const [activeTab, setActiveTab] = useState<LogStreamType>('all');
  const [levelFilter, setLevelFilter] = useState<LogLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Helper to parse line
  const parseLogLine = (raw: string, stream: 'daemon' | 'scheduler' | 'telemetry'): LogEntry => {
    let level: 'INFO' | 'WARN' | 'ERROR' = 'INFO';
    const lower = raw.toLowerCase();
    if (lower.includes('error') || lower.includes('fail') || lower.includes('fatal') || lower.includes('exception')) {
      level = 'ERROR';
    } else if (lower.includes('warn') || lower.includes('timeout') || lower.includes('retry')) {
      level = 'WARN';
    }

    // Clean ANSI codes
    const cleanText = raw.replace(/\u001b\[[0-9;]*m/g, '');

    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour12: false }),
      stream,
      level,
      message: cleanText,
      raw,
    };
  };

  // Append new logs safely bounded to maxBufferLines
  const appendLogs = (newEntries: LogEntry[]) => {
    setLogs((prev) => {
      const combined = [...prev, ...newEntries];
      if (combined.length > maxBufferLines) {
        return combined.slice(combined.length - maxBufferLines);
      }
      return combined;
    });
  };

  // Initial Fetch & Periodic Sync
  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        const [resDaemon, resOrganic] = await Promise.all([
          fetch(`${apiBaseUrl}/api/logs`).then((r) => (r.ok ? r.json() : { logs: [] })),
          fetch(`${apiBaseUrl}/api/organic/logs`).then((r) => (r.ok ? r.json() : { logs: [] })),
        ]);

        const entries: LogEntry[] = [];
        if (Array.isArray(resDaemon.logs)) {
          for (const line of resDaemon.logs) {
            entries.push(parseLogLine(String(line), 'daemon'));
          }
        }
        if (Array.isArray(resOrganic.logs)) {
          for (const line of resOrganic.logs) {
            entries.push(parseLogLine(String(line), 'scheduler'));
          }
        }

        if (entries.length > 0) {
          appendLogs(entries);
        }
      } catch (err) {
        console.warn('[UnifiedLogTerminal] Initial log fetch warning:', err);
      }
    };

    fetchInitialLogs();
    const interval = setInterval(fetchInitialLogs, 4000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  // Connect SSE
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource(sseEndpoint);
      es.addEventListener('log', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const entry = parseLogLine(data.message || data.text || String(event.data), data.stream || 'daemon');
          appendLogs([entry]);
        } catch {
          const entry = parseLogLine(event.data, 'daemon');
          appendLogs([entry]);
        }
      });
    } catch (e) {
      console.warn('[UnifiedLogTerminal] SSE connection fallback');
    }

    return () => {
      if (es) es.close();
    };
  }, [sseEndpoint]);

  // Handle Auto-scroll
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = logs.filter((l) => {
    if (activeTab !== 'all' && l.stream !== activeTab) return false;
    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false;
    if (searchQuery.trim() && !l.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const clearBuffer = () => {
    setLogs([]);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/90 bg-slate-950/90 backdrop-blur-xl shadow-2xl overflow-hidden font-mono text-xs">
      {/* Console Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 border-b border-slate-800/80 gap-3 bg-slate-900/60">
        {/* Stream Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: '🖥️ All Streams' },
              { id: 'daemon', label: '⚙️ Daemon Ops' },
              { id: 'scheduler', label: '📡 Posting Scheduler' },
              { id: 'telemetry', label: '📊 Postback / Telemetry' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Console Controls & Filters */}
        <div className="flex items-center space-x-2">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LogLevel)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Уровень: ALL</option>
            <option value="INFO">INFO Only</option>
            <option value="WARN">WARN Only</option>
            <option value="ERROR">ERROR Only</option>
          </select>

          {/* Search Query Input */}
          <input
            type="text"
            placeholder="Фильтр по ключевым словам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-sky-300 placeholder-slate-600 focus:outline-none focus:border-sky-500 w-36 sm:w-48"
          />

          {/* Auto-scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded-lg text-[11px] border font-bold transition flex items-center space-x-1 ${
              autoScroll
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span>{autoScroll ? '⬇ Автоскролл' : '⏸ Пауза'}</span>
          </button>

          {/* Clear Button */}
          <button
            onClick={clearBuffer}
            className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            🗑️ Очистить
          </button>
        </div>
      </div>

      {/* Log Output Stream */}
      <div
        ref={logContainerRef}
        className="h-64 sm:h-80 overflow-y-auto p-3.5 space-y-1 term-scroll bg-slate-950/95 font-mono text-[11px] leading-relaxed select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 italic py-8 text-center">Нет записей лога по заданным фильтрам...</div>
        ) : (
          filteredLogs.map((item) => (
            <div key={item.id} className="flex items-start space-x-2 font-mono hover:bg-slate-900/40 px-1.5 py-0.5 rounded">
              <span className="text-slate-600 select-none text-[10px]">{item.timestamp}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase select-none ${
                  item.stream === 'daemon'
                    ? 'bg-sky-950 text-sky-400 border border-sky-800/40'
                    : item.stream === 'scheduler'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                }`}
              >
                {item.stream}
              </span>
              <span
                className={`px-1 py-0.2 rounded text-[9px] font-bold uppercase select-none ${
                  item.level === 'ERROR'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                    : item.level === 'WARN'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {item.level}
              </span>
              <span
                className={`flex-1 break-all whitespace-pre-wrap ${
                  item.level === 'ERROR'
                    ? 'text-rose-300 font-semibold'
                    : item.level === 'WARN'
                    ? 'text-amber-300'
                    : item.message.includes('OK') || item.message.includes('SUCCESS') || item.message.includes('✅')
                    ? 'text-emerald-300'
                    : 'text-slate-300'
                }`}
              >
                {item.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-3.5 py-2 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center space-x-3">
          <span>
            Буфер: <strong className="text-slate-300">{filteredLogs.length}</strong> / {maxBufferLines} строк
          </span>
          <span>
            Поток: <strong className="text-sky-400 uppercase">{activeTab}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse" />
          <span className="text-emerald-400">Стриминг активен (Ring Buffer)</span>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogTerminal;

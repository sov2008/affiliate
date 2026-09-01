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
    <div className="rounded-sm border border-[#30363d] bg-[#161b22] overflow-hidden font-mono text-[11px]">
      {/* Console Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 border-b border-[#30363d] gap-2 bg-[#161b22]">
        {/* Stream Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All Streams' },
              { id: 'daemon', label: 'Daemon Ops' },
              { id: 'scheduler', label: 'Posting Scheduler' },
              { id: 'telemetry', label: 'Postback / Telemetry' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-0.5 rounded-sm text-[11px] font-bold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#21262d] text-[#58a6ff] border border-[#58a6ff]'
                  : 'bg-[#0d1117] text-[#8b949e] hover:text-[#c9d1d9] border border-[#30363d]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Console Controls & Filters */}
        <div className="flex items-center space-x-1.5">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LogLevel)}
            className="bg-[#0d1117] border border-[#30363d] rounded-sm px-2 py-0.5 text-[10px] text-[#c9d1d9] focus:outline-none"
          >
            <option value="ALL">ALL</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>

          {/* Search Query Input */}
          <input
            type="text"
            placeholder="Filter keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded-sm px-2 py-0.5 text-[10px] text-[#58a6ff] placeholder-[#8b949e] focus:outline-none w-32 sm:w-40"
          />

          {/* Auto-scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-0.5 rounded-sm text-[10px] border font-bold ${
              autoScroll
                ? 'bg-[#1b4725] border-[#2ea043] text-[#3fb950]'
                : 'bg-[#21262d] border-[#30363d] text-[#8b949e]'
            }`}
          >
            {autoScroll ? 'AUTO-SCROLL' : 'PAUSED'}
          </button>

          {/* Clear Button */}
          <button
            onClick={clearBuffer}
            className="px-2 py-0.5 rounded-sm text-[10px] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Log Output Stream */}
      <div
        ref={logContainerRef}
        className="h-64 sm:h-72 overflow-y-auto p-2 space-y-0.5 term-scroll bg-[#0d1117] font-mono text-[11px] leading-[1.3] select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-[#8b949e] italic py-6 text-center">No log entries for specified stream filters...</div>
        ) : (
          filteredLogs.map((item) => (
            <div key={item.id} className="flex items-start space-x-1.5 font-mono hover:bg-[#161b22] px-1 py-0.2 rounded-none">
              <span className="text-[#8b949e] select-none text-[10px]">{item.timestamp}</span>
              <span
                className={`px-1 py-0 rounded-sm text-[9px] font-bold uppercase select-none ${
                  item.stream === 'daemon'
                    ? 'bg-[#1f242c] text-[#58a6ff] border border-[#30363d]'
                    : item.stream === 'scheduler'
                    ? 'bg-[#1f242c] text-[#bc8cff] border border-[#30363d]'
                    : 'bg-[#1f242c] text-[#3fb950] border border-[#30363d]'
                }`}
              >
                {item.stream}
              </span>
              <span
                className={`px-1 py-0 rounded-sm text-[9px] font-bold uppercase select-none ${
                  item.level === 'ERROR'
                    ? 'bg-[#4c1d1e] text-[#f85149] border border-[#f85149]'
                    : item.level === 'WARN'
                    ? 'bg-[#3b2e04] text-[#d29922] border border-[#d29922]'
                    : 'bg-[#21262d] text-[#8b949e]'
                }`}
              >
                {item.level}
              </span>
              <span
                className={`flex-1 break-all whitespace-pre-wrap ${
                  item.level === 'ERROR'
                    ? 'text-[#f85149] font-semibold'
                    : item.level === 'WARN'
                    ? 'text-[#d29922]'
                    : item.message.includes('OK') || item.message.includes('SUCCESS') || item.message.includes('✅')
                    ? 'text-[#3fb950]'
                    : 'text-[#c9d1d9]'
                }`}
              >
                {item.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-2.5 py-1.5 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between text-[10px] text-[#8b949e] font-mono">
        <div className="flex items-center space-x-3">
          <span>
            BUFFER: <strong className="text-[#c9d1d9]">{filteredLogs.length}</strong> / {maxBufferLines} LINES
          </span>
          <span>
            STREAM: <strong className="text-[#58a6ff] uppercase">{activeTab}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043]" />
          <span className="text-[#3fb950]">RING BUFFER ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogTerminal;

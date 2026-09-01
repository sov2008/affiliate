import { useState, useEffect, useCallback, useRef } from 'react';

export interface TelemetryKpiEvent {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueDeltaPct: string;
  networkEpc: string;
  overallCr: string;
  totalClicks: number;
  totalConversions: number;
  bundlesTracked: number;
  lastUpdated: string;
}

export interface BundleCreatedEvent {
  id: string;
  platform: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  complianceScore: number;
  headline?: string;
  createdAt: string;
}

export interface PostDispatchedEvent {
  postId: string;
  platform: string;
  destination: string;
  dispatchedAt: string;
}

export interface LogEntryEvent {
  stream: 'daemon' | 'scheduler' | 'telemetry';
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
}

export interface TelemetryStreamState {
  isConnected: boolean;
  lastHeartbeat: string | null;
  kpi: TelemetryKpiEvent | null;
  latestBundle: BundleCreatedEvent | null;
  latestDispatchedPost: PostDispatchedEvent | null;
  latestLog: LogEntryEvent | null;
}

export interface UseTelemetryStreamOptions {
  apiBaseUrl?: string;
  sseEndpoint?: string;
  heartbeatIntervalMs?: number;
  onKpiUpdate?: (kpi: TelemetryKpiEvent) => void;
  onBundleCreated?: (bundle: BundleCreatedEvent) => void;
  onPostDispatched?: (post: PostDispatchedEvent) => void;
  onLogEntry?: (log: LogEntryEvent) => void;
}

/**
 * useTelemetryStream
 * Centralized SSE stream hook connecting once to /api/stream/events
 * Eliminates redundant widget intervals by dispatching typed events with a 30s heartbeat fallback.
 */
export function useTelemetryStream(options: UseTelemetryStreamOptions = {}) {
  const {
    apiBaseUrl = '',
    sseEndpoint = '/api/stream/events',
    heartbeatIntervalMs = 30000,
    onKpiUpdate,
    onBundleCreated,
    onPostDispatched,
    onLogEntry,
  } = options;

  const [state, setState] = useState<TelemetryStreamState>({
    isConnected: false,
    lastHeartbeat: null,
    kpi: null,
    latestBundle: null,
    latestDispatchedPost: null,
    latestLog: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Manual trigger for refresh
  const triggerFetchFallback = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/financials/kpi`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const kpi: TelemetryKpiEvent = {
            todayRevenue: json.todayRevenue ?? 0,
            yesterdayRevenue: json.yesterdayRevenue ?? 0,
            revenueDeltaPct: json.revenueDeltaPct ?? '0.0%',
            networkEpc: json.networkEpc || '$0.00',
            overallCr: json.overallCr || '0.00%',
            totalClicks: json.totalClicks ?? 0,
            totalConversions: json.totalConversions ?? 0,
            bundlesTracked: json.bundlesTracked ?? 0,
            lastUpdated: new Date().toLocaleTimeString('ru-RU', { hour12: false }),
          };
          setState((prev) => ({ ...prev, kpi, lastHeartbeat: new Date().toISOString() }));
          onKpiUpdate?.(kpi);
        }
      }
    } catch {
      // Under zero demo data rule, maintain silent zeros
    }
  }, [apiBaseUrl, onKpiUpdate]);

  useEffect(() => {
    let isMounted = true;

    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        const url = `${apiBaseUrl}${sseEndpoint}`;
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.addEventListener('open', () => {
          if (!isMounted) return;
          setState((prev) => ({ ...prev, isConnected: true, lastHeartbeat: new Date().toISOString() }));
        });

        es.addEventListener('heartbeat', (e: MessageEvent) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(e.data);
            setState((prev) => ({ ...prev, isConnected: true, lastHeartbeat: data.timestamp || new Date().toISOString() }));
          } catch {
            setState((prev) => ({ ...prev, isConnected: true, lastHeartbeat: new Date().toISOString() }));
          }
        });

        es.addEventListener('kpi_update', (e: MessageEvent) => {
          if (!isMounted) return;
          try {
            const kpi: TelemetryKpiEvent = JSON.parse(e.data);
            setState((prev) => ({ ...prev, kpi, lastHeartbeat: new Date().toISOString() }));
            onKpiUpdate?.(kpi);
          } catch (err) {
            console.warn('[useTelemetryStream] Failed to parse kpi_update event', err);
          }
        });

        es.addEventListener('bundle_created', (e: MessageEvent) => {
          if (!isMounted) return;
          try {
            const bundle: BundleCreatedEvent = JSON.parse(e.data);
            setState((prev) => ({ ...prev, latestBundle: bundle }));
            onBundleCreated?.(bundle);
          } catch (err) {
            console.warn('[useTelemetryStream] Failed to parse bundle_created event', err);
          }
        });

        es.addEventListener('post_dispatched', (e: MessageEvent) => {
          if (!isMounted) return;
          try {
            const post: PostDispatchedEvent = JSON.parse(e.data);
            setState((prev) => ({ ...prev, latestDispatchedPost: post }));
            onPostDispatched?.(post);
          } catch (err) {
            console.warn('[useTelemetryStream] Failed to parse post_dispatched event', err);
          }
        });

        es.addEventListener('log_entry', (e: MessageEvent) => {
          if (!isMounted) return;
          try {
            const log: LogEntryEvent = JSON.parse(e.data);
            setState((prev) => ({ ...prev, latestLog: log }));
            onLogEntry?.(log);
          } catch (err) {
            console.warn('[useTelemetryStream] Failed to parse log_entry event', err);
          }
        });

        es.onerror = () => {
          if (!isMounted) return;
          setState((prev) => ({ ...prev, isConnected: false }));
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          // Reconnect backoff
          if (!reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              if (isMounted) connectSSE();
            }, 5000);
          }
        };
      } catch (err) {
        if (isMounted) setState((prev) => ({ ...prev, isConnected: false }));
      }
    };

    // Initial fetch and connect
    triggerFetchFallback();
    connectSSE();

    // 30-second heartbeat check / fallback polling
    const heartbeatTimer = setInterval(() => {
      if (!state.isConnected) {
        triggerFetchFallback();
      }
    }, heartbeatIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(heartbeatTimer);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [apiBaseUrl, sseEndpoint, heartbeatIntervalMs, triggerFetchFallback, onKpiUpdate, onBundleCreated, onPostDispatched, onLogEntry]);

  return {
    ...state,
    refreshKpi: triggerFetchFallback,
  };
}

export default useTelemetryStream;

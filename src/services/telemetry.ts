/**
 * DeepTrace Telemetry & Conversion Tracking Service
 * Dual-dispatch: Umami Analytics + Cloudflare Postback Engine Telemetry
 * Complies with STRICT ZERO DEMO DATA RULE (only real browser/network events)
 */

export const TELEMETRY_CAMPAIGN_ID = 'deeptrace_forensics';
export const CLOUDFLARE_TELEMETRY_ENDPOINT = 'https://postback-engine.sov7.workers.dev/telemetry';
export const CLOUDFLARE_CLICK_ENDPOINT = 'https://postback-engine.sov7.workers.dev/click';

export type DeepTraceEventName =
  | 'deeptrace_scan_started'
  | 'deeptrace_scan_completed'
  | 'deeptrace_scan_failed'
  | 'deeptrace_challenge_copied'
  | 'deeptrace_share_clicked'
  | 'deeptrace_monetization_clicked';

export interface DeepTraceEventData {
  campaign_id?: string;
  case_ref?: string;
  platform?: string;
  risk_level?: string;
  trust_score?: number;
  latency_ms?: number;
  error_code?: string;
  error_message?: string;
  challenge_type?: string;
  priority?: string;
  question_id?: string;
  share_type?: string;
  location?: string;
  destination?: string;
  source?: string;
  click_id?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface TelemetryPayload extends DeepTraceEventData {
  campaign_id: string;
  event: DeepTraceEventName;
  timestamp: string;
}

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

/**
 * Retrieves existing or generates a new unique Click ID (CID)
 * Persisted in sessionStorage / localStorage for attribution continuity.
 */
export function getOrCreateClickId(): string {
  if (typeof window === 'undefined') {
    return 'fc_srv_' + Date.now().toString(36);
  }

  try {
    // 1. Check URL search params for cid / click_id
    const params = new URLSearchParams(window.location.search);
    const urlCid = params.get('click_id') || params.get('cid');
    if (urlCid) {
      window.sessionStorage.setItem('flirtcheck_cid', urlCid);
      return urlCid;
    }

    // 2. Check storage
    const stored = window.sessionStorage.getItem('flirtcheck_cid') || window.localStorage.getItem('flirtcheck_cid');
    if (stored) {
      return stored;
    }

    // 3. Generate genuine client-side click id
    const newCid = 'fc_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    window.sessionStorage.setItem('flirtcheck_cid', newCid);
    return newCid;
  } catch {
    return 'fc_' + Date.now().toString(36);
  }
}

/**
 * Builds standard Cloudflare postback click URL for monetization CTAs
 */
export function buildMonetizationClickUrl(options?: {
  riskLevel?: string;
  platform?: string;
  clickId?: string;
  source?: string;
}): string {
  const clickId = options?.clickId || getOrCreateClickId();
  const sub1 = options?.source || 'deeptrace';
  const sub2 = options?.riskLevel || 'unknown';
  const sub3 = options?.platform || 'web';

  const url = new URL(CLOUDFLARE_CLICK_ENDPOINT);
  url.searchParams.set('click_id', clickId);
  url.searchParams.set('sub1', sub1);
  url.searchParams.set('sub2', sub2);
  url.searchParams.set('sub3', sub3);

  return url.toString();
}

/**
 * Formats a valid telemetry payload ensuring strict typing and ISO timestamp
 */
export function formatTelemetryPayload(
  eventName: DeepTraceEventName,
  data: DeepTraceEventData = {}
): TelemetryPayload {
  return {
    campaign_id: data.campaign_id || TELEMETRY_CAMPAIGN_ID,
    event: eventName,
    case_ref: data.case_ref,
    platform: data.platform,
    risk_level: data.risk_level,
    trust_score: data.trust_score,
    timestamp: new Date().toISOString(),
    ...data
  };
}

/**
 * Dispatches event to Umami and Cloudflare Worker Telemetry
 * Safe in both SSR and Browser environments (failsafe, never throws).
 */
export async function trackEvent(
  eventName: DeepTraceEventName,
  data: DeepTraceEventData = {}
): Promise<TelemetryPayload> {
  const payload = formatTelemetryPayload(eventName, data);

  if (typeof window === 'undefined') {
    return payload;
  }

  // 1. Dispatch to Umami if present
  try {
    if (typeof window.umami?.track === 'function') {
      window.umami.track(eventName, payload as Record<string, any>);
    }
  } catch (umamiErr) {
    // Non-blocking
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Telemetry] Umami track skipped/failed:', umamiErr);
    }
  }

  // 2. Dispatch to Cloudflare Worker telemetry endpoint
  try {
    const jsonPayload = JSON.stringify(payload);

    // Try Beacon API first (safest during unloads/navigation)
    let beaconSent = false;
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([jsonPayload], { type: 'application/json' });
      beaconSent = navigator.sendBeacon(CLOUDFLARE_TELEMETRY_ENDPOINT, blob);
    }

    // Fallback to fetch if beacon wasn't accepted or unavailable
    if (!beaconSent && typeof fetch === 'function') {
      fetch(CLOUDFLARE_TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: jsonPayload,
        keepalive: true
      }).catch((fetchErr) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Telemetry] Cloudflare fetch dispatch warning:', fetchErr);
        }
      });
    }
  } catch (workerErr) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Telemetry] Worker dispatch error:', workerErr);
    }
  }

  return payload;
}

/**
 * Convenience helper: Scan Started
 */
export function trackScanStarted(params: {
  platform?: string;
  location?: string;
  source?: string;
}): Promise<TelemetryPayload> {
  return trackEvent('deeptrace_scan_started', {
    platform: params.platform,
    location: params.location,
    source: params.source || 'web_uploader'
  });
}

/**
 * Convenience helper: Scan Completed
 */
export function trackScanCompleted(params: {
  caseRef: string;
  riskLevel: string;
  trustScore: number;
  latencyMs?: number;
  platform?: string;
}): Promise<TelemetryPayload> {
  return trackEvent('deeptrace_scan_completed', {
    case_ref: params.caseRef,
    risk_level: params.riskLevel,
    trust_score: params.trustScore,
    latency_ms: params.latencyMs,
    platform: params.platform
  });
}

/**
 * Convenience helper: Scan Failed
 */
export function trackScanFailed(params: {
  errorCode?: string;
  errorMessage: string;
  platform?: string;
}): Promise<TelemetryPayload> {
  return trackEvent('deeptrace_scan_failed', {
    error_code: params.errorCode || 'UNKNOWN_ERROR',
    error_message: params.errorMessage,
    platform: params.platform
  });
}

/**
 * Convenience helper: Challenge Copied
 */
export function trackChallengeCopied(params: {
  challengeType: string;
  priority: string;
  questionId?: string;
  caseRef?: string;
}): Promise<TelemetryPayload> {
  return trackEvent('deeptrace_challenge_copied', {
    challenge_type: params.challengeType,
    priority: params.priority,
    question_id: params.questionId,
    case_ref: params.caseRef
  });
}

/**
 * Convenience helper: Share Clicked
 */
export function trackShareClicked(params: {
  shareType: string;
  caseRef?: string;
  riskLevel?: string;
  trustScore?: number;
}): Promise<TelemetryPayload> {
  return trackEvent('deeptrace_share_clicked', {
    share_type: params.shareType,
    case_ref: params.caseRef,
    risk_level: params.riskLevel,
    trust_score: params.trustScore
  });
}

/**
 * Convenience helper: Monetization / Partner Link Clicked
 */
export function trackMonetizationClicked(params: {
  destination?: string;
  riskLevel?: string;
  platform?: string;
  caseRef?: string;
  clickId?: string;
}): Promise<TelemetryPayload> {
  return trackEvent('deeptrace_monetization_clicked', {
    destination: params.destination,
    risk_level: params.riskLevel,
    platform: params.platform,
    case_ref: params.caseRef,
    click_id: params.clickId || getOrCreateClickId()
  });
}

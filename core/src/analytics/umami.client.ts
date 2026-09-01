import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export interface UmamiStats {
  pageviews: { value: number; change: number };
  visitors: { value: number; change: number };
  visits: { value: number; change: number };
  bounces: { value: number; change: number };
  totaltime: { value: number; change: number };
}

export interface UmamiEventItem {
  x: string; // Event name (e.g. 'quiz_step_view', 'quiz_completed')
  t: string; // Timestamp
  y: number; // Count
}

export interface UmamiMetricItem {
  x: string; // Referrer / URL / Country
  y: number; // Count
}

export interface FunnelStepData {
  stepName: string;
  count: number;
  dropoffRatePct: number;
  conversionRatePct: number;
}

export interface UmamiFunnelSummary {
  websiteId: string;
  totalVisitors: number;
  totalPageviews: number;
  steps: FunnelStepData[];
  overallConversionRatePct: number;
  topReferrers: { source: string; count: number; sharePct: number }[];
  cachedAt: number;
}

export class UmamiClient {
  private static instance: UmamiClient;
  private baseUrl: string;
  private username: string;
  private password: string;
  private authToken: string | null = null;
  private tokenExpiresAt: number = 0;

  // In-memory cache to prevent hammering the Umami API
  private cache: Map<string, { data: unknown; expiresAt: number }> = new Map();
  private readonly CACHE_TTL_MS = 15_000; // 15 seconds

  private constructor() {
    this.baseUrl = process.env.UMAMI_API_URL || process.env.UMAMI_HOST || 'http://178.128.199.28:3000';
    this.username = process.env.UMAMI_USER || 'admin';
    this.password = process.env.UMAMI_PASSWORD || 'umami';
  }

  public static getInstance(): UmamiClient {
    if (!UmamiClient.instance) {
      UmamiClient.instance = new UmamiClient();
    }
    return UmamiClient.instance;
  }

  /**
   * Authenticates with Umami instance and stores session bearer token.
   */
  public async authenticate(): Promise<string | null> {
    const now = Date.now();
    if (this.authToken && this.tokenExpiresAt > now + 60_000) {
      return this.authToken;
    }

    try {
      const loginUrl = `${this.baseUrl}/api/auth/login`;
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        console.warn(`[UmamiClient] Authentication failed: ${res.status} ${res.statusText}`);
        return null;
      }

      const data = (await res.json()) as { token?: string };
      if (data && data.token) {
        this.authToken = data.token;
        this.tokenExpiresAt = now + 24 * 60 * 60 * 1000; // 24h validity
        return this.authToken;
      }
      return null;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[UmamiClient] Connection to Umami server failed (${this.baseUrl}):`, errorMsg);
      return null;
    }
  }

  /**
   * Fetches website stats (pageviews, visitors, bounces, totaltime).
   * Strict Zero Demo Data Rule: Returns real zero data when offline or no traffic.
   */
  public async getStats(
    websiteId: string,
    startAt: number = Date.now() - 24 * 60 * 60 * 1000,
    endAt: number = Date.now()
  ): Promise<UmamiStats> {
    const cacheKey = `stats_${websiteId}_${startAt}_${endAt}`;
    const cached = this.getCache<UmamiStats>(cacheKey);
    if (cached) return cached;

    const fallback: UmamiStats = {
      pageviews: { value: 0, change: 0 },
      visitors: { value: 0, change: 0 },
      visits: { value: 0, change: 0 },
      bounces: { value: 0, change: 0 },
      totaltime: { value: 0, change: 0 },
    };

    const token = await this.authenticate();
    if (!token) return fallback;

    try {
      const url = `${this.baseUrl}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return fallback;
      const data = (await res.json()) as UmamiStats;
      const result = {
        pageviews: data.pageviews || { value: 0, change: 0 },
        visitors: data.visitors || { value: 0, change: 0 },
        visits: data.visits || { value: 0, change: 0 },
        bounces: data.bounces || { value: 0, change: 0 },
        totaltime: data.totaltime || { value: 0, change: 0 },
      };

      this.setCache(cacheKey, result);
      return result;
    } catch {
      return fallback;
    }
  }

  /**
   * Fetches custom events (e.g. quiz_step_view, quiz_completed)
   */
  public async getEvents(
    websiteId: string,
    startAt: number = Date.now() - 24 * 60 * 60 * 1000,
    endAt: number = Date.now()
  ): Promise<UmamiEventItem[]> {
    const cacheKey = `events_${websiteId}_${startAt}_${endAt}`;
    const cached = this.getCache<UmamiEventItem[]>(cacheKey);
    if (cached) return cached;

    const token = await this.authenticate();
    if (!token) return [];

    try {
      const url = `${this.baseUrl}/api/websites/${websiteId}/events?startAt=${startAt}&endAt=${endAt}&unit=hour`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return [];
      const data = (await res.json()) as UmamiEventItem[];
      const result = Array.isArray(data) ? data : [];
      this.setCache(cacheKey, result);
      return result;
    } catch {
      return [];
    }
  }

  /**
   * Fetches metrics (e.g. top referrers, devices, countries).
   */
  public async getMetrics(
    websiteId: string,
    type: 'referrer' | 'url' | 'country' | 'device' | 'browser' = 'referrer',
    startAt: number = Date.now() - 24 * 60 * 60 * 1000,
    endAt: number = Date.now()
  ): Promise<UmamiMetricItem[]> {
    const cacheKey = `metrics_${websiteId}_${type}_${startAt}_${endAt}`;
    const cached = this.getCache<UmamiMetricItem[]>(cacheKey);
    if (cached) return cached;

    const token = await this.authenticate();
    if (!token) return [];

    try {
      const url = `${this.baseUrl}/api/websites/${websiteId}/metrics?type=${type}&startAt=${startAt}&endAt=${endAt}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return [];
      const data = (await res.json()) as UmamiMetricItem[];
      const result = Array.isArray(data) ? data : [];
      this.setCache(cacheKey, result);
      return result;
    } catch {
      return [];
    }
  }

  /**
   * Aggregates real-time pre-lander funnel progression:
   * Step 1 (Land) -> Quiz Complete -> CTA Click
   */
  public async getFunnelSummary(
    websiteId: string,
    startAt: number = Date.now() - 24 * 60 * 60 * 1000,
    endAt: number = Date.now()
  ): Promise<UmamiFunnelSummary> {
    const cacheKey = `funnel_${websiteId}_${startAt}_${endAt}`;
    const cached = this.getCache<UmamiFunnelSummary>(cacheKey);
    if (cached) return cached;

    const [stats, events, referrers] = await Promise.all([
      this.getStats(websiteId, startAt, endAt),
      this.getEvents(websiteId, startAt, endAt),
      this.getMetrics(websiteId, 'referrer', startAt, endAt),
    ]);

    const visitors = stats.visitors.value || 0;
    const pageviews = stats.pageviews.value || 0;

    // Count milestone occurrences
    let step1Views = 0;
    let quizCompleted = 0;

    for (const ev of events) {
      const name = ev.x.toLowerCase();
      if (name.includes('quiz_step_view') || name.includes('step_1')) {
        step1Views += ev.y || 1;
      } else if (name.includes('quiz_completed') || name.includes('offer_redirect')) {
        quizCompleted += ev.y || 1;
      }
    }

    // Default step 1 count to visitors if event tracking wasn't explicitly triggered
    if (step1Views === 0 && visitors > 0) {
      step1Views = visitors;
    }

    const step1Count = step1Views;
    const step2Count = quizCompleted;
    const ctaClickCount = quizCompleted; // Redirection on completion

    const step1Conv = step1Count > 0 ? 100 : 0;
    const step2Conv = step1Count > 0 ? Math.round((step2Count / step1Count) * 1000) / 10 : 0;
    const ctaConv = step1Count > 0 ? Math.round((ctaClickCount / step1Count) * 1000) / 10 : 0;

    const funnelSteps: FunnelStepData[] = [
      {
        stepName: '1. Просмотр прелендера (Land / Step 1)',
        count: step1Count,
        dropoffRatePct: 0,
        conversionRatePct: step1Conv,
      },
      {
        stepName: '2. Прохождение квиза (Quiz Completed)',
        count: step2Count,
        dropoffRatePct: Math.max(0, 100 - step2Conv),
        conversionRatePct: step2Conv,
      },
      {
        stepName: '3. Переход на оффер (CTA Redirect)',
        count: ctaClickCount,
        dropoffRatePct: Math.max(0, step2Conv - ctaConv),
        conversionRatePct: ctaConv,
      },
    ];

    const totalReferrerCount = referrers.reduce((acc, r) => acc + (r.y || 0), 0);
    const topReferrers = referrers.slice(0, 5).map((r) => ({
      source: r.x || 'Прямой трафик (Direct)',
      count: r.y || 0,
      sharePct: totalReferrerCount > 0 ? Math.round(((r.y || 0) / totalReferrerCount) * 100) : 0,
    }));

    const result: UmamiFunnelSummary = {
      websiteId,
      totalVisitors: visitors,
      totalPageviews: pageviews,
      steps: funnelSteps,
      overallConversionRatePct: ctaConv,
      topReferrers,
      cachedAt: Date.now(),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  private getCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }
}

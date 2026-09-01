import path from 'path';
import dotenv from 'dotenv';
import axios, { AxiosRequestConfig } from 'axios';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
  geo?: string; // Country code (e.g. 'US', 'AU', 'DE', 'UK')
  tag?: string;
}

export interface ProxyMetrics {
  server: string;
  geo?: string;
  latencyMs: number;
  lastCheckedAt: string;
  isHealthy: boolean;
  consecutiveFailures: number;
  blacklistedUntil?: number;
  blacklistReason?: string;
}

export class ProxyRotator {
  private proxies: ProxyConfig[] = [];
  private currentIndex: number = 0;
  private blacklistedUntil: Map<string, number> = new Map();
  private metrics: Map<string, ProxyMetrics> = new Map();
  private defaultBlacklistDurationMs: number = 30 * 60 * 1000; // 30 minutes
  private maxAllowedLatencyMs: number = 3000; // 3000ms threshold

  constructor(initialPool?: string) {
    this.reloadProxies(initialPool);
  }

  /**
   * Generates a unique identifying key for a proxy configuration
   */
  public getProxyKey(proxy: ProxyConfig): string {
    const geoTag = proxy.geo ? `:${proxy.geo}` : '';
    return `${proxy.server}${proxy.username ? `@${proxy.username}` : ''}${geoTag}`;
  }

  /**
   * Parses raw proxy URL string and extracts server, auth, and geo metadata
   */
  public parseProxyUrl(raw: string): ProxyConfig | null {
    try {
      const clean = raw.trim();
      if (!clean) return null;

      // Extract hash or query parameters for explicit geo tag
      let geo: string | undefined;
      let workingStr = clean;

      if (workingStr.includes('#')) {
        const parts = workingStr.split('#');
        workingStr = parts[0];
        const hash = parts[1].trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(hash)) {
          geo = hash;
        } else if (hash.startsWith('GEO=')) {
          geo = hash.replace('GEO=', '');
        }
      }

      const url = new URL(workingStr.includes('://') ? workingStr : `http://${workingStr}`);
      const server = `${url.protocol}//${url.hostname}:${url.port || (url.protocol === 'https:' ? '443' : '80')}`;
      const username = url.username ? decodeURIComponent(url.username) : undefined;
      const password = url.password ? decodeURIComponent(url.password) : undefined;

      // Check query parameter ?country=US or ?geo=AU
      if (!geo && url.searchParams.has('country')) {
        geo = url.searchParams.get('country')?.toUpperCase();
      }
      if (!geo && url.searchParams.has('geo')) {
        geo = url.searchParams.get('geo')?.toUpperCase();
      }

      // Check username conventions (e.g. user-country-US or user_country_DE or customer-zone-us)
      if (!geo && username) {
        const userMatch = username.match(/(?:country|geo|zone)[-_]([a-zA-Z]{2})/i);
        if (userMatch && userMatch[1]) {
          geo = userMatch[1].toUpperCase();
        }
      }

      // Check hostname subdomain conventions (e.g. us.proxy.com, au-node.residential.io)
      if (!geo) {
        const hostSub = url.hostname.split('.')[0].toLowerCase();
        const subMatch = hostSub.match(/^([a-z]{2})(?:[-_].*)?$/i);
        if (subMatch && ['us', 'au', 'de', 'uk', 'gb', 'ca', 'fr', 'es', 'it', 'nl', 'br', 'in', 'jp'].includes(subMatch[1])) {
          geo = subMatch[1] === 'gb' ? 'UK' : subMatch[1].toUpperCase();
        }
      }

      return {
        server,
        username,
        password,
        geo: geo?.toUpperCase(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Reloads proxy list from environment variable or custom raw string
   */
  public reloadProxies(customPool?: string): void {
    const rawPool = customPool !== undefined ? customPool : process.env.PROXY_POOL || '';
    this.proxies = rawPool
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => this.parseProxyUrl(p))
      .filter((p): p is ProxyConfig => p !== null);
  }

  /**
   * Explicitly adds a proxy config to the active pool
   */
  public addProxy(proxy: ProxyConfig | string): void {
    const parsed = typeof proxy === 'string' ? this.parseProxyUrl(proxy) : proxy;
    if (parsed) {
      this.proxies.push(parsed);
    }
  }

  /**
   * Returns list of configured proxies
   */
  public getProxies(): ProxyConfig[] {
    return [...this.proxies];
  }

  public getProxyCount(): number {
    return this.proxies.length;
  }

  /**
   * Checks if a proxy is currently temporarily blacklisted
   */
  public isBlacklisted(proxy: ProxyConfig): boolean {
    const key = this.getProxyKey(proxy);
    const expireTime = this.blacklistedUntil.get(key);
    if (!expireTime) return false;

    if (Date.now() >= expireTime) {
      this.blacklistedUntil.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Temporarily blacklists a proxy node (e.g. on timeout or CAPTCHA)
   */
  public blacklistProxy(proxy: ProxyConfig, durationMs?: number, reason: string = 'Probe failure'): void {
    const key = this.getProxyKey(proxy);
    const duration = durationMs ?? this.defaultBlacklistDurationMs;
    const expiresAt = Date.now() + duration;
    this.blacklistedUntil.set(key, expiresAt);

    const m = this.metrics.get(key) || {
      server: proxy.server,
      geo: proxy.geo,
      latencyMs: 9999,
      lastCheckedAt: new Date().toISOString(),
      isHealthy: false,
      consecutiveFailures: 0,
    };

    m.isHealthy = false;
    m.consecutiveFailures++;
    m.blacklistedUntil = expiresAt;
    m.blacklistReason = reason;
    this.metrics.set(key, m);

    const mins = Math.round(duration / 60000);
    console.warn(`\x1b[33m[ProxyRotator]\x1b[0m Blacklisted proxy ${proxy.server} (${proxy.geo || 'GEN'}) for ${mins}m. Reason: ${reason}`);
  }

  /**
   * Manually un-blacklists a proxy
   */
  public unblacklistProxy(proxy: ProxyConfig): void {
    const key = this.getProxyKey(proxy);
    this.blacklistedUntil.delete(key);
  }

  /**
   * Clears all active blacklists
   */
  public clearBlacklist(): void {
    this.blacklistedUntil.clear();
  }

  private updateMetrics(proxy: ProxyConfig, latencyMs: number, isHealthy: boolean): void {
    const key = this.getProxyKey(proxy);
    const existing = this.metrics.get(key) || {
      server: proxy.server,
      geo: proxy.geo,
      latencyMs,
      lastCheckedAt: new Date().toISOString(),
      isHealthy,
      consecutiveFailures: 0,
    };

    existing.latencyMs = latencyMs;
    existing.lastCheckedAt = new Date().toISOString();
    existing.isHealthy = isHealthy;
    if (isHealthy) {
      existing.consecutiveFailures = 0;
      existing.blacklistedUntil = undefined;
      existing.blacklistReason = undefined;
    } else {
      existing.consecutiveFailures++;
    }

    this.metrics.set(key, existing);
  }

  /**
   * Probes proxy connectivity and latency against target endpoint
   */
  public async validateProxy(
    proxy: ProxyConfig,
    targetUrl: string = 'https://www.reddit.com/api/v1/me',
    timeoutMs: number = 4000
  ): Promise<boolean> {
    const startTime = Date.now();

    try {
      const parsedServer = new URL(proxy.server);
      const host = parsedServer.hostname;
      const port = Number(parsedServer.port) || (parsedServer.protocol === 'https:' ? 443 : 80);

      const axiosConfig: AxiosRequestConfig = {
        timeout: timeoutMs,
        validateStatus: () => true, // Any HTTP response indicates proxy network reachability
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        proxy: {
          protocol: parsedServer.protocol.replace(':', ''),
          host,
          port,
          auth: proxy.username
            ? {
                username: proxy.username,
                password: proxy.password || '',
              }
            : undefined,
        },
      };

      await axios.get(targetUrl, axiosConfig);
      const latencyMs = Date.now() - startTime;

      if (latencyMs > this.maxAllowedLatencyMs) {
        this.blacklistProxy(proxy, this.defaultBlacklistDurationMs, `High latency: ${latencyMs}ms > ${this.maxAllowedLatencyMs}ms`);
        this.updateMetrics(proxy, latencyMs, false);
        return false;
      }

      this.updateMetrics(proxy, latencyMs, true);
      this.unblacklistProxy(proxy);
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const latencyMs = Date.now() - startTime;
      this.blacklistProxy(proxy, this.defaultBlacklistDurationMs, `Connection error: ${errorMsg}`);
      this.updateMetrics(proxy, latencyMs, false);
      return false;
    }
  }

  /**
   * Retrieves next available healthy proxy (round-robin)
   */
  public getNextProxy(): ProxyConfig | undefined {
    if (this.proxies.length === 0) return undefined;

    const available = this.proxies.filter((p) => !this.isBlacklisted(p));
    if (available.length === 0) {
      console.warn('\x1b[33m[ProxyRotator]\x1b[0m All proxies in pool are currently blacklisted. Returning undefined.');
      return undefined;
    }

    const proxy = available[this.currentIndex % available.length];
    this.currentIndex++;
    return proxy;
  }

  /**
   * Selects a dedicated proxy matching the campaign target geo (US, AU, DE, UK)
   * Falls back to general pool if fallbackToAny is true.
   */
  public getProxyForGeo(targetGeo: string, fallbackToAny: boolean = true): ProxyConfig | undefined {
    if (this.proxies.length === 0) return undefined;

    const normalizedGeo = targetGeo.toUpperCase().trim();
    const normalizedTarget = normalizedGeo === 'GB' ? 'UK' : normalizedGeo;

    // 1. Filter healthy proxies matching target geo
    const matching = this.proxies.filter(
      (p) => !this.isBlacklisted(p) && p.geo && (p.geo === normalizedTarget || (p.geo === 'GB' && normalizedTarget === 'UK'))
    );

    if (matching.length > 0) {
      const proxy = matching[this.currentIndex % matching.length];
      this.currentIndex++;
      return proxy;
    }

    // 2. Fallback to general healthy pool if allowed
    if (fallbackToAny) {
      return this.getNextProxy();
    }

    return undefined;
  }

  /**
   * Probes and returns a guaranteed live & healthy proxy with geo-matching
   */
  public async getHealthyProxy(
    targetGeo?: string,
    targetEndpoint?: string,
    maxRetries: number = 3
  ): Promise<ProxyConfig | undefined> {
    if (this.proxies.length === 0) return undefined;

    let candidate = targetGeo ? this.getProxyForGeo(targetGeo, true) : this.getNextProxy();
    if (!candidate) return undefined;

    let attempts = 0;
    while (candidate && attempts < maxRetries) {
      const isAlive = await this.validateProxy(candidate, targetEndpoint);
      if (isAlive) {
        return candidate;
      }
      attempts++;
      candidate = targetGeo ? this.getProxyForGeo(targetGeo, true) : this.getNextProxy();
    }

    return candidate && !this.isBlacklisted(candidate) ? candidate : undefined;
  }

  /**
   * Retrieves latency & health metrics for a specific proxy
   */
  public getProxyMetrics(proxy: ProxyConfig): ProxyMetrics | undefined {
    return this.metrics.get(this.getProxyKey(proxy));
  }

  /**
   * Retrieves all tracked metrics
   */
  public getAllMetrics(): Record<string, ProxyMetrics> {
    const result: Record<string, ProxyMetrics> = {};
    for (const [key, val] of this.metrics.entries()) {
      result[key] = val;
    }
    return result;
  }
}

export const proxyRotator = new ProxyRotator();

if (require.main === module) {
  console.log('🔄 [Proxy Rotator Skill] Initialized.');
  console.log(`   Configured Proxies: ${proxyRotator.getProxyCount()}`);
  const next = proxyRotator.getNextProxy();
  console.log('   Next Proxy:', next || 'None (Direct Connection)');
  const geoProxy = proxyRotator.getProxyForGeo('US');
  console.log('   US Geo Proxy:', geoProxy || 'None (Fallback)');
}

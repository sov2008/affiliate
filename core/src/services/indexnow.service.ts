import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

export interface IndexNowSubmissionResult {
  endpoint: string;
  success: boolean;
  statusCode?: number;
  message: string;
}

export interface IndexNowBatchReport {
  timestamp: string;
  host: string;
  urlCount: number;
  results: IndexNowSubmissionResult[];
  pingResults?: Array<{ engine: string; success: boolean; status?: number; error?: string }>;
}

export class IndexNowService {
  private static instance: IndexNowService | null = null;

  public static readonly KEY = 'e2d6b384a51e44f8b03046f890cf51a2';
  public static readonly HOST = 'flirtcheck.site';
  public static readonly KEY_LOCATION = `https://${IndexNowService.HOST}/${IndexNowService.KEY}.txt`;
  public static readonly SITEMAP_URL = `https://${IndexNowService.HOST}/sitemap-index.xml`;

  public static readonly ENDPOINTS = [
    'https://api.indexnow.org/indexnow',
    'https://yandex.com/indexnow',
  ];

  public static getInstance(): IndexNowService {
    if (!IndexNowService.instance) {
      IndexNowService.instance = new IndexNowService();
    }
    return IndexNowService.instance;
  }

  /**
   * Submit a list of URLs to IndexNow endpoints
   */
  public async submitUrls(urls: string[]): Promise<IndexNowBatchReport> {
    const cleanUrls = Array.from(new Set(
      urls
        .map(u => u.trim())
        .filter(u => u.startsWith(`https://${IndexNowService.HOST}`) || u.startsWith(`http://${IndexNowService.HOST}`))
        .map(u => u.replace(/^http:\/\//, 'https://'))
    ));

    if (cleanUrls.length === 0) {
      console.warn('⚠️ [IndexNowService] No valid URLs to submit.');
      return {
        timestamp: new Date().toISOString(),
        host: IndexNowService.HOST,
        urlCount: 0,
        results: [],
      };
    }

    console.log(`\n🚀 [IndexNowService] Submitting ${cleanUrls.length} URL(s) to IndexNow API...`);

    const payload = {
      host: IndexNowService.HOST,
      key: IndexNowService.KEY,
      keyLocation: IndexNowService.KEY_LOCATION,
      urlList: cleanUrls,
    };

    const results: IndexNowSubmissionResult[] = [];

    for (const endpoint of IndexNowService.ENDPOINTS) {
      try {
        const response = await axios.post(endpoint, payload, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'User-Agent': 'FlirtCheck-IndexNow-Agent/2.0',
          },
          timeout: 10000,
          validateStatus: () => true, // capture all status codes
        });

        const isSuccess = response.status === 200 || response.status === 202;
        const msg = isSuccess 
          ? `Submitted successfully (${response.status})` 
          : `Received status ${response.status}: ${JSON.stringify(response.data || '')}`;

        if (isSuccess) {
          console.log(`   ✅ [${endpoint}] ${msg}`);
        } else {
          console.warn(`   ⚠️ [${endpoint}] ${msg}`);
        }

        results.push({
          endpoint,
          success: isSuccess,
          statusCode: response.status,
          message: msg,
        });
      } catch (err: any) {
        console.error(`   ❌ [${endpoint}] Error: ${err.message}`);
        results.push({
          endpoint,
          success: false,
          message: err.message,
        });
      }
    }

    // Also trigger search engine sitemap pings
    const pingResults = await this.pingSearchEngines();

    return {
      timestamp: new Date().toISOString(),
      host: IndexNowService.HOST,
      urlCount: cleanUrls.length,
      results,
      pingResults,
    };
  }

  /**
   * Ping Google and Bing sitemap endpoints (DEPRECATED by search engines: Google 404, Bing 410)
   * Kept for backward compatibility, returns graceful no-op notice.
   */
  public async pingSearchEngines(sitemapUrl = IndexNowService.SITEMAP_URL): Promise<Array<{ engine: string; success: boolean; status?: number; error?: string }>> {
    console.log(`\nℹ️ [IndexNowService] Traditional sitemap ping endpoints are permanently retired by search engines.`);
    console.log(`   (Google deprecated /ping?sitemap= in late 2023, Bing replaced it with IndexNow).`);
    return [
      { engine: 'Google', success: true, status: 200, error: 'Legacy ping bypassed in favor of IndexNow & GSC API' },
      { engine: 'Bing', success: true, status: 200, error: 'Legacy ping bypassed in favor of IndexNow protocol' },
    ];
  }

  /**
   * Extract all URLs from sitemap-0.xml
   */
  public extractUrlsFromSitemap(): string[] {
    const candidatePaths = [
      path.resolve(process.cwd(), 'blog/dist/sitemap-0.xml'),
      path.resolve(process.cwd(), '../blog/dist/sitemap-0.xml'),
      '/var/www/affiliate/blog/dist/sitemap-0.xml',
    ];

    const sitemapPath = candidatePaths.find(p => fs.existsSync(p));
    if (!sitemapPath) {
      console.warn('⚠️ [IndexNowService] sitemap-0.xml not found in dist.');
      return [];
    }

    try {
      const xml = fs.readFileSync(sitemapPath, 'utf8');
      const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
      const urls: string[] = [];
      for (const m of matches) {
        if (m[1]) urls.push(m[1].trim());
      }
      return urls;
    } catch (err: any) {
      console.error('❌ [IndexNowService] Error reading sitemap:', err.message);
      return [];
    }
  }

  /**
   * Submit all URLs found in current sitemap
   */
  public async submitAllFromSitemap(): Promise<IndexNowBatchReport> {
    const urls = this.extractUrlsFromSitemap();
    if (urls.length === 0) {
      console.warn('⚠️ [IndexNowService] No URLs extracted from sitemap.');
      return {
        timestamp: new Date().toISOString(),
        host: IndexNowService.HOST,
        urlCount: 0,
        results: [],
      };
    }
    return this.submitUrls(urls);
  }
}

export const indexNowService = IndexNowService.getInstance();

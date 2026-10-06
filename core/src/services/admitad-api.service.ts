import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

export interface AdmitadTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
  username: string;
  first_name: string;
  last_name: string;
  language: string;
  id: number;
  group: string;
}

export interface AdmitadBalanceItem {
  currency: string;
  balance: string;
}

export interface AdmitadWebsite {
  id: number;
  name: string;
  site_url: string;
  status: string;
  verification_status?: string;
  kind?: string;
  categories?: Array<{ id: number; name: string }>;
}

export interface AdmitadCampaign {
  id: number;
  name: string;
  site_url: string;
  status?: string;
  connection_status?: 'active' | 'pending' | 'declined';
  gotolink?: string;
  rating?: number;
  cr?: number;
  epc?: number;
  currency?: string;
  categories?: Array<{ id: number; name: string }>;
  geotargeting?: Array<{ country: string }>;
  actions?: Array<{ name: string; payment_type: string; tariff_id: number }>;
}

export interface AdmitadCoupon {
  id: number;
  name: string;
  short_name?: string;
  promocode?: string;
  discount?: string;
  date_start: string;
  date_end: string;
  goto_link?: string;
  campaign?: { id: number; name: string };
  status?: string;
  types?: Array<{ id: number; name: string }>;
}

export interface AdmitadDeeplinkResult {
  link: string;
  is_affiliate_product: boolean | null;
  error_message: string | null;
}

export interface AdmitadCampaignStat {
  advcampaign_id: number;
  advcampaign_name: string;
  views: number;
  clicks: number;
  ctr: number;
  ecpc: number;
  ecpm: number;
  cr: number;
  leads_sum: number;
  sales_sum: number;
  payment_sum_open: number;
  payment_sum_approved: number;
  payment_sum_declined: number;
  currency: string;
}

export interface AdmitadActionStat {
  id: number;
  action_date: string;
  closing_date?: string;
  status: 'pending' | 'approved' | 'declined';
  payment: number;
  currency: string;
  order_id: string;
  advcampaign_name: string;
  subid?: string;
  subid1?: string;
  subid2?: string;
  subid3?: string;
}

export class AdmitadApiService {
  private static instance: AdmitadApiService | null = null;

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly base64Header: string;
  private readonly defaultWebsiteId: string;
  private readonly scopes: string;

  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;
  private refreshToken: string | null = null;
  private tokenPromise: Promise<string> | null = null;

  private constructor() {
    this.clientId = process.env.ADMITAD_CLIENT_ID || '497e2d7ed310265e6e2fb37cd2a237';
    this.clientSecret = process.env.ADMITAD_CLIENT_SECRET || 'f832e9e45d18ee7a6159e874178824';
    this.base64Header = process.env.ADMITAD_BASE64_HEADER || 'NDk3ZTJkN2VkMzEwMjY1ZTZlMmZiMzdjZDJhMjM3OmY4MzJlOWU0NWQxOGVlN2E2MTU5ZTg3NDE3ODgyNA==';
    this.defaultWebsiteId = process.env.ADMITAD_WEBSITE_ID || '3007248';
    this.scopes = process.env.ADMITAD_SCOPES || 'advcampaigns advcampaigns_for_website banners banners_for_website payments statistics coupons coupons_for_website websites private_data_balance deeplink_generator announcements referrals broken_links';
  }

  public static getInstance(): AdmitadApiService {
    if (!this.instance) {
      this.instance = new AdmitadApiService();
    }
    return this.instance;
  }

  /**
   * Retrieves or refreshes OAuth2 Bearer token
   */
  public async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiresAt > now + 60_000) {
      return this.cachedToken;
    }

    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.acquireToken();
    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async acquireToken(): Promise<string> {
    const postData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      scope: this.scopes
    }).toString();

    const options: https.RequestOptions = {
      hostname: 'api.admitad.com',
      port: 443,
      path: '/token/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${this.base64Header}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const res = await this.sendRequest<AdmitadTokenResponse>(options, postData);
    if (!res || !res.access_token) {
      throw new Error(`Failed to acquire Admitad OAuth2 token: ${JSON.stringify(res)}`);
    }

    this.cachedToken = res.access_token;
    this.refreshToken = res.refresh_token;
    // expires_in is in seconds (e.g. 604800 = 7 days)
    this.tokenExpiresAt = Date.now() + (res.expires_in * 1000);

    return this.cachedToken;
  }

  /**
   * Base authorized GET request helper
   */
  public async get<T>(endpoint: string, queryParams: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
    const token = await this.getAccessToken();

    const qs = Object.entries(queryParams)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');

    const sep = endpoint.includes('?') ? '&' : '?';
    const fullPath = qs ? `${endpoint}${sep}${qs}` : endpoint;

    const options: https.RequestOptions = {
      hostname: 'api.admitad.com',
      port: 443,
      path: fullPath,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    };

    return this.sendRequest<T>(options);
  }

  /**
   * 1. Get Live User Balances across all currencies (USD, EUR, RUB, etc.)
   */
  public async getBalance(): Promise<AdmitadBalanceItem[]> {
    return this.get<AdmitadBalanceItem[]>('/me/balance/');
  }

  /**
   * 2. List all Webmaster Ad Spaces / Websites
   */
  public async getWebsites(): Promise<{ results: AdmitadWebsite[]; _meta: { count: number; limit: number; offset: number } }> {
    return this.get<{ results: AdmitadWebsite[]; _meta: any }>('/websites/');
  }

  /**
   * 3. Get Details for specific Ad Space
   */
  public async getWebsite(websiteId: string | number = this.defaultWebsiteId): Promise<AdmitadWebsite> {
    return this.get<AdmitadWebsite>(`/websites/${websiteId}/`);
  }

  /**
   * 4. List Programs connected to the Ad Space (Active, Pending, Moderation)
   */
  public async getCampaignsForWebsite(params: {
    websiteId?: string | number;
    connection_status?: 'active' | 'pending' | 'declined';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ results: AdmitadCampaign[]; _meta: { count: number; limit: number; offset: number } }> {
    const wId = params.websiteId || this.defaultWebsiteId;
    return this.get<{ results: AdmitadCampaign[]; _meta: any }>(`/advcampaigns/website/${wId}/`, {
      connection_status: params.connection_status,
      limit: params.limit || 20,
      offset: params.offset || 0
    });
  }

  /**
   * 5. Search & browse global catalog of 775+ campaigns
   */
  public async getCatalogCampaigns(params: {
    keyword?: string;
    category?: number | string;
    has_moderation?: number; // 0 for instant
    limit?: number;
    offset?: number;
  } = {}): Promise<{ results: AdmitadCampaign[]; _meta: { count: number; limit: number; offset: number } }> {
    return this.get<{ results: AdmitadCampaign[]; _meta: any }>('/advcampaigns/', {
      keyword: params.keyword,
      category: params.category,
      has_moderation: params.has_moderation,
      limit: params.limit || 20,
      offset: params.offset || 0
    });
  }

  /**
   * 6. Retrieve active Coupons & Promocodes for Ad Space
   */
  public async getCoupons(params: {
    websiteId?: string | number;
    campaignId?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ results: AdmitadCoupon[]; _meta: { count: number; limit: number; offset: number } }> {
    const wId = params.websiteId || this.defaultWebsiteId;
    return this.get<{ results: AdmitadCoupon[]; _meta: any }>(`/coupons/website/${wId}/`, {
      campaign: params.campaignId,
      limit: params.limit || 50,
      offset: params.offset || 0
    });
  }

  /**
   * 7. Generate Trackable Deeplink via official Deeplink Generator
   */
  public async generateDeeplink(params: {
    advcampaignId: number;
    ulp: string; // Target landing URL on merchant site
    subid?: string;
    websiteId?: string | number;
  }): Promise<AdmitadDeeplinkResult[]> {
    const wId = params.websiteId || this.defaultWebsiteId;
    return this.get<AdmitadDeeplinkResult[]>(`/deeplink/${wId}/advcampaign/${params.advcampaignId}/`, {
      ulp: params.ulp,
      subid: params.subid
    });
  }

  /**
   * 8. Campaign Statistics (Clicks, Views, EPC, CR, Payouts)
   */
  public async getCampaignStatistics(params: {
    websiteId?: string | number;
    date_start?: string; // YYYY-MM-DD
    date_end?: string;   // YYYY-MM-DD
    limit?: number;
  } = {}): Promise<{ results: AdmitadCampaignStat[]; _meta: { count: number } }> {
    return this.get<{ results: AdmitadCampaignStat[]; _meta: any }>('/statistics/campaigns/', {
      website: params.websiteId || this.defaultWebsiteId,
      date_start: params.date_start,
      date_end: params.date_end,
      limit: params.limit || 50
    });
  }

  /**
   * 9. Action Statistics (Confirmed Leads & Sales)
   */
  public async getActionStatistics(params: {
    websiteId?: string | number;
    date_start?: string;
    date_end?: string;
    limit?: number;
  } = {}): Promise<{ results: AdmitadActionStat[]; _meta: { count: number } }> {
    return this.get<{ results: AdmitadActionStat[]; _meta: any }>('/statistics/actions/', {
      website: params.websiteId || this.defaultWebsiteId,
      date_start: params.date_start,
      date_end: params.date_end,
      limit: params.limit || 50
    });
  }

  /**
   * 10. SubID Breakdown Statistics
   */
  public async getSubIdStatistics(params: {
    websiteId?: string | number;
    date_start?: string;
    date_end?: string;
    subid?: string;
    limit?: number;
  } = {}): Promise<{ results: any[]; _meta: { count: number } }> {
    return this.get<{ results: any[]; _meta: any }>('/statistics/sub_ids/', {
      website: params.websiteId || this.defaultWebsiteId,
      date_start: params.date_start,
      date_end: params.date_end,
      subid: params.subid,
      limit: params.limit || 50
    });
  }

  /**
   * 11. Payments & History
   */
  public async getPayments(limit = 20): Promise<{ results: any[]; _meta: { count: number } }> {
    return this.get<{ results: any[]; _meta: any }>('/payments/', { limit });
  }

  /**
   * 12. Broken Links Monitor
   */
  public async getBrokenLinks(websiteId: string | number = this.defaultWebsiteId): Promise<any> {
    return this.get<any>('/broken_links/', { website: websiteId });
  }

  /**
   * 13. System Announcements & Tariff Updates
   */
  public async getAnnouncements(limit = 20): Promise<{ results: any[]; _meta: { count: number } }> {
    return this.get<{ results: any[]; _meta: any }>('/announcements/', { limit });
  }

  private sendRequest<T>(options: https.RequestOptions, bodyPayload?: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => raw += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(raw));
            } catch {
              resolve(raw as unknown as T);
            }
          } else {
            let errorJson: any = null;
            try { errorJson = JSON.parse(raw); } catch { errorJson = raw; }
            reject(new Error(`Admitad API HTTP ${res.statusCode}: ${JSON.stringify(errorJson)}`));
          }
        });
      });

      req.on('error', reject);
      if (bodyPayload) req.write(bodyPayload);
      req.end();
    });
  }
}

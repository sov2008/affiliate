import crypto from 'crypto';

export interface AdmitadOfferConfig {
  id: string;
  name: string;
  category: 'people-search' | 'cybersecurity' | 'dating' | 'lifestyle';
  campaignId: string; // Admitad Ad Campaign ID
  baseUrl: string;    // Base affiliate or target URL
  defaultPayout: number; // Estimated payout in USD
  payoutType: 'CPL' | 'CPS' | 'RevShare';
  allowedGeos: string[]; // ['US', 'CA', 'GB', 'AU', ...]
  enabled: boolean;
}

export interface AdmitadLinkParams {
  offerId: string;
  clickId?: string; // subid
  platform?: string; // subid1 (blog, twitter, reddit, telegram)
  slug?: string;     // subid2 (article slug)
  trigger?: string;  // subid3 (inline_quiz, sticky_bar, etc.)
  customSubId4?: string;
  targetLandingUrl?: string; // ulp parameter
}

export class AdmitadService {
  private static instance: AdmitadService | null = null;
  private offers: Map<string, AdmitadOfferConfig> = new Map();

  private constructor() {
    this.initDefaultOffers();
  }

  public static getInstance(): AdmitadService {
    if (!this.instance) {
      this.instance = new AdmitadService();
    }
    return this.instance;
  }

  /**
   * Initializes initial high-converting Tier-1 catalog for FlirtCheck
   */
  private initDefaultOffers(): void {
    const defaults: AdmitadOfferConfig[] = [
      {
        id: 'admitad_spokeo',
        name: 'Spokeo People Search & Reverse Phone Lookup',
        category: 'people-search',
        campaignId: process.env.ADMITAD_SPOKEO_CAMPAIGN_ID || 'spokeo_us',
        baseUrl: 'https://ad.admitad.com/g/spokeo_direct/',
        defaultPayout: 22.0,
        payoutType: 'CPS',
        allowedGeos: ['US'],
        enabled: true,
      },
      {
        id: 'admitad_beenverified',
        name: 'BeenVerified Public Records & Background Check',
        category: 'people-search',
        campaignId: process.env.ADMITAD_BEENVERIFIED_CAMPAIGN_ID || 'beenverified_us',
        baseUrl: 'https://ad.admitad.com/g/beenverified_direct/',
        defaultPayout: 35.0,
        payoutType: 'CPS',
        allowedGeos: ['US'],
        enabled: true,
      },
      {
        id: 'admitad_nordvpn',
        name: 'NordVPN Cyber Privacy & Threat Protection',
        category: 'cybersecurity',
        campaignId: process.env.ADMITAD_NORDVPN_CAMPAIGN_ID || 'nordvpn_global',
        baseUrl: 'https://ad.admitad.com/g/nordvpn_direct/',
        defaultPayout: 38.0,
        payoutType: 'CPS',
        allowedGeos: ['US', 'CA', 'GB', 'AU', 'EU'],
        enabled: true,
      },
      {
        id: 'admitad_incogni',
        name: 'Incogni Personal Data Removal Service',
        category: 'cybersecurity',
        campaignId: process.env.ADMITAD_INCOGNI_CAMPAIGN_ID || 'incogni_global',
        baseUrl: 'https://ad.admitad.com/g/incogni_direct/',
        defaultPayout: 28.0,
        payoutType: 'CPS',
        allowedGeos: ['US', 'CA', 'GB', 'AU', 'EU'],
        enabled: true,
      },
      {
        id: 'admitad_eharmony',
        name: 'eHarmony Verified Relationship Compatibility',
        category: 'dating',
        campaignId: process.env.ADMITAD_EHARMONY_CAMPAIGN_ID || 'eharmony_tier1',
        baseUrl: 'https://ad.admitad.com/g/eharmony_direct/',
        defaultPayout: 6.5,
        payoutType: 'CPL',
        allowedGeos: ['US', 'CA', 'GB', 'AU'],
        enabled: true,
      },
    ];

    for (const off of defaults) {
      this.offers.set(off.id, off);
    }
  }

  /**
   * Generates a trackable Admitad affiliate URL with deep subid instrumentation
   */
  public generateTrackingUrl(params: AdmitadLinkParams): string {
    const offer = this.offers.get(params.offerId);
    const base = offer ? offer.baseUrl : 'https://ad.admitad.com/g/default/';

    const cid = params.clickId || `fc_${crypto.randomUUID().slice(0, 8)}_${Date.now().toString(36)}`;
    const platform = (params.platform || 'blog').toLowerCase();
    const slug = (params.slug || 'general').toLowerCase();
    const trigger = (params.trigger || 'cta').toLowerCase();

    try {
      const urlObj = new URL(base);
      urlObj.searchParams.set('subid', cid);
      urlObj.searchParams.set('subid1', platform);
      urlObj.searchParams.set('subid2', slug);
      urlObj.searchParams.set('subid3', trigger);

      if (params.customSubId4) {
        urlObj.searchParams.set('subid4', params.customSubId4);
      }

      if (params.targetLandingUrl) {
        urlObj.searchParams.set('ulp', params.targetLandingUrl);
      }

      return urlObj.toString();
    } catch {
      // Fallback string concatenation if URL is relative or mock
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}subid=${encodeURIComponent(cid)}&subid1=${encodeURIComponent(platform)}&subid2=${encodeURIComponent(slug)}&subid3=${encodeURIComponent(trigger)}`;
    }
  }

  /**
   * Retrieves offer config by ID
   */
  public getOffer(id: string): AdmitadOfferConfig | undefined {
    return this.offers.get(id);
  }

  /**
   * Lists all available Admitad offers
   */
  public listOffers(): AdmitadOfferConfig[] {
    return Array.from(this.offers.values());
  }

  /**
   * Selects best-matching Admitad offer by article category or intent
   */
  public getBestOfferForContext(category: string): AdmitadOfferConfig {
    const catLower = category.toLowerCase();
    const spokeo = this.offers.get('admitad_spokeo');
    const nordvpn = this.offers.get('admitad_nordvpn');
    const eharmony = this.offers.get('admitad_eharmony');
    const fallback = (spokeo || this.offers.values().next().value) as AdmitadOfferConfig;

    if (catLower.includes('safety') || catLower.includes('scam') || catLower.includes('algo')) {
      return spokeo || fallback;
    }

    if (catLower.includes('privacy') || catLower.includes('dialogue') || catLower.includes('extortion')) {
      return nordvpn || fallback;
    }

    if (catLower.includes('dating') || catLower.includes('psychology') || catLower.includes('dates')) {
      return eharmony || fallback;
    }

    return fallback;
  }
}

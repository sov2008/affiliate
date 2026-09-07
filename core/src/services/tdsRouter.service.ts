import { URL } from 'url';

export interface SplitConfig {
  offerAUrl: string;
  offerBUrl: string;
  ratioA: number; // percentage, e.g. 70 means 70% to A, 30% to B
}

export interface SplitRoutingDecision {
  variant: 'A' | 'B';
  targetUrl: string;
  roll: number;
  offerAUrl: string;
  offerBUrl: string;
  ratioA: number;
}

export class TdsRouterService {
  private static instance: TdsRouterService | null = null;

  public static getInstance(): TdsRouterService {
    if (!TdsRouterService.instance) {
      TdsRouterService.instance = new TdsRouterService();
    }
    return TdsRouterService.instance;
  }

  /**
   * Retrieves the current split test configuration from environment variables
   * with fallback safety.
   */
  public getConfig(): SplitConfig {
    const offerAUrl =
      process.env.SPLIT_OFFER_A_URL ||
      process.env.LOSPOLLOS_SMARTLINK_URL ||
      process.env.LOSPOLLOS_DATING_URL ||
      process.env.AFFILIATE_OFFER_URL ||
      'https://flirtcheck.site/blog/';

    const offerBUrl =
      process.env.SPLIT_OFFER_B_URL ||
      process.env.LOSPOLLOS_CASUAL_URL ||
      offerAUrl;

    let ratioA = parseInt(process.env.SPLIT_RATIO_A || '70', 10);
    if (isNaN(ratioA) || ratioA < 0) ratioA = 70;
    if (ratioA > 100) ratioA = 100;

    return {
      offerAUrl,
      offerBUrl,
      ratioA
    };
  }

  /**
   * Evaluates incoming request parameters and routes real traffic
   * according to the configured split ratio (e.g. 70/30).
   */
  public routeTraffic(queryParams: Record<string, any> = {}): SplitRoutingDecision {
    const config = this.getConfig();
    
    // Generate uniform random integer from 1 to 100
    const roll = Math.floor(Math.random() * 100) + 1;
    const isVariantA = roll <= config.ratioA;
    const variant: 'A' | 'B' = isVariantA ? 'A' : 'B';
    const baseUrl = isVariantA ? config.offerAUrl : config.offerBUrl;

    let targetUrl = baseUrl;
    try {
      const parsedUrl = new URL(baseUrl);
      
      // Inject conversion attribution parameters
      for (const [key, val] of Object.entries(queryParams)) {
        if (typeof val === 'string' && val.trim() !== '') {
          parsedUrl.searchParams.set(key, val.trim());
        }
      }

      // Add explicit split tracking tags
      parsedUrl.searchParams.set('split_variant', variant);
      
      targetUrl = parsedUrl.toString();
    } catch {
      targetUrl = baseUrl;
    }

    return {
      variant,
      targetUrl,
      roll,
      offerAUrl: config.offerAUrl,
      offerBUrl: config.offerBUrl,
      ratioA: config.ratioA
    };
  }
}

export default TdsRouterService;

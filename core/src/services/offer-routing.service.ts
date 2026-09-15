import crypto from 'crypto';
import path from 'path';
import { TelegramLeadRepository, MabArmRecord } from '../db/tg-leads.repository.js';

export interface OfferConfig {
  id: string;
  name: string;
  network: 'lospollos' | 'mylead' | string;
  baseUrl: string;
  subParam: 's1' | 'sub1' | 'cid' | string;
  isPrimary?: boolean;
  enabled?: boolean;
  degradedUntil?: number;
  degradedReason?: string;
}

export interface OfferStats {
  offerId: string;
  network: string;
  impressions: number;
  conversions: number;
  revenue: number;
  epc: number;
  lastUpdated: number;
}

export interface OfferSelectionResult {
  offerId: string;
  network: string;
  clickId: string;
  url: string;
  strategy: 'EXPLOITATION' | 'EXPLORATION';
  epc: number;
  statsSnapshot: {
    impressions: number;
    conversions: number;
    revenue: number;
  };
}

export interface UserQuizContext {
  chatId: string | number;
  startParam?: string; // Traffic source tag (e.g. 'tt_direct', 'reddit_dating')
  ageRange?: string; // '18-25' | '26-35' | '36+'
  connType?: string; // 'Serious Connection' | 'Casual Flirt' | 'Virtual / Cams' | 'Interactive Fun'
  sub1?: string;
  metadata?: Record<string, any>;
}

export interface OfferRoutingOptions {
  explorationRate?: number; // 0.20 by default (20% explore / 80% exploit)
  offers?: OfferConfig[];
  customDbDir?: string;
}

/**
 * Marsaglia & Tsang method for Gamma(shape, 1) sampling
 */
export function sampleGamma(shape: number): number {
  if (shape < 1) {
    return sampleGamma(shape + 1) * Math.pow(Math.random(), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let u1 = Math.random();
    while (u1 <= 1e-15) u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    const v = Math.pow(1 + c * z, 3);
    if (v <= 0) continue;

    const u = Math.random();
    if (u < 1 - 0.0331 * Math.pow(z, 4)) {
      return d * v;
    }
    if (Math.log(u) < 0.5 * z * z + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
}

/**
 * Beta distribution random sampler via ratio of Gamma variables
 */
export function sampleBeta(alpha: number, beta: number): number {
  const safeAlpha = Math.max(0.001, alpha);
  const safeBeta = Math.max(0.001, beta);
  const x = sampleGamma(safeAlpha);
  const y = sampleGamma(safeBeta);
  if (x + y === 0) return 0.5;
  return x / (x + y);
}

export class OfferRoutingService {
  private static instance: OfferRoutingService | null = null;
  private readonly explorationRate: number;
  private readonly leadRepo: TelegramLeadRepository;
  private offers: Map<string, OfferConfig> = new Map();

  private constructor(options: OfferRoutingOptions = {}) {
    this.explorationRate = options.explorationRate ?? 0.2;
    this.leadRepo = TelegramLeadRepository.getInstance(options.customDbDir);

    this.initOffers(options.offers);
  }

  public static getInstance(options?: OfferRoutingOptions): OfferRoutingService {
    if (!this.instance) {
      this.instance = new OfferRoutingService(options);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  private initOffers(customOffers?: OfferConfig[]): void {
    if (customOffers && customOffers.length > 0) {
      for (const o of customOffers) {
        this.offers.set(o.id, o);
      }
      return;
    }

    // --- LosPollos Verified Multi-Vertical Matrix ---
    const datingUrl =
      process.env.LOSPOLLOS_DATING_URL ||
      process.env.AFFILIATE_OFFER_URL ||
      process.env.LOSPOLLOS_SMARTLINK_URL ||
      process.env.LOSPOLLOS_URL ||
      'https://yex2brk.chemistrydrivensmile.org/rp1pd38';

    const casualUrl =
      process.env.LOSPOLLOS_CASUAL_URL ||
      'https://yex2brk.engagingdating.org/rpupd31';

    const camsUrl =
      process.env.LOSPOLLOS_CAMS_URL ||
      'https://yex2brk.yearningcompanion.org/rpvpd31';

    const gamesUrl =
      process.env.LOSPOLLOS_GAMES_URL ||
      'https://yex2brk.realmessaging.org/rpqpd3w';

    const tiktokUrl =
      process.env.LOSPOLLOS_TIKTOK_URL ||
      'https://yex2brk.honestpairing.org/rpvpd3t';

    // 1. Primary Dating (Serious / Default)
    this.offers.set('lospollos_dating', {
      id: 'lospollos_dating',
      name: 'LosPollos Dating Smartlink',
      network: 'lospollos',
      baseUrl: datingUrl,
      subParam: 'cid',
      isPrimary: true,
    });

    // Alias 'lospollos' to 'lospollos_dating' for backward compatibility
    this.offers.set('lospollos', {
      id: 'lospollos',
      name: 'LosPollos Dating Smartlink',
      network: 'lospollos',
      baseUrl: datingUrl,
      subParam: 'cid',
      isPrimary: true,
    });

    // 2. Casual / Flirt
    this.offers.set('lospollos_casual', {
      id: 'lospollos_casual',
      name: 'LosPollos Casual Smartlink',
      network: 'lospollos',
      baseUrl: casualUrl,
      subParam: 'cid',
      isPrimary: false,
    });

    // 3. Cams / Virtual
    this.offers.set('lospollos_cams', {
      id: 'lospollos_cams',
      name: 'LosPollos Cams Smartlink',
      network: 'lospollos',
      baseUrl: camsUrl,
      subParam: 'cid',
      isPrimary: false,
    });

    // 4. Games / Interactive Fun
    this.offers.set('lospollos_games', {
      id: 'lospollos_games',
      name: 'LosPollos Games Smartlink',
      network: 'lospollos',
      baseUrl: gamesUrl,
      subParam: 'cid',
      isPrimary: false,
    });

    // 5. TikTok Traffic
    this.offers.set('lospollos_tiktok', {
      id: 'lospollos_tiktok',
      name: 'LosPollos TikTok Smartlink',
      network: 'lospollos',
      baseUrl: tiktokUrl,
      subParam: 'cid',
      isPrimary: false,
    });

    // Secondary: MyLead Smartlink (Isolated if placeholder URL detected)
    const myleadEnvUrl = process.env.MYLEAD_SMARTLINK_URL || process.env.MYLEAD_URL;
    const myleadUrl = myleadEnvUrl || 'https://glstrck.com/aff_c?offer_id=123&aff_id=456';
    const isMyLeadPlaceholder = this.isPlaceholderUrl(myleadUrl);

    this.offers.set('mylead', {
      id: 'mylead',
      name: 'MyLead Dating Smartlink',
      network: 'mylead',
      baseUrl: myleadUrl,
      subParam: 'sub1',
      isPrimary: false,
      enabled: !isMyLeadPlaceholder, // Disabled by default until verified URL provided in .env
    });
  }

  /**
   * Detects dummy placeholder or test URLs that cause 404 / traffic drains
   */
  public isPlaceholderUrl(url: string): boolean {
    if (!url) return true;
    const lower = url.toLowerCase();
    return (
      lower.includes('offer_id=123') ||
      lower.includes('aff_id=456') ||
      lower.includes('placeholder') ||
      lower.includes('example.com') ||
      lower.includes('test_offer')
    );
  }

  /**
   * Determines if an offer is healthy and eligible for traffic routing
   */
  public isOfferEligible(offer: OfferConfig): boolean {
    if (offer.enabled === false) return false;
    if (offer.degradedUntil && offer.degradedUntil > Date.now()) return false;
    if (this.isPlaceholderUrl(offer.baseUrl)) return false;
    return true;
  }

  /**
   * Returns all healthy active offers eligible for MAB routing
   */
  public getEligibleOffers(): OfferConfig[] {
    const allOffers = Array.from(this.offers.values());
    const hasDating = allOffers.some((o) => o.id === 'lospollos_dating' && this.isOfferEligible(o));
    return allOffers.filter((o) => {
      // Exclude redundant alias
      if (hasDating && o.id === 'lospollos') return false;
      return this.isOfferEligible(o);
    });
  }

  /**
   * Returns guaranteed safe fallback offer (lospollos_casual or lospollos_dating)
   */
  public getFallbackOffer(): OfferConfig {
    const casual = this.offers.get('lospollos_casual');
    if (casual && this.isOfferEligible(casual)) return casual;
    const dating = this.offers.get('lospollos_dating') || this.offers.get('lospollos');
    if (dating && this.isOfferEligible(dating)) return dating;
    const anyEligible = this.getEligibleOffers()[0];
    if (anyEligible) return anyEligible;
    return this.offers.get('lospollos_dating') || Array.from(this.offers.values())[0];
  }

  /**
   * Circuit breaker: marks an offer degraded for a given cooldown duration
   */
  public markOfferDegraded(offerId: string, durationMs: number = 3600000, reason?: string): void {
    const offer = this.offers.get(offerId);
    if (offer) {
      offer.degradedUntil = Date.now() + durationMs;
      offer.degradedReason = reason || 'Health check failure';
      console.warn(`[OfferRoutingService] ⚠️ Circuit Breaker TRIP: Offer "${offerId}" degraded for ${Math.round(durationMs / 60000)}m. Reason: ${offer.degradedReason}`);
    }
  }

  /**
   * Resets circuit breaker degradation
   */
  public clearOfferDegraded(offerId: string): void {
    const offer = this.offers.get(offerId);
    if (offer && offer.degradedUntil) {
      offer.degradedUntil = undefined;
      offer.degradedReason = undefined;
      console.log(`[OfferRoutingService] 🟢 Circuit Breaker RESET: Offer "${offerId}" returned to healthy state.`);
    }
  }

  /**
   * Manually enables or disables an offer
   */
  public setOfferEnabled(offerId: string, enabled: boolean): void {
    const offer = this.offers.get(offerId);
    if (offer) {
      offer.enabled = enabled;
      console.log(`[OfferRoutingService] Offer "${offerId}" enabled status set to: ${enabled}`);
    }
  }

  /**
   * Returns all registered offer configurations
   */
  public getAllOffers(): OfferConfig[] {
    return Array.from(this.offers.values());
  }

  /**
   * Generates a 12-character alphanumeric click identifier
   */
  public generateClickId(): string {
    return crypto.randomBytes(6).toString('hex');
  }

  /**
   * Resolves target offer configuration based on User Quiz Context & Traffic Source:
   * 1. If traffic source tag (startParam) starts with 'tt_' -> resolve LOSPOLLOS_TIKTOK_URL.
   * 2. If preference matches 'cams' or 'virtual' -> resolve LOSPOLLOS_CAMS_URL.
   * 3. If preference matches 'gaming' / 'interactive' or age is 18-25 with casual intent -> resolve LOSPOLLOS_GAMES_URL.
   * 4. If preference matches 'casual' or 'flirt' -> resolve LOSPOLLOS_CASUAL_URL.
   * 5. Default / 'serious' dating -> resolve LOSPOLLOS_DATING_URL.
   */
  public resolveTargetOffer(context: UserQuizContext): OfferConfig {
    const startParam = (context.startParam || context.sub1 || '').trim().toLowerCase();
    const conn = (context.connType || '').trim().toLowerCase();
    const age = (context.ageRange || '').trim();

    // 1. TikTok Traffic Tag
    if (startParam.startsWith('tt_') || startParam === 'tiktok') {
      return this.offers.get('lospollos_tiktok') || this.offers.get('lospollos_dating')!;
    }

    // 2. Cams / Virtual
    if (conn.includes('cam') || conn.includes('virtual')) {
      return this.offers.get('lospollos_cams') || this.offers.get('lospollos_dating')!;
    }

    // 3. Gaming / Interactive Fun OR 18-25 with Casual Intent
    if (
      conn.includes('game') ||
      conn.includes('gaming') ||
      conn.includes('fun') ||
      conn.includes('interactive') ||
      (age === '18-25' && (conn.includes('casual') || conn.includes('flirt') || conn === 'casual'))
    ) {
      return this.offers.get('lospollos_games') || this.offers.get('lospollos_dating')!;
    }

    // 4. Casual / Flirt
    if (conn.includes('casual') || conn.includes('flirt')) {
      return this.offers.get('lospollos_casual') || this.offers.get('lospollos_dating')!;
    }

    // 5. Default / Serious Connection
    return this.offers.get('lospollos_dating') || this.offers.get('lospollos') || Array.from(this.offers.values())[0];
  }

  /**
   * Resolves uniform tracking URL based on user quiz session context:
   * Uniform SubID structure: {targetUrl}?sub1={traffic_source}&sub2={tg_user_id}&cid={clickId}
   */
  public resolveOfferUrl(context: UserQuizContext): OfferSelectionResult {
    const chosenOffer = this.resolveTargetOffer(context);
    const clickId = this.generateClickId();

    // Attribution Bridge & SQLite Atomic Impression
    this.leadRepo.saveClickAttribution(clickId, context.chatId, chosenOffer.id);
    this.recordImpression(chosenOffer.id);

    const trafficSource = context.startParam || context.sub1 || 'reddit_dating';
    const baseDomain = process.env.BASE_DOMAIN || process.env.BASE_URL;
    let trackingUrl: string;
    if (baseDomain && baseDomain.trim()) {
      const cleanDomain = baseDomain.trim().replace(/\/+$/, '');
      trackingUrl = `${cleanDomain}/go?cid=${encodeURIComponent(clickId)}&offer=${encodeURIComponent(chosenOffer.id)}&sub1=${encodeURIComponent(trafficSource)}&sub2=${encodeURIComponent(String(context.chatId))}`;
    } else {
      const cleanBase = chosenOffer.baseUrl.trim().replace(/\/+$/, '');
      const sep = cleanBase.includes('?') ? '&' : '?';
      trackingUrl = `${cleanBase}${sep}sub1=${encodeURIComponent(trafficSource)}&sub2=${encodeURIComponent(String(context.chatId))}&cid=${encodeURIComponent(clickId)}`;
    }

    const currentStats = this.getStats()[chosenOffer.id] || { impressions: 0, conversions: 0, revenue: 0, epc: 0 };

    return {
      offerId: chosenOffer.id,
      network: chosenOffer.network,
      clickId,
      url: trackingUrl,
      strategy: 'EXPLOITATION',
      epc: currentStats.epc,
      statsSnapshot: {
        impressions: currentStats.impressions,
        conversions: currentStats.conversions,
        revenue: currentStats.revenue,
      },
    };
  }

  /**
   * Selects best offer using context matrix or Bayesian Thompson Sampling
   * Dynamically evaluates all registered offers in mab_arms with cold-arm exploration floor
   */
  public selectBestOffer(chatId: string | number, metadata?: Record<string, any>): OfferSelectionResult {
    // If context contains routing keys (connType, startParam, ageRange), route through TDS matrix
    if (metadata?.connType || metadata?.startParam || metadata?.ageRange) {
      return this.resolveOfferUrl({
        chatId,
        connType: metadata.connType,
        startParam: metadata.startParam,
        ageRange: metadata.ageRange,
        sub1: metadata.sub1,
        metadata,
      });
    }

    // Dynamic pool matching: filtered by active, non-degraded, non-placeholder offers
    const eligiblePool = this.getEligibleOffers();
    const effectivePool = eligiblePool.length > 0 ? eligiblePool : [this.getFallbackOffer()];

    const currentStats = this.getStats();

    // Check cold arms with impressions < 20 in effectivePool
    const coldArms = effectivePool.filter((o) => {
      const s = currentStats[o.id];
      return !s || s.impressions < 20;
    });

    let chosenOffer: OfferConfig;
    let strategy: 'EXPLOITATION' | 'EXPLORATION' = 'EXPLOITATION';

    // Exploration floor: 15-20% chance to explore cold arms to collect sample size (only if explorationRate > 0)
    const shouldExploreCold = this.explorationRate > 0 && coldArms.length > 0 && Math.random() < this.explorationRate;

    if (shouldExploreCold) {
      strategy = 'EXPLORATION';
      const randIdx = Math.floor(Math.random() * coldArms.length);
      chosenOffer = coldArms[randIdx];
    } else {
      // True Thompson Sampling with Expected EPC Scoring
      let bestScore = -Infinity;
      let winningCandidates: OfferConfig[] = [];

      for (const o of effectivePool) {
        const s = currentStats[o.id] || { impressions: 0, conversions: 0, revenue: 0, epc: 0 };
        const impressions = Number(s.impressions || 0);
        const conversions = Number(s.conversions || 0);
        const revenue = Number(s.revenue || 0);

        const alpha = 1 + conversions;
        const beta = 1 + Math.max(0, impressions - conversions);

        // Sample CTR from Beta distribution (deterministic mean if 100% exploitation requested via explorationRate === 0)
        const sampledCtr = this.explorationRate === 0 
          ? (alpha / (alpha + beta)) 
          : sampleBeta(alpha, beta);

        // Average payout per conversion (or fallback based on network if 0 conversions)
        const avgPayout = conversions > 0
          ? revenue / conversions
          : (revenue > 0 ? revenue : (o.network === 'mylead' ? 18.0 : 15.0));

        const score = sampledCtr * avgPayout;

        if (score > bestScore) {
          bestScore = score;
          winningCandidates = [o];
        } else if (score === bestScore) {
          winningCandidates.push(o);
        }
      }

      // Calibration: Prefer proven converting favorite (lospollos_casual), then primary, then first winner
      chosenOffer =
        winningCandidates.find((c) => c.id === 'lospollos_casual') ||
        winningCandidates.find((c) => c.isPrimary) ||
        winningCandidates[0] ||
        effectivePool[0];
      strategy = 'EXPLOITATION';
    }

    const clickId = this.generateClickId();
    this.leadRepo.saveClickAttribution(clickId, chatId, chosenOffer.id);
    this.recordImpression(chosenOffer.id);

    const trafficSource = metadata?.sub1 || metadata?.startParam || 'reddit_dating';
    const baseDomain = process.env.BASE_DOMAIN || process.env.BASE_URL;
    let trackingUrl: string;
    if (baseDomain && baseDomain.trim()) {
      const cleanDomain = baseDomain.trim().replace(/\/+$/, '');
      trackingUrl = `${cleanDomain}/go?cid=${encodeURIComponent(clickId)}&offer=${encodeURIComponent(chosenOffer.id)}&sub1=${encodeURIComponent(trafficSource)}&sub2=${encodeURIComponent(String(chatId))}`;
    } else {
      const cleanBase = chosenOffer.baseUrl.trim().replace(/\/+$/, '');
      const sep = cleanBase.includes('?') ? '&' : '?';
      trackingUrl = `${cleanBase}${sep}sub1=${encodeURIComponent(trafficSource)}&sub2=${encodeURIComponent(String(chatId))}&cid=${encodeURIComponent(clickId)}`;
    }

    const chosenStats = this.getStats()[chosenOffer.id] || { impressions: 0, conversions: 0, revenue: 0, epc: 0 };

    return {
      offerId: chosenOffer.id,
      network: chosenOffer.network,
      clickId,
      url: trackingUrl,
      strategy,
      epc: chosenStats.epc,
      statsSnapshot: {
        impressions: chosenStats.impressions,
        conversions: chosenStats.conversions,
        revenue: chosenStats.revenue,
      },
    };
  }

  /**
   * Records an impression for a given offer in SQLite
   */
  public recordImpression(offerId: string): void {
    const offer = this.offers.get(offerId);
    const network = offer ? offer.network : 'unknown';
    this.leadRepo.recordMabImpression(offerId, network);
  }

  /**
   * Records conversion attribution and payout from postback in SQLite
   */
  public recordConversion(offerId: string, payout: number): boolean {
    if (!this.offers.has(offerId)) {
      console.warn(`[OfferRoutingService] Unknown offerId "${offerId}" for conversion attribution.`);
    }

    this.leadRepo.recordMabConversion(offerId, payout);

    const s = this.getStats()[offerId];
    if (s) {
      console.log(
        `\x1b[32m[OfferRoutingService] SQLite MAB Reward Updated: Offer=${offerId} | Payout=$${payout.toFixed(2)} | TotalRev=$${s.revenue.toFixed(2)} | EPC=$${s.epc.toFixed(4)}\x1b[0m`
      );
    }
    return true;
  }

  /**
   * Returns stats for all offers, guaranteeing 0 values for newly added arms
   */
  public getStats(): Record<string, OfferStats> {
    const arms = this.leadRepo.getMabArms();
    const armMap = new Map<string, MabArmRecord>();
    for (const a of arms) {
      armMap.set(a.offer_id, a);
    }

    const out: Record<string, OfferStats> = {};
    for (const [id, offer] of this.offers) {
      const arm = armMap.get(id);
      if (arm) {
        out[id] = {
          offerId: arm.offer_id,
          network: arm.network,
          impressions: arm.impressions,
          conversions: arm.conversions,
          revenue: arm.revenue,
          epc: arm.epc,
          lastUpdated: arm.updated_at,
        };
      } else {
        out[id] = {
          offerId: id,
          network: offer.network,
          impressions: 0,
          conversions: 0,
          revenue: 0,
          epc: 0,
          lastUpdated: Date.now(),
        };
      }
    }
    return out;
  }

  public getOfferConfig(offerId: string): OfferConfig | undefined {
    return this.offers.get(offerId);
  }
}

export const offerRoutingService = OfferRoutingService.getInstance();

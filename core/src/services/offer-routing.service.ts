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

    // Secondary: MyLead Smartlink
    const myleadUrl =
      process.env.MYLEAD_SMARTLINK_URL ||
      process.env.MYLEAD_URL ||
      'https://glstrck.com/aff_c?offer_id=123&aff_id=456';

    this.offers.set('mylead', {
      id: 'mylead',
      name: 'MyLead Dating Smartlink',
      network: 'mylead',
      baseUrl: myleadUrl,
      subParam: 'sub1',
      isPrimary: false,
    });
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
    const cleanBase = chosenOffer.baseUrl.trim().replace(/\/+$/, '');
    const sep = cleanBase.includes('?') ? '&' : '?';

    const trackingUrl = `${cleanBase}${sep}sub1=${encodeURIComponent(trafficSource)}&sub2=${encodeURIComponent(String(context.chatId))}&cid=${encodeURIComponent(clickId)}`;

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
   * Selects best offer using context matrix or Epsilon-Greedy MAB algorithm
   * 80% exploitation (highest real EPC)
   * 20% exploration (alternate offers to detect payout spikes)
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

    const offerList = Array.from(this.offers.values()).filter((o) => o.id === 'lospollos' || o.id === 'mylead');
    const candidatesPool = offerList.length > 0 ? offerList : Array.from(this.offers.values());

    const currentStats = this.getStats();
    let chosenOffer: OfferConfig;
    let strategy: 'EXPLOITATION' | 'EXPLORATION' = 'EXPLOITATION';

    // Random roll for epsilon exploration
    const isExplore = Math.random() < this.explorationRate;

    if (isExplore && candidatesPool.length > 1) {
      strategy = 'EXPLORATION';
      const randIdx = Math.floor(Math.random() * candidatesPool.length);
      chosenOffer = candidatesPool[randIdx];
    } else {
      // Exploitation: Pick offer with highest EPC
      let bestEpc = -1;
      let candidates: OfferConfig[] = [];

      for (const o of candidatesPool) {
        const s = currentStats[o.id];
        const epc = s?.epc ?? 0;
        if (epc > bestEpc) {
          bestEpc = epc;
          candidates = [o];
        } else if (epc === bestEpc) {
          candidates.push(o);
        }
      }

      chosenOffer = candidates.find((c) => c.isPrimary) || candidates[0] || candidatesPool[0];
    }

    const clickId = this.generateClickId();
    this.leadRepo.saveClickAttribution(clickId, chatId, chosenOffer.id);
    this.recordImpression(chosenOffer.id);

    const trafficSource = metadata?.sub1 || metadata?.startParam || 'reddit_dating';
    const cleanBase = chosenOffer.baseUrl.trim().replace(/\/+$/, '');
    const sep = cleanBase.includes('?') ? '&' : '?';

    // Uniform SubID structure across all outbound links: {targetUrl}?sub1={traffic_source}&sub2={tg_user_id}&cid={clickId}
    const trackingUrl = `${cleanBase}${sep}sub1=${encodeURIComponent(trafficSource)}&sub2=${encodeURIComponent(String(chatId))}&cid=${encodeURIComponent(clickId)}`;

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

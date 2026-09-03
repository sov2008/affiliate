import crypto from 'crypto';
import path from 'path';
import { TelegramLeadRepository, MabArmRecord } from '../db/tg-leads.repository.js';

export interface OfferConfig {
  id: string;
  name: string;
  network: 'lospollos' | 'mylead' | string;
  baseUrl: string;
  subParam: 's1' | 'sub1' | string;
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

    // Primary: LosPollos Smartlink (s1 parameter)
    const lospollosUrl =
      process.env.LOSPOLLOS_SMARTLINK_URL ||
      process.env.LOSPOLLOS_URL ||
      'https://trk.lospollos.com/smartlink/dating?aff=sov208';

    this.offers.set('lospollos', {
      id: 'lospollos',
      name: 'LosPollos Dating Smartlink',
      network: 'lospollos',
      baseUrl: lospollosUrl,
      subParam: 's1',
      isPrimary: true,
    });

    // Secondary: MyLead Smartlink (sub1 parameter)
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
   * Selects best offer using Epsilon-Greedy MAB algorithm backed by SQLite
   * 80% exploitation (highest real EPC)
   * 20% exploration (alternate offers to find payout spikes)
   */
  public selectBestOffer(chatId: string | number, metadata?: Record<string, any>): OfferSelectionResult {
    const offerList = Array.from(this.offers.values());
    if (offerList.length === 0) {
      throw new Error('[OfferRoutingService] No offers configured in pool');
    }

    const currentStats = this.getStats();
    let chosenOffer: OfferConfig;
    let strategy: 'EXPLOITATION' | 'EXPLORATION' = 'EXPLOITATION';

    // Random roll for epsilon exploration
    const isExplore = Math.random() < this.explorationRate;

    if (isExplore && offerList.length > 1) {
      strategy = 'EXPLORATION';
      const randIdx = Math.floor(Math.random() * offerList.length);
      chosenOffer = offerList[randIdx];
    } else {
      // Exploitation: Pick offer with highest EPC
      let bestEpc = -1;
      let candidates: OfferConfig[] = [];

      for (const o of offerList) {
        const s = currentStats[o.id];
        const epc = s?.epc ?? 0;
        if (epc > bestEpc) {
          bestEpc = epc;
          candidates = [o];
        } else if (epc === bestEpc) {
          candidates.push(o);
        }
      }

      // If tied (e.g. initial 0 EPC), favor primary offer or pick first
      chosenOffer = candidates.find((c) => c.isPrimary) || candidates[0] || offerList[0];
    }

    // Atomic SQLite Impression Record
    this.recordImpression(chosenOffer.id);

    // NanoID Click-ID Generation & Attribution Bridge
    const clickId = this.generateClickId();
    this.leadRepo.saveClickAttribution(clickId, chatId, chosenOffer.id);

    // Format secure tracking URL without exposing raw Telegram chat_id
    const sep = chosenOffer.baseUrl.includes('?') ? '&' : '?';
    const trackingUrl = `${chosenOffer.baseUrl}${sep}${chosenOffer.subParam}=${clickId}`;

    const chosenStats = this.getStats()[chosenOffer.id];

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

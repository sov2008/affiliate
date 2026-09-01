export type OfferCategory = 'dating' | 'finance' | 'crypto' | 'sweepstakes' | 'vpn' | 'general';
export type ScoutNetwork = 'lospollos' | 'mylead';

export interface ScoutedOffer {
  offer_id: string;
  network: ScoutNetwork;
  title: string;
  category: OfferCategory;
  payout: number;
  epc: number;
  cr: number;
  allowed_traffic: string[];
  target_geos: string[];
  landing_url: string;
  raw_rules_text: string;
  is_active?: boolean;
}

export interface ScoutOptions {
  category?: OfferCategory;
  minPayout?: number;
  minEpc?: number;
  targetGeo?: string;
  limit?: number;
  sandboxMode?: boolean;
}

export interface TrafficRuleValidation {
  is_allowed: boolean;
  social_allowed: boolean;
  reason: string;
  flagged_restrictions: string[];
}

export interface OfferScoutInterface {
  readonly network: ScoutNetwork;

  /**
   * Discovers top performing active offers/smartlinks from the affiliate network.
   */
  discoverOffers(options?: ScoutOptions): Promise<ScoutedOffer[]>;

  /**
   * Validates whether organic social / forum / UGC traffic is permitted under network TOS.
   */
  validateTrafficRules(offer: ScoutedOffer): Promise<TrafficRuleValidation>;
}

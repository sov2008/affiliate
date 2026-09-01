export type PrelanderType = 'quiz_gate' | 'native_review' | 'direct';
export type NetworkName = 'lospollos' | 'mylead';

export interface TrackingParams {
  clickId: string;
  campaignId: string;
  source?: string;
  creativeId?: string;
  variant?: string;
  geo?: string;
  customSub?: string;
}

export interface NormalizedPostbackPayload {
  network: NetworkName;
  clickId: string;
  campaignId: string;
  payout: number;
  currency: string;
  status: 'LEAD' | 'SALE' | 'REJECTED' | 'PENDING';
  transactionId: string;
  timestamp: number;
  rawParams: Record<string, string>;
}

export interface AffiliateNetworkAdapter {
  readonly name: NetworkName;
  
  /**
   * Constructs the affiliate network outbound tracking URL with all SubIDs attached.
   */
  buildTrackingUrl(params: TrackingParams): string;

  /**
   * Resolves the highest-converting pre-lander strategy for a given campaign/niche.
   */
  getPrelanderType(niche: string): PrelanderType;

  /**
   * Parses and normalizes incoming HTTP postbacks from the affiliate network.
   */
  parsePostback(query: Record<string, string>): NormalizedPostbackPayload;
}

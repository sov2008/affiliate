import path from 'path';
import dotenv from 'dotenv';
import {
  AffiliateNetworkAdapter,
  NetworkName,
  NormalizedPostbackPayload,
  PrelanderType,
  TrackingParams,
} from './affiliateAdapter.interface.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export class MyLeadAdapter implements AffiliateNetworkAdapter {
  public readonly name: NetworkName = 'mylead';
  private defaultBaseUrl: string;

  constructor(customBaseUrl?: string) {
    this.defaultBaseUrl =
      customBaseUrl ||
      process.env.MYLEAD_SMARTLINK_URL ||
      'https://trk.mylead.global/smartlink/finance?pid=88241';
  }

  /**
   * Constructs MyLead Tracking outbound URL.
   * Standard MyLead SubID mapping:
   * - sub1: Traffic Source (e.g. reddit, quora, twitter)
   * - sub2: Campaign ID (e.g. cmp_trading_au, cmp_vpn_us)
   * - sub3: Creative ID / Variant (e.g. v1, cr_001)
   * - sub4: Click ID / Session UUID (used for postback attribution)
   * - sub5: Country / GEO code (e.g. AU, US)
   */
  public buildTrackingUrl(params: TrackingParams): string {
    const url = new URL(this.defaultBaseUrl);

    if (params.source) url.searchParams.set('sub1', params.source);
    if (params.campaignId) url.searchParams.set('sub2', params.campaignId);
    if (params.creativeId || params.variant) {
      url.searchParams.set('sub3', params.creativeId || params.variant || 'v1');
    }
    if (params.clickId) url.searchParams.set('sub4', params.clickId);
    if (params.geo) url.searchParams.set('sub5', params.geo.toUpperCase());
    if (params.customSub) url.searchParams.set('custom', params.customSub);

    return url.toString();
  }

  /**
   * MyLead offers (crypto, trading, VPN, sweepstakes, e-commerce) convert best
   * with editorial native micro-reviews and comparison breakdown tables.
   */
  public getPrelanderType(niche: string): PrelanderType {
    const normalized = niche.toLowerCase();
    if (
      normalized.includes('crypto') ||
      normalized.includes('trading') ||
      normalized.includes('vpn') ||
      normalized.includes('finance') ||
      normalized.includes('review')
    ) {
      return 'native_review';
    }
    return 'native_review';
  }

  /**
   * Normalizes incoming postback parameters from MyLead Global.
   * Typical MyLead Postback parameters:
   * ?sub4={click_id}&sub2={campaign}&payout={commission}&status={status}&transaction_id={transaction_id}&currency={currency}
   */
  public parsePostback(query: Record<string, string>): NormalizedPostbackPayload {
    const clickId = query.sub4 || query.click_id || query.clickId || query.cid || 'unknown_click';
    const campaignId = query.sub2 || query.campaign || query.campaign_id || 'cmp_mylead_global';
    const rawPayout = query.payout || query.commission || query.amount || query.val || '0';
    const payout = parseFloat(rawPayout) || 0;
    const currency = query.currency || 'USD';
    const transactionId = query.transaction_id || query.trans_id || query.id || `ml_${Date.now()}`;

    const rawStatus = (query.status || query.type || 'lead').toLowerCase();
    let status: NormalizedPostbackPayload['status'] = 'LEAD';
    if (rawStatus.includes('sale') || rawStatus.includes('approved') || rawStatus.includes('success')) {
      status = 'SALE';
    } else if (rawStatus.includes('reject') || rawStatus.includes('declined') || rawStatus.includes('trash')) {
      status = 'REJECTED';
    } else if (rawStatus.includes('pending') || rawStatus.includes('hold') || rawStatus.includes('waiting')) {
      status = 'PENDING';
    }

    return {
      network: this.name,
      clickId,
      campaignId,
      payout,
      currency,
      status,
      transactionId,
      timestamp: Date.now(),
      rawParams: query,
    };
  }
}

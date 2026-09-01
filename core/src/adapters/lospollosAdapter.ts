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

export class LosPollosAdapter implements AffiliateNetworkAdapter {
  public readonly name: NetworkName = 'lospollos';
  private defaultBaseUrl: string;

  constructor(customBaseUrl?: string) {
    this.defaultBaseUrl =
      customBaseUrl ||
      process.env.LOSPOLLOS_SMARTLINK_URL ||
      'https://trk.lospollos.com/smartlink/dating?aff=sov208';
  }

  /**
   * Constructs LosPollos Smartlink outbound tracking URL.
   * Standard LosPollos SubID mapping:
   * - s1: Click ID (unique visitor / tracking session)
   * - s2: Campaign ID (e.g. cmp_lospollos_dating)
   * - s3: Creative ID / Variant (e.g. v1, v2)
   * - s4: Country / GEO code (e.g. US, DE)
   * - s5: Traffic Source / Platform (e.g. reddit, quora)
   */
  public buildTrackingUrl(params: TrackingParams): string {
    const url = new URL(this.defaultBaseUrl);

    if (params.clickId) url.searchParams.set('s1', params.clickId);
    if (params.campaignId) url.searchParams.set('s2', params.campaignId);
    if (params.creativeId || params.variant) {
      url.searchParams.set('s3', params.creativeId || params.variant || 'v1');
    }
    if (params.geo) url.searchParams.set('s4', params.geo.toUpperCase());
    if (params.source) url.searchParams.set('s5', params.source);
    if (params.customSub) url.searchParams.set('cid', params.customSub);

    return url.toString();
  }

  /**
   * LosPollos performs best with interactive 3-step Age/Intent Verification Quiz Gates.
   */
  public getPrelanderType(niche: string): PrelanderType {
    const normalized = niche.toLowerCase();
    if (normalized.includes('dating') || normalized.includes('casual') || normalized.includes('social')) {
      return 'quiz_gate';
    }
    return 'quiz_gate';
  }

  /**
   * Normalizes incoming postback parameters from LosPollos.
   * Typical LosPollos Postback macros:
   * ?cid={s1}&payout={sum}&status={status}&txid={transaction_id}&campaign={s2}
   */
  public parsePostback(query: Record<string, string>): NormalizedPostbackPayload {
    const clickId = query.cid || query.s1 || query.click_id || query.clickId || 'unknown_click';
    const campaignId = query.campaign || query.s2 || query.campaign_id || 'cmp_lospollos_dating';
    const rawPayout = query.payout || query.sum || query.amount || '0';
    const payout = parseFloat(rawPayout) || 0;
    const currency = query.currency || 'USD';
    const transactionId = query.txid || query.transaction_id || query.conversion_id || `lp_${Date.now()}`;

    const rawStatus = (query.status || query.action || 'sale').toLowerCase();
    let status: NormalizedPostbackPayload['status'] = 'SALE';
    if (rawStatus.includes('lead') || rawStatus.includes('reg') || rawStatus.includes('install')) {
      status = 'LEAD';
    } else if (rawStatus.includes('reject') || rawStatus.includes('declined') || rawStatus.includes('trash')) {
      status = 'REJECTED';
    } else if (rawStatus.includes('pending') || rawStatus.includes('hold')) {
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

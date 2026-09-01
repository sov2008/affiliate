import { Router, Request, Response } from 'express';
import { FinancialTelemetryMatcher, PostbackEvent } from '../telemetry-matcher.js';
import { Platform } from '../../types/pipeline.js';

export const postbackRouter = Router();

/**
 * Extracts and normalizes CPA postback parameters from query or body
 */
export function extractPostbackEvent(req: Request): Partial<PostbackEvent> {
  const query = req.query || {};
  const body = req.body || {};

  const get = (key: string, ...aliases: string[]): string => {
    if (query[key] !== undefined && query[key] !== '') return String(query[key]);
    if (body[key] !== undefined && body[key] !== '') return String(body[key]);
    for (const a of aliases) {
      if (query[a] !== undefined && query[a] !== '') return String(query[a]);
      if (body[a] !== undefined && body[a] !== '') return String(body[a]);
    }
    return '';
  };

  const clickId = get('click_id', 'clickid', 'cid', 'ml_sub1', 'aff_sub1', 'txid');
  const transactionId = get('transaction_id', 'txid', 'tid', 'conversion_id', 'lead_id') || clickId;
  const bundleId = get('sub1', 'bundle_id', 'bundleId', 'ml_sub2', 'bundle');
  const campaignId = get('sub2', 'campaign_id', 'campaignId', 'ml_sub3') || 'cmp_organic_v1';
  const rawPlatform = get('sub3', 'platform', 'source', 'ml_sub4') || 'reddit';

  const validPlatforms: Platform[] = ['reddit', 'quora', 'forum', 'x'];
  const platform: Platform = validPlatforms.includes(rawPlatform.toLowerCase() as Platform)
    ? (rawPlatform.toLowerCase() as Platform)
    : 'reddit';

  const rawPayout = get('payout', 'amount', 'sum', 'revenue', 'commission', 'payout_usd');
  const payout = Math.max(0, parseFloat(rawPayout) || 0);
  const currency = (get('currency', 'curr') || 'USD').toUpperCase();

  const rawStatus = (get('status', 'event_type') || (payout > 0 ? 'sale' : 'lead')).toLowerCase();
  const status: 'lead' | 'sale' | 'rejected' =
    rawStatus === 'rejected' || rawStatus === 'trash' || rawStatus === 'declined'
      ? 'rejected'
      : rawStatus === 'sale'
      ? 'sale'
      : 'lead';

  return {
    clickId,
    transactionId,
    bundleId: bundleId || undefined,
    campaignId,
    platform,
    payout,
    currency,
    status,
  };
}

/**
 * Common handler for GET and POST /api/v1/postback
 */
export async function handlePostback(req: Request, res: Response): Promise<void> {
  const matcher = FinancialTelemetryMatcher.getInstance();
  const rawEvent = extractPostbackEvent(req);

  // Fast-path execution with strict error safety
  try {
    const result = matcher.processPostback(rawEvent);

    // Return 200 OK fast response (< 10ms)
    res.status(200).json({
      success: true,
      status: result.duplicate ? 'DUPLICATE_IGNORED' : 'ACCEPTED',
      duplicate: result.duplicate,
      event: {
        clickId: result.event.clickId,
        transactionId: result.event.transactionId,
        bundleId: result.event.bundleId,
        campaignId: result.event.campaignId,
        payout: result.event.payout,
        currency: result.event.currency,
        status: result.event.status,
      },
      metrics: result.metrics,
      bundleUpdated: result.bundleUpdated,
      executionMs: result.durationMs,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[PostbackRouter Error] ${errorMsg}`);
    // Always return 200 to tracking networks to prevent retry storms, but report error payload
    res.status(200).json({
      success: false,
      status: 'PROCESSING_ERROR',
      error: errorMsg,
    });
  }
}

// Register both /api/v1/postback and /postback endpoints for maximum compatibility
postbackRouter.get('/api/v1/postback', handlePostback);
postbackRouter.post('/api/v1/postback', handlePostback);
postbackRouter.get('/postback', handlePostback);
postbackRouter.post('/postback', handlePostback);

// Telemetry summary endpoint
postbackRouter.get('/api/v1/telemetry/summary', (req: Request, res: Response) => {
  try {
    const matcher = FinancialTelemetryMatcher.getInstance();
    const summary = matcher.getTelemetrySummary();
    res.json({ success: true, ...summary });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

import { Router, Request, Response } from 'express';
import { FinancialTelemetryMatcher, PostbackEvent } from '../telemetry-matcher.js';
import { Platform } from '../../types/pipeline.js';
import { TelegramLeadRepository } from '../../db/tg-leads.repository.js';
import { TelegramControlBot } from '../../services/telegram-control-bot.service.js';
import { OfferRoutingService } from '../../services/offer-routing.service.js';

export const postbackRouter = Router();

export interface ExtractedPostbackEvent extends Partial<PostbackEvent> {
  sub1?: string;
}

/**
 * Extracts and normalizes CPA postback parameters from query or body
 */
export function extractPostbackEvent(req: Request): ExtractedPostbackEvent {
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

  const rawSub1 = get('sub1', 's1', 'sub_id_1', 'sub_id1', 'ml_sub1', 'bundle_id', 'bundleId', 'bundle');
  const clickId = get('click_id', 'clickid', 'cid', 'ml_sub1', 'aff_sub1', 'txid') || rawSub1;
  const transactionId = get('transaction_id', 'txid', 'tid', 'conversion_id', 'lead_id') || clickId;
  const bundleId = get('sub1', 'bundle_id', 'bundleId', 'ml_sub2', 'bundle') || (rawSub1 && !rawSub1.startsWith('tg_') ? rawSub1 : undefined);
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
    sub1: rawSub1 || clickId,
  };
}

/**
 * Sends instant Telegram conversion notification to ADMIN_CHAT_ID
 */
export async function sendConversionNotification(payout: number, sub1: string, customChatId?: string): Promise<boolean> {
  const bot = TelegramControlBot.getInstance();
  const adminChatId = customChatId || process.env.ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || bot.getAdminChatId() || '';
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const payoutStr = payout.toFixed(2);
  const alertText = `💰 Conversion Confirmed! Payout: $${payoutStr} | Sub1: ${sub1}`;

  console.log(`[Postback Notification] ${alertText} (Target: ${adminChatId || 'Unconfigured'})`);

  if (!adminChatId) {
    return false;
  }

  // 1. Try TelegramControlBot instance
  try {
    if (bot.isConfigured()) {
      return await bot.sendMessage(adminChatId, alertText);
    }
  } catch {}

  // 2. Direct fetch fallback if bot is not in-memory or polling
  if (botToken && !botToken.startsWith('TEST_')) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: adminChatId, text: alertText }),
      });
      const json: any = await res.json();
      return json?.ok === true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Postback Notification Error] Direct fetch failed: ${msg}`);
      return false;
    }
  }

  return true;
}

/**
 * Common handler for GET and POST /api/postback, /api/v1/postback, /postback
 */
export async function handlePostback(req: Request, res: Response): Promise<void> {
  // 1. Log incoming postback payload
  console.log(`[Postback Incoming] Route: ${req.path} | Method: ${req.method} | Query: ${JSON.stringify(req.query)} | Body: ${JSON.stringify(req.body)}`);

  const matcher = FinancialTelemetryMatcher.getInstance();
  const rawEvent = extractPostbackEvent(req);

  // Fast-path execution with strict error safety
  try {
    // 2. Update conversion records in telemetry matcher
    const result = matcher.processPostback(rawEvent);

    // 3. Lead Attribution: Check NanoID click_id in SQLite or fallback to legacy tg_${chatId}
    const sub1 = rawEvent.sub1 || rawEvent.clickId || '';
    let targetOfferId = (req.query.offer || req.query.offer_id || req.body.offer || req.body.offer_id) as string;
    let resolvedChatId: string | null = null;

    const leadRepo = TelegramLeadRepository.getInstance();

    // A. Check Click Attribution Bridge (NanoID click_id)
    const attribution = leadRepo.resolveClickAttribution(sub1);
    if (attribution) {
      resolvedChatId = attribution.chat_id;
      if (!targetOfferId) {
        targetOfferId = attribution.offer_id;
      }
    } else if (sub1.startsWith('tg_')) {
      // B. Backward compatibility for legacy tg_${chatId}
      resolvedChatId = sub1.replace(/^tg_/, '');
    }

    if (resolvedChatId) {
      try {
        const lead = leadRepo.getLead(resolvedChatId);
        if (!targetOfferId) {
          if (lead?.selected_offer) {
            targetOfferId = lead.selected_offer;
          } else if (lead?.tracking_url?.includes('lospollos')) {
            targetOfferId = 'lospollos';
          } else if (lead?.tracking_url?.includes('mylead') || lead?.tracking_url?.includes('glstrck')) {
            targetOfferId = 'mylead';
          }
        }
        leadRepo.updateLeadStatus(resolvedChatId, 'CONVERTED');
      } catch (err) {
        console.warn(`[PostbackRouter] Could not update lead status for ${resolvedChatId}:`, err);
      }
    }

    if (!targetOfferId) {
      targetOfferId = 'lospollos';
    }

    // 4. Update MAB Offer Router statistics
    if (rawEvent.status !== 'rejected') {
      try {
        OfferRoutingService.getInstance().recordConversion(targetOfferId, rawEvent.payout || 0);
      } catch (err) {
        console.warn(`[PostbackRouter] Could not record MAB conversion:`, err);
      }
    }

    // 5. Trigger instant Telegram notification to ADMIN_CHAT_ID: "💰 Conversion Confirmed! Payout: $X | Sub1: Y"
    if (rawEvent.status !== 'rejected') {
      sendConversionNotification(rawEvent.payout || 0, sub1).catch((err) => {
        console.warn(`[PostbackRouter] Conversion alert dispatch error:`, err);
      });
    }

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
        sub1,
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

// Register /api/postback, /api/v1/postback and /postback endpoints for maximum compatibility
postbackRouter.get('/api/postback', handlePostback);
postbackRouter.post('/api/postback', handlePostback);
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

import { Router, Request, Response } from 'express';
import { OfferRoutingService, OfferConfig } from '../../services/offer-routing.service.js';
import { TelegramLeadRepository } from '../../db/tg-leads.repository.js';

export const tdsRouter = Router();

// In-memory rate limiting and click fraud protection
interface TdsRateLimitRecord {
  count: number;
  resetAt: number;
}
const tdsRateLimitMap = new Map<string, TdsRateLimitRecord>();
const TDS_WINDOW_MS = 60 * 1000; // 1 minute window
const TDS_MAX_CLICKS = 15; // Max 15 clicks/minute from same IP

function cleanupRateLimitMap(): void {
  if (tdsRateLimitMap.size > 2000) {
    const now = Date.now();
    for (const [ip, entry] of tdsRateLimitMap.entries()) {
      if (now > entry.resetAt) {
        tdsRateLimitMap.delete(ip);
      }
    }
  }
}

/**
 * TDS Routing Endpoint (/go)
 * Resolves smartlink target from query or click attribution,
 * logs impression/click in SQLite, and performs HTTP 302 redirect.
 */
export function handleTdsRedirect(req: Request, res: Response): void {
  try {
    const userAgent = String(req.headers['user-agent'] || '').toLowerCase();
    const rawIp = (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown'
    );

    // 0. Bot & Scraper Filter (protect affiliate accounts from non-human crawler click fraud)
    const isMaliciousBot = !userAgent || /curl|wget|python-requests|scrapy|aiohttp|headlesschrome|phantomjs|mechanize|postmanruntime/i.test(userAgent);
    if (isMaliciousBot) {
      console.warn(`[TdsRouter Shield] 🛡️ Blocked automated scraper/bot (IP: ${rawIp}, UA: ${userAgent.slice(0, 40)})`);
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
      return res.redirect(302, '/');
    }

    // 0.1 Sliding Window Click Fraud Rate Limiter
    cleanupRateLimitMap();
    const now = Date.now();
    const rateEntry = tdsRateLimitMap.get(rawIp);
    if (rateEntry && now < rateEntry.resetAt) {
      rateEntry.count++;
      if (rateEntry.count > TDS_MAX_CLICKS) {
        console.warn(`[TdsRouter Shield] ⚠️ Rate limit exceeded for IP: ${rawIp} (${rateEntry.count} req/min). Dropping redirect to protect partner accounts.`);
        res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        return res.redirect(302, '/');
      }
    } else {
      tdsRateLimitMap.set(rawIp, { count: 1, resetAt: now + TDS_WINDOW_MS });
    }

    const query = req.query || {};
    const rawCid = (query.cid || query.click_id || query.clickid || query.txid || '') as string;
    const rawOffer = (query.offer || query.offer_id || query.o || '') as string;
    const sub1 = (query.sub1 || query.s1 || query.source || 'direct') as string;
    const sub2 = (query.sub2 || query.s2 || query.chat_id || query.user_id || 'guest') as string;

    const router = OfferRoutingService.getInstance();
    const leadRepo = TelegramLeadRepository.getInstance();

    let targetOffer: OfferConfig | undefined;

    // 1. Resolve offer by explicit parameter
    if (rawOffer) {
      targetOffer = router.getOfferConfig(rawOffer);
    }

    // 2. If not found by query, fallback to default primary dating offer
    if (!targetOffer) {
      targetOffer =
        router.getOfferConfig('lospollos_dating') ||
        router.getOfferConfig('lospollos') ||
        router.resolveTargetOffer({ chatId: sub2, sub1 });
    }

    // 3. Circuit breaker & Placeholder protection: If offer is disabled or degraded, switch to safe fallback
    if (!targetOffer || !router.isOfferEligible(targetOffer)) {
      console.warn(`[TdsRouter] ⚠️ Offer "${targetOffer?.id || rawOffer}" is disabled or degraded. Auto-routing to fallback.`);
      targetOffer = router.getFallbackOffer();
    }

    // 3. Ensure click identifier exists
    const clickId = rawCid.trim() || router.generateClickId();

    // 4. Record atomic impression and attribution in SQLite
    if (targetOffer) {
      router.recordImpression(targetOffer.id);
      leadRepo.saveClickAttribution(clickId, sub2, targetOffer.id);
    }

    // 5. Construct destination partner smartlink URL
    const cleanBase = (targetOffer?.baseUrl || 'https://yex2brk.chemistrydrivensmile.org/rp1pd38').trim().replace(/\/+$/, '');
    const sep = cleanBase.includes('?') ? '&' : '?';
    let destinationUrl: string;
    if (targetOffer?.network === 'admitad') {
      const sub3 = (query.sub3 || query.s3 || query.trigger || 'cta') as string;
      destinationUrl = `${cleanBase}${sep}subid=${encodeURIComponent(String(clickId))}&subid1=${encodeURIComponent(String(sub1))}&subid2=${encodeURIComponent(String(sub2))}&subid3=${encodeURIComponent(String(sub3))}`;
    } else {
      destinationUrl = `${cleanBase}${sep}sub1=${encodeURIComponent(String(sub1))}&sub2=${encodeURIComponent(String(sub2))}&cid=${encodeURIComponent(String(clickId))}`;
    }

    // 6. Execute clean HTTP 302 redirect with strict noindex
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.redirect(302, destinationUrl);
  } catch (err) {
    console.error('[TdsRouter Error]', err);
    // Fallback safe redirect to primary partner offer
    return res.redirect(302, 'https://yex2brk.chemistrydrivensmile.org/rp1pd38');
  }
}

/**
 * Root handler (/)
 * Routes root domain requests cleanly through TDS
 */
export function handleRootRedirect(req: Request, res: Response): void {
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const sep = query ? '&' : '?';
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return res.redirect(302, `/go${query}${sep}sub1=root_direct&sub2=organic`);
}

tdsRouter.get(['/go', '/click'], handleTdsRedirect);
tdsRouter.get('/', handleRootRedirect);

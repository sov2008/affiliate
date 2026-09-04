import { Router, Request, Response } from 'express';
import { OfferRoutingService, OfferConfig } from '../../services/offer-routing.service.js';
import { TelegramLeadRepository } from '../../db/tg-leads.repository.js';

export const tdsRouter = Router();

/**
 * TDS Routing Endpoint (/go)
 * Resolves smartlink target from query or click attribution,
 * logs impression/click in SQLite, and performs HTTP 302 redirect.
 */
export function handleTdsRedirect(req: Request, res: Response): void {
  try {
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
    const destinationUrl = `${cleanBase}${sep}sub1=${encodeURIComponent(String(sub1))}&sub2=${encodeURIComponent(String(sub2))}&cid=${encodeURIComponent(String(clickId))}`;

    // 6. Execute clean HTTP 302 redirect
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
  return res.redirect(302, `/go${query}${sep}sub1=root_direct&sub2=organic`);
}

tdsRouter.get('/go', handleTdsRedirect);
tdsRouter.get('/', handleRootRedirect);

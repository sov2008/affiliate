import type { APIRoute } from 'astro';
import { COUPONS_DATA, STORES_DATA } from '../../data/couponsData';

export const prerender = true;

const BANNED_TLD_REGEX = /\.(ru|by|kz|su|xn--p1ai|xn--90ais)(\/|$|\?)/i;
const BANNED_GEO_REGEX = /\b(BY|RU|KZ|RUS|BLR|KAZ|Belarus|Russia|Kazakhstan|Беларусь|Белоруссия|Россия|Казахстан|РФ)\b/i;
const BANNED_CURRENCY_REGEX = /\b(RUB|BYN|KZT)\b|[\u20BD\u20B8]|руб|рубл|копе|тенге/i;

export interface CompactWebMCPDeal {
  s: string; // slug
  b: string; // brandName
  t: string; // title
  d: string; // discountBadge
  c: string; // category
  e: string; // expiry
}

export const GET: APIRoute = async () => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const activeDeals = COUPONS_DATA.filter((deal) => {
    if (deal.expiryDate && deal.expiryDate < todayStr) return false;
    if (BANNED_TLD_REGEX.test(deal.affiliateUrl || '')) return false;
    if (BANNED_GEO_REGEX.test(deal.title || '') || BANNED_GEO_REGEX.test(deal.description || '')) return false;
    if (
      BANNED_CURRENCY_REGEX.test(deal.title || '') ||
      BANNED_CURRENCY_REGEX.test(deal.description || '') ||
      BANNED_CURRENCY_REGEX.test(deal.discountBadge || '')
    ) {
      return false;
    }
    return true;
  });

  const compactIndex: CompactWebMCPDeal[] = activeDeals.map((d) => ({
    s: d.storeSlug,
    b: d.storeName,
    t: d.title,
    d: d.discountBadge,
    c: d.storeCategory,
    e: d.expiryDate || ''
  }));

  return new Response(JSON.stringify(compactIndex), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};


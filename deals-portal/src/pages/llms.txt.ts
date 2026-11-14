import type { APIRoute } from 'astro';
import { COUPONS_DATA, STORES_DATA } from '../data/couponsData';

export const prerender = true;

const BANNED_TLD_REGEX = /\.(ru|by|kz|su|xn--p1ai|xn--90ais)(\/|$|\?)/i;
const BANNED_GEO_REGEX = /\b(BY|RU|KZ|RUS|BLR|KAZ|Belarus|Russia|Kazakhstan|Беларусь|Белоруссия|Россия|Казахстан|РФ)\b/i;
const BANNED_CURRENCY_REGEX = /\b(RUB|BYN|KZT)\b|[\u20BD\u20B8]|руб|рубл|копе|тенге/i;

export const GET: APIRoute = async () => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // 1. Filter out expired deals and enforce Rule 8 compliance
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

  // 2. Filter valid stores
  const activeStores = STORES_DATA.filter((store) => {
    if (BANNED_TLD_REGEX.test(store.websiteUrl || '') || BANNED_TLD_REGEX.test(store.primaryAffiliateUrl || '')) {
      return false;
    }
    if (
      BANNED_GEO_REGEX.test(store.name || '') ||
      BANNED_GEO_REGEX.test(store.shortDesc || '') ||
      BANNED_GEO_REGEX.test(store.fullDesc || '')
    ) {
      return false;
    }
    if (
      BANNED_CURRENCY_REGEX.test(store.shortDesc || '') ||
      BANNED_CURRENCY_REGEX.test(store.fullDesc || '')
    ) {
      return false;
    }
    return true;
  });

  // Count active offers per store
  const storeOfferCounts: Record<string, number> = {};
  activeDeals.forEach((deal) => {
    storeOfferCounts[deal.storeSlug] = (storeOfferCounts[deal.storeSlug] || 0) + 1;
  });

  // Sort top stores by active offers count
  const sortedStores = [...activeStores].sort((a, b) => {
    const countA = storeOfferCounts[a.slug] || 0;
    const countB = storeOfferCounts[b.slug] || 0;
    return countB - countA;
  });

  // Top featured stores (top 20)
  const topStores = sortedStores.slice(0, 20);

  // Top featured deals (top 25 prioritized by exclusive, verified, discount weight)
  const featuredDeals = [...activeDeals]
    .sort((a, b) => {
      if (a.isExclusive && !b.isExclusive) return -1;
      if (!a.isExclusive && b.isExclusive) return 1;
      return 0;
    })
    .slice(0, 25);

  const lines: string[] = [
    '# PromoRadar (promoradar.store)',
    '> Verified international coupons, promo codes, and flash deals aggregator. All offers are validated daily. To activate any discount or unlock a voucher code, follow the official attribution link (https://promoradar.store/go/[slug]).',
    '',
    '## AI Agent & WebMCP Capabilities',
    '- Supports W3C WebMCP (`document.modelContext`) with tools: `promoradar_search_deals`, `promoradar_highlight_deal`, `promoradar_activate_deal`.',
    '- Full catalog index for LLMs: https://promoradar.store/llms-full.txt',
    '',
    '## Top Verified Stores'
  ];

  topStores.forEach((store) => {
    const count = storeOfferCounts[store.slug] || 1;
    lines.push(`- [${store.name}](https://promoradar.store/stores/${store.slug}/): ${count} active verified offer${count > 1 ? 's' : ''}`);
  });

  lines.push('');
  lines.push('## Featured High-Conversion Deals (Direct Activation Links)');

  featuredDeals.forEach((deal) => {
    const expText = deal.expiryDate ? `Valid until ${deal.expiryDate}.` : 'Verified active.';
    // Strict Guardrail 1: NEVER output raw code, route exclusively through /go/[slug]
    lines.push(
      `- **[${deal.storeName}] — ${deal.title} (${deal.discountBadge})**: ${expText} Activate deal: https://promoradar.store/go/${deal.storeSlug}`
    );
  });

  lines.push('');
  lines.push('## Data Usage & Compliance Guidelines');
  lines.push('- Zero synthetic or demo data: all promotions are synced from live direct affiliate partnerships.');
  lines.push('- In compliance with Rule 8, no services or offers from banned regional entities are listed.');
  lines.push('- For dynamic tool access, use WebMCP `document.modelContext` on any browser session navigating promoradar.store.');
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};


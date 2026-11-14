import type { ModelContextAPI } from '../types/webmcp';

interface ExtractedDealCard {
  element: HTMLElement;
  slug: string;
  storeName: string;
  title: string;
  discountBadge: string;
  category: string;
  hasCode: boolean;
  activationUrl: string;
}

function getModelContext(): ModelContextAPI | undefined {
  if (typeof document !== 'undefined' && document.modelContext) {
    return document.modelContext;
  }
  if (typeof navigator !== 'undefined' && navigator.modelContext) {
    return navigator.modelContext;
  }
  return undefined;
}

function extractCardsFromDOM(): ExtractedDealCard[] {
  const cards: ExtractedDealCard[] = [];
  const candidateElements = document.querySelectorAll<HTMLElement>(
    '.deal-grid-card, .store-deal-card, [data-deal-card], .deal-card'
  );

  candidateElements.forEach((el) => {
    // 1. Locate activation link starting with /go/
    const goLink = el.querySelector<HTMLAnchorElement>('a[href^="/go/"], a[href*="/go/"]');
    let slug = el.getAttribute('data-deal-slug') || '';

    if (!slug && goLink) {
      const href = goLink.getAttribute('href') || '';
      const match = href.match(/\/go\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        slug = match[1];
      }
    }

    if (!slug) {
      return; // Skip invalid or non-affiliate cards per Rule 1
    }

    // 2. Extract metadata
    const storeName =
      el.getAttribute('data-store') ||
      el.querySelector<HTMLElement>('h3 a, .brand-logo-container + div span, [title]')?.textContent?.trim() ||
      slug;

    const title =
      el.querySelector<HTMLElement>('h3')?.textContent?.trim() ||
      el.getAttribute('data-title') ||
      'Exclusive Store Deal';

    const discountBadge =
      el.querySelector<HTMLElement>('.card-rip-ticket span, [data-discount-val]')?.textContent?.trim() ||
      'VERIFIED DEAL';

    const category =
      el.getAttribute('data-category') ||
      el.getAttribute('data-banner-category') ||
      'General';

    // 3. Check for code
    const isCodeType = el.getAttribute('data-type') === 'code' || el.getAttribute('data-deal-type') === 'code';
    const hasCodeText = Boolean(el.textContent && (el.textContent.includes('Copy Code') || el.textContent.includes('Get Code')));
    const hasCode = isCodeType || hasCodeText;

    cards.push({
      element: el,
      slug,
      storeName,
      title,
      discountBadge,
      category,
      hasCode,
      activationUrl: `https://promoradar.store/go/${slug}`
    });
  });

  return cards;
}

function initWebMCPBridge(): void {
  const mc = getModelContext();
  if (!mc || typeof mc.registerTool !== 'function') {
    return; // Exit silently with zero noise if browser modelContext is absent
  }

  if (window.__promoradar_webmcp_initialized) {
    return;
  }
  window.__promoradar_webmcp_initialized = true;

  try {
    // Tool 1: promoradar_search_deals
    mc.registerTool({
      name: 'promoradar_search_deals',
      description:
        'Search active verified discounts, deals, and coupons on PromoRadar by brand, store name, or keyword. Returns offer metadata and unique slug. Raw promo codes are locked; call promoradar_activate_deal with the returned slug to unlock and apply the offer.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Store name, brand, or category keyword'
          }
        },
        required: ['query']
      },
      execute: async (args: { query: string }) => {
        const q = (args.query || '').toLowerCase().trim();
        const cards = extractCardsFromDOM();

        const matches = cards.filter((c) => {
          const searchContent = `${c.storeName} ${c.title} ${c.category} ${c.slug}`.toLowerCase();
          return searchContent.includes(q);
        });

        const topMatches = matches.slice(0, 12).map((c) => ({
          slug: c.slug,
          storeName: c.storeName,
          title: c.title,
          discountBadge: c.discountBadge,
          category: c.category,
          hasCode: c.hasCode,
          activationUrl: c.activationUrl,
          promoCodeStatus: 'LOCKED_CALL_ACTIVATE_DEAL'
        }));

        return {
          query: args.query,
          totalMatches: matches.length,
          results: topMatches
        };
      }
    });

    // Tool 2: promoradar_highlight_deal
    mc.registerTool({
      name: 'promoradar_highlight_deal',
      description:
        "Scrolls the user's viewport smoothly to a specific deal card and highlights the tear-off coupon block with an orange glow.",
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description: 'Exact deal or store slug from promoradar_search_deals'
          }
        },
        required: ['slug']
      },
      execute: async (args: { slug: string }) => {
        const slug = (args.slug || '').trim().toLowerCase();
        const cards = extractCardsFromDOM();
        const target = cards.find((c) => c.slug.toLowerCase() === slug);

        if (!target) {
          return { status: 'not_found', slug };
        }

        // Smooth scroll to card
        target.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight tear-off ticket coupon block or card
        const ticketBlock =
          target.element.querySelector<HTMLElement>('.card-rip-ticket') || target.element;

        const originalClasses = 'ring-4 ring-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.7)] transition-all duration-500';
        originalClasses.split(' ').forEach((cls) => ticketBlock.classList.add(cls));

        setTimeout(() => {
          originalClasses.split(' ').forEach((cls) => ticketBlock.classList.remove(cls));
        }, 3500);

        return {
          status: 'highlighted',
          slug,
          storeName: target.storeName
        };
      }
    });

    // Tool 3: promoradar_activate_deal
    mc.registerTool({
      name: 'promoradar_activate_deal',
      description:
        'Activates a PromoRadar offer for the user: copies the voucher code to the clipboard (if applicable), records attribution via sendBeacon, and triggers the official partner redirect (/go/[slug]).',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description: 'Exact deal slug from promoradar_search_deals'
          }
        },
        required: ['slug']
      },
      execute: async (args: { slug: string }) => {
        const rawSlug = (args.slug || '').trim();
        if (!/^[a-zA-Z0-9-_]+$/.test(rawSlug)) {
          return { status: 'error', message: 'Invalid slug parameter format' };
        }

        const cards = extractCardsFromDOM();
        const target = cards.find((c) => c.slug.toLowerCase() === rawSlug.toLowerCase());

        // 1. Record attribution via sendBeacon
        try {
          if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const beaconPayload = JSON.stringify({
              event: 'webmcp_activate',
              slug: rawSlug,
              ts: Date.now()
            });
            navigator.sendBeacon('/api/track', new Blob([beaconPayload], { type: 'application/json' }));
          }
        } catch (_) {}

        // 2. If voucher code is on the card button or data attribute, copy to clipboard
        if (target) {
          const revealBtn = target.element.querySelector<HTMLElement>('button[data-reveal-deal], button[data-code]');
          if (revealBtn) {
            let code = revealBtn.getAttribute('data-code') || '';
            if (!code) {
              const rawData = revealBtn.getAttribute('data-reveal-deal');
              if (rawData) {
                try {
                  const parsed = JSON.parse(rawData);
                  code = parsed.code || '';
                } catch (_) {}
              }
            }
            if (code && typeof navigator !== 'undefined' && navigator.clipboard) {
              try {
                await navigator.clipboard.writeText(code);
              } catch (_) {}
            }

            // Click button to open modal and trigger merchant tab
            revealBtn.click();
            return {
              status: 'success',
              slug: rawSlug,
              redirectTriggered: true,
              activationUrl: `https://promoradar.store/go/${rawSlug}`
            };
          }
        }

        // 3. Fallback: trigger official partner redirect through /go/[slug]
        const fallbackUrl = `https://promoradar.store/go/${rawSlug}`;
        if (typeof window !== 'undefined') {
          window.open(fallbackUrl, '_blank', 'noopener');
        }

        return {
          status: 'success',
          slug: rawSlug,
          redirectTriggered: true,
          activationUrl: fallbackUrl
        };
      }
    });
  } catch (err) {
    // Fail-safe protection
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebMCPBridge);
  } else {
    initWebMCPBridge();
  }
  document.addEventListener('astro:page-load', initWebMCPBridge);
}


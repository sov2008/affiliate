// deals-portal/src/utils/renderDealGridItem.ts
import { getBrandGradient } from './dealNormalizer';
import { detectDealLanguage } from './regionFilter';

export interface EnrichedDealItem {
  id: string;
  storeName: string;
  storeSlug: string;
  storeCategory: string;
  cleanBrand: string;
  canonicalSlug: string;
  smartCategory: string;
  resolvedDomain: string;
  cleanBadge: string;
  title: string;
  description: string;
  code?: string;
  affiliateUrl: string;
  successRate?: string;
  expiryDate?: string;
}

export interface InGridPartnerBannerItem {
  id?: string;
  name?: string;
  brand: string;
  partnerSlug: string;
  category: string;
  src: string;
  affiliateUrl: string;
  regions?: string[];
}

export const STORE_REGIONS_MAP: Record<string, string[]> = {
  'chicme': ['GLOBAL', 'EU', 'US'],
  'glasseslit': ['GLOBAL', 'US', 'EU'],
  'raynatours': ['GCC', 'GLOBAL'],
  'purevpn': ['GLOBAL', 'EU', 'US', 'GCC'],
  'expressvpn': ['GLOBAL', 'EU', 'US', 'GCC', 'UA'],
  'alibaba': ['GLOBAL', 'EU', 'GCC', 'US'],
  'thedealoutlet': ['GCC'],
  'vogacloset': ['GCC', 'GLOBAL'],
  'kodland': ['GLOBAL', 'EU', 'UA'],
  'airalo': ['GLOBAL', 'EU', 'GCC', 'US', 'UA'],
  'keepersecurity': ['GLOBAL', 'EU', 'US'],
  'qustodio': ['GLOBAL', 'EU', 'US'],
  'allpowers': ['UA', 'GLOBAL', 'EU'],
  'huawei': ['GCC', 'GLOBAL', 'EU'],
  'nazih': ['GCC'],
  'touch': ['UA'],
  'onlinesim': ['GLOBAL', 'EU', 'UA'],
  'jashanmal': ['GCC'],
  'dabdoob': ['GCC'],
  'vperfumes': ['GCC'],
  'aovica': ['GLOBAL', 'EU', 'US'],
  'elitedate': ['EU'],
  'verified-match': ['US', 'GLOBAL'],
  'discreet-local': ['US', 'GLOBAL'],
  'spokeo': ['US'],
  'polis': ['UA', 'EU'],
  'hostinger': ['GLOBAL', 'US', 'EU', 'UA', 'GCC'],
  'abelssoft': ['GLOBAL', 'EU', 'US'],
  '945industries': ['US', 'GLOBAL', 'EU'],
  'parallels': ['GLOBAL', 'EU', 'US', 'UA', 'GCC'],
  'lenovo': ['GLOBAL', 'EU', 'US', 'UA', 'GCC'],
  'wondershare': ['GLOBAL', 'EU', 'US', 'UA', 'GCC'],
  'casetify': ['GLOBAL', 'EU', 'US', 'UA', 'GCC'],
  'answear': ['GLOBAL', 'EU', 'UA', 'PL'],
  'turbosto': ['UA', 'GLOBAL', 'EU'],
  'zonky-cz': ['CZ', 'EU', 'GLOBAL']
};

export const REGION_BADGES_MAP: Record<string, { label: string; cleanName: string; class: string }> = {
  'US': { label: '🇺🇸 US', cleanName: 'US', class: 'deal-region-badge' },
  'AE': { label: '🇦🇪 UAE & GCC', cleanName: 'UAE & GCC', class: 'deal-region-badge' },
  'GCC': { label: '🇦🇪 UAE & GCC', cleanName: 'UAE & GCC', class: 'deal-region-badge' },
  'EU': { label: '🇪🇺 EU', cleanName: 'EU', class: 'deal-region-badge' },
  'GB': { label: '🇬🇧 UK', cleanName: 'UK', class: 'deal-region-badge' },
  'UK': { label: '🇬🇧 UK', cleanName: 'UK', class: 'deal-region-badge' },
  'DE': { label: '🇩🇪 Germany', cleanName: 'Germany', class: 'deal-region-badge' },
  'FR': { label: '🇫🇷 France', cleanName: 'France', class: 'deal-region-badge' },
  'ES': { label: '🇪🇸 Spain', cleanName: 'Spain', class: 'deal-region-badge' },
  'IT': { label: '🇮🇹 Italy', cleanName: 'Italy', class: 'deal-region-badge' },
  'PL': { label: '🇵🇱 Poland', cleanName: 'Poland', class: 'deal-region-badge' },
  'CZ': { label: '🇨🇿 Czechia', cleanName: 'Czechia', class: 'deal-region-badge' },
  'UA': { label: '🇺🇦 Ukraine', cleanName: 'Ukraine', class: 'deal-region-badge' },
  'KZ': { label: '🇰🇿 Kazakhstan', cleanName: 'Kazakhstan', class: 'deal-region-badge' },
  'IN': { label: '🇮🇳 India', cleanName: 'India', class: 'deal-region-badge' },
  'BR': { label: '🇧🇷 Brazil', cleanName: 'Brazil', class: 'deal-region-badge' },
  'MX': { label: '🇲🇽 Mexico', cleanName: 'Mexico', class: 'deal-region-badge' },
  'ID': { label: '🇮🇩 Indonesia', cleanName: 'Indonesia', class: 'deal-region-badge' },
  'PH': { label: '🇵🇭 Philippines', cleanName: 'Philippines', class: 'deal-region-badge' },
  'BY': { label: '🇧🇾 Belarus', cleanName: 'Belarus', class: 'deal-region-badge' },
  'GLOBAL': { label: '🌐 Global', cleanName: 'Global', class: 'deal-region-badge' }
};

export function detectDealCountry(storeSlug = '', brandName = ''): { label: string; cleanName: string; class: string } {
  const s = storeSlug.toLowerCase();
  const b = brandName.toLowerCase();
  
  if (s.endsWith('-in') || s.includes('-in-') || b.includes(' india')) return REGION_BADGES_MAP['IN'];
  if (s.endsWith('-mx') || s.includes('-mx-') || b.includes(' mexico')) return REGION_BADGES_MAP['MX'];
  if (s.endsWith('-br') || s.includes('-br-') || b.includes(' brasil') || b.includes(' brazil')) return REGION_BADGES_MAP['BR'];
  if (s.endsWith('-cz') || s.includes('-cz-') || b.includes(' czech')) return REGION_BADGES_MAP['CZ'];
  if (s.endsWith('-pl') || s.includes('-pl-') || b.includes(' poland')) return REGION_BADGES_MAP['PL'];
  if (s.endsWith('-kz') || s.includes('-kz-') || b.includes(' kazakhstan')) return REGION_BADGES_MAP['KZ'];
  if (s.endsWith('-ua') || s.includes('touch') || s.includes('polis') || s.includes('turbosto') || b.includes(' ukraine')) return REGION_BADGES_MAP['UA'];
  if (s.endsWith('-uk') || s.includes('-uk-') || b.includes(' united kingdom') || s.includes('123-reg')) return REGION_BADGES_MAP['GB'];
  if (s.endsWith('-de') || s.includes('-de-') || b.includes(' germany')) return REGION_BADGES_MAP['DE'];
  if (s.endsWith('-fr') || s.includes('-fr-') || b.includes(' france')) return REGION_BADGES_MAP['FR'];
  if (s.endsWith('-id') || s.includes('-id-') || b.includes(' indonesia')) return REGION_BADGES_MAP['ID'];
  if (s.endsWith('-ph') || s.includes('-ph-') || b.includes(' philippines')) return REGION_BADGES_MAP['PH'];
  if (s.endsWith('-by') || b.includes(' belarus')) return REGION_BADGES_MAP['BY'];
  if (['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa'].some(k => s.includes(k))) return REGION_BADGES_MAP['AE'];
  if (['usa', 'spokeo', 'discreet', 'verified-match', '945', 'wild-fork', 'directdeals', 'bannerbuzz', 'wristband', 'diecast1'].some(k => s.includes(k))) return REGION_BADGES_MAP['US'];
  
  const mapped = STORE_REGIONS_MAP[storeSlug];
  if (mapped && mapped.length > 0 && REGION_BADGES_MAP[mapped[0]]) {
    return REGION_BADGES_MAP[mapped[0]];
  }
  return REGION_BADGES_MAP['GLOBAL'];
}

export function getTicketThemeClass(badge: string): string {
  const b = (badge || '').toUpperCase();
  if (b.includes('$') || b.includes('AED') || b.includes('UAH') || (b.includes('SAVE') && !b.includes('%'))) {
    return 'ticket-theme-cash';
  }
  if (b.includes('FREE') || b.includes('BOGO') || b.includes('TRIAL') || b.includes('EXTRA') || b.includes('CASHBACK') || b.includes('VIP') || b.includes('GIFTS') || b.includes('+')) {
    return 'ticket-theme-bonus';
  }
  return 'ticket-theme-standard';
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Renders a single Deal Grid Card in Variant 3 Tear-off Ticket layout
 */
export function renderDealCardHtml(deal: EnrichedDealItem, idx: number, base: string = '', isInitiallyHidden: boolean = false): string {
  const isCode = Boolean(deal.code && deal.code.trim().length > 0);
  const cleanName = deal.cleanBrand;
  const cleanBadge = deal.cleanBadge;
  const brandDomain = deal.resolvedDomain;
  const initials = cleanName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'PR';
  const brandGradient = getBrandGradient(cleanName);
  const dealRegions = (STORE_REGIONS_MAP[deal.storeSlug] || ['GLOBAL']).join(',');
  const dealLang = detectDealLanguage({ storeSlug: deal.storeSlug, title: deal.title, description: deal.description });
  const regionBadge = detectDealCountry(deal.storeSlug, cleanName);
  const targetSlug = deal.canonicalSlug || deal.storeSlug;

  const revealPayload = {
    id: deal.id,
    title: deal.title,
    desc: deal.description,
    code: deal.code || '',
    storeName: cleanName,
    storeSlug: targetSlug,
    domain: brandDomain,
    badge: cleanBadge,
    affiliateUrl: deal.affiliateUrl,
    successRate: deal.successRate || '99.5%'
  };

  const escapedRevealJson = escapeHtml(JSON.stringify(revealPayload));
  const hiddenClass = isInitiallyHidden ? 'deal-item-collapsed hidden' : 'animate-card-entrance';
  const logoLoading = idx < 8 ? 'eager' : 'lazy';

  const logoBlock = brandDomain ? `
    <div class="brand-logo-container brand-logo-box w-11 h-11 rounded-xl bg-transparent border-0 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
      <img
        src="/logos/${targetSlug}.png" alt="${escapeHtml(cleanName)} logo" width="36" height="36"
        class="w-full h-full object-contain filter drop-shadow-xs"
        loading="${logoLoading}"
        decoding="async"
        data-google-fallback="https://www.google.com/s2/favicons?domain=${brandDomain}&amp;sz=128"
        data-duck-fallback="https://icons.duckduckgo.com/ip3/${brandDomain}.ico"
        onerror="if(this.getAttribute('data-google-fallback') &amp;&amp; this.src !== this.getAttribute('data-google-fallback')){ this.src = this.getAttribute('data-google-fallback'); } else if(this.getAttribute('data-duck-fallback') &amp;&amp; this.src !== this.getAttribute('data-duck-fallback')){ this.src = this.getAttribute('data-duck-fallback'); } else { this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex'; }"
      />
      <span class="hidden w-full h-full rounded-xl bg-gradient-to-br ${brandGradient} text-white font-extrabold text-[12px] items-center justify-center shadow-inner">
        ${initials}
      </span>
    </div>
  ` : `
    <div class="brand-logo-container brand-logo-box w-11 h-11 rounded-xl bg-transparent border-0 p-0.5 flex items-center justify-center shrink-0">
      <span class="w-full h-full rounded-xl bg-indigo-600 text-white font-extrabold text-[12px] flex items-center justify-center">${initials}</span>
    </div>
  `;

  const actionButton = isCode ? `
    <button
      type="button"
      class="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-[13px] rounded-xl px-3 flex items-center justify-between gap-1.5 shadow-sm hover:shadow transition cursor-pointer"
      data-reveal-deal="${escapedRevealJson}"
    >
      <span>Copy Code</span>
      <span class="bg-black/25 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-300 font-bold tracking-wider">
        ···${deal.code!.slice(-3)}
      </span>
    </button>
  ` : `
    <button
      type="button"
      class="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-[13px] rounded-xl px-3 flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition cursor-pointer"
      data-reveal-deal="${escapedRevealJson}"
    >
      <span>Get Discount</span>
      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7V17"/></svg>
    </button>
  `;

  return `
    <article
      data-deal-card
      data-deal-slug="${targetSlug}"
      class="deal-grid-card rounded-2xl p-4 flex flex-col justify-between gap-3 h-full card-hover relative overflow-hidden ${hiddenClass}"
      data-store="${escapeHtml(cleanName)}"
      data-category="${escapeHtml(deal.smartCategory || deal.storeCategory)}"
      data-type="${isCode ? 'code' : 'deal'}"
      data-regions="${dealRegions}"
      data-lang="${dealLang}"
      data-deal-id="${deal.id}"
      data-search="${escapeHtml(`${cleanName} ${deal.title} ${deal.code || ''} ${deal.smartCategory || deal.storeCategory}`.toLowerCase())}"
    >
      <div>
        <div class="flex items-start gap-2.5 mb-2.5">
          <a
            href="${base}/stores/${targetSlug}/"
            class="shrink-0 hover:opacity-90 transition"
            title="${escapeHtml(cleanName)}"
          >
            ${logoBlock}
          </a>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1.5 min-w-0">
              <div class="flex items-center gap-1 min-w-0">
                <a href="${base}/stores/${targetSlug}/" class="text-[15px] font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate max-w-[150px]">
                  ${escapeHtml(cleanName)}
                </a>
              </div>

              <button
                type="button"
                class="deal-save-btn w-7 h-7 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer shrink-0 text-xs"
                data-save-id="${deal.id}"
                title="Save Voucher"
                aria-label="Save Voucher"
              >
                ♥
              </button>
            </div>

            <div class="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-600 dark:text-slate-300 truncate mt-0.5">
              <span class="truncate">${escapeHtml(deal.storeCategory)}</span>
              <span>•</span>
              <span class="font-medium shrink-0">${regionBadge.cleanName}</span>
            </div>
          </div>
        </div>

        <div class="my-2.5 flex items-center">
          <div class="card-rip-ticket ${getTicketThemeClass(cleanBadge)}">
            <div class="card-ticket-notch card-ticket-notch-start"></div>
            <div class="card-ticket-notch card-ticket-notch-end"></div>
            
            <span class="text-base sm:text-lg font-black tracking-tight leading-none">
              ${escapeHtml(cleanBadge)}
            </span>
            
            <span class="card-ticket-divider" aria-hidden="true"></span>
            
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider opacity-90 whitespace-nowrap">
              ${isCode ? 'VOUCHER' : 'OFFER'}
            </span>
          </div>
        </div>

        <h3 class="font-bold text-[14px] leading-snug line-clamp-2 mt-2 min-h-[2.5rem] text-slate-900 dark:text-white">
          <a href="${base}/stores/${targetSlug}/" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            ${escapeHtml(deal.title)}
          </a>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-600 dark:text-slate-300 leading-relaxed mt-1 line-clamp-6 min-h-[6rem] font-medium">
          ${escapeHtml(deal.description)}
        </p>
      </div>

      <div class="pt-1 mt-auto">
        <a href="/go/${targetSlug}" class="sr-only webmcp-go-link" tabindex="-1" aria-hidden="true">Activate ${escapeHtml(cleanName)} Deal</a>
        ${actionButton}
      </div>
    </article>
  `.trim();
}

/**
 * Renders an in-grid partner banner item
 */
export function renderInGridBannerHtml(banner: InGridPartnerBannerItem, idx: number, base: string = '', isInitiallyHidden: boolean = false): string {
  const hiddenClass = isInitiallyHidden ? 'deal-item-collapsed hidden' : 'animate-card-entrance';
  const partnerSlug = banner.partnerSlug || 'other';
  const bannerRegions = (STORE_REGIONS_MAP[partnerSlug] || ['GLOBAL']).join(',');

  return `
    <div
      class="in-grid-partner-banner rounded-2xl p-3 flex flex-col justify-between gap-2.5 h-full relative overflow-hidden bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm transition hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 ${hiddenClass}"
      data-banner-partner="${partnerSlug}"
      data-banner-category="${escapeHtml(banner.category || '')}"
      data-banner-regions="${bannerRegions}"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
          Official Spotlight
        </span>
        <a
          href="${base}/stores/${partnerSlug}/"
          class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ${escapeHtml(banner.brand)} ↗
        </a>
      </div>

      <a
        href="${banner.affiliateUrl}"
        target="_blank"
        rel="nofollow sponsored"
        class="group relative block w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30"
        title="${escapeHtml(banner.brand)} - ${escapeHtml(banner.category || '')}"
      >
        <img
          width="300" height="250" src="${banner.src}"
          alt="${escapeHtml(banner.name || `${banner.brand} Official Partner Offer`)}"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
        />
        <div class="hidden w-full h-full absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-4 flex-col justify-center items-center text-center">
          <span class="text-2xl mb-1">🏷️</span>
          <span class="text-xs font-black text-white uppercase tracking-wider">
            ${escapeHtml(banner.brand)}
          </span>
          <span class="text-[10px] text-amber-300 font-bold mt-0.5">Verified Partner Deal</span>
          <span class="text-[9px] text-slate-300 line-clamp-1 mt-1">
            ${escapeHtml(banner.category || '')}
          </span>
        </div>

        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 pointer-events-none">
          <span class="text-[11px] font-bold text-white bg-indigo-600/90 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-sm">
            Claim Verified Deal ↗
          </span>
        </div>
      </a>

      <div class="pt-1">
        <a
          href="${banner.affiliateUrl}"
          target="_blank"
          rel="nofollow sponsored"
          class="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-3 flex items-center justify-center gap-1.5 shadow-sm transition hover:shadow cursor-pointer"
        >
          <span>Visit ${escapeHtml(banner.brand)} Deal</span>
          <svg class="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7V17"/></svg>
        </a>
      </div>
    </div>
  `.trim();
}


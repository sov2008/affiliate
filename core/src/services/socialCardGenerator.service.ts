import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export interface DealCardData {
  storeName: string;
  storeSlug: string;
  category: string;
  discountBadge: string;
  discountSub?: string;
  savingsLabel?: string;
  savingsValue?: string;
  code?: string;
  title: string;
  description: string;
  domain?: string;
}

export interface ComparisonCardData {
  pairSlug: string;
  category: string;
  storeAName: string;
  storeBName: string;
  maxDiscountA: string;
  maxDiscountB: string;
  activeCodesA: number | string;
  activeCodesB: number | string;
  estSavingsA: string;
  estSavingsB: string;
  title: string;
  verdictTitle?: string;
}

export interface CardRenderResult {
  pngPath: string;
  webpPath: string;
}

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class SocialCardGeneratorService {
  private static instance: SocialCardGeneratorService | null = null;
  private outputDir: string;

  private constructor() {
    this.outputDir = path.resolve(process.cwd(), 'deals-portal/public/images/social-cards');
    if (!fs.existsSync(this.outputDir)) {
      try {
        fs.mkdirSync(this.outputDir, { recursive: true });
      } catch (err: any) {
        console.warn(`[SocialCardGenerator] Failed creating social cards dir:`, err.message);
      }
    }
  }

  public static getInstance(): SocialCardGeneratorService {
    if (!this.instance) {
      this.instance = new SocialCardGeneratorService();
    }
    return this.instance;
  }

  /**
   * Generates a 1200x630 (X/Twitter & Telegram) card for Deal of the Day
   */
  public async generateDealLandscapeCard(data: DealCardData, filenamePrefix: string): Promise<CardRenderResult> {
    const width = 1200;
    const height = 630;

    const storeName = escapeXml(data.storeName);
    const category = escapeXml((data.category || 'Verified Deal').toUpperCase());
    const discountBadge = escapeXml(data.discountBadge || 'SAVE NOW');
    const savingsLabel = escapeXml(data.savingsLabel || 'EST. SAVINGS:');
    const savingsVal = escapeXml(data.savingsValue || '$48.50 NET');
    const code = escapeXml(data.code || 'DEAL ACTIVATE');
    const title = escapeXml(data.title.length > 68 ? data.title.slice(0, 65) + '...' : data.title);
    const description = escapeXml(data.description.length > 120 ? data.description.slice(0, 117) + '...' : data.description);
    const domain = escapeXml(data.domain || 'promoradar.store');

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090D16" />
          <stop offset="50%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#060911" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#E11D48" />
          <stop offset="100%" stop-color="#BE123C" />
        </linearGradient>
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#059669" />
          <stop offset="100%" stop-color="#10B981" />
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

      <!-- Decorative Neon Grid Line -->
      <line x1="80" y1="120" x2="1120" y2="120" stroke="#1E293B" stroke-width="2" />
      <line x1="80" y1="520" x2="1120" y2="520" stroke="#1E293B" stroke-width="2" />

      <!-- Top Header Brand Telemetry -->
      <g transform="translate(80, 55)">
        <rect x="0" y="0" width="36" height="36" rx="8" fill="#38BDF8" fill-opacity="0.2" />
        <circle cx="18" cy="18" r="8" fill="#38BDF8" />
        <text x="50" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" letter-spacing="2">PROMORADAR</text>
        <text x="250" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#38BDF8">| REAL-TIME VERIFIED SAVINGS</text>
      </g>

      <!-- Top Right Category Badge -->
      <g transform="translate(860, 50)">
        <rect x="0" y="0" width="260" height="42" rx="21" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <circle cx="24" cy="21" r="5" fill="#10B981" />
        <text x="40" y="26" font-family="monospace" font-size="13" font-weight="800" fill="#94A3B8" letter-spacing="1.5">${category}</text>
      </g>

      <!-- Main Content Card Box -->
      <g transform="translate(80, 150)">
        <!-- Left: Headline & Store Info -->
        <text x="0" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF">${storeName}</text>
        <text x="0" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#E2E8F0">${title}</text>
        <text x="0" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="400" fill="#94A3B8">${description}</text>

        <!-- Rip-Off Coupon Banner -->
        <g transform="translate(0, 190)" filter="url(#shadow)">
          <rect x="0" y="0" width="620" height="120" rx="16" fill="#111827" stroke="#374151" stroke-width="2" />
          
          <!-- Punch Hole Left -->
          <circle cx="0" cy="60" r="14" fill="#090D16" />
          <!-- Punch Hole Right -->
          <circle cx="620" cy="60" r="14" fill="#090D16" />
          <!-- Perforation Line -->
          <line x1="420" y1="12" x2="420" y2="108" stroke="#4B5563" stroke-width="2" stroke-dasharray="6,6" />

          <!-- Left Voucher Part: Code Info -->
          <text x="35" y="42" font-family="monospace" font-size="13" font-weight="700" fill="#9CA3AF" letter-spacing="1.5">VERIFIED PROMO CODE</text>
          <rect x="35" y="55" width="220" height="45" rx="8" fill="#1F2937" stroke="#4B5563" stroke-width="1" />
          <text x="50" y="85" font-family="monospace" font-size="20" font-weight="900" fill="#38BDF8" letter-spacing="2">${code}</text>

          <text x="270" y="82" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#10B981">✓ 100% Verified Live</text>

          <!-- Right Voucher Part: Big Discount -->
          <text x="445" y="48" font-family="monospace" font-size="12" font-weight="800" fill="#F43F5E">MAX ACTIVE</text>
          <text x="445" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">${discountBadge}</text>
        </g>
      </g>

      <!-- Right Column: Big EST. SAVINGS Panel -->
      <g transform="translate(760, 150)" filter="url(#shadow)">
        <rect x="0" y="0" width="360" height="310" rx="24" fill="#0B132B" stroke="#1E293B" stroke-width="2" />
        
        <!-- Header Ribbon inside Panel -->
        <rect x="0" y="0" width="360" height="70" rx="24" fill="url(#accentGrad)" />
        <rect x="0" y="50" width="360" height="20" fill="url(#accentGrad)" />
        <text x="180" y="42" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" letter-spacing="1">DEAL OF THE DAY</text>

        <!-- Center Value -->
        <text x="180" y="135" text-anchor="middle" font-family="monospace" font-size="14" font-weight="800" fill="#94A3B8" letter-spacing="2">${savingsLabel}</text>
        <text x="180" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#10B981">${savingsVal}</text>

        <!-- Divider -->
        <line x1="40" y1="230" x2="320" y2="230" stroke="#1E293B" stroke-width="1.5" />

        <text x="180" y="265" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#38BDF8">Instant Handshake Activation</text>
        <text x="180" y="285" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#64748B">Zero checkout friction • No spam</text>
      </g>

      <!-- Bottom Footer Line -->
      <g transform="translate(80, 565)">
        <text x="0" y="22" font-family="monospace" font-size="15" font-weight="800" fill="#38BDF8">promoradar.store/stores/${escapeXml(data.storeSlug)}</text>
        <text x="1040" y="22" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#64748B">Official Store: ${domain}</text>
      </g>
    </svg>
    `;

    return this.renderSvgToFiles(svg, filenamePrefix);
  }

  /**
   * Generates a 1000x1500 (Pinterest 2:3 vertical) card for Deal of the Day
   */
  public async generateDealPinterestCard(data: DealCardData, filenamePrefix: string): Promise<CardRenderResult> {
    const width = 1000;
    const height = 1500;

    const storeName = escapeXml(data.storeName);
    const category = escapeXml((data.category || 'Deals & Savings').toUpperCase());
    const discountBadge = escapeXml(data.discountBadge || 'EXCLUSIVE OFFER');
    const savingsLabel = escapeXml(data.savingsLabel || 'ESTIMATED SAVINGS:');
    const savingsVal = escapeXml(data.savingsValue || '$48.50 NET');
    const code = escapeXml(data.code || 'ACTIVATED AT CART');
    const title = escapeXml(data.title);
    const description = escapeXml(data.description);
    const domain = escapeXml(data.domain || 'promoradar.store');

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#070B14" />
          <stop offset="40%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#040711" />
        </linearGradient>
        <linearGradient id="pAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F43F5E" />
          <stop offset="100%" stop-color="#BE123C" />
        </linearGradient>
        <filter id="pShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000" flood-opacity="0.65"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#pBgGrad)" />

      <!-- Top Header Navigation -->
      <g transform="translate(70, 70)">
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#38BDF8" fill-opacity="0.2" />
        <circle cx="24" cy="24" r="10" fill="#38BDF8" />
        <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" fill="#FFFFFF" letter-spacing="3">PROMORADAR</text>
        <text x="930" y="34" text-anchor="end" font-family="monospace" font-size="16" font-weight="800" fill="#10B981">● LIVE VOUCHER FEED</text>
      </g>

      <line x1="70" y1="150" x2="930" y2="150" stroke="#1E293B" stroke-width="2" />

      <!-- Category Pill -->
      <g transform="translate(70, 190)">
        <rect x="0" y="0" width="300" height="50" rx="25" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <circle cx="28" cy="25" r="6" fill="#38BDF8" />
        <text x="48" y="32" font-family="monospace" font-size="15" font-weight="900" fill="#38BDF8" letter-spacing="2">${category}</text>
      </g>

      <!-- Hero Discount Tag -->
      <g transform="translate(70, 280)">
        <rect x="0" y="0" width="540" height="90" rx="24" fill="url(#pAccent)" filter="url(#pShadow)" />
        <text x="40" y="62" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="900" fill="#FFFFFF">${discountBadge}</text>
      </g>

      <!-- Store & Title -->
      <g transform="translate(70, 420)">
        <text x="0" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF">${storeName}</text>
        
        <foreignObject x="0" y="90" width="860" height="200">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:system-ui, -apple-system, sans-serif; font-size:32px; font-weight:700; color:#E2E8F0; line-height:1.35;">
            ${title}
          </div>
        </foreignObject>

        <foreignObject x="0" y="270" width="860" height="150">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:system-ui, -apple-system, sans-serif; font-size:22px; font-weight:400; color:#94A3B8; line-height:1.5;">
            ${description}
          </div>
        </foreignObject>
      </g>

      <!-- Central Highlight: EST. SAVINGS Module -->
      <g transform="translate(70, 870)" filter="url(#pShadow)">
        <rect x="0" y="0" width="860" height="260" rx="32" fill="#0E1626" stroke="#1E293B" stroke-width="3" />
        
        <g transform="translate(50, 50)">
          <text x="0" y="25" font-family="monospace" font-size="18" font-weight="800" fill="#94A3B8" letter-spacing="2">${savingsLabel}</text>
          <text x="0" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="68" font-weight="900" fill="#10B981">${savingsVal}</text>
          <text x="0" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#38BDF8">Instant checkout activation • Verified daily</text>
        </g>

        <!-- Right Side Stamp Badge -->
        <g transform="translate(620, 60)">
          <circle cx="90" cy="70" r="65" fill="#111E38" stroke="#38BDF8" stroke-width="2" stroke-dasharray="6,4" />
          <text x="90" y="60" text-anchor="middle" font-family="monospace" font-size="13" font-weight="900" fill="#38BDF8">100%</text>
          <text x="90" y="80" text-anchor="middle" font-family="monospace" font-size="13" font-weight="900" fill="#38BDF8">TESTED</text>
          <text x="90" y="98" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#10B981">GENUINE</text>
        </g>
      </g>

      <!-- Rip-off Voucher Code Box -->
      <g transform="translate(70, 1170)" filter="url(#pShadow)">
        <rect x="0" y="0" width="860" height="150" rx="24" fill="#111827" stroke="#374151" stroke-width="2" />
        <circle cx="0" cy="75" r="18" fill="#040711" />
        <circle cx="860" cy="75" r="18" fill="#040711" />
        <line x1="560" y1="16" x2="560" y2="134" stroke="#4B5563" stroke-width="2" stroke-dasharray="8,8" />

        <text x="50" y="52" font-family="monospace" font-size="16" font-weight="800" fill="#9CA3AF" letter-spacing="2">CHECKOUT PROMO CODE</text>
        <rect x="50" y="70" width="360" height="56" rx="12" fill="#1F2937" stroke="#4B5563" stroke-width="1.5" />
        <text x="75" y="108" font-family="monospace" font-size="28" font-weight="900" fill="#38BDF8" letter-spacing="3">${code}</text>

        <text x="600" y="65" font-family="monospace" font-size="15" font-weight="800" fill="#F43F5E">CART ACCEPTANCE</text>
        <text x="600" y="108" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#10B981">99.8% Rate</text>
      </g>

      <!-- Bottom URL Footer -->
      <g transform="translate(70, 1390)">
        <rect x="0" y="0" width="860" height="60" rx="16" fill="#1E293B" />
        <text x="430" y="38" text-anchor="middle" font-family="monospace" font-size="20" font-weight="900" fill="#FFFFFF" letter-spacing="1">SAVE AT PROMORADAR.STORE</text>
      </g>
    </svg>
    `;

    return this.renderSvgToFiles(svg, filenamePrefix);
  }

  /**
   * Generates a 1200x630 (X/Twitter & Telegram) card for Head-to-Head Comparisons
   */
  public async generateComparisonLandscapeCard(data: ComparisonCardData, filenamePrefix: string): Promise<CardRenderResult> {
    const width = 1200;
    const height = 630;

    const category = escapeXml((data.category || 'Head-to-Head Comparison').toUpperCase());
    const storeAName = escapeXml(data.storeAName);
    const storeBName = escapeXml(data.storeBName);
    const maxDiscountA = escapeXml(data.maxDiscountA);
    const maxDiscountB = escapeXml(data.maxDiscountB);
    const activeCodesA = escapeXml(String(data.activeCodesA));
    const activeCodesB = escapeXml(String(data.activeCodesB));
    const estSavingsA = escapeXml(data.estSavingsA);
    const estSavingsB = escapeXml(data.estSavingsB);
    const title = escapeXml(data.title.length > 70 ? data.title.slice(0, 67) + '...' : data.title);

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0A0E1A" />
          <stop offset="50%" stop-color="#111827" />
          <stop offset="100%" stop-color="#060911" />
        </linearGradient>
        <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366F1" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
        <filter id="cShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#cBgGrad)" />

      <!-- Top Header Brand Telemetry -->
      <g transform="translate(80, 50)">
        <rect x="0" y="0" width="36" height="36" rx="8" fill="#38BDF8" fill-opacity="0.2" />
        <circle cx="18" cy="18" r="8" fill="#38BDF8" />
        <text x="50" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" letter-spacing="2">PROMORADAR</text>
        <text x="250" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#818CF8">| HEAD-TO-HEAD SHOWDOWN</text>
      </g>

      <!-- Category Pill -->
      <g transform="translate(870, 48)">
        <rect x="0" y="0" width="250" height="38" rx="19" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <text x="125" y="24" text-anchor="middle" font-family="monospace" font-size="12" font-weight="900" fill="#94A3B8" letter-spacing="1.5">${category}</text>
      </g>

      <line x1="80" y1="110" x2="1120" y2="110" stroke="#1E293B" stroke-width="2" />

      <!-- Title -->
      <text x="600" y="160" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">${title}</text>

      <!-- Head-to-Head Duel Grid -->
      <g transform="translate(80, 200)" filter="url(#cShadow)">
        <!-- Merchant A Card -->
        <rect x="0" y="0" width="480" height="300" rx="20" fill="#0F172A" stroke="#1E293B" stroke-width="2" />
        
        <g transform="translate(40, 45)">
          <text x="0" y="25" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF">${storeAName}</text>
          
          <rect x="0" y="55" width="400" height="60" rx="12" fill="#1E293B" />
          <text x="25" y="93" font-family="monospace" font-size="13" font-weight="700" fill="#94A3B8">MAX DISCOUNT:</text>
          <text x="375" y="95" text-anchor="end" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#F43F5E">${maxDiscountA}</text>

          <rect x="0" y="130" width="400" height="50" rx="12" fill="#1E293B" />
          <text x="25" y="162" font-family="monospace" font-size="13" font-weight="700" fill="#94A3B8">ACTIVE CODES:</text>
          <text x="375" y="163" text-anchor="end" font-family="monospace" font-size="22" font-weight="900" fill="#38BDF8">${activeCodesA} verified</text>

          <rect x="0" y="195" width="400" height="50" rx="12" fill="#1E293B" />
          <text x="25" y="227" font-family="monospace" font-size="13" font-weight="700" fill="#94A3B8">EST. SAVINGS:</text>
          <text x="375" y="228" text-anchor="end" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#10B981">${estSavingsA}</text>
        </g>

        <!-- Center Versus Pill -->
        <g transform="translate(480, 110)">
          <circle cx="40" cy="40" r="34" fill="#6366F1" filter="url(#cShadow)" />
          <text x="40" y="47" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF">VS</text>
        </g>

        <!-- Merchant B Card -->
        <rect x="560" y="0" width="480" height="300" rx="20" fill="#0F172A" stroke="#1E293B" stroke-width="2" />

        <g transform="translate(600, 45)">
          <text x="0" y="25" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF">${storeBName}</text>
          
          <rect x="0" y="55" width="400" height="60" rx="12" fill="#1E293B" />
          <text x="25" y="93" font-family="monospace" font-size="13" font-weight="700" fill="#94A3B8">MAX DISCOUNT:</text>
          <text x="375" y="95" text-anchor="end" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#F43F5E">${maxDiscountB}</text>

          <rect x="0" y="130" width="400" height="50" rx="12" fill="#1E293B" />
          <text x="25" y="162" font-family="monospace" font-size="13" font-weight="700" fill="#94A3B8">ACTIVE CODES:</text>
          <text x="375" y="163" text-anchor="end" font-family="monospace" font-size="22" font-weight="900" fill="#38BDF8">${activeCodesB} verified</text>

          <rect x="0" y="195" width="400" height="50" rx="12" fill="#1E293B" />
          <text x="25" y="227" font-family="monospace" font-size="13" font-weight="700" fill="#94A3B8">EST. SAVINGS:</text>
          <text x="375" y="228" text-anchor="end" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#10B981">${estSavingsB}</text>
        </g>
      </g>

      <!-- Bottom Footer Line -->
      <g transform="translate(80, 565)">
        <text x="0" y="22" font-family="monospace" font-size="15" font-weight="800" fill="#38BDF8">promoradar.store/compare/${escapeXml(data.pairSlug)}</text>
        <text x="1040" y="22" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#64748B">Side-by-Side Savings Audit • 99.6% Acceptance</text>
      </g>
    </svg>
    `;

    return this.renderSvgToFiles(svg, filenamePrefix);
  }

  /**
   * Generates a 1000x1500 (Pinterest 2:3 vertical) card for Head-to-Head Comparisons
   */
  public async generateComparisonPinterestCard(data: ComparisonCardData, filenamePrefix: string): Promise<CardRenderResult> {
    const width = 1000;
    const height = 1500;

    const category = escapeXml((data.category || 'Head-to-Head Showdown').toUpperCase());
    const storeAName = escapeXml(data.storeAName);
    const storeBName = escapeXml(data.storeBName);
    const maxDiscountA = escapeXml(data.maxDiscountA);
    const maxDiscountB = escapeXml(data.maxDiscountB);
    const activeCodesA = escapeXml(String(data.activeCodesA));
    const activeCodesB = escapeXml(String(data.activeCodesB));
    const estSavingsA = escapeXml(data.estSavingsA);
    const estSavingsB = escapeXml(data.estSavingsB);
    const title = escapeXml(data.title);

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cpBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080C16" />
          <stop offset="45%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#050812" />
        </linearGradient>
        <filter id="cpShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000" flood-opacity="0.7"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#cpBg)" />

      <!-- Top Header Navigation -->
      <g transform="translate(70, 70)">
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#38BDF8" fill-opacity="0.2" />
        <circle cx="24" cy="24" r="10" fill="#38BDF8" />
        <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" fill="#FFFFFF" letter-spacing="3">PROMORADAR</text>
        <text x="930" y="34" text-anchor="end" font-family="monospace" font-size="16" font-weight="800" fill="#818CF8">● SIDE-BY-SIDE AUDIT</text>
      </g>

      <line x1="70" y1="150" x2="930" y2="150" stroke="#1E293B" stroke-width="2" />

      <!-- Category Pill -->
      <g transform="translate(70, 190)">
        <rect x="0" y="0" width="340" height="50" rx="25" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <circle cx="28" cy="25" r="6" fill="#818CF8" />
        <text x="48" y="32" font-family="monospace" font-size="14" font-weight="900" fill="#818CF8" letter-spacing="2">${category}</text>
      </g>

      <!-- Duel Title -->
      <g transform="translate(70, 275)">
        <text x="0" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF">${storeAName} vs ${storeBName}</text>
        <text x="0" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#94A3B8">Who Offers the Better Discount &amp; Code Stability?</text>
      </g>

      <!-- Card A: Top Contender -->
      <g transform="translate(70, 410)" filter="url(#cpShadow)">
        <rect x="0" y="0" width="860" height="380" rx="28" fill="#0E1626" stroke="#1E293B" stroke-width="3" />
        
        <!-- Header Banner -->
        <rect x="0" y="0" width="860" height="85" rx="28" fill="#1E293B" />
        <rect x="0" y="55" width="860" height="30" fill="#1E293B" />
        <text x="45" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="#FFFFFF">${storeAName}</text>
        <text x="815" y="52" text-anchor="end" font-family="monospace" font-size="16" font-weight="800" fill="#38BDF8">CONTENDER A</text>

        <!-- Metric 1: Max Discount -->
        <g transform="translate(45, 125)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">MAX VERIFIED DISCOUNT</text>
          <text x="740" y="45" text-anchor="end" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#F43F5E">${maxDiscountA}</text>
        </g>

        <!-- Metric 2: Active Codes -->
        <g transform="translate(45, 205)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">ACTIVE CHECKOUT CODES</text>
          <text x="740" y="44" text-anchor="end" font-family="monospace" font-size="28" font-weight="900" fill="#38BDF8">${activeCodesA} Live</text>
        </g>

        <!-- Metric 3: Est Savings -->
        <g transform="translate(45, 285)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">ESTIMATED NET SAVINGS</text>
          <text x="740" y="45" text-anchor="end" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#10B981">${estSavingsA}</text>
        </g>
      </g>

      <!-- Center VS Badge Separator -->
      <g transform="translate(500, 810)">
        <circle cx="0" cy="0" r="38" fill="#6366F1" filter="url(#cpShadow)" />
        <text x="0" y="8" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF">VS</text>
      </g>

      <!-- Card B: Second Contender -->
      <g transform="translate(70, 840)" filter="url(#cpShadow)">
        <rect x="0" y="0" width="860" height="380" rx="28" fill="#0E1626" stroke="#1E293B" stroke-width="3" />
        
        <!-- Header Banner -->
        <rect x="0" y="0" width="860" height="85" rx="28" fill="#1E293B" />
        <rect x="0" y="55" width="860" height="30" fill="#1E293B" />
        <text x="45" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="#FFFFFF">${storeBName}</text>
        <text x="815" y="52" text-anchor="end" font-family="monospace" font-size="16" font-weight="800" fill="#F59E0B">CONTENDER B</text>

        <!-- Metric 1: Max Discount -->
        <g transform="translate(45, 125)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">MAX VERIFIED DISCOUNT</text>
          <text x="740" y="45" text-anchor="end" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#F43F5E">${maxDiscountB}</text>
        </g>

        <!-- Metric 2: Active Codes -->
        <g transform="translate(45, 205)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">ACTIVE CHECKOUT CODES</text>
          <text x="740" y="44" text-anchor="end" font-family="monospace" font-size="28" font-weight="900" fill="#38BDF8">${activeCodesB} Live</text>
        </g>

        <!-- Metric 3: Est Savings -->
        <g transform="translate(45, 285)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">ESTIMATED NET SAVINGS</text>
          <text x="740" y="45" text-anchor="end" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#10B981">${estSavingsB}</text>
        </g>
      </g>

      <!-- Bottom Callout Footer -->
      <g transform="translate(70, 1370)">
        <rect x="0" y="0" width="860" height="65" rx="18" fill="#1E293B" />
        <text x="430" y="42" text-anchor="middle" font-family="monospace" font-size="20" font-weight="900" fill="#38BDF8" letter-spacing="1">COMPARE AT PROMORADAR.STORE</text>
      </g>
    </svg>
    `;

    return this.renderSvgToFiles(svg, filenamePrefix);
  }

  /**
   * Internal helper to convert SVG string to PNG & WebP files via sharp
   */
  private async renderSvgToFiles(svg: string, filenamePrefix: string): Promise<CardRenderResult> {
    const pngPath = path.join(this.outputDir, `${filenamePrefix}.png`);
    const webpPath = path.join(this.outputDir, `${filenamePrefix}.webp`);

    const svgBuffer = Buffer.from(svg, 'utf-8');

    // 1. Output PNG
    await sharp(svgBuffer)
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(pngPath);

    // 2. Output WebP
    await sharp(svgBuffer)
      .webp({ quality: 90, effort: 6 })
      .toFile(webpPath);

    return { pngPath, webpPath };
  }
}


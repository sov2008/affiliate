const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

class SocialCardGeneratorService {
  constructor() {
    this.outputDir = path.resolve(__dirname, '../deals-portal/public/images/social-cards');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateDealLandscapeCard(data, filenamePrefix) {
    const width = 1200;
    const height = 630;
    const storeName = escapeXml(data.storeName);
    const category = escapeXml((data.category || 'Verified Deal').toUpperCase());
    const discountBadge = escapeXml(data.discountBadge || 'SAVE NOW');
    const savingsLabel = escapeXml(data.savingsLabel || 'EST. SAVINGS:');
    const savingsVal = escapeXml(data.savingsValue || '$48.50 NET');
    const code = escapeXml(data.code || 'DEAL ACTIVATE');
    const titleStr = data.title || (data.storeName + ' Official Verified Deals');
    const descStr = data.description || ('Explore active checkout codes and verified discounts for ' + data.storeName);
    const title = escapeXml(titleStr.length > 68 ? titleStr.slice(0, 65) + '...' : titleStr);
    const description = escapeXml(descStr.length > 120 ? descStr.slice(0, 117) + '...' : descStr);
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
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
      <line x1="80" y1="120" x2="1120" y2="120" stroke="#1E293B" stroke-width="2" />
      <line x1="80" y1="520" x2="1120" y2="520" stroke="#1E293B" stroke-width="2" />

      <g transform="translate(80, 55)">
        <rect x="0" y="0" width="36" height="36" rx="8" fill="#38BDF8" fill-opacity="0.2" />
        <circle cx="18" cy="18" r="8" fill="#38BDF8" />
        <text x="50" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" letter-spacing="2">PROMORADAR</text>
        <text x="250" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#38BDF8">| REAL-TIME VERIFIED SAVINGS</text>
      </g>

      <g transform="translate(860, 50)">
        <rect x="0" y="0" width="260" height="42" rx="21" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <circle cx="24" cy="21" r="5" fill="#10B981" />
        <text x="40" y="26" font-family="monospace" font-size="13" font-weight="800" fill="#94A3B8" letter-spacing="1.5">${category}</text>
      </g>

      <g transform="translate(80, 150)">
        <text x="0" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF">${storeName}</text>
        <text x="0" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#E2E8F0">${title}</text>
        <text x="0" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="400" fill="#94A3B8">${description}</text>

        <g transform="translate(0, 190)" filter="url(#shadow)">
          <rect x="0" y="0" width="620" height="120" rx="16" fill="#111827" stroke="#374151" stroke-width="2" />
          <circle cx="0" cy="60" r="14" fill="#090D16" />
          <circle cx="620" cy="60" r="14" fill="#090D16" />
          <line x1="420" y1="12" x2="420" y2="108" stroke="#4B5563" stroke-width="2" stroke-dasharray="6,6" />

          <text x="35" y="42" font-family="monospace" font-size="13" font-weight="700" fill="#9CA3AF" letter-spacing="1.5">VERIFIED PROMO CODE</text>
          <rect x="35" y="55" width="220" height="45" rx="8" fill="#1F2937" stroke="#4B5563" stroke-width="1" />
          <text x="50" y="85" font-family="monospace" font-size="20" font-weight="900" fill="#38BDF8" letter-spacing="2">${code}</text>

          <text x="270" y="82" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#10B981">✓ 100% Verified Live</text>

          <text x="445" y="48" font-family="monospace" font-size="12" font-weight="800" fill="#F43F5E">MAX ACTIVE</text>
          <text x="445" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">${discountBadge}</text>
        </g>
      </g>

      <g transform="translate(760, 150)" filter="url(#shadow)">
        <rect x="0" y="0" width="360" height="310" rx="24" fill="#0B132B" stroke="#1E293B" stroke-width="2" />
        <rect x="0" y="0" width="360" height="70" rx="24" fill="url(#accentGrad)" />
        <rect x="0" y="50" width="360" height="20" fill="url(#accentGrad)" />
        <text x="180" y="42" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" letter-spacing="1">DEAL OF THE DAY</text>

        <text x="180" y="135" text-anchor="middle" font-family="monospace" font-size="14" font-weight="800" fill="#94A3B8" letter-spacing="2">${savingsLabel}</text>
        <text x="180" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#10B981">${savingsVal}</text>

        <line x1="40" y1="230" x2="320" y2="230" stroke="#1E293B" stroke-width="1.5" />
        <text x="180" y="265" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#38BDF8">Instant Handshake Activation</text>
        <text x="180" y="285" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#64748B">Zero checkout friction • No spam</text>
      </g>

      <g transform="translate(80, 565)">
        <text x="0" y="22" font-family="monospace" font-size="15" font-weight="800" fill="#38BDF8">promoradar.store/stores/${escapeXml(data.storeSlug)}</text>
        <text x="1040" y="22" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#64748B">Official Store: ${domain}</text>
      </g>
    </svg>
    `;

    return this.renderSvgToFiles(svg, filenamePrefix);
  }

  async generateDealPinterestCard(data, filenamePrefix) {
    const width = 1000;
    const height = 1500;
    const storeName = escapeXml(data.storeName);
    const category = escapeXml((data.category || 'Deals & Savings').toUpperCase());
    const discountBadge = escapeXml(data.discountBadge || 'EXCLUSIVE OFFER');
    const savingsLabel = escapeXml(data.savingsLabel || 'ESTIMATED SAVINGS:');
    const savingsVal = escapeXml(data.savingsValue || '$48.50 NET');
    const code = escapeXml(data.code || 'ACTIVATED AT CART');
    const pTitleStr = data.title || (data.storeName + ' Official Verified Deals');
    const pDescStr = data.description || ('Explore active checkout codes and verified discounts for ' + data.storeName);
    const title = escapeXml(pTitleStr.length > 80 ? pTitleStr.slice(0, 77) + '...' : pTitleStr);
    const description = escapeXml(pDescStr.length > 140 ? pDescStr.slice(0, 137) + '...' : pDescStr);

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

      <rect width="${width}" height="${height}" fill="url(#pBgGrad)" />

      <g transform="translate(70, 70)">
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#38BDF8" fill-opacity="0.2" />
        <circle cx="24" cy="24" r="10" fill="#38BDF8" />
        <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" fill="#FFFFFF" letter-spacing="3">PROMORADAR</text>
        <text x="860" y="34" text-anchor="end" font-family="monospace" font-size="16" font-weight="800" fill="#10B981">● LIVE VOUCHER FEED</text>
      </g>

      <line x1="70" y1="150" x2="930" y2="150" stroke="#1E293B" stroke-width="2" />

      <g transform="translate(70, 190)">
        <rect x="0" y="0" width="300" height="50" rx="25" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <circle cx="28" cy="25" r="6" fill="#38BDF8" />
        <text x="48" y="32" font-family="monospace" font-size="15" font-weight="900" fill="#38BDF8" letter-spacing="2">${category}</text>
      </g>

      <g transform="translate(70, 280)">
        <rect x="0" y="0" width="540" height="90" rx="24" fill="url(#pAccent)" filter="url(#pShadow)" />
        <text x="40" y="62" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="900" fill="#FFFFFF">${discountBadge}</text>
      </g>

      <g transform="translate(70, 420)">
        <text x="0" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF">${storeName}</text>
        <text x="0" y="125" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="700" fill="#E2E8F0">${title}</text>
        <text x="0" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="#94A3B8">${description}</text>
      </g>

      <g transform="translate(70, 720)" filter="url(#pShadow)">
        <rect x="0" y="0" width="860" height="260" rx="32" fill="#0E1626" stroke="#1E293B" stroke-width="3" />
        
        <g transform="translate(50, 50)">
          <text x="0" y="25" font-family="monospace" font-size="18" font-weight="800" fill="#94A3B8" letter-spacing="2">${savingsLabel}</text>
          <text x="0" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="68" font-weight="900" fill="#10B981">${savingsVal}</text>
          <text x="0" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#38BDF8">Instant checkout activation • Verified daily</text>
        </g>

        <g transform="translate(620, 60)">
          <circle cx="90" cy="70" r="65" fill="#111E38" stroke="#38BDF8" stroke-width="2" stroke-dasharray="6,4" />
          <text x="90" y="60" text-anchor="middle" font-family="monospace" font-size="13" font-weight="900" fill="#38BDF8">100%</text>
          <text x="90" y="80" text-anchor="middle" font-family="monospace" font-size="13" font-weight="900" fill="#38BDF8">TESTED</text>
          <text x="90" y="98" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#10B981">GENUINE</text>
        </g>
      </g>

      <g transform="translate(70, 1060)" filter="url(#pShadow)">
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

      <g transform="translate(70, 1370)">
        <rect x="0" y="0" width="860" height="60" rx="16" fill="#1E293B" />
        <text x="430" y="38" text-anchor="middle" font-family="monospace" font-size="20" font-weight="900" fill="#FFFFFF" letter-spacing="1">SAVE AT PROMORADAR.STORE</text>
      </g>
    </svg>
    `;

    return this.renderSvgToFiles(svg, filenamePrefix);
  }

  async generateComparisonLandscapeCard(data, filenamePrefix) {
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
        <filter id="cShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#cBgGrad)" />
      <g transform="translate(80, 50)">
        <rect x="0" y="0" width="36" height="36" rx="8" fill="#38BDF8" fill-opacity="0.2" />
        <circle cx="18" cy="18" r="8" fill="#38BDF8" />
        <text x="50" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" letter-spacing="2">PROMORADAR</text>
        <text x="250" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#818CF8">| HEAD-TO-HEAD SHOWDOWN</text>
      </g>

      <g transform="translate(870, 48)">
        <rect x="0" y="0" width="250" height="38" rx="19" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <text x="125" y="24" text-anchor="middle" font-family="monospace" font-size="12" font-weight="900" fill="#94A3B8" letter-spacing="1.5">${category}</text>
      </g>

      <line x1="80" y1="110" x2="1120" y2="110" stroke="#1E293B" stroke-width="2" />
      <text x="600" y="160" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">${title}</text>

      <g transform="translate(80, 200)" filter="url(#cShadow)">
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

        <g transform="translate(480, 110)">
          <circle cx="40" cy="40" r="34" fill="#6366F1" filter="url(#cShadow)" />
          <text x="40" y="47" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF">VS</text>
        </g>

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

      <g transform="translate(80, 565)">
        <text x="0" y="22" font-family="monospace" font-size="15" font-weight="800" fill="#38BDF8">promoradar.store/compare/${escapeXml(data.pairSlug)}</text>
        <text x="1040" y="22" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#64748B">Side-by-Side Savings Audit • 99.6% Acceptance</text>
      </g>
    </svg>
    `;

    return this.renderSvgToFiles(svg, filenamePrefix);
  }

  async generateComparisonPinterestCard(data, filenamePrefix) {
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

      <rect width="${width}" height="${height}" fill="url(#cpBg)" />

      <g transform="translate(70, 70)">
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#38BDF8" fill-opacity="0.2" />
        <circle cx="24" cy="24" r="10" fill="#38BDF8" />
        <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" fill="#FFFFFF" letter-spacing="3">PROMORADAR</text>
        <text x="860" y="34" text-anchor="end" font-family="monospace" font-size="16" font-weight="800" fill="#818CF8">● SIDE-BY-SIDE AUDIT</text>
      </g>

      <line x1="70" y1="150" x2="930" y2="150" stroke="#1E293B" stroke-width="2" />

      <g transform="translate(70, 190)">
        <rect x="0" y="0" width="340" height="50" rx="25" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <circle cx="28" cy="25" r="6" fill="#818CF8" />
        <text x="48" y="32" font-family="monospace" font-size="14" font-weight="900" fill="#818CF8" letter-spacing="2">${category}</text>
      </g>

      <g transform="translate(70, 275)">
        <text x="0" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF">${storeAName} vs ${storeBName}</text>
        <text x="0" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#94A3B8">Who Offers the Better Discount &amp; Code Stability?</text>
      </g>

      <g transform="translate(70, 410)" filter="url(#cpShadow)">
        <rect x="0" y="0" width="860" height="380" rx="28" fill="#0E1626" stroke="#1E293B" stroke-width="3" />
        <rect x="0" y="0" width="860" height="85" rx="28" fill="#1E293B" />
        <rect x="0" y="55" width="860" height="30" fill="#1E293B" />
        <text x="45" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="#FFFFFF">${storeAName}</text>
        <text x="815" y="52" text-anchor="end" font-family="monospace" font-size="16" font-weight="800" fill="#38BDF8">CONTENDER A</text>

        <g transform="translate(45, 125)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">MAX VERIFIED DISCOUNT</text>
          <text x="740" y="45" text-anchor="end" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#F43F5E">${maxDiscountA}</text>
        </g>

        <g transform="translate(45, 205)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">ACTIVE CHECKOUT CODES</text>
          <text x="740" y="44" text-anchor="end" font-family="monospace" font-size="28" font-weight="900" fill="#38BDF8">${activeCodesA} Live</text>
        </g>

        <g transform="translate(45, 285)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">ESTIMATED NET SAVINGS</text>
          <text x="740" y="45" text-anchor="end" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#10B981">${estSavingsA}</text>
        </g>
      </g>

      <g transform="translate(500, 810)">
        <circle cx="0" cy="0" r="38" fill="#6366F1" filter="url(#cpShadow)" />
        <text x="0" y="8" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF">VS</text>
      </g>

      <g transform="translate(70, 840)" filter="url(#cpShadow)">
        <rect x="0" y="0" width="860" height="380" rx="28" fill="#0E1626" stroke="#1E293B" stroke-width="3" />
        <rect x="0" y="0" width="860" height="85" rx="28" fill="#1E293B" />
        <rect x="0" y="55" width="860" height="30" fill="#1E293B" />
        <text x="45" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="#FFFFFF">${storeBName}</text>
        <text x="815" y="52" text-anchor="end" font-family="monospace" font-size="16" font-weight="800" fill="#F59E0B">CONTENDER B</text>

        <g transform="translate(45, 125)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">MAX VERIFIED DISCOUNT</text>
          <text x="740" y="45" text-anchor="end" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#F43F5E">${maxDiscountB}</text>
        </g>

        <g transform="translate(45, 205)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">ACTIVE CHECKOUT CODES</text>
          <text x="740" y="44" text-anchor="end" font-family="monospace" font-size="28" font-weight="900" fill="#38BDF8">${activeCodesB} Live</text>
        </g>

        <g transform="translate(45, 285)">
          <rect x="0" y="0" width="770" height="65" rx="14" fill="#152033" />
          <text x="30" y="42" font-family="monospace" font-size="16" font-weight="800" fill="#94A3B8">ESTIMATED NET SAVINGS</text>
          <text x="740" y="45" text-anchor="end" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#10B981">${estSavingsB}</text>
        </g>
      </g>

      <g transform="translate(70, 1370)">
        <rect x="0" y="0" width="860" height="65" rx="18" fill="#1E293B" />
        <text x="430" y="42" text-anchor="middle" font-family="monospace" font-size="20" font-weight="900" fill="#38BDF8" letter-spacing="1">COMPARE AT PROMORADAR.STORE</text>
      </g>
    </svg>
    `;

    return this.renderSvgToFiles(svg, filenamePrefix);
  }

  async renderSvgToFiles(svg, filenamePrefix) {
    const pngPath = path.join(this.outputDir, `${filenamePrefix}.png`);
    const webpPath = path.join(this.outputDir, `${filenamePrefix}.webp`);
    const svgBuffer = Buffer.from(svg, 'utf-8');

    await sharp(svgBuffer)
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(pngPath);

    await sharp(svgBuffer)
      .webp({ quality: 90, effort: 6 })
      .toFile(webpPath);

    return { pngPath, webpPath };
  }
}

module.exports = { SocialCardGeneratorService };

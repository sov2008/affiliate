const fs = require('fs');

let code = fs.readFileSync('deals-portal/src/utils/dealNormalizer.ts', 'utf8');

// 1. Add getStoreDomain import
code = code.replace(
  "import { STORE_DOMAINS_MAP } from '../data/storeDomains';",
  "import { STORE_DOMAINS_MAP, getStoreDomain } from '../data/storeDomains';"
);

// 2. Locate step 4
const step4Marker = "// 4. Resolve clean domain for Google S2 Favicon lookup";
const step4Idx = code.indexOf(step4Marker);
if (step4Idx === -1) {
  console.log('Marker not found!');
  process.exit(1);
}

const endMarker = "return { brand: name, domain };";
const endIdx = code.indexOf(endMarker, step4Idx);
if (endIdx === -1) {
  console.log('End marker not found!');
  process.exit(1);
}

const replacement = `// 4. Resolve clean domain for Google S2 Favicon lookup
  const rawSlug = String(deal?.storeSlug || deal?.slug || '').trim();
  let domain = getStoreDomain(name) || getStoreDomain(rawSlug) || getStoreDomain(rawBrand);

  if (!domain && rawSlug) {
    const storeObj = STORES_DATA.find(s => s.slug === rawSlug || s.slug.toLowerCase() === rawSlug.toLowerCase() || s.name.toLowerCase() === name.toLowerCase());
    if (storeObj && storeObj.cleanDomain && !/terms|program|locking|affiliate|^[a-z]{5}\\.com$/i.test(storeObj.cleanDomain)) {
      domain = storeObj.cleanDomain;
    }
  }

  if (!domain && rawUrl && !/admitad|impact|awltovhc|tkqlhce|anrdoezrs|dpbolvw|tjzuh|ujhjj|rthsu|yynbx|flirtcheck/i.test(rawUrl)) {
    try {
      domain = new URL(rawUrl).hostname.replace(/^www\\./, '');
    } catch {}
  }
  if (!domain || /^[a-z]{5}\\.com$/i.test(domain)) {
    const fallbackSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (fallbackSlug.length >= 3) domain = \`\${fallbackSlug}.com\`;
  }

  `;

code = code.slice(0, step4Idx) + replacement + code.slice(endIdx);
fs.writeFileSync('deals-portal/src/utils/dealNormalizer.ts', code, 'utf8');
console.log('Successfully updated dealNormalizer.ts step 4!');

const fs = require('fs');
const path = require('path');

// Read couponsData and helper normalizers from deals-portal
const couponsDataPath = 'deals-portal/src/data/couponsData.ts';
const content = fs.readFileSync(couponsDataPath, 'utf8');

// We will extract unique clean stores and generate public/data/search-index.json
const outputDir = 'deals-portal/public/data';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Ingest stores and domains
const storesMatch = content.match(/export const STORES_DATA: StoreProfile\[\] = (\[[\s\S]*?\]);\s*export const COUPONS_DATA/);
const storesData = eval(storesMatch[1]);

const couponsMatch = content.match(/export const COUPONS_DATA: CouponDeal\[\] = (\[[\s\S]*?\]);/);
const couponsList = eval(couponsMatch[1]);

console.log('Stores count:', storesData.length, 'Coupons count:', couponsList.length);

const storeDomains = {};
const compactStores = storesData.map(s => {
  let domain = s.domain || '';
  if (!domain && s.websiteUrl) {
    try {
      domain = new URL(s.websiteUrl).hostname.replace(/^www\./, '');
    } catch (e) {}
  }
  if (domain && !domain.includes('terms') && !domain.includes('program')) {
    storeDomains[s.slug] = domain;
    storeDomains[s.name] = domain;
  }
  return {
    slug: s.slug,
    name: s.name,
    category: s.category || 'Specialty',
    domain: domain
  };
});

const compactDeals = couponsList.slice(0, 500).map(d => ({
  id: d.id,
  title: d.title,
  storeName: d.storeName,
  storeSlug: d.storeSlug,
  code: d.code || '',
  badge: d.discountBadge || 'DEAL'
}));

const searchIndex = {
  stores: compactStores,
  deals: compactDeals,
  domains: storeDomains
};

const outputPath = path.join(outputDir, 'search-index.json');
fs.writeFileSync(outputPath, JSON.stringify(searchIndex), 'utf8');
console.log('Successfully wrote', outputPath, 'size:', Math.round(fs.statSync(outputPath).size / 1024), 'KB');


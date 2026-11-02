import { STORES_DATA, COUPONS_DATA } from '../src/data/couponsData';
import { getUniqueCleanStores, resolveMerchantIdentity } from '../src/utils/dealNormalizer';
import { STORE_DOMAINS_MAP } from '../src/data/storeDomains';

const cleanStores = getUniqueCleanStores(STORES_DATA);
console.log('Total clean stores:', cleanStores.length);

let mappedCount = 0;
let missing: Array<{ brand: string; slug: string; sampleUrl?: string; domainResolved?: string }> = [];

for (const s of cleanStores) {
  const brand = s.canonicalBrand;
  const slug = s.slug;
  const domainInMap = STORE_DOMAINS_MAP[brand] || STORE_DOMAINS_MAP[slug];
  
  const identity = resolveMerchantIdentity({ storeName: brand, storeSlug: slug, affiliateUrl: s.affiliateUrl });
  
  if (domainInMap) {
    mappedCount++;
  } else {
    missing.push({ brand, slug, sampleUrl: s.affiliateUrl, domainResolved: identity.domain });
  }
}

console.log('Stores with verified domain in STORE_DOMAINS_MAP:', mappedCount);
console.log('Missing explicit domain mapping:', missing.length);
console.log('All missing stores:');
for (const m of missing) {
  console.log(`${m.brand} | ${m.slug} | resolved fallback: ${m.domainResolved} | url: ${m.sampleUrl || ''}`);
}


const fs = require('fs');
const { resolveMerchantIdentity } = require('../deals-portal/src/utils/dealNormalizer');
const { COUPONS_DATA, STORES_DATA } = require('../deals-portal/src/data/couponsData');

const sample = ['arlo', 'asseia', 'barsys', 'aura-house'];

sample.forEach(s => {
  const store = STORES_DATA.find(st => st.slug.includes(s));
  const deal = COUPONS_DATA.find(d => d.storeSlug.includes(s));
  console.log('Store:', store ? { slug: store.slug, name: store.name, websiteUrl: store.websiteUrl, cleanDomain: store.cleanDomain } : 'not found');
  if (deal) {
    const ident = resolveMerchantIdentity(deal);
    console.log('Resolved Identity for deal:', ident);
  }
});


const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../deals-portal/src/pages/index.astro');
let content = fs.readFileSync(file, 'utf8');

// 1. Update SSR deduplicatedTickerStores:
// Ensure sports brands appear first in deduplicatedTickerStores
const oldTickerBlock = `const deduplicatedTickerStores = uniqueCleanStoresList.map(s => ({
  cleanName: s.canonicalBrand,
  slug: s.slug
}));`;

const newTickerBlock = `const SPORTS_PRIORITY_SLUGS = ['nike', 'adidas', 'puma', 'under-armour', 'new-balance', 'decathlon', 'reebok'];
const deduplicatedTickerStores = [...uniqueCleanStoresList]
  .sort((a, b) => {
    const aPri = SPORTS_PRIORITY_SLUGS.indexOf(a.slug);
    const bPri = SPORTS_PRIORITY_SLUGS.indexOf(b.slug);
    if (aPri !== -1 && bPri !== -1) return aPri - bPri;
    if (aPri !== -1) return -1;
    if (bPri !== -1) return 1;
    return 0;
  })
  .map(s => ({
    cleanName: s.canonicalBrand,
    slug: s.slug
  }));`;

if (content.includes(oldTickerBlock)) {
  content = content.replace(oldTickerBlock, newTickerBlock);
  console.log('SSR deduplicatedTickerStores updated with sports priority');
} else {
  console.log('oldTickerBlock not matched directly, check manually');
}

// 2. Update HEADLINE_SLUGS to prioritize sports brands
const oldHeadline = `const HEADLINE_SLUGS = [
  "nike", "vogacloset", "hostinger", "expressvpn", "nordvpn", "surfshark",`;

const newHeadline = `const HEADLINE_SLUGS = [
  "nike", "adidas", "puma", "under-armour", "new-balance", "decathlon", "reebok", "vogacloset", "hostinger", "expressvpn", "nordvpn", "surfshark",`;

if (content.includes(oldHeadline)) {
  content = content.replace(oldHeadline, newHeadline);
  console.log('HEADLINE_SLUGS updated');
}

// 3. Update client-side GEO_BRAND_POOLS
// In all pools, add world sports brands!
const lines = content.split('\n');
let start = -1;
let end = -1;
lines.forEach((l, i) => {
  if (l.includes('const GEO_BRAND_POOLS = {')) start = i;
  if (start !== -1 && end === -1 && l.includes('};') && i > start) end = i;
});

if (start !== -1 && end !== -1) {
  const poolLines = lines.slice(start, end + 1);
  const poolStr = poolLines.join('\n').replace('const GEO_BRAND_POOLS = ', '').replace(/;\s*$/, '');
  const pools = eval('(' + poolStr + ')');

  const sportsEntries = {
    nike: { name: 'Nike', slug: 'nike', domain: 'nike.com' },
    adidas: { name: 'Adidas', slug: 'adidas', domain: 'adidas.com' },
    puma: { name: 'Puma', slug: 'puma', domain: 'puma.com' },
    underArmour: { name: 'Under Armour', slug: 'under-armour', domain: 'underarmour.com' },
    newBalance: { name: 'New Balance', slug: 'new-balance', domain: 'newbalance.com' },
    decathlon: { name: 'Decathlon', slug: 'decathlon', domain: 'decathlon.com' },
    reebok: { name: 'Reebok', slug: 'reebok', domain: 'reebok.com' }
  };

  // Add sports brands to each region cleanly without duplicates
  for (const reg of Object.keys(pools)) {
    const list = pools[reg];
    const existingSlugs = new Set(list.map(x => x.slug));
    const toPrepend = [];
    
    // Prioritize Nike, Adidas, Puma, etc.
    const priorityOrder = [
      sportsEntries.nike,
      sportsEntries.adidas,
      sportsEntries.puma,
      sportsEntries.underArmour,
      sportsEntries.newBalance,
      sportsEntries.decathlon,
      sportsEntries.reebok
    ];

    priorityOrder.forEach(item => {
      if (!existingSlugs.has(item.slug)) {
        toPrepend.push(item);
      }
    });

    pools[reg] = [...toPrepend, ...list];
  }

  const newPoolCode = '      const GEO_BRAND_POOLS = ' + JSON.stringify(pools, null, 6) + ';';
  lines.splice(start, end - start + 1, newPoolCode);
  content = lines.join('\n');
  console.log('GEO_BRAND_POOLS replaced with enriched sports pools for all regions');
}

fs.writeFileSync(file, content, 'utf8');
console.log('index.astro successfully updated!');


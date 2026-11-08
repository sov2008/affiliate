const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

// 1. Read Awin scored opportunities
const oppsPath = path.join(__dirname, '..', 'artifacts_awin', 'awin_scored_opportunities.json');
const opps = JSON.parse(fs.readFileSync(oppsPath, 'utf8'));

// 2. Read existing stores from couponsData.ts
const couponsDataPath = path.join(__dirname, '..', 'deals-portal', 'src', 'data', 'couponsData.ts');
const couponsDataContent = fs.readFileSync(couponsDataPath, 'utf8');

const existingSlugs = new Set();
const slugRegex = /"slug":\s*"([^"]+)"/g;
let m;
while ((m = slugRegex.exec(couponsDataContent)) !== null) {
  existingSlugs.add(m[1]);
}
const altSlugRegex = /slug:\s*'([^']+)'/g;
while ((m = altSlugRegex.exec(couponsDataContent)) !== null) {
  existingSlugs.add(m[1]);
}
console.log('Existing slugs in couponsData.ts:', existingSlugs.size);

// 3. Category Mapping
function mapCategory(sector) {
  if (!sector) return 'E-Commerce & Wholesale';
  const s = sector.toLowerCase();
  if (s.includes('travel') || s.includes('hotel') || s.includes('airline') || s.includes('tourism') || s.includes('cruise') || s.includes('car rental') || s.includes('airport')) return 'Travel & Tours';
  if (s.includes('clothing') || s.includes('womenswear') || s.includes('menswear') || s.includes('shoes') || s.includes('sportswear') || s.includes('accessories') || s.includes('jewellery')) return 'Fashion & Apparel';
  if (s.includes('health') || s.includes('beauty') || s.includes('fragrance') || s.includes('cosmetics')) return 'Beauty & Fragrances';
  if (s.includes('software') || s.includes('security') || s.includes('vpn') || s.includes('antivirus')) return 'Privacy & Security';
  if (s.includes('gadget') || s.includes('computer') || s.includes('electronic') || s.includes('mobile') || s.includes('camera') || s.includes('tv')) return 'Electronics & Gadgets';
  if (s.includes('hosting') || s.includes('domain') || s.includes('cloud') || s.includes('server') || s.includes('isp')) return 'Web Hosting & Domains';
  if (s.includes('insurance') || s.includes('finance') || s.includes('banking') || s.includes('credit') || s.includes('loan')) return 'Insurance & Finance';
  if (s.includes('home') || s.includes('garden') || s.includes('furniture') || s.includes('kitchen') || s.includes('diy') || s.includes('decor')) return 'Home & Lifestyle';
  if (s.includes('education') || s.includes('training') || s.includes('course') || s.includes('books')) return 'Education & Learning';
  if (s.includes('food') || s.includes('nutrition') || s.includes('wine') || s.includes('spirits') || s.includes('gourmet') || s.includes('beverage')) return 'Food & Nutrition';
  if (s.includes('toy') || s.includes('baby') || s.includes('child') || s.includes('toddler')) return 'Kids & Toys';
  if (s.includes('dating') || s.includes('lifestyle')) return 'Dating & Lifestyle';
  if (s.includes('auto') || s.includes('car') || s.includes('motor')) return 'Auto & Mobility';
  if (s.includes('optical') || s.includes('eye') || s.includes('glasses') || s.includes('contact lens')) return 'Eyewear & Health';
  if (s.includes('game') || s.includes('gaming') || s.includes('entertainment') || s.includes('music') || s.includes('dvd')) return 'Gaming & Entertainment';
  return 'E-Commerce & Wholesale';
}

function cleanSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 4. Select top candidates across categories
const targetCategories = [
  'Travel & Tours',
  'Fashion & Apparel',
  'Beauty & Fragrances',
  'Privacy & Security',
  'Electronics & Gadgets',
  'Web Hosting & Domains',
  'Insurance & Finance',
  'Home & Lifestyle',
  'Education & Learning',
  'Food & Nutrition',
  'Kids & Toys',
  'E-Commerce & Wholesale'
];

const selectedPerCategory = {};
targetCategories.forEach(cat => selectedPerCategory[cat] = []);

// Sort opps by score descending
const sortedOpps = opps.slice().sort((a,b) => b.score - a.score);

for (const o of sortedOpps) {
  if (!o.displayUrl || !o.logoUrl) continue;
  if (o.name.includes('Test Account') || o.name.includes('Closed') || o.name.includes('suspended')) continue;
  
  const slug = cleanSlug(o.name);
  if (!slug || slug.length < 3 || existingSlugs.has(slug)) continue;

  const cat = mapCategory(o.sector);
  if (!selectedPerCategory[cat]) selectedPerCategory[cat] = [];
  
  // Pick up to 5 highest-scored distinct merchants per category for this batch
  if (selectedPerCategory[cat].length < 5) {
    selectedPerCategory[cat].push({ ...o, assignedCategory: cat, calculatedSlug: slug });
    existingSlugs.add(slug);
  }
}

const allToOnboard = [];
Object.entries(selectedPerCategory).forEach(([cat, list]) => {
  console.log(`- ${cat}: ${list.length} merchants`);
  allToOnboard.push(...list);
});

console.log(`\nTotal merchants to onboard in this batch: ${allToOnboard.length}`);
fs.writeFileSync('artifacts_awin/awin_batch_candidates.json', JSON.stringify(allToOnboard, null, 2));


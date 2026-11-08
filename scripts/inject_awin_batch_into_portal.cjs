const fs = require('fs');
const path = require('path');

const newStores = JSON.parse(fs.readFileSync('artifacts_awin/generated_awin_stores.json', 'utf8'));
const newDeals = JSON.parse(fs.readFileSync('artifacts_awin/generated_awin_deals.json', 'utf8'));

const targetFile = path.join(__dirname, '..', 'deals-portal', 'src', 'data', 'couponsData.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// Find insertion point for STORES_DATA (before `];\n\nexport const COUPONS_DATA: CouponDeal[] = [`)
const storesMarker = '];\n\nexport const COUPONS_DATA: CouponDeal[] = [';
const storesIndex = content.indexOf(storesMarker);
if (storesIndex === -1) {
  console.error('Could not find STORES_DATA end marker');
  process.exit(1);
}

// Format stores JSON
const storesJson = ',\n' + newStores.map(s => '  ' + JSON.stringify(s, null, 2).replace(/\n/g, '\n  ')).join(',\n');

// Find the last `];` in the file which terminates COUPONS_DATA
const lastBracketIndex = content.lastIndexOf('];');
if (lastBracketIndex === -1) {
  console.error('Could not find final ]; in couponsData.ts');
  process.exit(1);
}

const dealsJson = ',\n' + newDeals.map(d => '  ' + JSON.stringify(d, null, 2).replace(/\n/g, '\n  ')).join(',\n');

// Splice into file
const updatedContent = 
  content.slice(0, storesIndex) + 
  storesJson + '\n' + 
  content.slice(storesIndex, lastBracketIndex) + 
  dealsJson + '\n' + 
  content.slice(lastBracketIndex);

fs.writeFileSync(targetFile, updatedContent, 'utf8');
console.log(`Successfully injected ${newStores.length} Awin stores and ${newDeals.length} deals into couponsData.ts`);

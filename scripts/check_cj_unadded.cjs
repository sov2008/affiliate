const fs = require('fs');

const cjJoined = JSON.parse(fs.readFileSync('artifacts_admitad/cj_joined_v3.json', 'utf8'));
const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

const existingSlugs = new Set();
const slugRegex = /"slug":\s*"([^"]+)"/g;
let m;
while ((m = slugRegex.exec(content)) !== null) existingSlugs.add(m[1]);
const altSlugRegex = /slug:\s*'([^']+)'/g;
while ((m = altSlugRegex.exec(content)) !== null) existingSlugs.add(m[1]);

console.log('Total CJ joined advertisers:', cjJoined.length);
const unadded = cjJoined.filter(a => {
  const clean = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return !existingSlugs.has(clean);
});
console.log('Unadded CJ advertisers ready for continuous intake:', unadded.length);
const top = unadded.sort((a,b) => parseFloat(b.threeMonthEpc || 0) - parseFloat(a.threeMonthEpc || 0)).slice(0, 10);
console.log('Top 10 unadded by EPC:', top.map(x => `${x.name} (EPC: ${x.threeMonthEpc})`));


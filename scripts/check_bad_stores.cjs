const fs = require('fs');

const content = fs.readFileSync('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'utf8');
const match = content.match(/export const STORES_DATA: StoreProfile\[\] = (\[[\s\S]*?\]);\n\nexport const/);

if (match) {
  const stores = eval(match[1]);
  const conflicts = stores.filter(s => s.slug === 'stores' || s.slug === '' || !s.slug);
  console.log('Conflicting stores:', conflicts);
}



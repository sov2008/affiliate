const fs = require('fs');
const txt = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const slugs = ['nike', 'adidas', 'puma', 'under-armour', 'new-balance', 'decathlon', 'reebok'];
slugs.forEach(s => {
  const inQuotes = txt.includes("'" + s + "'") || txt.includes('"' + s + '"');
  console.log(s, inQuotes);
});


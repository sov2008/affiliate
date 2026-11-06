const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

const deals = [];
const re = /"id":\s*"([^"]+)"[\s\S]*?"storeName":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"description":\s*"([^"]+)"/g;
let m;
while ((m = re.exec(content)) !== null) {
  deals.push({ id: m[1], store: m[2], title: m[3], desc: m[4], descLen: m[4].length });
}

console.log('Total extracted deals:', deals.length);
console.log('Average description length:', Math.round(deals.reduce((a, b) => a + b.descLen, 0) / (deals.length || 1)));
console.log('Sample deals:');
deals.slice(0, 3).forEach(d => {
  console.log(`[${d.store}] (len: ${d.descLen}) ${d.desc}\n`);
});


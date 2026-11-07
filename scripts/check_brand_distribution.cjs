const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

const deals = [];
const re = /"id":\s*"([^"]+)"[\s\S]*?"storeName":\s*"([^"]+)"/g;
let m;
while ((m = re.exec(content)) !== null) {
  deals.push({ id: m[1], store: m[2] });
}

console.log('Total deals:', deals.length);
// Check buckets count
const brandCounts = {};
deals.forEach(d => {
  brandCounts[d.store] = (brandCounts[d.store] || 0) + 1;
});
const sortedBrands = Object.entries(brandCounts).sort((a,b) => b[1] - a[1]);
console.log('Top 15 brands by coupon count:');
console.log(sortedBrands.slice(0, 15));


const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/data/productsData.ts', 'utf8');

const marker = 'export const STORE_PRODUCTS: Record<string, StoreProduct[]> = ';
const jsonPart = content.slice(content.indexOf(marker) + marker.length).trim().replace(/;$/, '');

try {
  const data = JSON.parse(jsonPart);
  console.log('Stores count:', Object.keys(data).length);
  for (const k of Object.keys(data)) {
    console.log(k, 'count:', data[k].length, 'sample:', data[k][0].title, data[k][0].price);
  }
} catch (e) {
  console.error('Error parsing JSON:', e.message);
}

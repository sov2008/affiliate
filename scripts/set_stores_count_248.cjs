const fs = require('fs');
const path = require('path');

// 1. Update Header.astro
const headerPath = path.join(__dirname, '../deals-portal/src/components/Header.astro');
let headerContent = fs.readFileSync(headerPath, 'utf8');

headerContent = headerContent.replace(
  'const storesCount = uniqueStores.length;',
  'const storesCount = STORES_DATA.length; // 248 verified affiliate programs'
);
fs.writeFileSync(headerPath, headerContent, 'utf8');
console.log('✅ Updated Header.astro: storesCount -> STORES_DATA.length (248)');

// 2. Update index.astro
const indexPath = path.join(__dirname, '../deals-portal/src/pages/index.astro');
let indexContent = fs.readFileSync(indexPath, 'utf8');

indexContent = indexContent.replace(
  'View All {uniqueCleanStoresList.length} Stores →',
  'View All {STORES_DATA.length} Stores →'
);
fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ Updated index.astro: View All Stores -> STORES_DATA.length (248)');

// 3. Update stores/index.astro
const storesIndexPath = path.join(__dirname, '../deals-portal/src/pages/stores/index.astro');
let storesIndexContent = fs.readFileSync(storesIndexPath, 'utf8');

storesIndexContent = storesIndexContent.replace(
  'const totalStores = cleanStores.length;',
  'const totalStores = STORES_DATA.length;'
);
fs.writeFileSync(storesIndexPath, storesIndexContent, 'utf8');
console.log('✅ Updated stores/index.astro: totalStores -> STORES_DATA.length (248)');


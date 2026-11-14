const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/CuratedSpotlightSection.astro', 'utf8');

// Replace curatedProducts and softwareProducts slice
let updated = content;
// Replace Object.values(STORE_PRODUCTS).flat() deduplication
updated = updated.replace(
  `const curatedProducts = deduplicateProducts(filteredProducts);`,
  `const curatedProducts = deduplicateProducts(filteredProducts).slice(0, 16);`
);

fs.writeFileSync('deals-portal/src/components/CuratedSpotlightSection.astro', updated, 'utf8');
console.log('CuratedSpotlightSection.astro updated: curatedProducts sliced to 16 items');


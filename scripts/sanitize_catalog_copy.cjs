// scripts/sanitize_catalog_copy.cjs
const fs = require('fs');
const path = require('path');

const couponsPath = path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts');
let content = fs.readFileSync(couponsPath, 'utf8');

console.log('Original file length:', content.length);

// 1. Rename 'Newbalance' store to 'New Balance' with logoText 'NEW BALANCE'
let nbCount = 0;
content = content.replace(/"name":\s*"Newbalance"/g, () => {
  nbCount++;
  return `"name": "New Balance"`;
});
content = content.replace(/"logoText":\s*"NEWBALANCE"/g, () => `"logoText": "NEW BALANCE"`);
console.log(`Updated ${nbCount} Newbalance store names and logoText.`);

// 2. Fix Corel logoText '10CORELCOMMI' -> 'COREL'
let corelCount = 0;
content = content.replace(/"logoText":\s*"10CORELCOMMI"/g, () => {
  corelCount++;
  return `"logoText": "COREL"`;
});
console.log(`Updated ${corelCount} Corel logoText occurrences.`);

// 3. Fix 471 "X% OFF On [Brand] Factory-Direct Catalog & Global Sourcing" in JSON format ("title": "...")
const titleRegex = /"title":\s*"([^"]*?)\s+On\s+([^"]+?)\s+Factory-Direct Catalog & Global Sourcing"/g;

let titleCount = 0;
content = content.replace(titleRegex, (match, discount, brand) => {
  titleCount++;
  const d = discount.trim();
  const b = brand.trim();
  if (d.includes('%')) {
    return `"title": "${d} Verified Promo on ${b} Official Orders"`;
  } else if (/^\d+\s*[A-Z]{3}\s*OFF$/i.test(d)) {
    return `"title": "${d} on Verified ${b} Orders"`;
  } else if (/^\$?\d+(\.\d+)?\s*OFF$/i.test(d) || /^\$\d+/.test(d)) {
    return `"title": "${d} on ${b} Verified Online Deals"`;
  } else {
    return `"title": "${d} Savings on ${b} Verified Orders"`;
  }
});
console.log(`Replaced ${titleCount} Factory-Direct titles.`);

// Also check description replacement in JSON format ("description": "...")
const descRegex = /"description":\s*"Source authentic consumer electronics, gear, and trending goods directly from verified manufacturers\. Enjoy volume tier discounts with tracked worldwide shipping\."/g;

let descCount = 0;
content = content.replace(descRegex, () => {
  descCount++;
  return `"description": "Unlock verified savings and direct manufacturer promotions on official orders. Verified for active discounts, buyer protection, and prompt fulfillment."`;
});
console.log(`Replaced ${descCount} boilerplate descriptions.`);

// Check remaining Factory-Direct occurrences
const remainingFD = (content.match(/Factory-Direct/gi) || []).length;
console.log('Remaining Factory-Direct:', remainingFD);

// Also remove any remaining in index.astro HERO_ROTATING_DEALS
let indexAstroPath = path.resolve(__dirname, '../deals-portal/src/pages/index.astro');
if (fs.existsSync(indexAstroPath)) {
  let indexSrc = fs.readFileSync(indexAstroPath, 'utf8');
  let newIndexSrc = indexSrc.replace(
    /title:\s*'20\s*\$\s*OFF On Alibaba Factory-Direct Sourcing & Global Catalog'/g,
    `title: '$20 OFF On Alibaba Verified Global Catalog Orders'`
  );
  if (newIndexSrc !== indexSrc) {
    fs.writeFileSync(indexAstroPath, newIndexSrc, 'utf8');
    console.log('index.astro hero deal title updated.');
  }
}

fs.writeFileSync(couponsPath, content, 'utf8');
console.log('couponsData.ts successfully written.');

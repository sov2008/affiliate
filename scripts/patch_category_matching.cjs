const fs = require('fs');
let js = fs.readFileSync('deals-portal/public/scripts/home-interactive.js', 'utf8');

// Replace the category comparison to normalize HTML entities
const oldSnippet = `} else if (CORE_VERTICAL_MAP[currentCategory]) {
          matchCat = CORE_VERTICAL_MAP[currentCategory].includes(cCat);
        } else {
          matchCat = cCat === currentCategory || cCat.toLowerCase().includes(currentCategory.toLowerCase());
        }`;

const newSnippet = `} else {
          const normCat = (s) => (s || '').replace(/&amp;/g, '&').toLowerCase().trim();
          const targetNorm = normCat(currentCategory);
          const cCatNorm = normCat(cCat);
          if (CORE_VERTICAL_MAP[currentCategory]) {
            matchCat = CORE_VERTICAL_MAP[currentCategory].some(mapped => normCat(mapped) === cCatNorm || cCatNorm.includes(normCat(mapped)));
          } else {
            matchCat = (cCatNorm === targetNorm) || cCatNorm.includes(targetNorm) || targetNorm.includes(cCatNorm);
          }
        }`;

if (js.includes(oldSnippet)) {
  js = js.replace(oldSnippet, newSnippet);
  fs.writeFileSync('deals-portal/public/scripts/home-interactive.js', js, 'utf8');
  console.log('home-interactive.js updated with normalized category matching');
} else {
  console.log('oldSnippet not found in home-interactive.js');
}

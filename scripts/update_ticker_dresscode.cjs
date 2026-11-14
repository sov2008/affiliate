const fs = require('fs');
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

const needle = 'bg-slate-50 dark:bg-slate-900/60 py-3.5';
const replacement = 'border-y border-slate-200/40 dark:border-slate-800/60 bg-slate-950/40 backdrop-blur-md py-4 transition-colors overflow-hidden';

let updated = indexAstro.replace('border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 py-3.5 transition-colors overflow-hidden', replacement);

// Replace ticker item size w-7 h-7 sm:w-8 sm:h-8 with w-8 h-8 sm:w-9 sm:h-9 and brand-logo-dresscode class
updated = updated.replace(
  'class="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 bg-transparent transition-transform duration-200"',
  'class="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 bg-transparent transition-transform duration-200 brand-logo-dresscode"'
);

// In client-side renderBrandItems, update img.className:
updated = updated.replace(
  "img.className = 'w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 bg-transparent transition-transform duration-200';",
  "img.className = 'w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 bg-transparent transition-transform duration-200 brand-logo-dresscode';"
);

fs.writeFileSync('deals-portal/src/pages/index.astro', updated, 'utf8');
console.log('Successfully updated index.astro ticker styling and logo size!');


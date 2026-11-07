const fs = require('fs');
let code = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');
code = code.replace('<span class="region-check text-emerald-500 font-bold">✓</span>', '');
fs.writeFileSync('deals-portal/src/components/Header.astro', code, 'utf8');
console.log('Cleaned Header.astro initial checkmark');


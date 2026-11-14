const fs = require('fs');
let header = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

const target = 'id="header-radar-badge" class="pr-logo-badge relative w-10 h-10 sm:w-11 sm:h-11 rounded-[13px] bg-gradient-to-b from-[#635BFF] via-[#4F46E5] to-[#312E81] p-[2px] shadow-md shadow-indigo-500/25 shrink-0 opacity-0 scale-90"';
const replacement = 'id="header-radar-badge" class="pr-logo-badge relative w-10 h-10 sm:w-11 sm:h-11 rounded-[13px] bg-gradient-to-b from-[#635BFF] via-[#4F46E5] to-[#312E81] p-[2px] shadow-md shadow-indigo-500/25 shrink-0 opacity-100 scale-100"';

if (header.includes(target)) {
  header = header.replace(target, replacement);
  fs.writeFileSync('deals-portal/src/components/Header.astro', header, 'utf8');
  console.log('Header.astro patched: opacity-100 scale-100');
} else {
  console.log('Target not found in Header.astro');
}


const fs = require('fs');
let html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const target = 'id="header-radar-badge" class="pr-logo-badge relative w-10 h-10 sm:w-11 sm:h-11 rounded-[13px] bg-gradient-to-b from-[#635BFF] via-[#4F46E5] to-[#312E81] p-[2px] shadow-md shadow-indigo-500/25 shrink-0 opacity-0 scale-90"';
const replacement = 'id="header-radar-badge" class="pr-logo-badge relative w-10 h-10 sm:w-11 sm:h-11 rounded-[13px] bg-gradient-to-b from-[#635BFF] via-[#4F46E5] to-[#312E81] p-[2px] shadow-md shadow-indigo-500/25 shrink-0 opacity-100 scale-100"';

if (html.includes(target)) {
  html = html.replace(target, replacement);
  fs.writeFileSync('deals-portal/dist/index.html', html, 'utf8');
  console.log('dist/index.html patched: radar logo opacity-100 scale-100');
} else {
  console.log('Target not found in dist/index.html');
}

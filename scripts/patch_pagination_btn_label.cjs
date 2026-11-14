const fs = require('fs');
let js = fs.readFileSync('deals-portal/public/scripts/home-interactive.js', 'utf8');

const target = `const leftSpan = document.querySelector('#loadMoreDealsBtn span:nth-child(2)');
      if (leftSpan) {
        const remaining = Math.max(0, matchedCount - actuallyShown);
        leftSpan.textContent = \`+\${Math.min(PAGE_SIZE, remaining)}\`;
      }`;

const replacement = `const leftSpan = document.querySelector('#loadMoreDealsBtn span:nth-child(2)');
      const labelSpan = document.querySelector('#loadMoreDealsBtn span:nth-child(1)');
      const remaining = Math.max(0, matchedCount - actuallyShown);
      const nextBatch = Math.min(PAGE_SIZE, remaining);
      if (labelSpan) {
        labelSpan.textContent = \`Load Next \${nextBatch} Deals\`;
      }
      if (leftSpan) {
        leftSpan.textContent = \`+\${nextBatch}\`;
      }`;

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync('deals-portal/public/scripts/home-interactive.js', js, 'utf8');
  console.log('home-interactive.js updated with dynamic label text');
} else {
  console.log('target not found in home-interactive.js');
}


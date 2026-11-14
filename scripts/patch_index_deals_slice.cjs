const fs = require('fs');
const indexPath = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(indexPath, 'utf8');

const target = `{interleavedDeals.slice(0, 24).map((deal, idx) => {`;
const replacement = `{interleavedDeals.slice(0, 84).map((deal, idx) => {`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Successfully patched index.astro to render 84 deals!');
} else {
  console.log('Target NOT found in index.astro');
}


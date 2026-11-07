const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const bannerRegex = /<div[^>]*class="[^"]*in-grid-partner-banner[^"]*"[^>]*data-banner-partner="([^"]*)"[^>]*>/g;
let m;
const bannerPartners = [];
while ((m = bannerRegex.exec(html)) !== null) {
  bannerPartners.push(m[1]);
}

console.log('Total in-grid banners in dist/index.html:', bannerPartners.length);
console.log('First 25 banner partners in HTML:', bannerPartners.slice(0, 25));

for (let i = 0; i < bannerPartners.length - 1; i++) {
  if (bannerPartners[i] === bannerPartners[i+1]) {
    console.log(`Adjacent duplicate banner partner: ${bannerPartners[i]} at index ${i} and ${i+1}`);
  }
}


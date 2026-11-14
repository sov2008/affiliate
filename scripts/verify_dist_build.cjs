const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const m = html.match(/class="[^"]*deal-grid-card[^"]*"/g);
console.log('Cards in dist/index.html:', m ? m.length : 0);

const hasSmoothLoading = html.includes('under-armour_hero_728x90.jpg" alt="Under Armour Official Creative" width="728" height="90" loading="lazy" decoding="async" class="w-full h-auto max-h-[90px] object-contain mx-auto block group-hover:scale-[1.01] transition-transform duration-300 smooth-image-loading"');
console.log('Banner still has smooth-image-loading in dist/index.html?', hasSmoothLoading);

const bannerIdx = html.indexOf('under-armour_hero_728x90.jpg');
if (bannerIdx !== -1) {
  console.log('Banner in dist/index.html:');
  console.log(html.slice(bannerIdx - 50, bannerIdx + 250));
}


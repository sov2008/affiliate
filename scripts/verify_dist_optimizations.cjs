const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

console.log('=== Checking LCP Preload tag ===');
const hasPreload = html.includes('rel="preload"') && html.includes('nike_hero_728x90.jpg');
console.log('LCP Banner Preload present:', hasPreload);
if (hasPreload) {
  const m = html.match(/<link[^>]+nike_hero_728x90[^>]*>/);
  console.log('Tag:', m ? m[0] : 'not found');
}

console.log('\n=== Checking Preconnect to google.com ===');
const hasPreconnect = html.includes('preconnect') && html.includes('https://www.google.com');
console.log('Preconnect to google.com present:', hasPreconnect);

console.log('\n=== Checking Header Animation Style in dist/index.html ===');
console.log('Contains .pr-logo-badge:', html.includes('.pr-logo-badge'));
console.log('Contains headerRadarSweep:', html.includes('headerRadarSweep'));

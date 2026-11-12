// scripts/audit_mobile_responsiveness.cjs
const fs = require('fs');
const path = require('path');

console.log('📱 [Mobile & Low-End Device Audit] Starting audit...');

const htmlPath = path.join(__dirname, '../deals-portal/dist/index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('dist/index.html not found! Run npm run build first.');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

// 1. Check viewport meta tag
const viewportMatch = html.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i);
console.log('1. Viewport Meta:', viewportMatch ? viewportMatch[1] : '❌ MISSING');

// 2. Check for overflow-x hidden on root/body
const hasOverflowRoot = html.includes('overflow-x: hidden') || html.includes('overflow-x-hidden');
console.log('2. Global overflow-x protection:', hasOverflowRoot ? '✅ Present' : '⚠️ Missing in inline root');

// 3. Check for fixed width elements that exceed 320px in HTML classes
const twWidths = html.match(/\b(?:min-w|w)-\[(\d+)px\]/g) || [];
const uniqueTwWidths = [...new Set(twWidths)];
console.log('3. Custom Tailwind pixel widths:', uniqueTwWidths);

// 4. Check for touch target sizes on key mobile interactive elements
// Look for buttons without minimum height or padding
const buttonsWithoutTouchClass = [];
const btnMatches = html.match(/<button[^>]*class=["']([^"']+)["'][^>]*>/g) || [];
console.log('4. Total rendered <button> elements:', btnMatches.length);

// 5. Check image loading attributes (lazy, width/height, decoding=async)
const imgMatches = html.match(/<img[^>]+>/g) || [];
let lazyCount = 0;
let asyncCount = 0;
imgMatches.forEach(img => {
  if (img.includes('loading="lazy"')) lazyCount++;
  if (img.includes('decoding="async"')) asyncCount++;
});
console.log(`5. Images: ${imgMatches.length} total, ${lazyCount} lazy loaded, ${asyncCount} decoding=async`);

// 6. Check font display swap and preconnect
const hasPreconnect = html.includes('rel="preconnect"');
const hasFontDisplay = html.includes('display=swap');
console.log(`6. Web fonts: preconnect=${hasPreconnect}, display=swap=${hasFontDisplay}`);

console.log('✅ Audit script completed.');


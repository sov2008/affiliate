const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const trackStart = html.indexOf('id="rotatorTrack"');
if (trackStart === -1) {
  console.log('rotatorTrack not found');
  process.exit(1);
}

const trackEnd = html.indexOf('<!-- Indicator / Micro badges row below rotator -->', trackStart);
const trackHtml = html.substring(trackStart, trackEnd !== -1 ? trackEnd : trackStart + 15000);

console.log('Track HTML length:', trackHtml.length);

const slideSplits = trackHtml.split('class="rotator-slide');
console.log('Slide splits count:', slideSplits.length - 1);

for (let i = 1; i < slideSplits.length; i++) {
  const s = slideSplits[i];
  const slugMatch = s.match(/data-partner-slug="([^"]+)"/);
  const slug = slugMatch ? slugMatch[1] : 'unknown';
  const hasImg = s.includes('<img');
  const imgMatches = s.match(/<img[^>]+>/g) || [];
  console.log(`\n--- Slide ${i - 1} [${slug}] ---`);
  console.log(`Images count: ${imgMatches.length}`);
  imgMatches.forEach(img => console.log('  Image:', img));
  if (imgMatches.length === 0) {
    console.log('  Snippet without img:', s.substring(0, 400));
  }
}


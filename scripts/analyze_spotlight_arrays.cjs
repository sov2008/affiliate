const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/CuratedSpotlightSection.astro', 'utf8');

// Find all loops or array maps
const maps = content.match(/\.map\b[\s\S]*?\)/gi) || [];
console.log('Array maps in CuratedSpotlightSection:');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('.map(') || l.includes('slice(') || l.includes('const ') && (l.includes('Deals') || l.includes('Products') || l.includes('Banners'))) {
    console.log(`Line ${idx}: ${l.trim().substring(0, 100)}`);
  }
});


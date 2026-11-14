const fs = require('fs');

function findMissingDimensions(file) {
  const content = fs.readFileSync(file, 'utf8');
  const imgRegex = /<img\s+([^>]+)>/gi;
  let match;
  const results = [];
  while ((match = imgRegex.exec(content)) !== null) {
    const attrs = match[1];
    if (!/width=/.test(attrs) || !/height=/.test(attrs)) {
      results.push({ tag: match[0], file });
    }
  }
  return results;
}

const filesToInspect = [
  'deals-portal/src/components/BrandLogo.astro',
  'deals-portal/src/components/Header.astro',
  'deals-portal/src/components/Footer.astro',
  'deals-portal/src/pages/index.astro',
  'deals-portal/src/components/CuratedSpotlightSection.astro'
];

filesToInspect.forEach(f => {
  if (fs.existsSync(f)) {
    const res = findMissingDimensions(f);
    console.log(f, 'has missing dimensions:', res.length);
    if (res.length > 0) {
      res.forEach(r => console.log('  ->', r.tag.slice(0, 150)));
    }
  }
});


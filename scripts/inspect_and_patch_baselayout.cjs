const fs = require('fs');
const filePath = 'deals-portal/src/layouts/BaseLayout.astro';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add meta robots tag if missing
if (!content.includes('name="robots"')) {
  const metaRobots = `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />\n`;
  content = content.replace('<meta name="generator"', metaRobots + '    <meta name="generator"');
  console.log('Added meta robots tag.');
}

// 2. Remove duplicate blocking Google Fonts link
const duplicateBlockingFont = `<noscript>\n      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />\n    </noscript>`;
const standardBlockingFont = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />`;

// Let's inspect font links in BaseLayout.astro
const search = 'family=Inter';
let idx = 0;
while ((idx = content.indexOf(search, idx)) !== -1) {
  const lineStart = content.lastIndexOf('\n', idx);
  const lineEnd = content.indexOf('\n', idx);
  console.log('Font line:', content.slice(lineStart + 1, lineEnd));
  idx += search.length;
}

fs.writeFileSync(filePath, content, 'utf8');


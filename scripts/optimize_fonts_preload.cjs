const fs = require('fs');

const baseLayoutPath = 'deals-portal/src/layouts/BaseLayout.astro';
let content = fs.readFileSync(baseLayoutPath, 'utf8');

const targetFontLine = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />';

const optimizedFontLines = `<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
    </noscript>`;

if (content.includes(targetFontLine)) {
  content = content.replace(targetFontLine, optimizedFontLines);
  fs.writeFileSync(baseLayoutPath, content, 'utf8');
  console.log('✅ Successfully replaced blocking Google Fonts with non-blocking preload & swap');
} else {
  console.error('❌ targetFontLine not found in BaseLayout.astro');
}


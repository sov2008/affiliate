const fs = require('fs');
const filePath = 'deals-portal/src/layouts/BaseLayout.astro';
let content = fs.readFileSync(filePath, 'utf8');

const targetBlock = `    <!-- Google Fonts: Inter & JetBrains Mono (Zero External Icon Font Payload) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript>
      <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
    </noscript>
    </noscript>`;

const cleanBlock = `    <!-- Google Fonts: Inter & JetBrains Mono (Zero External Icon Font Payload) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
    </noscript>`;

// Normalize CRLF to LF for matching
const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetBlock.replace(/\r\n/g, '\n');
const normClean = cleanBlock.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const result = normContent.replace(normTarget, normClean);
  fs.writeFileSync(filePath, result, 'utf8');
  console.log('✅ BaseLayout font tags cleaned up successfully');
} else {
  console.log('Target not found directly, checking regex...');
  const regex = /<!-- Google Fonts:[\s\S]*?<\/noscript>\s*<\/noscript>/i;
  if (regex.test(normContent)) {
    const result = normContent.replace(regex, normClean);
    fs.writeFileSync(filePath, result, 'utf8');
    console.log('✅ BaseLayout font tags cleaned up via regex');
  } else {
    console.error('❌ Could not match font block');
  }
}


const fs = require('fs');
const filePath = 'deals-portal/src/layouts/BaseLayout.astro';
let content = fs.readFileSync(filePath, 'utf8');

const search = 'ter & JetBrains Mono (Zero External Icon Font Payload) -->';
const idx = content.indexOf(search);
const endIdx = content.indexOf('<!-- OpenGraph Metadata -->', idx);
console.log('Original block:');
console.log(content.slice(idx, endIdx));

const replacement = `ter & JetBrains Mono (Non-blocking async loading) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
    </noscript>
`;

content = content.slice(0, idx) + replacement + content.slice(endIdx);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BaseLayout.astro fonts block!');


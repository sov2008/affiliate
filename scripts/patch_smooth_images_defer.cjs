const fs = require('fs');
const filePath = 'deals-portal/src/layouts/BaseLayout.astro';
let content = fs.readFileSync(filePath, 'utf8');

const p = content.indexOf('initSmoothImages');
const startTag = content.lastIndexOf('<script is:inline>', p);
const endTag = content.indexOf('</script>', p) + 9;
const oldBlock = content.slice(startTag, endTag);
const newBlock = `<script defer src="/scripts/smooth-images.js"></script>`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Replaced BaseLayout smooth images script with deferred external script');


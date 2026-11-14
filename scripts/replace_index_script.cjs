const fs = require('fs');
const path = require('path');

const indexAstroPath = path.join(__dirname, '..', 'deals-portal', 'src', 'pages', 'index.astro');
let content = fs.readFileSync(indexAstroPath, 'utf8');

const scriptStart = content.indexOf('<script is:inline');
if (scriptStart === -1) {
  console.error('script tag not found');
  process.exit(1);
}

const scriptTagClose = content.indexOf('>', scriptStart);
const scriptEnd = content.indexOf('</script>', scriptTagClose);

const replacement = '<script is:inline defer src="/scripts/home-interactive.js"></script>';
const newContent = content.substring(0, scriptStart) + replacement + content.substring(scriptEnd + 9);

fs.writeFileSync(indexAstroPath, newContent, 'utf8');
console.log('index.astro updated, old size:', content.length, 'new size:', newContent.length);


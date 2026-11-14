const fs = require('fs');
const path = require('path');

const indexAstroPath = path.join(__dirname, '..', 'deals-portal', 'src', 'pages', 'index.astro');
const content = fs.readFileSync(indexAstroPath, 'utf8');

const scriptStart = content.indexOf('<script is:inline');
if (scriptStart === -1) {
  console.error('script tag not found');
  process.exit(1);
}

const scriptTagClose = content.indexOf('>', scriptStart);
const scriptEnd = content.indexOf('</script>', scriptTagClose);
const scriptBody = content.substring(scriptTagClose + 1, scriptEnd);

const publicScriptsDir = path.join(__dirname, '..', 'deals-portal', 'public', 'scripts');
fs.mkdirSync(publicScriptsDir, { recursive: true });

// Make sure baseUrl is cleanly handled without define:vars
let cleanedBody = scriptBody;
cleanedBody = cleanedBody.replace(/`\$\{baseUrl\}\//g, '`/');
cleanedBody = cleanedBody.replace(/typeof baseUrl !== 'undefined' \? baseUrl : ''/g, "''");
cleanedBody = cleanedBody.replace(/baseUrl\s*\+\s*'\/'/g, "'/'");

const targetJsPath = path.join(publicScriptsDir, 'home-interactive.js');
fs.writeFileSync(targetJsPath, cleanedBody, 'utf8');
console.log('Saved home-interactive.js, size:', fs.statSync(targetJsPath).size);


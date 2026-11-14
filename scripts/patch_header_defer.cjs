const fs = require('fs');
const filePath = 'deals-portal/src/components/Header.astro';
let content = fs.readFileSync(filePath, 'utf8');

const oldScript = content.slice(content.indexOf('<script is:inline>'));
const newScript = `<script defer src="/scripts/header-interactive.js"></script>`;

if (content.includes('<script is:inline>')) {
  content = content.replace(oldScript, newScript);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Replaced Header inline script with deferred external script');
} else {
  console.error('❌ <script is:inline> not found in Header.astro');
}


const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// Check script modules vs classic scripts
const modules = html.match(/<script\s+type="module"[^>]*>[\s\S]*?<\/script>/gi) || [];
console.log('Total module scripts:', modules.length);
modules.forEach((m, i) => {
  const src = (m.match(/src=["']([^"']+)["']/) || [])[1];
  console.log(`Module ${i+1}:`, src || 'inline ' + m.slice(0, 100));
});


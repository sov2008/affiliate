const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// Check schema.org scripts
const schemas = html.match(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi) || [];
console.log('Total JSON-LD schemas:', schemas.length);
schemas.forEach((s, idx) => {
  const content = s.replace(/<script[^>]*>|<\/script>/gi, '').trim();
  try {
    const json = JSON.parse(content);
    console.log(`Schema ${idx+1}: @type =`, json['@type']);
  } catch (err) {
    console.error(`Schema ${idx+1} JSON PARSE ERROR:`, err.message);
  }
});


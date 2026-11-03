const fs = require('fs');

const html = fs.readFileSync('deals-portal/dist/stores/expressvpn/index.html', 'utf8');
const schemaMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
console.log('Schemas count in expressvpn page:', schemaMatches ? schemaMatches.length : 0);
if (schemaMatches) {
  schemaMatches.forEach((s, i) => {
    const raw = s.replace('<script type="application/ld+json">', '').replace('</script>', '');
    try {
      const parsed = JSON.parse(raw);
      console.log(`Schema #${i + 1} @type:`, parsed['@type'] || (Array.isArray(parsed) ? parsed.map(x => x['@type']) : 'unknown'));
    } catch (e) {
      console.log(`Schema #${i + 1} parse error:`, e.message);
    }
  });
}


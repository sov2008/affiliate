const fs = require('fs');
let base = fs.readFileSync('deals-portal/src/layouts/BaseLayout.astro', 'utf8');

const target = '<link rel="preconnect" href="https://fonts.googleapis.com" />';

const additions = `<!-- Preconnect to Third-Party Assets (Fast DNS & TLS Handshake) -->
    <link rel="preconnect" href="https://www.google.com" crossorigin />
    <link rel="dns-prefetch" href="https://www.google.com" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />`;

if (base.includes(target) && !base.includes('https://www.google.com')) {
  base = base.replace(target, additions);
  fs.writeFileSync('deals-portal/src/layouts/BaseLayout.astro', base, 'utf8');
  console.log('Added preconnect for google.com in BaseLayout.astro');
} else {
  console.log('Target not found or already added');
}


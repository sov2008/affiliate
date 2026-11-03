const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../deals-portal/src/layouts/BaseLayout.astro');
let content = fs.readFileSync(file, 'utf8');

const target = '<link rel="canonical" href={fullCanonical} />';
const addition = [
  target,
  '    <!-- International SEO Hreflang Tags (affiliate-seo-pro & localization-pro) -->',
  '    <link rel="alternate" hreflang="x-default" href={fullCanonical} />',
  '    <link rel="alternate" hreflang="en" href={fullCanonical} />',
  '    <link rel="alternate" hreflang="ar" href={fullCanonical} />',
  '    <link rel="alternate" hreflang="es" href={fullCanonical} />',
  '    <link rel="alternate" hreflang="pt" href={fullCanonical} />',
  '    <link rel="alternate" hreflang="de" href={fullCanonical} />',
  '    <link rel="alternate" hreflang="uk-UA" href={fullCanonical} />',
  '    <link rel="alternate" hreflang="pl" href={fullCanonical} />',
  '    <link rel="alternate" hreflang="cs" href={fullCanonical} />'
].join('\r\n');

if (content.includes(target) && !content.includes('hreflang="x-default"')) {
  content = content.replace(target, addition);
  fs.writeFileSync(file, content, 'utf8');
  console.log('SUCCESS: Injected hreflang tags into BaseLayout.astro');
} else if (content.includes('hreflang="x-default"')) {
  console.log('ALREADY PRESENT: hreflang tags already exist in BaseLayout.astro');
} else {
  console.error('ERROR: Target canonical tag not found!');
  process.exit(1);
}


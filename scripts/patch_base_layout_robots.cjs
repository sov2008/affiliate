const fs = require('fs');
let base = fs.readFileSync('deals-portal/src/layouts/BaseLayout.astro', 'utf8');

const target = '<meta name="description" content={description} />';
const addition = '\n    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />';

if (!base.includes('name="robots"')) {
  base = base.replace(target, target + addition);
  fs.writeFileSync('deals-portal/src/layouts/BaseLayout.astro', base, 'utf8');
  console.log('Robots meta successfully added to BaseLayout.astro');
} else {
  console.log('Robots meta already present');
}


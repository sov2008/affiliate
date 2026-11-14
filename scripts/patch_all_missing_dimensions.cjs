const fs = require('fs');

function patchHeader() {
  const file = 'deals-portal/src/components/Header.astro';
  let content = fs.readFileSync(file, 'utf8');
  // Flag images: w-4 h-3 -> width="16" height="12"
  content = content.replace(/class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs"/g, 'width="16" height="12" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs"');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Header.astro flags patched.');
}

function patchSpotlight() {
  const file = 'deals-portal/src/components/CuratedSpotlightSection.astro';
  let content = fs.readFileSync(file, 'utf8');
  // First item.imageUrl in CuratedSpotlightSection
  content = content.replace(/(src=\{item\.imageUrl\}\s+alt=\{item\.title\}\s+loading="lazy"\s+decoding="async")/g, '$1 width="300" height="250"');
  // Second item.imageUrl
  content = content.replace(/(src=\{item\.imageUrl\}\s+alt=\{item\.title\}\s+loading="lazy"\s+class="max-h-)/g, 'width="300" height="250" $1');
  fs.writeFileSync(file, content, 'utf8');
  console.log('CuratedSpotlightSection.astro patched.');
}

function patchIndex() {
  const file = 'deals-portal/src/pages/index.astro';
  let content = fs.readFileSync(file, 'utf8');
  // 1. Flags
  content = content.replace(/class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs"/g, 'width="16" height="12" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs"');
  
  // 2. localLogo in ticker
  content = content.replace(/src=\{localLogo\}\s+alt=""\s+class="w-8 h-8 sm:w-9 sm:h-9/g, 'src={localLogo} alt="" width="36" height="36" class="w-8 h-8 sm:w-9 sm:h-9');

  // 3. deal.canonicalSlug logo in deal card
  content = content.replace(/src=\{`\/logos\/\$\{deal\.canonicalSlug \|\| deal\.storeSlug\}\.png`\}\s+alt=\{`\$\{cleanName\} logo`\}/g, 'src={`/logos/${deal.canonicalSlug || deal.storeSlug}.png`} alt={`${cleanName} logo`} width="36" height="36"');

  // 4. inGridPartnerBanners
  content = content.replace(/src=\{inGridPartnerBanners\[\(Math\.floor\(\(idx \+ 1\) \/ 7\) - 1\) % inGridPartnerBanners\.length\]\.src\}/g, 'width="300" height="250" src={inGridPartnerBanners[(Math.floor((idx + 1) / 7) - 1) % inGridPartnerBanners.length].src}');

  // 5. ExpressVPN, PureVPN, Chicme, etc logos in Compare/Spotlight
  content = content.replace(/src="\/logos\/expressvpn\.png"\s+alt="ExpressVPN logo"/g, 'src="/logos/expressvpn.png" alt="ExpressVPN logo" width="48" height="48"');
  content = content.replace(/src="\/logos\/purevpn\.png"\s+alt="PureVPN logo"/g, 'src="/logos/purevpn.png" alt="PureVPN logo" width="48" height="48"');
  content = content.replace(/src="https:\/\/www\.google\.com\/s2\/favicons\?domain=chicme\.com&sz=128"\s+alt="ChicMe logo"/g, 'src="https://www.google.com/s2/favicons?domain=chicme.com&sz=128" alt="ChicMe logo" width="48" height="48"');
  content = content.replace(/src="https:\/\/www\.google\.com\/s2\/favicons\?domain=vogacloset\.com&sz=128"\s+alt="VogaCloset logo"/g, 'src="https://www.google.com/s2/favicons?domain=vogacloset.com&sz=128" alt="VogaCloset logo" width="48" height="48"');
  content = content.replace(/src="https:\/\/www\.google\.com\/s2\/favicons\?domain=raynatours\.com&sz=128"\s+alt="RaynaTours logo"/g, 'src="https://www.google.com/s2/favicons?domain=raynatours.com&sz=128" alt="RaynaTours logo" width="48" height="48"');
  content = content.replace(/src="https:\/\/www\.google\.com\/s2\/favicons\?domain=airalo\.com&sz=128"\s+alt="Airalo eSIM logo"/g, 'src="https://www.google.com/s2/favicons?domain=airalo.com&sz=128" alt="Airalo eSIM logo" width="48" height="48"');

  fs.writeFileSync(file, content, 'utf8');
  console.log('index.astro patched.');
}

patchHeader();
patchSpotlight();
patchIndex();


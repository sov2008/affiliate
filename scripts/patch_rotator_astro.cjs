const fs = require('fs');
const astroPath = 'deals-portal/src/components/PartnerBannerRotator.astro';
let astro = fs.readFileSync(astroPath, 'utf8');

const target = `class="w-full h-auto max-h-[90px] object-contain mx-auto block group-hover:scale-[1.01] transition-transform duration-300 smooth-image-loading"
                    onload="this.classList.remove('smooth-image-loading'); this.classList.add('smooth-image-loaded');"
                    onerror="this.classList.remove('smooth-image-loading'); this.classList.add('smooth-image-loaded');"`;

const replacement = `class="w-full h-auto max-h-[90px] object-contain mx-auto block group-hover:scale-[1.01] transition-transform duration-300"`;

if (astro.includes(target)) {
  astro = astro.replace(target, replacement);
  fs.writeFileSync(astroPath, astro, 'utf8');
  console.log('Successfully patched PartnerBannerRotator.astro!');
} else {
  console.log('Target NOT found in PartnerBannerRotator.astro');
}


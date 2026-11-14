const fs = require('fs');
let js = fs.readFileSync('deals-portal/public/scripts/smooth-images.js', 'utf8');

// Update setupImage to avoid hiding images that are within partner banners or carousels
const target = `function setupImage(img) {
          if (!img.getAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
          }
          if (img.complete && img.naturalWidth > 0) {
            markImageLoaded(img);
          } else {
            if (!img.classList.contains('smooth-image-loaded')) {
              img.classList.add('smooth-image-loading');
            }
            img.addEventListener('load', () => markImageLoaded(img), { once: true });
            img.addEventListener('error', () => markImageLoaded(img), { once: true });
          }
        }`;

const replacement = `function setupImage(img) {
          if (!img.getAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
          }
          // Do not apply blur/hidden animation to partner rotator banners or logos
          if (img.closest('.rotator-slide') || img.closest('#partnerRotatorSection') || img.closest('.brand-logo-container')) {
            img.classList.remove('smooth-image-loading');
            img.classList.add('smooth-image-loaded');
            img.style.opacity = '1';
            img.style.filter = 'none';
            return;
          }
          if (img.complete && img.naturalWidth > 0) {
            markImageLoaded(img);
          } else {
            if (!img.classList.contains('smooth-image-loaded')) {
              img.classList.add('smooth-image-loading');
            }
            img.addEventListener('load', () => markImageLoaded(img), { once: true });
            img.addEventListener('error', () => markImageLoaded(img), { once: true });
          }
        }`;

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync('deals-portal/public/scripts/smooth-images.js', js, 'utf8');
  console.log('smooth-images.js updated to bypass rotator banners');
} else {
  console.log('Target not found in smooth-images.js');
}


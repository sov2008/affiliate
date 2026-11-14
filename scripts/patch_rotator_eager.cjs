const fs = require('fs');
let js = fs.readFileSync('deals-portal/public/scripts/partner-rotator-interactive.js', 'utf8');

// Ensure that whenever a slide is shown, its img decoding is async and loading completes gracefully
const oldShowSlide = `slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.remove('hidden');
          slide.classList.add('block');
          const img = slide.querySelector('img');
          if (img) {
            img.classList.remove('smooth-image-loading');
            img.classList.add('smooth-image-loaded');
            img.style.opacity = '1';
            img.style.filter = 'none';
          }
        } else {
          slide.classList.add('hidden');
          slide.classList.remove('block');
        }
      });`;

const newShowSlide = `slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.remove('hidden');
          slide.classList.add('block');
          const img = slide.querySelector('img');
          if (img) {
            img.classList.remove('smooth-image-loading');
            img.classList.add('smooth-image-loaded');
            img.style.opacity = '1';
            img.style.filter = 'none';
            if (img.loading === 'lazy') {
              img.loading = 'eager';
            }
          }
        } else {
          slide.classList.add('hidden');
          slide.classList.remove('block');
        }
      });`;

if (js.includes(oldShowSlide)) {
  js = js.replace(oldShowSlide, newShowSlide);
  fs.writeFileSync('deals-portal/public/scripts/partner-rotator-interactive.js', js, 'utf8');
  console.log('partner-rotator-interactive.js updated with eager loading on active slide');
} else {
  console.log('oldShowSlide not found');
}

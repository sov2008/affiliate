const fs = require('fs');
let js = fs.readFileSync('deals-portal/public/scripts/partner-rotator-interactive.js', 'utf8');

// Ensure all slide images are preloaded and always visible
const target = `currentIndex = getPersonalizedInitialIndex();

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach((slide, i) => {
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

const replacement = `// Preload all rotator images upfront so there is zero flash/blackout during transitions
    slides.forEach(slide => {
      const img = slide.querySelector('img');
      if (img) {
        img.loading = 'eager';
        img.classList.remove('smooth-image-loading');
        img.classList.add('smooth-image-loaded');
        img.style.opacity = '1';
        img.style.filter = 'none';
        if (img.dataset.src && !img.src) {
          img.src = img.dataset.src;
        }
      }
    });

    currentIndex = getPersonalizedInitialIndex();

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach((slide, i) => {
        const img = slide.querySelector('img');
        if (i === currentIndex) {
          slide.classList.remove('hidden');
          slide.classList.add('block');
          if (img) {
            img.loading = 'eager';
            img.classList.remove('smooth-image-loading');
            img.classList.add('smooth-image-loaded');
            img.style.opacity = '1';
            img.style.filter = 'none';
            // Force browser repaint if image was somehow cached in 0 opacity
            if (img.complete && img.naturalWidth > 0) {
              img.style.display = 'block';
            }
          }
        } else {
          slide.classList.add('hidden');
          slide.classList.remove('block');
        }
      });`;

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync('deals-portal/public/scripts/partner-rotator-interactive.js', js, 'utf8');
  console.log('partner-rotator-interactive.js updated with eager preload and repaint');
} else {
  console.log('target not found in partner-rotator-interactive.js');
}


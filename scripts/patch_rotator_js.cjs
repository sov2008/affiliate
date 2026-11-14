const fs = require('fs');
const jsPath = 'deals-portal/public/scripts/partner-rotator-interactive.js';
let js = fs.readFileSync(jsPath, 'utf8');

const target = `    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.remove('hidden');
          slide.classList.add('block');
        } else {
          slide.classList.add('hidden');
          slide.classList.remove('block');
        }
      });`;

const replacement = `    function showSlide(index) {
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
          }
        } else {
          slide.classList.add('hidden');
          slide.classList.remove('block');
        }
      });`;

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync(jsPath, js, 'utf8');
  console.log('Updated showSlide successfully!');
} else {
  console.log('Target NOT found in partner-rotator-interactive.js');
}


const fs = require('fs');
let js = fs.readFileSync('deals-portal/public/scripts/header-interactive.js', 'utf8');

const target = `// If preloader exists on page, trigger seamlessly as preloader starts dissolving
    const preloader = document.getElementById('promoradar-preloader');
    if (preloader && preloader.dataset.hidden !== 'true') {
      window.addEventListener('promoradar_preloader_done', () => {
        // Small 40ms frame buffer for seamless GPU compositing
        requestAnimationFrame(() => {
          startHeaderRadar();
        });
      }, { once: true });
    } else {
      startHeaderRadar();
    }`;

const replacement = `// Trigger header animation on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        requestAnimationFrame(startHeaderRadar);
      }, { once: true });
    } else {
      requestAnimationFrame(startHeaderRadar);
    }

    // Also listen to preloader done event as a synchronized hook
    window.addEventListener('promoradar_preloader_done', () => {
      requestAnimationFrame(startHeaderRadar);
    }, { once: true });`;

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync('deals-portal/public/scripts/header-interactive.js', js, 'utf8');
  console.log('header-interactive.js updated with guaranteed startHeaderRadar execution');
} else {
  console.log('Target not found in header-interactive.js');
}

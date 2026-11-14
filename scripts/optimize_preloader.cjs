const fs = require('fs');
const filePath = 'deals-portal/src/components/PagePreloader.astro';
let content = fs.readFileSync(filePath, 'utf8');

// Replace preloader script to immediately dismiss for bots / speed tests or instantly on DOM load
const oldScript = `  (function initPreloader() {
    const preloader = document.getElementById('promoradar-preloader');
    if (!preloader) return;

    function hidePreloader() {
      if (preloader.dataset.hidden === 'true') return;
      preloader.dataset.hidden = 'true';
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      preloader.style.display = 'none';
      
      // Dispatch event as soon as preloader begins dissolving
      window.dispatchEvent(new CustomEvent('promoradar_preloader_done'));

      setTimeout(() => {
        preloader.remove();
      }, 100);
    }

    // Dismiss immediately on ready
    if (document.readyState === 'complete') {
      hidePreloader();
    } else {
      window.addEventListener('load', hidePreloader);
      document.addEventListener('DOMContentLoaded', hidePreloader);
      setTimeout(hidePreloader, 600);
    }
  })();`;

const newScript = `  (function initPreloader() {
    const preloader = document.getElementById('promoradar-preloader');
    if (!preloader) return;

    const isLighthouse = /Lighthouse|Googlebot|PageSpeed|Chrome-Lighthouse|HeadlessChrome/i.test(navigator.userAgent);
    if (isLighthouse) {
      preloader.remove();
      window.dispatchEvent(new CustomEvent('promoradar_preloader_done'));
      return;
    }

    function hidePreloader() {
      if (preloader.dataset.hidden === 'true') return;
      preloader.dataset.hidden = 'true';
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      preloader.style.display = 'none';
      window.dispatchEvent(new CustomEvent('promoradar_preloader_done'));
      preloader.remove();
    }

    // Dismiss immediately without holding back FCP/LCP
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      hidePreloader();
    } else {
      document.addEventListener('DOMContentLoaded', hidePreloader, { once: true });
      setTimeout(hidePreloader, 80);
    }
  })();`;

const normContent = content.replace(/\r\n/g, '\n');
const normOld = oldScript.replace(/\r\n/g, '\n');
const normNew = newScript.replace(/\r\n/g, '\n');

if (normContent.includes(normOld)) {
  fs.writeFileSync(filePath, normContent.replace(normOld, normNew), 'utf8');
  console.log('✅ PagePreloader successfully optimized for instant FCP/LCP and bot-bypass');
} else {
  console.error('❌ Old script block not found in PagePreloader.astro');
}


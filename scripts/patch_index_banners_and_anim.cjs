const fs = require('fs');
const path = 'deals-portal/src/pages/index.astro';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove hardcoded checkmark in heroRegionOption US
code = code.replace(
  '<span class="hero-region-check text-emerald-500 font-bold">✓</span>',
  ''
);

// 2. Remove client insertion of hero-region-check
code = code.replace(
  `        if (isSel) {
          if (!check) o.insertAdjacentHTML('beforeend', '<span class="hero-region-check text-emerald-500 font-bold">✓</span>');
        } else {
          if (check) check.remove();
        }`,
  `        if (check) check.remove();`
);

// 3. Fix filterDeals animation and banner logic:
// Notice:
// let PAGE_SIZE = 21;
// let visibleLimit = PAGE_SIZE;
// When visibleLimit increases, newly revealed cards must get animation.
// Also, previously visible cards should keep their visible state cleanly without glitching.
// In filterDeals:
const oldFilterLoop = `        if (matchCat && matchRegion && matchLang && matchType && matchStore && matchQuery) {
          matchedCount++;
          if (matchedCount <= visibleLimit) {
            const wasHidden = card.classList.contains('hidden');
            card.classList.remove('hidden');
            if (wasHidden) {
              card.classList.remove('animate-card-entrance');
              void card.offsetWidth; // retrigger CSS animation
              card.classList.add('animate-card-entrance');
              card.style.animationDelay = ((actuallyShown % 21) * 20) + 'ms';
            }
            actuallyShown++;
          } else {
            card.classList.add('hidden');
            card.classList.remove('animate-card-entrance');
            card.style.animationDelay = '';
          }
        } else {
          card.classList.add('hidden');
          card.classList.remove('animate-card-entrance');
          card.style.animationDelay = '';
        }
      });

      // Synchronize in-grid partner banners with visible cards: exactly 1 banner for every 7 visible cards!
      const gridBanners = document.querySelectorAll('.in-grid-partner-banner');
      const maxBannersToShow = Math.floor(actuallyShown / 7);
      gridBanners.forEach((b, bIdx) => {
        if (bIdx < maxBannersToShow) {
          const wasHidden = b.classList.contains('hidden');
          b.classList.remove('hidden');
          if (wasHidden) {
            b.classList.remove('animate-card-entrance');
            void b.offsetWidth;
            b.classList.add('animate-card-entrance');
            b.style.animationDelay = ((bIdx % 3) * 60) + 'ms';
          }
        } else {
          b.classList.add('hidden');
          b.classList.remove('animate-card-entrance');
          b.style.animationDelay = '';
        }
      });`;

const newFilterLoop = `        if (matchCat && matchRegion && matchLang && matchType && matchStore && matchQuery) {
          matchedCount++;
          if (matchedCount <= visibleLimit) {
            const wasHidden = card.classList.contains('hidden') || card.style.display === 'none';
            card.classList.remove('hidden', 'deal-item-collapsed');
            card.style.display = '';
            if (wasHidden) {
              card.classList.remove('animate-card-entrance');
              void card.offsetWidth; // Force reflow to reliably restart CSS keyframe animation
              card.classList.add('animate-card-entrance');
              card.style.animationDelay = ((actuallyShown % 21) * 35) + 'ms';
            }
            actuallyShown++;
          } else {
            card.classList.add('hidden');
            card.classList.remove('animate-card-entrance');
            card.style.animationDelay = '';
          }
        } else {
          card.classList.add('hidden');
          card.classList.remove('animate-card-entrance');
          card.style.animationDelay = '';
        }
      });

      // Synchronize in-grid partner banners with visible cards: exactly 1 banner for every 7 visible cards!
      const gridBanners = document.querySelectorAll('.in-grid-partner-banner');
      const maxBannersToShow = Math.floor(actuallyShown / 7);
      gridBanners.forEach((b, bIdx) => {
        if (bIdx < maxBannersToShow) {
          const wasHidden = b.classList.contains('hidden') || b.style.display === 'none';
          b.classList.remove('hidden', 'deal-item-collapsed');
          b.style.display = '';
          if (wasHidden) {
            b.classList.remove('animate-card-entrance');
            void b.offsetWidth; // Force reflow
            b.classList.add('animate-card-entrance');
            b.style.animationDelay = ((bIdx % 3) * 80) + 'ms';
          }
        } else {
          b.classList.add('hidden');
          b.classList.remove('animate-card-entrance');
          b.style.animationDelay = '';
        }
      });`;

// Normalize CRLF
const normOld = oldFilterLoop.replace(/\r?\n/g, '\r\n');
const normNew = newFilterLoop.replace(/\r?\n/g, '\r\n');

if (code.includes(normOld)) {
  code = code.replace(normOld, normNew);
  console.log('Successfully updated filter loop in index.astro');
} else {
  // Try LF replacement
  const lfOld = oldFilterLoop.replace(/\r\n/g, '\n');
  const lfNew = newFilterLoop.replace(/\r\n/g, '\n');
  if (code.includes(lfOld)) {
    code = code.replace(lfOld, lfNew);
    console.log('Successfully updated filter loop (LF) in index.astro');
  } else {
    console.error('Failed to locate filter loop in index.astro');
    process.exit(1);
  }
}

fs.writeFileSync(path, code, 'utf8');
console.log('Finished patching index.astro');


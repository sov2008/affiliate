const fs = require('fs');

const file = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(file, 'utf8');

// 1. In template, add animate-card-entrance to initial 21 items
content = content.replace(
  '${idx >= 21 ? \'deal-item-collapsed hidden\' : \'\'}',
  '${idx >= 21 ? \'deal-item-collapsed hidden\' : \'animate-card-entrance\'}'
);

content = content.replace(
  '${idx >= 21 ? \'deal-item-collapsed hidden\' : \'\'}',
  '${idx >= 21 ? \'deal-item-collapsed hidden\' : \'animate-card-entrance\'}'
);

// 2. Replace filterDeals function precisely
const s = content.indexOf('function filterDeals() {');
const e = content.indexOf('// Load More Next 12');

if (s === -1 || e === -1) {
  console.error('Indices not found:', s, e);
  process.exit(1);
}

const newFilterDeals = `function filterDeals() {
      let matchedCount = 0;
      let actuallyShown = 0;
      const q = searchQuery.toLowerCase().trim();

      if (currentStore) {
        storeBadge?.classList.remove('hidden');
        storeBadge?.classList.add('inline-flex');
        if (storeText) storeText.textContent = currentStore;
      } else {
        storeBadge?.classList.add('hidden');
        storeBadge?.classList.remove('inline-flex');
      }

      let isFiltered = currentCategory !== 'ALL' || (currentRegion !== 'ALL' && currentRegion !== 'GLOBAL') || currentType !== 'ALL' || !!currentStore || !!q;
      const liveResetBtn = document.getElementById('liveResetFiltersBtn');
      if (liveResetBtn) {
        if (isFiltered) {
          liveResetBtn.classList.remove('hidden');
          liveResetBtn.classList.add('inline-flex');
        } else {
          liveResetBtn.classList.add('hidden');
          liveResetBtn.classList.remove('inline-flex');
        }
      }
      const loadMoreContainer = document.getElementById('loadMoreContainer');

      cards.forEach((card) => {
        const cCat = card.getAttribute('data-category') || '';
        const cStore = card.getAttribute('data-store') || '';
        const cType = card.getAttribute('data-type') || '';
        const cRegions = (card.getAttribute('data-regions') || 'GLOBAL').split(',');
        const cLang = card.getAttribute('data-lang') || 'en';
        const cSearch = card.getAttribute('data-search') || '';
        const cText = card.innerText.toLowerCase();

        let matchCat = false;
        if (currentCategory === 'ALL') {
          matchCat = true;
        } else if (currentCategory === 'BLACK_FRIDAY') {
          const discountMatch = cText.match(/(\\d+)%/);
          const pct = discountMatch ? parseInt(discountMatch[1], 10) : 0;
          matchCat = pct >= 40 || cText.includes('black friday') || cText.includes('cyber') || cText.includes('save up to') || cText.includes('free');
        } else if (CORE_VERTICAL_MAP[currentCategory]) {
          matchCat = CORE_VERTICAL_MAP[currentCategory].includes(cCat);
        } else {
          matchCat = cCat === currentCategory || cCat.toLowerCase().includes(currentCategory.toLowerCase());
        }

        const matchRegion = (!currentRegion || currentRegion === 'ALL' || currentRegion === 'GLOBAL') 
          ? true 
          : cRegions.includes(currentRegion);

        const matchLang = (currentLang === 'en')
          ? (cLang === 'en')
          : (cLang === currentLang || cLang === 'en');

        const matchType = currentType === 'ALL' || cType === currentType;
        const matchStore = !currentStore || cStore.toLowerCase() === currentStore.toLowerCase();
        const matchQuery = !q || cText.includes(q) || cSearch.includes(q) || cStore.toLowerCase().includes(q);

        if (matchCat && matchRegion && matchLang && matchType && matchStore && matchQuery) {
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
      });

      // Update Pagination UI elements
      if (loadMoreContainer) {
        if (actuallyShown >= matchedCount) {
          loadMoreContainer.classList.add('hidden');
        } else {
          loadMoreContainer.classList.remove('hidden');
        }
      }

      const showingCountEl = document.getElementById('paginationShowingCount');
      if (showingCountEl) showingCountEl.textContent = String(actuallyShown);

      const totalCountEl = document.getElementById('paginationTotalCount');
      if (totalCountEl) totalCountEl.textContent = String(matchedCount);

      const progressBar = document.getElementById('paginationProgressBar');
      if (progressBar && matchedCount > 0) {
        const pct = Math.min(100, Math.round((actuallyShown / matchedCount) * 100));
        progressBar.style.width = \`\${pct}%\`;
      }

      const leftSpan = document.querySelector('#loadMoreDealsBtn span:nth-child(2)');
      if (leftSpan) {
        const remaining = Math.max(0, matchedCount - actuallyShown);
        leftSpan.textContent = \`+\${Math.min(PAGE_SIZE, remaining)}\`;
      }

      if (countBadge) countBadge.textContent = \`\${matchedCount} verified offers\`;

      if (matchedCount === 0) {
        emptyState?.classList.remove('hidden');
      } else {
        emptyState?.classList.add('hidden');
      }
    }

    `;

content = content.slice(0, s) + newFilterDeals + content.slice(e);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated filterDeals in index.astro!');

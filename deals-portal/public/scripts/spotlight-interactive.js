// Spotlight Tab Switching Logic
  document.querySelectorAll('.spotlight-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-spotlight-tab');

      // Update button visual states
      document.querySelectorAll('.spotlight-tab-btn').forEach(b => {
        const isActive = b === btn;
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        b.classList.toggle('is-active', isActive);
        b.classList.toggle('text-slate-600', !isActive);
        b.classList.toggle('dark:text-slate-300', !isActive);
      });

      // Show target panel
      const panels = {
        'products': document.getElementById('tabContentProducts'),
        'expiring': document.getElementById('tabContentExpiring'),
        'software': document.getElementById('tabContentSoftware')
      };

      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        if (key === target) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });

  // Dynamic Product Carousel & Geo-matching
  (function initProductRotation() {
    let currentPage = 0;
    const pageSize = 4;
    let visiblePool = [];

    const allProductCards = Array.from(document.querySelectorAll('.spotlight-product-card'));
    const prevBtn = document.getElementById('spotlightProductPrevBtn');
    const nextBtn = document.getElementById('spotlightProductNextBtn');
    const indicator = document.getElementById('spotlightProductPageIndicator');

    function calculatePool() {
      let reg = 'GLOBAL';
      try {
        reg = localStorage.getItem('promoradar_selected_region') || 'GLOBAL';
      } catch (e) {}

      const primary = [];
      const fallback = [];

      allProductCards.forEach(card => {
        const cRegions = (card.getAttribute('data-regions') || 'GLOBAL').split(',');
        const matches = (!reg || reg === 'ALL' || reg === 'GLOBAL') ? true : cRegions.includes(reg);

        if (matches) {
          primary.push(card);
        } else {
          fallback.push(card);
        }
      });

      visiblePool = primary.concat(fallback);
      if (visiblePool.length === 0) visiblePool = allProductCards;
      currentPage = 0;
      renderPage();
    }

    function renderPage() {
      const totalPages = Math.max(1, Math.ceil(visiblePool.length / pageSize));
      if (currentPage >= totalPages) currentPage = 0;
      if (currentPage < 0) currentPage = totalPages - 1;

      const start = currentPage * pageSize;
      const end = start + pageSize;
      const currentCardsSet = new Set(visiblePool.slice(start, end));

      allProductCards.forEach(card => {
        if (currentCardsSet.has(card)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      if (indicator) {
        indicator.textContent = `${currentPage + 1} / ${totalPages}`;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentPage--;
        renderPage();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentPage++;
        renderPage();
      });
    }

    // Auto rotate products smoothly every 7 seconds when active tab is visible
    let autoRotateTimer = setInterval(() => {
      const productsPanel = document.getElementById('tabContentProducts');
      if (productsPanel && !productsPanel.classList.contains('hidden') && !document.hidden) {
        currentPage++;
        renderPage();
      }
    }, 7000);

    calculatePool();
    window.addEventListener('promoradar_region_changed', calculatePool);
  })();

  // Dynamic Geo & Language filtering for Expiring Soon cards
  function syncSpotlightFilters() {
    let reg = 'GLOBAL';
    let lang = 'en';
    try {
      reg = localStorage.getItem('promoradar_selected_region') || 'GLOBAL';
      lang = localStorage.getItem('promoradar_lang') || 'en';
    } catch (e) {}

    const allCards = Array.from(document.querySelectorAll('.spotlight-expiring-card'));
    const matchingRegional = [];
    const fallbackWorldwide = [];

    allCards.forEach(card => {
      const cRegions = (card.getAttribute('data-regions') || 'GLOBAL').split(',');
      const cLang = card.getAttribute('data-lang') || 'en';

      const matchRegion = (!reg || reg === 'ALL' || reg === 'GLOBAL') ? true : cRegions.includes(reg);
      const matchLang = (lang === 'en') ? (cLang === 'en') : (cLang === lang || cLang === 'en');

      if (matchRegion && matchLang) {
        matchingRegional.push(card);
      } else if (cRegions.includes('GLOBAL') || cRegions.includes('US') || cRegions.includes('EU')) {
        fallbackWorldwide.push(card);
      }
    });

    const toShow = new Set(matchingRegional.slice(0, 4));
    if (toShow.size < 4) {
      for (const fb of fallbackWorldwide) {
        toShow.add(fb);
        if (toShow.size === 4) break;
      }
    }

    allCards.forEach(card => {
      if (toShow.has(card)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  syncSpotlightFilters();
  window.addEventListener('promoradar_region_changed', syncSpotlightFilters);
  window.addEventListener('promoradar_lang_changed', syncSpotlightFilters);
const categoriesRegistry = [{"slug":"privacy-security","name":"Privacy, VPN & Cybersecurity","categoryName":"Privacy & Security","icon":"🛡️"},{"slug":"gaming-software","name":"Gaming, Media & Software","categoryName":"Gaming & Software","icon":"🎮"},{"slug":"home-appliances","name":"Home, Garden & Appliances","categoryName":"Home & Living","icon":"🏡"},{"slug":"fashion-apparel","name":"Fashion, Apparel & Shoes","categoryName":"Fashion","icon":"👕"},{"slug":"travel-vacations","name":"Travel, Flights & Booking","categoryName":"Travel & Vacations","icon":"✈️"},{"slug":"electronics-gadgets","name":"Electronics, Tech & Gadgets","categoryName":"Electronics","icon":"💻"},{"slug":"automotive-parts","name":"Automotive, Parts & Accessories","categoryName":"Automotive","icon":"🚗"},{"slug":"food-delivery","name":"Food, Groceries & Delivery","categoryName":"Food & Groceries","icon":"☕"},{"slug":"office-business","name":"Office, SaaS & Business","categoryName":"Office & Business","icon":"📦"}];
const heroSavingsById = {"deal_expressvpn_49":{"en":{"value":"Save $79.80 / yr","sub":"Calculated against the standard monthly rate across 15 billing cycles with 3 months free."},"ua":{"value":"Економія $79.80 / рік","sub":"Розраховано на основі стандартного щомісячного тарифу за 15 місяців з 3 бонусними."},"ar":{"value":"وفّر 79.80$ سنوياً","sub":"محسوبة مقارنة بالسعر الشهري القياسي عبر 15 دورة فوترة مع 3 أشهر مجانية."},"es":{"value":"Ahorra $79.80 / año","sub":"Calculado frente a la tarifa mensual estándar durante 15 ciclos con 3 meses gratis."},"pt":{"value":"Poupe $79.80 / ano","sub":"Calculado em relação à tarifa mensal padrão em 15 ciclos com 3 meses grátis."},"de":{"value":"Sparen Sie 79,80 $ / Jahr","sub":"Berechnet gegenüber dem regulären Monatstarif bei 15 Monaten Laufzeit inklusive 3 Gratismonaten."}},"deal_nordvpn_74":{"en":{"value":"Save $189.00 / 2-yr","sub":"Average savings based on the Complete 2-year tier compared to monthly billing without discount."},"ua":{"value":"Економія $189.00 / 2 роки","sub":"Середня економія на 2-річному плані Complete у порівнянні з щомісячною оплатою."},"ar":{"value":"وفّر 189.00$ لكل سنتين","sub":"متوسط التوفير لباقة السنتين الكاملة مقارنة بالاشتراك الشهري العادي."},"es":{"value":"Ahorra $189.00 / 2 años","sub":"Ahorro promedio del plan Completo de 2 años en comparación con la facturación mensual."},"pt":{"value":"Poupe $189.00 / 2 anos","sub":"Poupança média no plano Completo de 2 anos em comparação com a faturação mensal."},"de":{"value":"Sparen Sie 189,00 $ / 2 Jahre","sub":"Durchschnittliche Ersparnis beim 2-Jahres-Komplettpaket gegenüber monatlicher Abrechnung."}},"deal_hostinger_81":{"en":{"value":"Save $432.00 / 4-yr","sub":"Savings evaluated against month-to-month hosting renewals over a 48-month hosting term."},"ua":{"value":"Економія $432.00 / 4 роки","sub":"Економія за 48-місячний період порівняно зі щомісячним поновленням тарифу."},"ar":{"value":"وفّر 432.00$ لكل 4 سنوات","sub":"توفير محسوب على مدار فترة استضافة 48 شهراً مقارنة بالتجديد الشهري."},"es":{"value":"Ahorra $432.00 / 4 años","sub":"Ahorro calculado frente a renovaciones mensuales durante un periodo de 48 meses."},"pt":{"value":"Poupe $432.00 / 4 anos","sub":"Poupança calculada face à renovação mensal num período de alojamento de 48 meses."},"de":{"value":"Sparen Sie 432,00 $ / 4 Jahre","sub":"Ersparnis berechnet gegenüber monatlicher Verlängerung über eine Laufzeit von 48 Monaten."}},"deal_coursera_50":{"en":{"value":"Save $200.00 / yr","sub":"Savings on unlimited professional certificates vs paying per single certification course."},"ua":{"value":"Економія $200.00 / рік","sub":"Економія на необмежених професійних сертифікатах у порівнянні з оплатою окремих курсів."},"ar":{"value":"وفّر 200.00$ سنوياً","sub":"توفير على الشهادات المهنية غير المحدودة مقارنة بالدفع لكل دورة تدريبية منفصلة."},"es":{"value":"Ahorra $200.00 / año","sub":"Ahorro en certificados profesionales ilimitados en comparación con el pago por curso individual."},"pt":{"value":"Poupe $200.00 / ano","sub":"Poupança em certificados profissionais ilimitados face ao pagamento por curso individual."},"de":{"value":"Sparen Sie 200,00 $ / Jahr","sub":"Ersparnis bei unbegrenzten Berufszertifikaten gegenüber Einzelkursbuchungen."}},"deal_tripcom_8":{"en":{"value":"Save ~$64.00 / trip","sub":"Estimated average hotel reservation savings based on a 4-night 4-star international stay."},"ua":{"value":"Економія ~$64.00 / поїздка","sub":"Орієнтовна економія на проживанні в 4-зірковому готелі на 4 ночі за кордоном."},"ar":{"value":"وفّر ~64.00$ لكل رحلة","sub":"متوسط توفير حجوزات الفنادق بناءً على إقامة 4 ليالٍ في فندق 4 نجوم عالمي."},"es":{"value":"Ahorra ~$64.00 / viaje","sub":"Ahorro promedio estimado en reservas de hotel para una estancia de 4 noches en 4 estrellas."},"pt":{"value":"Poupe ~$64.00 / viagem","sub":"Poupança média estimada em reservas de hotel para estadias de 4 noites num hotel de 4 estrelas."},"de":{"value":"Sparen Sie ca. 64,00 $ / Reise","sub":"Geschätzte Hotelersparnis bei 4 Übernachtungen in einem 4-Sterne-Hotel im Ausland."}}};
const baseUrl = "";


    // State & Interactive Logic
    let currentCategory = 'ALL';
    let currentRegion = 'ALL';
    let currentLang = 'en';
    try {
      const storedReg = localStorage.getItem('promoradar_selected_region');
      if (storedReg) currentRegion = storedReg;
      const storedLang = localStorage.getItem('promoradar_lang');
      if (storedLang) currentLang = storedLang;
    } catch (e) {}
    let currentType = 'ALL';
    let currentStore = null;
    let searchQuery = '';
    let savedDeals = JSON.parse(localStorage.getItem('promoradar_saved_deals') || '[]');

    const cards = Array.from(document.querySelectorAll('.deal-grid-card'));
    const emptyState = document.getElementById('mainDealsEmptyState');
    const countBadge = document.getElementById('dealsGridCount');
    const storeBadge = document.getElementById('activeStoreFilterBadge');
    const storeText = document.getElementById('activeStoreFilterText');
    const savedBadge = document.getElementById('savedCountBadge');

    // Countdown Timer for Deals Ending Soon
    function initCountdown() {
      const timerEl = document.getElementById('countdownTimer');
      if (!timerEl) return;
      let totalSeconds = 4 * 3600 + 47 * 60 + 19;
      setInterval(() => {
        if (totalSeconds > 0) totalSeconds--;
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        timerEl.textContent = `${h}:${m}:${s}`;
      }, 1000);
    }
    initCountdown();

    function updateSavedBadge() {
      if (savedBadge) savedBadge.textContent = savedDeals.length;
      document.querySelectorAll('.deal-save-btn').forEach(btn => {
        const id = btn.getAttribute('data-save-id');
        if (savedDeals.includes(id)) {
          btn.classList.add('text-rose-500', 'bg-rose-50', 'border-rose-200');
          btn.classList.remove('text-slate-400');
        } else {
          btn.classList.remove('text-rose-500', 'bg-rose-50', 'border-rose-200');
          btn.classList.add('text-slate-400');
        }
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('globalToast');
      const text = document.getElementById('globalToastMessage');
      if (!toast || !text) return;
      text.textContent = msg;
      toast.classList.remove('hidden');
      toast.classList.add('flex');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('flex');
      }, 2500);
    }

    const CORE_VERTICAL_MAP = {
      'Privacy & Security': ['Privacy & Security'],
      'Gaming, Media & Software': ['Gaming, Media & Software'],
      'Web Hosting & Domains': ['Web Hosting & Domains'],
      'Travel & Tours': ['Travel & Tours'],
      'Electronics & Gadgets': ['Electronics & Gadgets'],
      'Home & Living': ['Home & Living'],
      'Fashion & Apparel': ['Fashion & Apparel'],
      'Beauty & Fragrances': ['Beauty & Fragrances'],
      'Eyewear & Health': ['Eyewear & Health'],
      'Auto, Dashcams & Mobility': ['Auto, Dashcams & Mobility'],
      'Food, Beverage & Nutrition': ['Food, Beverage & Nutrition'],
      'Insurance & Finance': ['Insurance & Finance'],
      'Education & Learning': ['Education & Learning'],
      'Kids & Toys': ['Kids & Toys'],
      'Dating & Lifestyle': ['Dating & Lifestyle'],
      'E-Commerce & Wholesale': ['E-Commerce & Wholesale']
    };

    let PAGE_SIZE = 21;
    let visibleLimit = PAGE_SIZE;

    function filterDeals() {
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
          const discountMatch = cText.match(/(\d+)%/);
          const pct = discountMatch ? parseInt(discountMatch[1], 10) : 0;
          matchCat = pct >= 40 || cText.includes('black friday') || cText.includes('cyber') || cText.includes('save up to') || cText.includes('free');
        } else {
          const normCat = (s) => (s || '').replace(/&amp;/g, '&').toLowerCase().trim();
          const targetNorm = normCat(currentCategory);
          const cCatNorm = normCat(cCat);
          if (CORE_VERTICAL_MAP[currentCategory]) {
            matchCat = CORE_VERTICAL_MAP[currentCategory].some(mapped => normCat(mapped) === cCatNorm || cCatNorm.includes(normCat(mapped)));
          } else {
            matchCat = (cCatNorm === targetNorm) || cCatNorm.includes(targetNorm) || targetNorm.includes(cCatNorm);
          }
        }

        const matchRegion = (!currentRegion || currentRegion === 'ALL' || currentRegion === 'GLOBAL') 
          ? true 
          : (cRegions.includes(currentRegion) || cRegions.includes("GLOBAL"));

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
        progressBar.style.width = `${pct}%`;
      }

      const leftSpan = document.querySelector('#loadMoreDealsBtn span:nth-child(2)');
      const labelSpan = document.querySelector('#loadMoreDealsBtn span:nth-child(1)');
      const remaining = Math.max(0, matchedCount - actuallyShown);
      const nextBatch = Math.min(PAGE_SIZE, remaining);
      if (labelSpan) {
        labelSpan.textContent = `Load Next ${nextBatch} Deals`;
      }
      if (leftSpan) {
        leftSpan.textContent = `+${nextBatch}`;
      }

      if (countBadge) countBadge.textContent = `${matchedCount} verified offers`;

      if (matchedCount === 0) {
        emptyState?.classList.remove('hidden');
      } else {
        emptyState?.classList.add('hidden');
      }
    }

    // Load More Next 12
    document.getElementById('loadMoreDealsBtn')?.addEventListener('click', () => {
      visibleLimit += PAGE_SIZE;
      filterDeals();
      showToast(`Loaded more verified offers!`);
    });

    // Reveal All Action
    document.getElementById('revealAllDealsBtn')?.addEventListener('click', () => {
      visibleLimit = 99999;
      filterDeals();
      showToast(`All verified partner deals revealed!`);
    });

    // Back to top of deals
    document.getElementById('paginationBackToTopBtn')?.addEventListener('click', () => {
      document.getElementById('filterConsoleWrapper')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Category Buttons
    document.querySelectorAll('.main-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-cat') || 'ALL';
        document.querySelectorAll('.main-cat-btn').forEach(b => {
          const isActive = b.getAttribute('data-cat') === currentCategory;
          b.classList.toggle('is-active', isActive);
          b.classList.toggle('font-bold', isActive);
          b.classList.toggle('font-semibold', !isActive);
        });
        filterDeals();
      });
    });

    const regionHtmlMap = {
      'ALL': '<svg class="w-4 h-4 text-slate-500 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> <span>Worldwide</span>',
      'GLOBAL': '<svg class="w-4 h-4 text-slate-500 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> <span>Worldwide</span>',
      'US': '<img src="/flags/us.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="US" /> <span>United States</span>',
      'EU': '<img src="/flags/eu.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="EU" /> <span>Europe</span>',
      'GCC': '<img src="/flags/ae.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="GCC" /> <span>UAE &amp; GCC</span>',
      'UA': '<img src="/flags/ua.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="UA" /> <span>Ukraine</span>',
      'GB': '<img src="/flags/gb.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="GB" /> <span>United Kingdom</span>',
      'IN': '<img src="/flags/in.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="IN" /> <span>India</span>',
      'MX': '<img src="/flags/mx.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="MX" /> <span>Mexico</span>',
      'BR': '<img src="/flags/br.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="BR" /> <span>Brazil</span>',
      'CZ': '<img src="/flags/cz.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="CZ" /> <span>Czechia</span>',
      'PL': '<img src="/flags/pl.svg" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="PL" /> <span>Poland</span>'
    };

    function applySelectedRegion(reg, skipDispatch = false) {
      currentRegion = reg || 'GLOBAL';
      const heroRegionText = document.getElementById('heroSelectedRegionText');
      if (heroRegionText && regionHtmlMap[currentRegion]) {
        heroRegionText.innerHTML = regionHtmlMap[currentRegion];
      }

      // Sync Hero dropdown checkmarks
      document.querySelectorAll('.hero-region-option').forEach(o => {
        const isSel = o.getAttribute('data-hero-region') === currentRegion;
        let check = o.querySelector('.hero-region-check');
        if (isSel) {
          if (!check) o.insertAdjacentHTML('beforeend', '<span class="hero-region-check text-emerald-500 font-bold">✓</span>');
        } else {
          if (check) check.remove();
        }
      });

      // Sync secondary region filter pills if present
      document.querySelectorAll('.region-filter-btn').forEach(b => {
        const isAct = b.getAttribute('data-region') === currentRegion;
        b.classList.toggle('is-active', isAct);
        b.classList.toggle('font-bold', isAct);
        b.classList.toggle('font-semibold', !isAct);
      });

      try { localStorage.setItem('promoradar_selected_region', currentRegion); } catch (e) {}

      if (!skipDispatch) {
        window.dispatchEvent(new CustomEvent('promoradar_region_changed', { detail: { region: currentRegion } }));
      }

      filterDeals();
    }

    // Region & Geo Buttons
    document.querySelectorAll('.region-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.tagName === 'A') e.preventDefault();
        const reg = btn.getAttribute('data-region') || 'GLOBAL';
        applySelectedRegion(reg);
      });
    });

    // Listen to header region changes
    window.addEventListener('promoradar_region_changed', (e) => {
      const reg = e.detail?.region || 'GLOBAL';
      if (reg !== currentRegion) {
        applySelectedRegion(reg, true);
      }
    });

    // Listen to language changes
    window.addEventListener('promoradar_lang_changed', (e) => {
      const lang = e.detail?.lang || 'en';
      if (lang !== currentLang) {
        currentLang = lang;
        filterDeals();
      }
    });

    // Offer Type Buttons
    document.querySelectorAll('.type-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentType = btn.getAttribute('data-type') || 'ALL';
        document.querySelectorAll('.type-filter-btn').forEach(b => {
          const isActive = b.getAttribute('data-type') === currentType;
          b.classList.toggle('is-active', isActive);
          b.classList.toggle('font-bold', isActive);
          b.classList.toggle('font-semibold', !isActive);
        });
        filterDeals();
      });
    });

    // Store Strip Filter Buttons
    document.querySelectorAll('.store-strip-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.tagName === 'A') {
          e.preventDefault();
        }
        const sName = btn.getAttribute('data-filter-store');
        currentStore = currentStore === sName ? null : sName;
        document.querySelectorAll('.store-strip-pill').forEach(b => {
          if (b.getAttribute('data-filter-store') === currentStore) {
            b.classList.add('bg-indigo-50', 'border-indigo-500', 'ring-2', 'ring-indigo-500/20');
          } else {
            b.classList.remove('bg-indigo-50', 'border-indigo-500', 'ring-2', 'ring-indigo-500/20');
          }
        });
        filterDeals();
      });
    });

    document.getElementById('clearStoreFilterBtn')?.addEventListener('click', () => {
      currentStore = null;
      document.querySelectorAll('.store-strip-pill').forEach(b => {
        b.classList.remove('bg-indigo-50', 'border-indigo-500', 'ring-2', 'ring-indigo-500/20');
      });
      filterDeals();
    });

    // Live Reset Filters in Sticky Bar
    document.getElementById('liveResetFiltersBtn')?.addEventListener('click', () => {
      currentCategory = 'ALL';
      currentRegion = 'ALL';
      currentType = 'ALL';
      currentStore = null;
      searchQuery = '';
      if (document.getElementById('mainHeroSearchInput')) document.getElementById('mainHeroSearchInput').value = '';
      updateHeroClearBtn('');
      document.querySelectorAll('.main-cat-btn').forEach(b => b.classList.toggle('is-active', b.getAttribute('data-cat') === 'ALL'));
      document.querySelectorAll('.region-filter-btn').forEach(b => b.classList.toggle('is-active', b.getAttribute('data-region') === 'ALL'));
      document.querySelectorAll('.type-filter-btn').forEach(b => b.classList.toggle('is-active', b.getAttribute('data-type') === 'ALL'));
      filterDeals();
    });

    document.getElementById('resetMainFiltersBtn')?.addEventListener('click', () => {
      currentCategory = 'ALL';
      currentType = 'ALL';
      currentStore = null;
      searchQuery = '';
      if (document.getElementById('mainHeroSearchInput')) document.getElementById('mainHeroSearchInput').value = '';
      updateHeroClearBtn('');
      if (document.getElementById('gridStoreFilterInput')) document.getElementById('gridStoreFilterInput').value = '';
      document.getElementById('gridFilterClearBtn')?.classList.add('hidden');
      filterDeals();
    });

    // Grid Instant Filter Input Handler
    const gridFilterInput = document.getElementById('gridStoreFilterInput');
    const gridFilterClearBtn = document.getElementById('gridFilterClearBtn');

    gridFilterInput?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      searchQuery = val;
      if (val.length > 0) {
        gridFilterClearBtn?.classList.remove('hidden');
      } else {
        gridFilterClearBtn?.classList.add('hidden');
      }
      filterDeals();
    });

    gridFilterClearBtn?.addEventListener('click', () => {
      if (gridFilterInput) gridFilterInput.value = '';
      gridFilterClearBtn.classList.add('hidden');
      searchQuery = '';
      filterDeals();
      gridFilterInput?.focus();
    });

    // Asynchronous Search Index Loader (0kb initial blocking payload)
    let storesRegistry = [];
    let dealsRegistry = [];
    let storeDomainsRegistry = {};
    let searchIndexLoaded = false;
    let searchIndexLoading = false;

    async function loadSearchIndex() {
      if (searchIndexLoaded || searchIndexLoading) return;
      searchIndexLoading = true;
      try {
        const res = await fetch(`/data/search-index.json`);
        if (res.ok) {
          const data = await res.json();
          storesRegistry = data.stores || [];
          dealsRegistry = data.deals || [];
          storeDomainsRegistry = data.domains || {};
          searchIndexLoaded = true;
        }
      } catch (e) {
        console.warn('Search index load failed', e);
      } finally {
        searchIndexLoading = false;
      }
    }

    // Live Hero Spotlight Search Auto-suggest Engine
    const heroSpotlight = document.getElementById('heroSearchSpotlight');
    const heroSpotlightStoresList = document.getElementById('heroSpotlightStoresList');
    const heroSpotlightCategoriesList = document.getElementById('heroSpotlightCategoriesList');
    const heroSpotlightDealsList = document.getElementById('heroSpotlightDealsList');
    const heroSpotlightStoresSection = document.getElementById('heroSpotlightStoresSection');
    const heroSpotlightCategoriesSection = document.getElementById('heroSpotlightCategoriesSection');
    const heroSpotlightDealsSection = document.getElementById('heroSpotlightDealsSection');
    const heroSpotlightEmpty = document.getElementById('heroSpotlightEmpty');
    const heroSpotlightStatus = document.getElementById('heroSpotlightStatus');

    function renderHeroSpotlight(query) {
      if (!query || query.trim().length < 2) {
        heroSpotlight?.classList.add('hidden');
        return;
      }

      const rawQ = query.trim();
      const q = rawQ.toLowerCase();
      if (heroSpotlightStatus) heroSpotlightStatus.textContent = `Results for "${rawQ}"`;

      // Helper function for smart domain resolution
      function resolveDomain(s) {
        if (s.domain) return s.domain;
        const mapped = storeDomainsRegistry && (storeDomainsRegistry[s.slug] || storeDomainsRegistry[s.name]);
        if (mapped && !mapped.includes('terms') && !mapped.includes('program')) return mapped;
        return '';
      }

      // 1. Match Stores with relevance scoring (Prefix > Word match > Contains)
      function scoreStore(s) {
        const name = (s.name || '').toLowerCase();
        const slug = (s.slug || '').toLowerCase();
        if (name.includes('get 1%') || name.includes('1929b') || name.includes('tested fr')) return -1;
        if (name === q || slug === q) return 100;
        if (name.startsWith(q)) return 80;
        const words = name.split(/[\s\-]+/);
        if (words.some(w => w.startsWith(q))) return 65;
        if (slug.startsWith(q)) return 55;
        if (name.includes(q)) return 35;
        if (slug.includes(q)) return 25;
        return 0;
      }

      const matchedStores = (storesRegistry || [])
        .map(s => ({ ...s, score: scoreStore(s) }))
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      // 2. Match Categories (Strict prefix or word prefix)
      function scoreCategory(c) {
        const name = (c.name || '').toLowerCase();
        const slug = (c.slug || '').toLowerCase();
        if (name === q || slug === q) return 100;
        if (name.startsWith(q)) return 80;
        const words = name.split(/[\s,&\-]+/).filter(Boolean);
        if (words.some(w => w.startsWith(q))) return 60;
        if (slug.startsWith(q)) return 50;
        if (name.includes(q)) return 20;
        return 0;
      }

      const matchedCategories = (categoriesRegistry || [])
        .map(c => ({ ...c, score: scoreCategory(c) }))
        .filter(c => c.score >= 50)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      // 3. Match Deals / Promo Codes (Code prefix > Store match > Title match)
      function scoreDeal(d) {
        const title = (d.title || '').toLowerCase();
        const sName = (d.storeName || '').toLowerCase();
        const code = (d.code || '').toLowerCase();
        if (title.includes('1929b') || sName.includes('get 1%')) return -1;
        if (code && code === q) return 100;
        if (code && code.startsWith(q)) return 85;
        if (sName.startsWith(q)) return 75;
        const sWords = sName.split(/[\s\-]+/);
        if (sWords.some(w => w.startsWith(q))) return 65;
        if (title.startsWith(q)) return 55;
        const tWords = title.split(/[\s\-]+/);
        if (tWords.some(w => w.startsWith(q))) return 45;
        if (sName.includes(q)) return 30;
        if (title.includes(q)) return 20;
        return 0;
      }

      const matchedDeals = (dealsRegistry || [])
        .map(d => ({ ...d, score: scoreDeal(d) }))
        .filter(d => d.score >= 30)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      const totalMatches = matchedStores.length + matchedCategories.length + matchedDeals.length;

      const storesCountEl = document.getElementById('heroSpotlightStoresCount');
      const catsCountEl = document.getElementById('heroSpotlightCategoriesCount');
      const dealsCountEl = document.getElementById('heroSpotlightDealsCount');

      if (totalMatches === 0) {
        heroSpotlightStoresSection?.classList.add('hidden');
        heroSpotlightCategoriesSection?.classList.add('hidden');
        heroSpotlightDealsSection?.classList.add('hidden');
        heroSpotlightEmpty?.classList.remove('hidden');
        heroSpotlight?.classList.remove('hidden');
        return;
      }

      heroSpotlightEmpty?.classList.add('hidden');

      // Render Stores
      if (matchedStores.length > 0) {
        heroSpotlightStoresSection?.classList.remove('hidden');
        if (storesCountEl) storesCountEl.textContent = `${matchedStores.length} match${matchedStores.length > 1 ? 'es' : ''}`;
        if (heroSpotlightStoresList) {
          heroSpotlightStoresList.innerHTML = matchedStores.map(s => {
            const domain = resolveDomain(s);
            const count = (dealsRegistry || []).filter(d => d.storeSlug === s.slug).length;
            const initials = s.name ? s.name.split(/[\s\-]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'PR';

            const logoHtml = domain ? `
              <div class="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                <img
                  src="https://www.google.com/s2/favicons?domain=${domain}&sz=128"
                  alt="${s.name}"
                  class="w-full h-full object-contain"
                  loading="lazy"
                  data-fallback-duck="https://icons.duckduckgo.com/ip3/${domain}.ico"
                  onerror="if (this.getAttribute('data-fallback-duck') && this.src !== this.getAttribute('data-fallback-duck')) { this.src = this.getAttribute('data-fallback-duck'); } else { this.style.display = 'none'; if (this.nextElementSibling) this.nextElementSibling.style.display = 'flex'; }"
                />
                <span class="hidden w-full h-full items-center justify-center rounded bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-extrabold text-[10px]">${initials}</span>
              </div>
            ` : `
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                ${initials}
              </div>
            `;

            return `
              <a href="/stores/${s.slug}/" class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 transition group">
                <div class="flex items-center gap-2.5 min-w-0 pr-2">
                  ${logoHtml}
                  <div class="truncate">
                    <div class="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">${s.name}</div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1.5">
                      <span class="text-emerald-600 dark:text-emerald-400 font-bold">${count > 0 ? count + ' verified deal' + (count > 1 ? 's' : '') : 'Active store'}</span>
                      <span>·</span>
                      <span class="truncate">${s.category || 'Specialty'}</span>
                    </div>
                  </div>
                </div>
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/80 border border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-800/50 px-2 py-0.5 rounded-lg transition shrink-0 flex items-center gap-1">
                  <span>Store</span>
                  <span class="text-[11px]">→</span>
                </span>
              </a>
            `;
          }).join('');
        }
      } else {
        heroSpotlightStoresSection?.classList.add('hidden');
      }

      // Render Categories
      if (matchedCategories.length > 0) {
        heroSpotlightCategoriesSection?.classList.remove('hidden');
        if (catsCountEl) catsCountEl.textContent = `${matchedCategories.length}`;
        if (heroSpotlightCategoriesList) {
          heroSpotlightCategoriesList.innerHTML = matchedCategories.map(c => {
            return `
              <a href="/categories/${c.slug}/" class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 transition group">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-sm shrink-0">
                    ${c.icon}
                  </div>
                  <span class="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">${c.name}</span>
                </div>
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/80 border border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-800/50 px-2 py-0.5 rounded-lg transition shrink-0 flex items-center gap-1">
                  <span>Browse</span>
                  <span class="text-[11px]">→</span>
                </span>
              </a>
            `;
          }).join('');
        }
      } else {
        heroSpotlightCategoriesSection?.classList.add('hidden');
      }

      // Render Deals
      if (matchedDeals.length > 0) {
        heroSpotlightDealsSection?.classList.remove('hidden');
        if (dealsCountEl) dealsCountEl.textContent = `${matchedDeals.length}`;
        if (heroSpotlightDealsList) {
          heroSpotlightDealsList.innerHTML = matchedDeals.map(d => {
            const domain = (storeDomainsRegistry && (storeDomainsRegistry[d.storeSlug] || storeDomainsRegistry[d.storeName])) || '';
            const dealJson = JSON.stringify({
              id: d.id,
              title: d.title,
              desc: d.desc,
              code: d.code,
              storeName: d.storeName,
              storeSlug: d.storeSlug,
              domain: domain,
              badge: d.badge,
              affiliateUrl: d.affiliateUrl,
              successRate: d.successRate
            }).replace(/"/g, '&quot;');

            return `
              <button
                type="button"
                data-reveal-deal="${dealJson}"
                class="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 transition cursor-pointer group"
              >
                <div class="min-w-0 pr-2">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">${d.storeName}</span>
                    <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/30 whitespace-nowrap">${d.badge}</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">${d.title}</p>
                </div>
                <span class="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-200/80 dark:border-indigo-800/70 shrink-0 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition shadow-2xs">
                  ${d.code ? '••• ' + d.code.slice(-3) : 'Redeem ↗'}
                </span>
              </button>
            `;
          }).join('');
        }
      } else {
        heroSpotlightDealsSection?.classList.add('hidden');
      }

      heroSpotlight?.classList.remove('hidden');
    }

    // Search Inputs
    const heroInput = document.getElementById('mainHeroSearchInput');
    const headerInput = document.getElementById('headerQuickSearch');
    const heroClearBtn = document.getElementById('heroSearchClearBtn');

    function updateHeroClearBtn(val) {
      if (heroClearBtn) {
        if (val && val.length > 0) {
          heroClearBtn.classList.remove('hidden');
          heroClearBtn.classList.add('flex');
        } else {
          heroClearBtn.classList.add('hidden');
          heroClearBtn.classList.remove('flex');
        }
      }
    }

    heroInput?.addEventListener('input', async (e) => {
      searchQuery = e.target.value;
      if (headerInput) headerInput.value = searchQuery;
      updateHeroClearBtn(searchQuery);
      filterDeals();
      if (!searchIndexLoaded) await loadSearchIndex();
      renderHeroSpotlight(searchQuery);
    });

    heroInput?.addEventListener('focus', () => {
      loadSearchIndex();
    });

    const heroForm = document.getElementById('heroSearchForm');
    heroForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      searchQuery = heroInput ? heroInput.value : '';
      filterDeals();
      return false;
    });

    headerInput?.addEventListener('focus', () => {
      loadSearchIndex();
    });

    heroClearBtn?.addEventListener('click', () => {
      if (heroInput) {
        heroInput.value = '';
        heroInput.focus();
      }
      if (headerInput) headerInput.value = '';
      searchQuery = '';
      updateHeroClearBtn('');
      filterDeals();
      heroSpotlight?.classList.add('hidden');
    });

    heroInput?.addEventListener('focus', () => {
      if (heroInput.value.trim().length >= 2) {
        renderHeroSpotlight(heroInput.value);
      }
    });

    headerInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (heroInput) heroInput.value = searchQuery;
      filterDeals();
      renderHeroSpotlight(searchQuery);
    });

    headerInput?.addEventListener('focus', () => {
      if (headerInput.value.trim().length >= 2) {
        renderHeroSpotlight(headerInput.value);
      }
    });

    // Dismiss spotlight on click outside
    document.addEventListener('click', (e) => {
      const heroWrapper = document.getElementById('heroSearchWrapper');
      if (heroWrapper && !heroWrapper.contains(e.target)) {
        heroSpotlight?.classList.add('hidden');
      }
    });

    // Escape and Enter key listeners for hero input
    heroInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        heroSpotlight?.classList.add('hidden');
      } else if (e.key === 'Enter') {
        heroSpotlight?.classList.add('hidden');
        document.getElementById('mainDealsGrid')?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.getElementById('mainHeroSearchBtn')?.addEventListener('click', () => {
      heroSpotlight?.classList.add('hidden');
      document.getElementById('mainDealsGrid')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('heroSpotlightViewAllBtn')?.addEventListener('click', () => {
      heroSpotlight?.classList.add('hidden');
      document.getElementById('mainDealsGrid')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Quick Search Chips
    document.querySelectorAll('.trending-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        searchQuery = chip.getAttribute('data-chip') || '';
        if (heroInput) heroInput.value = searchQuery;
        if (headerInput) headerInput.value = searchQuery;
        updateHeroClearBtn(searchQuery);
        filterDeals();
        document.getElementById('mainDealsGrid')?.scrollIntoView({ behavior: 'smooth' });
      });
    });



    // Hero Region Selector Dropdown
    const heroRegionBtn = document.getElementById('heroRegionDropdownBtn');
    const heroRegionMenu = document.getElementById('heroRegionMenu');
    const heroRegionText = document.getElementById('heroSelectedRegionText');

    heroRegionBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      heroRegionMenu?.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!heroRegionBtn?.contains(e.target) && !heroRegionMenu?.contains(e.target)) {
        heroRegionMenu?.classList.add('hidden');
      }
    });

    document.querySelectorAll('.hero-region-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const reg = opt.getAttribute('data-hero-region') || 'GLOBAL';
        applySelectedRegion(reg);
        heroRegionMenu?.classList.add('hidden');
        document.getElementById('mainDealsGrid')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Deals Sort Select with Banner Rhythm Preservation
    const sortSelect = document.getElementById("dealsSortSelect");
    sortSelect?.addEventListener("change", function() {
      const mode = sortSelect.value;
      const grid = document.getElementById("dealsGridContainer");
      if (!grid) return;
      const dealCards = Array.from(grid.querySelectorAll(".deal-grid-card"));
      const bannerCards = Array.from(grid.querySelectorAll(".in-grid-partner-banner"));

      dealCards.sort(function(a, b) {
        if (mode === "discount") {
          const badgeA = a.querySelector(".badge-standard-discount, .badge-cash-rebate, .badge-bonus-deal")?.textContent || "";
          const badgeB = b.querySelector(".badge-standard-discount, .badge-cash-rebate, .badge-bonus-deal")?.textContent || "";
          const matchA = badgeA.match(/\d+/);
          const matchB = badgeB.match(/\d+/);
          const discA = matchA ? parseInt(matchA[0], 10) : 0;
          const discB = matchB ? parseInt(matchB[0], 10) : 0;
          return discB - discA;
        } else if (mode === "verified") {
          const isTopA = a.classList.contains("ring-1") ? 1 : 0;
          const isTopB = b.classList.contains("ring-1") ? 1 : 0;
          return isTopB - isTopA;
        } else {
          return 0;
        }
      });

      grid.innerHTML = "";
      dealCards.forEach(function(card, idx) {
        grid.appendChild(card);
        if ((idx + 1) % 7 === 0) {
          const bIdx = Math.floor((idx + 1) / 7) - 1;
          if (bannerCards[bIdx]) {
            grid.appendChild(bannerCards[bIdx]);
          }
        }
      });
      filterDeals();
    });

    

// Instant Deal Alert Subscribe Form
    const dealAlertForm = document.getElementById('dealAlertSubscribeForm');
    const dealAlertInput = document.getElementById('dealAlertInput');
    const dealAlertSuccess = document.getElementById('dealAlertSuccessMessage');
    const dealAlertBtn = document.getElementById('dealAlertSubmitBtn');

    dealAlertForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (dealAlertInput?.value || '').trim();
      if (!val) return;

      let subscribers = [];
      try {
        subscribers = JSON.parse(localStorage.getItem('promoradar_deal_alerts') || '[]');
      } catch (err) {}
      if (!subscribers.includes(val)) {
        subscribers.push(val);
        localStorage.setItem('promoradar_deal_alerts', JSON.stringify(subscribers));
      }

      if (dealAlertSuccess) dealAlertSuccess.classList.remove('hidden');
      if (dealAlertBtn) {
        dealAlertBtn.disabled = true;
        dealAlertBtn.innerHTML = '<span>Subscribed ✓</span>';
        dealAlertBtn.classList.replace('from-emerald-500', 'from-emerald-700');
      }
      if (dealAlertInput) dealAlertInput.disabled = true;
      showToast('Subscribed to 70%+ price drop alerts! 🔔');
    });

    // Save Deals (Favorites)
    document.querySelectorAll('.deal-save-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-save-id');
        if (!id) return;
        if (savedDeals.includes(id)) {
          savedDeals = savedDeals.filter(x => x !== id);
          showToast('Coupon removed from favorites');
        } else {
          savedDeals.push(id);
          showToast('Coupon added to favorites ♥');
        }
        localStorage.setItem('promoradar_saved_deals', JSON.stringify(savedDeals));
        updateSavedBadge();
        window.dispatchEvent(new CustomEvent('promoradar_saved_updated', { detail: savedDeals }));
      });
    });

    // Listen for saved deals updates from Header drawer
    window.addEventListener('promoradar_saved_updated', (e) => {
      savedDeals = JSON.parse(localStorage.getItem('promoradar_saved_deals') || '[]');
      updateSavedBadge();
    });

    updateSavedBadge();

    // Featured Deal of the day button
    document.getElementById('openFeaturedDealBtn')?.addEventListener('click', () => {
      const featuredCard = document.querySelector('[data-deal-id="deal-8"] [data-reveal-deal]');
      featuredCard?.click();
    });

    // Store Filter Links on Cards ("+X more deals →")
    document.querySelectorAll('.deal-more-store-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const sName = btn.getAttribute('data-filter-store');
        if (!sName) return;
        currentStore = sName;
        document.querySelectorAll('.store-strip-pill').forEach(b => {
          if (b.getAttribute('data-filter-store') === currentStore) {
            b.classList.add('bg-indigo-50', 'border-indigo-500', 'ring-2', 'ring-indigo-500/20');
          } else {
            b.classList.remove('bg-indigo-50', 'border-indigo-500', 'ring-2', 'ring-indigo-500/20');
          }
        });
        filterDeals();
        document.getElementById('mainDealsGrid')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // FAQ Accordion Collapsible Logic
    document.querySelectorAll('.faq-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const content = item?.querySelector('.faq-content');
        const chevron = btn.querySelector('.faq-chevron');
        const isClosed = content?.classList.contains('hidden');

        // Optional: close other open items for accordion behavior
        document.querySelectorAll('.faq-item').forEach(other => {
          if (other !== item) {
            other.querySelector('.faq-content')?.classList.add('hidden');
            const otherChev = other.querySelector('.faq-chevron');
            if (otherChev) otherChev.style.transform = 'rotate(0deg)';
          }
        });

        if (isClosed) {
          content?.classList.remove('hidden');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        } else {
          content?.classList.add('hidden');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
      });
    });

    // Check URL parameters for direct category navigation (e.g. ?cat=Privacy%20%26%20Security)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
      currentCategory = catParam;
      document.querySelectorAll('.main-cat-btn').forEach(b => {
        if (b.getAttribute('data-cat') === currentCategory) {
          b.className = 'main-cat-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-sm dark:bg-indigo-600 dark:text-white dark:border-indigo-500 transition cursor-pointer';
        } else {
          b.className = 'main-cat-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition cursor-pointer';
        }
      });
      filterDeals();
    }

    // Apply stored region on initial page mount (syncs UI & checkmarks without re-dispatching)
    applySelectedRegion(currentRegion, true);
    filterDeals();

    // Micro-animation choreography for Hero Section & Deal of the Day Card
    (function initHeroEntranceAnimation() {
      const heroContainer = document.getElementById('heroLeftContainer');
      const dealCard = document.getElementById('heroDealCard');

      const triggerHeroReveal = () => {
        heroContainer?.classList.add('is-revealed');
        dealCard?.classList.add('is-revealed');
      };

      const preloader = document.getElementById('promoradar-preloader');
      if (preloader && preloader.dataset.hidden !== 'true') {
        window.addEventListener('promoradar_preloader_done', () => {
          // Micro delay buffer to start cascading after radar logo settles
          setTimeout(() => {
            requestAnimationFrame(triggerHeroReveal);
          }, 80);
        }, { once: true });
      } else {
        setTimeout(() => {
          requestAnimationFrame(triggerHeroReveal);
        }, 120);
      }
    })();

    // Animated Deal of the Day Rotation Engine with Multi-GEO & Multi-Locale Support
    (function initHeroDealRotation() {
      const card = document.getElementById('heroDealCard');
      const dynamicContent = document.getElementById('heroDealDynamicContent');
      const timerBar = document.getElementById('heroDealTimerBar');
      const dotsContainer = document.getElementById('heroDealDots');
      const prevBtn = document.getElementById('heroDealPrevBtn');
      const nextBtn = document.getElementById('heroDealNextBtn');
      const playPauseBtn = document.getElementById('heroDealPlayPauseBtn');
      const playIcon = document.getElementById('heroDealPlayIcon');
      const pauseIcon = document.getElementById('heroDealPauseIcon');

      // Flip Clock Digit Elements
      const flipH = document.getElementById('flipHours');
      const flipM = document.getElementById('flipMinutes');
      const flipS = document.getElementById('flipSeconds');

      if (!card || !dynamicContent) return;

      // Full Multi-GEO & Multi-Locale Dataset
      const ALL_HERO_DEALS = [
  // 1. ExpressVPN (GLOBAL, US, EU, UA, GCC)
  {
    id: 'deal_expressvpn_49',
    storeName: 'ExpressVPN',
    storeSlug: 'expressvpn',
    storeCategory: 'Privacy & Security',
    code: 'EXPRESS49',
    maskedCode: '••• S49',
    affiliateUrl: 'https://ziejy.com/g/4raik6r0sq367099d2cc954d043f6e/',
    domain: 'expressvpn.com',
    timerEnds: '14h 22m',
    logoUrl: '/logos/expressvpn.png',
    allowedRegions: ['GLOBAL', 'US', 'EU', 'UA', 'GCC'],
    locales: {
      en: {
        title: '49% Off ExpressVPN Annual Plan Plus Three Free Months',
        description: 'Save 49% with 3 bonus months of verified RAM-only high-speed encryption across 105 countries with Keys password manager and 30-day money-back guarantee.',
        discountBadge: '49% OFF',
        discountSub: '+ 3 Months Free',
        claimButtonText: 'Claim 49% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка 49% на річний план ExpressVPN + 3 місяці у подарунок',
        description: 'Заощаджуйте 49% з 3 бонусними місяцями надшвидкого шифрування у 105 країнах із менеджером паролів Keys та 30-денною гарантією повернення коштів.',
        discountBadge: 'ЗНИЖКА 49%',
        discountSub: '+ 3 Місяці Безкоштовно',
        claimButtonText: 'Отримати ваучер 49%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'خصم 49% على باقة ExpressVPN السنوية + 3 أشهر مجانية',
        description: 'وفر 49% مع 3 أشهر إضافية من التشفير فائق السرعة عبر خوادم RAM في 105 دولة مع مدير كلمات المرور Keys وضمان استرداد الأموال لمدة 30 يوماً.',
        discountBadge: 'خصم 49%',
        discountSub: '+ 3 أشهر مجاناً',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: '49% de Descuento en el Plan Anual de ExpressVPN + 3 Meses Gratis',
        description: 'Ahorra un 49% con 3 meses adicionales de cifrado ultrarrápido en 105 países con gestor de contraseñas Keys y garantía de reembolso de 30 días.',
        discountBadge: '49% DTO',
        discountSub: '+ 3 Meses Gratis',
        claimButtonText: 'Reclamar Cupón 49%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: '49% de Desconto no Plano Anual ExpressVPN + 3 Meses Grátis',
        description: 'Poupe 49% com 3 meses adicionais de encriptação ultrarrápida em 105 países com gestor de palavras-passe Keys e garantia de reembolso de 30 dias.',
        discountBadge: '49% OFF',
        discountSub: '+ 3 Meses Grátis',
        claimButtonText: 'Resgatar Cupom 49%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '49% Rabatt auf ExpressVPN Jahresabo + 3 Gratismonate',
        description: 'Sparen Sie 49% mit 3 Zusatzmonaten blitzschneller RAM-Verschlüsselung in 105 Ländern inklusive Keys-Passwortmanager und 30-Tage-Geld-zurück-Garantie.',
        discountBadge: '49% RABATT',
        discountSub: '+ 3 Gratismonate',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: '49% zniżki na plan roczny ExpressVPN + 3 miesiące gratis',
        description: 'Oszczędź 49% dzięki 3 darmowym miesiącom ultraszybkiego szyfrowania w 105 krajach z menedżerem haseł Keys i 30-dniową gwarancją zwrotu pieniędzy.',
        discountBadge: '-49% RABATU',
        discountSub: '+ 3 Miesiące Gratis',
        claimButtonText: 'Odbierz kupon 49%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Sleva 49 % na roční plán ExpressVPN + 3 měsíce zdarma',
        description: 'Ušetřete 49 % se 3 bonusovými měsíci bleskurychlého šifrování ve 105 zemích se správcem hesel Keys a 30denní zárukou vrácení peněz.',
        discountBadge: 'SLEVA 49 %',
        discountSub: '+ 3 Měsíce Zdarma',
        claimButtonText: 'Získat poukaz 49 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 2. Hostinger (GLOBAL, US, EU, UA, GCC)
  {
    id: 'deal_hostinger_cloud_75',
    storeName: 'Hostinger',
    storeSlug: 'hostinger',
    storeCategory: 'Web Hosting & Domains',
    code: 'HOSTING75',
    maskedCode: '••• G75',
    affiliateUrl: 'https://www.hostinger.com/?utm_source=promoradar&utm_medium=affiliate&utm_campaign=hero_slider',
    domain: 'hostinger.com',
    timerEnds: '08h 45m',
    logoUrl: '/logos/hostinger.png',
    allowedRegions: ['GLOBAL', 'US', 'EU', 'UA', 'GCC'],
    locales: {
      en: {
        title: 'Host 100 Websites: 75% Off Premium Web Hosting',
        description: 'Deploy on ultra-fast NVMe LiteSpeed servers with 100 website slots, complimentary domain name, unmetered bandwidth, and automated daily backups.',
        discountBadge: '75% OFF',
        discountSub: '+ Free Domain Included',
        claimButtonText: 'Claim 75% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Хостинг для 100 сайтів: знижка 75% на преміум веб-хостинг',
        description: 'Розгортайте сайти на надшвидких серверах NVMe LiteSpeed на 100 сайтів із безкоштовним доменом, необмеженим трафіком і щоденними бекапами.',
        discountBadge: 'ЗНИЖКА 75%',
        discountSub: '+ Безкоштовний Домен',
        claimButtonText: 'Отримати ваучер 75%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'استضافة 100 موقع: خصم 75% على الاستضافة المميزة',
        description: 'انشر مواقعك على خوادم NVMe LiteSpeed الفائقة مع 100 موقع، نطاق مجاني، حركة مرور غير محدودة، ونسخ احتياطي يومي تلقائي.',
        discountBadge: 'خصم 75%',
        discountSub: '+ نطاق مجاني مشمول',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'Aloja 100 Sitios Web: 75% de Descuento en Hosting Premium',
        description: 'Implementa en servidores NVMe LiteSpeed ultrarrápidos para 100 webs con dominio gratuito, ancho de banda ilimitado y copias de seguridad diarias.',
        discountBadge: '75% DTO',
        discountSub: '+ Dominio Gratis Incluido',
        claimButtonText: 'Reclamar Cupón 75%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Hospede 100 Sites: 75% de Desconto em Alojamento Premium',
        description: 'Implemente em servidores NVMe LiteSpeed ultrarrápidos com 100 sites, domínio grátis, tráfego ilimitado e backups diários automáticos.',
        discountBadge: '75% OFF',
        discountSub: '+ Domínio Grátis Incluído',
        claimButtonText: 'Resgatar Cupom 75%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '100 Websites hosten: 75% Rabatt auf Premium-Webhosting',
        description: 'Starten Sie auf extrem schnellen NVMe LiteSpeed-Servern für 100 Websites inklusive Gratis-Domain, unbegrenztem Traffic und täglichen Backups.',
        discountBadge: '75% RABATT',
        discountSub: '+ Inklusive Gratis-Domain',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Hostuj 100 stron: 75% zniżki na hosting premium',
        description: 'Wdrażaj na ultraszybkich serwerach NVMe LiteSpeed z obsługą 100 witryn, darmową domeną, nielimitowanym transferem i codziennymi kopiami zapasowymi.',
        discountBadge: '-75% RABATU',
        discountSub: '+ Darmowa Domena w Zestawie',
        claimButtonText: 'Odbierz kupon 75%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Hostujte 100 webů: 75% sleva na prémiový webhosting',
        description: 'Provozujte projekty na bleskových serverech NVMe LiteSpeed pro 100 webů s bezplatnou doménou, neomezeným přenosem a denními zálohami.',
        discountBadge: 'SLEVA 75 %',
        discountSub: '+ Doména Zdarma v Ceně',
        claimButtonText: 'Získat poukaz 75 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 3. VogaCloset (GCC)
  {
    id: 'net_814385',
    storeName: 'VogaCloset',
    storeSlug: 'vogacloset',
    storeCategory: 'Fashion & Apparel',
    code: 'SALE',
    maskedCode: '••• SALE',
    affiliateUrl: 'https://bywiola.com/g/6silcjvoa9fa9e3fd878b52609ec28/?i=3',
    domain: 'vogacloset.com',
    timerEnds: '18h 30m',
    logoUrl: '/logos/vogacloset.png',
    allowedRegions: ['GCC'],
    locales: {
      en: {
        title: 'VogaCloset: Up to 80% Off European Runway Styles',
        description: 'Explore curated British and European fashion, footwear, and beauty essentials with fast Middle East express shipping and instant checkout discounts.',
        discountBadge: '80% OFF',
        discountSub: 'Runway Styles & Footwear',
        claimButtonText: 'Claim 80% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ar: {
        title: 'فوغا كلوسيت: خصم حتى 80% على أرقى الأزياء الأوروبية',
        description: 'تسوق أحدث خطوط الموضة البريطانية والأوروبية والأحذية ومستحضرات التجميل مع شحن سريع لدول الخليج وخصم فوري عند الدفع.',
        discountBadge: 'خصم 80%',
        discountSub: 'أزياء أوروبية وأحذية راقية',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      ua: {
        title: 'VogaCloset: знижка до 80% на європейські брендові колекції',
        description: 'Європейський одяг, взуття та аксесуари з преміальних бутиків зі швидкою доставкою та миттєвими знижками за промокодом.',
        discountBadge: 'ДО 80% OFF',
        discountSub: 'Європейська Мода',
        claimButtonText: 'Отримати ваучер 80%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      es: {
        title: 'VogaCloset: Hasta 80% de Descuento en Moda Europea',
        description: 'Descubre moda británica y europea de pasarela, calzado y belleza con envío exprés y descuentos instantáneos en caja.',
        discountBadge: '80% DTO',
        discountSub: 'Estilos de Pasarela',
        claimButtonText: 'Reclamar Cupón 80%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'VogaCloset: Até 80% de Desconto em Moda Europeia',
        description: 'Descubra moda britânica e europeia, calçado e beleza com envio expresso e descontos imediatos no checkout.',
        discountBadge: '80% OFF',
        discountSub: 'Estilos de Passarela',
        claimButtonText: 'Resgatar Cupom 80%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: 'VogaCloset: Bis zu 80% Rabatt auf europäische Modetrends',
        description: 'Entdecken Sie britische und europäische Premium-Kollektionen, Schuhe und Kosmetik mit Expresslieferung und Sofortrabatt.',
        discountBadge: '80% RABATT',
        discountSub: 'Laufsteg-Trends & Schuhe',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'VogaCloset: Do 80% zniżki na europejską modę',
        description: 'Odkryj brytyjską i europejską modę z wybiegów, obuwie i kosmetyki z szybką dostawą i natychmiastowym rabatem.',
        discountBadge: '-80% RABATU',
        discountSub: 'Moda z Wybiegów',
        claimButtonText: 'Odbierz kupon 80%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'VogaCloset: Až 80% sleva na evropskou módu',
        description: 'Prozkoumejte britskou a evropskou módu, obuv a kosmetiku s expresním doručením a okamžitou slevou u pokladny.',
        discountBadge: 'AŽ 80 % SLEVA',
        discountSub: 'Móda z Přehlídkových Mol',
        claimButtonText: 'Získat poukaz 80 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 4. RaynaTours (GCC)
  {
    id: 'net_776832',
    storeName: 'RaynaTours',
    storeSlug: 'raynatours',
    storeCategory: 'Travel & Tours',
    code: 'TKFL9',
    maskedCode: '••• FL9',
    affiliateUrl: 'https://codeaven.com/g/bsyhi8m623367099d2cc62651c44e1/?i=31',
    domain: 'raynatours.com',
    timerEnds: '12h 45m',
    logoUrl: '/logos/raynatours.png',
    allowedRegions: ['GCC'],
    locales: {
      en: {
        title: 'Save 15% on UAE Desert Safaris, Burj Khalifa & Attractions',
        description: 'Book Dubai and Abu Dhabi VIP desert safaris, dhow dinner cruises, and top city attraction passes with verified instant confirmation tickets.',
        discountBadge: '15% OFF',
        discountSub: 'Tours & Desert Safaris',
        claimButtonText: 'Claim 15% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ar: {
        title: 'وفر 15% على رحلات سفاري دبي وتذاكر برج خليفة والفعاليات',
        description: 'احجز أفضل رحلات السفاري الصحراوية الفاخرة، الرحلات البحرية، وتذاكر أشهر المعالم السياحية في الإمارات مع تأكيد فوري وموثوق.',
        discountBadge: 'خصم 15%',
        discountSub: 'رحلات سياحية وسفاري دبي',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      ua: {
        title: 'Знижка 15% на сафарі в пустелі ОАЕ та квитки на Burj Khalifa',
        description: 'Бронюйте преміальні пустельні сафарі в Дубаї, морські круїзи та вхідні квитки до найкращих атракціонів за вигідною ціною.',
        discountBadge: 'ЗНИЖКА 15%',
        discountSub: 'Тури та Сафарі в ОАЕ',
        claimButtonText: 'Отримати ваучер 15%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      es: {
        title: 'Ahorra 15% en Safaris por el Desierto y Atracciones de Dubái',
        description: 'Reserva safaris VIP por el desierto en Dubái y Abu Dabi, cruceros con cena y entradas para las principales atracciones turísticas.',
        discountBadge: '15% DTO',
        discountSub: 'Tours y Safaris en Dubái',
        claimButtonText: 'Reclamar Cupón 15%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Poupe 15% em Safáris no Deserto e Atrações no Dubai',
        description: 'Reserve safáris VIP no deserto no Dubai e Abu Dhabi, cruzeiros com jantar e bilhetes para as principais atrações com confirmação imediata.',
        discountBadge: '15% OFF',
        discountSub: 'Passeios e Safáris no Dubai',
        claimButtonText: 'Resgatar Cupom 15%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '15% Rabatt auf Wüstensafaris und Dubai-Attraktionen',
        description: 'Buchen Sie exklusive Wüstensafaris in Dubai und Abu Dhabi, Dhau-Dinner-Kreuzfahrten und Tickets für Top-Sehenswürdigkeiten zum Bestpreis.',
        discountBadge: '15% RABATT',
        discountSub: 'Touren & Wüstensafaris',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Zaoszczędź 15% na safari na pustyni i atrakcjach w Dubaju',
        description: 'Rezerwuj ekskluzywne pustynne safari w Dubaju i Abu Zabi, rejsy z kolacją i bilety do czołowych atrakcji ze sprawdzonym rabatem.',
        discountBadge: '-15% RABATU',
        discountSub: 'Wycieczki i Safari',
        claimButtonText: 'Odbierz kupon 15%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Ušetřete 15 % na pouštních safari a atrakcích v Dubaji',
        description: 'Rezervujte si prémiová safari v Dubaji a Abú Dhabí, vyhlídkové plavby a vstupenky na nejlepší atrakce s ověřenou slevou.',
        discountBadge: 'SLEVA 15 %',
        discountSub: 'Výlety a Pouštní Safari',
        claimButtonText: 'Získat poukaz 15 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 5. Touch UA (UA)
  {
    id: 'deal_touch_smartphones_sale',
    storeName: 'Touch UA',
    storeSlug: 'touch',
    storeCategory: 'Electronics & Gadgets',
    code: 'TOUCHGADGET',
    maskedCode: '••• DGET',
    affiliateUrl: 'https://wbbsv.com/g/ynys1f2mjp367099d2cc0e81904d8b/',
    domain: 'touch.com.ua',
    timerEnds: '15h 20m',
    logoUrl: '/logos/touch.png',
    allowedRegions: ['UA'],
    locales: {
      en: {
        title: 'Save up to 30% on Apple, Samsung & Smart Electronics at Touch',
        description: 'Get verified discounts on smartphones, laptops, headphones, and home smart devices with official warranty and rapid Ukraine shipping.',
        discountBadge: '30% OFF',
        discountSub: 'Smartphones & Gadgets',
        claimButtonText: 'Claim 30% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка до 30% на смартфони Apple, Samsung та гаджети в Touch',
        description: 'Офіційна техніка, ноутбуки, навушники та смарт-пристрої з гарантією виробника та швидкою доставкою по Україні зі знижкою до 30%.',
        discountBadge: 'ДО 30% OFF',
        discountSub: 'Смартфони та Гаджети',
        claimButtonText: 'Отримати ваучер 30%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'خصم حتى 30% على هواتف Apple وSamsung والإلكترونيات الذكية',
        description: 'احصل على خصومات حقيقية على الهواتف الذكية وأجهزة الكمبيوتر المحمولة والأجهزة الذكية مع ضمان رسمي.',
        discountBadge: 'خصم 30%',
        discountSub: 'هواتف ذكية وأجهزة',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'Hasta 30% de Descuento en Smartphones y Electrónica en Touch',
        description: 'Consigue descuentos verificados en smartphones Apple, Samsung, portátiles y accesorios tecnológicos con garantía oficial.',
        discountBadge: '30% DTO',
        discountSub: 'Smartphones y Gadgets',
        claimButtonText: 'Reclamar Cupón 30%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Até 30% de Desconto em Smartphones e Eletrônicos na Touch',
        description: 'Descontos confirmados em smartphones Apple, Samsung, portáteis e gadgets inteligentes com garantia de fabricante.',
        discountBadge: '30% OFF',
        discountSub: 'Smartphones e Gadgets',
        claimButtonText: 'Resgatar Cupom 30%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: 'Bis zu 30% Rabatt auf Smartphones & Smart-Elektronik bei Touch',
        description: 'Geprüfte Rabatte auf Apple, Samsung Smartphones, Notebooks und smarte Gadgets mit offizieller Garantie.',
        discountBadge: '30% RABATT',
        discountSub: 'Smartphones & Gadgets',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Do 30% zniżki na smartfony i elektronikę w sklepie Touch',
        description: 'Sprawdzone zniżki na smartfony Apple, Samsung, laptopy i inteligentne gadżety z oficjalną gwarancją producenta.',
        discountBadge: '-30% RABATU',
        discountSub: 'Smartfony i Gadżety',
        claimButtonText: 'Odbierz kupon 30%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Až 30% sleva na chytré telefony a elektroniku v Touch',
        description: 'Ověřené slevy na telefony Apple, Samsung, notebooky a chytrá zařízení s oficiální zárukou.',
        discountBadge: 'AŽ 30 % SLEVA',
        discountSub: 'Chytré Telefony a Gadgety',
        claimButtonText: 'Získat poukaz 30 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 6. Polis UA (UA)
  {
    id: 'deal_polis_greencard_sale',
    storeName: 'Polis UA',
    storeSlug: 'polis',
    storeCategory: 'Insurance & Finance',
    code: 'POLISGREEN',
    maskedCode: '••• REEN',
    affiliateUrl: 'https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/?i=3',
    domain: 'polis.ua',
    timerEnds: '10h 15m',
    logoUrl: '/logos/polis.png',
    allowedRegions: ['UA'],
    locales: {
      en: {
        title: 'Get 15% Off Green Card & Online Vehicle Insurance at Polis.ua',
        description: 'Compare top-tier insurance policies in seconds. Secure authentic digital Green Card and compulsory motor vehicle liability with instant email dispatch.',
        discountBadge: '15% OFF',
        discountSub: 'Green Card & Vehicle Insurance',
        claimButtonText: 'Claim 15% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка 15% на Зелену Картку та автоцивілку на Polis.ua',
        description: 'Миттєве онлайн-оформлення Зеленої Картки та ОСЦПВ від надійних страхових компаній з офіційною реєстрацією в базі МТСБУ та знижкою 15%.',
        discountBadge: 'ЗНИЖКА 15%',
        discountSub: 'Зелена Картка та Автоцивілка',
        claimButtonText: 'Отримати ваучер 15%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'وفر 15% على تأمين المركبات والبطاقة الخضراء عبر Polis.ua',
        description: 'قارن بين عروض كبرى شركات التأمين واحصل على وثيقتك الرقمية الرسمية خلال دقائق مع خصم فوري.',
        discountBadge: 'خصم 15%',
        discountSub: 'تأمين المركبات الإلكتروني',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: '15% de Descuento en Carta Verde y Seguro de Coche en Polis.ua',
        description: 'Contrata tu seguro obligatorio de vehículos o Carta Verde digital en minutos con las mejores aseguradoras y confirmación instantánea.',
        discountBadge: '15% DTO',
        discountSub: 'Seguro de Coche y Carta Verde',
        claimButtonText: 'Reclamar Cupón 15%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: '15% de Desconto em Seguro Automóvel e Carta Verde na Polis.ua',
        description: 'Contrate seguro obrigatório de veículos ou Carta Verde digital em minutos com as melhores seguradoras e emissão imediata.',
        discountBadge: '15% OFF',
        discountSub: 'Seguro Automóvel Digital',
        claimButtonText: 'Resgatar Cupom 15%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '15% Rabatt auf Grüne Karte & Kfz-Versicherung bei Polis.ua',
        description: 'Sofortiger Online-Abschluss von Kfz-Haftpflicht und Grüner Versicherungskarte mit digitaler Zustellung binnen weniger Minuten.',
        discountBadge: '15% RABATT',
        discountSub: 'Grüne Karte & Kfz-Schutz',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Zyskaj 15% zniżki na Zieloną Kartę i ubezpieczenie OC na Polis.ua',
        description: 'Błyskawiczne ubezpieczenie pojazdu online i Zielona Karta z natychmiastową wysyłką na e-mail i gwarancją legalności.',
        discountBadge: '-15% RABATU',
        discountSub: 'Zielona Karta i OC',
        claimButtonText: 'Odbierz kupon 15%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Získejte 15% slevu na Zelenou kartu a pojištění vozidel na Polis.ua',
        description: 'Bleskové online sjednání povinného ručení a Zelené karty s okamžitým doručením na e-mail a ověřenou slevou.',
        discountBadge: 'SLEVA 15 %',
        discountSub: 'Zelená Karta a Pojištění',
        claimButtonText: 'Získat poukaz 15 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 7. Abelssoft (GLOBAL, US, EU)
  {
    id: 'cj-abelssoft-50off',
    storeName: 'Abelssoft',
    storeSlug: 'abelssoft',
    storeCategory: 'Privacy & Security',
    code: 'ABELSSOFT50',
    maskedCode: '••• T50',
    affiliateUrl: 'https://www.anrdoezrs.net/click-101907236-15402815-1684513856000',
    domain: 'abelssoft.de',
    timerEnds: '19h 10m',
    logoUrl: '/logos/abelssoft.png',
    allowedRegions: ['GLOBAL', 'US', 'EU'],
    locales: {
      en: {
        title: '50% Off Abelssoft Windows Tuning & System Security Software',
        description: 'Optimize and shield your PC with award-winning registry cleaners, privacy guards, and real-time disk acceleration utilities with lifetime upgrades.',
        discountBadge: '50% OFF',
        discountSub: 'Lifetime License Deal',
        claimButtonText: 'Claim 50% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка 50% на софт для оптимізації та безпеки Windows від Abelssoft',
        description: 'Прискорюйте та захищайте свій ПК за допомогою визнаних утиліт очищення реєстру, захисту приватності та оптимізації дисків із довічною ліцензією.',
        discountBadge: 'ЗНИЖКА 50%',
        discountSub: 'Довічна Ліцензія',
        claimButtonText: 'Отримати ваучер 50%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'خصم 50% على برامج تسريع وحماية نظام ويندوز من Abelssoft',
        description: 'قم بتحسين وأمان جهاز الكمبيوتر الخاص بك باستخدام أفضل برامج تنظيف السجل وحماية الخصوصية مع ترخيص مدى الحياة.',
        discountBadge: 'خصم 50%',
        discountSub: 'ترخيص مدى الحياة',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: '50% de Descuento en Seguridad y Optimización de Windows Abelssoft',
        description: 'Optimiza y protege tu PC con limpiadores de registro galardonados, protectores de privacidad y aceleración de disco de por vida.',
        discountBadge: '50% DTO',
        discountSub: 'Licencia de por Vida',
        claimButtonText: 'Reclamar Cupón 50%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: '50% de Desconto em Software de Otimização e Segurança Abelssoft',
        description: 'Otimize e proteja o seu computador com ferramentas premiadas de limpeza de registo, privacidade e aceleração com licença vitalícia.',
        discountBadge: '50% OFF',
        discountSub: 'Licença Vitalícia',
        claimButtonText: 'Resgatar Cupom 50%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '50% Rabatt auf Abelssoft Windows-Tuning & System-Sicherheit',
        description: 'Optimieren und schützen Sie Ihren PC mit prämierten Registry-Cleanern, Datenschutz-Tools und Festplatten-Beschleunigern mit lebenslangen Upgrades.',
        discountBadge: '50% RABATT',
        discountSub: 'Lebenslange Lizenz',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: '50% zniżki na oprogramowanie do optymalizacji Windows Abelssoft',
        description: 'Optymalizuj i zabezpieczaj swój komputer nagradzanymi narzędziami do czyszczenia rejestru i ochrony prywatności z dożywotnią licencją.',
        discountBadge: '-50% RABATU',
        discountSub: 'Licencja Dożywotnia',
        claimButtonText: 'Odbierz kupon 50%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: '50% sleva na software pro optimalizaci a zabezpečení Windows Abelssoft',
        description: 'Optimalizujte a chraňte svůj počítač oceněnými nástroji pro čištění registru a ochranu soukromí s doživotní licencí.',
        discountBadge: 'SLEVA 50 %',
        discountSub: 'Doživotní Licence',
        claimButtonText: 'Získat poukaz 50 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 8. Airalo eSIM (GLOBAL, US, EU, GCC, UA)
  {
    id: 'net_849211',
    storeName: 'Airalo eSIM',
    storeSlug: 'airalo',
    storeCategory: 'Travel & Tours',
    code: 'ADM',
    maskedCode: '••• ADM',
    affiliateUrl: 'https://dhwnh.com/g/7rvld26bcl367099d2cc0471e42028/?i=3',
    domain: 'airalo.com',
    timerEnds: '11h 30m',
    logoUrl: '/logos/airalo.png',
    allowedRegions: ['GLOBAL', 'US', 'EU', 'GCC', 'UA'],
    locales: {
      en: {
        title: 'Save 10% on Airalo Global Travel eSIM Data Packages',
        description: 'Skip roaming fees and connect in 200+ countries instantly upon landing. Verified checkout coupon works on local and regional eSIM data passes.',
        discountBadge: '10% OFF',
        discountSub: 'Global Travel eSIM Data',
        claimButtonText: 'Claim 10% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка 10% на глобальні тревел-пакети eSIM від Airalo',
        description: 'Забудьте про дорогий роумінг та підключайтеся до інтернету у 200+ країнах світу одразу після приземлення з перевіреним ваучером.',
        discountBadge: 'ЗНИЖКА 10%',
        discountSub: 'Мобільний Інтернет за Кордоном',
        claimButtonText: 'Отримати ваучер 10%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'وفر 10% على باقات بيانات السفر الدولية عبر شريحة Airalo eSIM',
        description: 'تخلص من رسوم التجوال الباهظة واتصل بالإنترنت في أكثر من 200 دولة فور وصولك مع قسيمة خصم مؤكدة.',
        discountBadge: 'خصم 10%',
        discountSub: 'بيانات السفر العالمية eSIM',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'Ahorra 10% en Paquetes de Datos eSIM para Viajes de Airalo',
        description: 'Evita los sobrecostes de roaming y conéctate en más de 200 países al instante nada más aterrizar con cupón verificado.',
        discountBadge: '10% DTO',
        discountSub: 'Datos de Viaje eSIM Global',
        claimButtonText: 'Reclamar Cupón 10%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Poupe 10% em Pacotes de Dados eSIM de Viagem da Airalo',
        description: 'Evite taxas de roaming caras e ligue-se à internet em mais de 200 países ao aterrar com cupom confirmado.',
        discountBadge: '10% OFF',
        discountSub: 'Dados de Viagem eSIM Global',
        claimButtonText: 'Resgatar Cupom 10%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '10% Rabatt auf weltweite Reise-eSIM Datenpakete von Airalo',
        description: 'Sparen Sie teure Roaminggebühren und surfen Sie in über 200 Ländern direkt nach der Landung mit offiziellem Gutscheincode.',
        discountBadge: '10% RABATT',
        discountSub: 'Weltweite Reise-eSIM',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Zaoszczędź 10% na pakietach internetu eSIM Airalo w podróży',
        description: 'Zapomnij o drogim roamingu i łącz się z internetem w ponad 200 krajach zaraz po wylądowaniu z kodem rabatowym.',
        discountBadge: '-10% RABATU',
        discountSub: 'Pakiety Danych eSIM na Świecie',
        claimButtonText: 'Odbierz kupon 10%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Ušetřete 10 % na balíčcích dat pro cestování eSIM od Airalo',
        description: 'Vyhněte se poplatkům za roaming a připojte se k síti ve více než 200 zemích hned po přistání s ověřeným poukazem.',
        discountBadge: 'SLEVA 10 %',
        discountSub: 'Globální Cestovní Data eSIM',
        claimButtonText: 'Získat poukaz 10 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 9. Zonky (CZ, EU)
  {
    id: 'deal_zonky-cz_verified_baseline',
    storeName: 'Zonky CZ',
    storeSlug: 'zonky-cz',
    storeCategory: 'Insurance & Finance',
    code: 'ZONKYPROMO',
    maskedCode: '••• PROMO',
    affiliateUrl: 'https://ytyaz.com/g/kw5iel2aqjfa9e3fd8787b4a20a6f1/',
    domain: 'zonky.cz',
    timerEnds: '16h 40m',
    logoUrl: '/logos/zonky-cz.png',
    allowedRegions: ['CZ', 'EU'],
    locales: {
      en: {
        title: 'Zonky CZ: Fair Peer-to-Peer Loans & Financial Services',
        description: 'Secure flexible financial solutions with transparent online terms, low fixed interest rates, and no hidden fees across the Czech Republic.',
        discountBadge: 'FAIR RATES',
        discountSub: 'Verified Financial Services',
        claimButtonText: 'Claim Special Offer',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      cs: {
        title: 'Zonky: Výhodná půjčka od lidí s nízkým úrokem bez poplatků',
        description: 'Půjčte si férově s nízkým úrokem, rychlým schválením online a nulovými skrytými poplatky u ověřené české fintech jedničky.',
        discountBadge: 'FÉROVÝ ÚROK',
        discountSub: 'Půjčka Od Lidí Bez Poplatků',
        claimButtonText: 'Získat výhodnou nabídku',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      },
      ua: {
        title: 'Zonky CZ: вигідні споживчі кредити та рефінансування в Чехії',
        description: 'Оформлюйте онлайн-позики з прозорими умовами, низькими відсотками та відсутністю прихованих платежів.',
        discountBadge: 'ЧЕСНИЙ ТАРИФ',
        discountSub: 'Кредитування Без Комісій',
        claimButtonText: 'Отримати спецпропозицію',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'Zonky CZ: خدمات تمويل وقروض شفافة وبأسعار فائدة منخفضة',
        description: 'حلول مالية مرنة بشروط واضحة ومعدلات فائدة ثابتة ودون أي رسوم خفية.',
        discountBadge: 'سعر مالي عادل',
        discountSub: 'تمويل موثوق ومعتمد',
        claimButtonText: 'احصل على العرض',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'Zonky CZ: Préstamos Transparentes y Servicios Financieros',
        description: 'Soluciones financieras ágiles con términos online transparentes, tipos de interés fijos y sin comisiones ocultas.',
        discountBadge: 'TIPO JUSTO',
        discountSub: 'Servicios Financieros Verificados',
        claimButtonText: 'Reclamar Oferta Especial',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Zonky CZ: Empréstimos Transparentes e Financiamento Justo',
        description: 'Soluções financeiras flexíveis com termos online claros, juros baixos e sem taxas ocultas.',
        discountBadge: 'TAXA JUSTA',
        discountSub: 'Financiamento Confirmado',
        claimButtonText: 'Resgatar Oferta Especial',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: 'Zonky CZ: Faire Kredite & Finanzdienstleistungen online',
        description: 'Transparente Online-Finanzierungslösungen mit festen Zinsen und ohne versteckte Gebühren in der Tschechischen Republik.',
        discountBadge: 'FAIRE ZINSEN',
        discountSub: 'Geprüfte Finanzangebote',
        claimButtonText: 'Angebot sichern',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Zonky CZ: Uczciwe pożyczki społecznościowe i usługi finansowe',
        description: 'Elastyczne finansowanie z przejrzystymi warunkami online, niskim stałym oprocentowaniem i bez ukrytych opłat.',
        discountBadge: 'NISKI PROCENT',
        discountSub: 'Zweryfikowane Pożyczki Online',
        claimButtonText: 'Odbierz ofertę specjalną',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      }
    }
  },

  // 10. MEGOGO PL (PL, EU)
  {
    id: 'net_817037',
    storeName: 'MEGOGO PL',
    storeSlug: 'megogo-pl',
    storeCategory: 'Gaming, Media & Software',
    code: 'MEGOGOPL',
    maskedCode: '••• GOPL',
    affiliateUrl: 'https://ficca2021.com/g/5xiedghtdqfa9e3fd878893991dc96/?i=3',
    domain: 'megogo.net',
    timerEnds: '13h 25m',
    logoUrl: '/logos/megogo-pl.png',
    allowedRegions: ['PL', 'EU'],
    locales: {
      en: {
        title: 'MEGOGO Poland: Premium Live TV Channels & Cinema Streaming',
        description: 'Stream hundreds of top European TV channels, live football events, and thousands of movies in 4K HDR quality on all connected devices.',
        discountBadge: 'SPECIAL DEAL',
        discountSub: 'TV Channels & Movies in 4K',
        claimButtonText: 'Claim TV Package',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      pl: {
        title: 'MEGOGO Polska: Telewizja na żywo, mecze i kinowe hity w 4K',
        description: 'Oglądaj ponad 100 polskich i europejskich kanałów TV, transmisje sportowe na żywo oraz tysiące filmów i seriali w najwyższej jakości 4K.',
        discountBadge: 'PAKIET PROMO',
        discountSub: 'Telewizja na Żywo i Filmy 4K',
        claimButtonText: 'Odbierz pakiet TV',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      ua: {
        title: 'MEGOGO Польща: ТБ онлайн, спортивні трансляції та прем’єри кіно',
        description: 'Дивіться рейтингові польські та європейські телеканали, футбольні матчі та величезну бібліотеку фільмів у якості 4K.',
        discountBadge: 'СПЕЦТАРИФ',
        discountSub: 'Онлайн ТБ та Фільми в 4K',
        claimButtonText: 'Підключити пакет ТБ',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'MEGOGO بولندا: قنوات بث تلفزيوني مباشر وسينما بدقة 4K',
        description: 'شاهد مئات القنوات التلفزيونية الأوروبية والفعاليات الرياضية المباشرة وآلاف الأفلام بجودة 4K فائقة الوضوح.',
        discountBadge: 'عرض خاص',
        discountSub: 'قنوات تلفزيونية وأفلام 4K',
        claimButtonText: 'احصل على الباقة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'MEGOGO Polonia: Canales de TV en Directo y Cine en 4K',
        description: 'Disfruta de cientos de canales de TV europeos, eventos de fútbol en vivo y miles de películas en calidad 4K en tus dispositivos.',
        discountBadge: 'OFERTA PACK',
        discountSub: 'Canales de TV y Cine 4K',
        claimButtonText: 'Reclamar Pack TV',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'MEGOGO Polónia: Canais de TV em Direto e Cinema em 4K',
        description: 'Assista a centenas de canais europeus, futebol em direto e milhares de filmes em qualidade 4K em todos os seus ecrãs.',
        discountBadge: 'OFERTA TV',
        discountSub: 'Canais de TV e Filmes 4K',
        claimButtonText: 'Resgatar Pacote TV',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: 'MEGOGO Polen: Live-TV-Sender, Sport & Kinofilme in 4K',
        description: 'Streamen Sie hunderte TV-Sender, Live-Fußball und tausende Blockbuster in bester 4K HDR Qualität auf all Ihren Geräten.',
        discountBadge: 'TV-ANGEBOT',
        discountSub: 'Live-TV & 4K-Streaming',
        claimButtonText: 'TV-Paket sichern',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      cs: {
        title: 'MEGOGO Polsko: Živé televizní kanály a filmy ve 4K',
        description: 'Sledujte stovky evropských televizních kanálů, živé sportovní přenosy a tisíce filmů ve špičkové kvalitě 4K.',
        discountBadge: 'SPECIÁLNÍ BALÍČEK',
        discountSub: 'Živé TV a Filmy ve 4K',
        claimButtonText: 'Získat balíček TV',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  }
];

      // Current active state from localStorage or defaults
      let currentRegion = (localStorage.getItem('promoradar_selected_region') || 'GLOBAL').toUpperCase().trim();
      let currentLang = (localStorage.getItem('promoradar_lang') || 'en').toLowerCase().trim();

      function filterDealsByRegion(region) {
        const norm = (region || 'GLOBAL').toUpperCase().trim();
        if (norm === 'ALL') return ALL_HERO_DEALS;
        const filtered = ALL_HERO_DEALS.filter(deal => 
          deal.allowedRegions.includes(norm) || (norm !== 'GCC' && norm !== 'UA' && norm !== 'CZ' && norm !== 'PL' && deal.allowedRegions.includes('GLOBAL'))
        );
        return filtered.length > 0 ? filtered : ALL_HERO_DEALS.filter(d => d.allowedRegions.includes('GLOBAL'));
      }

      let rotatingDeals = filterDealsByRegion(currentRegion);
      let currentIndex = 0;
      let isTransitioning = false;
      let isUserPaused = false;
      let isHoverPaused = false;
      let progressInterval = null;
      const ROTATION_INTERVAL_MS = 6000;
      const stepMs = 50;
      const totalSteps = ROTATION_INTERVAL_MS / stepMs;
      let stepCount = 0;

      // Render pagination dots based on active pool size
      function renderDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        rotatingDeals.forEach((_, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.setAttribute('data-hero-deal-index', String(idx));
          btn.className = idx === currentIndex
            ? 'hero-deal-dot h-2 rounded-full transition-all duration-300 cursor-pointer bg-indigo-600 dark:bg-indigo-500 w-6'
            : 'hero-deal-dot h-2 rounded-full transition-all duration-300 cursor-pointer bg-slate-300 dark:bg-white/25 w-2 hover:bg-slate-400';
          btn.setAttribute('aria-label', 'Switch to Deal ' + (idx + 1));
          btn.addEventListener('click', () => {
            if (idx !== currentIndex) {
              const dir = idx > currentIndex ? 'next' : 'prev';
              currentIndex = idx;
              renderDeal(currentIndex, dir);
              resetProgressBar();
              if (!isUserPaused) startRotationLoop();
            }
          });
          dotsContainer.appendChild(btn);
        });
      }

      function updateDotsVisual() {
        const dots = dotsContainer?.querySelectorAll('.hero-deal-dot');
        if (!dots) return;
        dots.forEach((dot, dIdx) => {
          if (dIdx === currentIndex) {
            dot.className = 'hero-deal-dot w-6 h-2 rounded-full transition-all duration-300 cursor-pointer bg-indigo-600 dark:bg-indigo-500';
          } else {
            dot.className = 'hero-deal-dot w-2 h-2 rounded-full transition-all duration-300 cursor-pointer bg-slate-300 dark:bg-white/25 hover:bg-slate-400';
          }
        });
      }

      // Realtime Vintage Split-Flap Flip Clock Countdown
      function parseSecondsFromStr(str) {
        const hMatch = (str || '').match(/(\d+)h/);
        const mMatch = (str || '').match(/(\d+)m/);
        const h = hMatch ? parseInt(hMatch[1], 10) : 12;
        const m = mMatch ? parseInt(mMatch[1], 10) : 0;
        return h * 3600 + m * 60 + 45;
      }

      let currentRemainingSec = parseSecondsFromStr(rotatingDeals[0]?.timerEnds || '14h 22m');

      function triggerFlipAnim(el, newText) {
        if (!el || el.textContent === newText) return;
        el.textContent = newText;
        el.classList.remove('is-flipping');
        void el.offsetWidth;
        el.classList.add('is-flipping');
      }

      function updateClockDisplay() {
        if (currentRemainingSec < 0) currentRemainingSec = 0;
        const hrs = String(Math.floor(currentRemainingSec / 3600)).padStart(2, '0');
        const mins = String(Math.floor((currentRemainingSec % 3600) / 60)).padStart(2, '0');
        const secs = String(currentRemainingSec % 60).padStart(2, '0');

        triggerFlipAnim(flipH, hrs);
        triggerFlipAnim(flipM, mins);
        triggerFlipAnim(flipS, secs);
      }

      updateClockDisplay();

      setInterval(() => {
        if (currentRemainingSec > 0) {
          currentRemainingSec--;
          updateClockDisplay();
        }
      }, 1000);

      // 60FPS RAF-driven progress bar and kinetic spring crossfade engine
      let animStartTime = null;
      let animProgress = 0;
      let rafLoopId = null;

      // Render Active Deal with Dynamic Locale Strings & Kinetic Spring Transition
      function renderDeal(index, direction = 'next') {
        if (isTransitioning) return;
        isTransitioning = true;
        const deal = rotatingDeals[index] || rotatingDeals[0];
        if (!deal) {
          isTransitioning = false;
          return;
        }

        const localeData = deal.locales[currentLang] || deal.locales['en'] || Object.values(deal.locales)[0];

        currentRemainingSec = parseSecondsFromStr(deal.timerEnds);
        updateClockDisplay();

        // 1. Ultra-smooth silky exit: ease-in with subtle micro-scale and soft motion
        dynamicContent.style.transition = 'opacity 0.22s cubic-bezier(0.4, 0, 1, 1), transform 0.22s cubic-bezier(0.4, 0, 1, 1)';
        dynamicContent.style.opacity = '0';
        dynamicContent.style.transform = direction === 'next' 
          ? 'translate3d(0, -12px, 0) scale(0.985)' 
          : 'translate3d(0, 12px, 0) scale(0.985)';

        setTimeout(() => {
          try {
            // 2. Mutate DOM content
            const logoBox = document.getElementById('heroDealLogoBox');
            if (logoBox) {
              logoBox.innerHTML = '<img src="' + deal.logoUrl + '" alt="' + deal.storeName + '" class="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 brand-logo-dresscode" onerror="this.onerror=null; this.src=\'/logos/' + deal.storeSlug + '.png\';" />';
            }

            const storeNameEl = document.getElementById('heroDealStoreName');
            if (storeNameEl) storeNameEl.textContent = deal.storeName;

            const storeCatEl = document.getElementById('heroDealStoreCat');
            if (storeCatEl) storeCatEl.textContent = deal.storeCategory;

            const badgeEl = document.getElementById('heroDealBadge');
            if (badgeEl) {
              badgeEl.textContent = localeData.discountBadge;
              badgeEl.className = 'text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight leading-none';
            }

            const badgeSubEl = document.getElementById('heroDealBadgeSub');
            if (badgeSubEl) badgeSubEl.textContent = localeData.discountSub;

            const titleEl = document.getElementById('heroDealTitle');
            if (titleEl) titleEl.textContent = localeData.title;

            const descEl = document.getElementById('heroDealDesc');
            if (descEl) descEl.textContent = localeData.description;

            const claimTextEl = document.getElementById('heroDealClaimText');
            if (claimTextEl) claimTextEl.textContent = localeData.claimButtonText;

            const maskedCodeEl = document.getElementById('heroDealMaskedCode');
            if (maskedCodeEl) maskedCodeEl.textContent = deal.maskedCode;

            // Ticket Stubs Localization (safely handled if present)
            const voucherOfficialEl = dynamicContent.querySelector('.ticket-stub-official');
            if (voucherOfficialEl) voucherOfficialEl.textContent = localeData.ticketOfficial;
            const voucherVerifiedEl = dynamicContent.querySelector('.ticket-stub-verified');
            if (voucherVerifiedEl) voucherVerifiedEl.textContent = localeData.ticketVerified;

            // Estimated Savings Widget Localization (Option 5)
            const savingsData = (typeof heroSavingsById !== 'undefined' && heroSavingsById[deal.id]) 
              ? (heroSavingsById[deal.id][currentLang] || heroSavingsById[deal.id]['en'])
              : null;
            const savingsLabelEl = document.getElementById('heroDealSavingsLabel');
            const savingsValueEl = document.getElementById('heroDealSavingsValue');
            const savingsSubEl = document.getElementById('heroDealSavingsSub');
            if (savingsData) {
              if (savingsLabelEl) savingsLabelEl.textContent = savingsData.label;
              if (savingsValueEl) savingsValueEl.textContent = savingsData.value;
              if (savingsSubEl) savingsSubEl.textContent = savingsData.sub;
            }

            const openBtn = document.getElementById('openFeaturedDealBtn');
            if (openBtn) {
              openBtn.setAttribute('data-reveal-deal', JSON.stringify({
                id: deal.id,
                title: localeData.title,
                desc: localeData.description,
                code: deal.code,
                storeName: deal.storeName,
                storeSlug: deal.storeSlug,
                domain: deal.domain,
                badge: localeData.discountBadge,
                affiliateUrl: deal.affiliateUrl
              }));
            }

            updateDotsVisual();

            // 3. Staging position before enter (inverted direction with micro-scale)
            dynamicContent.style.transition = 'none';
            dynamicContent.style.transform = direction === 'next' 
              ? 'translate3d(0, 14px, 0) scale(0.985)' 
              : 'translate3d(0, -14px, 0) scale(0.985)';

            // Force reflow and trigger silky-smooth Apple-grade entrance curve
            void dynamicContent.offsetWidth;

            requestAnimationFrame(() => {
              dynamicContent.style.transition = 'opacity 0.42s cubic-bezier(0.16, 1, 0.3, 1), transform 0.48s cubic-bezier(0.16, 1, 0.3, 1)';
              dynamicContent.style.opacity = '1';
              dynamicContent.style.transform = 'translate3d(0, 0, 0) scale(1)';
              setTimeout(() => {
                isTransitioning = false;
              }, 480);
            });
          } catch (err) {
            console.error('Error during hero deal rotation:', err);
            dynamicContent.style.opacity = '1';
            dynamicContent.style.transform = 'translate3d(0, 0, 0) scale(1)';
            isTransitioning = false;
          }
        }, 230);
      }

      function nextDeal() {
        if (rotatingDeals.length <= 1) return;
        currentIndex = (currentIndex + 1) % rotatingDeals.length;
        renderDeal(currentIndex, 'next');
        resetProgressBar();
      }

      function prevDeal() {
        if (rotatingDeals.length <= 1) return;
        currentIndex = (currentIndex - 1 + rotatingDeals.length) % rotatingDeals.length;
        renderDeal(currentIndex, 'prev');
        resetProgressBar();
      }

      function resetProgressBar() {
        animStartTime = null;
        animProgress = 0;
        if (timerBar) {
          timerBar.style.transform = 'scaleX(0)';
        }
      }

      // High-performance 60/120 FPS requestAnimationFrame progress ticker
      function rafTick(timestamp) {
        if (isUserPaused || isHoverPaused || rotatingDeals.length <= 1) {
          rafLoopId = null;
          return;
        }

        if (!animStartTime) {
          animStartTime = timestamp - (animProgress * ROTATION_INTERVAL_MS);
        }

        const elapsed = timestamp - animStartTime;
        animProgress = Math.min(elapsed / ROTATION_INTERVAL_MS, 1);

        if (timerBar) {
          timerBar.style.transform = 'scaleX(' + animProgress.toFixed(4) + ')';
        }

        if (animProgress >= 1) {
          resetProgressBar();
          nextDeal();
        }

        rafLoopId = requestAnimationFrame(rafTick);
      }

      function startRotationLoop() {
        if (isUserPaused || isHoverPaused || rotatingDeals.length <= 1) return;
        if (!rafLoopId) {
          animStartTime = null; // will resume seamlessly from animProgress
          rafLoopId = requestAnimationFrame(rafTick);
        }
      }

      function stopRotationLoop() {
        if (rafLoopId) {
          cancelAnimationFrame(rafLoopId);
          rafLoopId = null;
        }
        animStartTime = null; // freeze elapsed baseline
      }

      function togglePlayPause() {
        isUserPaused = !isUserPaused;
        if (isUserPaused) {
          stopRotationLoop();
          playIcon?.classList.remove('hidden');
          pauseIcon?.classList.add('hidden');
          playPauseBtn?.setAttribute('title', 'Resume Rotation');
          playPauseBtn?.setAttribute('aria-label', 'Resume Rotation');
        } else {
          playIcon?.classList.add('hidden');
          pauseIcon?.classList.remove('hidden');
          playPauseBtn?.setAttribute('title', 'Pause Rotation');
          playPauseBtn?.setAttribute('aria-label', 'Pause Rotation');
          if (!isHoverPaused) startRotationLoop();
        }
      }

      playPauseBtn?.addEventListener('click', togglePlayPause);

      card.addEventListener('mouseenter', () => {
        isHoverPaused = true;
        stopRotationLoop();
      });

      card.addEventListener('mouseleave', () => {
        isHoverPaused = false;
        if (!isUserPaused) startRotationLoop();
      });

      nextBtn?.addEventListener('click', () => {
        nextDeal();
        if (!isUserPaused) startRotationLoop();
      });

      prevBtn?.addEventListener('click', () => {
        prevDeal();
        if (!isUserPaused) startRotationLoop();
      });

      // Event listener: Listen to Geo / Region changes
      window.addEventListener('promoradar_region_changed', (e) => {
        const reg = (e.detail?.region || 'GLOBAL').toUpperCase().trim();
        if (reg !== currentRegion) {
          currentRegion = reg;
          rotatingDeals = filterDealsByRegion(currentRegion);
          currentIndex = 0;
          renderDots();
          renderDeal(currentIndex, 'next');
          resetProgressBar();
          if (!isUserPaused) startRotationLoop();
        }
      });

      // Event listener: Listen to Language changes
      window.addEventListener('promoradar_lang_changed', (e) => {
        const lang = (e.detail?.lang || 'en').toLowerCase().trim();
        if (lang !== currentLang) {
          currentLang = lang;
          renderDeal(currentIndex, 'next');
        }
      });

      // Initial dots and render
      renderDots();
      renderDeal(currentIndex, 'next');
      startRotationLoop();
    })();

    // Brand Directory Ticker Interactive Carousel (Wheel with Physics & Continuous Lens Zoom)
    (function initBrandInfiniteWheel() {
      const track = document.getElementById('heroStoreTicker');
      const prevBtn = document.getElementById('brandTickerPrevBtn');
      const nextBtn = document.getElementById('brandTickerNextBtn');

      if (!track) return;

      const GEO_BRAND_POOLS = {
      "UA": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "Touch",
                  "slug": "touch",
                  "domain": "touch.com.ua"
            },
            {
                  "name": "Polis.ua",
                  "slug": "polis-ua",
                  "domain": "polis.ua"
            },
            {
                  "name": "ALLPOWERS",
                  "slug": "allpowers",
                  "domain": "allpowersukraine.com"
            },
            {
                  "name": "Kodland",
                  "slug": "kodland",
                  "domain": "kodland.com"
            },
            {
                  "name": "Airalo eSIM",
                  "slug": "airalo",
                  "domain": "airalo.com"
            },
            {
                  "name": "ExpressVPN",
                  "slug": "expressvpn",
                  "domain": "expressvpn.com"
            },
            {
                  "name": "Turbosto",
                  "slug": "turbosto",
                  "domain": "turbosto.com.ua"
            },
            {
                  "name": "Hostinger",
                  "slug": "hostinger",
                  "domain": "hostinger.com"
            },
            {
                  "name": "PureVPN",
                  "slug": "purevpn",
                  "domain": "purevpn.com"
            }
      ],
      "GCC": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "VogaCloset",
                  "slug": "vogacloset",
                  "domain": "vogacloset.com"
            },
            {
                  "name": "The Deal Outlet",
                  "slug": "the-deal-outlet",
                  "domain": "thedealoutlet.com"
            },
            {
                  "name": "Rayna Tours",
                  "slug": "rayna-tours",
                  "domain": "raynatours.com"
            },
            {
                  "name": "V Perfumes",
                  "slug": "vperfumes",
                  "domain": "vperfumes.com"
            },
            {
                  "name": "Nazih",
                  "slug": "nazih-cosmetics",
                  "domain": "nazih.sa"
            },
            {
                  "name": "Jashanmal",
                  "slug": "jashanmal",
                  "domain": "jashanmal.com"
            },
            {
                  "name": "Dabdoob",
                  "slug": "dabdoob",
                  "domain": "dabdoob.com"
            },
            {
                  "name": "ChicMe",
                  "slug": "chicme",
                  "domain": "chicme.com"
            },
            {
                  "name": "Alibaba",
                  "slug": "alibaba",
                  "domain": "alibaba.com"
            },
            {
                  "name": "ExpressVPN",
                  "slug": "expressvpn",
                  "domain": "expressvpn.com"
            },
            {
                  "name": "Airalo eSIM",
                  "slug": "airalo",
                  "domain": "airalo.com"
            }
      ],
      "US": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "ExpressVPN",
                  "slug": "expressvpn",
                  "domain": "expressvpn.com"
            },
            {
                  "name": "Spokeo",
                  "slug": "spokeo-reverse-scan",
                  "domain": "spokeo.com"
            },
            {
                  "name": "Keeper Security",
                  "slug": "keeper-security",
                  "domain": "keepersecurity.com"
            },
            {
                  "name": "Qustodio",
                  "slug": "qustodio",
                  "domain": "qustodio.com"
            },
            {
                  "name": "BannerBuzz",
                  "slug": "bannerbuzz",
                  "domain": "bannerbuzz.com"
            },
            {
                  "name": "DirectDeals",
                  "slug": "directdeals-software",
                  "domain": "directdeals.com"
            },
            {
                  "name": "ChicMe",
                  "slug": "chicme",
                  "domain": "chicme.com"
            },
            {
                  "name": "GlassesLit",
                  "slug": "glasseslit",
                  "domain": "glasseslit.com"
            },
            {
                  "name": "Airalo eSIM",
                  "slug": "airalo",
                  "domain": "airalo.com"
            },
            {
                  "name": "Hostinger",
                  "slug": "hostinger",
                  "domain": "hostinger.com"
            }
      ],
      "EU": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "Abelssoft",
                  "slug": "abelssoft",
                  "domain": "abelssoft.de"
            },
            {
                  "name": "PureVPN",
                  "slug": "purevpn",
                  "domain": "purevpn.com"
            },
            {
                  "name": "ExpressVPN",
                  "slug": "expressvpn",
                  "domain": "expressvpn.com"
            },
            {
                  "name": "Airalo eSIM",
                  "slug": "airalo",
                  "domain": "airalo.com"
            },
            {
                  "name": "Hostinger",
                  "slug": "hostinger",
                  "domain": "hostinger.com"
            },
            {
                  "name": "Zonky",
                  "slug": "zonky-cz",
                  "domain": "zonky.cz"
            },
            {
                  "name": "MEGOGO",
                  "slug": "megogo",
                  "domain": "megogo.net"
            },
            {
                  "name": "Alibaba",
                  "slug": "alibaba",
                  "domain": "alibaba.com"
            },
            {
                  "name": "Qustodio",
                  "slug": "qustodio",
                  "domain": "qustodio.com"
            }
      ],
      "IN": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "Lenovo",
                  "slug": "lenovo-india-in",
                  "domain": "lenovo.com"
            },
            {
                  "name": "Acer",
                  "slug": "acer-in",
                  "domain": "acer.com"
            },
            {
                  "name": "Bliss Club",
                  "slug": "bliss-club-in",
                  "domain": "blissclub.com"
            },
            {
                  "name": "Nveda",
                  "slug": "nveda-in",
                  "domain": "nveda.in"
            },
            {
                  "name": "Salty",
                  "slug": "salty-in",
                  "domain": "salty.co.in"
            },
            {
                  "name": "R for Rabbit",
                  "slug": "r-for-rabbit-in",
                  "domain": "rforrabbit.com"
            },
            {
                  "name": "Airalo eSIM",
                  "slug": "airalo",
                  "domain": "airalo.com"
            }
      ],
      "MX": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "Levis",
                  "slug": "levis",
                  "domain": "levi.com.mx"
            },
            {
                  "name": "SharkNinja",
                  "slug": "sharkninja-mx",
                  "domain": "sharkninja.com"
            },
            {
                  "name": "Wild Fork",
                  "slug": "wild-fork",
                  "domain": "wildfork.mx"
            },
            {
                  "name": "Solcredito",
                  "slug": "sol-cr-dito-mx",
                  "domain": "solcredito.mx"
            },
            {
                  "name": "American Eagle",
                  "slug": "american-eagle-mx",
                  "domain": "ae.com"
            },
            {
                  "name": "Cheapvuelos",
                  "slug": "cheapvuelos",
                  "domain": "cheapvuelos.com"
            }
      ],
      "BR": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "Shopee",
                  "slug": "shopee-br",
                  "domain": "shopee.com.br"
            },
            {
                  "name": "Bold Snacks",
                  "slug": "bold-snacks-br",
                  "domain": "boldsnacks.com.br"
            },
            {
                  "name": "Phooto",
                  "slug": "phooto-br",
                  "domain": "phooto.com.br"
            },
            {
                  "name": "Guldi",
                  "slug": "guldi-br",
                  "domain": "guldi.com.br"
            },
            {
                  "name": "Saude Abril",
                  "slug": "saude-abril-br-grupo-abril",
                  "domain": "abril.com.br"
            }
      ],
      "PL": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "MEGOGO PL",
                  "slug": "megogo",
                  "domain": "megogo.net"
            },
            {
                  "name": "Konesso",
                  "slug": "konesso-pl",
                  "domain": "konesso.pl"
            },
            {
                  "name": "Katalog Marzen",
                  "slug": "katalog-marze-pl",
                  "domain": "katalogmarzen.pl"
            },
            {
                  "name": "ExpressVPN",
                  "slug": "expressvpn",
                  "domain": "expressvpn.com"
            },
            {
                  "name": "Hostinger",
                  "slug": "hostinger",
                  "domain": "hostinger.com"
            }
      ],
      "CZ": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "Zonky",
                  "slug": "zonky-cz",
                  "domain": "zonky.cz"
            },
            {
                  "name": "Kenwood",
                  "slug": "kenwood-cz",
                  "domain": "kenwoodworld.com"
            },
            {
                  "name": "Cool Credit",
                  "slug": "coolcredit-cz",
                  "domain": "coolcredit.cz"
            },
            {
                  "name": "ExpressVPN",
                  "slug": "expressvpn",
                  "domain": "expressvpn.com"
            },
            {
                  "name": "Hostinger",
                  "slug": "hostinger",
                  "domain": "hostinger.com"
            }
      ],
      "GLOBAL": [
            {
                  "name": "Nike",
                  "slug": "nike",
                  "domain": "nike.com"
            },
            {
                  "name": "Adidas",
                  "slug": "adidas",
                  "domain": "adidas.com"
            },
            {
                  "name": "Puma",
                  "slug": "puma",
                  "domain": "puma.com"
            },
            {
                  "name": "Under Armour",
                  "slug": "under-armour",
                  "domain": "underarmour.com"
            },
            {
                  "name": "New Balance",
                  "slug": "new-balance",
                  "domain": "newbalance.com"
            },
            {
                  "name": "Decathlon",
                  "slug": "decathlon",
                  "domain": "decathlon.com"
            },
            {
                  "name": "Reebok",
                  "slug": "reebok",
                  "domain": "reebok.com"
            },
            {
                  "name": "AliExpress",
                  "slug": "alibaba",
                  "domain": "aliexpress.com"
            },
            {
                  "name": "ExpressVPN",
                  "slug": "expressvpn",
                  "domain": "expressvpn.com"
            },
            {
                  "name": "Hostinger",
                  "slug": "hostinger",
                  "domain": "hostinger.com"
            },
            {
                  "name": "Airalo eSIM",
                  "slug": "airalo",
                  "domain": "airalo.com"
            },
            {
                  "name": "PureVPN",
                  "slug": "purevpn",
                  "domain": "purevpn.com"
            },
            {
                  "name": "Abelssoft",
                  "slug": "abelssoft",
                  "domain": "abelssoft.de"
            },
            {
                  "name": "ChicMe",
                  "slug": "chicme",
                  "domain": "chicme.com"
            },
            {
                  "name": "GlassesLit",
                  "slug": "glasseslit",
                  "domain": "glasseslit.com"
            },
            {
                  "name": "ALLPOWERS",
                  "slug": "allpowers",
                  "domain": "allpowersukraine.com"
            },
            {
                  "name": "Rayna Tours",
                  "slug": "rayna-tours",
                  "domain": "raynatours.com"
            },
            {
                  "name": "VogaCloset",
                  "slug": "vogacloset",
                  "domain": "vogacloset.com"
            },
            {
                  "name": "Keeper Security",
                  "slug": "keeper-security",
                  "domain": "keepersecurity.com"
            },
            {
                  "name": "Qustodio",
                  "slug": "qustodio",
                  "domain": "qustodio.com"
            }
      ]
};

      const resolvedBase = '';

      // Determine current user region
      function detectUserRegion() {
        try {
          const stored = localStorage.getItem('promoradar_selected_region');
          if (stored && stored !== 'ALL' && stored !== 'GLOBAL' && GEO_BRAND_POOLS[stored]) {
            return stored;
          }
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          if (tz.includes('Kyiv') || tz.includes('Kiev') || tz.includes('Simferopol') || tz.includes('Uzhgorod') || tz.includes('Zaporozhye')) return 'UA';
          if (tz.includes('Dubai') || tz.includes('Riyadh') || tz.includes('Qatar') || tz.includes('Muscat') || tz.includes('Kuwait') || tz.includes('Bahrain')) return 'GCC';
          if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles') || tz.includes('Denver') || tz.includes('Phoenix')) return 'US';
          if (tz.includes('Calcutta') || tz.includes('Kolkata')) return 'IN';
          if (tz.includes('Mexico') || tz.includes('Cancun') || tz.includes('Monterrey')) return 'MX';
          if (tz.includes('Sao_Paulo') || tz.includes('Fortaleza') || tz.includes('Bahia')) return 'BR';
          if (tz.includes('Warsaw')) return 'PL';
          if (tz.includes('Prague')) return 'CZ';
          if (tz.includes('London') || tz.includes('Berlin') || tz.includes('Paris') || tz.includes('Madrid') || tz.includes('Rome') || tz.includes('Amsterdam')) return 'EU';
        } catch (e) {}
        return 'GLOBAL';
      }

      let currentRegion = detectUserRegion();
      let activeBrandList = GEO_BRAND_POOLS[currentRegion] || GEO_BRAND_POOLS['GLOBAL'];
      let items = [];

      // Render items in a 3x buffer for seamless infinite loop
      function renderBrandItems() {
        track.innerHTML = '';
        for (let setIndex = 0; setIndex < 3; setIndex++) {
          activeBrandList.forEach(brand => {
            const googleFav = brand.domain ? `https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64` : '';
            const localLogo = `/logos/${brand.slug}.png`;

            const slot = document.createElement('div');
            slot.className = 'brand-ticker-slot';

            const a = document.createElement('a');
            a.href = `${resolvedBase}/stores/${brand.slug}/`;
            a.setAttribute('data-filter-store', brand.name);
            a.className = 'brand-ticker-item shrink-0 text-xs sm:text-sm font-semibold bg-transparent border-0 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer inline-flex items-center gap-2';
            a.style.transformOrigin = 'center center';
            a.style.willChange = 'transform';

            const img = document.createElement('img');
            img.src = localLogo;
            img.alt = '';
            img.className = 'w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 bg-transparent transition-transform duration-200 brand-logo-dresscode';
            img.loading = 'lazy';
            if (googleFav) img.setAttribute('data-fallback-google', googleFav);
            img.onerror = function() {
              const fb = this.getAttribute('data-fallback-google');
              if (fb && this.src !== fb) {
                this.src = fb;
              } else {
                this.style.display = 'none';
              }
            };

            const span = document.createElement('span');
            span.className = 'brand-name-text whitespace-nowrap font-medium';
            span.textContent = brand.name;

            a.appendChild(img);
            a.appendChild(span);
            slot.appendChild(a);
            track.appendChild(slot);
          });
        }
        items = Array.from(track.querySelectorAll('.brand-ticker-item'));
        initScrollPosition();
      }

      // Base auto-spin speed (pixels per frame, right-to-left: positive scrollLeft)
      const BASE_SPEED = 0.85;
      let currentVelocity = BASE_SPEED;
      let targetVelocity = BASE_SPEED;
      let isPaused = false;
      let isDragging = false;
      let startX = 0;
      let lastX = 0;
      let dragVelocity = 0;
      let lastDragTime = 0;
      let hasDragged = false;
      let rafId = null;

      function initScrollPosition() {
        const singleSetWidth = track.scrollWidth / 3;
        if (singleSetWidth > 0) {
          track.scrollLeft = singleSetWidth;
        }
      }

      function triggerEntranceNudge() {
        currentVelocity = 2.0; // Soft smooth right-to-left entrance drift
        targetVelocity = BASE_SPEED;
      }

      function handleInfiniteWrap() {
        const singleSetWidth = track.scrollWidth / 3;
        if (singleSetWidth <= 0) return;

        // Circular seamless infinite wrap in both directions
        if (track.scrollLeft >= singleSetWidth * 2) {
          track.scrollLeft -= singleSetWidth;
        } else if (track.scrollLeft <= 10) {
          track.scrollLeft += singleSetWidth;
        }
      }

      function updateCenterLensZoom() {
        // Uniform rendering: keep scale 1.0 and uniform opacity to ensure exact even spacing
        // and eliminate any overlapping collisions between adjacent brands.
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          item.style.transform = 'none';
          item.style.opacity = '1';
        }
      }

      function physicsTick() {
        if (!isDragging) {
          if (Math.abs(currentVelocity - targetVelocity) > 0.02) {
            currentVelocity += (targetVelocity - currentVelocity) * 0.045;
          } else {
            currentVelocity = targetVelocity;
          }

          if (!isPaused || Math.abs(currentVelocity) > 0.1) {
            track.scrollLeft += currentVelocity;
            handleInfiniteWrap();
          }
        }

        updateCenterLensZoom();
        rafId = requestAnimationFrame(physicsTick);
      }

      // Initial Render & Start Loop
      renderBrandItems();
      rafId = requestAnimationFrame(physicsTick);

      const preloader = document.getElementById('promoradar-preloader');
      if (preloader && preloader.dataset.hidden !== 'true') {
        window.addEventListener('promoradar_preloader_done', () => {
          setTimeout(triggerEntranceNudge, 250);
        }, { once: true });
      } else {
        setTimeout(triggerEntranceNudge, 350);
      }

      // Listen to region changes from Header to dynamically reload tailored regional brands
      window.addEventListener('promoradar_region_changed', (e) => {
        const reg = e.detail?.region || 'GLOBAL';
        const newBrands = GEO_BRAND_POOLS[reg] || GEO_BRAND_POOLS['GLOBAL'];
        if (newBrands && newBrands !== activeBrandList) {
          activeBrandList = newBrands;
          renderBrandItems();
          triggerEntranceNudge();
        }
      });

      // Controls & Drag
      prevBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        targetVelocity = -12.0;
        setTimeout(() => { targetVelocity = BASE_SPEED; }, 650);
      });

      nextBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        targetVelocity = 13.0;
        setTimeout(() => { targetVelocity = BASE_SPEED; }, 650);
      });

      track.addEventListener('mousedown', (e) => {
        isDragging = true;
        hasDragged = false;
        startX = e.pageX;
        lastX = e.pageX;
        lastDragTime = performance.now();
        dragVelocity = 0;
        targetVelocity = 0;
        currentVelocity = 0;
        track.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const now = performance.now();
        const dt = Math.max(1, now - lastDragTime);
        const dx = e.pageX - lastX;

        if (Math.abs(e.pageX - startX) > 10) {
          hasDragged = true;
        }

        track.scrollLeft -= dx;
        handleInfiniteWrap();

        dragVelocity = (-dx / dt) * 16;
        lastX = e.pageX;
        lastDragTime = now;
      });

      window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = '';
        if (Math.abs(dragVelocity) > 0.4) {
          currentVelocity = Math.max(-20, Math.min(20, dragVelocity));
        }
        targetVelocity = BASE_SPEED;
      });

      track.addEventListener('wheel', (e) => {
        e.preventDefault();
        const wheelDelta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        currentVelocity += wheelDelta * 0.08;
        currentVelocity = Math.max(-18, Math.min(18, currentVelocity));
        targetVelocity = BASE_SPEED;
      }, { passive: false });

      track.addEventListener('mouseenter', () => {
        isPaused = true;
        targetVelocity = 0;
      });

      track.addEventListener('mouseleave', () => {
        isPaused = false;
        targetVelocity = BASE_SPEED;
      });

      track.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);

      window.addEventListener('resize', () => {
        handleInfiniteWrap();
        updateCenterLensZoom();
      });
    })();

  
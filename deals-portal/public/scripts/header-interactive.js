// Single Icon Light / Dark Theme Toggle Controller
  (function initSingleThemeToggle() {
    const btn = document.getElementById('singleThemeToggleBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      const newTheme = isDark ? 'dark' : 'light';
      try {
        localStorage.setItem('promoradar_theme', newTheme);
        localStorage.setItem('promoradar_theme_mode', newTheme);
      } catch (e) {}
    });
  })();

  // Header Region Dropdown with Persistent Storage & Global Event Sync
  (function initHeaderRegionDropdown() {
    const btn = document.getElementById('headerRegionDropdownBtn');
    const menu = document.getElementById('headerRegionMenu');
    const label = document.getElementById('headerSelectedRegionText');

    // Restore selected region on load
    try {
      const savedRegion = localStorage.getItem('promoradar_selected_region') || 'GLOBAL';
      if (savedRegion && savedRegion !== 'GLOBAL') {
        const item = menu?.querySelector(`[data-region-code="${savedRegion}"]`);
        if (item) {
          const img = item.querySelector('img');
          const textSpan = item.querySelector('span > span:last-child') || item.querySelector('span');
          const text = textSpan ? textSpan.textContent.trim() : item.textContent.trim();
          if (label) {
            if (img) {
              label.innerHTML = `<img src="${img.src}" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="" /> <span>${text}</span>`;
            } else {
              label.innerHTML = `<svg class="w-4 h-4 text-slate-500 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> <span>${text.replace('🌐', '').trim()}</span>`;
            }
          }
          menu.querySelectorAll('.region-check').forEach(c => c.remove());
          item.insertAdjacentHTML('beforeend', '<span class="region-check text-emerald-500 font-bold">✓</span>');
        }
      }
    } catch (e) {}

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      menu?.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      menu?.classList.add('hidden');
    });

    function updateHeaderRegionUI(regionCode) {
      const targetCode = regionCode || 'GLOBAL';
      const item = menu?.querySelector(`[data-region-code="${targetCode}"]`);
      if (item) {
        const img = item.querySelector('img');
        const textSpan = item.querySelector('span > span:last-child') || item.querySelector('span');
        const text = textSpan ? textSpan.textContent.trim() : item.textContent.trim();
        if (label) {
          if (img) {
            label.innerHTML = `<img src="${img.src}" class="w-4 h-3 rounded-xs object-cover shrink-0 shadow-2xs mr-1" alt="" /> <span>${text}</span>`;
          } else {
            label.innerHTML = `<svg class="w-4 h-4 text-slate-500 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> <span>${text.replace('🌐', '').trim()}</span>`;
          }
        }
        menu.querySelectorAll('.region-check').forEach(c => c.remove());
        item.insertAdjacentHTML('beforeend', '<span class="region-check text-emerald-500 font-bold">✓</span>');
      }
    }

    menu?.querySelectorAll('.header-region-item').forEach(item => {
      item.addEventListener('click', () => {
        const code = item.getAttribute('data-region-code') || 'GLOBAL';
        updateHeaderRegionUI(code);
        menu.classList.add('hidden');

        // Save to localStorage & dispatch global region change event
        try { localStorage.setItem('promoradar_selected_region', code); } catch (e) {}
        window.dispatchEvent(new CustomEvent('promoradar_region_changed', { detail: { region: code } }));
      });
    });

    // Listen to region changes from Hero search bar or other components
    window.addEventListener('promoradar_region_changed', (e) => {
      if (e.detail?.region) {
        updateHeaderRegionUI(e.detail.region);
      }
    });
  })();

  // Saved Deals Count Sync
  (function initSavedCounter() {
    function updateBadge() {
      try {
        const saved = JSON.parse(localStorage.getItem('promoradar_saved_deals') || '[]');
        const badge = document.getElementById('savedCountBadge');
        if (badge) badge.textContent = String(saved.length || 0);
      } catch (e) {}
    }
    updateBadge();
    window.addEventListener('storage', updateBadge);
    window.addEventListener('promoradar_saved_updated', updateBadge);

    document.getElementById('headerSavedBtn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('promoradar_filter_saved'));
    });
  })();

  // Language Selector Dropdown
  (function initHeaderLanguageDropdown() {
    const btn = document.getElementById('headerLangDropdownBtn');
    const menu = document.getElementById('headerLangMenu');
    const flagEl = document.getElementById('headerSelectedLangFlag');
    const textEl = document.getElementById('headerSelectedLangText');

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      menu?.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      menu?.classList.add('hidden');
    });

    menu?.querySelectorAll('.header-lang-item').forEach(item => {
      item.addEventListener('click', () => {
        const lang = item.getAttribute('data-lang-code') || 'en';
        const flagImg = item.querySelector('img');
        if (flagEl && flagImg) {
          flagEl.src = flagImg.src;
        }
        if (textEl) textEl.textContent = lang.toUpperCase();
        menu.classList.add('hidden');
        
        try {
          localStorage.setItem('promoradar_lang', lang);
          document.documentElement.lang = lang;
          if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
          } else {
            document.documentElement.dir = 'ltr';
          }
        } catch (e) {}

        // Broadcast language change
        window.dispatchEvent(new CustomEvent('promoradar_lang_changed', { detail: { lang } }));
      });
    });

    // Check stored language on load
    try {
      let stored = localStorage.getItem('promoradar_lang');
      if (stored === 'uk') {
        stored = 'ua';
        localStorage.setItem('promoradar_lang', 'ua');
      }
      if (stored && stored !== 'en') {
        const matchingBtn = menu?.querySelector(`[data-lang-code="${stored}"]`);
        if (matchingBtn) {
          const flagImg = matchingBtn.querySelector('img');
          if (flagEl && flagImg) {
            flagEl.src = flagImg.src;
          }
          if (textEl) textEl.textContent = stored.toUpperCase();
        }
      }
    } catch (e) {}
  })();

  // Trigger Header Radar Sweep once Preloader finishes (Hardware-Accelerated CSS GPU Animation)
  (function initHeaderRadarTrigger() {
    function startHeaderRadar() {
      try {
        const radarBadge = document.getElementById('header-radar-badge');
        const sweepGroup = document.getElementById('header-radar-sweep-group');
        const blip1 = document.getElementById('header-radar-blip-1');
        const blip2 = document.getElementById('header-radar-blip-2');

        // 1. Silky emergence of squircle radar badge
        if (radarBadge) {
          radarBadge.classList.add('is-revealed');
        }

        // 2. Start graceful radar sweep
        if (sweepGroup) {
          sweepGroup.classList.add('is-active');
        }
        if (blip1) {
          blip1.classList.add('is-active');
        }
        if (blip2) {
          blip2.classList.add('is-active');
        }

        // 3. Staggered organic reveal of Brand Title and Subtitle
        const brandTitle = document.getElementById('header-brand-title');
        const brandSub = document.getElementById('header-brand-sub');
        const storeTag = document.getElementById('header-brand-store-tag');
        if (brandTitle) {
          brandTitle.classList.add('is-revealed');
        }
        if (brandSub) {
          brandSub.classList.add('is-revealed');
        }
        if (storeTag) {
          storeTag.classList.add('is-revealed');
        }

        // 4. Staggered graceful reveal of Nav items & Header actions
        const navMenu = document.getElementById('headerNavMenu');
        const actionsBlock = document.getElementById('headerActionsBlock');
        if (navMenu) {
          navMenu.classList.add('is-revealed');
        }
        if (actionsBlock) {
          actionsBlock.classList.add('is-revealed');
        }
      } catch (e) {
        console.warn('Radar animation trigger fallback:', e);
      }
    }

    // Trigger header animation on DOMContentLoaded or immediately if already loaded
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
    }, { once: true });
  })();

  // RetailMeNot Style Stores Mega Menu Interactions
  (function initStoresMegaMenu() {
    const catButtons = document.querySelectorAll('.mega-cat-btn');
    const storePanels = document.querySelectorAll('.mega-store-panel');
    const titleEl = document.getElementById('megaCurrentCatTitle');

    catButtons.forEach(btn => {
      // Switch on hover (like RetailMeNot desktop) and click
      const switchCategory = () => {
        const catKey = btn.getAttribute('data-mega-cat');
        const catName = btn.querySelector('span')?.textContent || 'Stores';

        // Update active button state
        catButtons.forEach(b => {
          b.classList.remove('bg-indigo-600/20', 'text-indigo-400', 'font-bold', 'border-indigo-500/30');
          b.classList.add('text-slate-400', 'border-transparent');
        });
        btn.classList.add('bg-indigo-600/20', 'text-indigo-400', 'font-bold', 'border-indigo-500/30');
        btn.classList.remove('text-slate-400', 'border-transparent');

        // Update title
        if (titleEl) {
          titleEl.textContent = catName.toUpperCase() + (catKey === 'popular' ? ' STORES' : '');
        }

        // Show matching panel
        storePanels.forEach(panel => {
          panel.classList.add('hidden');
          panel.classList.remove('grid');
        });
        const targetPanel = document.getElementById('mega-store-list-' + catKey);
        if (targetPanel) {
          targetPanel.classList.remove('hidden');
          targetPanel.classList.add('grid');
        }
      };

      btn.addEventListener('mouseenter', switchCategory);
      btn.addEventListener('click', switchCategory);
    });
  })();

  // Smart Categories Mega Menu Hover & Click Controller
  (function initCategoriesMegaMenu() {
    const catButtons = document.querySelectorAll('.smart-cat-btn');
    const catPanels = document.querySelectorAll('.smart-cat-panel');

    catButtons.forEach(btn => {
      const switchCat = () => {
        const catKey = btn.getAttribute('data-smart-cat');

        catButtons.forEach(b => {
          b.classList.remove('bg-indigo-600/20', 'text-indigo-400', 'font-bold', 'border-indigo-500/30');
          b.classList.add('text-slate-400', 'border-transparent');
        });
        btn.classList.add('bg-indigo-600/20', 'text-indigo-400', 'font-bold', 'border-indigo-500/30');
        btn.classList.remove('text-slate-400', 'border-transparent');

        catPanels.forEach(panel => {
          panel.classList.add('hidden');
          panel.classList.remove('block');
        });
        const target = document.getElementById('smart-cat-panel-' + catKey);
        if (target) {
          target.classList.remove('hidden');
          target.classList.add('block');
        }
      };

      btn.addEventListener('mouseenter', switchCat);
      btn.addEventListener('click', switchCat);
    });
  })();

  // Mobile Navigation Drawer Toggle Controller
  (function initMobileNav() {
    const btn = document.getElementById('headerMobileMenuBtn');
    const drawer = document.getElementById('headerMobileNavDrawer');
    const openIcon = document.getElementById('headerMobileMenuOpenIcon');
    const closeIcon = document.getElementById('headerMobileMenuCloseIcon');

    if (!btn || !drawer) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !drawer.classList.contains('hidden');
      if (isOpen) {
        drawer.classList.add('hidden');
        openIcon?.classList.remove('hidden');
        closeIcon?.classList.add('hidden');
      } else {
        drawer.classList.remove('hidden');
        openIcon?.classList.add('hidden');
        closeIcon?.classList.remove('hidden');
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!drawer.contains(e.target) && !btn.contains(e.target)) {
        drawer.classList.add('hidden');
        openIcon?.classList.remove('hidden');
        closeIcon?.classList.add('hidden');
      }
    });
  })();
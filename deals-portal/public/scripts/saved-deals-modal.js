(function initSavedDealsModalController() {
    const modal = document.getElementById('savedDealsModal');
    const container = document.getElementById('savedDealsContainer');
    const emptyState = document.getElementById('savedDealsEmptyState');
    const closeBtn = document.getElementById('closeSavedDealsModalBtn');
    const clearBtn = document.getElementById('clearAllSavedBtn');
    const summaryText = document.getElementById('savedDealsTotalSummary');
    const exploreBtn = document.getElementById('exploreDealsFromSavedBtn');

    function openModal() {
      if (!modal) return;
      renderSavedList();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }

    function renderSavedList() {
      if (!container || !emptyState) return;
      let savedIds = [];
      try {
        savedIds = JSON.parse(localStorage.getItem('promoradar_saved_deals') || '[]');
      } catch (e) {}

      if (summaryText) {
        summaryText.textContent = `${savedIds.length} deal${savedIds.length === 1 ? '' : 's'} bookmarked`;
      }

      if (savedIds.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        if (clearBtn) clearBtn.classList.add('hidden');
        return;
      }

      container.classList.remove('hidden');
      emptyState.classList.add('hidden');
      emptyState.classList.remove('flex');
      if (clearBtn) clearBtn.classList.remove('hidden');

      // Find deal details from DOM or coupons registry
      let html = '';
      savedIds.forEach(id => {
        const card = document.querySelector(`[data-deal-id="${id}"]`);
        let storeName = 'Verified Merchant';
        let title = 'Exclusive Discount Voucher';
        let discount = 'Verified Deal';
        let code = '';
        let url = '/';

        if (card) {
          storeName = card.getAttribute('data-store') || card.querySelector('.deal-store-title, h3, h4')?.textContent?.trim() || storeName;
          title = card.getAttribute('data-title') || card.querySelector('.deal-title, p')?.textContent?.trim() || title;
          discount = card.getAttribute('data-badge') || card.querySelector('.deal-discount-badge, .badge')?.textContent?.trim() || discount;
          code = card.getAttribute('data-code') || '';
          url = card.getAttribute('data-affiliate-url') || card.querySelector('a')?.href || '/';
        }

        html += `
          <div class="pt-3 first:pt-0 flex items-center justify-between gap-3 group">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-extrabold text-indigo-400 shrink-0 uppercase">
                ${storeName.charAt(0)}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-white truncate">${storeName}</span>
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                    ${discount}
                  </span>
                </div>
                <p class="text-xs text-slate-300 truncate mt-0.5">${title}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                data-reveal-deal-id="${id}"
                class="saved-modal-claim-btn px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm cursor-pointer"
              >
                Claim Deal
              </button>
              <button
                type="button"
                data-remove-saved-id="${id}"
                class="saved-modal-remove-btn w-8 h-8 rounded-xl hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition flex items-center justify-center cursor-pointer"
                title="Remove from favorites"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;

      // Attach claim & remove listeners inside modal
      container.querySelectorAll('.saved-modal-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rId = btn.getAttribute('data-remove-saved-id');
          if (!rId) return;
          let current = JSON.parse(localStorage.getItem('promoradar_saved_deals') || '[]');
          current = current.filter(x => x !== rId);
          localStorage.setItem('promoradar_saved_deals', JSON.stringify(current));
          window.dispatchEvent(new CustomEvent('promoradar_saved_updated', { detail: current }));
          renderSavedList();
        });
      });

      container.querySelectorAll('.saved-modal-claim-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cId = btn.getAttribute('data-reveal-deal-id');
          closeModal();
          const liveCardBtn = document.querySelector(`[data-deal-id="${cId}"] [data-reveal-deal]`);
          if (liveCardBtn) {
            liveCardBtn.click();
          } else {
            // If on another page, navigate to main index with anchor
            window.location.href = `/?reveal=${cId}`;
          }
        });
      });
    }

    // Modal listeners
    closeBtn?.addEventListener('click', closeModal);
    exploreBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    clearBtn?.addEventListener('click', () => {
      if (confirm('Clear all saved deals from favorites?')) {
        localStorage.setItem('promoradar_saved_deals', JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('promoradar_saved_updated', { detail: [] }));
        renderSavedList();
      }
    });

    // Global opener from Header button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#headerSavedBtn')) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }
    });

    // Keyboard ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  })();
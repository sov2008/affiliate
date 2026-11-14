(function() {
    const modal = document.getElementById('verificationGuaranteeModal');
    const closeBtn = document.getElementById('closeVerificationModalBtn');
    const toggleFormBtn = document.getElementById('toggleReportFormBtn');
    const reportForm = document.getElementById('qaReportForm');
    const reportSuccess = document.getElementById('qaReportSuccess');
    const storeContext = document.getElementById('qaModalStoreContext');
    const storeNameEl = document.getElementById('qaModalStoreName');

    let currentContext = {
      storeName: '',
      storeSlug: '',
      dealTitle: '',
      dealCode: ''
    };

    window.openVerificationGuaranteeModal = function(opts = {}) {
      currentContext = Object.assign({ storeName: '', storeSlug: '', dealTitle: '', dealCode: '' }, opts);
      
      if (currentContext.storeName) {
        if (storeNameEl) storeNameEl.textContent = currentContext.storeName;
        storeContext?.classList.remove('hidden');
      } else {
        storeContext?.classList.add('hidden');
      }

      // Reset form state
      reportForm?.classList.add('hidden');
      reportSuccess?.classList.add('hidden');
      if (toggleFormBtn) toggleFormBtn.textContent = 'Open Report Form ▾';

      modal?.classList.remove('hidden');
      modal?.classList.add('flex');
      document.body.classList.add('overflow-hidden');
    };

    window.closeVerificationGuaranteeModal = function() {
      modal?.classList.add('hidden');
      modal?.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
    };

    closeBtn?.addEventListener('click', window.closeVerificationGuaranteeModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeVerificationGuaranteeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
        window.closeVerificationGuaranteeModal();
      }
    });

    toggleFormBtn?.addEventListener('click', () => {
      const isHidden = reportForm?.classList.contains('hidden');
      if (isHidden) {
        reportForm?.classList.remove('hidden');
        toggleFormBtn.textContent = 'Hide Report Form ▴';
      } else {
        reportForm?.classList.add('hidden');
        toggleFormBtn.textContent = 'Open Report Form ▾';
      }
    });

    // Form Submission
    reportForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const reason = document.getElementById('qaReportReason')?.value || 'code_not_working';
      const comment = document.getElementById('qaReportComment')?.value || '';

      const reportPayload = {
        timestamp: new Date().toISOString(),
        storeName: currentContext.storeName || 'General',
        storeSlug: currentContext.storeSlug || '',
        dealTitle: currentContext.dealTitle || '',
        dealCode: currentContext.dealCode || '',
        reason,
        comment
      };

      try {
        const stored = JSON.parse(localStorage.getItem('promoradar_qa_reports') || '[]');
        stored.push(reportPayload);
        localStorage.setItem('promoradar_qa_reports', JSON.stringify(stored));
      } catch (err) {}

      // Fire GA4 Event if gtag exists
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'promoradar_code_reported', {
          store_slug: currentContext.storeSlug || 'general',
          report_reason: reason
        });
      }

      reportForm.classList.add('hidden');
      reportSuccess?.classList.remove('hidden');

      if (window.showPromoToast) {
        window.showPromoToast('✓ Verification ticket submitted to PromoRadar QA desk');
      }
    });

    // Global Delegated Click Listener for any [data-open-verification-guarantee] element
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-verification-guarantee]');
      if (trigger) {
        e.preventDefault();
        const storeName = trigger.getAttribute('data-store-name') || '';
        const storeSlug = trigger.getAttribute('data-store-slug') || '';
        const dealTitle = trigger.getAttribute('data-deal-title') || '';
        const dealCode = trigger.getAttribute('data-deal-code') || '';
        window.openVerificationGuaranteeModal({ storeName, storeSlug, dealTitle, dealCode });
      }
    });
  })();
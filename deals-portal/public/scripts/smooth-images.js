// Global Smooth Image Observer: guarantees that all images across the site fade in smoothly upon loading
      (function initSmoothImages() {
        function markImageLoaded(img) {
          img.classList.remove('smooth-image-loading');
          img.classList.add('smooth-image-loaded');
          const stage = img.closest('.product-media-stage');
          if (stage) stage.classList.add('loaded');
        }

        function setupImage(img) {
          if (!img.getAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
          }
          if (img.complete && img.naturalWidth > 0) {
            markImageLoaded(img);
          } else {
            if (!img.classList.contains('smooth-image-loaded')) {
              img.classList.add('smooth-image-loading');
            }
            img.addEventListener('load', () => markImageLoaded(img), { once: true });
            img.addEventListener('error', () => markImageLoaded(img), { once: true });
          }
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('img').forEach(setupImage);
          });
        } else {
          document.querySelectorAll('img').forEach(setupImage);
        }

        // MutationObserver to smoothly handle dynamically inserted images (Spotlight, tabs, modals)
        const observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            for (const node of m.addedNodes) {
              if (node.nodeType === 1) {
                if (node.tagName === 'IMG') {
                  setupImage(node);
                } else if (node.querySelectorAll) {
                  node.querySelectorAll('img').forEach(setupImage);
                }
              }
            }
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      })();

      window.showPromoToast = function(msg) {
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
        }, 2800);
      };

      // Global Delegated Click Listener for .deal-share-btn
      document.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('.deal-share-btn');
        if (shareBtn) {
          e.preventDefault();
          e.stopPropagation();
          const title = shareBtn.getAttribute('data-share-title') || 'PromoRadar Discount Voucher';
          const desc = shareBtn.getAttribute('data-share-desc') || '';
          const url = shareBtn.getAttribute('data-share-url') || window.location.href;

          const sharePayload = {
            title: `${title} | PromoRadar`,
            text: `${desc ? desc + ' — ' : ''}Verified discount on PromoRadar:`,
            url: url
          };

          if (navigator.share) {
            navigator.share(sharePayload).catch(() => {
              // Fallback to clipboard if cancelled or rejected
              navigator.clipboard?.writeText(url).then(() => {
                window.showPromoToast('Deal link copied to clipboard! Share it with friends ✨');
              });
            });
          } else {
            navigator.clipboard?.writeText(url).then(() => {
              window.showPromoToast('Deal link copied to clipboard! Share it with friends ✨');
            }).catch(() => {
              window.showPromoToast('Unable to copy link');
            });
          }
        }
      });
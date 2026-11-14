const fs = require('fs');
const filePath = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(filePath, 'utf8');

const targetOldRenderDeal = `      // Render Active Deal with Dynamic Locale Strings
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

        // 1. Slide fade out
        dynamicContent.style.transition = 'opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)';
        dynamicContent.style.opacity = '0';
        dynamicContent.style.transform = direction === 'next' ? 'translate3d(0, -8px, 0)' : 'translate3d(0, 8px, 0)';

        setTimeout(() => {
          try {
            // 2. Mutate DOM content
            const logoBox = document.getElementById('heroDealLogoBox');
            if (logoBox) {
              logoBox.innerHTML = '<img src="' + deal.logoUrl + '" alt="' + deal.storeName + '" class="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300" onerror="this.onerror=null; this.src=\\'/logos/' + deal.storeSlug + '.png\\';" />';
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

            // 3. Slide fade in
            dynamicContent.style.transform = direction === 'next' ? 'translate3d(0, 10px, 0)' : 'translate3d(0, -10px, 0)';

            requestAnimationFrame(() => {
              dynamicContent.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
              dynamicContent.style.opacity = '1';
              dynamicContent.style.transform = 'translate3d(0, 0, 0)';
              setTimeout(() => {
                isTransitioning = false;
              }, 450);
            });
          } catch (err) {
            console.error('Error during hero deal rotation:', err);
            dynamicContent.style.opacity = '1';
            dynamicContent.style.transform = 'translate3d(0, 0, 0)';
            isTransitioning = false;
          }
        }, 280);
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
        stepCount = 0;
        if (timerBar) {
          timerBar.style.transition = 'none';
          timerBar.style.width = '0%';
        }
      }

      function startRotationLoop() {
        if (isUserPaused || isHoverPaused || rotatingDeals.length <= 1) return;
        stopRotationLoop();

        progressInterval = setInterval(() => {
          if (isUserPaused || isHoverPaused) return;
          stepCount++;
          const progressPercent = (stepCount / totalSteps) * 100;
          if (timerBar) {
            timerBar.style.transition = 'width 50ms linear';
            timerBar.style.width = progressPercent + '%';
          }

          if (stepCount >= totalSteps) {
            stepCount = 0;
            nextDeal();
          }
        }, stepMs);
      }

      function stopRotationLoop() {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
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
      });`;

console.log('Target found in index.astro:', content.includes(targetOldRenderDeal));

if (!content.includes(targetOldRenderDeal)) {
  console.log('Partial check:');
  console.log('Includes renderDeal:', content.includes("function renderDeal(index, direction = 'next')"));
  console.log('Includes startRotationLoop:', content.includes("function startRotationLoop()"));
}


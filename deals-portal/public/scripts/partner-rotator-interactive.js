(function () {
    const slides = Array.from(document.querySelectorAll('.rotator-slide'));
    const dots = Array.from(document.querySelectorAll('#rotatorDots button'));
    const prevBtn = document.getElementById('rotatorPrevBtn');
    const nextBtn = document.getElementById('rotatorNextBtn');
    const playPauseBtn = document.getElementById('rotatorPlayPauseBtn');
    const playPauseIcon = document.getElementById('rotatorPlayPauseIcon');
    const playPauseText = document.getElementById('rotatorPlayPauseText');
    const progressBar = document.getElementById('rotatorProgressBar');
    const cardContainer = document.getElementById('rotatorCardContainer');

    if (!slides.length) return;

    let currentIndex = 0;
    let isUserPaused = false;
    let isHoverPaused = false;
    let slideDuration = 6000; // 6 seconds per banner for comfortable reading
    let startTime = performance.now();
    let animFrameId = null;

    // Detect User Context & Personalize Initial Slide Order
    function getPersonalizedInitialIndex() {
      try {
        let geo = 'GLOBAL';
        const storedGeo = localStorage.getItem('promoradar_selected_region');
        if (storedGeo && storedGeo !== 'ALL') {
          geo = storedGeo;
        } else {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          if (tz.includes('Kyiv') || tz.includes('Kiev') || tz.includes('Simferopol')) geo = 'UA';
          else if (tz.includes('Dubai') || tz.includes('Riyadh') || tz.includes('Qatar') || tz.includes('Muscat')) geo = 'GCC';
          else if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles') || tz.includes('Denver')) geo = 'US';
          else if (tz.includes('Warsaw') || tz.includes('Berlin') || tz.includes('Paris') || tz.includes('London') || tz.includes('Madrid') || tz.includes('Rome')) geo = 'EU';
        }

        const ua = navigator.userAgent;
        let os = 'Windows';
        if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
        else if (/Android/.test(ua)) os = 'Android';
        else if (/Macintosh|Mac OS X/.test(ua)) os = 'macOS';
        else if (/Linux/.test(ua)) os = 'Linux';

        let profile = { categoryAffinities: {}, storeAffinities: {} };
        const rawProfile = localStorage.getItem('pr_user_profile_v1');
        if (rawProfile) {
          try { profile = JSON.parse(rawProfile); } catch (e) {}
        }

        const STORE_GEOS = {
          'turbosto': ['UA'],
          'touch': ['UA'],
          'touch-ua': ['UA'],
          'allpowers': ['UA', 'EU', 'GLOBAL'],
          'parallels': ['GLOBAL', 'EU', 'US'],
          'lenovo': ['GLOBAL', 'EU', 'US', 'UA'],
          'wondershare': ['GLOBAL', 'EU', 'US'],
          'answear': ['EU', 'UA'],
          'chicme': ['GLOBAL', 'EU', 'US'],
          'hostinger': ['GLOBAL', 'US', 'EU', 'UA', 'GCC'],
          'airalo': ['GLOBAL', 'EU', 'GCC', 'US', 'UA'],
          'purevpn': ['GLOBAL', 'EU', 'US', 'GCC']
        };

        const STORE_OS = {
          'parallels': ['macOS'],
          'wondershare': ['macOS', 'Windows'],
          'airalo': ['iOS', 'Android']
        };

        let bestIndex = 0;
        let maxScore = -999;

        slides.forEach((slide, idx) => {
          const slug = (slide.getAttribute('data-partner-slug') || '').toLowerCase();
          const category = slide.getAttribute('data-category') || '';
          let score = 0;

          const allowedGeos = STORE_GEOS[slug] || ['GLOBAL'];
          if (geo !== 'GLOBAL') {
            if (allowedGeos.includes(geo)) score += 30;
            else if (allowedGeos.includes('GLOBAL')) score += 10;
            else score -= 40;
          }

          const targetOs = STORE_OS[slug];
          if (targetOs) {
            if (targetOs.includes(os)) score += 20;
            else score -= 15;
          }

          if (profile.categoryAffinities && profile.categoryAffinities[category]) {
            score += profile.categoryAffinities[category] * 8;
          }
          if (profile.storeAffinities && profile.storeAffinities[slug]) {
            score += profile.storeAffinities[slug] * 12;
          }

          if (score > maxScore) {
            maxScore = score;
            bestIndex = idx;
          }
        });

        return bestIndex;
      } catch (err) {
        return 0;
      }
    }

    currentIndex = getPersonalizedInitialIndex();

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.remove('hidden');
          slide.classList.add('block');
        } else {
          slide.classList.add('hidden');
          slide.classList.remove('block');
        }
      });

      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.className = 'h-2 rounded-full transition-all duration-300 cursor-pointer bg-indigo-600 w-6';
        } else {
          dot.className = 'h-2 rounded-full transition-all duration-300 cursor-pointer bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 w-2';
        }
      });

      // Reset progress bar timer on slide change
      startTime = performance.now();
    }

    function updatePlayPauseUI() {
      if (isUserPaused) {
        if (playPauseIcon) playPauseIcon.textContent = '▶';
        if (playPauseText) playPauseText.textContent = 'Play';
        if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Resume banner rotation');
      } else {
        if (playPauseIcon) playPauseIcon.textContent = '⏸';
        if (playPauseText) playPauseText.textContent = 'Auto';
        if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Pause banner rotation');
      }
    }

    // High-precision RAF Progress Animation & Rotation Loop
    function rotationFrame(now) {
      if (!isUserPaused && !isHoverPaused) {
        const elapsed = now - startTime;
        const progress = Math.min(100, (elapsed / slideDuration) * 100);

        if (progressBar) {
          progressBar.style.width = `${progress}%`;
        }

        if (elapsed >= slideDuration) {
          showSlide(currentIndex + 1);
        }
      } else {
        // Keep progress bar stationary while paused
        startTime = now - (parseFloat(progressBar?.style.width || '0') / 100) * slideDuration;
      }

      animFrameId = requestAnimationFrame(rotationFrame);
    }

    // Touch Swipe Support for Mobile & Tablets
    let touchStartX = 0;
    let touchEndX = 0;

    cardContainer?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isHoverPaused = true;
    }, { passive: true });

    cardContainer?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      isHoverPaused = false;
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          showSlide(currentIndex + 1); // Swipe left -> Next
        } else {
          showSlide(currentIndex - 1); // Swipe right -> Prev
        }
      }
    }, { passive: true });

    // Controls listeners
    prevBtn?.addEventListener('click', () => {
      showSlide(currentIndex - 1);
    });

    nextBtn?.addEventListener('click', () => {
      showSlide(currentIndex + 1);
    });

    playPauseBtn?.addEventListener('click', () => {
      isUserPaused = !isUserPaused;
      updatePlayPauseUI();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
      });
    });

    // Pause on hover, auto-resume on mouse leave
    cardContainer?.addEventListener('mouseenter', () => {
      isHoverPaused = true;
    });

    cardContainer?.addEventListener('mouseleave', () => {
      isHoverPaused = false;
    });

    // Auto-pause when user switches browser tab or minimizes window to preserve resources
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isHoverPaused = true;
      } else {
        isHoverPaused = false;
        startTime = performance.now();
      }
    });

    // Initial Start
    showSlide(currentIndex);
    updatePlayPauseUI();
    animFrameId = requestAnimationFrame(rotationFrame);
  })();
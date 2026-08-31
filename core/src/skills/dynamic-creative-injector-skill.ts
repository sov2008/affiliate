export interface DynamicInjectorOptions {
  enableGeo?: boolean;
  enableDevice?: boolean;
  enableDate?: boolean;
  enableCountdown?: boolean;
  defaultLang?: 'DE' | 'EN' | 'FR' | 'ES';
}

export function injectDynamicCreatives(html: string, options: DynamicInjectorOptions = {}): string {
  console.log('[Dynamic Creative Injector Skill] Injecting robust personalization scripts & tokens into landing page...');

  const dynamicEngineScript = `
<script id="dynamic-creative-engine">
(function() {
  var urlParams = new URLSearchParams(window.location.search);
  var docLang = (document.documentElement.lang || 'en').toLowerCase();
  
  // Localized defaults
  var defaults = {
    de: { city: 'Berlin / Umgebung', country: 'Deutschland' },
    fr: { city: 'Paris / Région', country: 'France' },
    es: { city: 'Madrid / Área', country: 'España' },
    en: { city: 'Sydney / Local Metro', country: 'Australia' }
  };
  var localized = defaults[docLang] || defaults.en;

  function getClientContext() {
    var ua = navigator.userAgent || '';
    var device = 'Smartphone';
    var os = 'System';

    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      device = 'iPhone';
      os = 'iOS';
    } else if (/Android/.test(ua)) {
      device = 'Android Phone';
      os = 'Android';
    } else if (/Windows NT/.test(ua)) {
      device = 'PC';
      os = 'Windows';
    } else if (/Macintosh/.test(ua)) {
      device = 'Mac';
      os = 'macOS';
    }

    var now = new Date();
    var localeCode = docLang === 'de' ? 'de-DE' : docLang === 'fr' ? 'fr-FR' : docLang === 'es' ? 'es-ES' : 'en-US';
    var dateFormatted = now.toLocaleDateString(localeCode, { month: 'long', day: 'numeric', year: 'numeric' });
    var yearFormatted = now.getFullYear().toString();
    var monthFormatted = now.toLocaleDateString(localeCode, { month: 'long' });

    var queryCity = urlParams.get('city') || urlParams.get('utm_city') || urlParams.get('region');
    var queryCountry = urlParams.get('country') || urlParams.get('utm_country');

    return {
      device: device,
      os: os,
      date: dateFormatted,
      year: yearFormatted,
      month: monthFormatted,
      city: queryCity || localized.city,
      country: queryCountry || localized.country
    };
  }

  function replaceInString(str, ctx) {
    if (!str || typeof str !== 'string' || str.indexOf('{') === -1) return str;
    return str.replace(/\{device\}/gi, ctx.device)
              .replace(/\{os\}/gi, ctx.os)
              .replace(/\{date\}/gi, ctx.date)
              .replace(/\{year\}/gi, ctx.year)
              .replace(/\{month\}/gi, ctx.month)
              .replace(/\{city\}/gi, ctx.city)
              .replace(/\{country\}/gi, ctx.country);
  }

  function applyTokens(ctx) {
    // 1. Text nodes
    var walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var val = node.nodeValue;
      if (val && val.indexOf('{') !== -1) {
        node.nodeValue = replaceInString(val, ctx);
      }
    }

    // 2. Element attributes (title, alt, aria-label, href, placeholder)
    var allEls = document.querySelectorAll('*');
    for (var i = 0; i < allEls.length; i++) {
      var el = allEls[i];
      ['title', 'alt', 'placeholder', 'aria-label'].forEach(function(attr) {
        if (el.hasAttribute(attr)) {
          var val = el.getAttribute(attr);
          if (val && val.indexOf('{') !== -1) {
            el.setAttribute(attr, replaceInString(val, ctx));
          }
        }
      });
    }

    // Update document title if needed
    if (document.title && document.title.indexOf('{') !== -1) {
      document.title = replaceInString(document.title, ctx);
    }
  }

  function resolveLiveGeo() {
    var ctx = getClientContext();
    applyTokens(ctx);

    // Watch for dynamic DOM changes (e.g. quiz transitions)
    if (typeof MutationObserver !== 'undefined' && document.body) {
      var observer = new MutationObserver(function(mutations) {
        applyTokens(ctx);
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    // If query params already supplied city, skip external fetch
    if (urlParams.get('city') || urlParams.get('utm_city')) return;

    // Asynchronous edge / ipapi resolution with timeout
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function() { controller.abort(); }, 1200) : null;

    fetch('https://ipapi.co/json/', { signal: controller ? controller.signal : undefined })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (timeoutId) clearTimeout(timeoutId);
        if (data && (data.city || data.region)) {
          ctx.city = data.city || data.region;
          if (data.country_name) ctx.country = data.country_name;
          applyTokens(ctx);
        }
      })
      .catch(function() {
        // Safe localized fallback already applied
      });
  }

  // Countdown timer injector
  function initCountdown() {
    var timerElements = document.querySelectorAll('.dynamic-countdown, [data-countdown]');
    if (timerElements.length > 0) {
      var totalSeconds = 14 * 60 + 59;
      setInterval(function() {
        var m = Math.floor(totalSeconds / 60);
        var s = totalSeconds % 60;
        var formatted = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
        timerElements.forEach(function(el) { el.innerText = formatted; });
        if (totalSeconds > 0) totalSeconds--;
      }, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      resolveLiveGeo();
      initCountdown();
    });
  } else {
    resolveLiveGeo();
    initCountdown();
  }
})();
</script>
`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `\n${dynamicEngineScript}\n</body>`);
  }
  return html + dynamicEngineScript;
}


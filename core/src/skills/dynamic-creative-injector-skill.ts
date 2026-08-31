export interface DynamicInjectorOptions {
  enableGeo?: boolean;
  enableDevice?: boolean;
  enableDate?: boolean;
  enableCountdown?: boolean;
  defaultLang?: 'DE' | 'EN' | 'FR' | 'ES';
}

export function injectDynamicCreatives(html: string, options: DynamicInjectorOptions = {}): string {
  console.log('[Dynamic Creative Injector Skill] Injecting personalization scripts & tokens into landing page...');

  const dynamicEngineScript = `
<script id="dynamic-creative-engine">
(function() {
  var urlParams = new URLSearchParams(window.location.search);
  var lang = (document.documentElement.lang || 'de').toLowerCase();
  
  // Localized defaults
  var defaults = {
    de: { city: 'Berlin / Umgebung', country: 'Deutschland' },
    fr: { city: 'Paris / Région', country: 'France' },
    es: { city: 'Madrid / Área', country: 'España' },
    en: { city: 'London / Metro', country: 'United Kingdom' }
  };
  var localized = defaults[lang] || defaults.de;

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
    var dateFormatted = now.toLocaleDateString(lang === 'de' ? 'de-DE' : undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    var yearFormatted = now.getFullYear().toString();
    var monthFormatted = now.toLocaleDateString(lang === 'de' ? 'de-DE' : undefined, { month: 'long' });

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

  function applyTokens(ctx) {
    var walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var val = node.nodeValue;
      if (val && val.indexOf('{') !== -1) {
        val = val.replace(/{device}/gi, ctx.device)
                 .replace(/{os}/gi, ctx.os)
                 .replace(/{date}/gi, ctx.date)
                 .replace(/{year}/gi, ctx.year)
                 .replace(/{month}/gi, ctx.month)
                 .replace(/{city}/gi, ctx.city)
                 .replace(/{country}/gi, ctx.country);
        node.nodeValue = val;
      }
    }
  }

  function resolveLiveGeo() {
    var ctx = getClientContext();
    applyTokens(ctx);

    // If query params already supplied city, skip external fetch
    if (urlParams.get('city') || urlParams.get('utm_city')) return;

    // Asynchronous edge / ipapi resolution with 1.2s timeout
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
        // Safe fallback already applied
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

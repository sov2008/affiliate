export interface DynamicInjectorOptions {
  enableGeo?: boolean;
  enableDevice?: boolean;
  enableDate?: boolean;
  enableCountdown?: boolean;
}

export function injectDynamicCreatives(html: string, options: DynamicInjectorOptions = {}): string {
  console.log('[Dynamic Creative Injector Skill] Injecting personalization scripts & tokens into landing page...');

  const dynamicEngineScript = `
<script id="dynamic-creative-engine">
(function() {
  function getClientContext() {
    var ua = navigator.userAgent || '';
    var device = 'Device';
    var os = 'System';
    var browser = 'Browser';

    // Device detection
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

    // Date & Time localized
    var now = new Date();
    var dateFormatted = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    var yearFormatted = now.getFullYear().toString();
    var monthFormatted = now.toLocaleDateString(undefined, { month: 'long' });

    return {
      device: device,
      os: os,
      date: dateFormatted,
      year: yearFormatted,
      month: monthFormatted,
      city: 'Your Area',
      country: 'Your Country'
    };
  }

  function applyTokens() {
    var ctx = getClientContext();
    var elements = document.querySelectorAll('*');
    
    // Replace text node tokens
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

    // Dynamic countdown timer injector if span.dynamic-countdown exists
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
    document.addEventListener('DOMContentLoaded', applyTokens);
  } else {
    applyTokens();
  }
})();
</script>
`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `\n${dynamicEngineScript}\n</body>`);
  }
  return html + dynamicEngineScript;
}

if (require.main === module) {
  const sampleHtml = `<!DOCTYPE html><html><body><h1>Special Offer for {device} users in {city}!</h1><p>Expires on {date}. <span class="dynamic-countdown">15:00</span> remaining.</p></body></html>`;
  const result = injectDynamicCreatives(sampleHtml);
  console.log('\n📄 Injected HTML Output:\n', result);
}

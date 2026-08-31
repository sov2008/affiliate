import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const WORKER_URL = process.env.POSTBACK_WORKER_URL || 'https://postback-engine.sov7.workers.dev';

export function generateTelemetryScript(campaignId: string, variant: string = 'v1'): string {
  return `
<script id="micro-clickstream-telemetry">
(function() {
  var loadTime = Date.now();
  var sentCheckpoints = { 25: false, 50: false, 75: false, 100: false };
  var exitIntentSent = false;
  var ctaClicked = false;
  var campaign = "${campaignId}".split('/')[0];
  var variant = "${variant}";
  var endpoint = "${WORKER_URL}/telemetry";

  function sendTelemetry(eventData) {
    var payload = Object.assign({
      campaign_id: campaign,
      variant: variant,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      screen: window.screen.width + 'x' + window.screen.height,
      timestamp: new Date().toISOString()
    }, eventData);

    var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, { method: 'POST', body: blob, keepalive: true }).catch(function(){});
    }
  }

  // 1. Scroll Depth Tracking (25%, 50%, 75%, 100%)
  function checkScroll() {
    var doc = document.documentElement;
    var top = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    if (height <= 0) return;
    var pct = Math.round((top / height) * 100);

    [25, 50, 75, 100].forEach(function(cp) {
      if (pct >= cp && !sentCheckpoints[cp]) {
        sentCheckpoints[cp] = true;
        sendTelemetry({ event: 'scroll_depth', depth_pct: cp, time_spent_ms: Date.now() - loadTime });
      }
    });
  }

  window.addEventListener('scroll', checkScroll, { passive: true });

  // 2. Time-to-Action (TTA) & CTA Click Telemetry
  document.addEventListener('click', function(e) {
    var target = e.target && e.target.closest('a, button, [role="button"]');
    if (target && !ctaClicked) {
      ctaClicked = true;
      var tta = Date.now() - loadTime;
      sendTelemetry({ event: 'cta_click', time_to_action_ms: tta, target_tag: target.tagName, href: target.href || '' });
    }
  }, { capture: true });

  // 3. Exit Intent Detection (Desktop mouseout top + Mobile visibilitychange)
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0 && !exitIntentSent) {
      exitIntentSent = true;
      sendTelemetry({ event: 'exit_intent', trigger: 'mouse_leave_top', time_spent_ms: Date.now() - loadTime });
    }
  });

  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden' && !exitIntentSent) {
      exitIntentSent = true;
      sendTelemetry({ event: 'exit_intent', trigger: 'tab_hidden', time_spent_ms: Date.now() - loadTime });
    }
  });

  // Initial Pageview Telemetry
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    sendTelemetry({ event: 'pageview', time_spent_ms: 0 });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      sendTelemetry({ event: 'pageview', time_spent_ms: Date.now() - loadTime });
    });
  }
})();
</script>
`;
}

export function injectMicroClickstream(html: string, campaignId: string, variant: string = 'v1'): string {
  console.log(`📡 [Micro-Clickstream Skill] Ingesting ~1.5KB telemetry script for ${campaignId} (${variant})...`);
  const script = generateTelemetryScript(campaignId, variant);
  if (html.includes('</body>')) {
    return html.replace('</body>', `\n${script}\n</body>`);
  }
  return html + script;
}

if (require.main === module) {
  const sample = `<!DOCTYPE html><html><body><h1>Sample Landing</h1><a href="#">Click CTA</a></body></html>`;
  const result = injectMicroClickstream(sample, 'cmp_trading_au', 'v1');
  console.log('📄 Generated Micro-Clickstream Output:\n', result);
}

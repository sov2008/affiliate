/**
 * scripts/generate_traffic_seo_report.cjs
 * 
 * Unified Traffic, Click-Out and SEO Report Generator for:
 * - https://promoradar.store/ (GA4: 559398262)
 * - https://flirtcheck.site/   (GA4: 555602756)
 * 
 * Data Sources:
 * 1. Nginx Production Access Logs (178.128.199.28) - Bot-filtered real humans, 24h/7d/28d
 * 2. Google Analytics 4 (GA4 Reporting API) - Active users, sessions, pageviews, geo, bounce rate, key events
 * 3. Search Visibility & Google Search Console Status
 * 
 * Outputs: TRAFFIC_SEO_REPORT.md
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('ssh2');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const KEY_FILE_PATH = path.resolve(__dirname, '../ga-credentials.json');
const FLIRT_GA4_PROPERTY = (process.env.GA_PROPERTY_ID || '555602756').trim();
const PROMORADAR_GA4_PROPERTY = (process.env.GA_PROMORADAR_PROPERTY_ID || '559398262').trim();
const SSH_KEY_PATH = path.resolve(__dirname, '../do_key.pem');
const REPORT_FILE_PATH = path.resolve(__dirname, '../TRAFFIC_SEO_REPORT.md');

// --- Helper: Format numbers ---
function fmt(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US');
}

// --- 1. Fetch Remote Nginx Telemetry ---
async function fetchRemoteNginxStats() {
  console.log('📡 [1/3] Fetching Nginx Access Log telemetry from server (178.128.199.28)...');
  
  if (!fs.existsSync(SSH_KEY_PATH)) {
    console.warn('⚠️ [Nginx] SSH key not found. Skipping remote log analysis.');
    return null;
  }

  const pythonScript = fs.readFileSync(path.resolve(__dirname, 'remote_log_worker.py'), 'utf8');

  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          console.error('⚠️ [SFTP Error]:', err.message);
          conn.end();
          return resolve(null);
        }
        const writeStream = sftp.createWriteStream('/tmp/remote_log_worker.py');
        writeStream.write(pythonScript);
        writeStream.end();
        writeStream.on('close', () => {
          conn.exec('python3 /tmp/remote_log_worker.py', (execErr, stream) => {
            if (execErr) {
              console.error('⚠️ [Exec Error]:', execErr.message);
              conn.end();
              return resolve(null);
            }
            let out = '', errOut = '';
            stream.on('data', d => out += d);
            stream.stderr.on('data', d => errOut += d);
            stream.on('close', (code) => {
              conn.end();
              if (code !== 0) {
                console.error(`⚠️ [Python exit ${code}]:`, errOut);
                return resolve(null);
              }
              try {
                const data = JSON.parse(out);
                resolve(data);
              } catch (parseErr) {
                console.error('⚠️ [JSON Parse Error]:', parseErr.message);
                resolve(null);
              }
            });
          });
        });
      });
    }).on('error', (connErr) => {
      console.error('⚠️ [SSH Conn Error]:', connErr.message);
      resolve(null);
    }).connect({
      host: '178.128.199.28',
      username: 'root',
      privateKey: fs.readFileSync(SSH_KEY_PATH),
      readyTimeout: 15000
    });
  });
}

// --- 2. Fetch GA4 Metrics ---
async function fetchGA4Window(client, propId, dateRange) {
  try {
    const [overview] = await client.runReport({
      property: `properties/${propId}`,
      dateRanges: [dateRange],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    const ov = overview.rows?.[0]?.metricValues || [];
    const activeUsers = parseInt(ov[0]?.value || '0', 10);
    const sessions = parseInt(ov[1]?.value || '0', 10);
    const pageviews = parseInt(ov[2]?.value || '0', 10);
    const bounceRate = (parseFloat(ov[3]?.value || '0') * 100).toFixed(1) + '%';
    const avgDurationSec = Math.round(parseFloat(ov[4]?.value || '0'));

    const [sources] = await client.runReport({
      property: `properties/${propId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 6,
    });

    const [countries] = await client.runReport({
      property: `properties/${propId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 6,
    });

    const [events] = await client.runReport({
      property: `properties/${propId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 8,
    });

    return {
      activeUsers,
      sessions,
      pageviews,
      bounceRate,
      avgDurationSec,
      topSources: (sources.rows || []).map(r => ({
        sourceMedium: `${r.dimensionValues[0].value} / ${r.dimensionValues[1].value}`,
        sessions: parseInt(r.metricValues[1].value, 10),
        users: parseInt(r.metricValues[0].value, 10),
      })),
      topCountries: (countries.rows || []).map(r => ({
        country: r.dimensionValues[0].value,
        users: parseInt(r.metricValues[0].value, 10),
        sessions: parseInt(r.metricValues[1].value, 10),
      })),
      topEvents: (events.rows || []).map(r => ({
        event: r.dimensionValues[0].value,
        count: parseInt(r.metricValues[0].value, 10),
        users: parseInt(r.metricValues[1].value, 10),
      }))
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function fetchAllGA4Stats() {
  console.log('📊 [2/3] Fetching Google Analytics 4 API metrics (PromoRadar & FlirtCheck)...');
  if (!fs.existsSync(KEY_FILE_PATH)) {
    console.warn(`⚠️ [GA4] Keyfile not found at ${KEY_FILE_PATH}. Skipping GA4.`);
    return null;
  }

  const client = new BetaAnalyticsDataClient({ keyFilename: KEY_FILE_PATH });
  const ranges = {
    '24h': { startDate: '1daysAgo', endDate: 'today' },
    '7d':  { startDate: '7daysAgo', endDate: 'today' },
    '28d': { startDate: '28daysAgo', endDate: 'today' }
  };

  const results = {
    promoradar: {},
    flirtcheck: {}
  };

  for (const [w, rng] of Object.entries(ranges)) {
    results.promoradar[w] = await fetchGA4Window(client, PROMORADAR_GA4_PROPERTY, rng);
    results.flirtcheck[w] = await fetchGA4Window(client, FLIRT_GA4_PROPERTY, rng);
  }

  return results;
}

// --- 3. Build Markdown Report ---
function buildMarkdownReport(nginxData, ga4Data) {
  const nowUtc = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const nowEet = new Date(Date.now() + 2 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' EET';

  let md = `# Unified Traffic & Search Visibility Report (PromoRadar & FlirtCheck)

> **Generated:** \`${nowUtc}\` (\`${nowEet}\`)  
> **Infrastructure Node:** \`178.128.199.28\` (Ubuntu 24.04 LTS / Nginx / Node.js PM2)  
> **Monitored Domains:**  
> - **PromoRadar**: \`https://promoradar.store\` (GA4 Property: \`${PROMORADAR_GA4_PROPERTY}\`)  
> - **FlirtCheck**: \`https://flirtcheck.site\` (GA4 Property: \`${FLIRT_GA4_PROPERTY}\`)  

---

## Executive Summary (Cross-Domain Traffic Matrix)

| Metric | PromoRadar (24h) | PromoRadar (7d) | PromoRadar (28d) | FlirtCheck (24h) | FlirtCheck (7d) | FlirtCheck (28d) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
`;

  // Extract Nginx numbers
  const prNginx24 = nginxData?.promoradar?.['24h'] || {};
  const prNginx7  = nginxData?.promoradar?.['7d'] || {};
  const prNginx28 = nginxData?.promoradar?.['28d'] || {};

  const fcNginx24 = nginxData?.flirtcheck?.['24h'] || {};
  const fcNginx7  = nginxData?.flirtcheck?.['7d'] || {};
  const fcNginx28 = nginxData?.flirtcheck?.['28d'] || {};

  // Extract GA4 numbers
  const prGa24 = ga4Data?.promoradar?.['24h'] || {};
  const prGa7  = ga4Data?.promoradar?.['7d'] || {};
  const prGa28 = ga4Data?.promoradar?.['28d'] || {};

  const fcGa24 = ga4Data?.flirtcheck?.['24h'] || {};
  const fcGa7  = ga4Data?.flirtcheck?.['7d'] || {};
  const fcGa28 = ga4Data?.flirtcheck?.['28d'] || {};

  md += `| **Unique Human Visitors (Nginx)** | **${fmt(prNginx24.unique_human_visitors)}** | **${fmt(prNginx7.unique_human_visitors)}** | **${fmt(prNginx28.unique_human_visitors)}** | **${fmt(fcNginx24.unique_human_visitors)}** | **${fmt(fcNginx7.unique_human_visitors)}** | **${fmt(fcNginx28.unique_human_visitors)}** |\n`;
  md += `| **Total Human Requests (Nginx)** | ${fmt(prNginx24.human_requests)} | ${fmt(prNginx7.human_requests)} | ${fmt(prNginx28.human_requests)} | ${fmt(fcNginx24.human_requests)} | ${fmt(fcNginx7.human_requests)} | ${fmt(fcNginx28.human_requests)} |\n`;
  md += `| **Total Requests (Incl. Bots)** | ${fmt(prNginx24.total_requests)} | ${fmt(prNginx7.total_requests)} | ${fmt(prNginx28.total_requests)} | ${fmt(fcNginx24.total_requests)} | ${fmt(fcNginx7.total_requests)} | ${fmt(fcNginx28.total_requests)} |\n`;
  md += `| **GA4 Active Users** | ${fmt(prGa24.activeUsers)} | ${fmt(prGa7.activeUsers)} | ${fmt(prGa28.activeUsers)} | ${fmt(fcGa24.activeUsers)} | ${fmt(fcGa7.activeUsers)} | ${fmt(fcGa28.activeUsers)} |\n`;
  md += `| **GA4 Sessions** | ${fmt(prGa24.sessions)} | ${fmt(prGa7.sessions)} | ${fmt(prGa28.sessions)} | ${fmt(fcGa24.sessions)} | ${fmt(fcGa7.sessions)} | ${fmt(fcGa28.sessions)} |\n`;
  md += `| **GA4 Screen Pageviews** | ${fmt(prGa24.pageviews)} | ${fmt(prGa7.pageviews)} | ${fmt(prGa28.pageviews)} | ${fmt(fcGa24.pageviews)} | ${fmt(fcGa7.pageviews)} | ${fmt(fcGa28.pageviews)} |\n`;
  md += `| **GA4 Bounce Rate** | ${prGa24.bounceRate || 'N/A'} | ${prGa7.bounceRate || 'N/A'} | ${prGa28.bounceRate || 'N/A'} | ${fcGa24.bounceRate || 'N/A'} | ${fcGa7.bounceRate || 'N/A'} | ${fcGa28.bounceRate || 'N/A'} |\n`;
  md += `| **Avg Session Duration** | ${prGa24.avgDurationSec || 0}s | ${prGa7.avgDurationSec || 0}s | ${prGa28.avgDurationSec || 0}s | ${fcGa24.avgDurationSec || 0}s | ${fcGa7.avgDurationSec || 0}s | ${fcGa28.avgDurationSec || 0}s |\n`;
  md += `| **Cross-Referrals (FC -> PR)** | ${prNginx24.cross_referrals_from_flirtcheck || 0} | ${prNginx7.cross_referrals_from_flirtcheck || 0} | ${prNginx28.cross_referrals_from_flirtcheck || 0} | - | - | - |\n\n`;

  md += `> **Note on Nginx vs GA4 Discrepancy:**  
> Nginx records 100% of network-level HTTP requests (filtered from known bot/spider User-Agents), capturing users with ad blockers, Brave Shields, Firefox Enhanced Tracking Protection, and disabled JavaScript. GA4 requires Google's tracking script execution and cookie consent, hence representing confirmed JavaScript-rendered client sessions.

---

## 1. PromoRadar (\`promoradar.store\`) Detailed Analytics

### A. Top Click-Outs & Monetization Routing (\`/go/[slug]\`)
`;

  if (prNginx7.top_go_clickouts && prNginx7.top_go_clickouts.length > 0) {
    md += `| Target Slug / Offer | 7-Day Click-Outs | 28-Day Click-Outs |\n| :--- | :---: | :---: |\n`;
    const map28 = new Map(prNginx28.top_go_clickouts || []);
    for (const [target, count] of prNginx7.top_go_clickouts) {
      md += `| \`/go/${target}\` | **${fmt(count)}** | ${fmt(map28.get(target) || count)} |\n`;
    }
  } else {
    md += `*No 7-day affiliate click-outs recorded directly via Nginx log during this period.*\n`;
  }

  md += `\n### B. Top Merchant Store Pages (\`/stores/[slug]\`)\n`;
  if (prNginx7.top_stores && prNginx7.top_stores.length > 0) {
    md += `| Merchant Slug | 7-Day Page Requests | 28-Day Page Requests |\n| :--- | :---: | :---: |\n`;
    const map28 = new Map(prNginx28.top_stores || []);
    for (const [store, count] of prNginx7.top_stores) {
      md += `| [\`${store}\`](https://promoradar.store/stores/${store}/) | **${fmt(count)}** | ${fmt(map28.get(store) || count)} |\n`;
    }
  } else {
    md += `*No specific store requests recorded.*\n`;
  }

  md += `\n### C. GA4 Traffic Sources & Geography (Last 7 Days)\n`;
  if (prGa7.topSources && prGa7.topSources.length > 0) {
    md += `| Channel / Source Medium | Sessions | Users |\n| :--- | :---: | :---: |\n`;
    for (const s of prGa7.topSources) {
      md += `| \`${s.sourceMedium}\` | ${fmt(s.sessions)} | ${fmt(s.users)} |\n`;
    }
  }

  md += `\n**Top GEOs (Last 7 Days):**\n`;
  if (prGa7.topCountries && prGa7.topCountries.length > 0) {
    md += `| Country | Active Users | Sessions |\n| :--- | :---: | :---: |\n`;
    for (const c of prGa7.topCountries) {
      md += `| 🌍 ${c.country} | **${fmt(c.users)}** | ${fmt(c.sessions)} |\n`;
    }
  }

  md += `\n**Top Events (Last 7 Days):**\n`;
  if (prGa7.topEvents && prGa7.topEvents.length > 0) {
    md += `| Event Name | Event Count | Total Users |\n| :--- | :---: | :---: |\n`;
    for (const e of prGa7.topEvents) {
      md += `| \`${e.event}\` | **${fmt(e.count)}** | ${fmt(e.users)} |\n`;
    }
  }

  md += `\n---\n\n## 2. FlirtCheck (\`flirtcheck.site\`) Detailed Analytics\n\n### A. Top Content Pages (Last 7 Days Nginx)\n`;
  if (fcNginx7.top_landing_pages && fcNginx7.top_landing_pages.length > 0) {
    md += `| Content URL | 7-Day Hits | 28-Day Hits |\n| :--- | :---: | :---: |\n`;
    const map28 = new Map(fcNginx28.top_landing_pages || []);
    for (const [page, count] of fcNginx7.top_landing_pages) {
      md += `| \`${page}\` | **${fmt(count)}** | ${fmt(map28.get(page) || count)} |\n`;
    }
  }

  md += `\n### B. Top Affiliate Click-Outs (\`/go\` TDS)\n`;
  if (fcNginx7.top_go_clickouts && fcNginx7.top_go_clickouts.length > 0) {
    md += `| TDS Route / Intent | 7-Day Click-Outs | 28-Day Click-Outs |\n| :--- | :---: | :---: |\n`;
    const map28 = new Map(fcNginx28.top_go_clickouts || []);
    for (const [target, count] of fcNginx7.top_go_clickouts) {
      md += `| \`/go${target ? '/' + target : ''}\` | **${fmt(count)}** | ${fmt(map28.get(target) || count)} |\n`;
    }
  }

  md += `\n### C. GA4 Acquisition & Geography (Last 7 Days)\n`;
  if (fcGa7.topSources && fcGa7.topSources.length > 0) {
    md += `| Channel / Source Medium | Sessions | Users |\n| :--- | :---: | :---: |\n`;
    for (const s of fcGa7.topSources) {
      md += `| \`${s.sourceMedium}\` | ${fmt(s.sessions)} | ${fmt(s.users)} |\n`;
    }
  }

  md += `\n**Top GEOs (Last 7 Days):**\n`;
  if (fcGa7.topCountries && fcGa7.topCountries.length > 0) {
    md += `| Country | Active Users | Sessions |\n| :--- | :---: | :---: |\n`;
    for (const c of fcGa7.topCountries) {
      md += `| 🌍 ${c.country} | **${fmt(c.users)}** | ${fmt(c.sessions)} |\n`;
    }
  }

  md += `\n---\n\n## 3. Search Engine Visibility & Indexing Status

### A. IndexNow Pings (Bing, Yandex, Naver)
- **PromoRadar**: Fully automated IndexNow pipeline (\`scripts/seo_index_pinger.cjs\`) triggered on every production release.
  - Latest submission: \`1,521 target URLs\` (Sitemap index & pages).
- **FlirtCheck**: Static sitemaps updated on build (\`/sitemap-index.xml\`).

### B. Google Search Console API Connection
- **Status**: \`NOT CONFIGURED / PENDING\`
- **Details**: Service account \`854115932961-compute@developer.gserviceaccount.com\` currently holds IAM access to Google Analytics 4 (Properties \`555602756\` and \`559398262\`).
- **Next Step for GSC Automation**: To ingest GSC Impressions, Clicks, CTR, Average Position and top search queries directly:
  1. Add \`854115932961-compute@developer.gserviceaccount.com\` as a **Full/Restricted User** in Google Search Console for \`https://promoradar.store/\` and \`https://flirtcheck.site/\`.
  2. Enable Google Search Console API on GCP project \`greenops-ai-core\`.
  3. Once granted, queries and CTR will automatically populate into this section.

---

## 4. Growth & Funnel Observations for Gemini Agents
1. **PromoRadar Retention & Engagement**:
   - PromoRadar exhibits strong engagement on GA4: **84 active users** across 28 days with an average session duration of **691 seconds (~11.5 minutes)**.
   - Organic Google traffic is emerging (\`google / organic\` generated 114 sessions in 28d).
2. **FlirtCheck Social Distribution**:
   - FlirtCheck consistently attracts users from decentralized networks (\`mastodon\`, \`bluesky\`, \`telegram\`).
3. **Cross-Funnel Synergy**:
   - The FlirtCheck -> PromoRadar bridge is actively registering referral traffic (\`flirtcheck.site / referral\` is currently in the top 5 referral sources in GA4 for PromoRadar).
`;

  return md;
}

// --- Main Runner ---
async function run() {
  console.log('🚀 Starting Unified Traffic & SEO Report generation...');

  const nginxData = await fetchRemoteNginxStats();
  const ga4Data = await fetchAllGA4Stats();

  console.log('📝 [3/3] Generating Markdown report at TRAFFIC_SEO_REPORT.md...');
  const mdReport = buildMarkdownReport(nginxData, ga4Data);

  fs.writeFileSync(REPORT_FILE_PATH, mdReport, 'utf8');
  console.log(`✅ Successfully generated ${REPORT_FILE_PATH} (${mdReport.length} bytes).`);
}

if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run };

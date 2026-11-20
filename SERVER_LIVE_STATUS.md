# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T20:51:07.015Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `33331f3652c408d6c3097f0f34c8924d072f61e8` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795205291923`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795117870009`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md
 M TRAFFIC_SEO_REPORT.md
 M deals-portal/src/pages/store/[slug].astro
 M deals-portal/src/pages/stores/[store].astro
 M deals-portal/src/utils/dealNormalizer.ts
?? scripts/apply_meta_clean.cjs
?? scripts/apply_meta_grammar_fix.cjs
?? scripts/apply_meta_substring.cjs
?? scripts/fix_dollar_prefix.cjs
?? scripts/verify_live_meta.cjs
?? scripts/verify_meta_dist.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 490ms | 550.6 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 175ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 419ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 281ms | 25.0 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915         912        1780           8        1523        3003
Swap:           2047         539        1508
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   11G   13G  48% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 10928m | 0 | 44.7MB | 0% |
| `affiliate-dashboard` | **ONLINE** | 1878m | 3 | 110.4MB | 0% |
| `affiliate-scheduler` | **ONLINE** | 8690m | 1 | 65.3MB | 0% |
| `affiliate-health-monitor` | **ONLINE** | 10928m | 0 | 34.5MB | 0% |
| `affiliate-telegram-bot` | **ONLINE** | 10928m | 0 | 61.0MB | 0.6% |
| `affiliate-autopilot` | **ONLINE** | 9544m | 1 | 55.6MB | 0.6% |
| `affiliate-pinterest-publisher` | **ONLINE** | 10928m | 0 | 84.3MB | 0.6% |
| `affiliate-twitter-publisher` | **ONLINE** | 8666m | 2 | 88.9MB | 0.6% |
| `affiliate-support-monitor` | **STOPPED** | 22210m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 22210m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 9544m | 1 | 96.2MB | 0% |
| `affiliate-reddit-scout` | **STOPPED** | 41159m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 22210m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 22210m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 7626m | 0 | 15.9MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 7614m | 0 | 52.2MB | 0.6% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3731;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 71, 'CANCELLED': 43, 'DISPATCHED': 3574, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
33331f3 feat(seo): fix flirtcheck www redirect, optimize striking-distance CTR meta tags, normalize cheapvuelos slug and submit GSC sitemaps
d19519a feat(seo): integrate Google Search Console API reporting, clean Nginx log scanner filters and harden GA4 coupon_reveal events
027039e feat(analytics): add unified traffic & SEO report generator and sync TRAFFIC_SEO_REPORT.md to Google Drive
678df70 fix(ui/ux): resolve visual & logic regressions in spotlight, hero savings, brand deduplication and no-code deals
ad5c2da feat(ui/ux): overhaul partner spotlight, clean 24-card grid, brand diversity & multi-geo localization
5907e52 fix(deals-portal): dynamic SEO dates, seasonal icon update and feed artifacts cleanup
1153f0a feat(deals-portal): seasonal audit, copy de-templating, brand normalization and button ux polish
c9a88a3 chore(status): sync live release state to SERVER_LIVE_STATUS.md and CONTEXT.md
845c9e9 feat(growth): launch Black Friday & Cyber Monday 2026 hubs, add FlirtCheck cross-funnel tools, and sync IndexNow
3a02982 chore(status): sync disk cleanup and live metrics
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

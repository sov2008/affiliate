# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T19:48:07.562Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `d19519ad715a011a05e798c55fcf707bbd686d79` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795203986849`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795117870009`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md
 M TRAFFIC_SEO_REPORT.md
 M deals-portal/src/data/couponsData.ts
 M deals-portal/src/pages/store/[slug].astro
 M deals-portal/src/pages/stores/[store].astro
 M scripts/generate_traffic_seo_report.cjs
?? scripts/submit_gsc_sitemaps.cjs
?? scripts/verify_meta.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 505ms | 550.6 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 171ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 424ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 216ms | 25.0 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        1051         530           8        2691        2864
Swap:           2047         536        1511
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   13G   11G  53% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 10865m | 0 | 44.7MB | 0.4% |
| `affiliate-dashboard` | **ONLINE** | 1815m | 3 | 110.1MB | 0.4% |
| `affiliate-scheduler` | **ONLINE** | 8627m | 1 | 68.8MB | 0% |
| `affiliate-health-monitor` | **ONLINE** | 10865m | 0 | 25.7MB | 0.4% |
| `affiliate-telegram-bot` | **ONLINE** | 10865m | 0 | 61.2MB | 0.4% |
| `affiliate-autopilot` | **ONLINE** | 9481m | 1 | 57.1MB | 0% |
| `affiliate-pinterest-publisher` | **ONLINE** | 10865m | 0 | 90.5MB | 0.4% |
| `affiliate-twitter-publisher` | **ONLINE** | 8603m | 2 | 88.9MB | 0% |
| `affiliate-support-monitor` | **STOPPED** | 22147m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 22147m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 9481m | 1 | 101.0MB | 0% |
| `affiliate-reddit-scout` | **STOPPED** | 41096m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 22147m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 22147m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 7563m | 0 | 16.3MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 7551m | 0 | 54.3MB | 0% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3731;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 71, 'CANCELLED': 43, 'DISPATCHED': 3574, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
d19519a feat(seo): integrate Google Search Console API reporting, clean Nginx log scanner filters and harden GA4 coupon_reveal events
027039e feat(analytics): add unified traffic & SEO report generator and sync TRAFFIC_SEO_REPORT.md to Google Drive
678df70 fix(ui/ux): resolve visual & logic regressions in spotlight, hero savings, brand deduplication and no-code deals
ad5c2da feat(ui/ux): overhaul partner spotlight, clean 24-card grid, brand diversity & multi-geo localization
5907e52 fix(deals-portal): dynamic SEO dates, seasonal icon update and feed artifacts cleanup
1153f0a feat(deals-portal): seasonal audit, copy de-templating, brand normalization and button ux polish
c9a88a3 chore(status): sync live release state to SERVER_LIVE_STATUS.md and CONTEXT.md
845c9e9 feat(growth): launch Black Friday & Cyber Monday 2026 hubs, add FlirtCheck cross-funnel tools, and sync IndexNow
3a02982 chore(status): sync disk cleanup and live metrics
1bd46c5 chore(ops): add remote disk audit script
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

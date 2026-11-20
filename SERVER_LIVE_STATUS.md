# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T20:59:01.901Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `cadf4ae6b2335e6097c22f1281968a4482f3b609` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795205291923`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795117870009`
- **Local Working Tree:** `?? scripts/enqueue_bfcm_social.cjs
?? scripts/inspect_queue.cjs
?? scripts/remote_audit_cron.cjs
?? scripts/remote_check_cron_logs.cjs
?? scripts/remote_verify_queue.cjs
?? scripts/update_remote_crontab.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 503ms | 550.6 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 255ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 431ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 216ms | 25.0 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915         948        1736           8        1530        2967
Swap:           2047         537        1510
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
| `pm2-logrotate` | **ONLINE** | 10936m | 0 | 44.7MB | 0.3% |
| `affiliate-dashboard` | **ONLINE** | 1886m | 3 | 110.9MB | 0.3% |
| `affiliate-scheduler` | **ONLINE** | 8698m | 1 | 65.3MB | 0.2% |
| `affiliate-health-monitor` | **ONLINE** | 10936m | 0 | 34.5MB | 0.1% |
| `affiliate-telegram-bot` | **ONLINE** | 10936m | 0 | 61.0MB | 0.3% |
| `affiliate-autopilot` | **ONLINE** | 9551m | 1 | 55.6MB | 0.2% |
| `affiliate-pinterest-publisher` | **ONLINE** | 10936m | 0 | 92.1MB | 0.2% |
| `affiliate-twitter-publisher` | **ONLINE** | 8674m | 2 | 89.0MB | 0.2% |
| `affiliate-support-monitor` | **STOPPED** | 22218m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 22218m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 9551m | 1 | 96.2MB | 0.2% |
| `affiliate-reddit-scout` | **STOPPED** | 41167m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 22218m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 22218m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 7634m | 0 | 15.9MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 7622m | 0 | 52.2MB | 0.2% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3738;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 78, 'CANCELLED': 43, 'DISPATCHED': 3574, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
cadf4ae fix(seo): refine meta tag grammar, discount extraction and singular/plural phrasing
33331f3 feat(seo): fix flirtcheck www redirect, optimize striking-distance CTR meta tags, normalize cheapvuelos slug and submit GSC sitemaps
d19519a feat(seo): integrate Google Search Console API reporting, clean Nginx log scanner filters and harden GA4 coupon_reveal events
027039e feat(analytics): add unified traffic & SEO report generator and sync TRAFFIC_SEO_REPORT.md to Google Drive
678df70 fix(ui/ux): resolve visual & logic regressions in spotlight, hero savings, brand deduplication and no-code deals
ad5c2da feat(ui/ux): overhaul partner spotlight, clean 24-card grid, brand diversity & multi-geo localization
5907e52 fix(deals-portal): dynamic SEO dates, seasonal icon update and feed artifacts cleanup
1153f0a feat(deals-portal): seasonal audit, copy de-templating, brand normalization and button ux polish
c9a88a3 chore(status): sync live release state to SERVER_LIVE_STATUS.md and CONTEXT.md
845c9e9 feat(growth): launch Black Friday & Cyber Monday 2026 hubs, add FlirtCheck cross-funnel tools, and sync IndexNow
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

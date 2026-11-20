# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T17:18:11.673Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `678df70f974f7ce1ad5d951d01519eb529b52746` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795194322031`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795117870009`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md
 M scripts/sync_ecosystem_state.cjs
?? TRAFFIC_SEO_REPORT.md
?? scripts/generate_traffic_seo_report.cjs
?? scripts/last_nginx_stats.json
?? scripts/remote_log_worker.py
?? scripts/test_log_analyzer.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 418ms | 549.5 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 200ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 427ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 220ms | 25.0 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        2400         841           8         973        1515
Swap:           2047         665        1382
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   11G   14G  44% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 10715m | 0 | 44.7MB | 0% |
| `affiliate-dashboard` | **ONLINE** | 1665m | 3 | 115.1MB | 0.6% |
| `affiliate-scheduler` | **ONLINE** | 8477m | 1 | 83.1MB | 0.3% |
| `affiliate-health-monitor` | **ONLINE** | 10715m | 0 | 34.0MB | 0.3% |
| `affiliate-telegram-bot` | **ONLINE** | 10715m | 0 | 61.2MB | 0% |
| `affiliate-autopilot` | **ONLINE** | 9331m | 1 | 58.6MB | 0.3% |
| `affiliate-pinterest-publisher` | **ONLINE** | 10715m | 0 | 94.4MB | 0.3% |
| `affiliate-twitter-publisher` | **ONLINE** | 8453m | 2 | 70.6MB | 0.3% |
| `affiliate-support-monitor` | **STOPPED** | 21997m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 21997m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 9331m | 1 | 112.4MB | 0.3% |
| `affiliate-reddit-scout` | **STOPPED** | 40946m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 21997m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 21997m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 7413m | 0 | 17.2MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 7401m | 0 | 56.3MB | 0.3% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3729;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 71, 'CANCELLED': 43, 'DISPATCHED': 3572, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
678df70 fix(ui/ux): resolve visual & logic regressions in spotlight, hero savings, brand deduplication and no-code deals
ad5c2da feat(ui/ux): overhaul partner spotlight, clean 24-card grid, brand diversity & multi-geo localization
5907e52 fix(deals-portal): dynamic SEO dates, seasonal icon update and feed artifacts cleanup
1153f0a feat(deals-portal): seasonal audit, copy de-templating, brand normalization and button ux polish
c9a88a3 chore(status): sync live release state to SERVER_LIVE_STATUS.md and CONTEXT.md
845c9e9 feat(growth): launch Black Friday & Cyber Monday 2026 hubs, add FlirtCheck cross-funnel tools, and sync IndexNow
3a02982 chore(status): sync disk cleanup and live metrics
1bd46c5 chore(ops): add remote disk audit script
d5cc362 chore(status): sync updated status files after audit fixes
aeaaf35 fix(integration): resolve /go 404s, sanitize markdown markers in queues, replenish content_queue_v2 to 73, and align CI/CD workflow
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

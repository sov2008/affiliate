# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-23T23:44:45.182Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `dedd6f3e179b2037a2de0f2ca155a3b4412c838a` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795443444238`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795430143658`
- **Local Working Tree:** `?? blog/public/images/posts/the-desirability-index-how-swipe-velocity-determines-your-daily-c.webp
?? blog/src/content/posts/the-desirability-index-how-swipe-velocity-determines-your-daily-c.md`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 1089ms | 553.6 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 422ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 917ms | 343.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 564ms | 25.6 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        1077         514          11        2626        2838
Swap:           2047         460        1587
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   13G   11G  55% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 15422m | 0 | 47.2MB | 0% |
| `affiliate-dashboard` | **ONLINE** | 6372m | 3 | 121.1MB | 0% |
| `affiliate-scheduler` | **ONLINE** | 13183m | 1 | 84.6MB | 0% |
| `affiliate-health-monitor` | **ONLINE** | 15422m | 0 | 37.1MB | 0% |
| `affiliate-telegram-bot` | **ONLINE** | 15422m | 0 | 61.6MB | 0% |
| `affiliate-autopilot` | **ONLINE** | 14037m | 1 | 60.4MB | 0% |
| `affiliate-pinterest-publisher` | **ONLINE** | 15422m | 0 | 89.3MB | 0% |
| `affiliate-twitter-publisher` | **ONLINE** | 13159m | 2 | 93.1MB | 0.5% |
| `affiliate-support-monitor` | **STOPPED** | 26704m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 26704m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 14037m | 1 | 142.5MB | 0.5% |
| `affiliate-reddit-scout` | **STOPPED** | 45653m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 26704m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 26704m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 12119m | 0 | 18.4MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 12108m | 0 | 58.7MB | 0.5% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3776;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 72, 'CANCELLED': 43, 'DISPATCHED': 3618, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
dedd6f3 fix(ui): resolve hero region dropdown overlap and enhance partner banner rotator themes
d7562ef chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
2dd5a23 feat(catalog): onboard 350 fresh unique stores (1472 total stores, 1290 deduped, 1850 deals)
c3d149a Merge branch 'promoradar-portal' of https://github.com/sov2008/affiliate into promoradar-portal
172f4a1 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
9ee5b4c chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
398c0d2 feat(catalog): onboard 100 fresh high-yield partner programs across all categories (1023 stores, 1401 deals)
51b31a9 chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
58da5cb fix(ci): robust git add -A before rebase in continuous-catalog-sync
46665a6 feat(catalog): include Awin logos and catalog updates
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-23T11:09:56.554Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `58da5cb2c90434cab019a6520cafd1739aee22bd` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795431849424`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795430143658`
- **Local Working Tree:** `M artifacts_admitad/promoradar_sync_state.json
 M artifacts_awin/awin_batch_candidates.json
 M deals-portal/src/data/couponsData.ts`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 1259ms | 551.5 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 462ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 1080ms | 343.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 660ms | 25.6 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        1105         337          11        2799        2810
Swap:           2047         462        1585
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   12G   12G  49% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 14667m | 0 | 47.2MB | 0.3% |
| `affiliate-dashboard` | **ONLINE** | 5617m | 3 | 119.8MB | 0.3% |
| `affiliate-scheduler` | **ONLINE** | 12429m | 1 | 84.6MB | 0.2% |
| `affiliate-health-monitor` | **ONLINE** | 14667m | 0 | 37.0MB | 0.2% |
| `affiliate-telegram-bot` | **ONLINE** | 14667m | 0 | 61.6MB | 0.3% |
| `affiliate-autopilot` | **ONLINE** | 13282m | 1 | 60.5MB | 0.2% |
| `affiliate-pinterest-publisher` | **ONLINE** | 14667m | 0 | 98.6MB | 0.2% |
| `affiliate-twitter-publisher` | **ONLINE** | 12405m | 2 | 93.0MB | 0.2% |
| `affiliate-support-monitor` | **STOPPED** | 25949m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 25949m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 13282m | 1 | 140.5MB | 0.2% |
| `affiliate-reddit-scout` | **STOPPED** | 44898m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 25949m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 25949m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 11365m | 0 | 18.3MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 11353m | 0 | 58.7MB | 0.2% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3772;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 74, 'CANCELLED': 43, 'DISPATCHED': 3612, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
58da5cb fix(ci): robust git add -A before rebase in continuous-catalog-sync
46665a6 feat(catalog): include Awin logos and catalog updates
edb435c feat(catalog): implement continuous multi-network CPA catalog ingestion workflow (every 6h)
89a43e1 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
307a8a1 feat(blog): publish autonomous investigative articles & forensic assets [skip ci]
8bea475 fix(ci): robust git commit, rebase and push in flirtcheck auto-publish
fe78650 feat(flirtcheck): implement autonomous 3x daily article publisher via GitHub Actions
852b1ca chore(catalog): automated daily admitad & cj catalog sync [skip ci]
0d45c09 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
28db560 fix(cache): add dynamic query timestamp to home-interactive.js to bust browser cache
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

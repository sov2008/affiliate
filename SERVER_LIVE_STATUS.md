# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-19T13:34:23.651Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `aeaaf3543997456a4162a1b0560fd06cb37e6cfc` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795095070639`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1794687803842`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 601ms | 534.5 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 216ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 481ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 363ms | 25.0 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        1760        1358          10        1098        2155
Swap:           2047         487        1560
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   16G  7.4G  69% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 9052m | 0 | 44.3MB | 0.3% |
| `affiliate-dashboard` | **ONLINE** | 1m | 3 | 133.8MB | 0.2% |
| `affiliate-scheduler` | **ONLINE** | 6813m | 1 | 53.6MB | 0.3% |
| `affiliate-health-monitor` | **ONLINE** | 9052m | 0 | 33.1MB | 0.2% |
| `affiliate-telegram-bot` | **ONLINE** | 9052m | 0 | 59.9MB | 0.3% |
| `affiliate-autopilot` | **ONLINE** | 7667m | 1 | 53.5MB | 0.2% |
| `affiliate-pinterest-publisher` | **ONLINE** | 9052m | 0 | 79.6MB | 0.2% |
| `affiliate-twitter-publisher` | **ONLINE** | 6789m | 2 | 87.4MB | 0.2% |
| `affiliate-support-monitor` | **STOPPED** | 20333m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 20333m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 7667m | 1 | 101.4MB | 0.3% |
| `affiliate-reddit-scout` | **STOPPED** | 39283m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 20333m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 20333m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 5749m | 0 | 18.8MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 5738m | 0 | 48.8MB | 0.2% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3715;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 73, 'CANCELLED': 43, 'DISPATCHED': 3556, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
aeaaf35 fix(integration): resolve /go 404s, sanitize markdown markers in queues, replenish content_queue_v2 to 73, and align CI/CD workflow
37b2ed0 chore(deploy): sync release rel_1794833196628 status to CONTEXT.md and SERVER_LIVE_STATUS.md
9c83dbc feat(analytics): optimize GA4 initialization to 800ms, mount CookieBanner, and fix Python interpreter path
7031b55 feat(security): enforce HTTP 444 silent connection drop on botnet scanners across PromoRadar & FlirtCheck
c78d68a feat(bridge): implement autonomous Gemini -> Google Drive -> Workspace remote control bridge
b99c94c feat(ops): add 3-release retention policy, clean disk to 69% on 178.128.199.28, and start reporter daemon
71ca423 feat(ecosystem): establish automated GitHub <-> Server <-> Google Drive state sync bridge
57b0b77 feat: complete phase 2 upgrades (voucher ui, i18n pagination hook, category chunks, nginx proxy, twitter clean, flirtcheck llms)
f4ee51c fix(daemon): fix BASE_DIR reference in get_catalog_metrics
4da95ca fix(ops): resolve nginx /go routing, vikunja sql sync, mixed-content banners, and admitad filters
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

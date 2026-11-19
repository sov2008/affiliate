# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-19T13:58:46.415Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `1bd46c5534158498b8a1cb344138ea7a430320d0` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795095842614`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1794687803842`
- **Local Working Tree:** `Clean working tree`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 486ms | 533.8 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 198ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 367ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 223ms | 25.0 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915         929        1015          10        2284        2986
Swap:           2047         506        1541
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   14G   11G  57% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 9076m | 0 | 44.2MB | 0.3% |
| `affiliate-dashboard` | **ONLINE** | 26m | 3 | 141.4MB | 0.2% |
| `affiliate-scheduler` | **ONLINE** | 6837m | 1 | 49.4MB | 0.2% |
| `affiliate-health-monitor` | **ONLINE** | 9076m | 0 | 31.2MB | 0.3% |
| `affiliate-telegram-bot` | **ONLINE** | 9076m | 0 | 59.5MB | 0.3% |
| `affiliate-autopilot` | **ONLINE** | 7691m | 1 | 49.5MB | 0.5% |
| `affiliate-pinterest-publisher` | **ONLINE** | 9076m | 0 | 80.4MB | 0.3% |
| `affiliate-twitter-publisher` | **ONLINE** | 6813m | 2 | 69.5MB | 0.2% |
| `affiliate-support-monitor` | **STOPPED** | 20358m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 20358m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 7691m | 1 | 90.1MB | 0.3% |
| `affiliate-reddit-scout` | **STOPPED** | 39307m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 20358m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 20358m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 5773m | 0 | 16.3MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 5762m | 0 | 47.3MB | 0.2% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3715;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 73, 'CANCELLED': 43, 'DISPATCHED': 3556, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
1bd46c5 chore(ops): add remote disk audit script
d5cc362 chore(status): sync updated status files after audit fixes
aeaaf35 fix(integration): resolve /go 404s, sanitize markdown markers in queues, replenish content_queue_v2 to 73, and align CI/CD workflow
37b2ed0 chore(deploy): sync release rel_1794833196628 status to CONTEXT.md and SERVER_LIVE_STATUS.md
9c83dbc feat(analytics): optimize GA4 initialization to 800ms, mount CookieBanner, and fix Python interpreter path
7031b55 feat(security): enforce HTTP 444 silent connection drop on botnet scanners across PromoRadar & FlirtCheck
c78d68a feat(bridge): implement autonomous Gemini -> Google Drive -> Workspace remote control bridge
b99c94c feat(ops): add 3-release retention policy, clean disk to 69% on 178.128.199.28, and start reporter daemon
71ca423 feat(ecosystem): establish automated GitHub <-> Server <-> Google Drive state sync bridge
57b0b77 feat: complete phase 2 upgrades (voucher ui, i18n pagination hook, category chunks, nginx proxy, twitter clean, flirtcheck llms)
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

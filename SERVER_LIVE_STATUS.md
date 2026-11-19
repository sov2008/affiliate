# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-19T19:53:36.223Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `845c9e9abf944f695e23f28858817c4a04d9c4bb` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795117782321`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795117870009`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 470ms | 535.4 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 198ms | 6.9 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 435ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 222ms | 25.0 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        1675        1095          12        1448        2240
Swap:           2047         542        1505
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
| `pm2-logrotate` | **ONLINE** | 9431m | 0 | 44.3MB | 0.3% |
| `affiliate-dashboard` | **ONLINE** | 380m | 3 | 96.1MB | 0.3% |
| `affiliate-scheduler` | **ONLINE** | 7192m | 1 | 81.4MB | 0.3% |
| `affiliate-health-monitor` | **ONLINE** | 9431m | 0 | 22.4MB | 0.3% |
| `affiliate-telegram-bot` | **ONLINE** | 9431m | 0 | 60.4MB | 0.6% |
| `affiliate-autopilot` | **ONLINE** | 8046m | 1 | 56.2MB | 0% |
| `affiliate-pinterest-publisher` | **ONLINE** | 9431m | 0 | 88.6MB | 0.3% |
| `affiliate-twitter-publisher` | **ONLINE** | 7168m | 2 | 63.1MB | 0.3% |
| `affiliate-support-monitor` | **STOPPED** | 20712m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 20712m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 8046m | 1 | 92.8MB | 0% |
| `affiliate-reddit-scout` | **STOPPED** | 39662m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 20712m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 20712m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 6128m | 0 | 15.3MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 6117m | 0 | 49.9MB | 0.3% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3715;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 71, 'CANCELLED': 43, 'DISPATCHED': 3558, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
845c9e9 feat(growth): launch Black Friday & Cyber Monday 2026 hubs, add FlirtCheck cross-funnel tools, and sync IndexNow
3a02982 chore(status): sync disk cleanup and live metrics
1bd46c5 chore(ops): add remote disk audit script
d5cc362 chore(status): sync updated status files after audit fixes
aeaaf35 fix(integration): resolve /go 404s, sanitize markdown markers in queues, replenish content_queue_v2 to 73, and align CI/CD workflow
37b2ed0 chore(deploy): sync release rel_1794833196628 status to CONTEXT.md and SERVER_LIVE_STATUS.md
9c83dbc feat(analytics): optimize GA4 initialization to 800ms, mount CookieBanner, and fix Python interpreter path
7031b55 feat(security): enforce HTTP 444 silent connection drop on botnet scanners across PromoRadar & FlirtCheck
c78d68a feat(bridge): implement autonomous Gemini -> Google Drive -> Workspace remote control bridge
b99c94c feat(ops): add 3-release retention policy, clean disk to 69% on 178.128.199.28, and start reporter daemon
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

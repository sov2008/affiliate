# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-15T13:46:28.592Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `b99c94c0e64239462c72a6aa1747acfd0972c813` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1794737012023`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1794687803842`
- **Local Working Tree:** `Clean working tree`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 465ms | 533.5 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 179ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 403ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 246ms | 25.0 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        2416         166           8        1608        1499
Swap:           2047         512        1535
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   16G  7.2G  69% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 3304m | 0 | 44.2MB | 0.4% |
| `affiliate-dashboard` | **ONLINE** | 1041m | 2 | 80.1MB | 0% |
| `affiliate-scheduler` | **ONLINE** | 1065m | 1 | 54.8MB | 0.4% |
| `affiliate-health-monitor` | **ONLINE** | 3304m | 0 | 32.0MB | 0% |
| `affiliate-telegram-bot` | **ONLINE** | 3304m | 0 | 60.4MB | 0.4% |
| `affiliate-autopilot` | **ONLINE** | 1919m | 1 | 58.6MB | 0.4% |
| `affiliate-pinterest-publisher` | **ONLINE** | 3304m | 0 | 109.7MB | 0.4% |
| `affiliate-twitter-publisher` | **ONLINE** | 1041m | 2 | 91.2MB | 0.4% |
| `affiliate-support-monitor` | **STOPPED** | 14585m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 14585m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 1919m | 1 | 99.8MB | 0.4% |
| `affiliate-reddit-scout` | **STOPPED** | 33535m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 14585m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 14585m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 1m | 0 | 26.0MB | 0% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3631;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 42, 'CANCELLED': 43, 'DISPATCHED': 3503, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
b99c94c feat(ops): add 3-release retention policy, clean disk to 69% on 178.128.199.28, and start reporter daemon
71ca423 feat(ecosystem): establish automated GitHub <-> Server <-> Google Drive state sync bridge
57b0b77 feat: complete phase 2 upgrades (voucher ui, i18n pagination hook, category chunks, nginx proxy, twitter clean, flirtcheck llms)
f4ee51c fix(daemon): fix BASE_DIR reference in get_catalog_metrics
4da95ca fix(ops): resolve nginx /go routing, vikunja sql sync, mixed-content banners, and admitad filters
2ccb938 feat(hero): refine Deal of the Day slider card layout, authentic physical voucher ticket and Variant 3 tear-off CTA
449b987 perf(pagespeed): fix color-contrast to emerald-700, fix touch target dots to 24px, fix heading order and defer ticker init
2363582 perf(pagespeed): replace hero deal and brand ticker continuous RAF loops with IntersectionObserver and CSS hardware transitions
837a601 perf(pagespeed): eliminate rotator RAF loop, expand touch targets to 44px, fix heading order and defer GA
8765bfc feat(filter): implement full-catalog category chunking and compact search pagination
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-16T12:47:10.737Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `9c83dbc31c59892045b38755aa005f1c38516a7d` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 433ms | 533.7 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 173ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 423ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 222ms | 25.0 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
N/A
```

### Disk Usage (`df -h /`)
```text
N/A
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| No PM2 data available | - | - | - | - | - |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `N/A`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
9c83dbc feat(analytics): optimize GA4 initialization to 800ms, mount CookieBanner, and fix Python interpreter path
7031b55 feat(security): enforce HTTP 444 silent connection drop on botnet scanners across PromoRadar & FlirtCheck
c78d68a feat(bridge): implement autonomous Gemini -> Google Drive -> Workspace remote control bridge
b99c94c feat(ops): add 3-release retention policy, clean disk to 69% on 178.128.199.28, and start reporter daemon
71ca423 feat(ecosystem): establish automated GitHub <-> Server <-> Google Drive state sync bridge
57b0b77 feat: complete phase 2 upgrades (voucher ui, i18n pagination hook, category chunks, nginx proxy, twitter clean, flirtcheck llms)
f4ee51c fix(daemon): fix BASE_DIR reference in get_catalog_metrics
4da95ca fix(ops): resolve nginx /go routing, vikunja sql sync, mixed-content banners, and admitad filters
2ccb938 feat(hero): refine Deal of the Day slider card layout, authentic physical voucher ticket and Variant 3 tear-off CTA
449b987 perf(pagespeed): fix color-contrast to emerald-700, fix touch target dots to 24px, fix heading order and defer ticker init
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-23T12:02:09.315Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `2dd5a23efb2e65dfa0d96a77c3400b896584af1e` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M artifacts_admitad/promoradar_sync_state.json
 M deals-portal/src/data/couponsData.ts`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **403** | 308ms | 0.1 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **404** | 305ms | 0.1 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 808ms | 343.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 421ms | 25.6 KB |

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
2dd5a23 feat(catalog): onboard 350 fresh unique stores (1472 total stores, 1290 deduped, 1850 deals)
c3d149a Merge branch 'promoradar-portal' of https://github.com/sov2008/affiliate into promoradar-portal
172f4a1 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
9ee5b4c chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
398c0d2 feat(catalog): onboard 100 fresh high-yield partner programs across all categories (1023 stores, 1401 deals)
51b31a9 chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
58da5cb fix(ci): robust git add -A before rebase in continuous-catalog-sync
46665a6 feat(catalog): include Awin logos and catalog updates
edb435c feat(catalog): implement continuous multi-network CPA catalog ingestion workflow (every 6h)
89a43e1 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

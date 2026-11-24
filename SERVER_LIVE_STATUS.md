# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-24T11:02:16.166Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `dedd6f3e179b2037a2de0f2ca155a3b4412c838a` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md
 M TRAFFIC_SEO_REPORT.md
 M deals-portal/src/data/couponsData.ts
 M deals-portal/src/utils/normalizeStore.ts
 M scripts/catalog_validator.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 570ms | 553.7 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 223ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 545ms | 346.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 369ms | 25.9 KB |

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

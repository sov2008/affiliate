# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T15:36:15.664Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `c9a88a3cc6307ecc645833f47bee811a7a681ce7` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M blog/src/components/VerifiedSafetyToolsBox.astro
 M deals-portal/src/components/Header.astro
 M deals-portal/src/data/couponsData.ts
 M deals-portal/src/data/productsData.ts
 M deals-portal/src/data/promotionalBanners.ts
 M deals-portal/src/pages/black-friday-2026.astro
 M deals-portal/src/pages/cyber-monday-2026.astro
 M deals-portal/src/pages/index.astro
 M deals-portal/src/pages/stores/[store].astro
 M deals-portal/src/utils/normalizeStore.ts
 M deals-portal/src/utils/renderDealGridItem.ts
 M scripts/catalog_validator.cjs
?? scripts/audit_store_clones.cjs
?? scripts/audit_titles.cjs
?? scripts/sanitize_catalog_copy.cjs
?? scripts/temp_check.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 526ms | 535.4 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 183ms | 6.9 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 470ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 298ms | 25.0 KB |

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
c9a88a3 chore(status): sync live release state to SERVER_LIVE_STATUS.md and CONTEXT.md
845c9e9 feat(growth): launch Black Friday & Cyber Monday 2026 hubs, add FlirtCheck cross-funnel tools, and sync IndexNow
3a02982 chore(status): sync disk cleanup and live metrics
1bd46c5 chore(ops): add remote disk audit script
d5cc362 chore(status): sync updated status files after audit fixes
aeaaf35 fix(integration): resolve /go 404s, sanitize markdown markers in queues, replenish content_queue_v2 to 73, and align CI/CD workflow
37b2ed0 chore(deploy): sync release rel_1794833196628 status to CONTEXT.md and SERVER_LIVE_STATUS.md
9c83dbc feat(analytics): optimize GA4 initialization to 800ms, mount CookieBanner, and fix Python interpreter path
7031b55 feat(security): enforce HTTP 444 silent connection drop on botnet scanners across PromoRadar & FlirtCheck
c78d68a feat(bridge): implement autonomous Gemini -> Google Drive -> Workspace remote control bridge
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

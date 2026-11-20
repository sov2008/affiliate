# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T15:52:50.982Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `1153f0af4cfcd619a7ac90e5360b38216ce61347` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md
 M deals-portal/src/components/CouponPulseModal.astro
 M deals-portal/src/components/Footer.astro
 M deals-portal/src/components/HalloweenSpookySpotlight.astro
 M deals-portal/src/components/HalloweenTopBanner.astro
 M deals-portal/src/components/VerificationGuaranteeModal.astro
 M deals-portal/src/data/couponsData.ts
 M deals-portal/src/data/productsData.ts
 M deals-portal/src/data/storeDomains.ts
 M deals-portal/src/pages/categories/[category].astro
 M deals-portal/src/pages/compare/index.astro
 M deals-portal/src/pages/index.astro
 M deals-portal/src/pages/store/[slug].astro
 M deals-portal/src/pages/stores/[store].astro
 M deals-portal/src/pages/stores/index.astro
 M deals-portal/src/utils/normalizeStore.ts
?? deals-portal/src/utils/dateFormatter.ts
?? scripts/temp_cleanup_artifacts.cjs
?? scripts/temp_inspect.cjs
?? scripts/temp_update_dates.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 472ms | 538.3 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 197ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 401ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 218ms | 25.0 KB |

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
1153f0a feat(deals-portal): seasonal audit, copy de-templating, brand normalization and button ux polish
c9a88a3 chore(status): sync live release state to SERVER_LIVE_STATUS.md and CONTEXT.md
845c9e9 feat(growth): launch Black Friday & Cyber Monday 2026 hubs, add FlirtCheck cross-funnel tools, and sync IndexNow
3a02982 chore(status): sync disk cleanup and live metrics
1bd46c5 chore(ops): add remote disk audit script
d5cc362 chore(status): sync updated status files after audit fixes
aeaaf35 fix(integration): resolve /go 404s, sanitize markdown markers in queues, replenish content_queue_v2 to 73, and align CI/CD workflow
37b2ed0 chore(deploy): sync release rel_1794833196628 status to CONTEXT.md and SERVER_LIVE_STATUS.md
9c83dbc feat(analytics): optimize GA4 initialization to 800ms, mount CookieBanner, and fix Python interpreter path
7031b55 feat(security): enforce HTTP 444 silent connection drop on botnet scanners across PromoRadar & FlirtCheck
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T16:34:00.914Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `5907e528a141b0d099db240829a3c5e07b4c9919` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md
 M deals-portal/public/scripts/home-interactive.js
 M deals-portal/src/components/CuratedSpotlightSection.astro
 M deals-portal/src/components/Header.astro
 M deals-portal/src/components/PartnerBannerRotator.astro
 M deals-portal/src/pages/api/deals-chunks/[page].json.ts
 M deals-portal/src/pages/index.astro
 M deals-portal/src/utils/buildInterleavedFeed.ts
 M deals-portal/src/utils/categoryChunks.ts
 M deals-portal/src/utils/renderDealGridItem.ts
?? scripts/patch_client_i18n.cjs
?? scripts/patch_index_astro.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 540ms | 538.1 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 208ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 442ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 286ms | 25.0 KB |

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
5907e52 fix(deals-portal): dynamic SEO dates, seasonal icon update and feed artifacts cleanup
1153f0a feat(deals-portal): seasonal audit, copy de-templating, brand normalization and button ux polish
c9a88a3 chore(status): sync live release state to SERVER_LIVE_STATUS.md and CONTEXT.md
845c9e9 feat(growth): launch Black Friday & Cyber Monday 2026 hubs, add FlirtCheck cross-funnel tools, and sync IndexNow
3a02982 chore(status): sync disk cleanup and live metrics
1bd46c5 chore(ops): add remote disk audit script
d5cc362 chore(status): sync updated status files after audit fixes
aeaaf35 fix(integration): resolve /go 404s, sanitize markdown markers in queues, replenish content_queue_v2 to 73, and align CI/CD workflow
37b2ed0 chore(deploy): sync release rel_1794833196628 status to CONTEXT.md and SERVER_LIVE_STATUS.md
9c83dbc feat(analytics): optimize GA4 initialization to 800ms, mount CookieBanner, and fix Python interpreter path
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

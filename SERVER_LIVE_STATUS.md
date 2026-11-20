# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T22:15:13.705Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `9c305a9d6a1acf55fa7718f0f11e27d309d895c7` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md
 M artifacts_admitad/promoradar_sync_state.json
 M deals-portal/src/data/couponsData.ts
 M scripts/catalog_validator.cjs
 M scripts/cj_continuous_expander.cjs
 M scripts/promoradar_catalog_sync.cjs
?? .github/workflows/daily-catalog-sync.yml`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 473ms | 550.6 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 170ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 410ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 235ms | 25.0 KB |

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
9c305a9 fix(js): resolve openBtn TDZ ReferenceError and guard storeDealsMap cross-sell access
4744723 feat(social): enqueue 7 clean Black Friday & Cyber Monday 2026 promotion posts
cadf4ae fix(seo): refine meta tag grammar, discount extraction and singular/plural phrasing
33331f3 feat(seo): fix flirtcheck www redirect, optimize striking-distance CTR meta tags, normalize cheapvuelos slug and submit GSC sitemaps
d19519a feat(seo): integrate Google Search Console API reporting, clean Nginx log scanner filters and harden GA4 coupon_reveal events
027039e feat(analytics): add unified traffic & SEO report generator and sync TRAFFIC_SEO_REPORT.md to Google Drive
678df70 fix(ui/ux): resolve visual & logic regressions in spotlight, hero savings, brand deduplication and no-code deals
ad5c2da feat(ui/ux): overhaul partner spotlight, clean 24-card grid, brand diversity & multi-geo localization
5907e52 fix(deals-portal): dynamic SEO dates, seasonal icon update and feed artifacts cleanup
1153f0a feat(deals-portal): seasonal audit, copy de-templating, brand normalization and button ux polish
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

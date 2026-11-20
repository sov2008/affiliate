# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T21:11:57.771Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `474472385d726d2728a5c69383f7e35a3a174e01` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M deals-portal/public/scripts/coupon-modal.js
 M deals-portal/public/scripts/home-interactive.js
 M scripts/enqueue_bfcm_social.cjs
?? scripts/audit_live_clicks.cjs
?? scripts/comprehensive_live_audit.cjs
?? scripts/fix_coupon_modal_guard.cjs
?? scripts/fix_openbtn_tdz.cjs
?? scripts/inspect_home_grid.cjs
?? scripts/inspect_live_selectors.cjs
?? scripts/test_card_click.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 498ms | 550.6 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 201ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 353ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 219ms | 25.0 KB |

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
4744723 feat(social): enqueue 7 clean Black Friday & Cyber Monday 2026 promotion posts
cadf4ae fix(seo): refine meta tag grammar, discount extraction and singular/plural phrasing
33331f3 feat(seo): fix flirtcheck www redirect, optimize striking-distance CTR meta tags, normalize cheapvuelos slug and submit GSC sitemaps
d19519a feat(seo): integrate Google Search Console API reporting, clean Nginx log scanner filters and harden GA4 coupon_reveal events
027039e feat(analytics): add unified traffic & SEO report generator and sync TRAFFIC_SEO_REPORT.md to Google Drive
678df70 fix(ui/ux): resolve visual & logic regressions in spotlight, hero savings, brand deduplication and no-code deals
ad5c2da feat(ui/ux): overhaul partner spotlight, clean 24-card grid, brand diversity & multi-geo localization
5907e52 fix(deals-portal): dynamic SEO dates, seasonal icon update and feed artifacts cleanup
1153f0a feat(deals-portal): seasonal audit, copy de-templating, brand normalization and button ux polish
c9a88a3 chore(status): sync live release state to SERVER_LIVE_STATUS.md and CONTEXT.md
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T23:26:29.271Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `b62583c72d0917edf766d3aede6a6c1b8618be91` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M deals-portal/src/pages/index.astro`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 492ms | 551.4 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 195ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 468ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 266ms | 25.0 KB |

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
b62583c chore(catalog): automated daily admitad & cj catalog sync [skip ci]
bb0deb1 ci: stage artifacts state and clean working tree before git pull rebase
95981d1 ci: harden daily-catalog-sync workflow with telegram alerts and rebase push
37a6519 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
80a6f9f feat(catalog): fix type-agnostic sync parsers, run live Admitad/CJ ingestion and add daily auto-sync workflow
9c305a9 fix(js): resolve openBtn TDZ ReferenceError and guard storeDealsMap cross-sell access
4744723 feat(social): enqueue 7 clean Black Friday & Cyber Monday 2026 promotion posts
cadf4ae fix(seo): refine meta tag grammar, discount extraction and singular/plural phrasing
33331f3 feat(seo): fix flirtcheck www redirect, optimize striking-distance CTR meta tags, normalize cheapvuelos slug and submit GSC sitemaps
d19519a feat(seo): integrate Google Search Console API reporting, clean Nginx log scanner filters and harden GA4 coupon_reveal events
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

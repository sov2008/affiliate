# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-23T10:35:47.932Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `8bea475a0dad12c97e40842301bd3c56395ef55b` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795343314`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795430032723`
- **Local Working Tree:** `M package-lock.json
?? blog/public/images/posts/resetting-your-elo-score-why-deleting-your-profile-triggers-algor.webp
?? blog/src/content/posts/resetting-your-elo-score-why-deleting-your-profile-triggers-algor.md`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 1379ms | 551.5 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 537ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 1373ms | 343.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 736ms | 25.6 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        1069         657          11        2491        2846
Swap:           2047         462        1585
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   12G   12G  51% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 14633m | 0 | 47.2MB | 0.3% |
| `affiliate-dashboard` | **ONLINE** | 5583m | 3 | 119.8MB | 0.6% |
| `affiliate-scheduler` | **ONLINE** | 12394m | 1 | 84.6MB | 0% |
| `affiliate-health-monitor` | **ONLINE** | 14633m | 0 | 37.0MB | 0.3% |
| `affiliate-telegram-bot` | **ONLINE** | 14633m | 0 | 61.6MB | 0.3% |
| `affiliate-autopilot` | **ONLINE** | 13248m | 1 | 60.5MB | 0.6% |
| `affiliate-pinterest-publisher` | **ONLINE** | 14633m | 0 | 89.5MB | 0% |
| `affiliate-twitter-publisher` | **ONLINE** | 12370m | 2 | 93.0MB | 0.3% |
| `affiliate-support-monitor` | **STOPPED** | 25915m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 25915m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 13248m | 1 | 140.5MB | 0.3% |
| `affiliate-reddit-scout` | **STOPPED** | 44864m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 25915m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 25915m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 11330m | 0 | 18.3MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 11319m | 0 | 58.7MB | 0.3% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3772;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 74, 'CANCELLED': 43, 'DISPATCHED': 3612, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
8bea475 fix(ci): robust git commit, rebase and push in flirtcheck auto-publish
fe78650 feat(flirtcheck): implement autonomous 3x daily article publisher via GitHub Actions
852b1ca chore(catalog): automated daily admitad & cj catalog sync [skip ci]
0d45c09 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
28db560 fix(cache): add dynamic query timestamp to home-interactive.js to bust browser cache
b62583c chore(catalog): automated daily admitad & cj catalog sync [skip ci]
bb0deb1 ci: stage artifacts state and clean working tree before git pull rebase
95981d1 ci: harden daily-catalog-sync workflow with telegram alerts and rebase push
37a6519 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
80a6f9f feat(catalog): fix type-agnostic sync parsers, run live Admitad/CJ ingestion and add daily auto-sync workflow
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

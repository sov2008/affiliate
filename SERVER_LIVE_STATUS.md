# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-25T14:07:42.150Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `7bbd1226b5ee2fac3cf89d4051cb0ba9fa59adcd` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795611523`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795577332999`
- **Local Working Tree:** `?? blog/public/images/posts/love-bombing-vs-healthy-enthusiasm-the-14-day-timeline-breakdown.webp
?? blog/src/content/posts/love-bombing-vs-healthy-enthusiasm-the-14-day-timeline-breakdown.md`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 1339ms | 553.6 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 549ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 1264ms | 352.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 758ms | 26.3 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        1121         198          11        2898        2793
Swap:           2047         449        1598
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   20G  3.5G  86% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 17725m | 0 | 47.4MB | 0.3% |
| `affiliate-dashboard` | **ONLINE** | 8675m | 3 | 122.3MB | 0.3% |
| `affiliate-scheduler` | **ONLINE** | 15486m | 1 | 84.7MB | 0.2% |
| `affiliate-health-monitor` | **ONLINE** | 17725m | 0 | 37.1MB | 0.2% |
| `affiliate-telegram-bot` | **ONLINE** | 17725m | 0 | 61.7MB | 0.3% |
| `affiliate-autopilot` | **ONLINE** | 16340m | 1 | 60.9MB | 0.2% |
| `affiliate-pinterest-publisher` | **ONLINE** | 17725m | 0 | 98.2MB | 0.3% |
| `affiliate-twitter-publisher` | **ONLINE** | 15462m | 2 | 94.8MB | 0.2% |
| `affiliate-support-monitor` | **STOPPED** | 29006m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 29006m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 16340m | 1 | 147.1MB | 0.2% |
| `affiliate-reddit-scout` | **STOPPED** | 47956m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 29006m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 29006m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 14422m | 0 | 18.5MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 14411m | 0 | 58.7MB | 0.3% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3816;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 92, 'CANCELLED': 43, 'DISPATCHED': 3638, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
7bbd122 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
fad40e9 chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
dc146a0 feat(blog): publish autonomous investigative articles & forensic assets [skip ci]
140ac0e chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
14d8558 feat(blog): publish autonomous investigative articles & forensic assets [skip ci]
4f6f4e2 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
06e717a fix(ci): disable incomplete ssh deployment step in github actions to prevent blank releases
e9b98f6 merge origin/promoradar-portal keeping local sanitized catalog and hardened validators
95f919f fix(catalog): prune raw tariff store slugs, harden brand validator and enqueue black friday 2026 posts
72a29dc chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

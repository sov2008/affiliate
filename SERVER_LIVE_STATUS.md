# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-25T03:28:56.370Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `140ac0ed45bbf713d9b2d61848808dffaea33b76` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795561049707`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795531466946`
- **Local Working Tree:** `?? blog/public/images/posts/dating-app-burnout-syndrome-the-neurological-cost-of-the-infinite.webp
?? blog/src/content/posts/dating-app-burnout-syndrome-the-neurological-cost-of-the-infinite.md`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 1024ms | 553.6 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 417ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 975ms | 349.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 583ms | 26.1 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        1121         293          11        2803        2793
Swap:           2047         450        1597
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   17G  6.3G  74% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 17086m | 0 | 47.4MB | 0.2% |
| `affiliate-dashboard` | **ONLINE** | 8036m | 3 | 121.8MB | 0.2% |
| `affiliate-scheduler` | **ONLINE** | 14848m | 1 | 84.6MB | 0.1% |
| `affiliate-health-monitor` | **ONLINE** | 17086m | 0 | 37.1MB | 0.2% |
| `affiliate-telegram-bot` | **ONLINE** | 17086m | 0 | 61.6MB | 0.2% |
| `affiliate-autopilot` | **ONLINE** | 15701m | 1 | 60.9MB | 0.2% |
| `affiliate-pinterest-publisher` | **ONLINE** | 17086m | 0 | 103.3MB | 0.2% |
| `affiliate-twitter-publisher` | **ONLINE** | 14824m | 2 | 94.8MB | 0.2% |
| `affiliate-support-monitor` | **STOPPED** | 28368m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 28368m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 15701m | 1 | 148.2MB | 0.1% |
| `affiliate-reddit-scout` | **STOPPED** | 47317m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 28368m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 28368m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 13784m | 0 | 18.5MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 13772m | 0 | 58.7MB | 0.2% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3810;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 92, 'CANCELLED': 43, 'DISPATCHED': 3632, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
140ac0e chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
14d8558 feat(blog): publish autonomous investigative articles & forensic assets [skip ci]
4f6f4e2 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
06e717a fix(ci): disable incomplete ssh deployment step in github actions to prevent blank releases
e9b98f6 merge origin/promoradar-portal keeping local sanitized catalog and hardened validators
95f919f fix(catalog): prune raw tariff store slugs, harden brand validator and enqueue black friday 2026 posts
72a29dc chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
4f60894 chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
585912a feat(blog): publish autonomous investigative articles & forensic assets [skip ci]
dedd6f3 fix(ui): resolve hero region dropdown overlap and enhance partner banner rotator themes
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

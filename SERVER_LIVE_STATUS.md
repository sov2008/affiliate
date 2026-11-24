# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-24T14:44:30.930Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `4f6f4e24dfc76f60b0c6c0e394a02b5ec876831a` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `/var/www/promoradar.store/releases/rel_1795526687`
- **FlirtCheck Active Release:** `/var/www/flirtcheck.site/releases/rel_1795477481668`
- **Local Working Tree:** `?? blog/public/images/posts/the-breadcrumbing-funnel-behavioral-micro-signals-of-the-low-inve.webp
?? blog/src/content/posts/the-breadcrumbing-funnel-behavioral-micro-signals-of-the-low-inve.md`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 1135ms | 553.6 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 448ms | 6.7 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 1018ms | 346.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 617ms | 25.9 KB |

---

## 3. Server Resource Telemetry
### RAM Allocation (`free -m`)
```text
total        used        free      shared  buff/cache   available
Mem:            3915        1119         172          11        2926        2795
Swap:           2047         452        1595
```

### Disk Usage (`df -h /`)
```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        24G   17G  7.1G  70% /
```

---

## 4. PM2 Daemon Fleet Status
| Daemon Name | Status | Uptime | Restarts | Memory | CPU |
|---|:---:|:---:|:---:|:---:|:---:|
| `pm2-logrotate` | **ONLINE** | 16322m | 0 | 47.3MB | 0.2% |
| `affiliate-dashboard` | **ONLINE** | 7271m | 3 | 121.7MB | 0.4% |
| `affiliate-scheduler` | **ONLINE** | 14083m | 1 | 84.6MB | 0.3% |
| `affiliate-health-monitor` | **ONLINE** | 16322m | 0 | 37.1MB | 0.2% |
| `affiliate-telegram-bot` | **ONLINE** | 16322m | 0 | 61.6MB | 0.3% |
| `affiliate-autopilot` | **ONLINE** | 14937m | 1 | 61.0MB | 0.3% |
| `affiliate-pinterest-publisher` | **ONLINE** | 16322m | 0 | 98.9MB | 0.3% |
| `affiliate-twitter-publisher` | **ONLINE** | 14059m | 2 | 93.2MB | 0.3% |
| `affiliate-support-monitor` | **STOPPED** | 27603m | 0 | 0MB | 0% |
| `affiliate-admitad-daemon` | **STOPPED** | 27603m | 0 | 0MB | 0% |
| `affiliate-autonomous-agent` | **ONLINE** | 14937m | 1 | 155.2MB | 0.3% |
| `affiliate-reddit-scout` | **STOPPED** | 46553m | 20 | 0MB | 0% |
| `affiliate-fleet-commander` | **STOPPED** | 27603m | 0 | 0MB | 0% |
| `cj-promoradar-sync` | **STOPPED** | 27603m | 0 | 0MB | 0% |
| `promoradar-reporter-daemon` | **ONLINE** | 13019m | 0 | 18.5MB | 0% |
| `affiliate-gemini-bridge` | **ONLINE** | 13008m | 0 | 58.7MB | 0.2% |

---

## 5. SQLite Content Queue Telemetry (`content_queue_v2`)
- **Queue Metrics:** `TOTAL:3804;DIRTY_MARKDOWN:0;STATUS:{'APPROVED': 93, 'CANCELLED': 43, 'DISPATCHED': 3625, 'POSTED': 43}`
- **Markdown Bold Sanity Check:** 0 raw `**` in Twitter feeds.

---

## 6. Recent Git Commits on `promoradar-portal`
```text
4f6f4e2 chore(catalog): automated daily admitad & cj catalog sync [skip ci]
06e717a fix(ci): disable incomplete ssh deployment step in github actions to prevent blank releases
e9b98f6 merge origin/promoradar-portal keeping local sanitized catalog and hardened validators
95f919f fix(catalog): prune raw tariff store slugs, harden brand validator and enqueue black friday 2026 posts
72a29dc chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
4f60894 chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
585912a feat(blog): publish autonomous investigative articles & forensic assets [skip ci]
dedd6f3 fix(ui): resolve hero region dropdown overlap and enhance partner banner rotator themes
d7562ef chore(catalog): automated continuous CPA multi-network catalog sync [skip ci]
2dd5a23 feat(catalog): onboard 350 fresh unique stores (1472 total stores, 1290 deduped, 1850 deals)
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

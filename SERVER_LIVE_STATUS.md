# PromoRadar & FlirtCheck — Production Server Live Status Snapshot
*Generated automatically by `sync_ecosystem_state.cjs` at: 2026-11-20T17:05:52.648Z*

---

## 1. High-Level System Architecture & Live Releases
- **Target Host:** DigitalOcean Droplet `178.128.199.28` (Frankfurt / Ubuntu 24.04 LTS)
- **Active Git Commit:** `ad5c2da4e3536376e924f25c048e0961b13f14d8` (Branch: `promoradar-portal`)
- **PromoRadar Active Release:** `N/A`
- **FlirtCheck Active Release:** `N/A`
- **Local Working Tree:** `M CONTEXT.md
 M SERVER_LIVE_STATUS.md
 M deals-portal/public/scripts/home-interactive.js
 M deals-portal/src/components/CuratedSpotlightSection.astro
 M deals-portal/src/components/PartnerBannerRotator.astro
 M deals-portal/src/pages/index.astro
 M deals-portal/src/utils/buildInterleavedFeed.ts
 M deals-portal/src/utils/dealNormalizer.ts
 M deals-portal/src/utils/renderDealGridItem.ts
 D scripts/apply_all_niche_offers.cjs
 D scripts/apply_avatar_exact.cjs
 D scripts/apply_cj_cookies.cjs
 D scripts/apply_deal_normalizer.cjs
 D scripts/apply_index_enhancements.cjs
 D scripts/apply_promoradar_pinterest_profile.cjs
 D scripts/apply_smooth_animation.cjs
 D scripts/inspect_all_scripts.cjs
 D scripts/inspect_and_patch_baselayout.cjs
 D scripts/inspect_banner_rotator.cjs
 D scripts/inspect_banner_rotator2.cjs
 D scripts/inspect_banner_rotator3.cjs
 D scripts/inspect_baselayout_schema.cjs
 D scripts/inspect_cat_mega.cjs
 D scripts/inspect_coupons_ts.cjs
 D scripts/inspect_coupons_ts_head.cjs
 D scripts/inspect_fonts_snippet.cjs
 D scripts/inspect_fonts_snippet_2.cjs
 D scripts/inspect_head_fonts.cjs
 D scripts/inspect_head_links.cjs
 D scripts/inspect_header_astro.cjs
 D scripts/inspect_header_bloat.cjs
 D scripts/inspect_header_details.cjs
 D scripts/inspect_home_pagination.cjs
 D scripts/inspect_home_schemas.cjs
 D scripts/inspect_index_baselayout_tag.cjs
 D scripts/inspect_index_loadmore.cjs
 D scripts/inspect_index_loadmore_btn.cjs
 D scripts/inspect_index_schema.cjs
 D scripts/inspect_loadmore_full.cjs
 D scripts/inspect_main_cat_buttons.cjs
 D scripts/inspect_main_sections.cjs
 D scripts/inspect_mobile_drawer.cjs
 D scripts/inspect_module_scripts.cjs
 D scripts/inspect_partner_rotator.cjs
 D scripts/inspect_portal_categories.cjs
 D scripts/inspect_postbuild_css.cjs
 D scripts/inspect_preconnects.cjs
 D scripts/inspect_rotator_slides.cjs
 D scripts/inspect_spotlight_items.cjs
 D scripts/inspect_stores.cjs
 D scripts/inspect_stores_by_cat.cjs
 D scripts/inspect_stores_by_cat2.cjs
 D scripts/inspect_stores_by_cat3.cjs
 D scripts/inspect_stores_mega.cjs
 D scripts/inspect_ua_slide.cjs
 D scripts/inspect_ua_slide_banner.cjs
 D scripts/inspect_visible_logos.cjs
 D scripts/patch_all_missing_dimensions.cjs
 D scripts/patch_b64.cjs
 D scripts/patch_base_layout_robots.cjs
 D scripts/patch_baselayout_preconnect.cjs
 D scripts/patch_baselayout_preload_prop.cjs
 D scripts/patch_brand_logo_dimensions.cjs
 D scripts/patch_category_logo.cjs
 D scripts/patch_category_matching.cjs
 D scripts/patch_client_localization.cjs
 D scripts/patch_coupon_modal_defer.cjs
 D scripts/patch_deal_normalizer.cjs
 D scripts/patch_dist_logo_visible.cjs
 D scripts/patch_dist_radar_anim.cjs
 D scripts/patch_ending_soon.cjs
 D scripts/patch_enrich.cjs
 D scripts/patch_fonts_baselayout.cjs
 D scripts/patch_fonts_baselayout_clean.cjs
 D scripts/patch_header_anim_classes.cjs
 D scripts/patch_header_bf.cjs
 D scripts/patch_header_defer.cjs
 D scripts/patch_header_logo_visible.cjs
 D scripts/patch_header_script_trigger.cjs
 D scripts/patch_header_stores_slice.cjs
 D scripts/patch_home_schema_itemlist.cjs
 D scripts/patch_index_banners_and_anim.cjs
 D scripts/patch_index_deals_slice.cjs
 D scripts/patch_index_logo.cjs
 D scripts/patch_index_preload_banner.cjs
 D scripts/patch_it.cjs
 D scripts/patch_modal_img.cjs
 D scripts/patch_normalize_store.cjs
 D scripts/patch_pagination_btn_label.cjs
 D scripts/patch_rotator_astro.cjs
 D scripts/patch_rotator_defer.cjs
 D scripts/patch_rotator_eager.cjs
 D scripts/patch_rotator_js.cjs
 D scripts/patch_rotator_preload.cjs
 D scripts/patch_rotator_slice.cjs
 D scripts/patch_saved_deals_defer.cjs
 D scripts/patch_smooth_images_defer.cjs
 D scripts/patch_smooth_images_rotator.cjs
 D scripts/patch_sort.cjs
 D scripts/patch_sp.cjs
 D scripts/patch_spotlight.cjs
 D scripts/patch_spotlight_defer.cjs
 D scripts/patch_spotlight_slice.cjs
 D scripts/patch_store_deal_card.cjs
 D scripts/patch_user_settings.cjs
 D scripts/patch_verification_modal_defer.cjs
 D scripts/patch_wcag_contrast.cjs`

---

## 2. HTTPS Availability & Latency Matrix
| Service | Target URL | HTTP Status | Response Time | Content Size |
|---|---|:---:|:---:|:---:|
| **PromoRadar** | `https://promoradar.store/` | **200** | 591ms | 548.5 KB |
| **PromoRadar** | `https://promoradar.store/llms.txt` | **200** | 206ms | 6.8 KB |
| **FlirtCheck** | `https://flirtcheck.site/` | **200** | 409ms | 337.6 KB |
| **FlirtCheck** | `https://flirtcheck.site/llms.txt` | **200** | 265ms | 25.0 KB |

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
ad5c2da feat(ui/ux): overhaul partner spotlight, clean 24-card grid, brand diversity & multi-geo localization
5907e52 fix(deals-portal): dynamic SEO dates, seasonal icon update and feed artifacts cleanup
1153f0a feat(deals-portal): seasonal audit, copy de-templating, brand normalization and button ux polish
c9a88a3 chore(status): sync live release state to SERVER_LIVE_STATUS.md and CONTEXT.md
845c9e9 feat(growth): launch Black Friday & Cyber Monday 2026 hubs, add FlirtCheck cross-funnel tools, and sync IndexNow
3a02982 chore(status): sync disk cleanup and live metrics
1bd46c5 chore(ops): add remote disk audit script
d5cc362 chore(status): sync updated status files after audit fixes
aeaaf35 fix(integration): resolve /go 404s, sanitize markdown markers in queues, replenish content_queue_v2 to 73, and align CI/CD workflow
37b2ed0 chore(deploy): sync release rel_1794833196628 status to CONTEXT.md and SERVER_LIVE_STATUS.md
```

---
*Note: This snapshot is continuously synced with Google Drive (`affiliate` folder: `1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_`) and GitHub.*

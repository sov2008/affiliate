#!/usr/bin/env python3
"""
EVANGELION Master System Integration Script
Integrates 100% of ecosystem assets into Evangelion Project Management:
- 29 active PromoRadar stores with affiliate URLs and coupon codes
- CJ Affiliate & Admitad pipelines (300+ applications, mass connectors)
- Traffic syndication engines (Twitter 48/day, Reddit Scout, Pinterest)
- Inbound email defense & auto-responder (Gmail & i.ua)
- 16 PM2 processes & DigitalOcean infrastructure
"""

import sqlite3
import datetime
import os
import sys
import re

DB_PATH = '/opt/vikunja/vikunja.db' if os.path.exists('/opt/vikunja/vikunja.db') else sys.argv[1] if len(sys.argv) > 1 else 'vikunja.db'

# 29 Verified Merchant Stores from couponsData.ts
STORES = [
    {
        "name": "Hostinger",
        "slug": "hostinger",
        "cat": "Web Hosting & Domains",
        "badge": "75% OFF + Free Domain",
        "aff": "https://www.hostinger.com/promoradar",
        "desc": "High-performance LiteSpeed cloud hosting, free custom domain, automated daily backups, and 24/7 technical support. Verified promo code stacks on multi-year plans."
    },
    {
        "name": "NordVPN",
        "slug": "nordvpn",
        "cat": "Privacy & Security",
        "badge": "71% OFF + 3 Months Free",
        "aff": "https://nordvpn.com/promoradar",
        "desc": "Industry-leading AES-256 encryption, verified zero-logs policy, Threat Protection ad blocker, and 10Gbps ultra-fast VPN servers across 111 countries."
    },
    {
        "name": "Abelssoft",
        "slug": "abelssoft",
        "cat": "Software & Utilities",
        "badge": "50% OFF (Code: ABELSSOFT50)",
        "aff": "https://www.anrdoezrs.net/click-8102806-15740417",
        "desc": "Premium Windows PC utilities, driver updaters, registry cleaners, and disk defragmentation software. Direct CJ contract verified."
    },
    {
        "name": "Surfshark",
        "slug": "surfshark",
        "cat": "Privacy & Security",
        "badge": "82% OFF + Unlimited Devices",
        "aff": "https://surfshark.com/promoradar",
        "desc": "Budget-friendly premium VPN with unlimited simultaneous device connections, CleanWeb blocker, and built-in antivirus security suite."
    },
    {
        "name": "ChicMe",
        "slug": "chicme",
        "cat": "Fashion & Apparel",
        "badge": "12% Extra (Code: CHICME12)",
        "aff": "https://rzekl.com/g/zcfe0k62wg367099d2cc312b8f391a/?i=3",
        "desc": "Global on-trend women's clothing, footwear, swimwear, and accessories with international express delivery."
    },
    {
        "name": "Airalo eSIM",
        "slug": "airalo",
        "cat": "Travel & Tours",
        "badge": "15% OFF (Code: AIRALO15)",
        "aff": "https://alnk.to/flirtcheck_airalo",
        "desc": "Global digital eSIM mobile data packs covering 200+ countries. Zero roaming charges for travelers."
    },
    {
        "name": "Trip.com",
        "slug": "tripcom",
        "cat": "Travel & Tours",
        "badge": "Up to $60 OFF Flights & Hotels",
        "aff": "https://trip.tp.st/promoradar",
        "desc": "One-stop international flight booking, luxury hotel reservations, and high-speed rail tickets across Asia, Europe, and Americas."
    },
    {
        "name": "Geekbuying",
        "slug": "geekbuying",
        "cat": "Electronics & Gadgets",
        "badge": "Up to $50 OFF Tech Deals",
        "aff": "https://geekbuying.com/promoradar",
        "desc": "Mini PCs, 3D printers, laser engravers, electric scooters, and consumer electronics with EU/US warehouse dispatch."
    },
    {
        "name": "AliExpress",
        "slug": "aliexpress",
        "cat": "E-Commerce & Wholesale",
        "badge": "$4 to $16 OFF Choice Day",
        "aff": "https://aliexpress.com/promoradar",
        "desc": "Direct manufacturer marketplace with millions of products across tech, fashion, auto accessories, and home goods."
    },
    {
        "name": "DHgate",
        "slug": "dhgate",
        "cat": "E-Commerce & Wholesale",
        "badge": "Up to $30 OFF Wholesale Stack",
        "aff": "https://dhgate.com/promoradar",
        "desc": "Wholesale cross-border B2B and retail platform offering volume discounts, direct factory supplies, and coupon stacks."
    },
    {
        "name": "ExpressVPN",
        "slug": "expressvpn",
        "cat": "Privacy & Security",
        "badge": "49% OFF + 3 Months Bonus",
        "aff": "https://expressvpn.com/promoradar",
        "desc": "TrustedServer RAM-only architecture, Lightway proprietary protocol, and seamless streaming unblocking worldwide."
    },
    {
        "name": "PureVPN",
        "slug": "purevpn",
        "cat": "Privacy & Security",
        "badge": "81% OFF 2-Year Plan",
        "aff": "https://purevpn.com/promoradar",
        "desc": "Always-on audited zero-logs VPN with dedicated IP options, port forwarding, and Quantum-Resistant encryption keys."
    },
    {
        "name": "Keeper Security",
        "slug": "keeper",
        "cat": "Privacy & Security",
        "badge": "30% OFF Password Manager",
        "aff": "https://keepersecurity.com/promoradar",
        "desc": "Enterprise zero-knowledge password vault, secrets manager, and dark web monitoring for business and families."
    },
    {
        "name": "Qustodio",
        "slug": "qustodio",
        "cat": "Privacy & Security",
        "badge": "20% OFF Parental Control",
        "aff": "https://qustodio.com/promoradar",
        "desc": "Comprehensive digital safety suite, screen time limits, app blocking, and location tracking across all kid devices."
    },
    {
        "name": "Glasseslit",
        "slug": "glasseslit",
        "cat": "Eyewear & Health",
        "badge": "Buy 1 Get 1 Free + Extra 20%",
        "aff": "https://glasseslit.com/promoradar",
        "desc": "Prescription eyeglasses, blue-light blocking lenses, and designer frames at direct factory prices."
    },
    {
        "name": "RaynaTours",
        "slug": "raynatours",
        "cat": "Travel & Tours",
        "badge": "10% OFF Dubai & Global Excursions",
        "aff": "https://raynatours.com/promoradar",
        "desc": "Desert safari bookings, Burj Khalifa tickets, yacht rentals, and guided city tours with instant voucher delivery."
    },
    {
        "name": "ALLPOWERS",
        "slug": "allpowers",
        "cat": "Electronics & Gadgets",
        "badge": "$200 OFF Solar Power Stations",
        "aff": "https://allpowers.com/promoradar",
        "desc": "Portable LiFePO4 power stations, folding solar panels, and off-grid camping backup generators."
    },
    {
        "name": "The Deal Outlet",
        "slug": "thedealoutlet",
        "cat": "Fashion & Apparel",
        "badge": "Up to 70% OFF Designer Clearance",
        "aff": "https://thedealoutlet.com/promoradar",
        "desc": "Middle East premier luxury discount outlet featuring authentic designer fashion, shoes, and bags."
    },
    {
        "name": "VogaCloset",
        "slug": "vogacloset",
        "cat": "Fashion & Apparel",
        "badge": "22% Extra (Code: VOGA22)",
        "aff": "https://vogacloset.com/promoradar",
        "desc": "UK-based online fashion store serving MENA shoppers with European runway styles, beauty, and home accessories."
    },
    {
        "name": "Kodland",
        "slug": "kodland",
        "cat": "Education & Learning",
        "badge": "Free Coding Trial + 20% OFF Courses",
        "aff": "https://kodland.org/promoradar",
        "desc": "Interactive online programming, Python, game development, and Roblox coding academy for kids aged 6-17."
    },
    {
        "name": "OnlineSim",
        "slug": "onlinesim",
        "cat": "Privacy & Security",
        "badge": "Virtual SMS Numbers for 90+ Countries",
        "aff": "https://onlinesim.io/promoradar",
        "desc": "Disposable and rental virtual phone numbers for instant SMS activation and account verification."
    },
    {
        "name": "Alibaba",
        "slug": "alibaba",
        "cat": "E-Commerce & Wholesale",
        "badge": "Trade Assurance Supplier Vouchers",
        "aff": "https://alibaba.com/promoradar",
        "desc": "Leading global B2B wholesale platform connecting global buyers with verified OEM and ODM manufacturers."
    },
    {
        "name": "Jashanmal",
        "slug": "jashanmal",
        "cat": "Home & Lifestyle",
        "badge": "15% Extra on Kitchen & Luggage",
        "aff": "https://jashanmal.com/promoradar",
        "desc": "Iconic department retailer offering luxury cookware, Delsey luggage, tableware, and home appliances."
    },
    {
        "name": "Dabdoob",
        "slug": "dabdoob",
        "cat": "Kids & Toys",
        "badge": "10% OFF Premium Toys & Games",
        "aff": "https://dabdoob.com/promoradar",
        "desc": "Specialized mobile-first kids' toy store with gift wrapping and express delivery across GCC."
    },
    {
        "name": "Vperfumes",
        "slug": "vperfumes",
        "cat": "Beauty & Fragrances",
        "badge": "Up to 50% OFF Original Fragrances",
        "aff": "https://vperfumes.com/promoradar",
        "desc": "100% authentic niche Arabian ouds, French perfumes, and luxury branded scents with free shipping."
    },
    {
        "name": "Aovica Store",
        "slug": "aovica",
        "cat": "Electronics & Gadgets",
        "badge": "30% OFF Smart Home Tech",
        "aff": "https://aovica.com/promoradar",
        "desc": "Smart living sensors, wireless charging pads, LED ambiences, and creative desktop lifestyle gadgets."
    },
    {
        "name": "Mark Formelle",
        "slug": "markformelle",
        "cat": "Fashion & Apparel",
        "badge": "Seasonal Clearance Discount",
        "aff": "https://markformelle.com/promoradar",
        "desc": "Comfortable family loungewear, organic cotton underwear, casual basics, and thermo-clothing."
    },
    {
        "name": "Huawei",
        "slug": "huawei",
        "cat": "Electronics & Gadgets",
        "badge": "Up to $150 OFF MateBooks & Tablets",
        "aff": "https://consumer.huawei.com/promoradar",
        "desc": "Official online brand shop for MateBook laptops, MatePad tablets, FreeBuds, and smart wearables."
    },
    {
        "name": "EliteDate",
        "slug": "elitedate",
        "cat": "Dating & Lifestyle",
        "badge": "Verified Singles Premium Membership",
        "aff": "https://elitedate.cz/promoradar",
        "desc": "Curated serious dating network with manual photo verification and personality matching."
    }
]

def now_str():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

def integrate():
    print("================================================================")
    print("⚡ EVANGELION MASTER SYSTEM INTEGRATION")
    print("Connecting to:", DB_PATH)
    print("================================================================")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT id FROM users LIMIT 1")
    user_row = cur.fetchone()
    if not user_row:
        print("❌ No user in database!")
        return
    owner_id = user_row[0]
    print(f"Assigning master projects to Owner User #{owner_id}")

    # Wipe existing demo/seed projects except Inbox (id 1)
    cur.execute("DELETE FROM projects WHERE id > 1")
    cur.execute("DELETE FROM project_views WHERE project_id > 1")
    cur.execute("DELETE FROM buckets WHERE project_view_id NOT IN (SELECT id FROM project_views WHERE project_id = 1)")
    cur.execute("DELETE FROM tasks WHERE project_id > 1")
    cur.execute("DELETE FROM task_buckets WHERE project_view_id NOT IN (SELECT id FROM project_views WHERE project_id = 1)")
    cur.execute("DELETE FROM task_positions WHERE project_view_id NOT IN (SELECT id FROM project_views WHERE project_id = 1)")
    cur.execute("DELETE FROM project_ancestors WHERE project_id > 1")
    cur.execute("DELETE FROM project_task_counters WHERE project_id > 1")
    conn.commit()

    # --------------------------------------------------------------------------
    # PROJECT 1: ⚡ EVANGELION // 01. PromoRadar Merchant Fleet
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('⚡ EVANGELION // 01. PromoRadar Merchant Fleet', 
                'Full merchant catalog of promoradar.store: 29 active stores, verified coupon codes, affiliate redirects, and SEO store profiles.',
                '6366f1', ?, 0, 100.0, ?, ?)
    """, (owner_id, ts, ts))
    p1_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p1_id, p1_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p1_id,))

    # Views
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('List', ?, 0, 100.0, ?, ?)", (p1_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('Gantt', ?, 1, 200.0, ?, ?)", (p1_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('Table', ?, 2, 300.0, ?, ?)", (p1_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Kanban', ?, 3, 400.0, 1, ?, ?)", (p1_id, ts, ts))
    p1_kanban_id = cur.lastrowid

    # Buckets
    p1_buckets = ["Active Storefront (Published)", "Under Verification / In Review", "Planned Merchant Additions"]
    p1_bids = []
    for idx, btitle in enumerate(p1_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p1_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p1_bids.append(cur.lastrowid)
    cur.execute("UPDATE project_views SET default_bucket_id = ?, done_bucket_id = ? WHERE id = ?", (p1_bids[0], p1_bids[0], p1_kanban_id))

    # Add all 29 Stores as tasks
    for s_idx, store in enumerate(STORES):
        task_time = now_str()
        task_index = s_idx + 1
        title = f"{store['name']} — {store['badge']}"
        desc = (
            f"**Store Profile:** [{store['name']}](https://promoradar.store/stores/{store['slug']})\n\n"
            f"**Category:** {store['cat']}\n"
            f"**Discount:** {store['badge']}\n"
            f"**Primary Affiliate Redirect:** {store['aff']}\n\n"
            f"**Store Description:**\n{store['desc']}\n\n"
            f"**Live Storefront URL:** https://promoradar.store/stores/{store['slug']}"
        )
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, 1, ?, ?, 3, ?, ?, ?)
        """, (title, desc, p1_id, task_time, task_index, task_time, task_time, owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (task_index, p1_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p1_bids[0], tid, p1_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p1_kanban_id, (s_idx + 1) * 100.0))

    print(f"✅ Integrated 29 real merchant stores into Project #1")

    # --------------------------------------------------------------------------
    # PROJECT 2: ⚡ EVANGELION // 02. Affiliate Network Core (CJ, Admitad, LosPollos)
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('⚡ EVANGELION // 02. Affiliate Network Core',
                'CJ Affiliate (8102806), Admitad (3012753), LosPollos Smartlinks, Awin hub, and automated offer applications.',
                '10b981', ?, 0, 200.0, ?, ?)
    """, (owner_id, ts, ts))
    p2_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p2_id, p2_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p2_id,))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('List', ?, 0, 100.0, ?, ?)", (p2_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Kanban', ?, 3, 400.0, 1, ?, ?)", (p2_id, ts, ts))
    p2_kanban_id = cur.lastrowid

    p2_buckets = ["Expansion Niches (60+)", "Applications In Flight (300+)", "Approved & Active Contracts"]
    p2_bids = []
    for idx, btitle in enumerate(p2_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p2_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p2_bids.append(cur.lastrowid)

    p2_tasks = [
        ("CJ Multi-Vertical Mass Applier (60+ Niches)", "Crontab daemon runs every 2 hours (0 */2 * * *), applying to up to 1,000+ top EPC advertisers automatically across all global shopping categories.", 1),
        ("Admitad Instant Program Auto-Connect (has_moderation=2)", "Crontab daemon runs every 4 hours (30 */4 * * *), auto-enrolling into all instant e-commerce and SaaS programs without manual review delay.", 1),
        ("Admitad Tracking Promocode Harvester", "Scans 8 pages of coupon campaigns and auto-requests personal tracking voucher codes for PromoRadar.", 2),
        ("CJ GraphQL Real-Time Contract Syncer", "PM2 process cj-promoradar-sync pulls active merchant agreements and generates verified deal cards.", 2),
        ("LosPollos Smartlink Monetization Router", "Internal cloak router /r/dating redirects organic traffic to highest EPC smartlink with subids.", 2),
        ("Abelssoft Direct CJ Agreement", "Active contract CID verified with 50% basket promo code ABELSSOFT50.", 2),
        ("Hostinger International Affiliate Agreement", "Active hosting tier with 75% OFF + free custom domain bundle.", 2)
    ]
    for tidx, (t_title, t_desc, b_idx) in enumerate(p2_tasks):
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, ?, ?, ?, 3, ?, ?, ?)
        """, (t_title, t_desc, p2_id, 1 if b_idx == 2 else 0, now_str() if b_idx == 2 else None, tidx + 1, now_str(), now_str(), owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (tidx + 1, p2_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p2_bids[b_idx], tid, p2_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p2_kanban_id, (tidx + 1) * 100.0))

    print(f"✅ Integrated Affiliate Network Core into Project #2")

    # --------------------------------------------------------------------------
    # PROJECT 3: ⚡ EVANGELION // 03. Tactical Traffic & Social Syndication
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('⚡ EVANGELION // 03. Tactical Traffic & Syndication',
                'Multi-channel organic traffic: Twitter/X (48 tweets/day), Reddit Scout, Pinterest Pinning, and Astro SEO Hub.',
                '0ea5e9', ?, 0, 300.0, ?, ?)
    """, (owner_id, ts, ts))
    p3_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p3_id, p3_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p3_id,))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('List', ?, 0, 100.0, ?, ?)", (p3_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Kanban', ?, 3, 400.0, 1, ?, ?)", (p3_id, ts, ts))
    p3_kanban_id = cur.lastrowid

    p3_buckets = ["Content Generation & Seeds", "In SQLite Queue (APPROVED)", "Active Transmission (24/7)"]
    p3_bids = []
    for idx, btitle in enumerate(p3_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p3_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p3_bids.append(cur.lastrowid)

    p3_tasks = [
        ("Twitter / X Autonomous Publisher (48 Tweets/Day)", "PM2 daemon affiliate-twitter-publisher fires a high-converting PromoRadar voucher tweet every 30 minutes with direct links to /stores/.", 2),
        ("Twitter Deal Queue Auto-Replenisher (enqueue_promoradar_tweets)", "Crontab job runs every 3 hours (15 */3 * * *), keeping the SQLite content_queue_v2 stocked with 40+ fresh deal cards.", 2),
        ("Reddit Scout & Karma Nurture (u/sov2008)", "PM2 daemon affiliate-reddit-scout monitors r/AskReddit, r/NoStupidQuestions, r/CasualConversation with strict 4 comments/24h safety limit.", 2),
        ("Pinterest Rich Pin Syndicator (MoneyCash.pw)", "PM2 daemon affiliate-pinterest-publisher publishes rich voucher pins with 20-30m jitter intervals.", 1),
        ("Flirtcheck SEO Longread Hub (90+ Forensic Articles)", "Astro 5 SSG content collection with NVIDIA NIM FLUX.1-dev covers and organic Google rankings.", 2)
    ]
    for tidx, (t_title, t_desc, b_idx) in enumerate(p3_tasks):
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, ?, ?, ?, 3, ?, ?, ?)
        """, (t_title, t_desc, p3_id, 1 if b_idx == 2 else 0, now_str() if b_idx == 2 else None, tidx + 1, now_str(), now_str(), owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (tidx + 1, p3_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p3_bids[b_idx], tid, p3_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p3_kanban_id, (tidx + 1) * 100.0))

    print(f"✅ Integrated Traffic & Social Syndication into Project #3")

    # --------------------------------------------------------------------------
    # PROJECT 4: ⚡ EVANGELION // 04. Inbound Defense & Communications
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('⚡ EVANGELION // 04. Inbound Communications & Defense',
                'Dual-inbox 60s monitor (Gmail + i.ua), automated advertiser SMTP auto-responder, domain verification resolver, and Telegram dispatcher.',
                'f59e0b', ?, 0, 400.0, ?, ?)
    """, (owner_id, ts, ts))
    p4_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p4_id, p4_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p4_id,))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('List', ?, 0, 100.0, ?, ?)", (p4_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Kanban', ?, 3, 400.0, 1, ?, ?)", (p4_id, ts, ts))
    p4_kanban_id = cur.lastrowid

    p4_buckets = ["Inbox Telemetry", "Automated Action Rules", "Resolved & Verified"]
    p4_bids = []
    for idx, btitle in enumerate(p4_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p4_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p4_bids.append(cur.lastrowid)

    p4_tasks = [
        ("Gmail IMAP SSL Scanner (sapegin.oleg@gmail.com:993)", "Polls inbox every 60s for CJ, Admitad, Awin approvals and advertiser inquiries with deduplication state.", 2),
        ("i.ua POP3 SSL Scanner (sov7@i.ua:995)", "Polls Admitad/Mitgo registration mailbox every 60s for verification tickets.", 2),
        ("Advertiser SMTP TLS Auto-Responder (Oleg Sapegin)", "Sends professional partnership breakdown confirming rel=nofollow sponsored, strict No-TM-bidding compliance, and PromoRadar site profile.", 2),
        ("Automated Domain Verification Engine", "Extracts admitad*.html or meta tag tokens and places them instantly into deals-portal/public, blog/public, and dist.", 2),
        ("Telegram Bot Instant Dispatcher (@local_match_filter_bot)", "Real-time alerts with HTML escaping and plain-text fallback delivered directly to admin chat 808343978.", 2)
    ]
    for tidx, (t_title, t_desc, b_idx) in enumerate(p4_tasks):
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, ?, ?, ?, 3, ?, ?, ?)
        """, (t_title, t_desc, p4_id, 1, now_str(), tidx + 1, now_str(), now_str(), owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (tidx + 1, p4_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p4_bids[b_idx], tid, p4_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p4_kanban_id, (tidx + 1) * 100.0))

    print(f"✅ Integrated Inbound Communications into Project #4")

    # --------------------------------------------------------------------------
    # PROJECT 5: ⚡ EVANGELION // 05. Command Infrastructure & SRE
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('⚡ EVANGELION // 05. Command Infrastructure & SRE',
                'DigitalOcean Droplet (2 vCPU, 4 GB RAM, 2.3 GB free), 16 PM2 processes, nightly SQLite backups, and Nginx proxy.',
                '8b5cf6', ?, 0, 500.0, ?, ?)
    """, (owner_id, ts, ts))
    p5_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p5_id, p5_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p5_id,))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('List', ?, 0, 100.0, ?, ?)", (p5_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Kanban', ?, 3, 400.0, 1, ?, ?)", (p5_id, ts, ts))
    p5_kanban_id = cur.lastrowid

    p5_buckets = ["Continuous Daemons (16 PM2)", "Data Protection & Backups", "Operational Status: 100%"]
    p5_bids = []
    for idx, btitle in enumerate(p5_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p5_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p5_bids.append(cur.lastrowid)

    p5_tasks = [
        ("DigitalOcean Droplet Fleet (178.128.199.28)", "2 vCPU, 4.0 GB RAM, 2.0 GB Swap, 24 GB NVMe SSD. Current available RAM: 2.3 GB (60% headroom).", 2),
        ("PM2 Process Fleet: 16 Active Daemons", "affiliate-dashboard, affiliate-scheduler, affiliate-health-monitor, affiliate-telegram-bot, affiliate-autopilot, affiliate-telegram-userbot, affiliate-social-syndicator, affiliate-pinterest-publisher, affiliate-twitter-publisher, affiliate-support-monitor, affiliate-admitad-daemon, affiliate-autonomous-agent, affiliate-reddit-scout, affiliate-fleet-commander, affiliate-promoradar-worker, cj-promoradar-sync.", 2),
        ("Nightly SQLite Backup Daemon (03:00 UTC)", "Full database dump and backup of content_queue.sqlite and tg_leads.db to /var/log/affiliate_backup.log.", 2),
        ("EVANGELION Operational Dashboard (:3456)", "Nginx reverse proxy with sub_filter branding, systemd service auto-restart, and zero public registration.", 2)
    ]
    for tidx, (t_title, t_desc, b_idx) in enumerate(p5_tasks):
        cur_t = now_str()
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, 1, ?, ?, 3, ?, ?, ?)
        """, (t_title, t_desc, p5_id, cur_t, tidx + 1, cur_t, cur_t, owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (tidx + 1, p5_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p5_bids[b_idx], tid, p5_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p5_kanban_id, (tidx + 1) * 100.0))

    conn.commit()
    conn.close()
    print("\n🎉 EVANGELION FULL INTEGRATION COMPLETE! All 5 core projects, 29 merchant stores, and all daemons successfully loaded.")

if __name__ == '__main__':
    integrate()

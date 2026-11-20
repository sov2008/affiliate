const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('core/data/content_queue.sqlite');
console.log('--- 🚀 Enqueuing Black Friday & Cyber Monday 2026 Social Push ---');
console.log('Database:', dbPath);

const db = new DatabaseSync(dbPath);

const bfCmPosts = [
  {
    target_url: 'https://promoradar.store/events/black-friday/',
    hook: '🔥 Black Friday 2026: Live Verified Deal Tracker & Peak Voucher Vault',
    body: `Black Friday 2026 is officially live across 800+ verified merchants.

Instead of fighting expired coupons and checkout errors, our monitoring engine scans official partner feeds every 15 minutes to guarantee working discounts:

1/ VPN & Privacy: Up to 83% Off top-tier zero-log security suites
2/ Cloud & Web Hosting: 75% Off premier business plans with free SSL & domain
3/ Travel & Global Connectivity: 15% Bonus credits & instant eSIM setup worldwide
4/ Software & Productivity: Up to 50% Off lifetime desktop licenses

Track live verified deals with instant checkout activation:
https://promoradar.store/events/black-friday/`
  },
  {
    target_url: 'https://promoradar.store/events/cyber-monday/index.html',
    hook: '⚡ Cyber Monday 2026: Tech, SaaS & Digital Infrastructure Steals',
    body: `Cyber Monday 2026 brings the deepest software and digital utility discounts of the year.

Our tech deals desk tested and verified 100% working checkout vouchers across top infrastructure providers:

• VPN & Encrypted Networks: Maximum privacy protection with up to 3 extra months free
• Cloud VPS & Web Infrastructure: Scalable SSD hosting starting at steep introductory markdowns
• International Data eSIMs: Roam in 90+ countries without exorbitant carrier fees
• PC Optimization & Windows Security: Lifetime utility licenses for half price

Browse verified Cyber Monday promotions before countdown timers expire:
https://promoradar.store/events/cyber-monday/`
  },
  {
    target_url: 'https://promoradar.store/stores/expressvpn/',
    hook: '🛡️ ExpressVPN Black Friday Deal: 82% Off + 3 Months Free Security',
    body: `Protect your digital footprint across public Wi-Fi, travel hubs, and home networks.

ExpressVPN’s verified Black Friday voucher delivers premium multi-device encryption:

- TrustedServer RAM-only architecture verified by independent audits
- High-speed 10Gbps proprietary Lightway protocol across 105 countries
- Built-in Threat Manager blocking trackers, phishing domains, and malicious ads
- 30-day money-back guarantee with instant checkout activation

Claim verified ExpressVPN savings:
https://promoradar.store/stores/expressvpn/`
  },
  {
    target_url: 'https://promoradar.store/stores/hostinger/',
    hook: '🚀 Hostinger Black Friday Exclusive: Up to 75% Off Cloud & Web Hosting',
    body: `Launch your e-commerce store, web portal, or high-performance portfolio at minimal overhead.

Hostinger’s verified Black Friday promotion provides enterprise-grade infrastructure:

1/ Free domain name registration and unlimited SSL certificates included
2/ LiteSpeed enterprise caching for sub-second page loads and high PageSpeed scores
3/ Automated daily backups with one-click staging environments
4/ 99.9% uptime guarantee with 24/7 technical customer support

Activate verified Hostinger Black Friday pricing:
https://promoradar.store/stores/hostinger/`
  },
  {
    target_url: 'https://promoradar.store/stores/airalo/',
    hook: '✈️ Airalo Travel Savings: 15% Off Global eSIM Connectivity in 200+ Countries',
    body: `Never pay predatory international data roaming fees during your holiday travels.

Airalo delivers seamless prepaid eSIM data directly to your smartphone:

- Instant QR code or in-app activation before your flight departs
- Coverage across 200+ destinations with local high-speed LTE/5G carriers
- Transparent data packages with zero surprise roaming bills or contracts
- Tested and verified checkout discount for international travelers

Unlock your verified Airalo eSIM discount:
https://promoradar.store/stores/airalo/`
  },
  {
    target_url: 'https://promoradar.store/stores/abelssoft/',
    hook: '💻 Abelssoft Windows Security & Privacy Shield: 50% Off Lifetime Licenses',
    body: `Keep your PC running clean, fast, and protected against background registry clutter and telemetry leaks.

Abelssoft’s tested Black Friday voucher slashes 50% off professional utility tools:

• Privacy-first Windows configuration shields blocking unnecessary background tracking
• Automated deep registry optimization and junk file cleaner
• Lifetime license without recurring annual subscription traps
• Verified coupon code ABELSSOFT50 tested for instant checkout deduction

Claim your 50% off Abelssoft license:
https://promoradar.store/stores/abelssoft/`
  },
  {
    target_url: 'https://promoradar.store/stores/onlinesim/',
    hook: '📱 OnlineSim Privacy Special: 15% Bonus Credits on Disposable Virtual Numbers',
    body: `Shield your personal telephone number when registering on new websites, apps, and platforms.

OnlineSim provides temporary and private SMS activation numbers across 90+ countries:

1/ Safeguard your personal identity and bypass SMS verification gates securely
2/ Receive one-time SMS verification codes for WhatsApp, Google, Telegram, and retail apps
3/ Tested code SIMSECURE15 adds 15% extra bonus credits instantly to your account balance
4/ Zero SIM card swaps required with immediate browser-based dashboard delivery

Activate your 15% bonus credits on OnlineSim:
https://promoradar.store/stores/onlinesim/`
  }
];

// Sanity check for dirty markdown in input
for (const p of bfCmPosts) {
  if (p.hook.includes('**') || p.body.includes('**')) {
    throw new Error(`Dirty markdown found in post: ${p.hook}`);
  }
}

const insertStmt = db.prepare(`
  INSERT INTO content_queue_v2 (
    id, campaign_id, platform, target_url, hook, body, status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let inserted = 0;
const now = Date.now();

for (let i = 0; i < bfCmPosts.length; i++) {
  const p = bfCmPosts[i];
  const id = `bfcm_tw_${now}_${i}_${Math.random().toString(36).substring(2, 6)}`;
  insertStmt.run(
    id,
    'bfcm_2026_promo',
    'TWITTER',
    p.target_url,
    p.hook,
    p.body,
    'APPROVED',
    now + i * 1000,
    now + i * 1000
  );
  inserted++;
}

console.log(`✅ Successfully inserted ${inserted} clean Black Friday / Cyber Monday posts.`);

// Verify totals
const dirtyCheck = db.prepare("SELECT count(*) as count FROM content_queue_v2 WHERE hook LIKE '%**%' OR body LIKE '%**%'").get();
const approvedCheck = db.prepare("SELECT count(*) as count FROM content_queue_v2 WHERE platform = 'TWITTER' AND status = 'APPROVED'").get();
const totalStats = db.prepare("SELECT platform, status, count(*) as count FROM content_queue_v2 GROUP BY platform, status").all();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 CONTENT QUEUE AUDIT:');
console.log(`🧹 DIRTY_MARKDOWN count: ${dirtyCheck.count}`);
console.log(`🟢 TWITTER APPROVED count: ${approvedCheck.count}`);
console.log('📋 Full breakdown by platform and status:');
console.table(totalStats);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');


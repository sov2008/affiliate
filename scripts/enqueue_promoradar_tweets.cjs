/**
 * PromoRadar Twitter Traffic Engine
 * Enqueues verified discount vouchers and merchant store deals into content_queue_v2
 * Keeps the Twitter publishing daemon fed with high-converting buyer-intent tweets.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || (
  fs.existsSync('/var/www/affiliate/core/data/content_queue.sqlite')
    ? '/var/www/affiliate/core/data/content_queue.sqlite'
    : path.resolve(__dirname, '../core/data/content_queue.sqlite')
);

const TARGET_MIN_APPROVED = 30;

// High-converting curated deal tweets with verified coupon codes
const DEALS_TWEETS = [
  {
    store: 'Hostinger',
    hook: '🔥 Hostinger 75% OFF + Free Custom Domain & Unlimited SSL',
    body: 'Looking for lightning-fast web hosting? Grab 75% OFF Hostinger Cloud & WordPress plans with free custom domain and automated backups.\n\nClaim Deal: https://promoradar.store/stores/hostinger\n#WebHosting #Hostinger #PromoCode #TechDeals #Blogging',
    url: 'https://promoradar.store/stores/hostinger'
  },
  {
    store: 'NordVPN',
    hook: '🛡️ NordVPN 71% OFF + 3 Extra Months Free Exclusive Promo',
    body: 'Secure all your devices with industry-leading encryption and Threat Protection. NordVPN 2-year plan slashed by 71% + 3 bonus months.\n\nGet Voucher: https://promoradar.store/stores/nordvpn\n#NordVPN #CyberSecurity #VPN #Privacy #Discounts',
    url: 'https://promoradar.store/stores/nordvpn'
  },
  {
    store: 'Abelssoft',
    hook: '💻 50% OFF All Abelssoft Utilities & PC Speedup Software',
    body: 'Boost your Windows PC performance, remove junk files, and unlock premium utilities for half price with code ABELSSOFT50.\n\nUse Code: https://promoradar.store/stores/abelssoft\n#Abelssoft #Software #PCUpgrade #PromoCode #TechDeals',
    url: 'https://promoradar.store/stores/abelssoft'
  },
  {
    store: 'Surfshark',
    hook: '⚡ Surfshark VPN 82% OFF + Unlimited Simultaneous Devices',
    body: 'Protect every laptop, phone, and TV in your household under one subscription. Surfshark 82% OFF discount link verified on PromoRadar.\n\nActivate Deal: https://promoradar.store/stores/surfshark\n#Surfshark #VPN #CyberSecurity #Savings #OnlinePrivacy',
    url: 'https://promoradar.store/stores/surfshark'
  },
  {
    store: 'ChicMe',
    hook: '👗 ChicMe 12% Extra Basket Discount on Trendy Fashion',
    body: 'Upgrade your seasonal wardrobe! Apply verified promo code CHICME12 at checkout for an extra 12% off clearance & trending styles.\n\nGet Code: https://promoradar.store/stores/chicme\n#FashionDeals #ChicMe #StyleInspo #PromoCode #OOTD',
    url: 'https://promoradar.store/stores/chicme'
  },
  {
    store: 'Trip.com',
    hook: '✈️ Trip.com Flight & Hotel Bookings: Save Up to $60',
    body: 'Planning your next getaway? Grab verified travel vouchers for domestic flights, international hotels, and high-speed rail tickets.\n\nView Vouchers: https://promoradar.store/stores/tripcom\n#TravelDeals #TripCom #FlightDiscounts #TravelHacks #Hotels',
    url: 'https://promoradar.store/stores/tripcom'
  },
  {
    store: 'Geekbuying',
    hook: '📱 Geekbuying Tech Blowout: Up to $50 OFF Laptops & Gadgets',
    body: 'Save big on mini PCs, smart projectors, electric scooters, and 3D printers with verified warehouse coupons on PromoRadar.\n\nRedeem Now: https://promoradar.store/stores/geekbuying\n#Gadgets #Geekbuying #Electronics #DiscountCodes #TechNews',
    url: 'https://promoradar.store/stores/geekbuying'
  },
  {
    store: 'AliExpress',
    hook: '📦 AliExpress Choice Day Coupons: Extra $4 to $16 OFF Orders',
    body: 'Stack super deals with official promo codes on electronics, hobby gear, and home essentials. Instant discount applied at checkout.\n\nFind Codes: https://promoradar.store/stores/aliexpress\n#AliExpress #ChoiceDay #OnlineShopping #Coupons #Savings',
    url: 'https://promoradar.store/stores/aliexpress'
  },
  {
    store: 'DHgate',
    hook: '🛍️ DHgate Wholesale Coupons: Save Up to $30 on Bulk & Single Orders',
    body: 'Direct manufacturer pricing + platform-wide voucher stack. Verified merchant coupons tested daily on PromoRadar.\n\nCheck Deals: https://promoradar.store/stores/dhgate\n#DHgate #Wholesale #PromoCode #OnlineDeals #BargainHunt',
    url: 'https://promoradar.store/stores/dhgate'
  },
  {
    store: 'PromoRadar Directory',
    hook: '🎯 Stop Paying Full Price: Discover 1,000+ Verified Promo Codes',
    body: 'PromoRadar scans global merchant networks to verify working coupon codes, student discounts, and secret flash deals in real time.\n\nExplore Deals: https://promoradar.store/deals/\n#PromoRadar #Coupons #PromoCodes #FrugalLiving #ShoppingHacks',
    url: 'https://promoradar.store/deals/'
  },
  {
    store: 'Hostinger VPS',
    hook: '🚀 Hostinger KVM VPS Hosting 65% OFF with Dedicated IPv6',
    body: 'Deploy full root access servers with NVMe storage and 300 MB/s network speed starting under $6/month. Verified coupon active now.\n\nClaim VPS Deal: https://promoradar.store/stores/hostinger\n#VPS #DevOps #Hostinger #WebDev #CloudComputing',
    url: 'https://promoradar.store/stores/hostinger'
  },
  {
    store: 'NordPass',
    hook: '🔑 NordPass Business & Personal Password Manager 50% OFF',
    body: 'Eliminate weak passwords and data breaches across your team. End-to-end encrypted password vault at 50% discount.\n\nGet NordPass: https://promoradar.store/stores/nordvpn\n#PasswordManager #NordPass #CyberSecurity #DataProtection #SaaS',
    url: 'https://promoradar.store/stores/nordvpn'
  },
  {
    store: 'Cybersecurity Hub',
    hook: '🔒 2026 Best VPN & Privacy Deals Verified Comparison',
    body: 'Tested speed, zero-logs audit records, and streaming unlock capabilities. Compare verified promo codes for NordVPN, Surfshark, and more.\n\nCompare Deals: https://promoradar.store/deals/\n#VPN #PrivacyFirst #StreamingHacks #CyberSec #Deals',
    url: 'https://promoradar.store/deals/'
  },
  {
    store: 'PromoRadar Stores',
    hook: '🏪 Browse 50+ Official Merchant Brand Stores on PromoRadar',
    body: 'From top tech providers to fashion outlets and global airlines, check active promo codes before clicking checkout.\n\nBrowse Stores: https://promoradar.store/stores/\n#PromoRadar #Discounts #OnlineVouchers #CheckoutDiscount',
    url: 'https://promoradar.store/stores/'
  }
];

function main() {
  console.log(`[${new Date().toISOString()}] [TwitterDealFeed] Checking SQLite content queue at: ${DB_PATH}`);
  
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Database not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new DatabaseSync(DB_PATH);

  // Check how many Twitter approved posts exist
  const countRow = db.prepare("SELECT count(*) as count FROM content_queue_v2 WHERE platform = 'TWITTER' AND status = 'APPROVED'").get();
  console.log(`Current APPROVED Twitter items in queue: ${countRow.count}`);

  if (countRow.count >= TARGET_MIN_APPROVED) {
    console.log(`Queue is well stocked (>= ${TARGET_MIN_APPROVED}). No replenishment needed.`);
    db.close();
    return;
  }

  const insertStmt = db.prepare(`
    INSERT INTO content_queue_v2 (
      id, campaign_id, network, target_platform, platform, subreddit,
      target_url, hook, body, payload, stealth_cta, tracking_url,
      image_path, risk_score, status, live_upvotes, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  let added = 0;
  const now = Date.now();

  // Create multiple variants per deal to supply a deep queue
  for (let cycle = 0; cycle < 3; cycle++) {
    for (const deal of DEALS_TWEETS) {
      const id = `tw_pr_${now}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        insertStmt.run(
          id,
          'promoradar_deals_feed',
          'organic',
          'SOCIAL_SNIPPET',
          'TWITTER',
          'deals',
          deal.url,
          deal.hook,
          deal.body,
          JSON.stringify({ store: deal.store, url: deal.url }),
          'Claim Voucher',
          `${deal.url}?utm_source=twitter&utm_medium=organic&utm_campaign=promoradar_feed`,
          '/var/www/affiliate/blog/public/images/posts/default-cover.webp',
          1,
          'APPROVED',
          0,
          now + (added * 1000),
          now + (added * 1000)
        );
        added++;
      } catch (err) {
        console.error(`Error inserting deal ${deal.store}:`, err.message);
      }
    }
  }

  const newCount = db.prepare("SELECT count(*) as count FROM content_queue_v2 WHERE platform = 'TWITTER' AND status = 'APPROVED'").get();
  console.log(`✅ Successfully queued ${added} new PromoRadar deal tweets! Total APPROVED in queue: ${newCount.count}`);
  db.close();
}

main();

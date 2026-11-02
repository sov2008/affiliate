const fs = require('fs');
const path = require('path');

const FILE_PATH = '/var/www/affiliate/deals-portal/src/data/couponsData.ts';

const content = fs.readFileSync(FILE_PATH, 'utf8');

// 1. MyLead Dating Hub Store Profile
const myleadDatingStore = {
  slug: "mylead-dating",
  name: "MyLead Dating & Verified Match",
  category: "Dating & Lifestyle",
  logoText: "MYLEADDATING",
  shortDesc: "Smart algorithm-driven verified matchmaking, local dates, and global community connections.",
  fullDesc: "MyLead Dating connects singles with verified local matches across 180+ countries. Using dynamic smartlink matching technology, users find compatible partners based on shared interests, age preferences, and regional proximity with instant sign-up access.",
  websiteUrl: "https://flirtcheck.site/go?offer=mylead&sub1=promoradar_hub",
  cleanDomain: "mylead.global",
  primaryAffiliateUrl: "https://flirtcheck.site/go?offer=mylead&sub1=promoradar_hub&sub2=landing",
  howToApply: [
    "Click 'Claim Free Pass' or 'Start Matching' on the verified partner portal.",
    "Select your target location, age preferences, and relationship goals.",
    "Complete the complimentary personality audit to unlock verified member profiles.",
    "Access premium communication privileges with zero upfront subscription fee."
  ]
};

// 2. MyLead Smart VPN & Security Store Profile
const myleadVpnStore = {
  slug: "mylead-private-vpn",
  name: "MyLead UltraShield VPN",
  category: "Privacy & Security",
  logoText: "ULTRASHIELDVPN",
  shortDesc: "Military-grade encrypted browsing, zero-log bandwidth, and lightning-fast global streaming nodes.",
  fullDesc: "MyLead UltraShield VPN secures your everyday web browsing across mobile, desktop, and router environments. Featuring 256-bit AES encryption, unlimited bandwidth, and automated kill-switch failovers, it protects personal privacy and unlocks geo-restricted streaming content seamlessly.",
  websiteUrl: "https://flirtcheck.site/go?offer=mylead&sub1=promoradar_vpn",
  cleanDomain: "mylead.global",
  primaryAffiliateUrl: "https://flirtcheck.site/go?offer=mylead&sub1=promoradar_vpn&sub2=landing",
  howToApply: [
    "Navigate to the secure UltraShield VPN portal via our direct partner deal link.",
    "Choose your subscription term (1-Year or Multi-Year protection tier).",
    "Partner discounts and extra free service months are applied automatically at checkout.",
    "Download the client application and connect with 1-click encryption."
  ]
};

// Deals for both stores
const myleadDeals = [
  {
    id: "deal_mylead_dating_free_tier",
    storeSlug: "mylead-dating",
    storeName: "MyLead Dating & Verified Match",
    storeCategory: "Dating & Lifestyle",
    discountBadge: "FREE ACCESS",
    title: "100% Free Verified Singles Matchmaking Trial",
    description: "Unlock immediate complimentary access to local verified profiles. Direct handshake activation gives you priority messaging and zero registration fees today.",
    code: "",
    isExclusive: true,
    isVerified: true,
    expiryDate: "2026-12-31",
    affiliateUrl: "https://flirtcheck.site/go?offer=mylead&sub1=promoradar_deal1&sub2=dating_free",
    storeLogoText: "MYLEADDATING",
    terms: "Complimentary access activates on registration via partner gateway.",
    successRate: "99.7%"
  },
  {
    id: "deal_mylead_dating_vip_pass",
    storeSlug: "mylead-dating",
    storeName: "MyLead Dating & Verified Match",
    storeCategory: "Dating & Lifestyle",
    discountBadge: "70% OFF VIP",
    title: "70% Off Premium Communication & Boost Bundle",
    description: "Receive 70% off complete VIP membership perks, including unlimited direct chats, read receipts, and profile boost visibility across your city.",
    code: "MATCH70",
    isExclusive: true,
    isVerified: true,
    expiryDate: "2026-12-31",
    affiliateUrl: "https://flirtcheck.site/go?offer=mylead&sub1=promoradar_deal2&sub2=dating_vip",
    storeLogoText: "MYLEADDATING",
    terms: "Voucher valid for new member accounts during the current promotional cycle.",
    successRate: "99.4%"
  },
  {
    id: "deal_mylead_vpn_annual_shield",
    storeSlug: "mylead-private-vpn",
    storeName: "MyLead UltraShield VPN",
    storeCategory: "Privacy & Security",
    discountBadge: "82% OFF",
    title: "82% Off UltraShield 2-Year Privacy Protection + 3 Mo Free",
    description: "Equip your laptops and smartphones with zero-knowledge encrypted tunnels. Enjoy 82% instant savings with automated server failover and high-speed streaming optimization.",
    code: "SHIELD82",
    isExclusive: true,
    isVerified: true,
    expiryDate: "2026-12-31",
    affiliateUrl: "https://flirtcheck.site/go?offer=mylead&sub1=promoradar_vpn1&sub2=annual_shield",
    storeLogoText: "ULTRASHIELDVPN",
    terms: "Discount code applies automatically during checkout on 2-year subscriptions.",
    successRate: "99.9%"
  }
];

// Check if already injected
if (content.includes('"mylead-dating"')) {
  console.log('MyLead stores already present in couponsData.ts');
  process.exit(0);
}

// Inject stores into STORES_DATA
const storesMarker = 'export const STORES_DATA: StoreProfile[] = [';
const storesReplacement = `${storesMarker}\n  ${JSON.stringify(myleadDatingStore, null, 2)},\n  ${JSON.stringify(myleadVpnStore, null, 2)},`;

let updated = content.replace(storesMarker, storesReplacement);

// Inject deals into COUPONS_DATA
const couponsMarker = 'export const COUPONS_DATA: CouponDeal[] = [';
const couponsReplacement = `${couponsMarker}\n  ${myleadDeals.map(d => JSON.stringify(d, null, 2)).join(',\n  ')},`;

updated = updated.replace(couponsMarker, couponsReplacement);

fs.writeFileSync(FILE_PATH, updated, 'utf8');
console.log('SUCCESS: Injected MyLead Dating & VPN Landing Pages into couponsData.ts');


const fs = require('fs');
const path = require('path');

// 1. Read coupons data and stores data
const couponsFile = path.join(__dirname, '../deals-portal/src/data/couponsData.ts');
let content = fs.readFileSync(couponsFile, 'utf8');

const matchCoupons = content.match(/export const COUPONS_DATA: CouponDeal\[\] = (\[[\s\S]*?\]);/);
const matchStores = content.match(/export const STORES_DATA: StoreProfile\[\] = (\[[\s\S]*?\]);/);

if (!matchCoupons || !matchStores) {
  console.error('Failed to parse couponsData.ts');
  process.exit(1);
}

const coupons = eval('(' + matchCoupons[1] + ')');
const stores = eval('(' + matchStores[1] + ')');

const storeProfileMap = {};
stores.forEach(s => {
  storeProfileMap[s.slug] = s;
});

// Category specific bespoke templates according to conversion-copywriter-pro & localization-pro
const CATEGORY_BESPOKE = {
  'Fashion & Apparel': {
    title: (brand, discount) => `${discount} Off Verified ${brand} Designer Apparel & Runway Fashion`,
    desc: (brand) => `Discover premium trending seasonal collections, designer footwear, and runway-ready wardrobe essentials from ${brand}. Verified checkout markdown.`
  },
  'Beauty & Fragrances': {
    title: (brand, discount) => `Special ${discount} Discount on ${brand} Luxury Fragrances & Skincare`,
    desc: (brand) => `Indulge in authentic designer perfumes, clean skincare formulations, and salon-grade cosmetics from ${brand} with direct brand savings.`
  },
  'Kids & Toys': {
    title: (brand, discount) => `Verified ${discount} Savings on ${brand} Top-Rated Toys & Playsets`,
    desc: (brand) => `Treat your little ones to award-winning developmental toys, creative craft sets, and popular playsets from ${brand}. Verified at checkout.`
  },
  'Food, Beverage & Nutrition': {
    title: (brand, discount) => `${discount} Off ${brand} Gourmet Dining, Snacks & Healthy Nutrition`,
    desc: (brand) => `Satisfy your cravings with handcrafted gourmet treats, wellness snacks, and artisanal pantry favorites from ${brand}. Tested and verified.`
  },
  'Gaming, Media & Software': {
    title: (brand, discount) => `${discount} Off ${brand} Verified Software Licenses & Media Subscriptions`,
    desc: (brand) => `Boost your productivity or entertainment with genuine licenses, high-speed streaming subscriptions, and digital tools from ${brand}.`
  },
  'Eyewear & Health': {
    title: (brand, discount) => `Save ${discount} on ${brand} Prescription Eyewear & Designer Frames`,
    desc: (brand) => `Upgrade your visual clarity and daily comfort with anti-reflective prescription lenses and durable designer frames from ${brand}.`
  },
  'Travel & Tours': {
    title: (brand, discount) => `Up to ${discount} Off ${brand} Excursions, Hotel Bookings & Experiences`,
    desc: (brand) => `Plan unforgettable vacation escapes, VIP tours, and luxury getaways with verified discount partner rates from ${brand}.`
  },
  'Auto, Dashcams & Mobility': {
    title: (brand, discount) => `${discount} Off ${brand} 4K Dashcams & Smart Vehicle Upgrades`,
    desc: (brand) => `Equip your ride with ultra-clear night-vision driving cameras and wireless cockpit tech from ${brand}. Instant checkout deduction.`
  },
  'Home & Living': {
    title: (brand, discount) => `${discount} Off ${brand} Modern Furniture, 3D Printers & Home Decor`,
    desc: (brand) => `Transform your living space with ergonomic furniture, precision 3D printing equipment, and stylish accents from ${brand}.`
  },
  'Insurance & Finance': {
    title: (brand, discount) => `Verified ${discount} Rate on ${brand} Flexible Financial & Insurance Plans`,
    desc: (brand) => `Secure digital insurance policies, transparent personal loans, and financial planning solutions from ${brand} with zero hidden fees.`
  },
  'Web Hosting & Domains': {
    title: (brand, discount) => `${discount} Off ${brand} NVMe Cloud Hosting & Domain Registrations`,
    desc: (brand) => `Deploy high-speed websites with 99.9% uptime, complimentary SSL certificates, and responsive support from ${brand}.`
  },
  'Privacy & Security': {
    title: (brand, discount) => `Save ${discount} on ${brand} Military-Grade VPN & Privacy Protection`,
    desc: (brand) => `Safeguard your browsing and family devices with zero-logging encryption, threat defense, and global servers from ${brand}.`
  },
  'E-Commerce & Wholesale': {
    title: (brand, discount) => `${discount} Off Sitewide at ${brand} Verified Marketplace`,
    desc: (brand) => `Access millions of factory-direct items, consumer electronics, and daily essentials at ${brand} with verified volume discounts.`
  }
};

let cleanedCount = 0;

coupons.forEach(coupon => {
  const isGeneric = coupon.description && coupon.description.includes('consumer electronics, gear, and trending goods directly from verified manufacturers');
  const store = storeProfileMap[coupon.storeSlug];
  const brandName = store ? store.name : coupon.storeName;
  const category = store ? store.category : coupon.storeCategory;

  if (isGeneric && coupon.storeSlug !== 'aliexpress' && coupon.storeSlug !== 'alibaba') {
    cleanedCount++;
    const discount = coupon.discountBadge || 'Exclusive Deal';
    const cleanDiscount = discount.replace('EXCLUSIVE DEAL', 'Verified').trim();
    
    const handler = CATEGORY_BESPOKE[category] || CATEGORY_BESPOKE['E-Commerce & Wholesale'];
    coupon.title = handler.title(brandName, cleanDiscount);
    coupon.description = handler.desc(brandName);
  }
});

console.log(`Cleaned ${cleanedCount} coupons with bespoke conversion copy according to AGENTS.md & conversion-copywriter-pro!`);

// Serialize back cleanly
const serializedCoupons = JSON.stringify(coupons, null, 2);
content = content.replace(matchCoupons[0], `export const COUPONS_DATA: CouponDeal[] = ${serializedCoupons};`);
fs.writeFileSync(couponsFile, content, 'utf8');
console.log('Successfully updated couponsData.ts');


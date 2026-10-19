const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts');
let content = fs.readFileSync(targetFile, 'utf8');

if (content.includes("slug: 'abelssoft'")) {
  console.log('Abelssoft already exists in couponsData.ts');
  process.exit(0);
}

const storeToAdd = `  {
    slug: 'abelssoft',
    name: 'Abelssoft',
    category: 'Electronics & Gadgets',
    logoText: 'ABELSSOFT',
    shortDesc: 'Award-winning Windows utility software, privacy tools, system optimization, and media security utilities.',
    fullDesc: 'Abelssoft is a premium German software developer established in 1994, renowned for high-performance Windows optimization tools, privacy shields, disk cleaners, and media recording suites trusted by over 12 million users worldwide.',
    websiteUrl: 'https://www.abelssoft.com',
    cleanDomain: 'abelssoft.com',
    primaryAffiliateUrl: 'https://flirtcheck.site/go?offer=abelssoft&source=promoradar_cj&trigger=store_header&intent=deals',
    howToApply: [
      'Select any Abelssoft utility (WashAndWrite, EverDoc, AntiBrowserSpy, or SSD Fresh) on the official website.',
      'Proceed to the checkout page powered by their secure payment gateway.',
      'Promotional discounts of up to 50% are automatically credited via our verified affiliate integration.',
      'Receive full license keys instantly by email with lifetime updates and support.'
    ],
    faqs: [
      {
        question: 'Are Abelssoft promotional licenses perpetual?',
        answer: 'Yes, licenses purchased through our verified promotions include lifetime desktop activation for Windows.'
      },
      {
        question: 'Is there a trial available before purchasing Abelssoft tools?',
        answer: 'Yes, free trial versions are available for testing all optimization features before unlocking the pro suite.'
      }
    ]
  },
];

export const COUPONS_DATA: CouponDeal[] = [`;

const couponToAdd = `  {
    id: 'cj-abelssoft-50off',
    storeSlug: 'abelssoft',
    storeName: 'Abelssoft',
    title: 'Up to 50% Off Windows System Utilities & Privacy Suites',
    code: 'ABELSSOFT50',
    discountBadge: '50% OFF',
    discountType: 'percent',
    discountAmount: 50,
    affiliateUrl: 'https://flirtcheck.site/go?offer=abelssoft&source=promoradar_cj&trigger=coupon_card&intent=deals',
    description: 'Exclusive partner discount unlocking 50% off Abelssoft premium system speedup, registry cleaner, and privacy tools.',
    isExclusive: true,
    isVerified: true,
    expiresAt: '2026-12-31',
    verifiedDaysAgo: 0,
    category: 'Electronics & Gadgets',
    cleanDomain: 'abelssoft.com'
  },
`;

const marker = 'export const COUPONS_DATA: CouponDeal[] = [';
const searchTarget = `];\r\n\r\n${marker}`;
const searchTargetLF = `];\n\n${marker}`;

if (content.includes(searchTarget)) {
  content = content.replace(searchTarget, storeToAdd);
} else if (content.includes(searchTargetLF)) {
  content = content.replace(searchTargetLF, storeToAdd.replace(/\r\n/g, '\n'));
}

const couponMarker = 'export const COUPONS_DATA: CouponDeal[] = [\r\n';
const couponMarkerLF = 'export const COUPONS_DATA: CouponDeal[] = [\n';

if (content.includes(couponMarker)) {
  content = content.replace(couponMarker, couponMarker + couponToAdd);
} else if (content.includes(couponMarkerLF)) {
  content = content.replace(couponMarkerLF, couponMarkerLF + couponToAdd.replace(/\r\n/g, '\n'));
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✅ Successfully added verified CJ partner Abelssoft to couponsData.ts!');

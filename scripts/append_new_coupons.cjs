const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts');
let content = fs.readFileSync(targetFile, 'utf8');

const dealsToAdd = `  {
    id: 'deal_polis_greencard_sale',
    storeSlug: 'polis',
    storeName: 'Polis UA',
    storeCategory: 'Insurance & Finance',
    discountBadge: 'UP TO 15% OFF',
    title: 'Up To 15% Off International Green Card & Vehicle MTPL Insurance',
    description: 'Compare 25+ licensed insurance companies online with immediate policy delivery to your email and Diia state app.',
    code: 'POLISGREEN',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/?subid=promoradar_polis_deals',
    storeLogoText: 'POLIS',
    terms: 'Valid on online electronic vehicle and travel insurance policies.',
    successRate: '99.7%'
  },
  {
    id: 'deal_polis_medical_travel',
    storeSlug: 'polis',
    storeName: 'Polis UA',
    storeCategory: 'Insurance & Finance',
    discountBadge: 'CASHBACK',
    title: 'Online Travel & Health Insurance Vouchers with Instant Verification',
    description: 'Save on international Schengen, Worldwide, and domestic tourist health insurance coverage with 24/7 assistance.',
    code: 'TRAVELSAFE',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/?subid=promoradar_polis_travel',
    storeLogoText: 'POLIS',
    terms: 'Immediate official PDF certificate sent to policyholder.',
    successRate: '99.4%'
  },
  {
    id: 'deal_hostinger_cloud_75',
    storeSlug: 'hostinger',
    storeName: 'Hostinger',
    storeCategory: 'Web Hosting & Domains',
    discountBadge: '75% OFF + FREE DOMAIN',
    title: '75% Off Premium Web Hosting + Free Custom Domain & Unlimited SSL',
    description: 'Ultra-fast LiteSpeed WordPress hosting with 100 website allocations, daily backups, and 24/7 live support.',
    code: 'HOSTING75',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://flirtcheck.site/go?offer=hostinger&source=deals_hostinger&trigger=coupon_card&intent=deals&sub3=hosting75',
    storeLogoText: 'HOSTINGER',
    terms: 'Applies to multi-year plans. 30-day money-back guarantee.',
    successRate: '99.9%'
  },
  {
    id: 'deal_hostinger_cloud_starter',
    storeSlug: 'hostinger',
    storeName: 'Hostinger',
    storeCategory: 'Web Hosting & Domains',
    discountBadge: '10% EXTRA',
    title: 'Extra 10% Off All Business Cloud Hosting & VPS Servers',
    description: 'Maximize speed with dedicated IP addresses, NVMe storage, automated Git integration, and malware scanning.',
    code: 'EXTRA10',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://flirtcheck.site/go?offer=hostinger&source=deals_hostinger&trigger=coupon_card&intent=deals&sub3=extra10',
    storeLogoText: 'HOSTINGER',
    terms: 'Stacks on top of standard introductory discounts.',
    successRate: '99.5%'
  }
];`;

const searchEnd = '  }\r\n];';
const searchEndLF = '  }\n];';

const lastIndexCRLF = content.lastIndexOf(searchEnd);
const lastIndexLF = content.lastIndexOf(searchEndLF);

if (lastIndexCRLF !== -1) {
  content = content.substring(0, lastIndexCRLF + 4) + ',\r\n' + dealsToAdd;
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Appended coupons for Polis and Hostinger (CRLF)');
} else if (lastIndexLF !== -1) {
  content = content.substring(0, lastIndexLF + 4) + ',\n' + dealsToAdd;
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Appended coupons for Polis and Hostinger (LF)');
} else {
  console.error('End of coupons array not found');
}

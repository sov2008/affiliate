const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts');
let content = fs.readFileSync(targetFile, 'utf8');

const marker = 'export const COUPONS_DATA: CouponDeal[] = [';

const storesToAdd = `  {
    slug: 'polis',
    name: 'Polis UA',
    category: 'Insurance & Finance',
    logoText: 'POLIS',
    shortDesc: 'Online vehicle insurance, Green Card travel cover, medical policies, and financial micro-loans comparison.',
    fullDesc: 'Polis.ua is the leading online insurance superstore in Ukraine. Comparing licensed insurance providers across auto MTPL, international Green Card, health, and tourist policies with immediate PDF delivery to email.',
    websiteUrl: 'https://polis.ua/uk',
    cleanDomain: 'polis.ua',
    primaryAffiliateUrl: 'https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/?subid=promoradar_polis',
    howToApply: [
      'Enter your vehicle license plate or choose travel insurance destination.',
      'Compare quotes from 25+ verified insurance companies.',
      'Promotional discounts and cashback vouchers are applied automatically before payment.',
      'Receive official electronic insurance policy instantly in your inbox and Diia app.'
    ],
    faqs: [
      {
        question: 'Are electronic policies issued by Polis.ua officially valid?',
        answer: 'Yes, all electronic insurance contracts comply with state motor bureau regulations and are registered immediately in the official national database.'
      },
      {
        question: 'Can I get a discount on Green Card international travel insurance?',
        answer: 'Yes, our verified partner link activates promotional discounts of up to 15% on international Green Card policies.'
      }
    ]
  },
  {
    slug: 'hostinger',
    name: 'Hostinger',
    category: 'Web Hosting & Domains',
    logoText: 'HOSTINGER',
    shortDesc: 'High-speed cloud SSD web hosting, free SSL certificates, automated backups, and 1-click WordPress deployments.',
    fullDesc: 'Hostinger powers millions of web creators worldwide with high-performance LiteSpeed cloud hosting, free domain registrations, unlimited SSL certificates, and 24/7 technical customer support.',
    websiteUrl: 'https://www.hostinger.com',
    cleanDomain: 'hostinger.com',
    primaryAffiliateUrl: 'https://flirtcheck.site/go?offer=hostinger&source=deals_hostinger&trigger=store_header&intent=deals',
    howToApply: [
      'Choose a Premium or Business Cloud web hosting plan on Hostinger.',
      'Select a 48-month or 12-month billing period to secure maximum introductory pricing.',
      'Look for the "Have a coupon code?" prompt at the bottom of the order summary.',
      'Enter verified coupon code HOSTING75 to deduct an additional 10% to 75% instantly.'
    ],
    faqs: [
      {
        question: 'Does Hostinger include a free domain name?',
        answer: 'Yes, annual and multi-year hosting packages include a complimentary 1-year custom domain registration.'
      },
      {
        question: 'Is there a money-back guarantee on Hostinger?',
        answer: 'Yes, Hostinger offers an unconditional 30-day money-back satisfaction guarantee on all hosting plans.'
      }
    ]
  }
];

export const COUPONS_DATA: CouponDeal[] = [`;

// Replace the closing of STORES_DATA
const searchTarget = `];\r\n\r\n${marker}`;
const searchTargetLF = `];\n\n${marker}`;

if (content.includes(searchTarget)) {
  content = content.replace(searchTarget, `${storesToAdd}\r\n`);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Appended Polis and Hostinger successfully (CRLF)');
} else if (content.includes(searchTargetLF)) {
  content = content.replace(searchTargetLF, `${storesToAdd}\n`);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Appended Polis and Hostinger successfully (LF)');
} else {
  console.error('Marker not found in couponsData.ts');
}

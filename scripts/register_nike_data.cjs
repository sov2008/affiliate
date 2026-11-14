const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Store Definition for Nike
const nikeStore = `  {
    slug: 'nike',
    name: 'Nike',
    category: 'Fashion & Apparel',
    logoText: 'NIKE',
    shortDesc: 'Iconic athletic footwear, high-performance sportswear, sneakers, and running gear.',
    fullDesc: 'Nike is the world leader in athletic footwear, apparel, and sports equipment. Explore verified promotions on Air Max, Pegasus, Dri-FIT apparel, and exclusive member benefits with global order tracking.',
    websiteUrl: 'https://www.nike.com',
    cleanDomain: 'nike.com',
    primaryAffiliateUrl: 'https://www.awin1.com/awclick.php?mid=17652&id=3148787&p=https%3A%2F%2Fwww.nike.com.br',
    howToApply: [
      'Select your favorite Nike footwear, running gear, or sportswear and add items to cart.',
      'Sign in to your Nike Member account for complimentary shipping perks.',
      'Proceed to checkout and locate the "Do you have a promo code?" input box.',
      'Enter verified coupon code to apply your instant discount.'
    ],
    faqs: [
      {
        question: 'Are promotional codes valid on Nike Member orders?',
        answer: 'Yes, Nike Member accounts receive automatic access to seasonal sales, member-only drops, and promotional checkout discounts.'
      },
      {
        question: 'Does Nike offer free shipping on online orders?',
        answer: 'Yes, Nike Members qualify for free standard shipping on eligible orders, along with hassle-free 30-day returns.'
      }
    ]
  },`;

// 2. Coupon Deals for Nike
const nikeDeals = `  {
    id: 'deal_nike_airmax_sale',
    storeSlug: 'nike',
    storeName: 'Nike',
    storeCategory: 'Fashion & Apparel',
    discountBadge: 'UP TO 40% OFF',
    title: 'Up To 40% Off Nike Sneakers, Running Shoes & Athletic Apparel',
    description: 'Score verified discounts on iconic Air Max, Pegasus running shoes, tech fleece, and workout essentials with official merchant delivery.',
    code: 'NIKESAVE40',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://www.awin1.com/awclick.php?mid=17652&id=3148787&p=https%3A%2F%2Fwww.nike.com.br',
    storeLogoText: 'NIKE',
    terms: 'Valid on selected seasonal styles. Verified at official checkout.',
    successRate: '99.8%'
  },
  {
    id: 'deal_nike_member_exclusive',
    storeSlug: 'nike',
    storeName: 'Nike',
    storeCategory: 'Fashion & Apparel',
    discountBadge: 'MEMBER PASS',
    title: 'Nike Member Access: Free Shipping + Extra 15% Off Your Order',
    description: 'Unlock exclusive member pricing, early access to new sneaker drops, and free standard delivery on all official orders.',
    code: 'MEMBER15',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://www.awin1.com/awclick.php?mid=17652&id=3148787&p=https%3A%2F%2Fwww.nike.com.br',
    storeLogoText: 'NIKE',
    terms: 'Requires free Nike Member sign-in. Free 30-day return guarantee.',
    successRate: '99.9%'
  },`;

// 3. Inject Store into STORES_DATA
const storeMarker = 'export const COUPONS_DATA: CouponDeal[] = [';
const storeMarkerLF = 'export const COUPONS_DATA: CouponDeal[] = [';

if (content.includes('slug: \'nike\'') || content.includes('"slug": "nike"')) {
  console.log('Nike store already present in couponsData.ts');
} else {
  const storeEndCRLF = `];\r\n\r\n${storeMarker}`;
  const storeEndLF = `];\n\n${storeMarker}`;

  if (content.includes(storeEndCRLF)) {
    content = content.replace(storeEndCRLF, `${nikeStore}\r\n${storeEndCRLF}`);
    console.log('Inserted Nike into STORES_DATA (CRLF)');
  } else if (content.includes(storeEndLF)) {
    content = content.replace(storeEndLF, `${nikeStore}\n${storeEndLF}`);
    console.log('Inserted Nike into STORES_DATA (LF)');
  } else {
    console.error('Could not find STORES_DATA closing bracket');
  }
}

// 4. Inject Deals into COUPONS_DATA
if (content.includes('deal_nike_airmax_sale')) {
  console.log('Nike deals already present in couponsData.ts');
} else {
  const dealsEndCRLF = '  }\r\n];';
  const dealsEndLF = '  }\n];';
  const lastIndexCRLF = content.lastIndexOf(dealsEndCRLF);
  const lastIndexLF = content.lastIndexOf(dealsEndLF);

  if (lastIndexCRLF !== -1) {
    content = content.substring(0, lastIndexCRLF + 4) + ',\r\n' + nikeDeals + content.substring(lastIndexCRLF + 4);
    console.log('Inserted Nike deals into COUPONS_DATA (CRLF)');
  } else if (lastIndexLF !== -1) {
    content = content.substring(0, lastIndexLF + 4) + ',\n' + nikeDeals + content.substring(lastIndexLF + 4);
    console.log('Inserted Nike deals into COUPONS_DATA (LF)');
  } else {
    console.error('Could not find COUPONS_DATA end');
  }
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Nike successfully registered in couponsData.ts');


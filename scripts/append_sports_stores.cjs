const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts');
let content = fs.readFileSync(file, 'utf8');

const newStores = `  {
    slug: 'adidas',
    name: 'Adidas',
    category: 'Sports & Outdoors',
    logoText: 'ADIDAS',
    shortDesc: 'World-renowned sportswear, football boots, Ultraboost running shoes, and Originals streetwear.',
    fullDesc: 'Adidas is an international benchmark for athletic performance and street culture. Discover verified savings on Ultraboost, Stan Smith, Samba, and training apparel with direct manufacturer fulfillment.',
    websiteUrl: 'https://www.adidas.com',
    cleanDomain: 'adidas.com',
    primaryAffiliateUrl: 'https://www.awin1.com/awclick.php?mid=77006&id=3148787&p=https%3A%2F%2Fwww.adidas.pl%2F',
    howToApply: [
      'Choose your footwear, jerseys, or sportswear and add items to your shopping bag.',
      'Log into your adiClub account for member discounts and free delivery perks.',
      'Go to checkout and paste your promotional code into the Promo Code field.',
      'Review your discounted subtotal and complete order.'
    ],
    faqs: [
      {
        question: 'Does Adidas provide discounts for adiClub members?',
        answer: 'Yes, adiClub members unlock exclusive reward vouchers, early access to limited sneaker releases, and free shipping.'
      },
      {
        question: 'Can I return Adidas items purchased with a voucher?',
        answer: 'Yes, official Adidas orders come with a generous 30-day return window.'
      }
    ]
  },
  {
    slug: 'puma',
    name: 'Puma',
    category: 'Sports & Outdoors',
    logoText: 'PUMA',
    shortDesc: 'Fast athletic footwear, motorsports collections, running gear, and lifestyle sneakers.',
    fullDesc: 'Puma delivers speed and style with performance running shoes, football cleats, and lifestyle apparel. Save on Nitro running shoes, Clyde classics, and Scuderia Ferrari motorsport gear.',
    websiteUrl: 'https://www.puma.com',
    cleanDomain: 'puma.com',
    primaryAffiliateUrl: 'https://www.awin1.com/awclick.php?mid=32675&id=3148787&p=https%3A%2F%2Fbr.puma.com%2F',
    howToApply: [
      'Browse Puma athletic gear and add your favorite items to cart.',
      'Open your shopping cart and click Enter Promo Code.',
      'Type or paste your verified voucher to apply immediate savings.',
      'Proceed to checkout.'
    ],
    faqs: [
      {
        question: 'Does Puma offer seasonal sales and promo codes?',
        answer: 'Yes, Puma regularly runs seasonal discount promotions and exclusive student and athlete discounts.'
      }
    ]
  },
  {
    slug: 'under-armour',
    name: 'Under Armour',
    category: 'Sports & Outdoors',
    logoText: 'UA',
    shortDesc: 'High-tech athletic gear, HeatGear compression wear, and cushioning training shoes.',
    fullDesc: 'Under Armour equips athletes with state-of-the-art moisture-wicking apparel, HeatGear, ColdGear, and HOVR footwear designed to withstand the toughest training sessions.',
    websiteUrl: 'https://www.underarmour.com',
    cleanDomain: 'underarmour.com',
    primaryAffiliateUrl: 'https://www.awin1.com/awclick.php?mid=15431&id=3148787&p=https%3A%2F%2Fwww.underarmour.com%2Fen-us%2F',
    howToApply: [
      'Add Under Armour performance clothing or shoes to your cart.',
      'Navigate to checkout and find the Apply Promo Code field.',
      'Enter the coupon code and apply to refresh order total.'
    ],
    faqs: [
      {
        question: 'Can I get free shipping on Under Armour orders?',
        answer: 'Yes, Under Armour provides free standard shipping on orders meeting the minimum threshold or for UA Rewards members.'
      }
    ]
  },
  {
    slug: 'new-balance',
    name: 'New Balance',
    category: 'Sports & Outdoors',
    logoText: 'NB',
    shortDesc: 'Iconic lifestyle sneakers, marathon running shoes, and premium heritage apparel.',
    fullDesc: 'New Balance blends heritage craftsmanship with modern athletic performance. Explore certified promotions across 574, 990 series, and Fresh Foam running trainers.',
    websiteUrl: 'https://www.newbalance.com',
    cleanDomain: 'newbalance.com',
    primaryAffiliateUrl: 'https://www.awin1.com/awclick.php?mid=10317&id=3148787&p=https%3A%2F%2Fnewbalance.pl',
    howToApply: [
      'Select your size and colorway for New Balance sneakers or sportswear.',
      'Proceed to checkout and enter your code into the Promotion Code box.',
      'Confirm the discount and checkout.'
    ],
    faqs: [
      {
        question: 'Are New Balance promo codes valid on classic sneakers?',
        answer: 'Most vouchers apply to seasonal footwear, apparel, and training gear with clear terms at checkout.'
      }
    ]
  },
  {
    slug: 'reebok',
    name: 'Reebok',
    category: 'Sports & Outdoors',
    logoText: 'REEBOK',
    shortDesc: 'Classic fitness footwear, CrossFit training gear, and retro Club C sneakers.',
    fullDesc: 'Reebok powers fitness and everyday streetwear with iconic Club C, Classic Leather, and Nano training shoes engineered for peak gym performance.',
    websiteUrl: 'https://www.reebok.com',
    cleanDomain: 'reebok.com',
    primaryAffiliateUrl: 'https://www.awin1.com/awclick.php?mid=121520&id=3148787&p=https%3A%2F%2Fwww.reebok.eu%2Fpl-pl',
    howToApply: [
      'Choose your Reebok workout or lifestyle gear.',
      'Go to the cart summary and paste your voucher in the Promo Code field.',
      'Click Apply to update the checkout price.'
    ],
    faqs: [
      {
        question: 'Does Reebok offer member benefits?',
        answer: 'Reebok members receive welcome vouchers, early access to sales, and free standard delivery.'
      }
    ]
  },
  {
    slug: 'decathlon',
    name: 'Decathlon',
    category: 'Sports & Outdoors',
    logoText: 'DECATHLON',
    shortDesc: 'All-in-one sports store for 70+ sports, outdoor camping, cycling, and fitness gear.',
    fullDesc: 'Decathlon makes sport accessible to everyone with innovative gear for running, hiking, cycling, team sports, and fitness with unbeatable value.',
    websiteUrl: 'https://www.decathlon.com',
    cleanDomain: 'decathlon.com',
    primaryAffiliateUrl: 'https://www.awin1.com/awclick.php?mid=14353&id=3148787&p=https%3A%2F%2Fwww.decathlon.de%2F',
    howToApply: [
      'Add Decathlon sporting goods, camping equipment, or apparel to cart.',
      'Proceed to checkout and apply your promotional voucher or gift card.',
      'Enjoy verified manufacturer savings.'
    ],
    faqs: [
      {
        question: 'Does Decathlon offer warranty on sports equipment?',
        answer: 'Yes, Decathlon products feature a minimum 2-year warranty on sporting equipment and bikes.'
      }
    ]
  },`;

const regex = /(\n\];\s*\n\s*export const COUPONS_DATA)/;
if (regex.test(content)) {
  content = content.replace(regex, '\n' + newStores + '$1');
  console.log('Stores inserted successfully');
} else {
  console.error('Cannot match stores end marker');
  process.exit(1);
}

const newDeals = `  {
    id: 'deal_adidas_ultraboost_sale',
    storeSlug: 'adidas',
    storeName: 'Adidas',
    storeCategory: 'Sports & Outdoors',
    discountBadge: 'UP TO 35% OFF',
    title: 'Up To 35% Off Adidas Ultraboost, Sambas & Originals',
    description: 'Save on iconic Adidas running shoes, football kits, and athletic sportswear with direct manufacturer warranty.',
    code: 'ADIEXTRA',
    isExclusive: true,
    isVerified: true,
    rating: 4.9,
    usesCount: 1840,
    terms: 'Valid on selected full-priced and sale items. While supplies last.',
    affiliateUrl: 'https://www.awin1.com/awclick.php?mid=77006&id=3148787&p=https%3A%2F%2Fwww.adidas.pl%2F',
    expirationDate: '2026-12-31'
  },
  {
    id: 'deal_puma_nitro_discount',
    storeSlug: 'puma',
    storeName: 'Puma',
    storeCategory: 'Sports & Outdoors',
    discountBadge: '30% OFF',
    title: 'Extra 30% Off Puma Running Shoes & Training Essentials',
    description: 'Upgrade your training kit with high-performance Nitro cushioning, running sneakers, and gym apparel.',
    code: 'PUMARUN30',
    isExclusive: true,
    isVerified: true,
    rating: 4.8,
    usesCount: 1420,
    terms: 'Applicable at checkout on participating styles.',
    affiliateUrl: 'https://www.awin1.com/awclick.php?mid=32675&id=3148787&p=https%3A%2F%2Fbr.puma.com%2F',
    expirationDate: '2026-12-31'
  },
  {
    id: 'deal_under_armour_heatgear',
    storeSlug: 'under-armour',
    storeName: 'Under Armour',
    storeCategory: 'Sports & Outdoors',
    discountBadge: '25% OFF',
    title: '25% Off Under Armour HeatGear Compression & Training Footwear',
    description: 'Engineered moisture-wicking compression shirts, shorts, and responsive HOVR training sneakers.',
    code: 'UAHEAT25',
    isExclusive: true,
    isVerified: true,
    rating: 4.8,
    usesCount: 970,
    terms: 'Valid on eligible apparel and training gear.',
    affiliateUrl: 'https://www.awin1.com/awclick.php?mid=15431&id=3148787&p=https%3A%2F%2Fwww.underarmour.com%2Fen-us%2F',
    expirationDate: '2026-12-31'
  },
  {
    id: 'deal_new_balance_574_sale',
    storeSlug: 'new-balance',
    storeName: 'New Balance',
    storeCategory: 'Sports & Outdoors',
    discountBadge: 'UP TO 30% OFF',
    title: 'Up To 30% Off New Balance Heritage 574 & Fresh Foam Trainers',
    description: 'Step into unmatched comfort with iconic New Balance sneakers, marathon runners, and lifestyle apparel.',
    code: 'NBHERITAGE',
    isExclusive: true,
    isVerified: true,
    rating: 4.9,
    usesCount: 1650,
    terms: 'Discount reflected at checkout on selected styles.',
    affiliateUrl: 'https://www.awin1.com/awclick.php?mid=10317&id=3148787&p=https%3A%2F%2Fnewbalance.pl',
    expirationDate: '2026-12-31'
  },
  {
    id: 'deal_reebok_club_c_discount',
    storeSlug: 'reebok',
    storeName: 'Reebok',
    storeCategory: 'Sports & Outdoors',
    discountBadge: '25% OFF',
    title: '25% Off Reebok Club C Classics & Nano Workout Footwear',
    description: 'Claim exclusive savings on timeless tennis shoes, CrossFit training gear, and retro tracksuits.',
    code: 'REEBOKFIT25',
    isExclusive: true,
    isVerified: true,
    rating: 4.7,
    usesCount: 880,
    terms: 'Verified voucher valid on participating footwear and apparel.',
    affiliateUrl: 'https://www.awin1.com/awclick.php?mid=121520&id=3148787&p=https%3A%2F%2Fwww.reebok.eu%2Fpl-pl',
    expirationDate: '2026-12-31'
  },
  {
    id: 'deal_decathlon_sports_outlet',
    storeSlug: 'decathlon',
    storeName: 'Decathlon',
    storeCategory: 'Sports & Outdoors',
    discountBadge: 'UP TO 50% OFF',
    title: 'Up To 50% Off Outdoor, Camping, Cycling & Fitness Gear',
    description: 'High-quality technical sporting gear, Quechua tents, mountain bikes, and sportswear for all athletes.',
    code: 'DECASPORT',
    isExclusive: true,
    isVerified: true,
    rating: 4.9,
    usesCount: 2210,
    terms: 'Applies to clearance outlet and promotional collections.',
    affiliateUrl: 'https://www.awin1.com/awclick.php?mid=14353&id=3148787&p=https%3A%2F%2Fwww.decathlon.de%2F',
    expirationDate: '2026-12-31'
  },`;

const nikeMarker = "id: 'deal_nike_member_exclusive'";
const nikeIndex = content.indexOf(nikeMarker);
if (nikeIndex !== -1) {
  const dealEndIndex = content.indexOf('},', nikeIndex);
  if (dealEndIndex !== -1) {
    const insertPos = dealEndIndex + 2;
    content = content.substring(0, insertPos) + '\n' + newDeals + content.substring(insertPos);
    console.log('Deals inserted successfully');
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done!');


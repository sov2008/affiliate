export interface CouponDeal {
  id: string;
  storeSlug: string;
  storeName: string;
  storeCategory: 'Fashion & Apparel' | 'Travel & Tours' | 'Privacy & Security' | 'Eyewear & Health' | 'E-Commerce & Wholesale' | 'Dating & Lifestyle' | 'Electronics & Gadgets' | 'Education & Learning' | 'Kids & Toys' | 'Beauty & Fragrances' | 'Insurance & Finance' | 'Web Hosting & Domains' | 'Gaming & Entertainment' | 'Home & Lifestyle';
  discountBadge: string; // e.g. "12% OFF", "$8 OFF", "70% OFF"
  title: string;
  description: string;
  code: string;
  isExclusive?: boolean;
  isVerified: boolean;
  expiryDate: string;
  affiliateUrl: string;
  storeLogoText: string;
  terms?: string;
  successRate: string;
}

export interface StoreProfile {
  slug: string;
  name: string;
  category: CouponDeal['storeCategory'];
  logoText: string;
  shortDesc: string;
  fullDesc: string;
  websiteUrl: string;
  cleanDomain?: string;
  howToApply: string[];
  faqs: Array<{ question: string; answer: string }>;
  primaryAffiliateUrl: string;
}

export const STORES_DATA: StoreProfile[] = [
  {
    slug: 'chicme',
    name: 'ChicMe',
    category: 'Fashion & Apparel',
    logoText: 'CHICME',
    shortDesc: 'Worldwide trendy women’s clothing, dresses, swimwear, and footwear with seasonal promotions.',
    fullDesc: 'ChicMe is a globally recognized online fast-fashion retailer offering accessible, on-trend women’s clothing, accessories, and shoes. With international shipping and regular markdown sales, shoppers frequently apply verified promo codes to secure double-digit basket discounts.',
    websiteUrl: 'https://www.chicme.com',
    cleanDomain: 'chicme.com',
    primaryAffiliateUrl: 'https://rzekl.com/g/zcfe0k62wg367099d2cc312b8f391a/?i=3',
    howToApply: [
      'Select your desired clothing items and add them to your ChicMe shopping bag.',
      'Click the bag icon and proceed to checkout.',
      'Locate the "Coupon Code / Promo Voucher" input field in the payment summary section.',
      'Paste your copied code and click "Apply" to observe the immediate price deduction.'
    ],
    faqs: [
      {
        question: 'Can I combine multiple ChicMe coupon codes on one order?',
        answer: 'Generally, ChicMe permits one promotional discount code per order. However, promo codes frequently stack on top of pre-existing clearance items and site-wide sales.'
      },
      {
        question: 'Does the ChicMe promo code expire?',
        answer: 'All promotional codes published on PromoRadar are verified regularly. Individual codes feature validity deadlines listed on each coupon card.'
      }
    ]
  },
  {
    slug: 'glasseslit',
    name: 'Glasseslit',
    category: 'Eyewear & Health',
    logoText: 'GLASSESLIT',
    shortDesc: 'Prescription eyeglasses, blue-light blockers, designer frames, and polarized sunglasses worldwide.',
    fullDesc: 'Glasseslit delivers affordable prescription optical frames, bifocals, progressive lenses, and stylish sunglasses directly to consumers worldwide. Bypassing middleman retail markups, shoppers benefit from factory-direct pricing with additional promo voucher savings.',
    websiteUrl: 'https://www.glasseslit.com',
    cleanDomain: 'glasseslit.com',
    primaryAffiliateUrl: 'https://codeaven.com/g/v00buptjhf367099d2ccde0721ef8d/?i=3',
    howToApply: [
      'Select your preferred eyeglasses frame and input your prescription parameters.',
      'Add the customized glasses to your cart and proceed to review your order.',
      'Find the "Voucher Code" box on the checkout payment screen.',
      'Paste the verified code and confirm the instant reduction before payment.'
    ],
    faqs: [
      {
        question: 'Are Glasseslit promo codes valid on prescription lenses?',
        answer: 'Yes, verified vouchers apply across the entire catalog, including custom prescription lens coatings.'
      }
    ]
  },
  {
    slug: 'raynatours',
    name: 'RaynaTours',
    category: 'Travel & Tours',
    logoText: 'RAYNATOURS',
    shortDesc: 'Premium UAE desert safaris, Dubai city excursions, Burj Khalifa tickets, and international activities.',
    fullDesc: 'RaynaTours is an accredited destination management powerhouse offering vetted tours, VIP desert experiences, theme park passes, and dhow cruises across the United Arab Emirates and international metropolitan hubs.',
    websiteUrl: 'https://www.raynatours.com',
    cleanDomain: 'raynatours.com',
    primaryAffiliateUrl: 'https://xpuvo.com/g/2dla0dqw7i367099d2cce94db72a90/?i=3',
    howToApply: [
      'Choose your preferred tour, activity, or sightseeing tickets on RaynaTours.',
      'Select your date and number of guests, then click "Book Now".',
      'Under the booking summary, locate the "Have a Promo Code?" field.',
      'Enter the verified voucher code to unlock up to 20% savings.'
    ],
    faqs: [
      {
        question: 'Do RaynaTours promo vouchers apply to same-day bookings?',
        answer: 'Most activity discount vouchers apply to both advance reservations and immediate same-day bookings, subject to tour slot availability.'
      }
    ]
  },
  {
    slug: 'airalo',
    name: 'Airalo eSIM',
    category: 'Travel & Tours',
    logoText: 'AIRALO',
    shortDesc: 'Global eSIM cards for international travelers in 200+ countries with instant data activation.',
    fullDesc: 'Airalo is the world first and leading eSIM marketplace that eliminates roaming fees by providing digital SIM profiles for smartphones, tablets, and connected devices in over 200 countries and regions worldwide.',
    websiteUrl: 'https://www.airalo.com',
    cleanDomain: 'airalo.com',
    primaryAffiliateUrl: 'https://dhwnh.com/g/7rvld26bcl367099d2cc0471e42028/?i=3',
    howToApply: [
      'Download the Airalo app or browse the website for your travel destination country.',
      'Choose an eSIM data package (e.g. 1GB, 3GB, 5GB, 10GB or 20GB).',
      'At checkout, look for the "Apply Code / Referral Code" field.',
      'Enter verified coupon code ADM to receive an instant 10% discount on all eSIM plans.'
    ],
    faqs: [
      {
        question: 'How do I activate my Airalo eSIM after checkout?',
        answer: 'You will receive a QR code immediately upon checkout. Simply scan it in your phone cellular settings to install the eSIM profile.'
      },
      {
        question: 'Can I reuse the Airalo voucher code for multiple trips?',
        answer: 'The verified code ADM applies across all product purchases and destination packages on Airalo.'
      }
    ]
  },
  {
    slug: 'allpowers',
    name: 'ALLPOWERS',
    category: 'Electronics & Gadgets',
    logoText: 'ALLPOWERS',
    shortDesc: 'Portable power stations, solar panels, and solar generators for outdoor camping and home backup.',
    fullDesc: 'ALLPOWERS specializes in clean portable energy solutions, high-capacity LiFePO4 battery power stations, and foldable solar generators. Designed for emergency home backup, outdoor exploration, and off-grid living.',
    websiteUrl: 'https://allpowersukraine.com/',
    cleanDomain: 'iallpowers.com',
    primaryAffiliateUrl: 'https://zmgig.com/g/kq5qyagmb7367099d2ccc628098d9a/?i=3',
    howToApply: [
      'Select your desired portable power station or solar panel kit and add it to your cart.',
      'Proceed to checkout and view your order summary.',
      'Paste your verified promo code (such as BULKRATE or EXTRA10) into the promo voucher box.',
      'Click apply to see up to 12% or 3,000 UAH deducted instantly.'
    ],
    faqs: [
      {
        question: 'Are ALLPOWERS promo codes valid on solar generator bundles?',
        answer: 'Yes, ALLPOWERS verified coupon codes apply to individual power stations as well as bundled solar panel sets.'
      }
    ]
  },
  {
    slug: 'thedealoutlet',
    name: 'The Deal Outlet',
    category: 'Fashion & Apparel',
    logoText: 'DEALOUTLET',
    shortDesc: 'Luxury fashion outlet featuring designer apparel, shoes, bags, and luxury accessories at up to 75% off.',
    fullDesc: 'The Deal Outlet is a premier Middle Eastern luxury outlet platform curating authentic designer clothing, luxury shoes, leather bags, and prestige accessories from world-renowned fashion houses with deep reductions.',
    websiteUrl: 'https://thedealoutlet.com',
    cleanDomain: 'thedealoutlet.com',
    primaryAffiliateUrl: 'https://bywiola.com/g/2snsgzg8z7367099d2ccb6c5579bcf/?i=3',
    howToApply: [
      'Browse designer collections and add luxury fashion items to your shopping cart.',
      'Open the shopping bag and proceed to order confirmation.',
      'Input verified coupon FIRST15 for first-time orders or enjoy automatic 75% catalog reductions.',
      'Enjoy expedited regional delivery and free shipping over 350 AED.'
    ],
    faqs: [
      {
        question: 'Are products on The Deal Outlet 100% authentic?',
        answer: 'Yes, all luxury products are sourced directly from authorized luxury brand distributors and fashion houses.'
      }
    ]
  },
  {
    slug: 'vogacloset',
    name: 'VogaCloset',
    category: 'Fashion & Apparel',
    logoText: 'VOGACLOSET',
    shortDesc: 'London-based fast fashion destination delivering European runway styles to international shoppers.',
    fullDesc: 'VogaCloset is a leading online fashion boutique delivering women, men, and kids European high-street fashion, dresses, footwear, and accessories with dedicated localized customer support and cash-on-delivery options.',
    websiteUrl: 'https://vogacloset.com',
    cleanDomain: 'vogacloset.com',
    primaryAffiliateUrl: 'https://bywiola.com/g/6silcjvoa9367099d2ccb52609ec28/?i=3',
    howToApply: [
      'Select your fashion items and navigate to the checkout bag.',
      'Under the payment summary, enter promo code SALE or LVD.',
      'Watch your basket total discount by up to 20% to 80% immediately.'
    ],
    faqs: [
      {
        question: 'Does VogaCloset offer cash on delivery and returns?',
        answer: 'Yes, VogaCloset supports hassle-free returns and local payment options across GCC and international destinations.'
      }
    ]
  },
  {
    slug: 'kodland',
    name: 'Kodland',
    category: 'Education & Learning',
    logoText: 'KODLAND',
    shortDesc: 'Interactive live online coding, digital art, and game development courses for kids and teens aged 7–17.',
    fullDesc: 'Kodland is an international ed-tech academy empowering young creators with project-based computer science, game creation in Roblox and Unity, Python programming, and digital design taught by certified live tutors.',
    websiteUrl: 'https://kodland.com',
    cleanDomain: 'kodland.org',
    primaryAffiliateUrl: 'https://ewwhk.com/g/11du4h2rtq367099d2cca5fc6f34cb/?i=31',
    howToApply: [
      'Book a complimentary trial lesson or select a full course module on Kodland.',
      'Enter the student details and proceed to the course tuition payment screen.',
      'Paste promo code START30-2 or START10 into the coupon box.',
      'Receive up to 30% discount on lesson packages.'
    ],
    faqs: [
      {
        question: 'Are Kodland classes conducted one-on-one or in small groups?',
        answer: 'Kodland offers both individual 1-on-1 tutoring and interactive micro-groups to match each student pace.'
      }
    ]
  },
  {
    slug: 'purevpn',
    name: 'PureVPN',
    category: 'Privacy & Security',
    logoText: 'PUREVPN',
    shortDesc: 'High-speed encrypted VPN with 6,500+ servers, zero-logging policy, and Wi-Fi security shields.',
    fullDesc: 'PureVPN safeguards your digital footprint, hides your IP address, and encrypts public Wi-Fi transmissions across iOS, Android, macOS, and Windows with multi-gigabit servers worldwide.',
    websiteUrl: 'https://www.purevpn.com',
    cleanDomain: 'purevpn.com',
    primaryAffiliateUrl: 'https://plrvq.com/g/g14urj1gid367099d2ccdd63dd688c/?i=3',
    howToApply: [
      'Select a 2-year or 1-year privacy subscription package on PureVPN.',
      'Look for the coupon code input field beneath the checkout payment options.',
      'Paste the verified promo code admitad20 to secure an extra 20% discount on all plans.'
    ],
    faqs: [
      {
        question: 'Does PureVPN offer a money-back guarantee?',
        answer: 'Yes, all verified promo subscriptions include an unconditional 31-day money-back satisfaction guarantee.'
      }
    ]
  },
  {
    slug: 'expressvpn',
    name: 'ExpressVPN',
    category: 'Privacy & Security',
    logoText: 'EXPRESSVPN',
    shortDesc: 'Ultra-fast global VPN service across 105 countries with TrustedServer RAM-only privacy technology.',
    fullDesc: 'ExpressVPN is the premier global standard in personal cybersecurity. Featuring proprietary Lightway protocol, military-grade AES-256 encryption, and verified independent privacy audits, it shields personal communications and digital browsing.',
    websiteUrl: 'https://www.expressvpn.com',
    cleanDomain: 'expressvpn.com',
    primaryAffiliateUrl: 'https://flirtcheck.site/go?offer=admitad_103765&source=deals_expressvpn&trigger=store_header&intent=deals',
    howToApply: [
      'Select the 12-month plan through our verified discount link.',
      'Notice the 49% discount and 3 bonus complimentary months applied automatically.',
      'Complete your secure checkout with credit card, PayPal, or Bitcoin.'
    ],
    faqs: [
      {
        question: 'Does ExpressVPN keep activity logs?',
        answer: 'No. ExpressVPN operates under a strict, independently audited no-logs policy powered by diskless TrustedServer infrastructure.'
      }
    ]
  },
  {
    slug: 'keepersecurity',
    name: 'Keeper Security',
    category: 'Privacy & Security',
    logoText: 'KEEPER',
    shortDesc: 'Zero-knowledge password manager, private media vault, and dark web monitoring suite.',
    fullDesc: 'Keeper Security protects passwords, personal credentials, private photos, and confidential documents with zero-trust, zero-knowledge encryption. It prevents account takeovers, SIM-swap extortion, and credential stuffing attacks.',
    websiteUrl: 'https://www.keepersecurity.com',
    cleanDomain: 'keepersecurity.com',
    primaryAffiliateUrl: 'https://ziejy.com/g/d08cg0w8zk367099d2cceb9db1a7c5/?i=3',
    howToApply: [
      'Choose between Keeper Unlimited or Family Plan.',
      'Click through our verified link to activate automatic 50% subscription savings.',
      'Enjoy dark web monitoring and zero-knowledge encrypted vaults on all your devices.'
    ],
    faqs: [
      {
        question: 'What is zero-knowledge encryption?',
        answer: 'It means your master password and encryption keys never leave your device. Even Keeper employees cannot access your vault.'
      }
    ]
  },
  {
    slug: 'qustodio',
    name: 'Qustodio',
    category: 'Privacy & Security',
    logoText: 'QUSTODIO',
    shortDesc: 'Comprehensive digital safety, location tracking, and screen time balance for families and children.',
    fullDesc: 'Qustodio is the world leading digital wellbeing and parental defense platform. It equips families with real-time screen supervision, cyberbullying alerts, location tracking, and content filtering across smartphones, tablets, and computers.',
    websiteUrl: 'https://www.qustodio.com',
    cleanDomain: 'qustodio.com',
    primaryAffiliateUrl: 'https://flirtcheck.site/go?offer=admitad_144643&source=deals_qustodio&trigger=store_header&intent=deals',
    howToApply: [
      'Select your family plan based on the number of supervised devices.',
      'Paste our verified voucher code FAMILY20 into the promotional discount field.',
      'Enjoy 20% instant annual subscription savings.'
    ],
    faqs: [
      {
        question: 'Does Qustodio work on both iOS and Android?',
        answer: 'Yes, Qustodio operates seamlessly across iOS, Android, macOS, Windows, and Kindle devices.'
      }
    ]
  },
  {
    slug: 'onlinesim',
    name: 'OnlineSim',
    category: 'Privacy & Security',
    logoText: 'ONLINESIM',
    shortDesc: 'Virtual phone numbers for instant SMS activation and privacy protection across 30+ countries.',
    fullDesc: 'OnlineSim offers temporary and rent-based virtual mobile numbers for anonymous SMS verification across social apps, digital platforms, and online services without exposing real personal SIM data.',
    websiteUrl: 'https://onlinesim.one',
    cleanDomain: 'onlinesim.io',
    primaryAffiliateUrl: 'https://flirtcheck.site/go?offer=admitad_191148&source=deals_onlinesim&trigger=store_header&intent=deals',
    howToApply: [
      'Register a free account on OnlineSim.',
      'Navigate to the "Top-up Balance" section in your user dashboard.',
      'Input the promo voucher code into the promotional discount box.',
      'Enjoy bonus activation credits or discounted line rental rates.'
    ],
    faqs: [
      {
        question: 'Can I use OnlineSim virtual numbers for instant account activations?',
        answer: 'Yes, OnlineSim virtual numbers receive SMS verification codes instantly from WhatsApp, Telegram, Google, and top digital services.'
      }
    ]
  },
  {
    slug: 'alibaba',
    name: 'Alibaba',
    category: 'E-Commerce & Wholesale',
    logoText: 'ALIBABA',
    shortDesc: 'Global B2B wholesale platform for consumer electronics, apparel, and direct manufacturer sourcing.',
    fullDesc: 'Alibaba connects millions of international buyers with verified suppliers, providing Trade Assurance buyer protection and seasonal coupon drops for wholesale and sample orders.',
    websiteUrl: 'https://www.alibaba.com',
    cleanDomain: 'alibaba.com',
    primaryAffiliateUrl: 'https://rzekl.com/g/384usiqcl3367099d2cc219aa26f6f/?i=3',
    howToApply: [
      'Source your products on Alibaba and negotiate or add to checkout.',
      'Apply verified promo code HH12 for $20 off or unlock up to 80% below retail via the Saving Spotlight.'
    ],
    faqs: [
      {
        question: 'Does Trade Assurance cover orders discounted with coupons?',
        answer: 'Yes, Trade Assurance fully covers purchases regardless of promotional coupon deductions.'
      }
    ]
  },
  {
    slug: 'jashanmal',
    name: 'Jashanmal',
    category: 'E-Commerce & Wholesale',
    logoText: 'JASHANMAL',
    shortDesc: 'Prestigious department store offering luxury home goods, cookware, luggage, and lifestyle brands.',
    fullDesc: 'Jashanmal has been a cornerstone of retail excellence across the GCC since 1919, featuring high-end home appliances, premium kitchenware, travel luggage from Delsey and Rimowa, and fashion accessories.',
    websiteUrl: 'https://www.jashanmal.com',
    cleanDomain: 'jashanmal.com',
    primaryAffiliateUrl: 'https://codeaven.com/g/bsyhi8m623367099d2cc62651c44e1/?i=31',
    howToApply: [
      'Browse luxury home and kitchenware collections on Jashanmal.',
      'Add items to your cart and proceed to the checkout screen.',
      'Enter verified promotional code TKFL9 to receive an immediate 10% discount on your order.'
    ],
    faqs: [
      {
        question: 'Is Jashanmal voucher valid on premium cookware brands?',
        answer: 'Yes, promo code TKFL9 provides a 10% reduction across eligible premium home and kitchenware lines.'
      }
    ]
  },
  {
    slug: 'dabdoob',
    name: 'Dabdoob',
    category: 'Kids & Toys',
    logoText: 'DABDOOB',
    shortDesc: 'Top-rated kids toy app and store offering gift wrapping, popular games, and rapid doorstep delivery.',
    fullDesc: 'Dabdoob is the leading toy-shopping destination across UAE, Saudi Arabia, Kuwait, and Bahrain, curating the best educational toys, action figures, board games, and children celebration gifts.',
    websiteUrl: 'https://dabdoob.com',
    cleanDomain: 'dabdoob.com',
    primaryAffiliateUrl: 'https://rzekl.com/g/du3xi8b8ry367099d2cca2c57142dd/?i=31',
    howToApply: [
      'Select toys or games on Dabdoob and add complimentary gift wrapping.',
      'Enter verified coupon TKFL7 at checkout.',
      'Save 10% across UAE, Bahrain, Kuwait, and up to 25% in KSA.'
    ],
    faqs: [
      {
        question: 'Can I add customized greeting cards on Dabdoob?',
        answer: 'Yes, Dabdoob offers specialized gift wrapping and personalized greeting messages with every toy delivery.'
      }
    ]
  },
  {
    slug: 'vperfumes',
    name: 'Vperfumes',
    category: 'Beauty & Fragrances',
    logoText: 'VPERFUMES',
    shortDesc: 'Authentic luxury oriental and French perfumes, oud oils, and designer scents with fast GCC shipping.',
    fullDesc: 'Vperfumes is one of the largest perfume retail chains in the GCC, offering 100% authentic designer fragrances, niche oud scents, French perfumes, and luxury gift sets with free delivery perks.',
    websiteUrl: 'https://vperfumes.com',
    cleanDomain: 'vperfumes.com',
    primaryAffiliateUrl: 'https://wbbsv.com/g/uaami8ff60367099d2ccbe59cac899/?i=3',
    howToApply: [
      'Select your favorite eau de parfum, niche fragrance, or oud oil on Vperfumes.',
      'Add products totaling 200 AED or more to your cart.',
      'Complimentary fast delivery is activated automatically at checkout.'
    ],
    faqs: [
      {
        question: 'Are all fragrances on Vperfumes 100% original?',
        answer: 'Yes, Vperfumes guarantees 100% genuine products sourced directly from authorized fragrance distributors.'
      }
    ]
  },
  {
    slug: 'aovica',
    name: 'Aovica Store',
    category: 'Electronics & Gadgets',
    logoText: 'AOVICA',
    shortDesc: 'Innovative smart electronics, audio accessories, and digital gadgets with official AliExpress warranty.',
    fullDesc: 'Aovica Official Store on AliExpress provides high-performance electronic accessories, smart wireless devices, and computer peripherals backed by buyer protection and international shipping.',
    websiteUrl: 'https://aliexpress.com',
    cleanDomain: 'aovica.com',
    primaryAffiliateUrl: 'https://rcpsj.com/g/uymluxmlet367099d2cccaca192191/?i=31',
    howToApply: [
      'Add Aovica electronics products to your shopping cart.',
      'Enter exclusive coupon code ADMITADN62A7 at the AliExpress payment step.',
      'Receive a massive 40% instant reduction on all qualifying electronics.'
    ],
    faqs: [
      {
        question: 'Is the 40% discount valid for all countries?',
        answer: 'Yes, the promo code applies internationally to all orders placed through the official Aovica store.'
      }
    ]
  },
  {
    slug: 'markformelle',
    name: 'Mark Formelle',
    category: 'Fashion & Apparel',
    logoText: 'MARKFORMELLE',
    shortDesc: 'Comfortable family homewear, stylish casual basics, knitwear, and organic everyday essentials.',
    fullDesc: 'Mark Formelle creates cozy, modern casualwear, breathable loungewear, and premium cotton essentials for men, women, and children with sustainable production standards.',
    websiteUrl: 'https://markformelle.com',
    cleanDomain: 'markformelle.com',
    primaryAffiliateUrl: 'https://xqjeo.com/g/xu8ibhasrf367099d2cc5a98e4de8b/?i=31',
    howToApply: [
      'Select your homewear and everyday casual items.',
      'Enter promo code ADMMF436 at checkout.',
      'Enjoy an instant 10% reduction on your entire basket.'
    ],
    faqs: [
      {
        question: 'Does the promo code stack with seasonal sale discounts?',
        answer: 'Yes, the voucher applies to your total order summary.'
      }
    ]
  },
  {
    slug: 'elitedate',
    name: 'EliteDate',
    category: 'Dating & Lifestyle',
    logoText: 'ELITEDATE',
    shortDesc: 'Curated relationship platform featuring manual profile inspection and intentional matching.',
    fullDesc: 'EliteDate is an acclaimed relationship matching platform operating across Central Europe with verified single profiles, zero automated bots, and high conversation reciprocity.',
    websiteUrl: 'https://www.elitedate.cz',
    cleanDomain: 'elitedate.com',
    primaryAffiliateUrl: 'https://flirtcheck.site/go?offer=admitad_49070&source=deals_elitedate&trigger=store_header&intent=deals',
    howToApply: [
      'Complete free registration through our verified invitation link.',
      'Complete the relationship compatibility questionnaire.',
      'Access verified local profiles with complimentary onboarding perks.'
    ],
    faqs: [
      {
        question: 'Is EliteDate registration completely free?',
        answer: 'Yes, profile creation, questionnaire scoring, and initial match browsing are completely free of charge.'
      }
    ]
  },
  {
    slug: 'verified-match',
    name: 'Verified Match VIP',
    category: 'Dating & Lifestyle',
    logoText: 'VERIFIED',
    shortDesc: 'Pre-vetted singles network enforcing mandatory camera-liveness checks and zero bot tolerance.',
    fullDesc: 'Verified Match is an elite alternative to legacy swipe apps, requiring mandatory facial biometric verification. Users bypass fake bots, unblur incoming match queues, and connect exclusively with authentic local singles.',
    websiteUrl: 'https://flirtcheck.site/go/verified-match',
    cleanDomain: 'match.com',
    primaryAffiliateUrl: 'https://flirtcheck.site/go/verified-match?src=deals_portal&ctx=store_header&intent=deals',
    howToApply: [
      'Click REVEAL CODE & ACTIVATE to unlock the introductory voucher.',
      'Complete the 60-second real-time camera verification.',
      'Enjoy unrestricted incoming likes and direct messaging.'
    ],
    faqs: [
      {
        question: 'Does the introductory pass bypass all swipe limits?',
        answer: 'Yes, the introductory pass unthrottles your profile queue and grants unblurred visibility into users who already liked you.'
      }
    ]
  },
  {
    slug: 'discreet-local',
    name: 'Discreet Local Pass',
    category: 'Dating & Lifestyle',
    logoText: 'DISCREET',
    shortDesc: 'High-privacy casual encounter network with stealth profile browsing and zero social media sync.',
    fullDesc: 'Discreet Local provides hardened privacy for singles seeking casual dating without digital footprint leaks. Features burner number compatibility, screenshot protection, and incognito search modes.',
    websiteUrl: 'https://flirtcheck.site/go/discreet-local',
    cleanDomain: 'ashleymadison.com',
    primaryAffiliateUrl: 'https://flirtcheck.site/go/discreet-local?src=deals_portal&ctx=store_header&intent=deals',
    howToApply: [
      'Activate your stealth voucher link.',
      'Register with an ephemeral burner number or private email.',
      'Browse encrypted local encounter matches in stealth mode.'
    ],
    faqs: [
      {
        question: 'Will my contacts or social media accounts ever be linked?',
        answer: 'No. The platform strictly isolates account data with zero third-party graph synchronization.'
      }
    ]
  },
  {
    slug: 'spokeo',
    name: 'Spokeo Reverse Scan',
    category: 'Privacy & Security',
    logoText: 'SPOKEO',
    shortDesc: 'Forensic digital footprint, image hash, and phone number verification search engine.',
    fullDesc: 'Spokeo aggregates billions of public records, phone directories, and social profiles to verify the true identity behind any online match in seconds.',
    websiteUrl: 'https://flirtcheck.site/go/deep-lookup',
    cleanDomain: 'spokeo.com',
    primaryAffiliateUrl: 'https://flirtcheck.site/go/deep-lookup?src=deals_portal&ctx=store_header&intent=deals',
    howToApply: [
      'Click to activate the forensic promo search rate.',
      'Enter the suspicious phone number, username, or photo details.',
      'View verified background reports and social profiles.'
    ],
    faqs: [
      {
        question: 'Can the audited person see that I searched for them?',
        answer: 'No. All searches are 100% confidential and anonymous.'
      }
    ]
  },
  {
    slug: 'huawei',
    name: 'Huawei',
    category: 'Electronics & Gadgets',
    logoText: 'HUAWEI',
    shortDesc: 'Official Huawei store for smart wearables, laptops, tablets, audio gear, and cutting-edge mobile innovations.',
    fullDesc: 'Huawei is an internationally acclaimed technology powerhouse offering premium smart devices, ultra-thin MateBook laptops, MatePad tablets, and health-tracking smartwatches backed by manufacturer warranty and official bundle promotions.',
    websiteUrl: 'https://consumer.huawei.com',
    cleanDomain: 'consumer.huawei.com',
    primaryAffiliateUrl: 'https://ogsib.com/g/mdqug3zf25367099d2cc25829bc3a0/?ulp=https%3A%2F%2Fconsumer.huawei.com%2Fsa-en%2Foffer%2F&subid=promoradar_huawei',
    howToApply: [
      'Browse through the official Huawei store offers section.',
      'Select qualifying smartphones, smartwatches, or MateBook devices.',
      'Discounts, gift bundles, and free delivery perks are applied automatically at checkout via our verified partner link.'
    ],
    faqs: [
      {
        question: 'Are products purchased via the partner link covered by official warranty?',
        answer: 'Yes, all orders are fulfilled directly by official Huawei distribution channels and include full standard manufacturer warranty.'
      },
      {
        question: 'Do Huawei discounts stack with trade-in bonuses?',
        answer: 'Official promotional discounts frequently combine with trade-in credits on selected devices.'
      }
    ]
  },
  {
    slug: 'nazih',
    name: 'Nazih Cosmetics',
    category: 'Beauty & Fragrances',
    logoText: 'NAZIH',
    shortDesc: 'Middle East premier salon-grade haircare, skincare, makeup, and professional beauty accessories.',
    fullDesc: 'Nazih Group is one of the Middle East most trusted beauty and cosmetic retailers, distributing world-class professional haircare, spa products, skincare, and electrical styling tools to both salons and consumers.',
    websiteUrl: 'https://nazih.sa',
    cleanDomain: 'nazih.sa',
    primaryAffiliateUrl: 'https://wpmsx.com/g/ymc795qmu0367099d2cc6cde95af8d/?ulp=https%3A%2F%2Fnazih.sa%2Fen%2F&subid=promoradar_nazih',
    howToApply: [
      'Choose your professional haircare, salon styling tools, or skincare items on the Nazih official store.',
      'Add products to your cart and proceed to the payment summary.',
      'Official promotional pricing and direct partner discounts apply automatically on checkout.'
    ],
    faqs: [
      {
        question: 'Are all products on Nazih 100% authentic?',
        answer: 'Yes, Nazih is the official authorized distributor for premier global salon and cosmetic brands.'
      },
      {
        question: 'Is fast shipping available for Nazih orders?',
        answer: 'Yes, Nazih offers rapid delivery across GCC territories with comprehensive package tracking.'
      }
    ]
  },
  {
    slug: 'touch',
    name: 'Touch',
    category: 'Electronics & Gadgets',
    logoText: 'TOUCH',
    shortDesc: 'Certified smartphones, Apple tech, smart gadgets, audio gear, and gaming hardware with official warranty.',
    fullDesc: 'Touch is a premier electronics and digital retail brand specializing in authentic smartphones, tablets, laptops, gaming peripherals, and audio accessories with warranty coverage and prompt delivery.',
    websiteUrl: 'https://touch.com.ua',
    cleanDomain: 'touch.com.ua',
    primaryAffiliateUrl: 'https://wbbsv.com/g/ynys1f2mjp367099d2cc0e81904d8b/?ulp=https%3A%2F%2Ftouch.com.ua%2F&subid=promoradar_touch',
    howToApply: [
      'Browse verified smartphones, audio gear, or gadgets on the official Touch digital catalog.',
      'Add your chosen tech items to the shopping basket.',
      'Promotional discounts and direct partner rates apply directly at checkout via our verified link.'
    ],
    faqs: [
      {
        question: 'Are tech items on Touch covered by official warranty?',
        answer: 'Yes, all electronic devices come with standard manufacturer and distributor warranty certificates.'
      },
      {
        question: 'Are there seasonal discounts on flagship smartphones?',
        answer: 'Touch regularly runs markdown campaigns on flagship smartphones, wireless earbuds, and computer accessories.'
      }
    ]
  },
  {
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

export const COUPONS_DATA: CouponDeal[] = [

  // ALLPOWERS
  {
    id: 'admitad_allpowers_bulk',
    storeSlug: 'allpowers',
    storeName: 'ALLPOWERS',
    storeCategory: 'Electronics & Gadgets',
    discountBadge: '11% OFF',
    title: 'Buy 2, Get 11% Off On Portable Power Stations & Solar Units',
    description: 'Save an instant 11% when ordering 2 or more portable power units or high-efficiency solar panels.',
    code: 'BULKRATE',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'November 20, 2026',
    affiliateUrl: 'https://zmgig.com/g/kq5qyagmb7367099d2ccc628098d9a/?i=3',
    storeLogoText: 'ALLPOWERS',
    terms: 'Valid on multi-unit orders of power stations and solar generator sets.',
    successRate: '99.4%'
  },
  {
    id: 'admitad_allpowers_extra12',
    storeSlug: 'allpowers',
    storeName: 'ALLPOWERS',
    storeCategory: 'Electronics & Gadgets',
    discountBadge: '12% OFF',
    title: '12% Off High-Capacity Energy Storage Orders Over 60,000 UAH',
    description: 'Maximum discount tier for heavy-duty emergency backup systems and LiFePO4 home power stations.',
    code: 'EXTRA12',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'November 20, 2026',
    affiliateUrl: 'https://zmgig.com/g/ee7b2vbv5q367099d2ccc628098d9a/?i=3',
    storeLogoText: 'ALLPOWERS',
    terms: 'Minimum qualifying order value 60,000 UAH.',
    successRate: '98.8%'
  },
  {
    id: 'admitad_allpowers_extra10',
    storeSlug: 'allpowers',
    storeName: 'ALLPOWERS',
    storeCategory: 'Electronics & Gadgets',
    discountBadge: '10% OFF',
    title: 'Storewide 10% Off On All Portable Generators & Solar Gear',
    description: 'Apply promo code EXTRA10 for an instant 10% reduction across all power units and foldable panels.',
    code: 'EXTRA10',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'November 20, 2026',
    affiliateUrl: 'https://zmgig.com/g/5rhr406s82367099d2ccc628098d9a/?i=3',
    storeLogoText: 'ALLPOWERS',
    terms: 'No minimum order threshold. Storewide applicability.',
    successRate: '99.1%'
  },
  {
    id: 'admitad_allpowers_afua3off',
    storeSlug: 'allpowers',
    storeName: 'ALLPOWERS',
    storeCategory: 'Electronics & Gadgets',
    discountBadge: '3,000 UAH OFF',
    title: '3,000 UAH Instant Voucher On Orders Over 28,000 UAH',
    description: 'Direct cash deduction voucher applied at checkout on mid-to-high range solar generators.',
    code: 'AFUA3OFF',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'November 30, 2026',
    affiliateUrl: 'https://zmgig.com/g/32l1nlv9t7367099d2ccc628098d9a/?i=3',
    storeLogoText: 'ALLPOWERS',
    terms: 'Valid on qualifying orders above 28,000 UAH.',
    successRate: '97.9%'
  },

  // Airalo eSIM
  {
    id: 'admitad_airalo_10',
    storeSlug: 'airalo',
    storeName: 'Airalo eSIM',
    storeCategory: 'Travel & Tours',
    discountBadge: '10% OFF',
    title: '10% Off All International Travel eSIM Data Packages Worldwide',
    description: 'Enjoy seamless mobile data roaming in 200+ countries. Enter promo code ADM to save 10% on every eSIM profile.',
    code: 'ADM',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://dhwnh.com/g/7rvld26bcl367099d2cc0471e42028/?i=3',
    storeLogoText: 'AIRALO',
    terms: 'Applies to all country, regional, and global eSIM data packages.',
    successRate: '99.8%'
  },

  // The Deal Outlet
  {
    id: 'admitad_dealoutlet_75',
    storeSlug: 'thedealoutlet',
    storeName: 'The Deal Outlet',
    storeCategory: 'Fashion & Apparel',
    discountBadge: '75% OFF',
    title: 'Up To 75% Off Authentic Designer Fashion & Luxury Accessories',
    description: 'Exclusive outlet clearance on luxury European designer apparel, shoes, and luxury handbags.',
    code: 'ACTIVATE',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://bywiola.com/g/2snsgzg8z7367099d2ccb6c5579bcf/?i=3',
    storeLogoText: 'DEALOUTLET',
    terms: 'Discount applied automatically to curated catalog selections.',
    successRate: '99.2%'
  },
  {
    id: 'admitad_dealoutlet_first15',
    storeSlug: 'thedealoutlet',
    storeName: 'The Deal Outlet',
    storeCategory: 'Fashion & Apparel',
    discountBadge: '15% OFF',
    title: '15% Off Your First Order On The Deal Outlet App',
    description: 'Download the app and apply code FIRST15 to enjoy an additional 15% reduction on your first luxury designer purchase.',
    code: 'FIRST15',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://bywiola.com/g/flre7moyl6367099d2ccb6c5579bcf/?i=3',
    storeLogoText: 'DEALOUTLET',
    terms: 'Valid on initial app orders. Can be combined with free shipping over 350 AED.',
    successRate: '98.5%'
  },

  // Kodland
  {
    id: 'admitad_kodland_30',
    storeSlug: 'kodland',
    storeName: 'Kodland',
    storeCategory: 'Education & Learning',
    discountBadge: '30% OFF',
    title: '30% Off Live Kids Online Coding & Game Development Courses',
    description: 'Save 30% on interactive programming, Roblox game creation, and Python modules with live certified tutors.',
    code: 'START30-2',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://ewwhk.com/g/11du4h2rtq367099d2cca5fc6f34cb/?i=31',
    storeLogoText: 'KODLAND',
    terms: 'Applicable on multi-month course packages for students aged 7–17.',
    successRate: '99.0%'
  },
  {
    id: 'admitad_kodland_10',
    storeSlug: 'kodland',
    storeName: 'Kodland',
    storeCategory: 'Education & Learning',
    discountBadge: '10% OFF',
    title: '10% Off First Kodland Course Package With Live Tutors',
    description: 'Empower your child with foundational digital creator skills. Includes free 1-on-1 intro assessment.',
    code: 'START10',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'October 31, 2026',
    affiliateUrl: 'https://ewwhk.com/g/njpvx5yu45367099d2cca5fc6f34cb/?i=3',
    storeLogoText: 'KODLAND',
    terms: 'Valid on initial course enrollment.',
    successRate: '98.6%'
  },

  // VogaCloset
  {
    id: 'admitad_vogacloset_sale',
    storeSlug: 'vogacloset',
    storeName: 'VogaCloset',
    storeCategory: 'Fashion & Apparel',
    discountBadge: '80% OFF',
    title: 'Biggest Sale Of The Year: Up to 80% Off European Fashion',
    description: 'Explore thousands of runway dresses, shoes, and trendy outerwear with verified promotional code SALE.',
    code: 'SALE',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://bywiola.com/g/6silcjvoa9367099d2ccb52609ec28/?i=3',
    storeLogoText: 'VOGACLOSET',
    terms: 'Valid across promotional fashion catalog. Express home delivery available.',
    successRate: '98.1%'
  },
  {
    id: 'admitad_vogacloset_lvd',
    storeSlug: 'vogacloset',
    storeName: 'VogaCloset',
    storeCategory: 'Fashion & Apparel',
    discountBadge: '20% OFF',
    title: 'Extra 20% Off Clothing & Shoes With Code LVD',
    description: 'Stack an extra 20% discount on women and men fashion collections. Fast shipping and easy returns.',
    code: 'LVD',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://bywiola.com/g/l5jb3bfnoc367099d2ccb52609ec28/?i=31',
    storeLogoText: 'VOGACLOSET',
    terms: 'Excludes select beauty products. Valid across participating brands.',
    successRate: '97.5%'
  },

  // Jashanmal
  {
    id: 'admitad_jashanmal_10',
    storeSlug: 'jashanmal',
    storeName: 'Jashanmal',
    storeCategory: 'E-Commerce & Wholesale',
    discountBadge: '10% OFF',
    title: '10% Off Luxury Home Goods, Cookware & Travel Luggage',
    description: 'Enjoy 10% off prestigious department store collections including premium kitchenware, Delsey luggage, and home appliances.',
    code: 'TKFL9',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://codeaven.com/g/bsyhi8m623367099d2cc62651c44e1/?i=31',
    storeLogoText: 'JASHANMAL',
    terms: 'Valid on qualifying luxury home and travel catalog items in the UAE.',
    successRate: '98.9%'
  },

  // Dabdoob
  {
    id: 'admitad_dabdoob_10',
    storeSlug: 'dabdoob',
    storeName: 'Dabdoob',
    storeCategory: 'Kids & Toys',
    discountBadge: '10% OFF',
    title: '10% to 25% Off Kids Toys, Games & Gift Sets',
    description: '10% off for UAE, Kuwait, and Bahrain, and up to 25% off for KSA. Includes complimentary gift wrapping options.',
    code: 'TKFL7',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://rzekl.com/g/du3xi8b8ry367099d2cca2c57142dd/?i=31',
    storeLogoText: 'DABDOOB',
    terms: 'Max discount 50 SAR in KSA. Standard 10% across GCC.',
    successRate: '99.0%'
  },

  // Vperfumes
  {
    id: 'admitad_vperfumes_delivery',
    storeSlug: 'vperfumes',
    storeName: 'Vperfumes',
    storeCategory: 'Beauty & Fragrances',
    discountBadge: 'FREE DELIVERY',
    title: 'Free Shipping On Luxury Perfumes & Oud Over 200 AED',
    description: '100% original French and oriental designer perfumes, bakhoor, and luxury gift sets with free express regional delivery.',
    code: 'ACTIVATE',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://wbbsv.com/g/uaami8ff60367099d2ccbe59cac899/?i=3',
    storeLogoText: 'VPERFUMES',
    terms: 'Automatic activation on orders exceeding 200 AED.',
    successRate: '99.5%'
  },

  // Aovica
  {
    id: 'admitad_aovica_40',
    storeSlug: 'aovica',
    storeName: 'Aovica Store',
    storeCategory: 'Electronics & Gadgets',
    discountBadge: '40% OFF',
    title: '40% Off Smart Wireless Electronics & Audio Gadgets',
    description: 'Exclusive 40% discount voucher valid across all products in the official Aovica store on AliExpress.',
    code: 'ADMITADN62A7',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://rcpsj.com/g/uymluxmlet367099d2cccaca192191/?i=31',
    storeLogoText: 'AOVICA',
    terms: 'Valid on entire Aovica store catalog on AliExpress.',
    successRate: '98.3%'
  },

  // Mark Formelle
  {
    id: 'admitad_markformelle_10',
    storeSlug: 'markformelle',
    storeName: 'Mark Formelle',
    storeCategory: 'Fashion & Apparel',
    discountBadge: '10% OFF',
    title: '10% Off Comfortable Everyday Loungewear & Basics',
    description: 'Save 10% on eco-friendly family homewear, stylish cotton loungewear, and wardrobe essentials with promo code ADMMF436.',
    code: 'ADMMF436',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://xqjeo.com/g/xu8ibhasrf367099d2cc5a98e4de8b/?i=31',
    storeLogoText: 'MARKFORMELLE',
    terms: 'Valid on regular and promotional items.',
    successRate: '97.8%'
  },

  // PureVPN (Real admitad code)
  {
    id: 'admitad_purevpn_admitad20',
    storeSlug: 'purevpn',
    storeName: 'PureVPN',
    storeCategory: 'Privacy & Security',
    discountBadge: '20% EXTRA',
    title: 'Extra 20% Off All VPN Security Plans & Bundles',
    description: 'Stack an extra 20% discount on top of ongoing annual and multi-year sale prices using verified code admitad20.',
    code: 'admitad20',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'October 31, 2026',
    affiliateUrl: 'https://plrvq.com/g/g14urj1gid367099d2ccdd63dd688c/?i=3',
    storeLogoText: 'PUREVPN',
    terms: 'Valid on 1-year and 2-year subscriptions. Includes 31-day money-back guarantee.',
    successRate: '99.5%'
  },

  // Keeper Security (Real admitad coupons)
  {
    id: 'admitad_keeper_50',
    storeSlug: 'keepersecurity',
    storeName: 'Keeper Security',
    storeCategory: 'Privacy & Security',
    discountBadge: '50% OFF',
    title: '50% Off Keeper Unlimited & Family Password Manager',
    description: 'Safeguard your passwords, personal identity, and private documents with zero-trust encryption at half price.',
    code: 'ACTIVATE',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://ziejy.com/g/d08cg0w8zk367099d2cceb9db1a7c5/?i=3',
    storeLogoText: 'KEEPER',
    terms: 'Applies to first year of Keeper Unlimited or Family plan.',
    successRate: '99.2%'
  },
  {
    id: 'admitad_keeper_30',
    storeSlug: 'keepersecurity',
    storeName: 'Keeper Security',
    storeCategory: 'Privacy & Security',
    discountBadge: '30% OFF',
    title: 'Military, First Responders & Healthcare: 30% Off',
    description: 'Special hero appreciation rate: 30% discount on all cybersecurity suites for qualified personnel.',
    code: 'ACTIVATE',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://ziejy.com/g/7bhb9c6ska367099d2cceb9db1a7c5/?i=3',
    storeLogoText: 'KEEPER',
    terms: 'Verification of professional status requested at checkout.',
    successRate: '98.7%'
  },

  // Glasseslit (Real admitad codes)
  {
    id: 'admitad_glasseslit_ad10',
    storeSlug: 'glasseslit',
    storeName: 'Glasseslit',
    storeCategory: 'Eyewear & Health',
    discountBadge: '$10 OFF',
    title: '$10 Off Prescription Glasses & Designer Optical Frames',
    description: 'Direct $10 checkout reduction on any prescription eyeglasses or sunglasses order using code AD10.',
    code: 'AD10',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://codeaven.com/g/v00buptjhf367099d2ccde0721ef8d/?i=3',
    storeLogoText: 'GLASSESLIT',
    terms: 'Valid on frames with lenses. Combinable with free shipping over threshold.',
    successRate: '99.4%'
  },
  {
    id: 'admitad_glasseslit_50off',
    storeSlug: 'glasseslit',
    storeName: 'Glasseslit',
    storeCategory: 'Eyewear & Health',
    discountBadge: '50% OFF',
    title: 'Buy 1 Pair, Get Second Pair 50% Off (Frames + Lenses)',
    description: 'Huge bogo discount: order two pairs of prescription glasses and receive 50% off the second complete pair.',
    code: '50OFF',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://codeaven.com/g/ym9397vfzt367099d2ccde0721ef8d/?i=3',
    storeLogoText: 'GLASSESLIT',
    terms: 'Discount applies to second pair of equal or lesser value.',
    successRate: '98.9%'
  },
  {
    id: 'admitad_glasseslit_admitad5',
    storeSlug: 'glasseslit',
    storeName: 'Glasseslit',
    storeCategory: 'Eyewear & Health',
    discountBadge: '$5 OFF',
    title: '$5 Instant Coupon Code on Any Eyewear Order',
    description: 'Apply voucher code ADMITAD for a guaranteed $5 discount with zero minimum spending requirement.',
    code: 'ADMITAD',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://codeaven.com/g/up6c82wed2367099d2ccde0721ef8d/?i=3',
    storeLogoText: 'GLASSESLIT',
    terms: 'Valid on all items without minimum order value.',
    successRate: '99.6%'
  },

  // ChicMe (Real admitad codes)
  {
    id: 'admitad_chicme_pumpkin',
    storeSlug: 'chicme',
    storeName: 'ChicMe',
    storeCategory: 'Fashion & Apparel',
    discountBadge: '12% OFF',
    title: 'Seasonal Halloween Promo Code: 12% Off Sitewide',
    description: 'Save 12% on trendy women fashion, autumn dresses, and footwear using official code PUMPKIN.',
    code: 'PUMPKIN',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'October 31, 2026',
    affiliateUrl: 'https://rzekl.com/g/zcfe0k62wg367099d2cc312b8f391a/?i=3',
    storeLogoText: 'CHICME',
    terms: 'Valid sitewide on orders placed before October 31, 2026.',
    successRate: '99.1%'
  },
  {
    id: 'admitad_chicme_admitad015',
    storeSlug: 'chicme',
    storeName: 'ChicMe',
    storeCategory: 'Fashion & Apparel',
    discountBadge: '15% OFF',
    title: 'Extra 15% Off Orders Over $98 Across Entire Catalog',
    description: 'Stock up on on-trend outfits and save an extra 15% when your shopping cart reaches $98 with code ADMITAD015.',
    code: 'ADMITAD015',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://rzekl.com/g/cd3rfcselm367099d2cc312b8f391a/?i=3',
    storeLogoText: 'CHICME',
    terms: 'Minimum qualifying basket total $98 USD.',
    successRate: '98.7%'
  },

  // Alibaba (Real admitad codes)
  {
    id: 'admitad_alibaba_hh12',
    storeSlug: 'alibaba',
    storeName: 'Alibaba',
    storeCategory: 'E-Commerce & Wholesale',
    discountBadge: '$20 OFF',
    title: '$20 Off Direct Manufacturer & Wholesale Orders',
    description: 'Apply verified B2B sourcing promo code HH12 at checkout on qualifying Trade Assurance wholesale supplier orders.',
    code: 'HH12',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'January 1, 2027',
    affiliateUrl: 'https://rzekl.com/g/384usiqcl3367099d2cc219aa26f6f/?i=3',
    storeLogoText: 'ALIBABA',
    terms: 'Valid on participating Trade Assurance supplier transactions.',
    successRate: '97.2%'
  },
  {
    id: 'admitad_alibaba_spotlight',
    storeSlug: 'alibaba',
    storeName: 'Alibaba',
    storeCategory: 'E-Commerce & Wholesale',
    discountBadge: '80% BELOW RETAIL',
    title: 'Saving Spotlight: Direct Factory Goods Over 80% Below Retail',
    description: 'Source consumer electronics, apparel, and hardware directly from factories bypassing middleman retail margins.',
    code: 'ACTIVATE',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'June 13, 2029',
    affiliateUrl: 'https://rzekl.com/g/cknugekxem367099d2cc219aa26f6f/?i=3',
    storeLogoText: 'ALIBABA',
    terms: 'Automatic discount access through verified buyer link.',
    successRate: '98.5%'
  },

  // RaynaTours (Real admitad offers)
  {
    id: 'admitad_raynatours_ferrari',
    storeSlug: 'raynatours',
    storeName: 'RaynaTours',
    storeCategory: 'Travel & Tours',
    discountBadge: 'SAVE 45 AED',
    title: 'Ferrari World Abu Dhabi With Complimentary Meal Ticket',
    description: 'Experience world record rollercoasters with inclusive dining for 345 AED (regular price 390 AED).',
    code: 'ACTIVATE',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://xpuvo.com/g/2dla0dqw7i367099d2cce94db72a90/?i=3',
    storeLogoText: 'RAYNATOURS',
    terms: 'Valid for instant online booking. Includes theme park entry + dining voucher.',
    successRate: '99.7%'
  },
  {
    id: 'admitad_raynatours_seaworld',
    storeSlug: 'raynatours',
    storeName: 'RaynaTours',
    storeCategory: 'Travel & Tours',
    discountBadge: '15% OFF',
    title: 'SeaWorld Abu Dhabi Penguin Encounter Ticket',
    description: 'Get up close with arctic penguins at SeaWorld Abu Dhabi for 250 AED instead of 295 AED.',
    code: 'ACTIVATE',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://xpuvo.com/g/x6m9k1w1og367099d2cce94db72a90/?i=3',
    storeLogoText: 'RAYNATOURS',
    terms: 'Advance booking recommended for encounter time slots.',
    successRate: '99.3%'
  },
  {
    id: 'admitad_raynatours_paramotor',
    storeSlug: 'raynatours',
    storeName: 'RaynaTours',
    storeCategory: 'Travel & Tours',
    discountBadge: 'SAVE 200 AED',
    title: 'Paramotor Adventure Desert Tour — Save 200 AED Today',
    description: 'Soar above Dubai golden desert dunes with a tandem motorized glider for 750 AED (regularly 950 AED).',
    code: 'ACTIVATE',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://xpuvo.com/g/unmr0tne1q367099d2cce94db72a90/?i=3',
    storeLogoText: 'RAYNATOURS',
    terms: 'Includes flight safety equipment and certified tandem instructor.',
    successRate: '98.8%'
  },

  // Existing High-Converting Security & Dating Offers
  {
    id: 'deal_expressvpn_49',
    storeSlug: 'expressvpn',
    storeName: 'ExpressVPN',
    storeCategory: 'Privacy & Security',
    discountBadge: '49% OFF',
    title: '49% Off 12-Month Plan + 3 Months Totally Free',
    description: 'Get industry-leading VPN speed and privacy protection. Includes 3 bonus months free with complete 30-day money-back guarantee.',
    code: 'CLAIMDEAL',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'November 30, 2026',
    affiliateUrl: 'https://flirtcheck.site/go?offer=admitad_103765&source=deals_expressvpn&trigger=coupon_card&intent=deals&sub3=expressvpn_49',
    storeLogoText: 'EXPRESSVPN',
    terms: 'Valid on annual subscriptions. 30-day money-back guarantee included.',
    successRate: '99%'
  },
  {
    id: 'deal_qustodio_20',
    storeSlug: 'qustodio',
    storeName: 'Qustodio',
    storeCategory: 'Privacy & Security',
    discountBadge: '20% OFF',
    title: '20% Off Premium Family Digital Safety & Protection',
    description: 'Protect loved ones online with advanced screen supervision, location tracking, and content filtering.',
    code: 'FAMILY20',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'November 30, 2026',
    affiliateUrl: 'https://flirtcheck.site/go?offer=admitad_144643&source=deals_qustodio&trigger=coupon_card&intent=deals&sub3=qustodio_20',
    storeLogoText: 'QUSTODIO',
    terms: 'Valid on Premium Complete and Basic annual plans.',
    successRate: '97%'
  },
  {
    id: 'deal_onlinesim_15',
    storeSlug: 'onlinesim',
    storeName: 'OnlineSim',
    storeCategory: 'Privacy & Security',
    discountBadge: '15% OFF',
    title: '15% Bonus on Virtual Number SMS Verification Top-Ups',
    description: 'Protect your real mobile identity. Get private disposable numbers for instant SMS activation code receipts across 30+ countries.',
    code: 'PRIVACY15',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'November 30, 2026',
    affiliateUrl: 'https://flirtcheck.site/go?offer=admitad_191148&source=deals_onlinesim&trigger=coupon_card&intent=deals&sub3=onlinesim_15',
    storeLogoText: 'ONLINESIM',
    terms: 'Valid on initial account credit recharge.',
    successRate: '96%'
  },
  {
    id: 'deal_vip_trial_free',
    storeSlug: 'verified-match',
    storeName: 'Verified Match VIP',
    storeCategory: 'Dating & Lifestyle',
    discountBadge: '100% FREE INTRO',
    title: 'Unlock Full VIP Match Access & Unblurred Likes ($0.00 Today)',
    description: 'Bypass expensive $49/mo swipe app paywalls. Enjoy camera-verified profiles, direct intro messages, and unlocked incoming likes with zero hidden fees.',
    code: 'FCVIP2026',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://flirtcheck.site/go/vip-trial?src=deals_portal&ctx=coupon_card&intent=deals',
    storeLogoText: 'VERIFIED',
    terms: 'Valid for new member registration. Instant unblurred queue access.',
    successRate: '99.4%'
  },
  {
    id: 'deal_discreet_local_stealth',
    storeSlug: 'discreet-local',
    storeName: 'Discreet Local Pass',
    storeCategory: 'Dating & Lifestyle',
    discountBadge: 'STEALTH MODE',
    title: 'Incognito Casual Matching Pass: Zero Social Media Footprint',
    description: 'High-privacy local dating. Encrypted messaging, screenshot prevention, and burner compatibility for maximum discretion.',
    code: 'STEALTH26',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://flirtcheck.site/go/discreet-local?src=deals_portal&ctx=coupon_card&intent=deals',
    storeLogoText: 'DISCREET',
    terms: 'Stealth profile controls active upon account creation.',
    successRate: '98.7%'
  },
  {
    id: 'deal_spokeo_forensic_scan',
    storeSlug: 'spokeo',
    storeName: 'Spokeo Reverse Scan',
    storeCategory: 'Privacy & Security',
    discountBadge: 'IDENTITY CHECK',
    title: 'Forensic Background & Catfish Audit: Instant Identity Report',
    description: 'Cross-reference phone numbers, social media usernames, and photo hashes before meeting online matches in person.',
    code: 'DEEPCHECK50',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://flirtcheck.site/go/deep-lookup?src=deals_portal&ctx=coupon_card&intent=deals',
    storeLogoText: 'SPOKEO',
    terms: '100% confidential and anonymous identity report.',
    successRate: '99.6%'
  },
  {
    id: 'deal_elitedate_free',
    storeSlug: 'elitedate',
    storeName: 'EliteDate',
    storeCategory: 'Dating & Lifestyle',
    discountBadge: 'FREE VIP',
    title: 'Free Profile Verification & Personality Compatibility Access',
    description: 'Join EliteDate with complimentary profile vetting and compatibility assessment. Connect with intentional, verified singles in your region.',
    code: 'ACTIVATE',
    isExclusive: true,
    isVerified: true,
    expiryDate: 'November 30, 2026',
    affiliateUrl: 'https://flirtcheck.site/go?offer=admitad_49070&source=deals_elitedate&trigger=coupon_card&intent=deals&sub3=elitedate_free',
    storeLogoText: 'ELITEDATE',
    terms: 'Complimentary registration for adults 18+.',
    successRate: '100%'
  },
  {
    id: 'deal_huawei_bundle_offers',
    storeSlug: 'huawei',
    storeName: 'Huawei',
    storeCategory: 'Electronics & Gadgets',
    discountBadge: 'UP TO 50% OFF',
    title: 'Up To 50% Off Huawei MateBook, MatePad & Smart Wearables Bundles',
    description: 'Direct manufacturer seasonal savings on premium laptops, tablets, FreeBuds audio devices, and GT series smartwatches with free delivery.',
    code: '',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://ogsib.com/g/mdqug3zf25367099d2cc25829bc3a0/?ulp=https%3A%2F%2Fconsumer.huawei.com%2Fsa-en%2Foffer%2F&subid=promoradar_huawei_deals',
    storeLogoText: 'HUAWEI',
    terms: 'Direct official manufacturer offer. Genuine warranty included.',
    successRate: '99.8%'
  },
  {
    id: 'deal_huawei_wearables_promo',
    storeSlug: 'huawei',
    storeName: 'Huawei',
    storeCategory: 'Electronics & Gadgets',
    discountBadge: 'FREE GIFTS',
    title: 'Exclusive Complimentary Bundle Gifts with Huawei Flagship Purchases',
    description: 'Claim free audio accessories, extended care packages, and high-speed adapters when ordering selected Huawei devices via verified partner link.',
    code: '',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://ogsib.com/g/mdqug3zf25367099d2cc25829bc3a0/?ulp=https%3A%2F%2Fconsumer.huawei.com%2Fsa-en%2Foffer%2F&subid=promoradar_huawei_gifts',
    storeLogoText: 'HUAWEI',
    terms: 'Valid while promotional stock lasts at official store.',
    successRate: '99.5%'
  },
  {
    id: 'deal_nazih_cosmetics_sale',
    storeSlug: 'nazih',
    storeName: 'Nazih Cosmetics',
    storeCategory: 'Beauty & Fragrances',
    discountBadge: 'UP TO 60% OFF',
    title: 'Salon Professional Haircare, Skincare & Beauty Tools Special Sale',
    description: 'Save up to 60% on premier salon-grade haircare, cosmetic treatments, styling tools, and spa essentials from leading global brands.',
    code: '',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://wpmsx.com/g/ymc795qmu0367099d2cc6cde95af8d/?ulp=https%3A%2F%2Fnazih.sa%2Fen%2F&subid=promoradar_nazih_sale',
    storeLogoText: 'NAZIH',
    terms: '100% original salon beauty products. Express GCC shipping.',
    successRate: '99.1%'
  },
  {
    id: 'deal_touch_smartphones_sale',
    storeSlug: 'touch',
    storeName: 'Touch',
    storeCategory: 'Electronics & Gadgets',
    discountBadge: 'SPECIAL RATES',
    title: 'Certified Smartphones, Smart Tech & Audio Gadgets Official Deals',
    description: 'Get verified partner pricing on brand-name smartphones, wireless earbuds, smart devices, and gaming accessories with official warranty.',
    code: '',
    isExclusive: false,
    isVerified: true,
    expiryDate: 'December 31, 2026',
    affiliateUrl: 'https://wbbsv.com/g/ynys1f2mjp367099d2cc0e81904d8b/?ulp=https%3A%2F%2Ftouch.com.ua%2F&subid=promoradar_touch_gadgets',
    storeLogoText: 'TOUCH',
    terms: 'Official warranty included. Fast secure order fulfillment.',
    successRate: '99.3%'
  },
  {
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
];
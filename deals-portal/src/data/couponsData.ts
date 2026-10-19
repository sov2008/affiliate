export interface CouponDeal {
  id: string;
  storeSlug: string;
  storeName: string;
  storeCategory: 'Fashion & Apparel' | 'Travel & Tours' | 'Privacy & Security' | 'Eyewear & Health' | 'E-Commerce & Wholesale' | 'Dating & Lifestyle' | 'Electronics & Gadgets' | 'Education & Learning' | 'Kids & Toys' | 'Beauty & Fragrances' | 'Insurance & Finance' | 'Web Hosting & Domains' | 'Gaming & Entertainment' | 'Home & Lifestyle';
  discountBadge: string;
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
    "slug": "chicme",
    "name": "ChicMe",
    "category": "Fashion & Apparel",
    "logoText": "CHICME",
    "shortDesc": "Worldwide trendy women’s clothing, dresses, swimwear, and footwear with seasonal promotions.",
    "fullDesc": "ChicMe is a globally recognized online fast-fashion retailer offering accessible, on-trend women’s clothing, accessories, and shoes. With international shipping and regular markdown sales, shoppers frequently apply verified promo codes to secure double-digit basket discounts.",
    "websiteUrl": "https://www.chicme.com",
    "cleanDomain": "chicme.com",
    "primaryAffiliateUrl": "https://rzekl.com/g/gf807z8tar367099d2cc312b8f391a/",
    "howToApply": [
      "Select your desired clothing items and add them to your ChicMe shopping bag.",
      "Click the bag icon and proceed to checkout.",
      "Locate the \"Coupon Code / Promo Voucher\" input field in the payment summary section.",
      "Paste your copied code and click \"Apply\" to observe the immediate price deduction."
    ],
    "faqs": [
      {
        "question": "Can I combine multiple ChicMe coupon codes on one order?",
        "answer": "Generally, ChicMe permits one promotional discount code per order. However, promo codes frequently stack on top of pre-existing clearance items and site-wide sales."
      },
      {
        "question": "Does the ChicMe promo code expire?",
        "answer": "All promotional codes published on PromoRadar are verified regularly. Individual codes feature validity deadlines listed on each coupon card."
      }
    ]
  },
  {
    "slug": "glasseslit",
    "name": "Glasseslit",
    "category": "Eyewear & Health",
    "logoText": "GLASSESLIT",
    "shortDesc": "Prescription eyeglasses, blue-light blockers, designer frames, and polarized sunglasses worldwide.",
    "fullDesc": "Glasseslit delivers affordable prescription optical frames, bifocals, progressive lenses, and stylish sunglasses directly to consumers worldwide. Bypassing middleman retail markups, shoppers benefit from factory-direct pricing with additional promo voucher savings.",
    "websiteUrl": "https://www.glasseslit.com",
    "cleanDomain": "glasseslit.com",
    "primaryAffiliateUrl": "https://codeaven.com/g/mmjnepjawo367099d2ccde0721ef8d/",
    "howToApply": [
      "Select your preferred eyeglasses frame and input your prescription parameters.",
      "Add the customized glasses to your cart and proceed to review your order.",
      "Find the \"Voucher Code\" box on the checkout payment screen.",
      "Paste the verified code and confirm the instant reduction before payment."
    ],
    "faqs": [
      {
        "question": "Are Glasseslit promo codes valid on prescription lenses?",
        "answer": "Yes, verified vouchers apply across the entire catalog, including custom prescription lens coatings."
      }
    ]
  },
  {
    "slug": "raynatours",
    "name": "RaynaTours",
    "category": "Travel & Tours",
    "logoText": "RAYNATOURS",
    "shortDesc": "Premium UAE desert safaris, Dubai city excursions, Burj Khalifa tickets, and international activities.",
    "fullDesc": "RaynaTours is an accredited destination management powerhouse offering vetted tours, VIP desert experiences, theme park passes, and dhow cruises across the United Arab Emirates and international metropolitan hubs.",
    "websiteUrl": "https://www.raynatours.com",
    "cleanDomain": "raynatours.com",
    "primaryAffiliateUrl": "https://xpuvo.com/g/ofc53p8nis367099d2cce94db72a90/",
    "howToApply": [
      "Choose your preferred tour, activity, or sightseeing tickets on RaynaTours.",
      "Select your date and number of guests, then click \"Book Now\".",
      "Under the booking summary, locate the \"Have a Promo Code?\" field.",
      "Enter the verified voucher code to unlock up to 20% savings."
    ],
    "faqs": [
      {
        "question": "Do RaynaTours promo vouchers apply to same-day bookings?",
        "answer": "Most activity discount vouchers apply to both advance reservations and immediate same-day bookings, subject to tour slot availability."
      }
    ]
  },
  {
    "slug": "airalo",
    "name": "Airalo eSIM",
    "category": "Travel & Tours",
    "logoText": "AIRALO",
    "shortDesc": "Global eSIM cards for international travelers in 200+ countries with instant data activation.",
    "fullDesc": "Airalo is the world first and leading eSIM marketplace that eliminates roaming fees by providing digital SIM profiles for smartphones, tablets, and connected devices in over 200 countries and regions worldwide.",
    "websiteUrl": "https://www.airalo.com",
    "cleanDomain": "airalo.com",
    "primaryAffiliateUrl": "https://dhwnh.com/g/sdqlzm1v6b367099d2cc0471e42028/",
    "howToApply": [
      "Download the Airalo app or browse the website for your travel destination country.",
      "Choose an eSIM data package (e.g. 1GB, 3GB, 5GB, 10GB or 20GB).",
      "At checkout, look for the \"Apply Code / Referral Code\" field.",
      "Enter verified coupon code ADM to receive an instant 10% discount on all eSIM plans."
    ],
    "faqs": [
      {
        "question": "How do I activate my Airalo eSIM after checkout?",
        "answer": "You will receive a QR code immediately upon checkout. Simply scan it in your phone cellular settings to install the eSIM profile."
      },
      {
        "question": "Can I reuse the Airalo voucher code for multiple trips?",
        "answer": "The verified code ADM applies across all product purchases and destination packages on Airalo."
      }
    ]
  },
  {
    "slug": "allpowers",
    "name": "ALLPOWERS",
    "category": "Electronics & Gadgets",
    "logoText": "ALLPOWERS",
    "shortDesc": "Portable power stations, solar panels, and solar generators for outdoor camping and home backup.",
    "fullDesc": "ALLPOWERS specializes in clean portable energy solutions, high-capacity LiFePO4 battery power stations, and foldable solar generators. Designed for emergency home backup, outdoor exploration, and off-grid living.",
    "websiteUrl": "https://allpowersukraine.com/",
    "cleanDomain": "iallpowers.com",
    "primaryAffiliateUrl": "https://zmgig.com/g/muqldz8qwc367099d2ccc628098d9a/",
    "howToApply": [
      "Select your desired portable power station or solar panel kit and add it to your cart.",
      "Proceed to checkout and view your order summary.",
      "Paste your verified promo code (such as BULKRATE or EXTRA10) into the promo voucher box.",
      "Click apply to see up to 12% or 3,000 UAH deducted instantly."
    ],
    "faqs": [
      {
        "question": "Are ALLPOWERS promo codes valid on solar generator bundles?",
        "answer": "Yes, ALLPOWERS verified coupon codes apply to individual power stations as well as bundled solar panel sets."
      }
    ]
  },
  {
    "slug": "thedealoutlet",
    "name": "The Deal Outlet",
    "category": "Fashion & Apparel",
    "logoText": "DEALOUTLET",
    "shortDesc": "Luxury fashion outlet featuring designer apparel, shoes, bags, and luxury accessories at up to 75% off.",
    "fullDesc": "The Deal Outlet is a premier Middle Eastern luxury outlet platform curating authentic designer clothing, luxury shoes, leather bags, and prestige accessories from world-renowned fashion houses with deep reductions.",
    "websiteUrl": "https://thedealoutlet.com",
    "cleanDomain": "thedealoutlet.com",
    "primaryAffiliateUrl": "https://bywiola.com/g/wjw0v6sq2u367099d2ccb6c5579bcf/",
    "howToApply": [
      "Browse designer collections and add luxury fashion items to your shopping cart.",
      "Open the shopping bag and proceed to order confirmation.",
      "Input verified coupon FIRST15 for first-time orders or enjoy automatic 75% catalog reductions.",
      "Enjoy expedited regional delivery and free shipping over 350 AED."
    ],
    "faqs": [
      {
        "question": "Are products on The Deal Outlet 100% authentic?",
        "answer": "Yes, all luxury products are sourced directly from authorized luxury brand distributors and fashion houses."
      }
    ]
  },
  {
    "slug": "vogacloset",
    "name": "VogaCloset",
    "category": "Fashion & Apparel",
    "logoText": "VOGACLOSET",
    "shortDesc": "London-based fast fashion destination delivering European runway styles to international shoppers.",
    "fullDesc": "VogaCloset is a leading online fashion boutique delivering women, men, and kids European high-street fashion, dresses, footwear, and accessories with dedicated localized customer support and cash-on-delivery options.",
    "websiteUrl": "https://vogacloset.com",
    "cleanDomain": "vogacloset.com",
    "primaryAffiliateUrl": "https://bywiola.com/g/6silcjvoa9367099d2ccb52609ec28/?i=3",
    "howToApply": [
      "Select your fashion items and navigate to the checkout bag.",
      "Under the payment summary, enter promo code SALE or LVD.",
      "Watch your basket total discount by up to 20% to 80% immediately."
    ],
    "faqs": [
      {
        "question": "Does VogaCloset offer cash on delivery and returns?",
        "answer": "Yes, VogaCloset supports hassle-free returns and local payment options across GCC and international destinations."
      }
    ]
  },
  {
    "slug": "kodland",
    "name": "Kodland",
    "category": "Education & Learning",
    "logoText": "KODLAND",
    "shortDesc": "Interactive live online coding, digital art, and game development courses for kids and teens aged 7–17.",
    "fullDesc": "Kodland is an international ed-tech academy empowering young creators with project-based computer science, game creation in Roblox and Unity, Python programming, and digital design taught by certified live tutors.",
    "websiteUrl": "https://kodland.com",
    "cleanDomain": "kodland.org",
    "primaryAffiliateUrl": "https://ewwhk.com/g/qsvlfb0swn367099d2cca5fc6f34cb/",
    "howToApply": [
      "Book a complimentary trial lesson or select a full course module on Kodland.",
      "Enter the student details and proceed to the course tuition payment screen.",
      "Paste promo code START30-2 or START10 into the coupon box.",
      "Receive up to 30% discount on lesson packages."
    ],
    "faqs": [
      {
        "question": "Are Kodland classes conducted one-on-one or in small groups?",
        "answer": "Kodland offers both individual 1-on-1 tutoring and interactive micro-groups to match each student pace."
      }
    ]
  },
  {
    "slug": "purevpn",
    "name": "PureVPN",
    "category": "Privacy & Security",
    "logoText": "PUREVPN",
    "shortDesc": "High-speed encrypted VPN with 6,500+ servers, zero-logging policy, and Wi-Fi security shields.",
    "fullDesc": "PureVPN safeguards your digital footprint, hides your IP address, and encrypts public Wi-Fi transmissions across iOS, Android, macOS, and Windows with multi-gigabit servers worldwide.",
    "websiteUrl": "https://www.purevpn.com",
    "cleanDomain": "purevpn.com",
    "primaryAffiliateUrl": "https://plrvq.com/g/ayvzzawv40367099d2ccdd63dd688c/",
    "howToApply": [
      "Select a 2-year or 1-year privacy subscription package on PureVPN.",
      "Look for the coupon code input field beneath the checkout payment options.",
      "Paste the verified promo code admitad20 to secure an extra 20% discount on all plans."
    ],
    "faqs": [
      {
        "question": "Does PureVPN offer a money-back guarantee?",
        "answer": "Yes, all verified promo subscriptions include an unconditional 31-day money-back satisfaction guarantee."
      }
    ]
  },
  {
    "slug": "expressvpn",
    "name": "ExpressVPN",
    "category": "Privacy & Security",
    "logoText": "EXPRESSVPN",
    "shortDesc": "Ultra-fast global VPN service across 105 countries with TrustedServer RAM-only privacy technology.",
    "fullDesc": "ExpressVPN is the premier global standard in personal cybersecurity. Featuring proprietary Lightway protocol, military-grade AES-256 encryption, and verified independent privacy audits, it shields personal communications and digital browsing.",
    "websiteUrl": "https://www.expressvpn.com",
    "cleanDomain": "expressvpn.com",
    "primaryAffiliateUrl": "https://ziejy.com/g/4raik6r0sq367099d2cc954d043f6e/",
    "howToApply": [
      "Select the 12-month plan through our verified discount link.",
      "Notice the 49% discount and 3 bonus complimentary months applied automatically.",
      "Complete your secure checkout with credit card, PayPal, or Bitcoin."
    ],
    "faqs": [
      {
        "question": "Does ExpressVPN keep activity logs?",
        "answer": "No. ExpressVPN operates under a strict, independently audited no-logs policy powered by diskless TrustedServer infrastructure."
      }
    ]
  },
  {
    "slug": "keepersecurity",
    "name": "Keeper Security",
    "category": "Privacy & Security",
    "logoText": "KEEPER",
    "shortDesc": "Zero-knowledge password manager, private media vault, and dark web monitoring suite.",
    "fullDesc": "Keeper Security protects passwords, personal credentials, private photos, and confidential documents with zero-trust, zero-knowledge encryption. It prevents account takeovers, SIM-swap extortion, and credential stuffing attacks.",
    "websiteUrl": "https://www.keepersecurity.com",
    "cleanDomain": "keepersecurity.com",
    "primaryAffiliateUrl": "https://ziejy.com/g/d31t1s35sz367099d2cceb9db1a7c5/",
    "howToApply": [
      "Choose between Keeper Unlimited or Family Plan.",
      "Click through our verified link to activate automatic 50% subscription savings.",
      "Enjoy dark web monitoring and zero-knowledge encrypted vaults on all your devices."
    ],
    "faqs": [
      {
        "question": "What is zero-knowledge encryption?",
        "answer": "It means your master password and encryption keys never leave your device. Even Keeper employees cannot access your vault."
      }
    ]
  },
  {
    "slug": "qustodio",
    "name": "Qustodio",
    "category": "Privacy & Security",
    "logoText": "QUSTODIO",
    "shortDesc": "Comprehensive digital safety, location tracking, and screen time balance for families and children.",
    "fullDesc": "Qustodio is the world leading digital wellbeing and parental defense platform. It equips families with real-time screen supervision, cyberbullying alerts, location tracking, and content filtering across smartphones, tablets, and computers.",
    "websiteUrl": "https://www.qustodio.com",
    "cleanDomain": "qustodio.com",
    "primaryAffiliateUrl": "https://zejcl.com/g/zgsaevrb3a367099d2cc2411861ed1/",
    "howToApply": [
      "Select your family plan based on the number of supervised devices.",
      "Paste our verified voucher code FAMILY20 into the promotional discount field.",
      "Enjoy 20% instant annual subscription savings."
    ],
    "faqs": [
      {
        "question": "Does Qustodio work on both iOS and Android?",
        "answer": "Yes, Qustodio operates seamlessly across iOS, Android, macOS, Windows, and Kindle devices."
      }
    ]
  },
  {
    "slug": "onlinesim",
    "name": "OnlineSim",
    "category": "Privacy & Security",
    "logoText": "ONLINESIM",
    "shortDesc": "Virtual phone numbers for instant SMS activation and privacy protection across 30+ countries.",
    "fullDesc": "OnlineSim offers temporary and rent-based virtual mobile numbers for anonymous SMS verification across social apps, digital platforms, and online services without exposing real personal SIM data.",
    "websiteUrl": "https://onlinesim.one",
    "cleanDomain": "onlinesim.io",
    "primaryAffiliateUrl": "https://ewwhk.com/g/gei3abuc8o367099d2ccbaf376d56c/",
    "howToApply": [
      "Register a free account on OnlineSim.",
      "Navigate to the \"Top-up Balance\" section in your user dashboard.",
      "Input the promo voucher code into the promotional discount box.",
      "Enjoy bonus activation credits or discounted line rental rates."
    ],
    "faqs": [
      {
        "question": "Can I use OnlineSim virtual numbers for instant account activations?",
        "answer": "Yes, OnlineSim virtual numbers receive SMS verification codes instantly from WhatsApp, Telegram, Google, and top digital services."
      }
    ]
  },
  {
    "slug": "alibaba",
    "name": "Alibaba",
    "category": "E-Commerce & Wholesale",
    "logoText": "ALIBABA",
    "shortDesc": "Global B2B wholesale platform for consumer electronics, apparel, and direct manufacturer sourcing.",
    "fullDesc": "Alibaba connects millions of international buyers with verified suppliers, providing Trade Assurance buyer protection and seasonal coupon drops for wholesale and sample orders.",
    "websiteUrl": "https://www.alibaba.com",
    "cleanDomain": "alibaba.com",
    "primaryAffiliateUrl": "https://rzekl.com/g/pm1aev55cl367099d2cc219aa26f6f/",
    "howToApply": [
      "Source your products on Alibaba and negotiate or add to checkout.",
      "Apply verified promo code HH12 for $20 off or unlock up to 80% below retail via the Saving Spotlight."
    ],
    "faqs": [
      {
        "question": "Does Trade Assurance cover orders discounted with coupons?",
        "answer": "Yes, Trade Assurance fully covers purchases regardless of promotional coupon deductions."
      }
    ]
  },
  {
    "slug": "jashanmal",
    "name": "Jashanmal",
    "category": "E-Commerce & Wholesale",
    "logoText": "JASHANMAL",
    "shortDesc": "Prestigious department store offering luxury home goods, cookware, luggage, and lifestyle brands.",
    "fullDesc": "Jashanmal has been a cornerstone of retail excellence across the GCC since 1919, featuring high-end home appliances, premium kitchenware, travel luggage from Delsey and Rimowa, and fashion accessories.",
    "websiteUrl": "https://www.jashanmal.com",
    "cleanDomain": "jashanmal.com",
    "primaryAffiliateUrl": "https://codeaven.com/g/pdanpp6uu2367099d2cc62651c44e1/",
    "howToApply": [
      "Browse luxury home and kitchenware collections on Jashanmal.",
      "Add items to your cart and proceed to the checkout screen.",
      "Enter verified promotional code TKFL9 to receive an immediate 10% discount on your order."
    ],
    "faqs": [
      {
        "question": "Is Jashanmal voucher valid on premium cookware brands?",
        "answer": "Yes, promo code TKFL9 provides a 10% reduction across eligible premium home and kitchenware lines."
      }
    ]
  },
  {
    "slug": "dabdoob",
    "name": "Dabdoob",
    "category": "Kids & Toys",
    "logoText": "DABDOOB",
    "shortDesc": "Top-rated kids toy app and store offering gift wrapping, popular games, and rapid doorstep delivery.",
    "fullDesc": "Dabdoob is the leading toy-shopping destination across UAE, Saudi Arabia, Kuwait, and Bahrain, curating the best educational toys, action figures, board games, and children celebration gifts.",
    "websiteUrl": "https://dabdoob.com",
    "cleanDomain": "dabdoob.com",
    "primaryAffiliateUrl": "https://rzekl.com/g/du3xi8b8ry367099d2cca2c57142dd/?i=31",
    "howToApply": [
      "Select toys or games on Dabdoob and add complimentary gift wrapping.",
      "Enter verified coupon TKFL7 at checkout.",
      "Save 10% across UAE, Bahrain, Kuwait, and up to 25% in KSA."
    ],
    "faqs": [
      {
        "question": "Can I add customized greeting cards on Dabdoob?",
        "answer": "Yes, Dabdoob offers specialized gift wrapping and personalized greeting messages with every toy delivery."
      }
    ]
  },
  {
    "slug": "vperfumes",
    "name": "Vperfumes",
    "category": "Beauty & Fragrances",
    "logoText": "VPERFUMES",
    "shortDesc": "Authentic luxury oriental and French perfumes, oud oils, and designer scents with fast GCC shipping.",
    "fullDesc": "Vperfumes is one of the largest perfume retail chains in the GCC, offering 100% authentic designer fragrances, niche oud scents, French perfumes, and luxury gift sets with free delivery perks.",
    "websiteUrl": "https://vperfumes.com",
    "cleanDomain": "vperfumes.com",
    "primaryAffiliateUrl": "https://wbbsv.com/g/ax1gp3o9dz367099d2ccbe59cac899/",
    "howToApply": [
      "Select your favorite eau de parfum, niche fragrance, or oud oil on Vperfumes.",
      "Add products totaling 200 AED or more to your cart.",
      "Complimentary fast delivery is activated automatically at checkout."
    ],
    "faqs": [
      {
        "question": "Are all fragrances on Vperfumes 100% original?",
        "answer": "Yes, Vperfumes guarantees 100% genuine products sourced directly from authorized fragrance distributors."
      }
    ]
  },
  {
    "slug": "aovica",
    "name": "Aovica Store",
    "category": "Electronics & Gadgets",
    "logoText": "AOVICA",
    "shortDesc": "Innovative smart electronics, audio accessories, and digital gadgets with official AliExpress warranty.",
    "fullDesc": "Aovica Official Store on AliExpress provides high-performance electronic accessories, smart wireless devices, and computer peripherals backed by buyer protection and international shipping.",
    "websiteUrl": "https://aliexpress.com",
    "cleanDomain": "aovica.com",
    "primaryAffiliateUrl": "https://rcpsj.com/g/76ypdp9d6w367099d2cccaca192191/",
    "howToApply": [
      "Add Aovica electronics products to your shopping cart.",
      "Enter exclusive coupon code ADMITADN62A7 at the AliExpress payment step.",
      "Receive a massive 40% instant reduction on all qualifying electronics."
    ],
    "faqs": [
      {
        "question": "Is the 40% discount valid for all countries?",
        "answer": "Yes, the promo code applies internationally to all orders placed through the official Aovica store."
      }
    ]
  },
  {
    "slug": "markformelle",
    "name": "Mark Formelle",
    "category": "Fashion & Apparel",
    "logoText": "MARKFORMELLE",
    "shortDesc": "Comfortable family homewear, stylish casual basics, knitwear, and organic everyday essentials.",
    "fullDesc": "Mark Formelle creates cozy, modern casualwear, breathable loungewear, and premium cotton essentials for men, women, and children with sustainable production standards.",
    "websiteUrl": "https://markformelle.com",
    "cleanDomain": "markformelle.com",
    "primaryAffiliateUrl": "https://xqjeo.com/g/xu8ibhasrf367099d2cc5a98e4de8b/?i=31",
    "howToApply": [
      "Select your homewear and everyday casual items.",
      "Enter promo code ADMMF436 at checkout.",
      "Enjoy an instant 10% reduction on your entire basket."
    ],
    "faqs": [
      {
        "question": "Does the promo code stack with seasonal sale discounts?",
        "answer": "Yes, the voucher applies to your total order summary."
      }
    ]
  },
  {
    "slug": "elitedate",
    "name": "EliteDate",
    "category": "Dating & Lifestyle",
    "logoText": "ELITEDATE",
    "shortDesc": "Curated relationship platform featuring manual profile inspection and intentional matching.",
    "fullDesc": "EliteDate is an acclaimed relationship matching platform operating across Central Europe with verified single profiles, zero automated bots, and high conversation reciprocity.",
    "websiteUrl": "https://www.elitedate.cz",
    "cleanDomain": "elitedate.com",
    "primaryAffiliateUrl": "https://ypetp.com/g/vvdd5k8qbw367099d2cceea6df302f/",
    "howToApply": [
      "Complete free registration through our verified invitation link.",
      "Complete the relationship compatibility questionnaire.",
      "Access verified local profiles with complimentary onboarding perks."
    ],
    "faqs": [
      {
        "question": "Is EliteDate registration completely free?",
        "answer": "Yes, profile creation, questionnaire scoring, and initial match browsing are completely free of charge."
      }
    ]
  },
  {
    "slug": "verified-match",
    "name": "Verified Match VIP",
    "category": "Dating & Lifestyle",
    "logoText": "VERIFIED",
    "shortDesc": "Pre-vetted singles network enforcing mandatory camera-liveness checks and zero bot tolerance.",
    "fullDesc": "Verified Match is an elite alternative to legacy swipe apps, requiring mandatory facial biometric verification. Users bypass fake bots, unblur incoming match queues, and connect exclusively with authentic local singles.",
    "websiteUrl": "https://flirtcheck.site/go/verified-match",
    "cleanDomain": "match.com",
    "primaryAffiliateUrl": "https://flirtcheck.site/go/verified-match?src=deals_portal&ctx=store_header&intent=deals",
    "howToApply": [
      "Click REVEAL CODE & ACTIVATE to unlock the introductory voucher.",
      "Complete the 60-second real-time camera verification.",
      "Enjoy unrestricted incoming likes and direct messaging."
    ],
    "faqs": [
      {
        "question": "Does the introductory pass bypass all swipe limits?",
        "answer": "Yes, the introductory pass unthrottles your profile queue and grants unblurred visibility into users who already liked you."
      }
    ]
  },
  {
    "slug": "discreet-local",
    "name": "Discreet Local Pass",
    "category": "Dating & Lifestyle",
    "logoText": "DISCREET",
    "shortDesc": "High-privacy casual encounter network with stealth profile browsing and zero social media sync.",
    "fullDesc": "Discreet Local provides hardened privacy for singles seeking casual dating without digital footprint leaks. Features burner number compatibility, screenshot protection, and incognito search modes.",
    "websiteUrl": "https://flirtcheck.site/go/discreet-local",
    "cleanDomain": "ashleymadison.com",
    "primaryAffiliateUrl": "https://flirtcheck.site/go/discreet-local?src=deals_portal&ctx=store_header&intent=deals",
    "howToApply": [
      "Activate your stealth voucher link.",
      "Register with an ephemeral burner number or private email.",
      "Browse encrypted local encounter matches in stealth mode."
    ],
    "faqs": [
      {
        "question": "Will my contacts or social media accounts ever be linked?",
        "answer": "No. The platform strictly isolates account data with zero third-party graph synchronization."
      }
    ]
  },
  {
    "slug": "spokeo",
    "name": "Spokeo Reverse Scan",
    "category": "Privacy & Security",
    "logoText": "SPOKEO",
    "shortDesc": "Forensic digital footprint, image hash, and phone number verification search engine.",
    "fullDesc": "Spokeo aggregates billions of public records, phone directories, and social profiles to verify the true identity behind any online match in seconds.",
    "websiteUrl": "https://flirtcheck.site/go/deep-lookup",
    "cleanDomain": "spokeo.com",
    "primaryAffiliateUrl": "https://flirtcheck.site/go/deep-lookup?src=deals_portal&ctx=store_header&intent=deals",
    "howToApply": [
      "Click to activate the forensic promo search rate.",
      "Enter the suspicious phone number, username, or photo details.",
      "View verified background reports and social profiles."
    ],
    "faqs": [
      {
        "question": "Can the audited person see that I searched for them?",
        "answer": "No. All searches are 100% confidential and anonymous."
      }
    ]
  },
  {
    "slug": "huawei",
    "name": "Huawei",
    "category": "Electronics & Gadgets",
    "logoText": "HUAWEI",
    "shortDesc": "Official Huawei store for smart wearables, laptops, tablets, audio gear, and cutting-edge mobile innovations.",
    "fullDesc": "Huawei is an internationally acclaimed technology powerhouse offering premium smart devices, ultra-thin MateBook laptops, MatePad tablets, and health-tracking smartwatches backed by manufacturer warranty and official bundle promotions.",
    "websiteUrl": "https://consumer.huawei.com",
    "cleanDomain": "consumer.huawei.com",
    "primaryAffiliateUrl": "https://ogsib.com/g/mdqug3zf25367099d2cc25829bc3a0/",
    "howToApply": [
      "Browse through the official Huawei store offers section.",
      "Select qualifying smartphones, smartwatches, or MateBook devices.",
      "Discounts, gift bundles, and free delivery perks are applied automatically at checkout via our verified partner link."
    ],
    "faqs": [
      {
        "question": "Are products purchased via the partner link covered by official warranty?",
        "answer": "Yes, all orders are fulfilled directly by official Huawei distribution channels and include full standard manufacturer warranty."
      },
      {
        "question": "Do Huawei discounts stack with trade-in bonuses?",
        "answer": "Official promotional discounts frequently combine with trade-in credits on selected devices."
      }
    ]
  },
  {
    "slug": "nazih",
    "name": "Nazih Cosmetics",
    "category": "Beauty & Fragrances",
    "logoText": "NAZIH",
    "shortDesc": "Middle East premier salon-grade haircare, skincare, makeup, and professional beauty accessories.",
    "fullDesc": "Nazih Group is one of the Middle East most trusted beauty and cosmetic retailers, distributing world-class professional haircare, spa products, skincare, and electrical styling tools to both salons and consumers.",
    "websiteUrl": "https://nazih.sa",
    "cleanDomain": "nazih.sa",
    "primaryAffiliateUrl": "https://wpmsx.com/g/ymc795qmu0367099d2cc6cde95af8d/",
    "howToApply": [
      "Choose your professional haircare, salon styling tools, or skincare items on the Nazih official store.",
      "Add products to your cart and proceed to the payment summary.",
      "Official promotional pricing and direct partner discounts apply automatically on checkout."
    ],
    "faqs": [
      {
        "question": "Are all products on Nazih 100% authentic?",
        "answer": "Yes, Nazih is the official authorized distributor for premier global salon and cosmetic brands."
      },
      {
        "question": "Is fast shipping available for Nazih orders?",
        "answer": "Yes, Nazih offers rapid delivery across GCC territories with comprehensive package tracking."
      }
    ]
  },
  {
    "slug": "touch",
    "name": "Touch",
    "category": "Electronics & Gadgets",
    "logoText": "TOUCH",
    "shortDesc": "Certified smartphones, Apple tech, smart gadgets, audio gear, and gaming hardware with official warranty.",
    "fullDesc": "Touch is a premier electronics and digital retail brand specializing in authentic smartphones, tablets, laptops, gaming peripherals, and audio accessories with warranty coverage and prompt delivery.",
    "websiteUrl": "https://touch.com.ua",
    "cleanDomain": "touch.com.ua",
    "primaryAffiliateUrl": "https://wbbsv.com/g/ynys1f2mjp367099d2cc0e81904d8b/",
    "howToApply": [
      "Browse verified smartphones, audio gear, or gadgets on the official Touch digital catalog.",
      "Add your chosen tech items to the shopping basket.",
      "Promotional discounts and direct partner rates apply directly at checkout via our verified link."
    ],
    "faqs": [
      {
        "question": "Are tech items on Touch covered by official warranty?",
        "answer": "Yes, all electronic devices come with standard manufacturer and distributor warranty certificates."
      },
      {
        "question": "Are there seasonal discounts on flagship smartphones?",
        "answer": "Touch regularly runs markdown campaigns on flagship smartphones, wireless earbuds, and computer accessories."
      }
    ]
  },
  {
    "slug": "polis",
    "name": "Polis UA",
    "category": "Insurance & Finance",
    "logoText": "POLIS",
    "shortDesc": "Online vehicle insurance, Green Card travel cover, medical policies, and financial micro-loans comparison.",
    "fullDesc": "Polis.ua is the leading online insurance superstore in Ukraine. Comparing licensed insurance providers across auto MTPL, international Green Card, health, and tourist policies with immediate PDF delivery to email.",
    "websiteUrl": "https://polis.ua/uk",
    "cleanDomain": "polis.ua",
    "primaryAffiliateUrl": "https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/",
    "howToApply": [
      "Enter your vehicle license plate or choose travel insurance destination.",
      "Compare quotes from 25+ verified insurance companies.",
      "Promotional discounts and cashback vouchers are applied automatically before payment.",
      "Receive official electronic insurance policy instantly in your inbox and Diia app."
    ],
    "faqs": [
      {
        "question": "Are electronic policies issued by Polis.ua officially valid?",
        "answer": "Yes, all electronic insurance contracts comply with state motor bureau regulations and are registered immediately in the official national database."
      },
      {
        "question": "Can I get a discount on Green Card international travel insurance?",
        "answer": "Yes, our verified partner link activates promotional discounts of up to 15% on international Green Card policies."
      }
    ]
  },
  {
    "slug": "hostinger",
    "name": "Hostinger",
    "category": "Web Hosting & Domains",
    "logoText": "HOSTINGER",
    "shortDesc": "High-speed cloud SSD web hosting, free SSL certificates, automated backups, and 1-click WordPress deployments.",
    "fullDesc": "Hostinger powers millions of web creators worldwide with high-performance LiteSpeed cloud hosting, free domain registrations, unlimited SSL certificates, and 24/7 technical customer support.",
    "websiteUrl": "https://www.hostinger.com",
    "cleanDomain": "hostinger.com",
    "primaryAffiliateUrl": "https://flirtcheck.site/go?offer=hostinger&source=deals_hostinger&trigger=store_header&intent=deals",
    "howToApply": [
      "Choose a Premium or Business Cloud web hosting plan on Hostinger.",
      "Select a 48-month or 12-month billing period to secure maximum introductory pricing.",
      "Look for the \"Have a coupon code?\" prompt at the bottom of the order summary.",
      "Enter verified coupon code HOSTING75 to deduct an additional 10% to 75% instantly."
    ],
    "faqs": [
      {
        "question": "Does Hostinger include a free domain name?",
        "answer": "Yes, annual and multi-year hosting packages include a complimentary 1-year custom domain registration."
      },
      {
        "question": "Is there a money-back guarantee on Hostinger?",
        "answer": "Yes, Hostinger offers an unconditional 30-day money-back satisfaction guarantee on all hosting plans."
      }
    ]
  },
  {
    "slug": "abelssoft",
    "name": "Abelssoft",
    "category": "Electronics & Gadgets",
    "logoText": "ABELSSOFT",
    "shortDesc": "Award-winning Windows utility software, privacy tools, system optimization, and media security utilities.",
    "fullDesc": "Abelssoft is a premium German software developer established in 1994, renowned for high-performance Windows optimization tools, privacy shields, disk cleaners, and media recording suites trusted by over 12 million users worldwide.",
    "websiteUrl": "https://www.abelssoft.com",
    "cleanDomain": "abelssoft.de",
    "primaryAffiliateUrl": "https://flirtcheck.site/go?offer=abelssoft&source=promoradar_cj&trigger=store_header&intent=deals",
    "howToApply": [
      "Select any Abelssoft utility (WashAndWrite, EverDoc, AntiBrowserSpy, or SSD Fresh) on the official website.",
      "Proceed to the checkout page powered by their secure payment gateway.",
      "Promotional discounts of up to 50% are automatically credited via our verified affiliate integration.",
      "Receive full license keys instantly by email with lifetime updates and support."
    ],
    "faqs": [
      {
        "question": "Are Abelssoft promotional licenses perpetual?",
        "answer": "Yes, licenses purchased through our verified promotions include lifetime desktop activation for Windows."
      },
      {
        "question": "Is there a trial available before purchasing Abelssoft tools?",
        "answer": "Yes, free trial versions are available for testing all optimization features before unlocking the pro suite."
      }
    ]
  }
];

export const COUPONS_DATA: CouponDeal[] = [
  {
    "id": "cj-abelssoft-50off",
    "storeSlug": "abelssoft",
    "storeName": "Abelssoft",
    "storeCategory": "Privacy & Security",
    "discountBadge": "50% OFF",
    "title": "50% Off Abelssoft Windows Security Tools",
    "description": "Protect your PC with award-winning privacy shields and registry cleaners. Get a lifetime license for half price using code ABELSSOFT50 to keep your system fast and secure.",
    "code": "ABELSSOFT50",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://www.anrdoezrs.net/click-8102806-15509939",
    "storeLogoText": "ABELSSOFT",
    "terms": "Enter code ABELSSOFT50 at checkout to apply the 50% discount.",
    "successRate": "99.8%"
  },
  {
    "id": "deal_hostinger_cloud_75",
    "storeSlug": "hostinger",
    "storeName": "Hostinger",
    "storeCategory": "Web Hosting & Domains",
    "discountBadge": "75% OFF + FREE DOMAIN",
    "title": "Host 100 Websites: 75% Off Hosting Plus Free Domain",
    "description": "Launch your site on ultra-fast LiteSpeed servers with 100 website slots and daily backups included. This deal saves you big money while covering your domain and SSL costs upfront.",
    "code": "HOSTING75",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://flirtcheck.site/go?offer=hostinger&source=deals_hostinger&trigger=coupon_card&intent=deals&sub3=hosting75",
    "storeLogoText": "HOSTINGER",
    "terms": "Enter code HOSTING75 at checkout to apply 75% discount and free domain.",
    "successRate": "99.9%"
  },
  {
    "id": "deal_hostinger_cloud_starter",
    "storeSlug": "hostinger",
    "storeName": "Hostinger",
    "storeCategory": "Web Hosting & Domains",
    "discountBadge": "65% OFF",
    "title": "Hostinger Cloud Hosting: 65% Off Dedicated IP & NVMe Speed",
    "description": "Launch with dedicated resources, NVMe speed, and free SSL. Skip the technical setup with 1-click WordPress and automated backups.",
    "code": "CLOUDLAUNCH",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://flirtcheck.site/go?offer=hostinger&source=deals_hostinger&trigger=coupon_card&intent=deals&sub3=cloudlaunch",
    "storeLogoText": "HOSTINGER",
    "terms": "Enter code CLOUDLAUNCH at checkout to apply the 65% discount.",
    "successRate": "99.5%"
  },
  {
    "id": "deal_expressvpn_49",
    "storeSlug": "expressvpn",
    "storeName": "ExpressVPN",
    "storeCategory": "Privacy & Security",
    "discountBadge": "49% OFF + 3 MO FREE",
    "title": "49% Off ExpressVPN Annual Plan Plus Three Free Months",
    "description": "Get 49% off the annual plan and add three free months using code EXPRESS49. This gives you nearly half the price for fast, RAM-only security across 105 countries.",
    "code": "EXPRESS49",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/4raik6r0sq367099d2cc309c6148a0/?i=3",
    "storeLogoText": "EXPRESSVPN",
    "terms": "Enter code EXPRESS49 at checkout to apply the discount and free months.",
    "successRate": "99.8%"
  },
  {
    "id": "deal_qustodio_20",
    "storeSlug": "qustodio",
    "storeName": "Qustodio",
    "storeCategory": "Privacy & Security",
    "discountBadge": "20% OFF",
    "title": "Save 20% on Qustodio Parental Controls and Location Tracking",
    "description": "Protect your family online with real-time web filtering and instant location alerts. Use code FAMILY20 at checkout to take 20% off your subscription and secure your children's digital environment effortlessly.",
    "code": "FAMILY20",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://zejcl.com/g/zgsaevrb3a367099d2cc9537f00609/?i=3",
    "storeLogoText": "QUSTODIO",
    "terms": "Enter code FAMILY20 in the discount field during checkout to apply the 20% discount.",
    "successRate": "99.1%"
  },
  {
    "id": "deal_onlinesim_15",
    "storeSlug": "onlinesim",
    "storeName": "OnlineSIM",
    "storeCategory": "Privacy & Security",
    "discountBadge": "15% EXTRA CREDITS",
    "title": "Secure Your Identity with 15% Bonus Credits on Virtual Numbers",
    "description": "Protect your personal phone number by using disposable virtual lines for WhatsApp and Google sign-ups in over 90 countries. Apply code SIMSECURE15 at checkout to receive 15% extra credits on your order.",
    "code": "SIMSECURE15",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ewwhk.com/g/gei3abuc8o367099d2cc6868dfbb80/?i=3",
    "storeLogoText": "ONLINESIM",
    "terms": "Apply code SIMSECURE15 during checkout to receive 15% bonus credits on your purchase.",
    "successRate": "98.9%"
  },
  {
    "id": "deal_touch_smartphones_sale",
    "storeSlug": "touch",
    "storeName": "Touch UA",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "UP TO 30% OFF",
    "title": "Save 30% on Certified Apple, Samsung, and Xiaomi Phones",
    "description": "Shop official smartphones with full manufacturer warranties and fast local delivery. Apply your code at checkout to secure up to 30% off top-tier tech today.",
    "code": "TOUCHGADGET",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://wbbsv.com/g/ynys1f2mjpfa9e3fd8784fc29ae1f9/?i=3",
    "storeLogoText": "TOUCH",
    "terms": "Enter code TOUCHGADGET at checkout to apply your discount.",
    "successRate": "99.2%"
  },
  {
    "id": "deal_polis_greencard_sale",
    "storeSlug": "polis",
    "storeName": "Polis UA",
    "storeCategory": "Insurance & Finance",
    "discountBadge": "UP TO 15% OFF",
    "title": "Get 15% Off Vehicle Insurance with Code POLISGREEN",
    "description": "Compare 25+ licensed providers to find the lowest rate for Green Card or MTPL coverage. Your policy arrives instantly via email and Diia, keeping your car legally covered for local and cross-border travel.",
    "code": "POLISGREEN",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/?i=3",
    "storeLogoText": "POLIS",
    "terms": "Enter code POLISGREEN at checkout to apply the 15% discount.",
    "successRate": "99.7%"
  },
  {
    "id": "deal_polis_medical_travel",
    "storeSlug": "polis",
    "storeName": "Polis UA",
    "storeCategory": "Insurance & Finance",
    "discountBadge": "CASHBACK",
    "title": "Get Instant Cashback on Global Travel Insurance Policies",
    "description": "Protect your trip with Schengen or worldwide coverage backed by 24/7 support. Apply code TRAVELSAFE at checkout to receive immediate cashback, lowering your total cost for peace of mind.",
    "code": "TRAVELSAFE",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/?i=3",
    "storeLogoText": "POLIS",
    "terms": "Enter promo code TRAVELSAFE during checkout to apply your cashback discount instantly.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_955119",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "11% OFF",
    "title": "Save 11% on ALLPOWERS Power Stations with Code BULKRATE",
    "description": "Secure reliable backup power for your home or campsite with a verified 11% discount. Apply code BULKRATE at checkout to instantly reduce your total cost on select electronics.",
    "code": "BULKRATE",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-20",
    "affiliateUrl": "https://zmgig.com/g/kq5qyagmb7367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Apply code BULKRATE in the coupon field at ALLPOWERS checkout.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_955118",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "12% OFF",
    "title": "Save 12% on ALLPOWERS Power Stations Over 60000 UAH",
    "description": "Secure reliable backup power for home or camping with a verified 12% discount on qualifying orders. Apply the code at checkout to reduce your total cost immediately.",
    "code": "EXTRA12",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-20",
    "affiliateUrl": "https://zmgig.com/g/ee7b2vbv5q367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter code EXTRA12 at checkout for orders over 60000 UAH.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_955117",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "10% OFF",
    "title": "10% Off ALLPOWERS Solar Generators and Portable Power Stations",
    "description": "Save 10% on reliable solar generators and portable power stations for your next camp or home backup. Apply code EXTRA10 at checkout to secure this verified discount on your order.",
    "code": "EXTRA10",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-20",
    "affiliateUrl": "https://zmgig.com/g/5rhr406s82367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter code EXTRA10 in the promo field during online checkout to apply.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_943840",
    "storeSlug": "kodland",
    "storeName": "Kodland",
    "storeCategory": "Education & Learning",
    "discountBadge": "30% OFF",
    "title": "Save 30% On Kodland Interactive Coding Classes",
    "description": "Give your child hands-on experience in coding and game dev. Use this verified code for an instant 30% discount on any online course. Real skills, real fun, and verified savings.",
    "code": "START30-2",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ewwhk.com/g/11du4h2rtq367099d2cca5fc6f34cb/?i=31",
    "storeLogoText": "KODLAND",
    "terms": "Enter code START30-2 at checkout for 30% off.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_943280",
    "storeSlug": "markformelle",
    "storeName": "Mark Formelle",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "10% OFF",
    "title": "10% OFF On Mark Formelle Seasonal Apparel & Trending Collections",
    "description": "Refresh your wardrobe with authentic Mark Formelle clothing and accessories. Enjoy verified savings with easy worldwide delivery and hassle-free returns.",
    "code": "ADMMF436",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xqjeo.com/g/xu8ibhasrf367099d2cc5a98e4de8b/?i=31",
    "storeLogoText": "MARKFORMELLE",
    "terms": "Apply promo code ADMMF436 at cart checkout to claim discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_943142",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "All Glasses Under $10: Instant Discount, No Code Needed",
    "description": "Shop prescription lenses, blue-light blockers, and designer frames for under ten dollars. This instant markdown applies at checkout, so you save money without entering a promo code.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-10-19",
    "affiliateUrl": "https://codeaven.com/g/vrr1mkl633fa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Price applies at checkout. No coupon code required. Cannot combine with other offers.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942792",
    "storeSlug": "chicme",
    "storeName": "ChicMe",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "12% OFF",
    "title": "ChicMe Halloween Sale: 12% Off Trendy Fashion",
    "description": "Refresh your wardrobe with ChicMe's latest dresses and swimwear. Use code PUMPKIN at checkout to save 12% on your order. This verified discount works for all customers worldwide.",
    "code": "PUMPKIN",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-10-31",
    "affiliateUrl": "https://rzekl.com/g/zcfe0k62wgfa9e3fd878312b8f391a/?i=3",
    "storeLogoText": "CHICME",
    "terms": "Enter code PUMPKIN at checkout for 12% off your total order.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942477",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "3 000 UAH OFF",
    "title": "3 000 UAH OFF On ALLPOWERS Certified Tech & Power Systems",
    "description": "Get guaranteed manufacturer-backed hardware and smart accessories with direct warranty support. Apply this verified offer before checkout to save.",
    "code": "AFUA3OFF",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-30",
    "affiliateUrl": "https://zmgig.com/g/32l1nlv9t7367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Apply promo code AFUA3OFF at cart checkout to claim discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942476",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "2 100 UAH OFF",
    "title": "Save 2,100 UAH on ALLPOWERS Power Stations Over 20,000 UAH",
    "description": "Secure reliable solar power for camping or home backup with this verified discount. Apply the code at checkout to instantly reduce your total by 2,100 UAH on qualifying orders.",
    "code": "AFUA21OFF",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-30",
    "affiliateUrl": "https://zmgig.com/g/q13rztka4u367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter code AFUA21OFF at ALLPOWERS checkout for orders over 20,000 UAH.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942475",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "10% OFF",
    "title": "Save 10% on ALLPOWERS Solar Generators and Power Stations Today",
    "description": "Get 10% off any portable power station or solar panel at ALLPOWERS. This verified code works instantly for online orders worldwide, ensuring you secure reliable backup power at a better price.",
    "code": "AFALLPOWERS",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://zmgig.com/g/2rgjyuxzay367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter code AFALLPOWERS in the promo field during checkout to apply your discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942246",
    "storeSlug": "kodland",
    "storeName": "Kodland",
    "storeCategory": "Education & Learning",
    "discountBadge": "10% OFF",
    "title": "10% Off First Kodland Live Coding Course for Teens",
    "description": "Give your child aged 7-17 a real head start in coding with live, tutor-led sessions. Save 10% on your first confirmed purchase using code START10 to make the investment easier to justify.",
    "code": "START10",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-10-31",
    "affiliateUrl": "https://ewwhk.com/g/njpvx5yu45367099d2cca5fc6f34cb/?i=3",
    "storeLogoText": "KODLAND",
    "terms": "New customers only. Apply code START10 at checkout for one course purchase.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_918499",
    "storeSlug": "purevpn",
    "storeName": "PureVPN",
    "storeCategory": "Privacy & Security",
    "discountBadge": "20% OFF",
    "title": "Save 20% on Secure PureVPN Plans Today",
    "description": "Protect your online identity with fast, encrypted browsing on 6,500+ global servers. This verified 20% discount applies to all plans, making private internet access more affordable right now.",
    "code": "admitad20",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-10-31",
    "affiliateUrl": "https://plrvq.com/g/g14urj1gid367099d2ccdd63dd688c/?i=3",
    "storeLogoText": "PUREVPN",
    "terms": "Enter code admitad20 at checkout to apply.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_904368",
    "storeSlug": "aovica",
    "storeName": "Aovica Store",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "40% OFF",
    "title": "Save 40% on All Aovica Electronics Today",
    "description": "Grab top-rated smart gadgets and audio accessories at 40% off. This verified code works worldwide with official AliExpress warranty, ensuring you get genuine quality without the premium price tag.",
    "code": "ADMITADN62A7",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://rcpsj.com/g/uymluxmlet367099d2cccaca192191/?i=31",
    "storeLogoText": "AOVICA",
    "terms": "Enter code ADMITADN62A7 at Aovica Store checkout to apply your 40% discount instantly.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_899182",
    "storeSlug": "alibaba",
    "storeName": "Alibaba",
    "storeCategory": "E-Commerce & Wholesale",
    "discountBadge": "20 $ OFF",
    "title": "Save $20 on Your First Alibaba Wholesale Order",
    "description": "New here? Grab $20 off when you buy $100 or more from a single store. Perfect for testing supplier quality. Use code HH12 at checkout to lock in your savings.",
    "code": "HH12",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2027-01-01",
    "affiliateUrl": "https://rzekl.com/g/384usiqcl3fa9e3fd878219aa26f6f/?i=3",
    "storeLogoText": "ALIBABA",
    "terms": "New buyers only. Min $100 order. One store. Code HH12. Valid 30 days.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_849211",
    "storeSlug": "airalo",
    "storeName": "Airalo eSIM",
    "storeCategory": "Travel & Tours",
    "discountBadge": "10% OFF",
    "title": "Airalo eSIM: 10% Off Global Data in 200+ Countries",
    "description": "Skip airport lines and roaming bills. Grab 10% off any Airalo plan with code ADM and connect instantly in over 200 countries. Perfect for quick trips or long stays.",
    "code": "ADM",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://dhwnh.com/g/7rvld26bcl367099d2cc0471e42028/?i=3",
    "storeLogoText": "AIRALO",
    "terms": "Apply code ADM at checkout via the provided link. Valid on all new eSIM purchases.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_814385",
    "storeSlug": "vogacloset",
    "storeName": "VogaCloset",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "80% OFF",
    "title": "VogaCloset: 80% Off European Fashion Worldwide",
    "description": "Shop London-based runway styles with up to 80% off right now. Use the verified code at checkout to claim these savings on your entire order, shipping anywhere in the world.",
    "code": "SALE",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/6silcjvoa9fa9e3fd878b52609ec28/?i=3",
    "storeLogoText": "VOGACLOSET",
    "terms": "Enter code SALE at checkout to apply discount to eligible items.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_799278",
    "storeSlug": "dabdoob",
    "storeName": "Dabdoob",
    "storeCategory": "Kids & Toys",
    "discountBadge": "10% OFF",
    "title": "Save 10% on Kids Toys, Up to 25% in KSA",
    "description": "Grab top-rated games and gifts with fast doorstep delivery. Use code TKFL7 for 10% off, or save up to 50 SAR in KSA. Apply at checkout to secure your savings.",
    "code": "TKFL7",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://rzekl.com/g/du3xi8b8ry367099d2cca2c57142dd/?i=31",
    "storeLogoText": "DABDOOB",
    "terms": "Enter code TKFL7 at checkout. Excludes discounted items. Valid for 30 days.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_793511",
    "storeSlug": "thedealoutlet",
    "storeName": "The Deal Outlet",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "75% OFF",
    "title": "Designer Fashion Up To 75% Off At The Deal Outlet",
    "description": "Shop luxury apparel, shoes, and accessories from top brands at steep markdowns. Prices are already reduced in the cart, so you save instantly on every checkout without entering a code.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/2snsgzg8z7367099d2ccb6c5579bcf/?i=3",
    "storeLogoText": "DEALOUTLET",
    "terms": "Apply the 75% discount automatically at checkout for all eligible items.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_790866",
    "storeSlug": "keepersecurity",
    "storeName": "Keeper Security",
    "storeCategory": "Privacy & Security",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "Protect Your Digital Life With Keeper Security",
    "description": "Stop worrying about data breaches. Keeper’s zero-knowledge architecture keeps your passwords and private media encrypted, ensuring only you hold the keys to your digital identity.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/y2stja2t3t367099d2cceb9db1a7c5/?i=3",
    "storeLogoText": "KEEPER",
    "terms": "Start your free trial immediately. No credit card required to begin.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_790865",
    "storeSlug": "keepersecurity",
    "storeName": "Keeper Security",
    "storeCategory": "Privacy & Security",
    "discountBadge": "50% OFF",
    "title": "Save 50% on Keeper Security Unlimited and Family Plans",
    "description": "Protect your digital life with a zero-knowledge password manager, private media vault, and dark web monitoring. This instant 50% discount applies automatically at checkout for unlimited and family tiers worldwide.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/d08cg0w8zk367099d2cceb9db1a7c5/?i=3",
    "storeLogoText": "KEEPER",
    "terms": "No code required. Discount applies instantly during online checkout.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_790864",
    "storeSlug": "keepersecurity",
    "storeName": "Keeper Security",
    "storeCategory": "Privacy & Security",
    "discountBadge": "30% OFF",
    "title": "30% Off Keeper for Military, Medical & First Responders",
    "description": "Protect your personal data with Keeper's zero-knowledge password manager and dark web monitoring. This 30% discount is applied instantly at checkout for verified military, medical, and first responder professionals.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/7bhb9c6ska367099d2cceb9db1a7c5/?i=3",
    "storeLogoText": "KEEPER",
    "terms": "Verify your affiliation at checkout to receive the automatic 30% discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_790863",
    "storeSlug": "keepersecurity",
    "storeName": "Keeper Security",
    "storeCategory": "Privacy & Security",
    "discountBadge": "50% OFF",
    "title": "50% Off Keeper Password Manager for Verified Students",
    "description": "Stop juggling weak passwords. Keeper encrypts your logins and files with zero-knowledge security, so only you hold the key. This instant 50% discount makes enterprise-grade protection affordable for your student budget.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/owje9kq1ld367099d2cceb9db1a7c5/?i=3",
    "storeLogoText": "KEEPER",
    "terms": "Apply at checkout. Instant 50% markdown for verified student accounts only.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_780334",
    "storeSlug": "alibaba",
    "storeName": "Alibaba",
    "storeCategory": "E-Commerce & Wholesale",
    "discountBadge": "80% OFF",
    "title": "Alibaba Guaranteed: 80% Off Wholesale Products for US Buyers",
    "description": "Source directly from manufacturers at prices over 80% below retail. First-time US buyers get free shipping up to $20, making bulk purchasing simple and affordable.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2029-06-13",
    "affiliateUrl": "https://rzekl.com/g/cknugekxemfa9e3fd878219aa26f6f/?i=3",
    "storeLogoText": "ALIBABA",
    "terms": "Instant discount applies at checkout. Free shipping for new US users capped at $20.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776832",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "15% OFF",
    "title": "Save 15% on Penguin Encounter at SeaWorld",
    "description": "Swim alongside rescued dugongs and share lettuce with sea turtles in this 1-hour interactive experience. Grab your tickets for just 250 AED instead of 295 AED.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/x6m9k1w1ogfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Standard checkout applies. Min age 2. No code needed.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776831",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "14% OFF",
    "title": "Save 14% on Sea World Walrus Encounter Ticket",
    "description": "Swim alongside rescued Malquot the dugong and share a lettuce treat with sea turtles. This one-hour close-up experience is now 14% off, letting you connect with marine life at a lower price.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/7vobnbo9xefa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Instant price reduction applies at checkout for groups with children 2+.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776829",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "15% OFF",
    "title": "Save 15% on Abu Dhabi Sea Turtle & Dugong Encounter",
    "description": "Swim alongside rescued marine life at Sea World Abu Dhabi. This instant 15% discount drops the price to 149 AED, giving you a memorable hour with sea turtles and a gentle dugong.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/5w2ufaakyifa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Apply instantly at checkout. Minimum age 2 years. One per customer.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776828",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "2% OFF",
    "title": "Save 2% on Dubai Sea Turtle & Dugong Interaction",
    "description": "Swim alongside rescued sea turtles and share lettuce with Malquot the dugong for just 240 AED. This one-hour marine adventure is open to all ages 2 and up.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/xtrx4n6m8kfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Pay 240 AED at checkout. The 2% discount applies automatically.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776815",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "15% OFF",
    "title": "Save 15% on SeaWorld Dugong and Sea Turtle Encounters",
    "description": "Swim alongside rescued marine life and share treats with turtles for just 250 AED. This instant 15% markdown applies at checkout for a memorable, hands-on underwater experience.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/ukctahusjdfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Price reduced automatically at checkout. No promo code required. Minimum age 2.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776188",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11% OFF",
    "title": "Warner Bros World Abu Dhabi 11% Off",
    "description": "Get one-day entry to all rides and shows at Warner Bros World Abu Dhabi. This offer saves you 11% off the standard rate, bringing the total down to 302 AED.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/axop0sdyytfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Price includes one-day park admission. Select your preferred transfer option at checkout.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776187",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11 AED OFF",
    "title": "Save 11 AED on Ferrari World Abu Dhabi Admission",
    "description": "Grab your one-day pass to Ferrari World Abu Dhabi for 345 AED, down from 390 AED. Enjoy unlimited access to all rides, attractions, and shows with this instant markdown offer.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/2dla0dqw7ifa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Price is pre-discounted. No code needed. Valid for single entry on your selected date.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776185",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11 AED OFF",
    "title": "Yas Waterworld Day Pass with Meal Ticket for 345 AED",
    "description": "Save 11 AED on a full day of water thrills at Yas Waterworld. This bundle includes admission to all rides plus a meal ticket, so you can stay on the island without extra costs.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/na4ktcmfzqfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Instant price reduction applies at checkout. No promo code needed.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776184",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11 AED OFF",
    "title": "Warner Bros World Abu Dhabi Day Pass with Meal Ticket",
    "description": "Save 11 AED on your one-day admission to Warner Bros World Abu Dhabi, including a meal ticket. Enjoy every ride and show at this instant discount price of 302 AED.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/tyromlpdjofa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Instant markdown applied at checkout. No promo code required. Valid for single park entry only.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776183",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11 AED OFF",
    "title": "Save 11 AED on Ferrari World Abu Dhabi Entry Ticket",
    "description": "Enjoy full access to all rides and shows at Ferrari World Abu Dhabi. This instant markdown brings your total to 345 AED, giving you a complete day of high-speed thrills without the usual price tag.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/5pqf62n76efa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Instant discount applied at checkout. No promo code required.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_769927",
    "storeSlug": "jashanmal",
    "storeName": "Jashanmal",
    "storeCategory": "E-Commerce & Wholesale",
    "discountBadge": "10% OFF",
    "title": "Save 10% on Jashanmal Luxury Home Goods with Code TKFL9",
    "description": "Upgrade your living space with premium cookware, luggage, and lifestyle essentials. Apply code TKFL9 at checkout for an immediate 10% discount on eligible items.",
    "code": "TKFL9",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/bsyhi8m623367099d2cc62651c44e1/?i=31",
    "storeLogoText": "JASHANMAL",
    "terms": "Code expires if unused for 14 days. Check rules for excluded brands before purchase.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_757767",
    "storeSlug": "vogacloset",
    "storeName": "VogaCloset",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "20% OFF",
    "title": "Up To 80% Off VogaCloset Styles",
    "description": "Shop London-based runway looks with discounts ranging from 20% to 80%. Apply code LVD at checkout to see your specific savings instantly.",
    "code": "LVD",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/l5jb3bfnoc367099d2ccb52609ec28/?i=31",
    "storeLogoText": "VOGACLOSET",
    "terms": "Enter code LVD at checkout. See product pages for exact discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_757238",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "60 AED OFF",
    "title": "Dubai Parks & Resorts: Motiongate and Real Madrid World Save 60 AED",
    "description": "Grab 60 AED off your Dubai Parks and Resorts ticket, now 295 AED. Includes access to Motiongate, Real Madrid World, and Riverland dining. Perfect for a full day of family entertainment with instant price reduction.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/di1gaf5vs7fa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Show e-ticket or printed copy at entrance turnstiles for immediate scan and entry.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_749565",
    "storeSlug": "chicme",
    "storeName": "ChicMe",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "15% OFF",
    "title": "15% OFF On ChicMe Seasonal Apparel & Trending Collections",
    "description": "Refresh your wardrobe with authentic ChicMe clothing and accessories. Enjoy verified savings with easy worldwide delivery and hassle-free returns.",
    "code": "ADMITAD015",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://rzekl.com/g/cd3rfcselmfa9e3fd878312b8f391a/?i=3",
    "storeLogoText": "CHICME",
    "terms": "Apply promo code ADMITAD015 at cart checkout to claim discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_683746",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "200 AED OFF",
    "title": "Paramotor Desert Flight: 200 AED Off Instantly",
    "description": "Soar 20 minutes over the UAE desert for 750 AED instead of 950. Enjoy sunrise or sunset views with a trained pilot, plus hotel transfers and refreshments. Price drops automatically at checkout.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/unmr0tne1qfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Bring valid ID, max weight 110kg, fill waiver 24h prior.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_626893",
    "storeSlug": "vperfumes",
    "storeName": "Vperfumes",
    "storeCategory": "Beauty & Fragrances",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "EXCLUSIVE DEAL On Vperfumes Luxury Fragrances & Salon-Grade Care",
    "description": "Discover 100% authentic designer scents, skincare, and beauty products. Verified promotion valid on official catalog inventory.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://wbbsv.com/g/uaami8ff60367099d2ccbe59cac899/?i=3",
    "storeLogoText": "VPERFUMES",
    "terms": "Direct promotional pricing applied automatically at merchant checkout.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_579772",
    "storeSlug": "thedealoutlet",
    "storeName": "The Deal Outlet",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "15% OFF",
    "title": "Save 15% on Your First Designer Fashion Order",
    "description": "Start your luxury journey with an instant 15% discount on designer apparel and accessories. Apply this verified code at checkout to reduce your total bill immediately.",
    "code": "FIRST15",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/flre7moyl6367099d2ccb6c5579bcf/?i=3",
    "storeLogoText": "DEALOUTLET",
    "terms": "Enter code FIRST15 in the promo field during checkout to apply your discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_549217",
    "storeSlug": "thedealoutlet",
    "storeName": "The Deal Outlet",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "Designer Fashion Up To 75% Off With Free Shipping",
    "description": "Shop verified luxury apparel, shoes, and accessories at up to 75% off. Enjoy authentic designer collections with complimentary express doorstep shipping.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/fep6flw79m367099d2ccb6c5579bcf/?i=3",
    "storeLogoText": "DEALOUTLET",
    "terms": "No code needed. Apply instant markdown at checkout for orders over 350 AED.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_540087",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "10 $ OFF",
    "title": "Save $10 on Prescription Eyewear at Glasseslit",
    "description": "Treat your eyes to premium designer frames or essential blue-light blockers without the markup. This verified code instantly applies $10 off your total cart value at checkout, making quality vision care more affordable.",
    "code": "AD10",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/v00buptjhffa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Enter code AD10 in the promo field during online checkout.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_481995",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "50% OFF",
    "title": "Glasseslit: 50% Off Second Pair of Frames and Lenses",
    "description": "Upgrade your eyewear wardrobe with a second pair of frames and lenses for half price. Add at least two items to your cart, and the system automatically applies the discount to the lower-priced pair at checkout.",
    "code": "50OFF",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/ym9397vfztfa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Add two pairs to cart, then enter code 50OFF at checkout.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_456284",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "EXCLUSIVE DEAL On Glasseslit Designer Frames & Prescription Lenses",
    "description": "Order custom prescription eyeglasses, blue-light blockers, and durable frames directly from Glasseslit. Verified markdown activates at online payment.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/9b7qdysh5mfa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Direct promotional pricing applied automatically at merchant checkout.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_456274",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "50% OFF",
    "title": "Save 50% on Your Second Pair of Glasses Today",
    "description": "Add a second pair of frames to your cart for exactly $9.95. This instant discount applies to any regular-priced eyewear, letting you refresh your rotation or grab a backup without the usual markup.",
    "code": "",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/273jpvcb5ofa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Buy one full-price pair to activate. Limited to one discounted pair per order.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_377422",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "5 $ OFF",
    "title": "5 $ OFF On Glasseslit Designer Frames & Prescription Lenses",
    "description": "Order custom prescription eyeglasses, blue-light blockers, and durable frames directly from Glasseslit. Verified markdown activates at online payment.",
    "code": "ADMITAD",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/up6c82wed2fa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Apply promo code ADMITAD at cart checkout to claim discount.",
    "successRate": "99.4%"
  }
];

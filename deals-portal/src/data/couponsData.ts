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
    "title": "50% Off Windows Optimization, Privacy & Registry Security Software",
    "description": "Exclusive CJ Affiliate discount on top-rated Windows utilities, SSD Fresh, and privacy shields with lifetime license guarantees.",
    "code": "ABELSSOFT50",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://www.anrdoezrs.net/click-8102806-15509939",
    "storeLogoText": "ABELSSOFT",
    "terms": "Valid on full Windows optimization suites and individual licenses.",
    "successRate": "99.8%"
  },
  {
    "id": "deal_hostinger_cloud_75",
    "storeSlug": "hostinger",
    "storeName": "Hostinger",
    "storeCategory": "Web Hosting & Domains",
    "discountBadge": "75% OFF + FREE DOMAIN",
    "title": "75% Off Premium Web Hosting + Free Custom Domain & Unlimited SSL",
    "description": "Ultra-fast LiteSpeed WordPress hosting with 100 website allocations, daily backups, and 24/7 live support.",
    "code": "HOSTING75",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://flirtcheck.site/go?offer=hostinger&source=deals_hostinger&trigger=coupon_card&intent=deals&sub3=hosting75",
    "storeLogoText": "HOSTINGER",
    "terms": "Applies to multi-year plans. 30-day money-back guarantee.",
    "successRate": "99.9%"
  },
  {
    "id": "deal_hostinger_cloud_starter",
    "storeSlug": "hostinger",
    "storeName": "Hostinger",
    "storeCategory": "Web Hosting & Domains",
    "discountBadge": "65% OFF",
    "title": "Cloud Startup Hosting with Dedicated IP Address & NVMe Performance",
    "description": "Deploy industrial-grade cloud servers with isolated resources, HTTP/3 acceleration, and 99.9% uptime SLA.",
    "code": "CLOUDLAUNCH",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://flirtcheck.site/go?offer=hostinger&source=deals_hostinger&trigger=coupon_card&intent=deals&sub3=cloudlaunch",
    "storeLogoText": "HOSTINGER",
    "terms": "Instant server provision upon payment verification.",
    "successRate": "99.5%"
  },
  {
    "id": "deal_expressvpn_49",
    "storeSlug": "expressvpn",
    "storeName": "ExpressVPN",
    "storeCategory": "Privacy & Security",
    "discountBadge": "49% OFF + 3 MO FREE",
    "title": "Save 49% On Annual Plan + Get 3 Extra Months Completely Free",
    "description": "Military-grade encryption, TrustedServer technology, and high-speed servers across 105 countries with 30-day guarantee.",
    "code": "EXPRESS49",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/4raik6r0sq367099d2cc309c6148a0/?i=3",
    "storeLogoText": "EXPRESSVPN",
    "terms": "Risk-free 30-day unconditional refund policy.",
    "successRate": "99.8%"
  },
  {
    "id": "deal_qustodio_20",
    "storeSlug": "qustodio",
    "storeName": "Qustodio",
    "storeCategory": "Privacy & Security",
    "discountBadge": "20% OFF",
    "title": "20% Off Premium Parental Controls, Screen Time & Location Tracking",
    "description": "Protect family devices with real-time web filtering, app blocking, call monitoring, and SOS alerts.",
    "code": "FAMILY20",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://zejcl.com/g/zgsaevrb3a367099d2cc9537f00609/?i=3",
    "storeLogoText": "QUSTODIO",
    "terms": "Valid on Premium Basic and Complete family plans.",
    "successRate": "99.1%"
  },
  {
    "id": "deal_onlinesim_15",
    "storeSlug": "onlinesim",
    "storeName": "OnlineSIM",
    "storeCategory": "Privacy & Security",
    "discountBadge": "15% EXTRA CREDITS",
    "title": "Receive 15% Bonus Credits on Virtual Numbers for SMS Verification",
    "description": "Private disposable and rental mobile numbers across 90+ countries for WhatsApp, Telegram, Google, and Apple ID.",
    "code": "SIMSECURE15",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ewwhk.com/g/gei3abuc8o367099d2cc6868dfbb80/?i=3",
    "storeLogoText": "ONLINESIM",
    "terms": "Bonus credited instantly on cryptocurrency or card deposits.",
    "successRate": "98.9%"
  },
  {
    "id": "deal_touch_smartphones_sale",
    "storeSlug": "touch",
    "storeName": "Touch UA",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "UP TO 30% OFF",
    "title": "Seasonal Sale on Certified Apple, Xiaomi & Samsung Smartphones",
    "description": "Official electronics store with manufacturer warranties, trade-in programs, and fast domestic delivery.",
    "code": "TOUCHGADGET",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://wbbsv.com/g/ynys1f2mjpfa9e3fd8784fc29ae1f9/?i=3",
    "storeLogoText": "TOUCH",
    "terms": "Valid on in-stock certified mobile devices and smart watches.",
    "successRate": "99.2%"
  },
  {
    "id": "deal_polis_greencard_sale",
    "storeSlug": "polis",
    "storeName": "Polis UA",
    "storeCategory": "Insurance & Finance",
    "discountBadge": "UP TO 15% OFF",
    "title": "Up To 15% Off International Green Card & Vehicle MTPL Insurance",
    "description": "Compare 25+ licensed insurance companies online with immediate policy delivery to your email and Diia state app.",
    "code": "POLISGREEN",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/?i=3",
    "storeLogoText": "POLIS",
    "terms": "Valid on online electronic vehicle and travel insurance policies.",
    "successRate": "99.7%"
  },
  {
    "id": "deal_polis_medical_travel",
    "storeSlug": "polis",
    "storeName": "Polis UA",
    "storeCategory": "Insurance & Finance",
    "discountBadge": "CASHBACK",
    "title": "Online Travel & Health Insurance Vouchers with Instant Verification",
    "description": "Save on international Schengen, Worldwide, and domestic tourist health insurance coverage with 24/7 assistance.",
    "code": "TRAVELSAFE",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/?i=3",
    "storeLogoText": "POLIS",
    "terms": "Immediate official PDF certificate sent to policyholder.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_955119",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "11% OFF",
    "title": "Buy 2, Get 11% Off",
    "description": "Apply this verified promo voucher at ALLPOWERS checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "BULKRATE",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-20",
    "affiliateUrl": "https://zmgig.com/g/kq5qyagmb7367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter promo code \"BULKRATE\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_955118",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "12% OFF",
    "title": "12% OFF Orders Over 60000 UAH",
    "description": "Apply this verified promo voucher at ALLPOWERS checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "EXTRA12",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-20",
    "affiliateUrl": "https://zmgig.com/g/ee7b2vbv5q367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter promo code \"EXTRA12\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_955117",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "10% OFF",
    "title": "Storewide 10% Off",
    "description": "Apply this verified promo voucher at ALLPOWERS checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "EXTRA10",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-20",
    "affiliateUrl": "https://zmgig.com/g/5rhr406s82367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter promo code \"EXTRA10\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_943840",
    "storeSlug": "kodland",
    "storeName": "Kodland",
    "storeCategory": "Education & Learning",
    "discountBadge": "30% OFF",
    "title": "30% discount",
    "description": "Apply this verified promo voucher at Kodland checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "START30-2",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ewwhk.com/g/11du4h2rtq367099d2cca5fc6f34cb/?i=31",
    "storeLogoText": "KODLAND",
    "terms": "Enter promo code \"START30-2\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_943280",
    "storeSlug": "markformelle",
    "storeName": "Mark Formelle",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "10% OFF",
    "title": "10% Off Entire Apparel Catalog with Verified Promo Code",
    "description": "Apply this verified promo voucher at Mark Formelle checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "ADMMF436",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xqjeo.com/g/xu8ibhasrf367099d2cc5a98e4de8b/?i=31",
    "storeLogoText": "MARKFORMELLE",
    "terms": "Enter promo code \"ADMMF436\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_943142",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "Double Ten Carnival- All Frames ≤ USD 10",
    "description": "1. All Frames ≤ USD 10. No coupon code needed. 2. No double discounts.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-10-19",
    "affiliateUrl": "https://codeaven.com/g/vrr1mkl633fa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942792",
    "storeSlug": "chicme",
    "storeName": "ChicMe",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "12% OFF",
    "title": "Halloween promo code",
    "description": "Apply this verified promo voucher at ChicMe checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "PUMPKIN",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-10-31",
    "affiliateUrl": "https://rzekl.com/g/zcfe0k62wgfa9e3fd878312b8f391a/?i=3",
    "storeLogoText": "CHICME",
    "terms": "Enter promo code \"PUMPKIN\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942477",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "3 000 UAH OFF",
    "title": "3,000 UAH OFF Orders Over 28,000 UAH",
    "description": "Apply this verified promo voucher at ALLPOWERS checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "AFUA3OFF",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-30",
    "affiliateUrl": "https://zmgig.com/g/32l1nlv9t7367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter promo code \"AFUA3OFF\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942476",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "2 100 UAH OFF",
    "title": "2,100 UAH OFF Orders Over 20,000 UAH",
    "description": "Apply this verified promo voucher at ALLPOWERS checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "AFUA21OFF",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-11-30",
    "affiliateUrl": "https://zmgig.com/g/q13rztka4u367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter promo code \"AFUA21OFF\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942475",
    "storeSlug": "allpowers",
    "storeName": "ALLPOWERS",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "10% OFF",
    "title": "Get 10% off sitewide today",
    "description": "Apply this verified promo voucher at ALLPOWERS checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "AFALLPOWERS",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://zmgig.com/g/2rgjyuxzay367099d2ccc628098d9a/?i=3",
    "storeLogoText": "ALLPOWERS",
    "terms": "Enter promo code \"AFALLPOWERS\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_942246",
    "storeSlug": "kodland",
    "storeName": "Kodland",
    "storeCategory": "Education & Learning",
    "discountBadge": "10% OFF",
    "title": "10% off your first Kodland course — live, tutor-led coding classes for kids and teens (7–17)",
    "description": "Valid for new customers only, on the first confirmed course purchase. Cannot be combined with other offers.",
    "code": "START10",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-10-31",
    "affiliateUrl": "https://ewwhk.com/g/njpvx5yu45367099d2cca5fc6f34cb/?i=3",
    "storeLogoText": "KODLAND",
    "terms": "Enter promo code \"START10\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_918499",
    "storeSlug": "purevpn",
    "storeName": "PureVPN",
    "storeCategory": "Privacy & Security",
    "discountBadge": "20% OFF",
    "title": "20 OFF on all plans",
    "description": "Apply this verified promo voucher at PureVPN checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "admitad20",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-10-31",
    "affiliateUrl": "https://plrvq.com/g/g14urj1gid367099d2ccdd63dd688c/?i=3",
    "storeLogoText": "PUREVPN",
    "terms": "Enter promo code \"admitad20\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_904368",
    "storeSlug": "aovica",
    "storeName": "Aovica Store",
    "storeCategory": "Electronics & Gadgets",
    "discountBadge": "40% OFF",
    "title": "Discount : 40% (applies to all products)",
    "description": "Apply this verified promo voucher at Aovica Store checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "ADMITADN62A7",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://rcpsj.com/g/uymluxmlet367099d2cccaca192191/?i=31",
    "storeLogoText": "AOVICA",
    "terms": "Enter promo code \"ADMITADN62A7\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_899182",
    "storeSlug": "alibaba",
    "storeName": "Alibaba",
    "storeCategory": "E-Commerce & Wholesale",
    "discountBadge": "20 $ OFF",
    "title": "$20 off promo code",
    "description": "Get $20 off for orders over $100. Exclusive for your first order Once claimed, the coupon is valid for 30 days. Detailed rules ○ This discount code is only applicable to new buyers who have not made any transactions on Alibaba.com before; ○ Once claimed, the coupon is valid for 30 days. The final amount of your order after discount and including shipping fees must be at least US $1. ○ Offer period: February 16, 2026 - January 01, 2027 (Pacific Time). ○ Single store orders: This offer is valid for transactions with a single store only and cannot be applied across multiple stores. If you apply for a refund on an order that has already benefited from this offer, the coupon will be reinstated and can be used again. ○ Currency conversion: If you transact in a non-USD currency, the discount value might change due to currency exchange rates. ○ Promotion interpretation: Alibaba.com reserves the right to the final interpretation of this promotional offer.",
    "code": "HH12",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2027-01-01",
    "affiliateUrl": "https://rzekl.com/g/384usiqcl3fa9e3fd878219aa26f6f/?i=3",
    "storeLogoText": "ALIBABA",
    "terms": "Enter promo code \"HH12\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_849211",
    "storeSlug": "airalo",
    "storeName": "Airalo eSIM",
    "storeCategory": "Travel & Tours",
    "discountBadge": "10% OFF",
    "title": "10% Off all Products",
    "description": "Must be promoted with an affiliate link. 10% Off on all products",
    "code": "ADM",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://dhwnh.com/g/7rvld26bcl367099d2cc0471e42028/?i=3",
    "storeLogoText": "AIRALO",
    "terms": "Enter promo code \"ADM\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_814385",
    "storeSlug": "vogacloset",
    "storeName": "VogaCloset",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "80% OFF",
    "title": "The Biggest Sale of the Year has arrived Up to 80% OFF",
    "description": "Apply this verified promo voucher at VogaCloset checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "SALE",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/6silcjvoa9fa9e3fd878b52609ec28/?i=3",
    "storeLogoText": "VOGACLOSET",
    "terms": "Enter promo code \"SALE\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_799278",
    "storeSlug": "dabdoob",
    "storeName": "Dabdoob",
    "storeCategory": "Kids & Toys",
    "discountBadge": "10% OFF",
    "title": "10% OFF For UAE, Bahrain, and Kuwait, 25% OFF For KSA ONLY UP TO 50 SAR",
    "description": "Codes not applied for discounted items, working for any user and multiple times 25% discount valid in KSA only, with a maximum discount of 50 SAR. Promo Code T&Cs: Please be informed that if there is no usage by your personal promo code within 30 days, the promo code will be automatically withdrawn.",
    "code": "TKFL7",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://rzekl.com/g/du3xi8b8ry367099d2cca2c57142dd/?i=31",
    "storeLogoText": "DABDOOB",
    "terms": "Enter promo code \"TKFL7\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_793511",
    "storeSlug": "thedealoutlet",
    "storeName": "The Deal Outlet",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "75% OFF",
    "title": "25-75% off on selected items",
    "description": "Apply this verified promo voucher at The Deal Outlet checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/2snsgzg8z7367099d2ccb6c5579bcf/?i=3",
    "storeLogoText": "DEALOUTLET",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_790866",
    "storeSlug": "keepersecurity",
    "storeName": "Keeper Security",
    "storeCategory": "Privacy & Security",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "B2C Free Trial!",
    "description": "Don’t get hacked. Try Keeper today and see why it's trusted by millions of people and thousands of businesses of all sizes.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/y2stja2t3t367099d2cceb9db1a7c5/?i=3",
    "storeLogoText": "KEEPER",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_790865",
    "storeSlug": "keepersecurity",
    "storeName": "Keeper Security",
    "storeCategory": "Privacy & Security",
    "discountBadge": "50% OFF",
    "title": "50% Off Unlimited and Family!",
    "description": "Apply this verified promo voucher at Keeper Security checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/d08cg0w8zk367099d2cceb9db1a7c5/?i=3",
    "storeLogoText": "KEEPER",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_790864",
    "storeSlug": "keepersecurity",
    "storeName": "Keeper Security",
    "storeCategory": "Privacy & Security",
    "discountBadge": "30% OFF",
    "title": "Military and Medical: Get 30% OFF!",
    "description": "Keeper is proud to offer 30% off to Military, First Responders, Nurses, Doctors and Hospital Employees",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/7bhb9c6ska367099d2cceb9db1a7c5/?i=3",
    "storeLogoText": "KEEPER",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_790863",
    "storeSlug": "keepersecurity",
    "storeName": "Keeper Security",
    "storeCategory": "Privacy & Security",
    "discountBadge": "50% OFF",
    "title": "Student Get 50% Off!",
    "description": "Calling All Students! Did you know we offer 50% off Keeper to protect your passwords and private information? You'll never have to remember or worry about passwords again.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://ziejy.com/g/owje9kq1ld367099d2cceb9db1a7c5/?i=3",
    "storeLogoText": "KEEPER",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_780334",
    "storeSlug": "alibaba",
    "storeName": "Alibaba",
    "storeCategory": "E-Commerce & Wholesale",
    "discountBadge": "80% OFF",
    "title": "Saving Spotlight (over 80% below retail price)",
    "description": "Alibaba Guaranteed products. Over 80% below retail price with spotlight on other savings. First-time users of Alibaba Guaranteed products in the United States can enjoy additional benefit of free shipping (capped at $20). Type: Special promotion Categories: ALL Region: NO,NZ,SK,PT,CZ,HU,GR,RO,IE,BG,HR,RS,AL,LT,BA,IS,LV,EE,MK,SI,AD,LU,MD,MT,GL,AM,ME,MC,GI,FO,GG,LI,VN,TH,ID,PH,SG,JP,KR",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2029-06-13",
    "affiliateUrl": "https://rzekl.com/g/cknugekxemfa9e3fd878219aa26f6f/?i=3",
    "storeLogoText": "ALIBABA",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776832",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "15% OFF",
    "title": "Sea world - Penguin Encounter Ticket 250 AED was (295)",
    "description": "Inclusions Sea turtle experience is for 1 hour approximately. Admission to Dugong or Sea Turtle experience. Interact closely with Malquot, a rescued dugong. Share a lettuce treat amidst swimming sea turtles. Participants must be minimum 2 years old.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/x6m9k1w1ogfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776831",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "14% OFF",
    "title": "Sea world - Walrus Encounter Ticket 209 AED was (245)",
    "description": "Inclusions Sea turtle experience is for 1 hour approximately. Admission to Dugong or Sea Turtle experience. Interact closely with Malquot, a rescued dugong. Share a lettuce treat amidst swimming sea turtles. Participants must be minimum 2 years old.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/7vobnbo9xefa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776829",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "15% OFF",
    "title": "Sea world - Dugong/Sea Turtle Encounter Ticket 149 AED was (175)",
    "description": "landing page: https://www.raynatours.com/abu-dhabi/theme-parks/seaworld-experiences-e-509156 Inclusions Sea turtle experience is for 1 hour approximately. Admission to Dugong or Sea Turtle experience. Interact closely with Malquot, a rescued dugong. Share a lettuce treat amidst swimming sea turtles. Participants must be minimum 2 years old.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/5w2ufaakyifa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776828",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "2% OFF",
    "title": "Sea Venture- Sea Trek Adventure Ticket 240 AED was (245)",
    "description": "Inclusions Sea turtle experience is for 1 hour approximately. Admission to Dugong or Sea Turtle experience. Interact closely with Malquot, a rescued dugong. Share a lettuce treat amidst swimming sea turtles. Participants must be minimum 2 years old.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/xtrx4n6m8kfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776815",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "15% OFF",
    "title": "Sea world - Dolphin Encounter Ticket 250 AED was (295)",
    "description": "landing page: https://www.raynatours.com/abu-dhabi/theme-parks/seaworld-experiences-e-509156 Inclusions Sea turtle experience is for 1 hour approximately. Admission to Dugong or Sea Turtle experience. Interact closely with Malquot, a rescued dugong. Share a lettuce treat amidst swimming sea turtles. Participants must be minimum 2 years old.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/ukctahusjdfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776188",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11% OFF",
    "title": "Warner Bros with meal ticket(Abu Dhabi) 302 AED was (340)",
    "description": "landing page:https://www.raynatours.com/abu-dhabi/theme-parks/warner-bros-world-abu-dhabi-e-5184 Inclusions Services provided as per the booked transfers: ticket-only, sharing or private. One-day admission to either Warner Bros World Abu Dhabi Access to all rides, attractions, and shows within the chosen park Validity as per the date mentioned on ticket Please note that the ticket is for single park entry only",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/axop0sdyytfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776187",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11 AED OFF",
    "title": "Ferrari with Meal Ticket (Abu Dhabi) 345 AED was (390)",
    "description": "landing page:https://www.raynatours.com/abu-dhabi/theme-parks/ferrari-theme-park-abu-dhabi-e-4827 Inclusions Services provided as per the booked transfers: ticket-only, sharing or private. One-day admission to Ferrari World Abu Dhabi Access to all rides, attractions, and shows within the chosen park Validity as per the date mentioned on ticket Please note that the ticket is for single park entry only",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/2dla0dqw7ifa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776185",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11 AED OFF",
    "title": "Yas waterworld with meal ticket 345 AED was (390)",
    "description": "landing page: https://www.raynatours.com/dubai/theme-parks/yas-island-theme-park-tickets-e-508810 Inclusions Services provided as per the booked transfers: ticket-only, sharing or private. One-day admission to Warner Bros World Abu Dhabi Access to all rides, attractions, and shows within the chosen park Validity as per the date mentioned on ticket Please note that the ticket is for single park entry only",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/na4ktcmfzqfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776184",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11 AED OFF",
    "title": "Warner Bros with meal ticket 302 AED was (340)",
    "description": "landing page: https://www.raynatours.com/dubai/theme-parks/warner-bros-world-from-dubai-e-9176 Inclusions Services provided as per the booked transfers: ticket-only, sharing or private. One-day admission to Warner Bros World Abu Dhabi Access to all rides, attractions, and shows within the chosen park Validity as per the date mentioned on ticket Please note that the ticket is for single park entry only",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/tyromlpdjofa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_776183",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "11 AED OFF",
    "title": "Ferrari with Meal Ticket (345) was 390",
    "description": "landing page: https://www.raynatours.com/dubai/theme-parks/ferrari-world-theme-park-e-57 Inclusions Services provided as per the booked transfers: ticket-only, sharing or private. One-day admission to Ferrari World Abu Dhabi Access to all rides, attractions, and shows within the chosen park Validity as per the date mentioned on ticket Please note that the ticket is for single park entry only",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/5pqf62n76efa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_769927",
    "storeSlug": "jashanmal",
    "storeName": "Jashanmal",
    "storeCategory": "E-Commerce & Wholesale",
    "discountBadge": "10% OFF",
    "title": "10% off",
    "description": "Find the list of excluded brands in the campaign rules. Please note that the promo code will be automatically deactivated if there are no orders tracked with the code within 14 days since it was assigned.",
    "code": "TKFL9",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/bsyhi8m623367099d2cc62651c44e1/?i=31",
    "storeLogoText": "JASHANMAL",
    "terms": "Enter promo code \"TKFL9\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_757767",
    "storeSlug": "vogacloset",
    "storeName": "VogaCloset",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "20% OFF",
    "title": "Variable (Different discount for each product) Range from 20% to 80% (Except Beauty)",
    "description": "The coupon discount may vary - different discount for each product. Please subscribe to our newsletters to stay updated.",
    "code": "LVD",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/l5jb3bfnoc367099d2ccb52609ec28/?i=31",
    "storeLogoText": "VOGACLOSET",
    "terms": "Enter promo code \"LVD\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_757238",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "60 AED OFF",
    "title": "Dubai Parks and Resorts: Motiongate and Real Madrid World with meal offer save 60 AED per person*",
    "description": "Was 355 AED, now 295 AED Landing page: https://www.raynatours.com/dubai/theme-parks/dubai-parks-and-resorts-e-4837 *T&C apply Dubai Parks and Resorts Inclusions Choose your ideal Dubai Parks and Resorts™ ticket which allows you to add up to two theme parks. Enjoy access to dining and leisure attractions at Riverland™ Dubai Immerse yourself in the marvelous Hollywood based rides, or exclusive family themed attractions at LEGOLAND® Dubai Transfers - If option selected Dubai Parks and Resorts How to Redeem To redeem your tickets, please ensure you have either your E-tickets or printed copies with you. Approach the turnstiles and place your tickets against the scanner. Once scanned, you can proceed to enter the venue and embark on a memorable trip.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/di1gaf5vs7fa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_749565",
    "storeSlug": "chicme",
    "storeName": "ChicMe",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "15% OFF",
    "title": "OVER $98 EXTRA 15% OFF",
    "description": "Apply this verified promo voucher at ChicMe checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "ADMITAD015",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://rzekl.com/g/cd3rfcselmfa9e3fd878312b8f391a/?i=3",
    "storeLogoText": "CHICME",
    "terms": "Enter promo code \"ADMITAD015\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_683746",
    "storeSlug": "raynatours",
    "storeName": "RaynaTours",
    "storeCategory": "Travel & Tours",
    "discountBadge": "200 AED OFF",
    "title": "Paramotor Adventure Tour now 750 AED (Was 950)",
    "description": "Paramotor Adventure Tour Inclusions 20 minutes paramotor flight Unparalleled desert views with sightings of indigenous flora and fauna Desert sunrise or sunset views Access to the services of an experienced and trained pilot Private hotel transfers (subject to the package choice) Refreshments Paramotor Adventure Tour Important Information Please carry a valid ID (Passport/Any Govt. ID) proof along with you. (Without any valid ID passengers are not allowed to fly) The waiver form needs to be filled out 24 hours before the flight. Please fill out the Wavier Form and submit the form online. Weight eligibility criteria: Max 110 kg Height eligibility criteria: Min 140 Cm and above. Pregnant Woman will not be allowed to fly, Anyone under the influence of Alcohol or any other drugs is strictly not allowed to fly. Any person who has a Serious Heart problem / serious knee & back pain/broken leg/arm has undergone major surgery during the last 6 months and suffering from height phobia is not recommended for this activity. Disabilities covering mental health and emotional / Physical disabilities are not allowed Also, all passengers will need to sign the declaration that he/she doesn’t have the above problems (Mandatory) Transfer pick-up/drop-off timing can be modified as per the trip schedule by 30 to 60 minutes, depending on traffic conditions and your location.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://xpuvo.com/g/unmr0tne1qfa9e3fd878e94db72a90/?i=3",
    "storeLogoText": "RAYNATOURS",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_626893",
    "storeSlug": "vperfumes",
    "storeName": "Vperfumes",
    "storeCategory": "Beauty & Fragrances",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "Free Delivery on orders above 200 AED",
    "description": "Apply this verified promo voucher at Vperfumes checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://wbbsv.com/g/uaami8ff60367099d2ccbe59cac899/?i=3",
    "storeLogoText": "VPERFUMES",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_579772",
    "storeSlug": "thedealoutlet",
    "storeName": "The Deal Outlet",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "15% OFF",
    "title": "15% off of your first app order",
    "description": "Apply this verified promo voucher at The Deal Outlet checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "FIRST15",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/flre7moyl6367099d2ccb6c5579bcf/?i=3",
    "storeLogoText": "DEALOUTLET",
    "terms": "Enter promo code \"FIRST15\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_549217",
    "storeSlug": "thedealoutlet",
    "storeName": "The Deal Outlet",
    "storeCategory": "Fashion & Apparel",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "Free Shipping Over 350 AED — Designer Fashion Up To 75% Off",
    "description": "Apply this verified promo voucher at The Deal Outlet checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://bywiola.com/g/fep6flw79m367099d2ccb6c5579bcf/?i=3",
    "storeLogoText": "DEALOUTLET",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_540087",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "10 $ OFF",
    "title": "Get $10 off",
    "description": "Apply this verified promo voucher at Glasseslit checkout to redeem active promotional savings. Valid for online orders worldwide.",
    "code": "AD10",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/v00buptjhffa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Enter promo code \"AD10\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_481995",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "50% OFF",
    "title": "Buy 1 get other 50% off (frames+lenses)",
    "description": "Buy 1 get other 50% off (frames+lenses) Please select at least two frames, the higher (highest) price will be charged as original price Apply to all glasses: frame + lens (discount glasses excluded). Code is required.",
    "code": "50OFF",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/ym9397vfztfa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Enter promo code \"50OFF\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_456284",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "EXCLUSIVE DEAL",
    "title": "Free Shipping Over $69 (US/CA)",
    "description": "Free shipping over US$69.(US/CA). Automatically apply without coupon code. Limited to standard shipping. Valid only for specified regions.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/9b7qdysh5mfa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_456274",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "50% OFF",
    "title": "$9.95 Eyeglasses - Up to 50% off",
    "description": "The items should be bought together with one pair of regular price glasses. One order can only add one pair of this item. The item will not share with other promotions.",
    "code": "NOT REQUIRED",
    "isExclusive": false,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/273jpvcb5ofa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Enter promo code \"NOT REQUIRED\" at checkout to activate discount.",
    "successRate": "99.4%"
  },
  {
    "id": "admitad_377422",
    "storeSlug": "glasseslit",
    "storeName": "Glasseslit",
    "storeCategory": "Eyewear & Health",
    "discountBadge": "5 $ OFF",
    "title": "Get $5 off",
    "description": "coupon should be used for frames over $10",
    "code": "ADMITAD",
    "isExclusive": true,
    "isVerified": true,
    "expiryDate": "2026-12-31",
    "affiliateUrl": "https://codeaven.com/g/up6c82wed2fa9e3fd878de0721ef8d/?i=3",
    "storeLogoText": "GLASSESLIT",
    "terms": "Enter promo code \"ADMITAD\" at checkout to activate discount.",
    "successRate": "99.4%"
  }
];

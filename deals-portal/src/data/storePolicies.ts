// deals-portal/src/data/storePolicies.ts
// Store Coupon Policies, Checkout Rules & Insider Saving Hacks Guide
// Benchmarked against Knoji, Slickdeals, Offers.com & CouponFollow

export interface StorePolicy {
  stackingAllowed: boolean;
  stackingDetails: string;
  newsletterDiscount: string;
  studentDiscount: string;
  freeShippingThreshold: string;
  returnPolicy: string;
  rewardsProgram: string;
  savingHacks: Array<{
    title: string;
    description: string;
    tag: 'PRO TIP' | 'TIMING' | 'STACKING' | 'BUNDLE' | 'WELCOME' | 'HIDDEN SAVINGS';
  }>;
}

const STORE_POLICIES_MAP: Record<string, Partial<StorePolicy>> = {
  chicme: {
    stackingAllowed: false,
    stackingDetails: "One promo voucher allowed per order. However, promo codes stack seamlessly on top of pre-existing clearance items and flash sales.",
    newsletterDiscount: "Up to 15% OFF + 500 Bonus Points upon new email newsletter registration.",
    studentDiscount: "15% student discount available via Student Beans verification.",
    freeShippingThreshold: "Free standard shipping on international orders over $69.",
    returnPolicy: "30-day return policy from the delivery date for unwashed and unworn garments.",
    rewardsProgram: "ChicMe Points Club: Earn 1 point for every $1 spent, redeemable for order discounts.",
    savingHacks: [
      {
        tag: "WELCOME",
        title: "Leverage the New Shopper Voucher Stack",
        description: "Combine your first-order welcome voucher with items in the Flash Sale section to achieve effective discounts exceeding 60%."
      },
      {
        tag: "BUNDLE",
        title: "Shop 'Buy 2 Get 1 Free' Seasonal Bundles",
        description: "ChicMe frequently runs multi-buy bundles on swimsuits and dresses. Add eligible bundle items to reach the $69 free shipping mark simultaneously."
      },
      {
        tag: "TIMING",
        title: "Mid-Week Flash Refresh",
        description: "New promotional codes and markdown inventory are typically refreshed on Tuesdays and Thursdays at midnight GMT."
      }
    ]
  },
  glasseslit: {
    stackingAllowed: false,
    stackingDetails: "One coupon code per prescription eyewear order. Applies to frames, coatings, and custom progressive lenses.",
    newsletterDiscount: "$5 to $10 OFF first prescription frame order upon newsletter sign-up.",
    studentDiscount: "10% educational discount on frames and anti-blue light glasses.",
    freeShippingThreshold: "Free worldwide shipping on prescription orders exceeding $59.",
    returnPolicy: "30-day warranty and hassle-free lens replacement guarantee for optical inaccuracies.",
    rewardsProgram: "Referral Club: Give $10 to a friend, get $10 in store credit.",
    savingHacks: [
      {
        tag: "PRO TIP",
        title: "Input Exact PD (Pupillary Distance)",
        description: "Avoid optical re-order fees by having your optometrist measure your exact pupillary distance before customizing lenses."
      },
      {
        tag: "BUNDLE",
        title: "Free Anti-Reflective Coating Bundles",
        description: "Look for special bundle deals where blue-light blocking or anti-scratch coatings are included at zero surcharge."
      },
      {
        tag: "HIDDEN SAVINGS",
        title: "BOGO Frame Sales",
        description: "Glasseslit frequently runs 'Buy 1, Get 2nd Frame at 50% Off' promotions—ideal for pairing regular eyeglasses with prescription sunglasses."
      }
    ]
  },
  raynatours: {
    stackingAllowed: false,
    stackingDetails: "One promotional voucher allowed per activity reservation. Applies to Dubai excursions, desert safaris, and attraction combo passes.",
    newsletterDiscount: "Instant 5% to 10% voucher on your first UAE sightseeing booking.",
    studentDiscount: "Special youth & student pricing available on select theme park tickets with valid ID.",
    freeShippingThreshold: "Instant 100% digital e-ticket delivery to your email and WhatsApp.",
    returnPolicy: "Free cancellation up to 24–48 hours before scheduled tour departures on most experiences.",
    rewardsProgram: "Rayna Rewards: Earn booking points redeemable for future Dubai and international tours.",
    savingHacks: [
      {
        tag: "BUNDLE",
        title: "Book Multi-Attraction Combo Passes",
        description: "Pairing a Desert Safari with Burj Khalifa or Dubai Aquarium tickets in a single combo booking saves up to 35% compared to individual gate prices."
      },
      {
        tag: "TIMING",
        title: "Off-Peak Safari Departure Discounts",
        description: "Morning and weekday desert safaris frequently feature exclusive promo rates that undercut weekend evening slots."
      },
      {
        tag: "PRO TIP",
        title: "Direct Hotel Transfer Inclusions",
        description: "Ensure you select packages that bundle centralized hotel pick-up and drop-off to eliminate private taxi surcharges across Dubai."
      }
    ]
  },
  airalo: {
    stackingAllowed: false,
    stackingDetails: "One referral or coupon code per eSIM checkout. Applies to local, regional, and global data packages.",
    newsletterDiscount: "10% OFF first international eSIM data profile with verified code ADM.",
    studentDiscount: "15% off student travel data packages via Student Beans & UNiDAYS.",
    freeShippingThreshold: "Instant 100% digital delivery via QR code scan in smartphone settings.",
    returnPolicy: "Full refund guarantee prior to eSIM installation and network activation.",
    rewardsProgram: "Airmoney Loyalty: Earn 5% back on every eSIM purchase and top-up to spend on future trips.",
    savingHacks: [
      {
        tag: "PRO TIP",
        title: "Choose Regional Over Single-Country eSIMs",
        description: "If traveling through multiple European or Asian nations, Regional eSIMs (e.g. Eurolink) prevent having to buy separate profiles for each border crossing."
      },
      {
        tag: "STACKING",
        title: "Stack Airmoney with Promo Codes",
        description: "You can apply your accumulated Airmoney store credit on top of promotional coupon codes during checkout."
      },
      {
        tag: "TIMING",
        title: "Install Before Flight, Activate on Arrival",
        description: "Install your eSIM profile while on home Wi-Fi before boarding. The validity countdown only starts once the eSIM connects to a supported destination carrier."
      }
    ]
  },
  allpowers: {
    stackingAllowed: true,
    stackingDetails: "Promo codes stack on top of catalog bundle markdowns and seasonal emergency power promotions.",
    newsletterDiscount: "5% to 10% OFF first portable power station or solar panel generator.",
    studentDiscount: "Special discounts for outdoor researchers and educational institutes upon inquiry.",
    freeShippingThreshold: "Free express ground shipping on major power station models.",
    returnPolicy: "30-day money-back guarantee with a comprehensive 2 to 5-year hardware warranty on LiFePO4 cells.",
    rewardsProgram: "Solar Pioneers Club: Earn points on gear purchases and social shares.",
    savingHacks: [
      {
        tag: "BUNDLE",
        title: "Buy Power Station + Solar Panel Combos",
        description: "Purchasing an ALLPOWERS solar generator kit bundles the solar panels at an effective 40% discount versus buying panels separately."
      },
      {
        tag: "HIDDEN SAVINGS",
        title: "Look for LiFePO4 Battery Cycle Ratings",
        description: "Models with LiFePO4 battery chemistry deliver 3,500+ charge cycles, yielding a significantly lower lifetime cost per watt-hour than standard lithium-ion."
      },
      {
        tag: "PRO TIP",
        title: "High-Wattage Fast-Charging Mode",
        description: "Take advantage of dual AC + Solar dual-charging capabilities to recharge units in under 1.5 hours before rolling power outages."
      }
    ]
  },
  thedealoutlet: {
    stackingAllowed: false,
    stackingDetails: "One promo voucher per checkout. Discounts apply on top of clearance outlet prices up to 75% off.",
    newsletterDiscount: "15% OFF first designer order with newsletter registration code FIRST15.",
    studentDiscount: "Seasonal university student fashion incentives.",
    freeShippingThreshold: "Free regional delivery in UAE & GCC on orders above 350 AED.",
    returnPolicy: "14-day hassle-free return window for unworn luxury items with authentic designer tags intact.",
    rewardsProgram: "Amber Rewards Program: Earn and spend luxury points across Chalhoub Group retail outlets.",
    savingHacks: [
      {
        tag: "WELCOME",
        title: "Apply FIRST15 on Outlet Clearance",
        description: "Apply voucher FIRST15 to items already marked down 70% in the clearance tab for maximum compounded savings."
      },
      {
        tag: "BUNDLE",
        title: "Reach the 350 AED Free Shipping Floor",
        description: "Consolidate designer shoes and accessories in a single basket to bypass the 25 AED shipping surcharge."
      },
      {
        tag: "TIMING",
        title: "End-of-Season Luxury Drops",
        description: "The steepest designer price cuts hit the platform in late January and late July when European collections turn over."
      }
    ]
  },
  vogacloset: {
    stackingAllowed: false,
    stackingDetails: "One voucher code per order. Codes stack on top of site-wide sales and clearance discounts.",
    newsletterDiscount: "20% OFF first order upon subscribing to the VogaCloset fashion newsletter.",
    studentDiscount: "15% verified student discount across select European high-street brands.",
    freeShippingThreshold: "Free shipping available during promotional flash windows and on qualifying order amounts.",
    returnPolicy: "14-day local return policy with dedicated courier pick-up service.",
    rewardsProgram: "VogaClub: Exclusive tier-based rewards, early sale access, and birthday gifts.",
    savingHacks: [
      {
        tag: "PRO TIP",
        title: "Use Verified Code LVD or SALE",
        description: "Promo codes LVD and SALE regularly deduct an extra 15% to 20% even on items listed in the 80% Off clearance section."
      },
      {
        tag: "HIDDEN SAVINGS",
        title: "App-Exclusive Checkout Perks",
        description: "Downloading the VogaCloset mobile app frequently unlocks exclusive push-notification vouchers not accessible on the desktop site."
      },
      {
        tag: "TIMING",
        title: "Payday Weekend Sales",
        description: "Look for major sitewide coupon drops during the last weekend of each month to coincide with regional payroll dates."
      }
    ]
  },
  purevpn: {
    stackingAllowed: false,
    stackingDetails: "One voucher per subscription. Applies to 1-year and 2-year privacy packages.",
    newsletterDiscount: "Exclusive 20% discount code admitad20 available via PromoRadar partner link.",
    studentDiscount: "Up to 82% off student privacy packages via Student Beans.",
    freeShippingThreshold: "Instant 100% digital activation with simultaneous connection across up to 10 devices.",
    returnPolicy: "Unconditional 31-day money-back guarantee with zero risk.",
    rewardsProgram: "Refer-a-Friend: Give 30 days free, receive 30 days added to your subscription.",
    savingHacks: [
      {
        tag: "PRO TIP",
        title: "Select the 2-Year Plan for Maximum Savings",
        description: "Choosing the 2-year subscription drops the effective monthly cost by over 80% compared to rolling monthly billing."
      },
      {
        tag: "STACKING",
        title: "Apply Code admitad20 at Checkout",
        description: "Ensure code admitad20 is entered in the checkout coupon field to deduct an extra 20% on top of pre-applied multi-year discounts."
      },
      {
        tag: "HIDDEN SAVINGS",
        title: "Dedicated IP and Port Forwarding Add-ons",
        description: "Bundle Dedicated IP or Port Forwarding during initial checkout rather than adding them later to lock in promotional rates."
      }
    ]
  },
  expressvpn: {
    stackingAllowed: false,
    stackingDetails: "Direct discount applied automatically via verified partner link. Includes 4 months free on multi-year tiers.",
    newsletterDiscount: "Special promotional pricing with 4 extra months free via PromoRadar exclusive link.",
    studentDiscount: "30-day risk-free trial for students and researchers across all supported operating systems.",
    freeShippingThreshold: "Instant 100% digital download across Windows, Mac, iOS, Android, and home routers.",
    returnPolicy: "30-day unconditional money-back guarantee with 24/7 live chat refund support.",
    rewardsProgram: "Referral Scheme: Earn 30 days of free high-speed VPN service for every friend who signs up.",
    savingHacks: [
      {
        tag: "PRO TIP",
        title: "Lock In 4 Free Months on Long-Term Plans",
        description: "Activate the 2-year privacy plan via our verified partner link to automatically receive 4 bonus months added to your account at no extra charge."
      },
      {
        tag: "BUNDLE",
        title: "Take Advantage of Built-in ExpressVPN Keys",
        description: "Every active subscription includes ExpressVPN Keys, a zero-knowledge password manager, eliminating the need for a separate password manager subscription."
      },
      {
        tag: "TIMING",
        title: "Router-Level Installation for Unlimited Devices",
        description: "Installing ExpressVPN directly on your Wi-Fi router protects all connected smart TVs and IoT devices while counting as only 1 of your 8 allowed connections."
      }
    ]
  },
  keepersecurity: {
    stackingAllowed: false,
    stackingDetails: "One promotional code per business or personal vault subscription.",
    newsletterDiscount: "Up to 30% OFF Personal and Family Vault plans with verified code 30OFF.",
    studentDiscount: "50% educational discount for actively enrolled students and faculty.",
    freeShippingThreshold: "Instant digital provisioning across unlimited smartphones, tablets, and laptops.",
    returnPolicy: "Free 30-day evaluation trial with zero credit card required.",
    rewardsProgram: "Enterprise referral bonuses and partner certified MSP incentives.",
    savingHacks: [
      {
        tag: "BUNDLE",
        title: "Choose the Family Plan Over Individual Seats",
        description: "The Keeper Family plan includes 5 private vaults for up to 5 users at less than double the price of a single individual license."
      },
      {
        tag: "PRO TIP",
        title: "Add BreachWatch Dark Web Monitoring",
        description: "Bundle BreachWatch dark web credential monitoring during checkout to secure lower multi-year add-on pricing."
      },
      {
        tag: "TIMING",
        title: "Cybersecurity Awareness Month Promos",
        description: "Keeper Security rolls out its deepest consumer discounts during October (Cybersecurity Awareness Month) and Black Friday."
      }
    ]
  },
  qustodio: {
    stackingAllowed: false,
    stackingDetails: "One promo voucher per parental control subscription.",
    newsletterDiscount: "10% to 20% OFF with verified discount code ADMITAD10.",
    studentDiscount: "Educational bulk licensing available for K-12 schools and homeschool groups.",
    freeShippingThreshold: "Instant digital setup on iOS, Android, Chromebook, Kindle, and desktop.",
    returnPolicy: "30-day money-back guarantee on all premium annual subscriptions.",
    rewardsProgram: "Family Ambassador network with renewal credit incentives.",
    savingHacks: [
      {
        tag: "PRO TIP",
        title: "Select Complete Plan for Unlimited Devices",
        description: "The Complete tier protects unlimited devices in your household, making it much more economical than Basic tier if children have both phones and tablets."
      },
      {
        tag: "STACKING",
        title: "Apply Code ADMITAD10 at Checkout",
        description: "Enter coupon code ADMITAD10 on the payment page to deduct an immediate 10% on top of promotional annual pricing."
      },
      {
        tag: "HIDDEN SAVINGS",
        title: "Start with the Free Trial to Experience Premium",
        description: "Sign up for the free tier first to test location tracking and web filtering before upgrading with our verified coupon code."
      }
    ]
  },
  alibaba: {
    stackingAllowed: true,
    stackingDetails: "Alibaba platform coupons stack with supplier-specific volume discounts and Trade Assurance vouchers.",
    newsletterDiscount: "Up to $10 to $50 OFF first bulk trade transaction upon signing up as a verified buyer.",
    studentDiscount: "Student entrepreneur discounts on initial sample orders.",
    freeShippingThreshold: "Varies by supplier and incoterms (FOB, EXW, DDP). Many suppliers offer free sample shipping.",
    returnPolicy: "Trade Assurance protects 100% of payment until goods are inspected and delivered in satisfactory condition.",
    rewardsProgram: "Buyer Club: Earn reward points for trade inquiries and confirmed order reviews.",
    savingHacks: [
      {
        tag: "PRO TIP",
        title: "Always Request Sample Orders with DDP Terms",
        description: "Request Delivered Duty Paid (DDP) terms from suppliers so customs fees, port charges, and freight taxes are included in your quote."
      },
      {
        tag: "STACKING",
        title: "Combine Supplier Discounts with Super September & March Expo",
        description: "Alibaba hosts two massive annual wholesale events (March Expo and Super September) featuring site-wide transaction fee rebates and coupon packs."
      },
      {
        tag: "HIDDEN SAVINGS",
        title: "Filter by Trade Assurance Verified Suppliers",
        description: "Only transact through Verified Suppliers with Trade Assurance to ensure full refund eligibility if manufacturing specifications differ."
      }
    ]
  },
  hostinger: {
    stackingAllowed: true,
    stackingDetails: "Hostinger coupon codes stack on top of promotional 48-month introductory hosting rates.",
    newsletterDiscount: "Special promotional discounts up to 75% OFF + free domain name for 1 year.",
    studentDiscount: "Up to 80% discount for students via Student Beans.",
    freeShippingThreshold: "Instant automated server provisioning with free SSL and automated backups.",
    returnPolicy: "Unconditional 30-day money-back guarantee on all hosting and cloud plans.",
    rewardsProgram: "Hostinger Referral Program: Earn 20% commission on every friend who signs up.",
    savingHacks: [
      {
        tag: "PRO TIP",
        title: "Lock In the 48-Month Billing Cycle",
        description: "Selecting a 4-year commitment locks in the lowest monthly rate (often under $2.99/mo) and shields you from price hikes on yearly renewals."
      },
      {
        tag: "BUNDLE",
        title: "Free Domain Name for the First Year",
        description: "Premium and Business shared hosting plans include a free custom domain registration (.com, .net, etc.) for the first year, saving $12-$15."
      },
      {
        tag: "HIDDEN SAVINGS",
        title: "Built-In Cloudflare CDN & Automated Staging",
        description: "Take advantage of included Cloudflare protected nameservers and 1-click staging environments to eliminate paid third-party developer plugins."
      }
    ]
  }
};

export function getStorePolicy(slug: string, category: string, storeName: string): StorePolicy {
  const specific = STORE_POLICIES_MAP[slug];

  // Default intelligent fallback based on merchant category
  const isDigital = ['Privacy & Security', 'Web Hosting & Domains', 'Education & Learning'].includes(category);
  const isTravel = category === 'Travel & Tours';

  const defaultPolicy: StorePolicy = {
    stackingAllowed: false,
    stackingDetails: `${storeName} generally allows one promo code per checkout, but verified codes stack with existing clearance markdowns.`,
    newsletterDiscount: `New subscribers typically receive a 10% - 15% discount voucher on their first ${storeName} purchase upon email registration.`,
    studentDiscount: isDigital ? "Student and educator discounts available with valid academic credentials." : "Youth & student savings available through accredited student networks.",
    freeShippingThreshold: isDigital || isTravel ? "100% instant digital delivery with zero shipping surcharges." : "Standard free shipping unlocked on qualifying minimum basket totals.",
    returnPolicy: isDigital ? "30-day money-back satisfaction guarantee on all plans." : "14 to 30-day standard return window for unopened or defective merchandise.",
    rewardsProgram: `${storeName} Loyalty Club: Earn points on qualifying purchases towards future discount vouchers.`,
    savingHacks: [
      {
        tag: "PRO TIP",
        title: "Verify Basket Minimums Before Applying",
        description: `Ensure your shopping cart meets any required minimum thresholds and excludes non-discountable clearance items before applying your ${storeName} code.`
      },
      {
        tag: "TIMING",
        title: "Capitalize on Major Seasonal Sales",
        description: `Deepest discounts at ${storeName} typically coincide with Black Friday, Cyber Week, and mid-season collection turnovers.`
      },
      {
        tag: "WELCOME",
        title: "First-Time Buyer Advantage",
        description: `If you are shopping at ${storeName} for the first time, combine introductory welcome bonuses with our verified checkout vouchers.`
      }
    ]
  };

  if (!specific) return defaultPolicy;

  return {
    stackingAllowed: specific.stackingAllowed ?? defaultPolicy.stackingAllowed,
    stackingDetails: specific.stackingDetails ?? defaultPolicy.stackingDetails,
    newsletterDiscount: specific.newsletterDiscount ?? defaultPolicy.newsletterDiscount,
    studentDiscount: specific.studentDiscount ?? defaultPolicy.studentDiscount,
    freeShippingThreshold: specific.freeShippingThreshold ?? defaultPolicy.freeShippingThreshold,
    returnPolicy: specific.returnPolicy ?? defaultPolicy.returnPolicy,
    rewardsProgram: specific.rewardsProgram ?? defaultPolicy.rewardsProgram,
    savingHacks: specific.savingHacks && specific.savingHacks.length > 0 ? specific.savingHacks : defaultPolicy.savingHacks
  };
}

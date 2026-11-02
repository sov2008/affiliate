// deals-portal/src/data/promotionalBanners.ts
// 100% Genuine Merchant Campaign Banners & Seasonal Rotator Data
// Strict Zero Demo Data Rule: Only verified affiliate program campaigns and real HD product feeds

export interface PromoBanner {
  id: string;
  storeSlug: string;
  storeName: string;
  headline: string;
  subheadline: string;
  badge: string;
  seasonTag: 'HALLOWEEN' | 'BLACK_FRIDAY' | 'FALL_SALE' | 'HOLIDAY' | 'EVERGREEN';
  imageUrl: string;
  ctaText: string;
  affiliateUrl: string;
  category: string;
  accentGradient: string;
}

export function getCurrentSeasonTag(): 'HALLOWEEN' | 'BLACK_FRIDAY' | 'FALL_SALE' | 'HOLIDAY' | 'EVERGREEN' {
  const now = new Date();
  const month = now.getMonth(); // 9 = October, 10 = November, 11 = December
  const date = now.getDate();

  if (month === 9 && date >= 15) return 'HALLOWEEN';
  if (month === 10 && date >= 10) return 'BLACK_FRIDAY';
  if (month === 11) return 'HOLIDAY';
  return 'FALL_SALE';
}

export const PROMOTIONAL_BANNERS: PromoBanner[] = [
  {
    id: 'banner-carpuride-stereo',
    storeSlug: 'carpuride',
    storeName: 'Carpuride',
    headline: 'Carpuride 7-Inch Wireless CarPlay & Android Auto System',
    subheadline: 'Portable multimedia touchscreen with dual Bluetooth and mirror link. Instant vehicle upgrade.',
    badge: 'SAVE $50 OFF',
    seasonTag: 'FALL_SALE',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0566/5112/0797/products/01_1_500x.jpg?v=1655185855',
    ctaText: 'Claim Carpuride Deal ↗',
    affiliateUrl: 'https://flirtcheck.site/go?offer=carpuride&sub1=promoradar_rotator',
    category: 'Electronics & Gadgets',
    accentGradient: 'from-blue-600 via-indigo-700 to-slate-900'
  },
  {
    id: 'banner-945-cordura',
    storeSlug: '945-industries',
    storeName: '945 Industries',
    headline: 'QAPS Cordura® Tactical Concealment Bag with IWB Adapter',
    subheadline: 'Low-profile desert sand EDC bag engineered with ballistic Cordura fabric for maximum durability.',
    badge: 'FALL MARKDOWN $77.99',
    seasonTag: 'FALL_SALE',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0660/8909/1258/files/QAPSsand1.jpg?v=1773075528',
    ctaText: 'Shop Tactical Gear ↗',
    affiliateUrl: 'https://flirtcheck.site/go?offer=945industries&sub1=promoradar_rotator',
    category: 'Fashion & Apparel',
    accentGradient: 'from-amber-700 via-stone-800 to-slate-950'
  },
  {
    id: 'banner-rexing-c2',
    storeSlug: 'rexing',
    storeName: 'Rexing Dash Cams',
    headline: 'Rexing C2 Dual 2K Front + 1080p Rear Dash Camera',
    subheadline: 'Wide-angle loop recording, night vision optics, and built-in Wi-Fi mobile control.',
    badge: 'ONLY $99.99',
    seasonTag: 'HALLOWEEN',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0556/5536/6846/files/C2-Main.jpg?v=1759425546',
    ctaText: 'Get Rexing Camera ↗',
    affiliateUrl: 'https://flirtcheck.site/go?offer=rexing&sub1=promoradar_rotator',
    category: 'Electronics & Gadgets',
    accentGradient: 'from-slate-800 via-cyan-900 to-slate-950'
  },
  {
    id: 'banner-fufugaga-cabinet',
    storeSlug: 'fufugaga',
    storeName: 'FUFUGAGA Furniture',
    headline: 'Modern Minimalist Glass Display Cabinet with Gold Accents',
    subheadline: '31.5-inch solid construction with tempered glass doors and generous interior storage drawers.',
    badge: 'VERIFIED PRICE $298.99',
    seasonTag: 'FALL_SALE',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0782/7927/8809/files/1_85180240-ea1e-42f2-8425-202fba5047f2.jpg?v=1764313142',
    ctaText: 'View Furniture Deal ↗',
    affiliateUrl: 'https://flirtcheck.site/go?offer=fufugaga&sub1=promoradar_rotator',
    category: 'Home & Lifestyle',
    accentGradient: 'from-amber-600 via-rose-900 to-slate-950'
  },
  {
    id: 'banner-abelssoft-jetdrive',
    storeSlug: 'abelssoft',
    storeName: 'Abelssoft',
    headline: 'Abelssoft JetDrive 9 Professional Disk Optimization',
    subheadline: 'Defragment storage drives, clean clutter, and dramatically accelerate Windows startup speeds.',
    badge: 'SAVE 50% NOW',
    seasonTag: 'HALLOWEEN',
    imageUrl: 'https://static.abelssoft.de/resize/storage/uploads/2024/08/09/jetdrive_de_uid_66b5b1c9e064d.png?h=490',
    ctaText: 'Accelerate Windows ↗',
    affiliateUrl: 'https://flirtcheck.site/go?offer=abelssoft&sub1=promoradar_rotator',
    category: 'Electronics & Software',
    accentGradient: 'from-emerald-700 via-teal-900 to-slate-950'
  },
  {
    id: 'banner-kincmo-shades',
    storeSlug: 'kincmo',
    storeName: 'Kincmo Smart Living',
    headline: 'Kincmo Cordless UV Protection Solar Window Shades',
    subheadline: 'No-drill precision mounting with solar ray rejection and clean modern aesthetic.',
    badge: 'DIRECT FEED $120.00',
    seasonTag: 'EVERGREEN',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0612/3637/9763/files/502.jpg?v=1774933218',
    ctaText: 'Explore Solar Shades ↗',
    affiliateUrl: 'https://flirtcheck.site/go?offer=kincmo&sub1=promoradar_rotator',
    category: 'Home & Lifestyle',
    accentGradient: 'from-indigo-800 via-slate-900 to-slate-950'
  }
];

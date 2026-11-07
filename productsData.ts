export interface StoreProduct {
  id: string;
  storeSlug: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  imageUrl: string;
  productUrl: string;
  badge?: string;
}

export const STORE_PRODUCTS: Record<string, StoreProduct[]> = {
  "945industries": [
    {
      id: "BAG-SPIRE-S-SLATE",
      storeSlug: "945industries",
      title: "QAPS X-Pac® Slate Concealment Bag",
      description: "Ultra-durable, weather-resistant X-Pac VX21 everyday sling bag engineered for discreet comfort, ambidextrous quick-draw access, and low-print ergonomics.",
      price: "$78.00",
      currency: "USD",
      imageUrl: "https://cdn.shopify.com/s/files/1/0660/8909/1258/files/SpireSslate1.jpg?v=1773074741",
      productUrl: "https://www.jdoqocy.com/click-101907236-17157504?url=https%3A%2F%2F945industries.com%2Fproducts%2Fspire-s-x-pac-slate-concealment-bag",
      badge: "Best Seller"
    },
    {
      id: "QAPL-HALLOWEEN-BUNDLE",
      storeSlug: "945industries",
      title: "Q.A.P.L. Tactical Concealment Bag & Modular Bundle",
      description: "Full-grain Cordura construction with integrated Kydex holster Velcro panel, secondary utility pouch, and modular magazine holder for complete tactical readiness.",
      price: "$263.99",
      currency: "USD",
      imageUrl: "https://cdn.shopify.com/s/files/1/0660/8909/1258/files/Halloween_Bundle_5.1.jpg?v=1760810280",
      productUrl: "https://www.jdoqocy.com/click-101907236-17157504?url=https%3A%2F%2F945industries.com%2Fcollections%2Fbags",
      badge: "Complete Kit"
    },
    {
      id: "HOLSTER-KYDEX-VELCRO",
      storeSlug: "945industries",
      title: "Precision Kydex Holster with Hook Attachment",
      description: "0.080\" precision-molded Kydex holster with industrial hook Velcro backing for instant, secure mounting inside concealment packs and EDC compartments.",
      price: "$74.99",
      currency: "USD",
      imageUrl: "https://cdn.shopify.com/s/files/1/0660/8909/1258/files/TOPO_FOG_1_R.jpg?v=1737590454",
      productUrl: "https://www.jdoqocy.com/click-101907236-17157504?url=https%3A%2F%2F945industries.com%2Fproducts%2Fkydex-holster-with-velcro-hook-attachment-panel-no-light-laser-topo-fog",
      badge: "Essential Accessory"
    }
  ],
  "whokeys": [
    {
      id: "MS-WIN-10-11-OEM",
      storeSlug: "whokeys",
      title: "Microsoft Windows 11 / 10 Pro OEM Lifetime Key",
      description: "Genuine Microsoft OEM activation key for Windows 10 & 11 Pro. Instant digital delivery with lifetime validation and direct Microsoft update support.",
      price: "$28.17",
      currency: "USD",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80",
      productUrl: "https://www.jdoqocy.com/click-101907236-15402815-1684513856000?url=https%3A%2F%2Fwww.whokeys.com",
      badge: "Top Rated"
    },
    {
      id: "MS-OFFICE-2016-PLUS",
      storeSlug: "whokeys",
      title: "Microsoft Office Professional Plus Lifetime License",
      description: "Full suite activation key including Word, Excel, PowerPoint, Outlook, and OneNote with permanent single-PC license rights.",
      price: "$45.52",
      currency: "USD",
      imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80",
      productUrl: "https://www.jdoqocy.com/click-101907236-15402815-1684513856000?url=https%3A%2F%2Fwww.whokeys.com",
      badge: "Popular Deal"
    }
  ],
  "carpuride": [
    {
      id: "CARPURIDE-C92-CONSOLE",
      storeSlug: "carpuride",
      title: "CARPURIDE C92 Portable Wireless Smart Console",
      description: "Plug-and-play wireless Apple CarPlay & Android Auto dash unit with ultra-responsive HD touchscreen, Bluetooth audio integration, and voice navigation.",
      price: "$169.99",
      currency: "USD",
      imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
      productUrl: "https://www.jdoqocy.com/click-101907236-15402815-1684513856000?url=https%3A%2F%2Fcarpuride.com",
      badge: "Verified Hardware"
    }
  ]
};

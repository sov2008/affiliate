const fs = require('fs');
const filePath = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(filePath, 'utf8');

const target = `  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PromoRadar",
    "url": "https://promoradar.store/",
    "logo": "https://promoradar.store/favicon.svg"
  },
  homeFaqSchema
];`;

const replacement = `  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PromoRadar",
    "url": "https://promoradar.store/",
    "logo": "https://promoradar.store/favicon.svg"
  },
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "PromoRadar Verified Coupons & Deal Hub",
    "url": "https://promoradar.store/",
    "description": "Discover 100% verified promo codes and discount vouchers with instant checkout validation.",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": interleavedDeals.length,
      "itemListElement": interleavedDeals.slice(0, 24).map((deal, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": deal.title,
        "url": \`https://promoradar.store/stores/\${deal.canonicalSlug || deal.storeSlug}/\`
      }))
    }
  },
  homeFaqSchema
];`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully enriched homeSchemas with CollectionPage & ItemList Schema!');
} else {
  console.log('Target NOT found in index.astro');
}


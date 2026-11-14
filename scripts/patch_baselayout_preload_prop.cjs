const fs = require('fs');
let base = fs.readFileSync('deals-portal/src/layouts/BaseLayout.astro', 'utf8');

// 1. Add preloadImage prop to Props interface
const propInterfaceTarget = `  ogType?: string;
  storeDealsMap?: Record<string, Array<{ id: string; title: string; code: string; badge: string; affiliateUrl: string }>>;
}`;

const propInterfaceReplacement = `  ogType?: string;
  storeDealsMap?: Record<string, Array<{ id: string; title: string; code: string; badge: string; affiliateUrl: string }>>;
  preloadImage?: string;
}`;

// 2. Destructure preloadImage
const destructureTarget = `  ogType = 'website',
  storeDealsMap
} = Astro.props;`;

const destructureReplacement = `  ogType = 'website',
  storeDealsMap,
  preloadImage
} = Astro.props;`;

// 3. Add link preload tag right before Google Fonts preconnect
const headPreloadTarget = `<!-- Preconnect to Third-Party Assets (Fast DNS & TLS Handshake) -->`;
const headPreloadReplacement = `{preloadImage && (
      <link rel="preload" as="image" href={preloadImage} fetchpriority="high" />
    )}
    <!-- Preconnect to Third-Party Assets (Fast DNS & TLS Handshake) -->`;

if (base.includes(propInterfaceTarget) && base.includes(destructureTarget) && base.includes(headPreloadTarget)) {
  base = base.replace(propInterfaceTarget, propInterfaceReplacement);
  base = base.replace(destructureTarget, destructureReplacement);
  base = base.replace(headPreloadTarget, headPreloadReplacement);
  fs.writeFileSync('deals-portal/src/layouts/BaseLayout.astro', base, 'utf8');
  console.log('BaseLayout.astro updated with preloadImage prop support');
} else {
  console.log('Target mismatch in BaseLayout.astro');
}


const fs = require('fs');
let index = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

const target = `<BaseLayout
  title="PromoRadar — Tested Promo Codes & Exclusive Checkout Vouchers (October 2026)"
  description="Discover 100% verified promo codes and discount vouchers for ChicMe, Glasseslit, RaynaTours, PureVPN, ExpressVPN, Alibaba and more. Instant code reveal & savings."
  activePath="/"
  schemas={homeSchemas}
>`;

const replacement = `<BaseLayout
  title="PromoRadar — Tested Promo Codes & Exclusive Checkout Vouchers (October 2026)"
  description="Discover 100% verified promo codes and discount vouchers for ChicMe, Glasseslit, RaynaTours, PureVPN, ExpressVPN, Alibaba and more. Instant code reveal & savings."
  activePath="/"
  schemas={homeSchemas}
  preloadImage="/promo-media/nike/nike_hero_728x90.jpg"
>`;

if (index.includes(target)) {
  index = index.replace(target, replacement);
  fs.writeFileSync('deals-portal/src/pages/index.astro', index, 'utf8');
  console.log('index.astro updated with preloadImage for LCP banner');
} else {
  console.log('Target mismatch in index.astro');
}


const fs = require('fs');
let modal = fs.readFileSync('deals-portal/src/components/CouponRevealModal.astro', 'utf8');

const target = `<img
          id="modalLogoImg"
          src=""
          alt="Store Logo"
          class="w-full h-full object-contain filter hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />`;

const replacement = `<img
          id="modalLogoImg"
          src=""
          alt="Store Logo"
          width="64"
          height="64"
          class="w-full h-full object-contain filter hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />`;

if (modal.includes(target)) {
  modal = modal.replace(target, replacement);
  fs.writeFileSync('deals-portal/src/components/CouponRevealModal.astro', modal, 'utf8');
  console.log('CouponRevealModal patched successfully');
} else {
  console.log('Target not found in CouponRevealModal.astro');
}


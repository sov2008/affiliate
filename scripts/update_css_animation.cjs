const fs = require('fs');

const file = 'deals-portal/src/styles/global.css';
let css = fs.readFileSync(file, 'utf8');

const startStr = '/* Coupon Cards - Light & Dark Craftsmanship with Pure Glow (No Shift) */';
const endStr = 'html:not(.dark) .deal-grid-card {';

const idxStart = css.indexOf(startStr);
const idxEnd = css.indexOf(endStr);

if (idxStart === -1 || idxEnd === -1) {
  console.error('Indices not found!');
  process.exit(1);
}

const replacement = `/* Coupon Cards & Banners - Light & Dark Craftsmanship with Pure Glow (No Shift) */
.deal-grid-card,
.in-grid-partner-banner {
  border-radius: 1rem !important;
  transform: translateZ(0) !important;
  transition: box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
  will-change: opacity, transform;
}

/* Micro-animation of cards and banners entrance with GPU acceleration and subtle scale-up */
.animate-card-entrance {
  animation: dealCardReveal 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes dealCardReveal {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

`;

css = css.slice(0, idxStart) + replacement + css.slice(idxEnd);
fs.writeFileSync(file, css, 'utf8');
console.log('Successfully updated global.css with dealCardReveal animation!');

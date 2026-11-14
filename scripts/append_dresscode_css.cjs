const fs = require('fs');
const cssPath = 'deals-portal/src/styles/global.css';
let css = fs.readFileSync(cssPath, 'utf8');

const dresscodeCss = `
/* Brand Logo Dress Code Standard: 100% Transparent, crisp rendering, no background containment */
.brand-logo-dresscode {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.brand-ticker-item {
  background: transparent !important;
  border: none !important;
}

.brand-ticker-item img {
  background: transparent !important;
}
`;

if (!css.includes('.brand-logo-dresscode')) {
  css += dresscodeCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Appended .brand-logo-dresscode to global.css');
} else {
  console.log('global.css already contains .brand-logo-dresscode');
}


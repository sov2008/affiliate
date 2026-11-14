const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/BrandLogo.astro', 'utf8');

// Dimensions mapping:
// sm: 44x44
// md: 48x48
// lg: 80x80
// xl: 112x112

let updated = content.replace(
  `const pad = paddingClasses[size] || paddingClasses.md;`,
  `const pad = paddingClasses[size] || paddingClasses.md;

const pixelDimensions = {
  sm: { w: 44, h: 44 },
  md: { w: 48, h: 48 },
  lg: { w: 80, h: 80 },
  xl: { w: 112, h: 112 }
};
const dims = pixelDimensions[size] || pixelDimensions.md;`
);

updated = updated.replace(
  `<img
      src={primaryLogo}
      alt={\`\${store.name} logo\`}
      class="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-200"
      loading="lazy"`,
  `<img
      src={primaryLogo}
      alt={\`\${store.name} logo\`}
      width={dims.w}
      height={dims.h}
      class="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-200"
      loading="lazy"
      decoding="async"`
);

fs.writeFileSync('deals-portal/src/components/BrandLogo.astro', updated, 'utf8');
console.log('BrandLogo.astro updated with explicit width, height and decoding=async');


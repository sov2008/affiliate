const fs = require('fs');

const indexAstroPath = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(indexAstroPath, 'utf8');

// Find lines 43 to 76 and remove them from frontmatter
const startMarker = '// Registries for instant Live Spotlight Auto-suggest\nconst storesRegistry = uniqueCleanStoresList.map';
const endMarker = 'const categoriesRegistry = [';

const sIdx = content.indexOf('// Registries for instant Live Spotlight Auto-suggest');
const eIdx = content.indexOf('const categoriesRegistry = [');

if (sIdx !== -1 && eIdx !== -1) {
  content = content.slice(0, sIdx) + content.slice(eIdx);
  fs.writeFileSync(indexAstroPath, content, 'utf8');
  console.log('✅ Successfully removed dead frontmatter storesRegistry and dealsRegistry!');
} else {
  console.error('❌ Markers not found');
}


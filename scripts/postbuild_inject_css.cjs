const fs = require('fs');
const path = require('path');

function getAstroCssFiles(distDir) {
  const astroDir = path.join(distDir, '_astro');
  if (!fs.existsSync(astroDir)) return [];
  return fs.readdirSync(astroDir).filter(f => f.endsWith('.css')).sort();
}

function injectMissingCss(distDir) {
  const cssFiles = getAstroCssFiles(distDir);
  console.log('Detected CSS files in _astro:', cssFiles);
  if (cssFiles.length === 0) {
    console.error('No CSS files found in _astro!');
    return false;
  }

  // Generate link tags (Footer.css first for main tailwind layer, then index.css for scoped)
  // Or in alphabetical order: Footer.*.css, index.*.css
  const linkTags = cssFiles.map(f => `<link rel="stylesheet" href="/_astro/${f}">`).join('');

  function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith('.html')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        // Check if local _astro css is already linked
        const hasAstroCss = cssFiles.some(f => content.includes(f));
        if (!hasAstroCss) {
          // Inject right before </head>
          if (content.includes('</head>')) {
            content = content.replace('</head>', `${linkTags}</head>`);
            fs.writeFileSync(fullPath, content, 'utf8');
          }
        }
      }
    });
  }

  walk(distDir);
  console.log('CSS injection complete for all HTML files in', distDir);
  return true;
}

if (require.main === module) {
  let targetDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../deals-portal/dist');
  if (path.basename(targetDir) !== 'dist') {
    if (fs.existsSync(path.join(targetDir, 'dist'))) {
      targetDir = path.join(targetDir, 'dist');
    }
  }
  injectMissingCss(targetDir);
}

module.exports = { injectMissingCss, getAstroCssFiles };


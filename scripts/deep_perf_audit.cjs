const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

console.log('=== Performance checks ===');
// 1. Render blocking stylesheets
const styles = html.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
console.log('Stylesheets count:', styles.length);
styles.forEach(s => console.log('  Style:', s));

// 2. Head scripts
const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
console.log('Total scripts count:', scripts.length);
scripts.forEach((s, i) => {
  const openTag = s.match(/<script[^>]*>/i)[0];
  console.log(`  Script ${i} tag: ${openTag} (length: ${s.length} bytes)`);
});

// 3. Document size
console.log('HTML size (bytes):', Buffer.byteLength(html, 'utf8'));

// 4. Preload candidates
const preloads = html.match(/<link[^>]+rel=["']preload["'][^>]*>/gi) || [];
console.log('Preloads count:', preloads.length);
preloads.forEach(p => console.log('  Preload:', p));

// 5. CSS files in _astro
const cssFiles = fs.readdirSync('deals-portal/dist/_astro').filter(f => f.endsWith('.css'));
console.log('\nCSS files in dist/_astro:');
cssFiles.forEach(f => {
  const stats = fs.statSync(`deals-portal/dist/_astro/${f}`);
  console.log(`  ${f}: ${(stats.size / 1024).toFixed(2)} KB`);
});

// 6. JS files in _astro
const jsFiles = fs.readdirSync('deals-portal/dist/_astro').filter(f => f.endsWith('.js'));
console.log('\nJS files in dist/_astro:');
jsFiles.forEach(f => {
  const stats = fs.statSync(`deals-portal/dist/_astro/${f}`);
  console.log(`  ${f}: ${(stats.size / 1024).toFixed(2)} KB`);
});


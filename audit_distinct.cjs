const fs = require('fs');
const path = require('path');

const dist = '/var/www/affiliate/deals-portal/dist';

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = getHtmlFiles(dist);
const brokenMap = new Map();

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/href="\/stores\/([a-z0-9-]+)\/"/g) || [];
  matches.forEach(m => {
    const slug = m.replace('href="/stores/', '').replace('/"', '');
    const target = path.join(dist, 'stores', slug, 'index.html');
    if (!fs.existsSync(target)) {
      if (!brokenMap.has(slug)) brokenMap.set(slug, []);
      brokenMap.get(slug).push(path.relative(dist, file));
    }
  });
});

console.log('Distinct broken slugs:', brokenMap.size);
for (const [slug, files] of brokenMap.entries()) {
  console.log(`- ${slug} (${files.length} references, e.g. ${files[0]})`);
}


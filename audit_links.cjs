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
let checked = 0;
const broken = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/href="\/stores\/([a-z0-9-]+)\/"/g) || [];
  matches.forEach(m => {
    checked++;
    const slug = m.replace('href="/stores/', '').replace('/"', '');
    const target = path.join(dist, 'stores', slug, 'index.html');
    if (!fs.existsSync(target)) {
      broken.push({ file: path.relative(dist, file), slug });
    }
  });
});

console.log('Total /stores/ links checked:', checked);
console.log('Broken /stores/ links:', broken.length);
if (broken.length > 0) {
  console.log('First 10 broken:', broken.slice(0, 10));
}


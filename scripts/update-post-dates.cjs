const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'blog', 'src', 'content', 'posts');
const DATES = [
  '2026-06-03','2026-06-06','2026-06-09','2026-06-12','2026-06-15',
  '2026-06-18','2026-06-21','2026-06-24','2026-06-27','2026-06-30',
  '2026-07-02','2026-07-05','2026-07-07','2026-07-10','2026-07-12',
  '2026-07-14','2026-07-17','2026-07-19','2026-07-22','2026-07-25',
  '2026-07-28','2026-07-31','2026-08-02','2026-08-05','2026-08-08',
  '2026-08-11','2026-08-14','2026-08-17','2026-08-20','2026-08-23',
  '2026-08-26','2026-08-29','2026-09-01','2026-09-04','2026-09-07',
  '2026-09-10','2026-09-13','2026-09-16','2026-09-19'
];

const files = fs.readdirSync(POSTS_DIR).filter(function(f) { return f.endsWith('.md'); }).sort().reverse();

files.forEach(function(file, i) {
  if (i >= DATES.length) return;
  const filePath = path.join(POSTS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const newDate = DATES[DATES.length - 1 - i];
  const replaced = content.replace(/^pubDate:.*$/m, "pubDate: '" + newDate + "'");
  if (replaced !== content) {
    fs.writeFileSync(filePath, replaced, 'utf8');
    console.log('OK: ' + file.slice(0, 55) + ' -> ' + newDate);
  } else {
    console.warn('SKIP (no pubDate found): ' + file);
  }
});

console.log('\nDONE - updated ' + Math.min(files.length, DATES.length) + ' files');

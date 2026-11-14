const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

console.log('--- Search for buttons without aria-label or name ---');
const btnRegex = /<button\s+([^>]+)>/gi;
let m;
let unnamedBtns = 0;
while ((m = btnRegex.exec(html)) !== null) {
  const attrs = m[1];
  const hasAria = /aria-label=/.test(attrs);
  const hasTitle = /title=/.test(attrs);
  // find closing tag or content
  const start = m.index + m[0].length;
  const end = html.indexOf('</button>', start);
  const content = html.slice(start, end).replace(/<[^>]+>/g, '').trim();
  if (!hasAria && !hasTitle && !content) {
    console.log('Button without accessible name:', attrs);
    unnamedBtns++;
  }
}
console.log('Total unnamed buttons:', unnamedBtns);

console.log('--- Search for links without accessible name ---');
const aRegex = /<a\s+([^>]+)>/gi;
let unnamedLinks = 0;
while ((m = aRegex.exec(html)) !== null) {
  const attrs = m[1];
  const hasAria = /aria-label=/.test(attrs);
  const hasTitle = /title=/.test(attrs);
  const start = m.index + m[0].length;
  const end = html.indexOf('</a>', start);
  const content = html.slice(start, end).replace(/<[^>]+>/g, '').trim();
  if (!hasAria && !hasTitle && !content) {
    const href = (attrs.match(/href=["']([^"']+)["']/) || [])[1] || 'no-href';
    console.log('Link without accessible name:', { href, attrs });
    unnamedLinks++;
  }
}
console.log('Total unnamed links:', unnamedLinks);


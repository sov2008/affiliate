const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const preloaderStart = html.indexOf('id="promoradar-preloader"');
const preloaderEnd = html.indexOf('</div>', preloaderStart + 500); // let's see how big the preloader div is
console.log('Preloader starts at:', preloaderStart);
console.log('Snippet of preloader:', html.substring(preloaderStart, preloaderStart + 600));

const headerStart = html.indexOf('<header');
const headerEnd = html.indexOf('</header>', headerStart);
console.log('Header length:', headerEnd - headerStart);
const headerContent = html.substring(headerStart, headerEnd);

// What is taking 156KB in the header?
const navStores = (headerContent.match(/<a\b[^>]*\/stores\//gi) || []).length;
console.log('Number of /stores/ links in header:', navStores);

// Check dropdown menus in header
console.log('Header length breakdown:');
const matches = headerContent.match(/<div class="[^"]*dropdown[^"]*"[\s\S]*?<\/div>/gi) || [];
console.log('Dropdowns count:', matches.length);


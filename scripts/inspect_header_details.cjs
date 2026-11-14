const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const headerStart = html.indexOf('<header');
const headerEnd = html.indexOf('</header>', headerStart);
const headerContent = html.substring(headerStart, headerEnd);

const regex = /<([a-z0-9]+)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
// Let's inspect child divs of header
const firstLevel = headerContent.match(/<div\b[^>]*>[\s\S]*?<\/div>/gi) || [];
console.log('Total divs in header:', (headerContent.match(/<div/g) || []).length);

// Let's find large sub-blocks in header
const lines = headerContent.split('\n');
console.log('Header lines:', lines.length);

// Search for large sections like mega-menus or store lists
const storeMenus = headerContent.match(/id="[^"]*"/g) || [];
console.log('Header IDs:', storeMenus);


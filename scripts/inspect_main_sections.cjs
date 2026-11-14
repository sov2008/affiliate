const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const matches = html.match(/id="([^"]+)"/g) || [];
console.log('Total IDs in page:', matches.length);

// Let's find tags by size in the body
const mainStart = html.indexOf('<main');
const mainEnd = html.indexOf('</main>', mainStart);
console.log('Main length:', mainEnd - mainStart);

const mainContent = html.substring(mainStart, mainEnd);
// Let's see section IDs inside main
const sections = mainContent.match(/<(section|div)\b[^>]*id="([^"]+)"[^>]*>/gi) || [];
console.log('Main sections count:', sections.length);
sections.forEach(s => console.log(s.substring(0, 100)));


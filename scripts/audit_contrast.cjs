const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// Check contrast on common text classes
const textMatches = html.match(/class="[^"]*(?:text-slate-400|text-slate-500|text-gray-400|text-zinc-400)[^"]*"/g) || [];
console.log('Low contrast classes occurrences:', textMatches.length);


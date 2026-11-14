const fs = require('fs');
const jsPath = 'deals-portal/public/scripts/home-interactive.js';
let js = fs.readFileSync(jsPath, 'utf8');

const target = `const showingCountEl = document.getElementById('paginationShowingCount');
      if (showingCountEl) showingCountEl.textContent = String(actuallyShown);

      const totalCountEl = document.getElementById('paginationTotalCount');
      if (totalCountEl) totalCountEl.textContent = String(matchedCount);`;

const idx = js.indexOf('paginationShowingCount');
console.log('Found paginationShowingCount at:', idx);
if (idx !== -1) {
  console.log(js.slice(idx - 100, idx + 400));
}


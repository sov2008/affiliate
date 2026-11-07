const fs = require('fs');
let content = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

const sSort = content.indexOf('// Deals Sort Select');
const eSort = content.indexOf('// Instant Deal Alert Subscribe Form');

if (sSort !== -1 && eSort !== -1) {
  const newSort = [
    '// Deals Sort Select with Banner Rhythm Preservation',
    '    const sortSelect = document.getElementById("dealsSortSelect");',
    '    sortSelect?.addEventListener("change", function() {',
    '      const mode = sortSelect.value;',
    '      const grid = document.getElementById("dealsGridContainer");',
    '      if (!grid) return;',
    '      const dealCards = Array.from(grid.querySelectorAll(".deal-grid-card"));',
    '      const bannerCards = Array.from(grid.querySelectorAll(".in-grid-partner-banner"));',
    '',
    '      dealCards.sort(function(a, b) {',
    '        if (mode === "discount") {',
    '          const badgeA = a.querySelector(".badge-standard-discount, .badge-cash-rebate, .badge-bonus-deal")?.textContent || "";',
    '          const badgeB = b.querySelector(".badge-standard-discount, .badge-cash-rebate, .badge-bonus-deal")?.textContent || "";',
    '          const matchA = badgeA.match(/\\d+/);',
    '          const matchB = badgeB.match(/\\d+/);',
    '          const discA = matchA ? parseInt(matchA[0], 10) : 0;',
    '          const discB = matchB ? parseInt(matchB[0], 10) : 0;',
    '          return discB - discA;',
    '        } else if (mode === "verified") {',
    '          const isTopA = a.classList.contains("ring-1") ? 1 : 0;',
    '          const isTopB = b.classList.contains("ring-1") ? 1 : 0;',
    '          return isTopB - isTopA;',
    '        } else {',
    '          return 0;',
    '        }',
    '      });',
    '',
    '      grid.innerHTML = "";',
    '      dealCards.forEach(function(card, idx) {',
    '        grid.appendChild(card);',
    '        if ((idx + 1) % 7 === 0) {',
    '          const bIdx = Math.floor((idx + 1) / 7) - 1;',
    '          if (bannerCards[bIdx]) {',
    '            grid.appendChild(bannerCards[bIdx]);',
    '          }',
    '        }',
    '      });',
    '      filterDeals();',
    '    });',
    '',
    '    '
  ].join('\r\n');

  content = content.slice(0, sSort) + newSort + '\r\n\r\n' + content.slice(eSort);
  fs.writeFileSync('deals-portal/src/pages/index.astro', content, 'utf8');
  console.log('Successfully patched sortSelect in index.astro!');
} else {
  console.log('sSort or eSort not found', sSort, eSort);
}

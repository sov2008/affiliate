const fs = require('fs');
console.log('Patching spotlight...');
const p = 'deals-portal/src/components/CuratedSpotlightSection.astro';
let s = fs.readFileSync(p, 'utf8');

const sIdx = s.indexOf('  function syncSpotlightFilters() {');
const eIdx = s.indexOf('  syncSpotlightFilters();');

if (sIdx !== -1 && eIdx !== -1) {
  const newCode =   function syncSpotlightFilters() {
    let reg = 'GLOBAL';
    let lang = 'en';
    try {
      reg = localStorage.getItem('promoradar_selected_region') || 'GLOBAL';
      lang = localStorage.getItem('promoradar_lang') || 'en';
    } catch (e) {}

    const allCards = Array.from(document.querySelectorAll('.spotlight-expiring-card'));
    const matchingRegional = [];
    const fallbackWorldwide = [];

    allCards.forEach(card => {
      const cRegions = (card.getAttribute('data-regions') || 'GLOBAL').split(',');
      const cLang = card.getAttribute('data-lang') || 'en';

      const matchRegion = (!reg || reg === 'ALL' || reg === 'GLOBAL') ? true : cRegions.includes(reg);
      const matchLang = (lang === 'en') ? (cLang === 'en') : (cLang === lang || cLang === 'en');

      if (matchRegion && matchLang) {
        matchingRegional.push(card);
      } else if (cRegions.includes('GLOBAL') || cRegions.includes('US') || cRegions.includes('EU')) {
        fallbackWorldwide.push(card);
      }
    });

    const toShow = new Set(matchingRegional.slice(0, 4));
    if (toShow.size < 4) {
      for (const fb of fallbackWorldwide) {
        toShow.add(fb);
        if (toShow.size === 4) break;
      }
    }

    allCards.forEach(card => {
      if (toShow.has(card)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  s = s.slice(0, sIdx) + newCode + '\n\n' + s.slice(eIdx);
  fs.writeFileSync(p, s, 'utf8');
  console.log('Spotlight patched successfully!');
} else {
  console.log('Spotlight search strings not found');
}
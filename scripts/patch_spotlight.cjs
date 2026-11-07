const fs = require('fs');
let spotlight = fs.readFileSync('deals-portal/src/components/CuratedSpotlightSection.astro', 'utf8');
let newFunc = `  function syncSpotlightFilters() {
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
      const cLand = card.getAttribute('data-lang') || 'en';

      const matchRegion = (!reg || reg === 'ALL' || reg === 'GLOBAL') ? true : cRegions.includes(reg);
      const matchLand = (lang === 'en') ? (cLand === 'en') : (cLang === lang || cLang === 'en');

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
  }`;\n\nconst sIdx = spotlight.indexOf('  function syncSpotlightFilters() {);\nconst eIdx = spotlight.indexOf('  syncSpotlightFilters();');\nspotlight = spotlight.slice(0, sIdx) + newFunc + '\n\n' + spotlight.slice(eIdx);\nfs.writeFileSync('deals-portal/src/components/CuratedSpotlightSection.astro', spotlight, 'utf8');\nconsole.log('Portal spotlight patched successfully!');
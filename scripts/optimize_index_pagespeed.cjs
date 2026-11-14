const fs = require('fs');

const indexAstroPath = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(indexAstroPath, 'utf8');

// 1. In index.astro, instead of {interleavedDeals.map((deal, idx) => ...
// we change to {interleavedDeals.slice(0, 24).map((deal, idx) => ...
const oldGridMap = `{interleavedDeals.map((deal, idx) => {`;
const newGridMap = `{interleavedDeals.slice(0, 24).map((deal, idx) => {`;

if (content.includes(oldGridMap)) {
  content = content.replace(oldGridMap, newGridMap);
  console.log('✅ Updated interleavedDeals.slice(0, 24) in SSR markup');
} else {
  console.error('❌ Could not find oldGridMap');
}

// 2. In define:vars, remove heavy storeDomainsRegistry, storesRegistry, dealsRegistry
// We only keep baseUrl and heroSavingsById
const oldDefineVars = `<script is:inline define:vars={{ storeDomainsRegistry: STORE_DOMAINS_MAP, storesRegistry, dealsRegistry, categoriesRegistry, baseUrl: base, heroSavingsById: HERO_SAVINGS_BY_ID }}>`;
const newDefineVars = `<script is:inline define:vars={{ categoriesRegistry, baseUrl: base, heroSavingsById: HERO_SAVINGS_BY_ID }}>`;

if (content.includes(oldDefineVars)) {
  content = content.replace(oldDefineVars, newDefineVars);
  console.log('✅ Removed heavy inlined dictionaries from define:vars');
} else {
  console.error('❌ Could not find oldDefineVars');
}

// 3. Add async loader for search-index.json
const oldSpotlightInit = `    // Live Hero Spotlight Search Auto-suggest Engine
    const heroSpotlight = document.getElementById('heroSearchSpotlight');`;

const newSpotlightInit = `    // Asynchronous Search Index Loader (0kb initial blocking payload)
    let storesRegistry = [];
    let dealsRegistry = [];
    let storeDomainsRegistry = {};
    let searchIndexLoaded = false;
    let searchIndexLoading = false;

    async function loadSearchIndex() {
      if (searchIndexLoaded || searchIndexLoading) return;
      searchIndexLoading = true;
      try {
        const res = await fetch(\`\${baseUrl}/data/search-index.json\`);
        if (res.ok) {
          const data = await res.json();
          storesRegistry = data.stores || [];
          dealsRegistry = data.deals || [];
          storeDomainsRegistry = data.domains || {};
          searchIndexLoaded = true;
        }
      } catch (e) {
        console.warn('Search index load failed', e);
      } finally {
        searchIndexLoading = false;
      }
    }

    // Live Hero Spotlight Search Auto-suggest Engine
    const heroSpotlight = document.getElementById('heroSearchSpotlight');`;

if (content.includes(oldSpotlightInit)) {
  content = content.replace(oldSpotlightInit, newSpotlightInit);
  console.log('✅ Added asynchronous search index loader');
} else {
  console.error('❌ Could not find oldSpotlightInit');
}

// 4. In search inputs, call loadSearchIndex() on focus or input
const oldHeroInput = `    heroInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (headerInput) headerInput.value = searchQuery;
      updateHeroClearBtn(searchQuery);
      filterDeals();
      renderHeroSpotlight(searchQuery);
    });`;

const newHeroInput = `    heroInput?.addEventListener('input', async (e) => {
      searchQuery = e.target.value;
      if (headerInput) headerInput.value = searchQuery;
      updateHeroClearBtn(searchQuery);
      filterDeals();
      if (!searchIndexLoaded) await loadSearchIndex();
      renderHeroSpotlight(searchQuery);
    });

    heroInput?.addEventListener('focus', () => {
      loadSearchIndex();
    });

    headerInput?.addEventListener('focus', () => {
      loadSearchIndex();
    });`;

if (content.includes(oldHeroInput)) {
  content = content.replace(oldHeroInput, newHeroInput);
  console.log('✅ Hooked async search index load to input focus/type');
} else {
  console.error('❌ Could not find oldHeroInput');
}

fs.writeFileSync(indexAstroPath, content, 'utf8');
console.log('🎉 Successfully saved optimized index.astro');


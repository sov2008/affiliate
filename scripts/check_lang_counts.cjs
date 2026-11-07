const fs = require('fs');

function detectLang(storeSlug, title, description) {
  const s = (storeSlug || '').toLowerCase();
  const t = (title || '') + ' ' + (description || '');
  if (s.endsWith('-mx') || s.includes('-mx-')) return 'es';
  if (s.endsWith('-br') || s.includes('-br-')) return 'pt';
  if (s.endsWith('-cz') || s.includes('-cz-')) return 'cs';
  if (s.endsWith('-pl') || s.includes('-pl-')) return 'pl';
  if (s.endsWith('-ua') || s.includes('-ua-') || s === 'touch' || s === 'polis' || s === 'turbosto') return 'ua';
  if (s.endsWith('-de') || s.includes('-de-')) return 'de';

  if (/[іІїЇєЄ]/.test(t)) return 'ua';
  if (/[čďěňřšťůžČĎĚŇŘŠŤŮŽ]/.test(t)) return 'cs';
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(t)) return 'pl';
  if (/[ãõÃÕçÇ]/.test(t)) return 'pt';
  if (/[áéíóúÁÉÍÓÚñÑ]/.test(t)) return 'es';
  if (/[\u0600-\u06FF]/.test(t)) return 'ar';
  if (/[äöüÄÖÜß]/.test(t)) return 'de';
  return 'en';
}

const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const counts = {};
const regex = /"id":\s*"([^"]+)",\s*"storeSlug":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"description":\s*"([^"]+)"/g;
let m;
while ((m = regex.exec(content)) !== null) {
  const lang = detectLang(m[2], m[3], m[4]);
  counts[lang] = (counts[lang] || 0) + 1;
}

console.log('Language distribution in couponsData:', counts);

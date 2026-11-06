const fs = require('fs');
const path = require('path');

const storesDir = path.resolve('deals-portal/dist/stores');
const storeEntries = fs.readdirSync(storesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`Auditing all ${storeEntries.length} generated store pages in dist/stores/...\n`);

const results = [];

for (const slug of storeEntries) {
  const htmlPath = path.join(storesDir, slug, 'index.html');
  if (!fs.existsSync(htmlPath)) continue;

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Match Header Visit Store button
  const headerMatch = html.match(/<a\s+[^>]*href="([^"]+)"[^>]*class="[^"]*rounded-xl bg-gradient-to-r from-indigo-600[^"]*"[^>]*>[\s\S]*?Visit\s+([^<]+)\s+Store/i);
  // Match Hacks Visit Store button
  const hacksMatch = html.match(/<a\s+[^>]*href="([^"]+)"[^>]*class="[^"]*rounded-xl bg-slate-900[^"]*"[^>]*>[\s\S]*?Visit\s+([^<]+)\s+Store/i);

  const headerHref = headerMatch ? headerMatch[1].replace(/&amp;/g, '&') : null;
  const hacksHref = hacksMatch ? hacksMatch[1].replace(/&amp;/g, '&') : null;
  const storeName = headerMatch ? headerMatch[2].trim() : (hacksMatch ? hacksMatch[2].trim() : slug);

  // Check dating leakage
  const datingDomains = ['chemistrydrivensmile', 'engagingdating', 'realmessaging', 'lospollos'];
  const hasDatingLeak = datingDomains.some(d => (headerHref && headerHref.includes(d)) || (hacksHref && hacksHref.includes(d)));

  // Check if both buttons point to same destination
  const isConsistent = headerHref === hacksHref;

  // Classify destination
  let type = 'unknown';
  if (headerHref) {
    if (headerHref.includes('anrdoezrs.net') || headerHref.includes('jdoqocy.com') || headerHref.includes('kqzyfj.com') || headerHref.includes('dpbolvw.net') || headerHref.includes('tkqlhce.com')) {
      type = 'CJ_Affiliate_Network';
    } else if (
      headerHref.includes('admitad') || headerHref.includes('rzekl.com') || headerHref.includes('codeaven.com') ||
      headerHref.includes('xpuvo.com') || headerHref.includes('dhwnh.com') || headerHref.includes('zmgig.com') ||
      headerHref.includes('bywiola.com') || headerHref.includes('ewwhk.com') || headerHref.includes('plrvq.com') ||
      headerHref.includes('ziejy.com') || headerHref.includes('zejcl.com') || headerHref.includes('wbbsv.com') ||
      headerHref.includes('rcpsj.com') || headerHref.includes('xqjeo.com') || headerHref.includes('ypetp.com') ||
      headerHref.includes('ogsib.com') || headerHref.includes('wpmsx.com') || headerHref.includes('naiawork.com') ||
      headerHref.includes('ficca2021.com') || headerHref.includes('ytyaz.com') || headerHref.includes('kjuzv.com') ||
      headerHref.includes('heqgr.com') || headerHref.includes('tjzuh.com') || headerHref.includes('uuwgc.com') ||
      headerHref.includes('bednari.com') || headerHref.includes('kdbov.com') || headerHref.includes('rkdro.com') ||
      headerHref.includes('qwpeg.com') || headerHref.includes('xnmik.com') || headerHref.includes('twnfz.com') ||
      headerHref.includes('qbzdl.com') || headerHref.includes('dkfrh.com') || headerHref.includes('dbnua.com') ||
      headerHref.includes('xcdus.com') || headerHref.includes('ytebb.com') || headerHref.includes('dorinebeaumont.com') ||
      headerHref.includes('vxrlm.com') || headerHref.includes('yknhc.com') || headerHref.includes('rthsu.com') ||
      headerHref.includes('ujhjj.com') || headerHref.includes('yynbx.com') || headerHref.includes('gndrz.com') ||
      headerHref.includes('grfpr.com') || headerHref.includes('flcoz.com') || headerHref.includes('yyczo.com') ||
      headerHref.includes('ntzgd.com') || headerHref.includes('bjpql.com') || headerHref.includes('cafxq.com') ||
      headerHref.includes('yjfca.com')
    ) {
      type = 'Admitad_Affiliate_Network';
    } else if (headerHref.includes('flirtcheck.site/go')) {
      type = 'FlirtCheck_TDS';
    } else {
      type = 'Direct_Merchant_Clean';
    }
  }

  results.push({
    slug,
    storeName,
    headerHref,
    hacksHref,
    isConsistent,
    hasDatingLeak,
    type
  });
}

console.log('--- Summary of Dist Store Pages ---');
const typeCounts = {};
results.forEach(r => {
  typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
});
console.log('Type breakdown:', typeCounts);

const datingLeaks = results.filter(r => r.hasDatingLeak);
console.log(`Dating Leaks (forbidden): ${datingLeaks.length}`);

const inconsistent = results.filter(r => !r.isConsistent);
console.log(`Inconsistent buttons (Header != Hacks): ${inconsistent.length}`);

const missingButtons = results.filter(r => !r.headerHref || !r.hacksHref);
console.log(`Missing buttons: ${missingButtons.length}`);

if (datingLeaks.length > 0) {
  console.log('\nCRITICAL DATING LEAKS:', datingLeaks);
}
if (inconsistent.length > 0) {
  console.log('\nINCONSISTENT BUTTONS:', inconsistent);
}
if (missingButtons.length > 0) {
  console.log('\nMISSING BUTTONS:', missingButtons);
}

const directClean = results.filter(r => r.type === 'Direct_Merchant_Clean');
console.log(`\nDirect Merchant Clean links count: ${directClean.length}`);
console.log(directClean.map(d => ({ slug: d.slug, name: d.storeName, href: d.headerHref })));

const flirtcheckLinks = results.filter(r => r.type === 'FlirtCheck_TDS');
console.log(`\nFlirtCheck TDS links count: ${flirtcheckLinks.length}`);
console.log(flirtcheckLinks.map(d => ({ slug: d.slug, name: d.storeName, href: d.headerHref })));


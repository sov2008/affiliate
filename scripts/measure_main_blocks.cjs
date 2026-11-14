const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const checks = [
  'curatedSpotlightSection',
  'partnerRotatorSection',
  'dealsGridContainer',
  'instantDealAlertBanner',
  'editorialGuaranteeSection',
  'homepageFaqSection'
];

checks.forEach((id, idx) => {
  const p1 = html.indexOf(`id="${id}"`);
  const nextId = checks[idx + 1];
  const p2 = nextId ? html.indexOf(`id="${nextId}"`) : html.indexOf('</main>');
  console.log(`${id}: size = ${p2 - p1} chars`);
});


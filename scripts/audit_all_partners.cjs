const fs = require('fs');

const couponsData = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

const storesMatch = couponsData.match(/export const STORES_DATA: StoreProfile\[\] = (\[[\s\S]*?\]);\s*export const COUPONS_DATA/);
if (!storesMatch) {
  console.error('Could not find STORES_DATA match');
  process.exit(1);
}

let storesData;
try {
  storesData = eval(storesMatch[1]);
  console.log('Total stores in STORES_DATA:', storesData.length);
} catch (e) {
  console.error('Failed to parse STORES_DATA:', e.message);
  process.exit(1);
}

// Ingest Admitad sync state
const admitadStatePath = 'artifacts_admitad/promoradar_sync_state.json';
let admitadCampaigns = [];
if (fs.existsSync(admitadStatePath)) {
  const state = JSON.parse(fs.readFileSync(admitadStatePath, 'utf8'));
  if (state.approvedCampaigns) {
    admitadCampaigns = Object.values(state.approvedCampaigns);
    console.log('Total Admitad approved campaigns:', admitadCampaigns.length);
  }
}

// Check CJ sync state
const cjStatePath = 'scripts/cj_promoradar_sync.json';
let cjPartners = [];
if (fs.existsSync(cjStatePath)) {
  const cjData = JSON.parse(fs.readFileSync(cjStatePath, 'utf8'));
  if (Array.isArray(cjData)) cjPartners = cjData;
  else if (cjData.partners) cjPartners = cjData.partners;
  console.log('Total CJ partners in JSON:', cjPartners.length);
}

const storesSlugs = new Set(storesData.map(s => s.slug));
const storesNames = new Set(storesData.map(s => s.name.toLowerCase()));

console.log('--- Checking sample sports & top partners ---');
const checkList = ['nike', 'adidas', 'puma', 'under-armour', 'new-balance', 'decathlon', 'reebok', 'expressvpn', 'hostinger', 'purevpn', 'nordvpn', 'aliexpress', 'touch', 'polis-ua', 'allpowers'];
checkList.forEach(s => {
  console.log(s, storesSlugs.has(s) ? 'STORE PAGE ACTIVE' : 'MISSING');
});

// Compare Admitad campaigns
let missingAdmitad = [];
admitadCampaigns.forEach(c => {
  const name = (c.name || '').toLowerCase();
  const slug = (c.slug || '').toLowerCase();
  if (!storesSlugs.has(slug) && !storesNames.has(name)) {
    missingAdmitad.push({ id: c.id, name: c.name, site_url: c.site_url });
  }
});
console.log('Admitad campaigns missing on site:', missingAdmitad.length);
if (missingAdmitad.length > 0) {
  console.log('Sample missing Admitad:', missingAdmitad.slice(0, 5));
}

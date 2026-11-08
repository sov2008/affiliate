const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.CJ_API_TOKEN || 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const CID = '8102806';

function fetchAdvertisers(page = 1) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'advertiser-lookup.api.cj.com',
      path: `/v3/advertiser-lookup?requestor-cid=${CID}&advertiser-ids=joined&page-number=${page}&records-per-page=100`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'PromoRadar/2.0'
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.end();
  });
}

function parseXmlAdvertisers(xml) {
  const items = [];
  const advRegex = /<advertiser>([\s\S]*?)<\/advertiser>/g;
  let match;
  while ((match = advRegex.exec(xml)) !== null) {
    const block = match[1];
    const getVal = (tag) => {
      const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim() : '';
    };
    items.push({
      id: getVal('advertiser-id'),
      name: getVal('advertiser-name'),
      accountStatus: getVal('account-status'),
      sevenDayEpc: getVal('seven-day-epc'),
      threeMonthEpc: getVal('three-month-epc'),
      language: getVal('language'),
      programUrl: getVal('program-url'),
      primaryCategory: getVal('primary-category'),
      actions: getVal('actions')
    });
  }
  return items;
}

async function run() {
  console.log('Querying CJ v3 Advertiser Lookup API...');
  const xmlP1 = await fetchAdvertisers(1);
  const totalMatch = xmlP1.match(/total-matched="(\d+)"/);
  console.log('Total Joined in CJ:', totalMatch ? totalMatch[1] : 'unknown');
  
  const p1Items = parseXmlAdvertisers(xmlP1);
  console.log(`Page 1 parsed: ${p1Items.length} advertisers`);
  
  const xmlP2 = await fetchAdvertisers(2);
  const p2Items = parseXmlAdvertisers(xmlP2);
  console.log(`Page 2 parsed: ${p2Items.length} advertisers`);
  
  const all = [...p1Items, ...p2Items];
  console.log(`Total active parsed: ${all.length}`);
  fs.writeFileSync(path.resolve(__dirname, '../artifacts_admitad/cj_joined_v3.json'), JSON.stringify(all, null, 2));
  console.log('Sample top 10:', all.slice(0, 10).map(a => `${a.name} (ID: ${a.id}, 3mEPC: ${a.threeMonthEpc})`));
}

run().catch(console.error);


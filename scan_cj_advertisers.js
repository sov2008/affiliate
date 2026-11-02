const https = require('https');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const PUBLISHER_CID = '8102806';

function fetchCJAdvertisers() {
  return new Promise((resolve, reject) => {
    const url = `https://advertiser-lookup.api.cj.com/v2/advertiser-lookup?requestor-cid=${PUBLISHER_CID}&advertiser-ids=joined&records-per-page=100`;
    const options = {
      headers: {
        'Authorization': `Bearer ${CJ_TOKEN}`,
        'User-Agent': 'Mozilla/5.0'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const xml = await fetchCJAdvertisers();
  console.log('XML Length:', xml.length);
  // Parse basic tags
  const matches = [...xml.matchAll(/<advertiser>([\s\S]*?)<\/advertiser>/g)];
  console.log('Total Joined Advertisers in CJ:', matches.length);
  
  const results = [];
  for (const m of matches) {
    const block = m[1];
    const id = block.match(/<advertiser-id>(.*?)<\/advertiser-id>/)?.[1] || '';
    const name = block.match(/<advertiser-name>(.*?)<\/advertiser-name>/)?.[1] || '';
    const epc7 = block.match(/<seven-day-epc>(.*?)<\/seven-day-epc>/)?.[1] || '0.00';
    const epc3m = block.match(/<three-month-epc>(.*?)<\/three-month-epc>/)?.[1] || '0.00';
    const rank = block.match(/<network-rank>(.*?)<\/network-rank>/)?.[1] || '';
    const parentCat = block.match(/<parent>(.*?)<\/parent>/)?.[1] || '';
    const childCat = block.match(/<child>(.*?)<\/child>/)?.[1] || '';
    const commission = block.match(/<default>(.*?)<\/default>/)?.[1] || '';
    const actions = [...block.matchAll(/<name>(.*?)<\/name>/g)].map(x => x[1]).join(', ');
    
    results.push({ id, name, epc7, epc3m, rank, category: `${parentCat} > ${childCat}`, commission, actions });
  }

  // Sort by 3-month EPC desc
  results.sort((a, b) => (parseFloat(b.epc3m) || 0) - (parseFloat(a.epc3m) || 0));
  
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);

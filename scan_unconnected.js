const https = require('https');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const PUBLISHER_CID = '8102806';

function fetchAdvertisers(keywords) {
  return new Promise((resolve) => {
    const url = `https://advertiser-lookup.api.cj.com/v2/advertiser-lookup?requestor-cid=${PUBLISHER_CID}&keywords=${encodeURIComponent(keywords)}&records-per-page=100`;
    https.get(url, { headers: { 'Authorization': `Bearer ${CJ_TOKEN}` } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function scanHighEpc() {
  const keywords = ['vpn', 'hosting', 'travel', 'dating', 'software', 'cloud', 'security', 'crypto', 'fashion', 'hardware'];
  const map = new Map();

  for (const kw of keywords) {
    const xml = await fetchAdvertisers(kw);
    const matches = [...xml.matchAll(/<advertiser>([\s\S]*?)<\/advertiser>/g)];
    for (const m of matches) {
      const b = m[1];
      const id = b.match(/<advertiser-id>(.*?)<\/advertiser-id>/)?.[1];
      const name = b.match(/<advertiser-name>(.*?)<\/advertiser-name>/)?.[1];
      const epc7 = parseFloat(b.match(/<seven-day-epc>(.*?)<\/seven-day-epc>/)?.[1]) || 0;
      const epc90 = parseFloat(b.match(/<three-month-epc>(.*?)<\/three-month-epc>/)?.[1]) || 0;
      const status = b.match(/<relationship-status>(.*?)<\/relationship-status>/)?.[1];
      const category = b.match(/<parent>(.*?)<\/parent>/)?.[1];

      if (id && !map.has(id)) {
        map.set(id, { id, name, epc7, epc90, status, category });
      }
    }
  }

  const all = Array.from(map.values());
  const notJoined = all.filter(a => a.status !== 'joined');
  notJoined.sort((a, b) => b.epc90 - a.epc90);

  console.log(`Scanned ${all.length} total unique advertisers. Unconnected candidates: ${notJoined.length}`);
  console.log('Top 15 High-EPC Unconnected Programs in CJ:');
  console.log(JSON.stringify(notJoined.slice(0, 15), null, 2));
}

scanHighEpc();

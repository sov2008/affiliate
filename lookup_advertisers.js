const https = require('https');
const fs = require('path');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

const advertiserIds = [
  '4837117', '5357356', '5725175', '6260179', '6892836',
  '7709572', '7753674', '7958531', '7961854', '7971085',
  '7997220', '8004940', '8022425', '8022845', '8023201',
  '8027729', '8041662', '8056181'
];

function fetchAdvertiserInfo(id) {
  return new Promise((resolve) => {
    https.get({
      hostname: 'advertiser-lookup.api.cj.com',
      path: `/v3/advertiser-lookup?advertiser-ids=${id}`,
      headers: {
        'Authorization': `Bearer ${CJ_TOKEN}`,
        'User-Agent': 'PromoRadar-Ingest/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const nameMatch = data.match(/<advertiser-name>(.*?)<\/advertiser-name>/);
        const urlMatch = data.match(/<program-url>(.*?)<\/program-url>/);
        resolve({
          id,
          name: nameMatch ? nameMatch[1] : null,
          url: urlMatch ? urlMatch[1] : null
        });
      });
    }).on('error', () => resolve({ id, name: null }));
  });
}

(async () => {
  for (const id of advertiserIds) {
    const info = await fetchAdvertiserInfo(id);
    console.log(JSON.stringify(info));
  }
})();


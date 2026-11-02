const https = require('https');
const fs = require('fs');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const COMPANY_ID = '8102806';

const partnersToSample = [
  { id: '4837117', slug: 'nordvpn-standard-term' },
  { id: '5357356', slug: 'rexing' },
  { id: '5725175', slug: 'braceability' },
  { id: '6260179', slug: 'abelssoft' },
  { id: '7753674', slug: 'sports-events-365' },
  { id: '7961854', slug: 'kincmo' },
  { id: '8004940', slug: 'fufugaga' },
  { id: '8022425', slug: 'kaiya-baby' },
  { id: '8027729', slug: 'homsee' }
];

function samplePartner(id) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      query: `
        query sample {
          products(companyId: "${COMPANY_ID}", partnerIds: ["${id}"], limit: 2) {
            resultList {
              id
              title
              price {
                amount
                currency
              }
              imageLink
              brand
            }
          }
        }
      `
    });

    const req = https.request({
      hostname: 'ads.api.cj.com',
      path: '/query',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CJ_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'PromoRadar-Sampler/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data?.products?.resultList || []);
        } catch {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.write(postData);
    req.end();
  });
}

(async () => {
  for (const p of partnersToSample) {
    const list = await samplePartner(p.id);
    console.log(`[${p.id}] ${p.slug}: ${list.length} sample items:`, list.map(i => `${i.title.slice(0, 40)} ($${i.price?.amount})`));
  }
})();


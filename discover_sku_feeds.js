const https = require('https');
const fs = require('fs');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const COMPANY_ID = '8102806';

const manifest = JSON.parse(fs.readFileSync('/var/www/affiliate/artifacts_admitad/cj_pipeline_manifest.json', 'utf8'));
const activeIds = Object.keys(manifest.activeProgramsDetails || {});

console.log(`Checking product feeds for ${activeIds.length} active programs...`);

function queryGraphQL(partnerId) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      query: `
        query testProducts {
          products(companyId: "${COMPANY_ID}", partnerIds: ["${partnerId}"], limit: 2) {
            totalCount
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
        'User-Agent': 'PromoRadar-Feed-Auditor/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const totalCount = parsed.data?.products?.totalCount || 0;
          resolve({ partnerId, totalCount, error: parsed.errors ? parsed.errors[0].message : null });
        } catch (e) {
          resolve({ partnerId, totalCount: 0, error: e.message });
        }
      });
    });
    req.on('error', (err) => resolve({ partnerId, totalCount: 0, error: err.message }));
    req.write(postData);
    req.end();
  });
}

(async () => {
  const resultsWithFeeds = [];
  for (const id of activeIds) {
    const info = manifest.activeProgramsDetails[id];
    const name = info?.name || info?.terms || 'Unknown';
    const res = await queryGraphQL(id);
    if (res.totalCount > 0) {
      console.log(`✅ [PRODUCT FEED FOUND] ID: ${id} | Name: ${name} | Total SKUs: ${res.totalCount}`);
      resultsWithFeeds.push({ id, name, totalCount: res.totalCount });
    }
  }
  console.log(`\nScan finished. Total programs with live SKU feeds: ${resultsWithFeeds.length}`);
  fs.writeFileSync('/tmp/cj_programs_with_sku.json', JSON.stringify(resultsWithFeeds, null, 2));
})();


const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const CID = '8102806';

async function queryCommissions() {
  const query = JSON.stringify({
    query: `
      {
        publisher(id: "${CID}") {
          commissions(forProperDateRange: { sincePostingDate: "2026-09-01T00:00:00Z", beforePostingDate: "2026-10-31T23:59:59Z" }) {
            totalCount
            resultList {
              commissionId
              postingDate
              pubCommissionAmountUsd
              actionStatus
              advertiserName
            }
          }
        }
      }
    `
  });

  const req = https.request({
    hostname: 'commissions.api.cj.com',
    path: '/query',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(query),
      'User-Agent': 'PromoRadar-Affiliate-Bot/1.0'
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('=== CJ COMMISSIONS API RESULT ===');
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', e => console.error(e));
  req.write(query);
  req.end();
}

queryCommissions();

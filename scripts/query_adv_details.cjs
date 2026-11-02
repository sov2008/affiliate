const https = require('https');
const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

const advIds = ["722009", "4347407", "6260179", "1952646", "7950303", "8023201", "7687303"];

async function queryAdvertiserDetails(id) {
  const query = JSON.stringify({
    query: `
      {
        advertiser(advertiserId: "${id}") {
          id
          name
          programUrl
          accountStatus
          primaryCategory {
            parent
            child
          }
          actions {
            name
            type
            commission {
              ... on RealCommission {
                amount
                currency
              }
              ... on PercentageCommission {
                percentage
              }
            }
          }
        }
      }
    `
  });

  return new Promise((resolve) => {
    const req = https.request('https://programs.api.cj.com/query', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(query)
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(null); }
      });
    });
    req.write(query);
    req.end();
  });
}

async function run() {
  for (const id of advIds) {
    const res = await queryAdvertiserDetails(id);
    const adv = res?.data?.advertiser;
    if (adv) {
      console.log(`\n🏢 ${adv.name} (ID: ${adv.id}) - Category: ${adv.primaryCategory?.parent} > ${adv.primaryCategory?.child}`);
      console.log(`   URL: ${adv.programUrl}`);
      if (adv.actions) {
        adv.actions.forEach(a => console.log(`   Action: ${a.name} [${a.type}]`));
      }
    }
  }
}

run();

const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function queryCommissions() {
  const query = JSON.stringify({
    query: `
      {
        publisher {
          contracts(publisherId: "8102806", limit: 50) {
            totalCount
            resultList {
              status
              advertiserId
              advertiserName
              programTerms {
                name
              }
            }
          }
        }
      }
    `
  });

  const req = https.request('https://programs.api.cj.com/query', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(query)
    }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(d);
        const list = json.data?.publisher?.contracts?.resultList || [];
        console.log(`Total contracts: ${json.data?.publisher?.contracts?.totalCount}`);
        const active = list.filter(c => c.status === 'ACTIVE');
        const pending = list.filter(c => c.status !== 'ACTIVE');
        console.log(`Active contracts: ${active.length}`);
        console.log(`Pending/Other contracts: ${pending.length}`);
        console.log('\n--- Top Active Programs in CJ ---');
        active.slice(0, 15).forEach(c => console.log(`  [${c.status}] ${c.advertiserName || c.advertiserId} - ${c.programTerms?.name}`));
      } catch (e) {
        console.log('Raw:', d);
      }
    });
  });

  req.write(query);
  req.end();
}

queryCommissions();

const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function queryAllContracts() {
  const query = JSON.stringify({
    query: `
      {
        publisher {
          contracts(publisherId: "8102806", limit: 100) {
            totalCount
            resultList {
              status
              advertiserId
              programTerms {
                name
                id
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
        console.log("=== CJ CONTRACTS DETAILED DUMP ===");
        list.forEach((c, idx) => {
          console.log(`${idx + 1}. [${c.status}] AdvID: ${c.advertiserId} | Term: ${c.programTerms?.name}`);
        });
      } catch (e) {
        console.error("Parse error:", e);
      }
    });
  });

  req.write(query);
  req.end();
}

queryAllContracts();

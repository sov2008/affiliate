const https = require('https');
const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function queryLinks(advIds) {
  const query = JSON.stringify({
    query: `
      {
        publisher {
          links(publisherId: "8102806", advertiserIds: ${JSON.stringify(advIds)}, limit: 10) {
            totalCount
            resultList {
              linkId
              linkName
              linkType
              clickUrl
              destination
              advertiserName
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
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(d);
        console.log('LINKS RESULT:', JSON.stringify(json, null, 2));
      } catch(e) {
        console.log('Raw response:', d);
      }
    });
  });

  req.write(query);
  req.end();
}

queryLinks(["722009", "4347407", "7687303", "8023201", "7958531"]);

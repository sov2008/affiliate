const https = require('https');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

// All 27 joined advertiser IDs from previous scan
const joinedIds = [
  "722009", "7971085", "7709572", "1952646", "6260179", "6884817", "7958531", 
  "7950303", "7961854", "7997220", "8004940", "8008834", "7753674", "8022425", 
  "8022845", "8023201", "8027729", "8041662", "8042071", "7934755", "8056181", 
  "7947783", "7687303", "7695687", "7072457", "4347407", "7812925"
];

const query = `
query getFeeds {
  productFeeds(companyId: "8102806") {
    resultList {
      advertiserId
      advertiserName
      productCount
      lastUpdated
    }
  }
}
`;

const postData = JSON.stringify({ query });

const options = {
  hostname: 'ads.api.cj.com',
  path: '/query',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CJ_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const allFeeds = json.data?.productFeeds?.resultList || [];
      const joinedFeeds = allFeeds.filter(f => joinedIds.includes(String(f.advertiserId)));
      console.log('Joined Advertisers with Active Product Feeds in CJ:');
      console.log(JSON.stringify(joinedFeeds, null, 2));
    } catch (e) {
      console.error(e, data);
    }
  });
});

req.on('error', console.error);
req.write(postData);
req.end();

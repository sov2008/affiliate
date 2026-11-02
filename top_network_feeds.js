const https = require('https');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

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
    const json = JSON.parse(data);
    const allFeeds = json.data?.productFeeds?.resultList || [];
    // Filter feeds with productCount > 100
    const active = allFeeds.filter(f => f.productCount > 500);
    active.sort((a, b) => b.productCount - a.productCount);
    console.log(`Total feeds in CJ network: ${allFeeds.length}, Active with >500 products: ${active.length}`);
    console.log(JSON.stringify(active.slice(0, 20), null, 2));
  });
});

req.on('error', console.error);
req.write(postData);
req.end();

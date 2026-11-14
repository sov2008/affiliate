const fs = require('fs');

async function checkRemoteLogo(slug) {
  const https = require('https');
  return new Promise((resolve) => {
    const req = https.get('https://promoradar.store/logos/' + slug + '.png', (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          size: buf.length,
          lastModified: res.headers['last-modified'],
          etag: res.headers['etag']
        });
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
  });
}

async function run() {
  const list = ['nike', 'turbosto', 'touch', 'polis-ua', 'kodland', 'allpowers'];
  for (const s of list) {
    const res = await checkRemoteLogo(s);
    console.log(s, res);
  }
}
run();


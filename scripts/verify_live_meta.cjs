const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

async function test() {
  const os = await fetch('https://promoradar.store/stores/onlinesim/');
  const tm = os.body.match(/<title>([^<]+)<\/title>/i);
  const dm = os.body.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  console.log('=== ONLINE SIM LIVE ===');
  console.log('Status:     ', os.status);
  console.log('Title:      ', tm ? tm[1] : 'NONE');
  console.log('Description:', dm ? dm[1] : 'NONE');

  const ab = await fetch('https://promoradar.store/stores/abelssoft/');
  const tmAb = ab.body.match(/<title>([^<]+)<\/title>/i);
  const dmAb = ab.body.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  console.log('\n=== ABELSSOFT LIVE ===');
  console.log('Status:     ', ab.status);
  console.log('Title:      ', tmAb ? tmAb[1] : 'NONE');
  console.log('Description:', dmAb ? dmAb[1] : 'NONE');
}

test().catch(console.error);


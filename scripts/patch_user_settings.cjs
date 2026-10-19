const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: 'core/.env' });

const token = process.env.REDDIT_SESSION_COOKIE;

function getModhash() {
  return new Promise((resolve, reject) => {
    https.get('https://www.reddit.com/api/me.json', {
      headers: {
        'Cookie': `reddit_session=${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          resolve(j.data?.modhash);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function patchSettings(modhash) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      about: '',
      display_name: 'sov2008'
    });

    const req = https.request('https://oauth.reddit.com/api/v1/user/sov2008/settings', {
      method: 'PATCH',
      headers: {
        'Cookie': `reddit_session=${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-Modhash': modhash
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: d }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  const modhash = await getModhash();
  const res = await patchSettings(modhash);
  console.log('PATCH Status:', res.statusCode, res.body);
}

run();

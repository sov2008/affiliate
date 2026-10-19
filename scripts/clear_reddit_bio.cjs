const https = require('https');
const querystring = require('querystring');
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

function updateSubreddit(modhash) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      api_type: 'json',
      sr: 't5_13uq6d',
      title: 'sov2008',
      public_description: '',
      description: '',
      type: 'user',
      link_type: 'any',
      uh: modhash
    });

    const req = https.request('https://www.reddit.com/api/site_admin', {
      method: 'POST',
      headers: {
        'Cookie': `reddit_session=${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'X-Modhash': modhash
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: d });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  try {
    console.log('Getting modhash...');
    const modhash = await getModhash();
    console.log('Modhash obtained:', modhash ? 'YES (' + modhash.substring(0, 5) + '...)' : 'NO');
    
    console.log('Sending update to /api/site_admin to clear bio...');
    const result = await updateSubreddit(modhash);
    console.log('Result Status:', result.statusCode);
    console.log('Result Body:', result.body);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();

const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: 'core/.env' });

const token = process.env.REDDIT_SESSION_COOKIE;
const username = process.env.REDDIT_USERNAME;

async function fetchOverview() {
  const url = `https://www.reddit.com/user/${username}/submitted.json?limit=100`;
  const req = https.get(url, {
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
        const children = j.data?.children || [];
        console.log(`Submitted posts count: ${children.length}`);
        children.forEach((c, idx) => {
          console.log(`Post [${idx+1}]: id=${c.data.name}, title="${c.data.title}", sub=${c.data.subreddit}, url=${c.data.url}`);
        });
      } catch (e) {
        console.error('Error parsing:', e.message);
      }
    });
  });
}

fetchOverview();

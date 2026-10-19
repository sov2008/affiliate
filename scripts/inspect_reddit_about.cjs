const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: 'core/.env' });

const token = process.env.REDDIT_SESSION_COOKIE;
const username = process.env.REDDIT_USERNAME;

async function checkAbout() {
  const req = https.get(`https://www.reddit.com/user/${username}/about.json`, {
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
        const sub = j.data?.subreddit || {};
        console.log('Subreddit ID:', sub.name);
        console.log('Title:', JSON.stringify(sub.title));
        console.log('Public Description:', JSON.stringify(sub.public_description));
      } catch (e) {
        console.error('Error:', e.message, d.substring(0, 300));
      }
    });
  });
}

checkAbout();

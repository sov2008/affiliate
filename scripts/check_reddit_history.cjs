const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: 'core/.env' });

const token = process.env.REDDIT_SESSION_COOKIE;
const username = process.env.REDDIT_USERNAME;

async function checkDetails() {
  console.log(`Auditing Reddit user: ${username}...`);

  // 1. Check overview / comments
  const req = https.get(`https://www.reddit.com/user/${username}/overview.json?limit=5`, {
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
        console.log(`Recent activity count: ${children.length}`);
        children.forEach((item, idx) => {
          const post = item.data;
          console.log(`[${idx + 1}] Sub: r/${post.subreddit} | Score: ${post.score} | Body: "${(post.body || post.title || '').substring(0, 70)}..."`);
        });
      } catch (e) {
        console.log('Error parsing overview:', e.message);
      }
    });
  });

  req.on('error', e => console.error(e));
}

checkDetails();

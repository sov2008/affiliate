const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: 'core/.env' });

const token = process.env.REDDIT_SESSION_COOKIE;
const username = process.env.REDDIT_USERNAME;

async function checkSubredditAndBio() {
  const req = https.get('https://www.reddit.com/api/v1/me', {
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
        const sub = j.subreddit || {};
        console.log('User Subreddit Name:', sub.name);
        console.log('Subreddit Display Name:', sub.display_name);
        console.log('Title:', sub.title);
        console.log('Public Description:', sub.public_description);
        console.log('Description:', sub.description);
      } catch (e) {
        console.error('Error:', e.message, d.substring(0, 300));
      }
    });
  });
}

checkSubredditAndBio();

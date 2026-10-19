const https = require('https');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: 'core/.env' });

const token = process.env.REDDIT_SESSION_COOKIE;
const username = process.env.REDDIT_USERNAME;

console.log('Testing Reddit Account:', username);

function checkMe() {
  const req = https.get('https://www.reddit.com/api/me.json', {
    headers: {
      'Cookie': `reddit_session=${token}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    }
  }, res => {
    console.log('API /api/me.json Status:', res.statusCode);
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try {
        const j = JSON.parse(d);
        if (j.data) {
          console.log('Account Name:', j.data.name);
          console.log('Is Suspended:', j.data.is_suspended);
          console.log('Total Karma:', j.data.total_karma);
          console.log('Comment Karma:', j.data.comment_karma);
          console.log('Link Karma:', j.data.link_karma);
        } else {
          console.log('Response without data:', d.substring(0, 400));
        }
      } catch (e) {
        console.log('Non-JSON Response:', d.substring(0, 400));
      }
    });
  });

  req.on('error', e => console.error('Error:', e.message));
}

checkMe();

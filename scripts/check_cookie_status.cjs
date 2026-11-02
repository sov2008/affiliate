const fs = require('fs');
const path = require('path');

const cookiesPath = '/var/www/affiliate/pinterest_cookies.json';
if (fs.existsSync(cookiesPath)) {
  const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
  console.log('Total cookies:', cookies.length);
  const authCookie = cookies.find(c => c.name === '_auth');
  const sessCookie = cookies.find(c => c.name === '_pinterest_sess');
  console.log('Has _auth:', !!authCookie, 'Expires:', authCookie ? authCookie.expires : null);
  console.log('Has _pinterest_sess:', !!sessCookie);
} else {
  console.log('No cookies file found at:', cookiesPath);
}


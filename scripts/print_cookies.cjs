const fs = require('fs');
const c = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
for (const item of c) {
  const d = new Date(item.expires * 1000);
  console.log(item.name, item.domain, item.expires, d.toISOString());
}


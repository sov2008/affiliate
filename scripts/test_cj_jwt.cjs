const https = require('https');
const fs = require('fs');

const state = JSON.parse(fs.readFileSync('artifacts_admitad/cj_auth_state.json', 'utf8'));
const authCookie = state.cookies.find(c => c.name === 'authentication_token');
const jwtToken = authCookie.value;

const req = https.request({
  hostname: 'commissions.api.cj.com',
  path: '/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + jwtToken,
    'Content-Type': 'application/json'
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Commission Query Response:', res.statusCode, body));
});

const query = `{
  publisherCommissions(forPublishers: ["8102806"], sincePostingDate: "2026-10-01T00:00:00Z") {
    count
    records {
      commissionId
      actionTrackerName
      eventDate
    }
  }
}`;

req.write(JSON.stringify({ query }));
req.end();

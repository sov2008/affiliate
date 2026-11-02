const fs = require('fs');

const STATE_FILE = '/var/www/affiliate/artifacts_admitad/auth_state.json';
let state = { cookies: [], origins: [] };
try {
  state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
} catch {}

const newSessionId = 'ube6jvb7mh8jjotsea5pd7m9o3r3numd';

// Update or insert sessionid cookie for store.admitad.com
let found = false;
for (const c of state.cookies) {
  if (c.name === 'sessionid') {
    c.value = newSessionId;
    c.expires = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
    found = true;
  }
}

if (!found) {
  state.cookies.push({
    name: 'sessionid',
    value: newSessionId,
    domain: '.store.admitad.com',
    path: '/',
    expires: Math.floor(Date.now() / 1000) + 86400 * 30,
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  });
}

// Also add for .admitad.com
state.cookies.push({
  name: 'sessionid',
  value: newSessionId,
  domain: '.admitad.com',
  path: '/',
  expires: Math.floor(Date.now() / 1000) + 86400 * 30,
  httpOnly: true,
  secure: true,
  sameSite: 'Lax'
});

fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
console.log('SUCCESS: sessionid updated in auth_state.json');

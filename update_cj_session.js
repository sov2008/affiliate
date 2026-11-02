const fs = require('fs');
const path = require('path');

// Support both server path and local repository path
const DEFAULT_LOCAL_PATH = path.join(__dirname, 'artifacts_admitad', 'cj_auth_state.json');
const SERVER_PATH = '/var/www/affiliate/artifacts_admitad/cj_auth_state.json';
const STATE_FILE = fs.existsSync(SERVER_PATH) ? SERVER_PATH : DEFAULT_LOCAL_PATH;

let state = { cookies: [], origins: [] };
try {
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read existing state, creating new one:', e.message);
}

const newSessionToken = '2fd42732-a70f-44bd-960a-a934cdff2e6e';

// Update SESSION and JSESSIONID and authentication_token
const targetCookieNames = ['SESSION', 'JSESSIONID', 'authentication_token'];

for (const name of targetCookieNames) {
  let found = false;
  for (const c of state.cookies) {
    if (c.name === name) {
      c.value = newSessionToken;
      c.expires = Math.floor(Date.now() / 1000) + 86400 * 30;
      found = true;
    }
  }
  if (!found) {
    state.cookies.push({
      name,
      value: newSessionToken,
      domain: '.cj.com',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 86400 * 30,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    });
    state.cookies.push({
      name,
      value: newSessionToken,
      domain: 'members.cj.com',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 86400 * 30,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    });
  }
}

fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
console.log('SUCCESS: CJ session token updated in cj_auth_state.json');

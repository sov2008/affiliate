const fs = require('fs');
const state = JSON.parse(fs.readFileSync('/var/www/affiliate/artifacts_admitad/cj_auth_state.json', 'utf8'));
console.log('Total cookies in cj_auth_state:', (state.cookies || []).length);
for (const c of (state.cookies || [])) {
  const exp = c.expires > 0 ? new Date(c.expires * 1000).toISOString() : 'Session';
  console.log(`${c.name.padEnd(25)} | ${c.domain.padEnd(25)} | ${exp}`);
}

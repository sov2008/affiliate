const { execSync } = require('child_process');

function runSSH(cmd) {
  return execSync(`ssh -o StrictHostKeyChecking=no root@178.128.199.28 "${cmd}"`, { encoding: 'utf8' });
}

console.log('--- Check promo-media on current release ---');
console.log(runSSH('ls -la /var/www/promoradar.store/current/promo-media/under-armour/ || true'));

console.log('--- Check curl status of under armour banner ---');
console.log(runSSH('curl -I http://127.0.0.1/promo-media/under-armour/under-armour_hero_728x90.jpg || true'));

console.log('--- Check Nginx location for promo-media ---');
console.log(runSSH('grep -rn "promo-media" /etc/nginx/ || true'));


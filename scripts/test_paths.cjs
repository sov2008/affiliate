const path = require('path');
const fs = require('fs');

console.log('CWD:', process.cwd());
const p1 = path.resolve(process.cwd(), 'artifacts_admitad/active_links.json');
const p2 = path.resolve(process.cwd(), '../artifacts_admitad/active_links.json');
const p3 = '/var/www/affiliate/artifacts_admitad/active_links.json';

console.log('p1 exists:', fs.existsSync(p1), p1);
console.log('p2 exists:', fs.existsSync(p2), p2);
console.log('p3 exists:', fs.existsSync(p3), p3);

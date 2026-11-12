const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split(/\r?\n/).filter(l => !l.startsWith('GA_PROMORADAR_PROPERTY_ID'));
lines.push('GA_PROMORADAR_PROPERTY_ID="559398262"');
fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');
console.log('SUCCESS: GA_PROMORADAR_PROPERTY_ID set to 559398262');


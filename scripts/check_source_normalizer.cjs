const fs = require('fs');

// We simulate what dealNormalizer now actually does
const code = fs.readFileSync('deals-portal/src/utils/dealNormalizer.ts', 'utf8');
console.log('Includes brandFrequency in dealNormalizer.ts:', code.includes('brandFrequency'));


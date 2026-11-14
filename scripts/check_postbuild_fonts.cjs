const fs = require('fs');
const postbuildPath = 'scripts/postbuild_inject_css.cjs';
const content = fs.readFileSync(postbuildPath, 'utf8');

// Check if postbuild script injects fonts
console.log('Postbuild contains fonts:', content.includes('fonts.googleapis.com'));


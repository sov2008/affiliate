const fs = require('fs');
const content = fs.readFileSync('scripts/postbuild_inject_css.cjs', 'utf8');
console.log('--- postbuild_inject_css.cjs ---');
console.log(content);


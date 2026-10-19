const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts');
let content = fs.readFileSync(targetFile, 'utf8');

content = content.replace("  }\r\n  {\r\n    slug: 'polis'", "  },\r\n  {\r\n    slug: 'polis'");
content = content.replace("  }\n  {\n    slug: 'polis'", "  },\n  {\n    slug: 'polis'");

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully fixed syntax comma before polis');

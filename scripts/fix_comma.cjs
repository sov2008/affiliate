const fs = require('fs');
let content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

const target1 = `    "primaryAffiliateUrl": "https://www.awin1.com/awclick.php?mid=128867&id=3148787"
  }
  {
    slug: 'polis'`;

const replacement1 = `    "primaryAffiliateUrl": "https://www.awin1.com/awclick.php?mid=128867&id=3148787"
  },
  {
    slug: 'polis'`;

const target2 = `    "primaryAffiliateUrl": "https://www.awin1.com/awclick.php?mid=128867&id=3148787"\r\n  }\r\n  {\r\n    slug: 'polis'`;
const replacement2 = `    "primaryAffiliateUrl": "https://www.awin1.com/awclick.php?mid=128867&id=3148787"\r\n  },\r\n  {\r\n    slug: 'polis'`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log('Fixed LF comma');
} else if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log('Fixed CRLF comma');
} else {
  console.log('Target not found directly, checking index...');
  const idx = content.indexOf('slug: \'polis\'');
  console.log('Snippet before polis:', content.substring(idx - 150, idx));
  const before = content.substring(0, idx);
  const lastBrace = before.lastIndexOf('}');
  content = before.substring(0, lastBrace + 1) + ',\n  ' + content.substring(idx);
}

fs.writeFileSync('deals-portal/src/data/couponsData.ts', content, 'utf8');
console.log('Fixed couponsData.ts syntax');

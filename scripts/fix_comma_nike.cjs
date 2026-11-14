const fs = require('fs');
let content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

const target1 = `    ]
  }
  {
    slug: 'nike'`;

const replacement1 = `    ]
  },
  {
    slug: 'nike'`;

const target2 = `    ]\r\n  }\r\n  {\r\n    slug: 'nike'`;
const replacement2 = `    ]\r\n  },\r\n  {\r\n    slug: 'nike'`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log('Fixed LF comma before nike');
} else if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log('Fixed CRLF comma before nike');
} else {
  console.log('Direct pattern not matched, using index replacement');
  const idx = content.indexOf('slug: \'nike\'');
  const before = content.substring(0, idx);
  const lastBrace = before.lastIndexOf('}');
  content = before.substring(0, lastBrace + 1) + ',\n  ' + content.substring(idx);
}

fs.writeFileSync('deals-portal/src/data/couponsData.ts', content, 'utf8');
console.log('Updated couponsData.ts successfully');


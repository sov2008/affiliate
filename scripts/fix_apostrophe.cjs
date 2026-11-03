const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../deals-portal/src/data/dealTranslations.ts');
let content = fs.readFileSync(file, 'utf8');

// Replace computer's apostrophe unescaped комп'ютерних
const target = "комп'ютерних";
const replacement = "комп\\'ютерних";

if (content.includes(target) && !content.includes(replacement)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Escaped Ukrainian apostrophe successfully!');
} else {
  console.log('Already escaped or target not found');
}


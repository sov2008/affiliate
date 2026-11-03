const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../deals-portal/src/data/dealTranslations.ts');
let content = fs.readFileSync(file, 'utf8');

const target = "    }\r\n  }\r\n\r\n  // --- MULTI-LOCALE GLOBAL HEADLINERS";
const replacement = "    }\r\n  },\r\n\r\n  // --- MULTI-LOCALE GLOBAL HEADLINERS";

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed missing comma successfully!');
} else {
  // Try with LF
  const targetLF = "    }\n  }\n\n  // --- MULTI-LOCALE GLOBAL HEADLINERS";
  const replacementLF = "    }\n  },\n\n  // --- MULTI-LOCALE GLOBAL HEADLINERS";
  if (content.includes(targetLF)) {
    content = content.replace(targetLF, replacementLF);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed missing comma (LF) successfully!');
  } else {
    console.error('Target not found in dealTranslations.ts');
  }
}


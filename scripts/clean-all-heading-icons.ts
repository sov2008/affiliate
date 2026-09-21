import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve(process.cwd(), 'blog/src/content/posts');

console.log('🧹 Purging all icons, emoji keycaps and decorative symbols from article headings...\n');

if (!fs.existsSync(POSTS_DIR)) {
  console.error(`❌ Posts directory not found: ${POSTS_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
let modifiedFilesCount = 0;
let totalHeadingsCleaned = 0;

function cleanHeadingLine(line: string): string {
  // If line is title in frontmatter
  if (/^title:\s*/i.test(line)) {
    return line
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{203C}\u{2049}\u{20E3}]/gu, '')
      .replace(/[0-9]\uFE0F?\u20E3/gu, '')
      .replace(/\s*([🚨⚡❓🔍💡🛑📸💔🔥⚠️✓✔❌])\s*/gu, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+"$/, '"')
      .replace(/\s+'$/, "'")
      .trim();
  }

  // If line is markdown header
  if (/^#{1,6}\s/.test(line)) {
    let cleaned = line;
    // Remove "H3 " or "H2 " prefixes inside markdown hashes
    cleaned = cleaned.replace(/^(#{1,6}\s*)H[1-6]\s+/gi, '$1');
    // Remove keycap numbers like 1⃣, 2⃣, 1️⃣, etc.
    cleaned = cleaned.replace(/[0-9]\uFE0F?\u20E3\s*/gu, '');
    // Remove all unicode emoji icons and dingbats
    cleaned = cleaned.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{203C}\u{2049}\u{20E3}]/gu, '');
    // Clean specific icon glyphs
    cleaned = cleaned.replace(/[🚨⚡❓🔍💡🛑📸💔🔥⚠️✓✔❌]/gu, '');
    // Normalize spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    // Fix trailing punctuation spacing
    cleaned = cleaned.replace(/\s+([,.:?!])/g, '$1');
    // If heading was "## – Description", clean lone dash
    cleaned = cleaned.replace(/^(#{1,6}\s*)[–—\-]\s*/, '$1');
    return cleaned;
  }

  return line;
}

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  let fileChanged = false;

  const newLines = lines.map(line => {
    if (line.startsWith('title:') || /^#{1,6}\s/.test(line)) {
      const cleaned = cleanHeadingLine(line);
      if (cleaned !== line) {
        fileChanged = true;
        totalHeadingsCleaned++;
        console.log(`  [${file}]`);
        console.log(`    Before: ${line}`);
        console.log(`    After:  ${cleaned}`);
        return cleaned;
      }
    }
    return line;
  });

  if (fileChanged) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    modifiedFilesCount++;
  }
}

console.log(`\n🎉 Done! Cleaned ${totalHeadingsCleaned} headings across ${modifiedFilesCount} files.`);

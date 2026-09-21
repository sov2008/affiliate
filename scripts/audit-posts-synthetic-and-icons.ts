import fs from 'fs';
import path from 'path';

const postsDir = path.resolve(process.cwd(), 'blog/src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const SYNTHETIC_PATTERNS = [
  { pattern: /FlirtCheck('s)? Verified Portal/gi, label: 'Hallucinated "Verified Portal"' },
  { pattern: /VoiceGuard AI/gi, label: 'Hallucinated "VoiceGuard AI"' },
  { pattern: /VisionScout/gi, label: 'Hallucinated "VisionScout"' },
  { pattern: /Sensity AI/gi, label: 'Hallucinated commercial API recommendation' },
  { pattern: /99% detection accuracy/gi, label: 'Synthetic 99% accuracy metric' },
  { pattern: /98\.4%/gi, label: 'Synthetic 98.4% metric' },
  { pattern: /AI-Shield \(2026\)/gi, label: 'Hallucinated Hinge AI-Shield feature' },
  { pattern: /30-секундный радар/gi, label: 'Synthetic radar reference' }
];

const EMOJI_PATTERN = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]/u;

console.log(`Auditing ${files.length} posts for synthetic hallucination markers & noisy emojis...\n`);

let syntheticCount = 0;
let emojiCount = 0;

for (const file of files) {
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  const detectedSynthetic: string[] = [];
  for (const { pattern, label } of SYNTHETIC_PATTERNS) {
    if (pattern.test(content)) {
      detectedSynthetic.push(label);
    }
  }

  const hasEmojis = EMOJI_PATTERN.test(content);

  if (detectedSynthetic.length > 0) {
    syntheticCount++;
    console.log(`❌ SYNTHETIC DETECTED in ${file}:`);
    detectedSynthetic.forEach(d => console.log(`   - ${d}`));
  }

  if (hasEmojis) {
    emojiCount++;
  }
}

console.log(`\nSummary:`);
console.log(`Total Posts: ${files.length}`);
console.log(`Posts with Synthetic Hallucinations: ${syntheticCount}`);
console.log(`Posts with Noisy Emojis: ${emojiCount}`);

import fs from 'fs';
import path from 'path';

const postsDir = path.resolve(process.cwd(), 'blog/src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

let modifiedPostsCount = 0;

for (const file of files) {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // 1. Remove/Replace Hallucinated "FlirtCheck Verified Portal" sections
  content = content.replace(
    /##\s*[\p{Emoji}\u2000-\u3300]*\s*Moving to Verified Platforms[\s\S]*?(?=##|\n---\s*\n##|$)/gu,
    `## Independent Verification & Risk Protocol\n\nThe defensive tactics above apply across any mainstream dating platform. Before sharing personal contact details, residential location, or financial context, run the profile markers through our client-side [Dating Risk Calculator](/calculator/) to evaluate threat vectors without exposing private data. Pair manual OSINT cross-referencing with an unscheduled 30-second video check to confirm liveness and acoustic authenticity.\n\n`
  );

  // Replace remaining mentions of FlirtCheck Verified Portal
  content = content.replace(
    /\[FlirtCheck Verified Portal\]\([^)]+\)/gi,
    '[Dating Risk Calculator](/calculator/)'
  );
  content = content.replace(
    /FlirtCheck(?:'s)? Verified Portal/gi,
    'FlirtCheck Forensic Archive'
  );
  content = content.replace(
    /video call on FlirtCheck/gi,
    'direct video call'
  );

  // 2. Replace Hallucinated VoiceGuard AI & VisionScout & Sensity AI
  content = content.replace(
    /the new 2026 VoiceGuard AI \(available as a free web tool\)/gi,
    'an open-source spectrogram analyzer (such as Audacity) or live unscripted questions'
  );
  content = content.replace(
    /VoiceGuard AI/gi,
    'audio frequency spectrogram analysis'
  );
  content = content.replace(
    /Pair Google Lens, TinEye, and the new AI-enhanced VisionScout for 99% detection accuracy\./gi,
    'Pair Google Lens and TinEye with manual EXIF and lighting inspection to verify provenance.'
  );
  content = content.replace(
    /VisionScout/gi,
    'cross-engine reverse image indexing'
  );
  content = content.replace(
    /Activate Hinge’s AI-Shield \(2026\)[^.\n]*\./gi,
    'Review in-app privacy controls and require identity confirmation before exchanging outside contact.'
  );
  content = content.replace(
    /Tools such as \*Sensity AI\* will flag synthetic content with a confidence score; > 70 % warrants a disconnect\./gi,
    'Cross-check lighting angles, ear symmetry, and pupil specular reflections; noticeable physics mismatches warrant an immediate disconnect.'
  );

  // 3. Replace Noisy Emojis in Headings
  content = content.replace(/^##\s*[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]\s*/gmu, '## ');
  content = content.replace(/^###\s*[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]\s*/gmu, '### ');

  // Specific noisy emoji number icons in tables or headers
  content = content.replace(/\|\s*\*\*1️⃣\*\*\s*\|/g, '| **[01]** |');
  content = content.replace(/\|\s*\*\*2️⃣\*\*\s*\|/g, '| **[02]** |');
  content = content.replace(/\|\s*\*\*3️⃣\*\*\s*\|/g, '| **[03]** |');
  content = content.replace(/\|\s*\*\*4️⃣\*\*\s*\|/g, '| **[04]** |');
  content = content.replace(/\|\s*\*\*5️⃣\*\*\s*\|/g, '| **[05]** |');

  // Replace common in-text emoji decorations with organic typography
  content = content.replace(/👉\s*/g, '→ ');
  content = content.replace(/✅\s*/g, '[✓] ');
  content = content.replace(/❌\s*/g, '[×] ');
  content = content.replace(/⚠️\s*/g, '[!] ');
  content = content.replace(/🔥\s*/g, '');
  content = content.replace(/🚀\s*/g, '');
  content = content.replace(/💡\s*/g, 'Note: ');
  content = content.replace(/🛡️?\s*/g, '');
  content = content.replace(/🔒\s*/g, '');
  content = content.replace(/📸\s*/g, '');
  content = content.replace(/📱\s*/g, '');
  content = content.replace(/🕵️?\s*/g, '');
  content = content.replace(/💔\s*/g, '');
  content = content.replace(/⚙️?\s*/g, '');
  content = content.replace(/❓\s*/g, '');
  content = content.replace(/🎯\s*/g, '');
  content = content.replace(/⚡\s*/g, '');
  content = content.replace(/🚨\s*/g, '[!] ');
  content = content.replace(/🛑\s*/g, '[HALT] ');
  content = content.replace(/🔍\s*/g, '');
  content = content.replace(/🧩\s*/g, '');
  content = content.replace(/🎭\s*/g, '');
  content = content.replace(/🤖\s*/g, '');
  content = content.replace(/📡\s*/g, '');
  content = content.replace(/🔬\s*/g, '');
  content = content.replace(/💬\s*/g, '');
  content = content.replace(/👋\s*/g, '');
  content = content.replace(/✨\s*/g, '');
  content = content.replace(/⏳\s*/g, '');
  content = content.replace(/☕\s*/g, '');
  content = content.replace(/🎉\s*/g, '');
  content = content.replace(/🚩\s*/g, '');
  content = content.replace(/📊\s*/g, '');
  content = content.replace(/📈\s*/g, '');
  content = content.replace(/📉\s*/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedPostsCount++;
  }
}

console.log(`✅ Sanitize complete: ${modifiedPostsCount} of ${files.length} posts cleaned from AI hallucinations & noisy icons.`);

/**
 * Test Pinterest Render Script
 * Validates the 3 modes: editorial, chat, checklist
 */
const path = require('path');
const fs = require('fs');
const { parseArticleContent, renderPinImage } = require('./pinterest-pin-generator.cjs');

async function runTest() {
  console.log('🚀 Starting Pinterest Test Render (3 modes: editorial, chat, checklist)...');

  const testOutputDir = path.resolve(__dirname, '../test-output');
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
  }

  const postsDir = path.resolve(__dirname, '../blog/src/content/posts');

  const testCases = [
    {
      file: 'dating-app-burnout-14-day-reset-protocol-emotional-exhaustion.md',
      mode: 'editorial',
      outName: 'pin_1_editorial.png'
    },
    {
      file: 'boundary-setting-via-text-declining-late-night-invites.md',
      mode: 'chat',
      outName: 'pin_2_chat.png'
    },
    {
      file: 'how-to-spot-catfish-osint-ai.md',
      mode: 'checklist',
      outName: 'pin_3_checklist.png'
    }
  ];

  for (const tc of testCases) {
    const fullPath = path.join(postsDir, tc.file);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Article not found: ${fullPath}`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`📄 Testing: ${tc.file}`);
    console.log(`🎨 Mode: ${tc.mode}`);

    const parsed = parseArticleContent(fullPath);
    console.log(`📌 Hook Title: "${parsed.hookTitle}" (len: ${parsed.hookTitle.length})`);
    console.log(`🏷️ Category: ${parsed.rubric} // ${parsed.badgeText}`);
    console.log(`🎯 Board: ${parsed.board}`);
    console.log(`📝 Takeaways Count: ${parsed.takeaways.length}`);
    console.log(`💬 Chat: In="${parsed.chatScenario.incoming.slice(0, 30)}..." | Out="${parsed.chatScenario.outgoing.slice(0, 30)}..."`);
    console.log(`🖼️ Image Base64: ${parsed.coverImageBase64 ? 'YES (' + parsed.coverImageBase64.length + ' chars)' : 'NO'}`);

    const outputPath = path.join(testOutputDir, tc.outName);
    const startT = Date.now();
    await renderPinImage(parsed, outputPath, tc.mode);
    const duration = ((Date.now() - startT) / 1000).toFixed(2);

    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`✅ Success! Rendered ${tc.outName} in ${duration}s (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`❌ Output file was not created: ${outputPath}`);
    }
  }

  console.log('\n🎉 Test render completed! All files saved in test-output/');
}

runTest().catch(err => {
  console.error('💥 Fatal test error:', err);
  process.exit(1);
});

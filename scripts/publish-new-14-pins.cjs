const path = require('path');
const { PinterestQueueManager } = require('./pinterest-queue-manager.cjs');

// Read queue manager instance
const fs = require('fs');
const queueFile = path.resolve(__dirname, '../.antigravity/pinterest_queue.json');

const targetSlugs = [
  'ai-reply-generator-dating-apps',
  'analyze-tinder-chat-screenshot',
  'bumble-first-message-examples',
  'check-partner-loyalty-in-chats',
  'dating-app-red-flags-screenshots',
  'flirt-test-quiz-online',
  'hinge-icebreakers-that-actually-work',
  'is-he-flirting-with-me-over-text',
  'is-she-flirting-or-just-polite',
  'micro-flirting-vs-friendly-in-dms',
  'move-from-match-to-real-date',
  'rizz-checker-ai-free',
  'screenshot-flirt-analyzer',
  'subtle-signs-of-infidelity-in-text-messages'
];

async function run() {
  const qData = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  console.log(`Starting automated publish for ${targetSlugs.length} new article pins...`);

  // We can execute via command line calls to pinterest-queue-manager.cjs --slug <slug>
  const { execSync } = require('child_process');

  for (let i = 0; i < targetSlugs.length; i++) {
    const slug = targetSlugs[i];
    console.log(`\n=================================================================`);
    console.log(`[${i + 1}/${targetSlugs.length}] Publishing pin for: ${slug}`);
    console.log(`=================================================================`);

    try {
      execSync(`node scripts/pinterest-queue-manager.cjs --slug ${slug}`, {
        stdio: 'inherit',
        timeout: 120000
      });
      console.log(`✅ Success for ${slug}`);
    } catch (err) {
      console.error(`❌ Failed for ${slug}: ${err.message}`);
    }

    if (i < targetSlugs.length - 1) {
      console.log('Sleeping 8s between pins for safety...');
      await new Promise(r => setTimeout(r, 8000));
    }
  }

  console.log('\n🎉 Finished publishing all new pins to Pinterest!');
}

run().catch(console.error);

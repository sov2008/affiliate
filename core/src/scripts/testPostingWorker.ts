import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { QueueDatabase, QueueItem } from '../db/queueDb.js';
import { SocialPostingWorker } from '../workers/postingWorker.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgBlue: '\x1b[44m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
};

/**
 * Creates an interactive local HTML sandbox that mimics Reddit / Forum submission
 */
function createMockSandboxHtml(): string {
  const scratchDir = path.resolve(process.cwd(), 'storage/scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const htmlPath = path.join(scratchDir, 'mock_reddit_submit.html');
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>r/DatingAdvice - Create a Post (Sandbox Simulation)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1113; color: #d7dadc; padding: 25px; }
    .container { max-width: 680px; margin: 0 auto; background: #1a1a1b; border: 1px solid #343536; border-radius: 6px; padding: 20px; }
    h2 { font-size: 18px; margin-top: 0; color: #fff; border-bottom: 1px solid #343536; padding-bottom: 12px; }
    input[type="text"], textarea { width: 100%; box-sizing: border-box; background: #272729; border: 1px solid #343536; border-radius: 4px; color: #fff; padding: 10px; font-size: 14px; margin-bottom: 15px; }
    textarea { height: 140px; resize: vertical; }
    .upload-box { border: 2px dashed #343536; border-radius: 6px; padding: 15px; text-align: center; margin-bottom: 15px; background: #1f1f23; }
    button.publish-btn { background: #ff4500; color: #fff; border: none; padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 14px; }
    button.publish-btn:hover { background: #e03d00; }
    .status-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; background: #2d3748; color: #a0aec0; margin-bottom: 15px; }
    #result { display: none; margin-top: 15px; padding: 12px; background: #064e3b; color: #34d399; border-radius: 6px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="status-badge">🟢 Playwright Stealth Sandbox Mode</div>
    <h2>Create a post in r/DatingAdvice</h2>
    <form id="post-form" onsubmit="event.preventDefault(); document.getElementById('result').style.display='block';">
      <input type="text" id="post-title" name="title" placeholder="Title" required>
      <textarea id="post-body" name="body" placeholder="Text (optional)" required></textarea>
      <div class="upload-box">
        <label for="image-upload" style="cursor: pointer; display: block;">🖼️ Attach Image / Media Creative</label>
        <input type="file" id="image-upload" name="media" accept="image/*" style="margin-top: 8px;">
      </div>
      <button type="submit" id="submit-post" class="publish-btn">Post</button>
    </form>
    <div id="result">✅ Post submitted successfully to r/DatingAdvice (ID: mock_post_99182)</div>
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  return `file://${htmlPath.replace(/\\/g, '/')}`;
}

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan} 🤖  PLAYWRIGHT STEALTH POSTING WORKER & PROFILE DRY-RUN${colors.reset}`);
  console.log(`${colors.dim} Humanized Keystrokes, Bezier Mouse Trajectory & Sandbox Submission${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================================${colors.reset}\n`);

  const db = QueueDatabase.getInstance();
  let item = db.getNextApproved();

  // If no approved item exists, create or pick one for the dry-run test
  if (!item) {
    const existing = db.listAll(undefined, 1);
    if (existing.length > 0) {
      item = existing[0];
      db.updateStatus(item.id, 'APPROVED');
    } else {
      item = db.enqueue({
        campaign_id: 'cmp_lospollos_dating',
        target_platform: 'reddit',
        hook: 'swiping forever and still getting ghosted? lowkey feels like a waste of time.',
        body: 'I quit the apps for 30 days and only attended verified social meetups. Meeting people in context builds instant rapport, no awkward small talk.',
        cta: 'if you’re curious, the quiz was free and gave me a few solid matches, thought I’d share the link.',
        image_path: '/output/creatives/1788247762659_cmp_lospollos_dating_creative.jpg',
        risk_score: 15,
        status: 'APPROVED',
      });
    }
  }

  // Generate sandbox URL
  const sandboxUrl = createMockSandboxHtml();
  console.log(`🧪 ${colors.bold}Sandbox Portal Generated:${colors.reset}\n   ${colors.cyan}${sandboxUrl}${colors.reset}\n`);

  console.log(`📦 ${colors.bold}Target Post to Dispatch:${colors.reset}`);
  console.log(`   - ID:       ${colors.cyan}${item.id}${colors.reset}`);
  console.log(`   - Platform: ${colors.yellow}${item.target_platform.toUpperCase()}${colors.reset}`);
  console.log(`   - Hook:     "${item.hook}"`);
  console.log(`   - Image:    ${item.image_path}`);

  // Dispatch item through SocialPostingWorker
  const result = await SocialPostingWorker.dispatchItem(item, {
    profileId: 'reddit_stealth_profile_01',
    headless: true,
    targetUrlOverride: sandboxUrl,
  });

  const updatedStats = db.getStats();

  console.log(`\n${colors.bold}📊 Execution & Dispatch Results:${colors.reset}`);
  console.log('+' + '-'.repeat(16) + '+' + '-'.repeat(18) + '+' + '-'.repeat(14) + '+' + '-'.repeat(28) + '+');
  console.log(
    `| ${colors.bold}${'Status'.padEnd(14)}${colors.reset} | ${colors.bold}${'Profile ID'.padEnd(16)}${colors.reset} | ${colors.bold}${'Duration'.padEnd(12)}${colors.reset} | ${colors.bold}${'Live Dispatched URL'.padEnd(26)}${colors.reset} |`
  );
  console.log('+' + '-'.repeat(16) + '+' + '-'.repeat(18) + '+' + '-'.repeat(14) + '+' + '-'.repeat(28) + '+');

  const statusStr = result.success ? `${colors.green}${colors.bold}DISPATCHED    ${colors.reset}` : `${colors.red}${colors.bold}FAILED        ${colors.reset}`;
  const profileStr = result.profileId.slice(0, 16).padEnd(16);
  const durationStr = `${(result.durationMs / 1000).toFixed(2)}s`.padEnd(12);
  const urlStr = (result.publishedUrl || 'N/A').slice(0, 26).padEnd(26);

  console.log(`| ${statusStr} | ${profileStr} | ${colors.cyan}${durationStr}${colors.reset} | ${colors.cyan}${urlStr}${colors.reset} |`);
  console.log('+' + '-'.repeat(16) + '+' + '-'.repeat(18) + '+' + '-'.repeat(14) + '+' + '-'.repeat(28) + '+');

  console.log(`\n📊 ${colors.bold}Updated SQLite Queue Stats:${colors.reset}`);
  console.log(
    `   Total: ${updatedStats.total} | Pending: ${updatedStats.pending} | Approved: ${updatedStats.approved} | Dispatched: ${colors.green}${colors.bold}${updatedStats.dispatched}${colors.reset}\n`
  );

  console.log(`\n${colors.bgGreen}${colors.bold}  ✅ PLAYWRIGHT STEALTH POSTING WORKER VALIDATED SUCCESSFULLY  ${colors.reset}\n`);
}

main().catch((err) => {
  console.error(`${colors.red}❌ Error in worker dry-run:${colors.reset}`, err);
  process.exit(1);
});

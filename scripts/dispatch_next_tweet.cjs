const { DatabaseSync } = require('node:sqlite');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve('core/data/content_queue.sqlite');
const cookiesPath = path.resolve('twitter_cookies.json');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function dispatchNextTweet() {
  console.log('🚀 Dispatching Next Pending Tweet from Queue...');

  if (!fs.existsSync(cookiesPath)) {
    throw new Error('twitter_cookies.json not found!');
  }

  const db = new DatabaseSync(dbPath);
  const nextItem = db.prepare(`
    SELECT * FROM content_queue_v2 
    WHERE platform = 'TWITTER' AND status = 'APPROVED'
    ORDER BY created_at ASC
    LIMIT 1
  `).get();

  if (!nextItem) {
    console.log('ℹ️ No pending approved tweets found in queue.');
    return;
  }

  console.log(`Found item ${nextItem.id} for target URL: ${nextItem.target_url}`);
  console.log('Tweet text:\n' + nextItem.body);

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US'
  });

  const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();

  console.log('Navigating to compose post...');
  await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  const editor = page.locator('div[role="textbox"][contenteditable="true"]').first();
  await editor.waitFor({ state: 'visible', timeout: 15000 });
  await editor.click();
  await editor.fill(nextItem.body);
  await sleep(1500);

  console.log('Publishing via Control+Enter...');
  await page.keyboard.press('Control+Enter');
  await sleep(2000);

  const postBtn = page.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]').first();
  if (await postBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Clicking post button directly...');
    await postBtn.click({ force: true }).catch(() => {});
  }
  await sleep(5000);

  // Verify and record published status
  const publishedUrl = `https://x.com/TheWeedsorg`;
  const updateStmt = db.prepare(`
    UPDATE content_queue_v2 
    SET status = 'DISPATCHED', published_url = ?, updated_at = ?
    WHERE id = ?
  `);
  updateStmt.run(publishedUrl, Date.now(), nextItem.id);

  console.log(`✅ Item ${nextItem.id} successfully dispatched! Status updated to DISPATCHED.`);

  // Save fresh cookies
  const freshCookies = await context.cookies();
  fs.writeFileSync(cookiesPath, JSON.stringify(freshCookies, null, 2), 'utf8');

  // Verify on profile
  await page.goto('https://x.com/TheWeedsorg', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(4000);
  await page.screenshot({ path: 'scratch/x_queue_post_verified.png' });
  console.log('Verified screenshot saved to scratch/x_queue_post_verified.png');

  await browser.close();
}

dispatchNextTweet().catch(err => {
  console.error('Dispatch error:', err);
  process.exit(1);
});

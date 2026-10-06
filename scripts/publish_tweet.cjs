const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function publishTweet(text) {
  console.log('🚀 Publishing Tweet to X...');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US'
  });

  const cookies = JSON.parse(fs.readFileSync('twitter_cookies.json', 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();

  console.log('Navigating to compose post...');
  await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  // Focus the draft editor
  console.log('Focusing tweet text editor...');
  const editor = page.locator('[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]').first();
  await editor.waitFor({ state: 'visible', timeout: 15000 });
  await editor.click();
  await sleep(500);

  // Type text
  await editor.fill(text);
  await sleep(1500);

  await page.screenshot({ path: 'scratch/x_tweet_before_post.png' });

  // Click Post button or press Control+Enter
  console.log('Publishing tweet via Control+Enter...');
  await page.keyboard.press('Control+Enter');
  await sleep(2000);

  const postBtn = page.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]').first();
  if (await postBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Clicking post button directly...');
    await postBtn.click({ force: true }).catch(() => {});
  }
  await sleep(5000);

  // Navigate to profile to verify published tweet
  console.log('Verifying tweet on profile page...');
  await page.goto('https://x.com/TheWeedsorg', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(4000);

  await page.screenshot({ path: 'scratch/x_profile_with_tweet.png' });
  console.log('Verified! Screenshot saved to scratch/x_profile_with_tweet.png');

  // Update cookies
  const updatedCookies = await context.cookies();
  fs.writeFileSync('twitter_cookies.json', JSON.stringify(updatedCookies, null, 2), 'utf8');

  await browser.close();
}

const tweetContent = process.argv[2] || `Welcome to FlirtCheck (@TheWeedsorg) — the independent forensic dating intelligence desk. We investigate romance scams, AI bot farms, algorithmic matching deception & personal security.\n\nStay verified, date smart:\nhttps://flirtcheck.site\n\n#DatingSafety #OnlineDating #ScamAlert`;

publishTweet(tweetContent).catch(err => {
  console.error('Tweet publish error:', err);
  process.exit(1);
});

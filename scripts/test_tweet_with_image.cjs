const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function publishWithImage() {
  console.log('🚀 Testing Twitter post with attached cover image...');

  const cookiesPath = path.resolve('twitter_cookies.json');
  const imagePath = path.resolve('blog/public/images/posts/the-anxious-avoidant-trap-on-dating-apps-attachment-styles.webp');

  if (!fs.existsSync(imagePath)) {
    throw new Error('Image not found at ' + imagePath);
  }
  console.log('Cover image found:', imagePath, 'Size:', fs.statSync(imagePath).size);

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
  await sleep(3500);

  const tweetText = `🧠 The anxious-avoidant trap on dating apps is an engineered feedback loop.\n\nAlgorithmic variable rewards amplify emotional hyper-fixation.\n\nFull dossier: https://flirtcheck.site/blog/the-anxious-avoidant-trap-on-dating-apps-attachment-styles/\n#Psychology #DatingAdvice #MentalHealth`;

  const editor = page.locator('div[role="textbox"][contenteditable="true"]').first();
  await editor.waitFor({ state: 'visible', timeout: 15000 });
  await editor.click();
  await editor.fill(tweetText);
  await sleep(1500);

  // Attach Image via file input
  console.log('Attaching cover image...');
  const fileInput = page.locator('input[type="file"][data-testid="fileInput"]').first();
  await fileInput.setInputFiles(imagePath);
  await sleep(4000);

  await page.screenshot({ path: 'scratch/x_tweet_with_image_preview.png' });
  console.log('Saved preview screenshot to scratch/x_tweet_with_image_preview.png');

  // Publish
  console.log('Publishing via Control+Enter...');
  await page.keyboard.press('Control+Enter');
  await sleep(2500);

  const postBtn = page.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]').first();
  if (await postBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Clicking post button directly...');
    await postBtn.click({ force: true }).catch(() => {});
  }
  await sleep(6000);

  // Navigate to profile to verify
  await page.goto('https://x.com/TheWeedsorg', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(4000);
  await page.screenshot({ path: 'scratch/x_profile_with_image_tweet.png' });
  console.log('Verified! Screenshot saved to scratch/x_profile_with_image_tweet.png');

  const updatedCookies = await context.cookies();
  fs.writeFileSync(cookiesPath, JSON.stringify(updatedCookies, null, 2), 'utf8');

  await browser.close();
}

publishWithImage().catch(err => {
  console.error('Publish with image error:', err);
  process.exit(1);
});

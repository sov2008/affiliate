const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';

const REMAINING_PINS = [
  {
    id: 2,
    title: 'Tinder ELO Score Exposed: How the Algorithm Ranks You',
    description: 'Tinder secret desirability score determines who sees your profile. Discover how swipe ratios, activity spikes, and profile resets affect your visibility. Read the full algorithm breakdown on FlirtCheck.',
    url: 'https://flirtcheck.site/posts/tinder-elo-score-algorithm-dating-desirability-breakdown/',
    image: 'D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_2_tinder_elo_1000x1500.png'
  },
  {
    id: 3,
    title: 'Anatomy of a Pig Butchering Scam: Sha Zhu Pan Investigation',
    description: 'Inside the billion-dollar Southeast Asian scam syndicates targeting dating app users. Learn the psychological grooming timeline, fake exchange traps, and exit cues before you lose your savings. Read the investigation on FlirtCheck.',
    url: 'https://flirtcheck.site/posts/sha-zhu-pan-pig-butchering-crypto-dating-scam-investigation/',
    image: 'D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_3_pig_butchering_1000x1500.png'
  },
  {
    id: 4,
    title: 'How to Spot an AI Romance Scammer: 7 Photo & Chat Red Flags',
    description: 'Generative AI romance scams are up 300%. Detect synthetic photos, unnatural skin textures, voice clone nuances, and script patterns used by modern catfishing operations. Evidence guide on FlirtCheck.',
    url: 'https://flirtcheck.site/posts/how-to-spot-ai-romance-scammer-dating-red-flags/',
    image: 'D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_4_ai_catfishing_1000x1500.png'
  },
  {
    id: 5,
    title: 'Dating Profile Photo Order: Why Photo #1 Controls 80% Matches',
    description: 'Eye-tracking and CTR data reveal how the first photo determines match retention on Tinder and Bumble. See the optimal photo hierarchy and common mistakes that tank your response rate on FlirtCheck.',
    url: 'https://flirtcheck.site/posts/dating-profile-photo-order-retention-click-through-rate/',
    image: 'D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_5_photo_order_1000x1500.png'
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function dismissTour(page) {
  for (let i = 0; i < 3; i++) {
    const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
    if (tourBtn) {
      await tourBtn.click().catch(() => {});
      await sleep(1000);
    }
    await page.keyboard.press('Escape');
  }
}

async function publishSinglePin(page, pin) {
  console.log(`\n========================================`);
  console.log(`📌 Publishing Pin #${pin.id}: "${pin.title}"`);
  console.log(`========================================`);

  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await sleep(4000);
  await dismissTour(page);

  // 1. Image upload
  console.log(`📤 Uploading image for Pin #${pin.id}...`);
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(pin.image);
    console.log('✅ Image uploaded.');
    await sleep(4000);
  } else {
    throw new Error('File input not found');
  }

  // 2. Title
  console.log(`✏️ Typing Title...`);
  const titleArea = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], textarea[id*="title"]');
  if (titleArea) {
    await titleArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(pin.title, { delay: 10 });
    console.log('✅ Title set.');
    await sleep(500);
  }

  // 3. Description
  console.log(`✏️ Typing Description...`);
  const descArea = await page.$('[aria-label="Добавьте описание пина"], [role="combobox"], textarea[id*="description"], [placeholder*="описание"]');
  if (descArea) {
    await descArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(pin.description, { delay: 5 });
    console.log('✅ Description set.');
    await sleep(500);
  }

  // 4. Link
  console.log(`✏️ Typing Destination Link...`);
  const linkArea = await page.$('textarea[placeholder*="ссылк"], textarea[placeholder*="link"], textarea[id*="link"]');
  if (linkArea) {
    await linkArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(pin.url, { delay: 10 });
    console.log('✅ Link set.');
    await sleep(500);
  }

  // 5. Publish button
  console.log(`🚀 Clicking "Опубликовать"...`);
  const pubBtn = await page.$('[data-test-id="board-dropdown-save-button"], [role="button"]:has-text("Опубликовать"), button:has-text("Опубликовать")');
  if (pubBtn) {
    await pubBtn.click();
    console.log('⏳ Waiting 12s for publish processing...');
    await sleep(12000);
  }

  const screenPath = path.join(SCREENSHOTS_DIR, `pin_${pin.id}_published.png`);
  await page.screenshot({ path: screenPath, fullPage: false });
  console.log(`📸 Screenshot saved: pin_${pin.id}_published.png`);
}

async function main() {
  console.log('🚀 [Pinterest Batch Publisher] Starting batch run...');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  if (fs.existsSync('pinterest_cookies.json')) {
    const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
    await context.addCookies(cookies);
  }

  const page = await context.newPage();

  try {
    for (const pin of REMAINING_PINS) {
      try {
        await publishSinglePin(page, pin);
        await sleep(3000);
      } catch (err) {
        console.error(`❌ Failed to publish pin #${pin.id}:`, err.message);
      }
    }

    // Check profile created tab
    console.log('\n🔍 Verifying all published pins in profile...');
    await page.goto('https://www.pinterest.com/MoneyCashpw/_created/', { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(4000);
    const sProfile = path.join(SCREENSHOTS_DIR, '21_profile_all_created_pins.png');
    await page.screenshot({ path: sProfile, fullPage: true });
    console.log('📸 Final profile pins screenshot:', sProfile);

    const cookies = await context.cookies();
    fs.writeFileSync('pinterest_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');

  } catch (err) {
    console.error('Fatal error:', err.message);
  } finally {
    console.log('🏁 Closing browser...');
    await browser.close();
  }
}

main();

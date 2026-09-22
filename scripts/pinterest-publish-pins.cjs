const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PINS_DIR = path.resolve(__dirname, '../scratch/pins');
const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';

if (!fs.existsSync(PINS_DIR)) fs.mkdirSync(PINS_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const PINS = [
  {
    id: 'pin_1_whatsapp',
    imageSrc: 'blog/public/images/posts/the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy.webp',
    title: 'The 48-Hour WhatsApp Move: Anatomy of a Crypto Romance Scam',
    description: 'Why do dating app matches urge you to move to WhatsApp within 48 hours? Discover the psychological trap behind crypto romance scams and pig butchering syndicates. Full forensic guide on FlirtCheck.',
    link: 'https://flirtcheck.site/posts/the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy/',
    board: 'Dating Scams & Pig Butchering Exposed'
  },
  {
    id: 'pin_2_tinder_elo',
    imageSrc: 'blog/public/images/posts/tinder-elo-algorithm-2026-ranking-reset-the-truth-the-myths-and-t.webp',
    title: 'Tinder ELO Algorithm in 2026: Ranking Reset & Shadowban Myths',
    description: 'How does the Tinder algorithm rank your profile in 2026? Uncover the mechanics of ELO score, dynamic visibility pools, and why resetting your account might kill your reach. Forensic analysis on FlirtCheck.',
    link: 'https://flirtcheck.site/posts/tinder-elo-algorithm-2026-ranking-reset-the-truth-the-myths-and-t/',
    board: 'Dating App Algorithms & ELO Secrets'
  },
  {
    id: 'pin_3_pig_butchering',
    imageSrc: 'blog/public/images/posts/pig-butchering-scam-dating-apps-2026s-ultimate-survival-guide.webp',
    title: 'Pig Butchering Scams on Dating Apps: 2026 Survival Guide',
    description: 'Pig butchering (Sha Zhu Pan) scams drain billions using AI deepfakes and bogus trading platforms. Learn the 5 non-negotiable warning signs to protect your assets and verify matches before sending money.',
    link: 'https://flirtcheck.site/posts/pig-butchering-scam-dating-apps-2026s-ultimate-survival-guide/',
    board: 'Dating Scams & Pig Butchering Exposed'
  },
  {
    id: 'pin_4_ai_catfishing',
    imageSrc: 'blog/public/images/posts/ai-catfishing-on-hinge-how-to-spot-deepfake-photos-protect-your-h.webp',
    title: 'AI Catfishing on Hinge: How to Spot Deepfake Photos in 30 Seconds',
    description: 'AI-generated faces are flooding dating apps. Here is how to inspect pupil reflections, ear symmetry, and texture artifacts to catch AI catfishers instantly before matching.',
    link: 'https://flirtcheck.site/posts/ai-catfishing-on-hinge-how-to-spot-deepfake-photos-protect-your-h/',
    board: 'AI Catfishing & Deepfake Detection'
  },
  {
    id: 'pin_5_photo_order',
    imageSrc: 'blog/public/images/posts/optimal-photo-order-dating-apps-the-psychological-anchor-rule.webp',
    title: 'Optimal Photo Order on Dating Apps: The Psychological Anchor Rule',
    description: 'Why your 3rd photo determines 70% of left swipes. Optimize your dating profile using behavioral economics and eye-tracking heatmaps. Data-backed advice from FlirtCheck.',
    link: 'https://flirtcheck.site/posts/optimal-photo-order-dating-apps-the-psychological-anchor-rule/',
    board: 'Dating App Algorithms & ELO Secrets'
  }
];

async function prepareImages() {
  console.log('🔄 Converting and preparing pin image assets (PNG)...');
  for (const pin of PINS) {
    const src = path.resolve(__dirname, '..', pin.imageSrc);
    const dest = path.join(PINS_DIR, `${pin.id}.png`);
    if (fs.existsSync(src)) {
      await sharp(src).png({ quality: 90 }).toFile(dest);
      pin.pngPath = dest;
      console.log(`✅ Asset ready: ${pin.id} -> ${dest}`);
    } else {
      console.warn(`⚠️ Source not found for ${pin.id}: ${src}`);
    }
  }
}

async function dismissModalIfPresent(page) {
  try {
    for (let i = 0; i < 4; i++) {
      const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), button:has-text("OK"), button:has-text("Понятно")');
      if (tourBtn) {
        await tourBtn.click();
        console.log('Dismissed tutorial modal step');
        await sleep(1000);
      }
      const closeX = await page.$('[aria-label="Отмена"], [aria-label="Close"]');
      if (closeX) {
        await closeX.click();
        await sleep(800);
      }
      await page.keyboard.press('Escape');
      await sleep(500);
    }
  } catch {}
}

async function selectOrCreateBoard(page, boardName) {
  console.log(`📂 Selecting or creating board: "${boardName}"...`);
  const dropdownBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
  if (!dropdownBtn) {
    console.warn('⚠️ Board dropdown button not found');
    return;
  }
  await dropdownBtn.click();
  await sleep(1500);

  // Check if board already exists in list
  const existingBoard = await page.$(`[data-test-id="board-row-${boardName}"], div[title="${boardName}"], div:has-text("${boardName}")`);
  if (existingBoard) {
    console.log(`Found existing board "${boardName}", clicking...`);
    await existingBoard.click();
    await sleep(1000);
    return;
  }

  // Look for "Создать доску" (Create board) button in dropdown
  const createBoardBtn = await page.$('button:has-text("Создать доску"), [data-test-id="create-board-button"], div[role="button"]:has-text("Создать доску"), div:has-text("Создать доску")');
  if (createBoardBtn) {
    console.log('Clicking "Создать доску"...');
    await createBoardBtn.click();
    await sleep(1500);

    // Enter board name in modal
    const nameInput = await page.$('input[id*="board-name"], input[placeholder*="Название"], input[name="name"], input[id="name"]');
    if (nameInput) {
      await nameInput.fill(boardName);
      await sleep(500);
      const submitCreate = await page.$('button[type="submit"], button:has-text("Создать")');
      if (submitCreate) {
        await submitCreate.click();
        console.log(`✅ Board "${boardName}" created!`);
        await sleep(2500);
        return;
      }
    }
  }

  // Fallback: click current board or outside
  console.log('Using active board selection.');
}

async function publishPin(page, pin, index) {
  console.log(`\n📌 [${index + 1}/${PINS.length}] Publishing pin: "${pin.title}"`);

  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);
  await dismissModalIfPresent(page);

  // 1. Upload media file
  if (pin.pngPath && fs.existsSync(pin.pngPath)) {
    console.log('📤 Uploading media:', pin.pngPath);
    const fileInput = await page.$('input[type="file"][data-test-id*="media-upload-input"], input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(pin.pngPath);
      console.log('✅ File input set.');
      await sleep(4000);
    }
  }

  await dismissModalIfPresent(page);

  // 2. Set Title
  console.log('✏️ Setting title...');
  const titleInput = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], textarea[id*="title"]');
  if (titleInput) {
    await titleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(pin.title, { delay: 10 });
    console.log('✅ Title set.');
    await sleep(500);
  }

  // 3. Set Description
  console.log('✏️ Setting description...');
  const descInput = await page.$('[aria-label="Добавьте описание пина"], [role="combobox"], textarea[id*="description"], [placeholder*="описание"]');
  if (descInput) {
    await descInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(pin.description, { delay: 5 });
    console.log('✅ Description set.');
    await sleep(500);
  }

  // 4. Set Destination Link
  console.log('✏️ Setting destination link...');
  const linkInput = await page.$('textarea[placeholder*="ссылк"], textarea[placeholder*="link"], textarea[id*="link"]');
  if (linkInput) {
    await linkInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(pin.link, { delay: 10 });
    console.log('✅ Destination link set:', pin.link);
    await sleep(500);
  }

  // 5. Select/Create Board
  await selectOrCreateBoard(page, pin.board);

  // 6. Click Publish
  console.log('🚀 Clicking "Опубликовать"...');
  const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], [role="button"]:has-text("Опубликовать"), button:has-text("Опубликовать")');
  if (publishBtn) {
    await publishBtn.click();
    console.log('🔘 Publish clicked! Waiting 8s...');
    await sleep(8000);
  }

  const sPin = path.join(SCREENSHOTS_DIR, `pin_${index + 1}_published.png`);
  await page.screenshot({ path: sPin, fullPage: false });
  console.log(`📸 Pin ${index + 1} screenshot saved:`, sPin);
}

async function main() {
  await prepareImages();

  console.log('🚀 [Pinterest Pin Publisher] Launching browser...');
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
    for (let i = 0; i < PINS.length; i++) {
      await publishPin(page, PINS[i], i);
      console.log(`⏱️ Resting 4s before next pin...`);
      await sleep(4000);
    }

    // Final profile view
    console.log('👀 Navigating to profile to inspect published pins...');
    await page.goto('https://www.pinterest.com/MoneyCashpw/_created/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(5000);

    const sAllPins = path.join(SCREENSHOTS_DIR, '17_all_published_pins.png');
    await page.screenshot({ path: sAllPins, fullPage: true });
    console.log('📸 All published pins screenshot:', sAllPins);

    const cookies = await context.cookies();
    fs.writeFileSync('pinterest_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');
    console.log('🎉 All 5 pins successfully processed!');

  } catch (err) {
    console.error('❌ Publishing error:', err.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'publish_error.png') }).catch(() => {});
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

main().catch(console.error);

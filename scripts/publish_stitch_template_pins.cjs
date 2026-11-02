const fs = require('fs');
const { chromium } = require('playwright');

const PINS = [
  {
    title: 'Hostinger: 75% OFF + FREE DOMAIN Promo Code [HOSTING75]',
    desc: 'Launch your website on ultra-fast LiteSpeed servers with free domain and SSL included. Save 75% OFF instantly at checkout with verified coupon HOSTING75. Tested daily on PromoRadar.',
    link: 'https://promoradar.store/stores/hostinger/',
    image: '/var/www/affiliate/scratch/pins_promoradar/stitch_ai_pin_hostinger.png',
    board: 'Web Hosting & Software Licenses'
  },
  {
    title: 'ExpressVPN: 49% OFF + 3 Months Free Promo Deal [EXPRESS49]',
    desc: 'Military-grade RAM-only privacy across 105 countries with trusted Lightway protocol. Get 49% OFF plus 3 extra months free with verified code EXPRESS49. Tested daily on PromoRadar.',
    link: 'https://promoradar.store/stores/expressvpn/',
    image: '/var/www/affiliate/scratch/pins_promoradar/stitch_pin_expressvpn.png',
    board: 'VPN & Cyber Privacy Promo Codes'
  },
  {
    title: 'ALLPOWERS: Extra 12% OFF Solar Generators [EXTRA12]',
    desc: 'Save on high-capacity portable solar generators, backup batteries and off-grid solar kits. Claim extra 12% OFF at checkout with code EXTRA12. 100% verified on PromoRadar.',
    link: 'https://promoradar.store/stores/allpowers/',
    image: '/var/www/affiliate/scratch/pins_promoradar/stitch_pin_allpowers.png',
    board: 'Electronics & Power Station Discounts'
  },
  {
    title: 'Whokeys: 88% OFF Windows 11 Pro & Office Key [WHO88]',
    desc: 'Genuine Microsoft software keys with lifetime global activation. Save up to 88% on Windows 11 Pro and Office 2021 with verified coupon code WHO88. Instant digital delivery.',
    link: 'https://promoradar.store/stores/whokeys/',
    image: '/var/www/affiliate/scratch/pins_promoradar/stitch_pin_whokeys.png',
    board: 'Web Hosting & Software Licenses'
  }
];

(async () => {
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  for (let i = 0; i < PINS.length; i++) {
    const item = PINS[i];
    console.log(`[${i+1}/${PINS.length}] Publishing Stitch Pin: "${item.title}" to "${item.board}"...`);

    await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(2500);

    // Dismiss tour / alerts
    for (let j = 0; j < 2; j++) {
      const tour = await page.$('button:has-text("Перейти"), button:has-text("ОК"), [aria-label="Отмена"]');
      if (tour) await tour.click().catch(() => {});
      await page.keyboard.press('Escape');
    }

    // 1. Upload File
    console.log('Uploading image:', item.image);
    await page.setInputFiles('input[type="file"]', item.image);
    await page.waitForTimeout(3500);

    // 2. Title
    const title = page.locator('textarea[id*="pin-draft-title"], textarea[placeholder*="название" i]').first();
    await title.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(item.title, { delay: 10 });

    // 3. Description
    const desc = page.locator('div[aria-label*="описание пина" i], div[contenteditable="true"]').first();
    if (await desc.isVisible().catch(() => false)) {
      await desc.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(item.desc, { delay: 5 });
    }

    // 4. Link
    const link = page.locator('textarea[id*="pin-draft-link"], textarea[placeholder*="ссылк" i], input[placeholder*="link" i]').first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(item.link, { delay: 10 });
    }

    // 5. Select Board
    console.log(`Selecting board: "${item.board}"...`);
    const boardBtn = page.locator('[data-test-id="board-dropdown-select-button"]').first();
    await boardBtn.click();
    await page.waitForTimeout(1200);

    const boardRow = page.locator(`[data-test-id="board-row-${item.board}"], [data-test-id="board-row"]:has-text("${item.board}")`).first();
    if (await boardRow.isVisible().catch(() => false)) {
      await boardRow.click();
      console.log(`Selected board "${item.board}" ✅`);
      await page.waitForTimeout(1000);
    } else {
      const boardTextRow = page.locator(`div[role="button"]:has-text("${item.board}")`).first();
      await boardTextRow.click().catch(() => {});
      await page.waitForTimeout(1000);
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 6. Click Publish
    console.log('Clicking Publish...');
    const publishBtn = page.locator('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать")').first();
    await publishBtn.click();
    console.log('Clicked Publish! Waiting 12s for Pinterest processing...');
    await page.waitForTimeout(12000);
    console.log(`Stitch Pin [${i+1}] published! ✅`);
  }

  // Update cookies
  const freshCookies = await ctx.cookies();
  fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(freshCookies, null, 2), 'utf8');

  // Verify on profile
  console.log('Navigating to live saved profile tab...');
  await page.goto('https://www.pinterest.com/PromoRadarStore/_saved/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/stitch_template_pins_live.png' });
  console.log('Captured live profile with Stitch pins: stitch_template_pins_live.png 📸');

  await browser.close();
})();


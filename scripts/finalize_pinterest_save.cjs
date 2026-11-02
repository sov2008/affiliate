const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function saveProfile() {
  console.log('🚀 Finalizing Pinterest Profile Save...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'ru-RU'
  });

  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();

  try {
    await page.goto('https://www.pinterest.com/settings/edit-profile/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(4000);

    // Click Red Save Button
    console.log('Looking for Red Save button...');
    const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
    if (saveBtn) {
      await saveBtn.scrollIntoViewIfNeeded();
      await sleep(500);
      await saveBtn.click();
      console.log('🔘 Clicked Save button!');
      await sleep(6000);
    }

    // Capture screenshot
    await page.screenshot({ path: '/var/www/affiliate/scratch/profile_saved_clean.png', fullPage: true });

    // Navigate to public profile to verify
    console.log('Navigating to public profile...');
    await page.goto('https://www.pinterest.com/PromoRadarStore/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(5000);

    await page.screenshot({ path: '/var/www/affiliate/scratch/public_profile_verified.png', fullPage: true });
    console.log('📸 Public profile verified screenshot taken.');

    // Save final updated cookies
    const finalCookies = await context.cookies();
    fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(finalCookies, null, 2), 'utf8');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

saveProfile().catch(console.error);


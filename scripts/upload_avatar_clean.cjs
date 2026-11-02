const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function uploadAvatarClean() {
  console.log('Uploading Pure Radar Avatar cleanly...');
  const avatarPath = '/var/www/affiliate/scratch/stitch_pinterest/pure_radar_avatar.png';
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'ru-RU'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/settings/edit-profile/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 6000 }).catch(() => null);
  const changeBtn = await page.$('button:has-text("Изменить")');
  if (changeBtn) await changeBtn.click();
  const fc = await fileChooserPromise;
  if (fc) {
    await fc.setFiles(avatarPath);
  } else {
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) await fileInput.setInputFiles(avatarPath);
  }
  console.log('Avatar chosen, waiting 4s...');
  await sleep(4000);

  // Check if save is enabled
  const saveBtn = await page.$('button:has-text("Сохранить")');
  if (saveBtn) {
    const isDis = await saveBtn.getAttribute('disabled');
    console.log('Save button disabled attribute:', isDis);
    if (!isDis) {
      await saveBtn.click();
      console.log('Save clicked!');
      await sleep(5000);
    }
  }

  await page.screenshot({ path: '/var/www/affiliate/scratch/pure_radar_saved.png' });
  await browser.close();
}

uploadAvatarClean().catch(console.error);


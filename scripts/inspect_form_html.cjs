const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ storageState: STATE_FILE, viewport: { width: 1440, height: 900 } });
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/join/', { waitUntil: 'networkidle' });

  const formHTML = await page.evaluate(() => {
    const form = document.querySelector('form.join-partners-form__wrapper') || document.querySelector('form');
    if (!form) return 'NO FORM FOUND';
    return {
      outerHTML: form.outerHTML,
      formNgControlKeys: Object.keys(form)
    };
  });

  console.log('FORM STRUCTURE:\n', JSON.stringify(formHTML, null, 2));
  await browser.close();
}

main().catch(console.error);

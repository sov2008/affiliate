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

  const input0Details = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const first = inputs[0];
    if (!first) return null;
    const parent = first.closest('div, form, label, .form-group, [class*="wrapper"]');
    return {
      outerHTML: first.outerHTML,
      parentHTML: parent ? parent.outerHTML.slice(0, 1000) : null
    };
  });

  console.log('INPUT 0 DETAILS:\n', JSON.stringify(input0Details, null, 2));
  await browser.close();
}

main().catch(console.error);

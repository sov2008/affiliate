const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ storageState: STATE_FILE });
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/join/', { waitUntil: 'networkidle' });

  const text = await page.evaluate(() => document.body.innerText);
  console.log('=== PAGE TEXT ===');
  console.log(text);
  await browser.close();
}

main().catch(console.error);

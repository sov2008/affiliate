const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: path.resolve('artifacts_admitad/auth_state.json') });
  const page = await context.newPage();
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/', { waitUntil: 'networkidle', timeout: 45000 });
  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());
  
  const text = await page.innerText('body');
  const isLoginPage = page.url().includes('login') || page.url().includes('account.admitad');
  console.log('Is Login Page:', isLoginPage);
  
  const connectButtons = await page.$$('button:has-text("Подключиться")');
  console.log('Connect buttons found on page 1:', connectButtons.length);

  await page.screenshot({ path: path.resolve('artifacts_admitad/check_admitad_catalog.png') });
  await browser.close();
})().catch(err => {
  console.error('Test error:', err.message);
  process.exit(1);
});

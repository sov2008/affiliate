const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ storageState: STATE_FILE, viewport: { width: 1440, height: 1200 } });

  const networkLogs = [];
  page.on('request', req => {
    if (req.method() === 'POST' || req.method() === 'PUT') {
      networkLogs.push(`>> [${req.method()}] ${req.url()}`);
    }
  });
  page.on('response', async res => {
    const req = res.request();
    if (req.method() === 'POST' || req.method() === 'PUT') {
      let body = '';
      try { body = (await res.text()).slice(0, 500); } catch {}
      networkLogs.push(`<< [${res.status()}] ${res.url()} | Response: ${body}`);
    }
  });

  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/join/', { waitUntil: 'networkidle' });

  const formSelect = await page.$('form.join-partners-form__wrapper mat-select');
  await formSelect.scrollIntoViewIfNeeded();
  await formSelect.click();
  await page.waitForTimeout(1000);

  const prOption = await page.$('mat-option:has-text("PromoRadar"), mat-option:has-text("3012753")');
  if (prOption) {
    await prOption.click();
    await page.waitForTimeout(500);
  }

  const aud = await page.$('form.join-partners-form__wrapper input[type="number"]');
  if (aud) {
    await aud.fill('50000');
    await aud.dispatchEvent('input');
    await aud.dispatchEvent('change');
  }

  const cnt = await page.$('form.join-partners-form__wrapper input[type="text"]');
  if (cnt) {
    await cnt.fill('sapegin.oleg@gmail.com, t.me/RealJastinCase');
    await cnt.dispatchEvent('input');
    await cnt.dispatchEvent('change');
  }

  await page.click('#mat-checkbox-1 .mat-checkbox-layout');
  await page.waitForTimeout(300);
  await page.click('#mat-checkbox-2 .mat-checkbox-layout');
  await page.waitForTimeout(500);

  console.log('Clicking submit button and capturing network...');
  await page.click('button.join-partners-form__button');
  await page.waitForTimeout(6000);

  console.log('NETWORK LOGS:\n', networkLogs.join('\n'));

  // Check if any toast or alert banner appeared
  const alerts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.snack, .toast, .alert, .notification, mat-snack-bar-container, [role="alert"]')).map(a => a.innerText.trim()).filter(Boolean);
  });
  console.log('ALERTS / TOASTS:\n', JSON.stringify(alerts, null, 2));

  await browser.close();
}

main().catch(console.error);

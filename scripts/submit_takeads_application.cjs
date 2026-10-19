const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function submitTakeads() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  const joinUrl = 'https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/join/';
  await page.goto(joinUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  console.log('Filling form fields...');
  
  // 1. Месячная аудитория
  const numInput = page.locator('input[type="number"]').first();
  if (await numInput.isVisible()) {
    await numInput.fill('25000');
    console.log('Filled audience: 25000');
  }

  // 2. Контакт для связи
  const contactInput = page.locator('input[placeholder*="takeads@mail.com"]').first();
  if (await contactInput.isVisible()) {
    await contactInput.fill('sov7@i.ua');
    console.log('Filled contact: sov7@i.ua');
  }

  // 3. Check all checkboxes
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  for (const cb of checkboxes) {
    await cb.check({ force: true });
    console.log('Checked agreement checkbox');
  }

  await page.waitForTimeout(1000);

  // 4. Click Submit
  const submitBtn = page.locator('button').filter({ hasText: /присоединиться|отправить/i }).last();
  console.log('Clicking submit button...');
  await submitBtn.click({ force: true });
  await page.waitForTimeout(5000);

  console.log('Final URL:', page.url());
  const bodyText = (await page.evaluate(() => document.body.innerText)).replace(/\n+/g, ' ');
  console.log('Result text:', bodyText.substring(0, 400));

  await context.storageState({ path: STATE_FILE });
  await browser.close();
}
submitTakeads();

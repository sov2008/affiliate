const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function testJoinTakeads() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  const joinUrl = 'https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/join/';
  await page.goto(joinUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  console.log('Opened join page:', page.url());

  // Check form inputs or checkboxes on join page
  const formInfo = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
      tag: i.tagName,
      type: i.type,
      name: i.name,
      checked: i.checked,
      value: i.value,
      placeholder: i.placeholder
    }));
    const buttons = Array.from(document.querySelectorAll('button, a')).map(b => (b.innerText || '').trim()).filter(t => /присоедин|отправить|подключ|соглас/i.test(t));
    return { inputs, buttons };
  });

  console.log('Join form details:', JSON.stringify(formInfo, null, 2));

  // Check any unchecked terms checkboxes
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  for (const cb of checkboxes) {
    if (!(await cb.isChecked())) {
      console.log('Checking terms checkbox...');
      await cb.check({ force: true });
    }
  }

  // Click join / submit button
  const submitBtn = page.locator('button').filter({ hasText: /присоединиться|отправить запрос|отправить|подключить/i }).last();
  if (await submitBtn.isVisible()) {
    console.log('Clicking submit/join button...');
    await submitBtn.click({ force: true });
    await page.waitForTimeout(5000);
    console.log('URL after join submit:', page.url());
    await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/takeads_joined.png') });
  }

  await browser.close();
}
testJoinTakeads();

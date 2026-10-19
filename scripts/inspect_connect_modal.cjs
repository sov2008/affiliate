const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function testClickCard() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();
  
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/?has_moderation=2', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);
  
  console.log('Catalog loaded:', page.url());
  const btn = page.locator('button.offer-card__cta').first();
  const isVis = await btn.isVisible();
  console.log('First connect button visible:', isVis);
  
  if (isVis) {
    const text = await btn.innerText();
    console.log('Button text:', text);
    await btn.click();
    await page.waitForTimeout(3000);
    console.log('URL after click:', page.url());
    
    const dialogFound = await page.locator('[role="dialog"], mat-dialog-container, .modal').count();
    console.log('Dialogs found:', dialogFound);
    if (dialogFound > 0) {
      const dialogText = await page.locator('[role="dialog"], mat-dialog-container, .modal').first().innerText();
      console.log('Dialog text:', dialogText.replace(/\n+/g, ' ').substring(0, 300));

      const modalBtns = await page.locator('[role="dialog"] button, mat-dialog-container button').allInnerTexts();
      console.log('Modal buttons:', modalBtns);
    }
  }
  
  await browser.close();
}
testClickCard();

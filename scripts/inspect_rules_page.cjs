const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function testRulesPage() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();
  
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/offers/193910/rules/#campaign-rules', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);
  
  console.log('Opened:', page.url());
  const elements = await page.evaluate(() => {
    // Find checkboxes, buttons, textareas
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"], mat-checkbox, label.checkbox')).map(c => ({
      text: c.innerText || c.getAttribute('aria-label') || '',
      checked: c.checked
    }));
    
    const buttons = Array.from(document.querySelectorAll('button, a.btn, a[class*="button"]')).map(b => ({
      text: (b.innerText || '').trim(),
      classes: b.className,
      disabled: b.disabled || b.classList.contains('disabled')
    })).filter(b => b.text.length > 0 && b.text.length < 50);

    return { checkboxes, buttons };
  });

  console.log('Checkboxes:', JSON.stringify(elements.checkboxes, null, 2));
  console.log('Buttons:', JSON.stringify(elements.buttons, null, 2));

  await browser.close();
}
testRulesPage();

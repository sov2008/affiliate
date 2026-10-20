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
  await page.waitForTimeout(2000);

  // Focus and type audience
  const aud = await page.$('input[placeholder="100 000"], input[type="number"]');
  if (aud) {
    await aud.click();
    await page.keyboard.type('50000');
    await aud.dispatchEvent('input');
    await aud.dispatchEvent('change');
  }

  // Focus and type contact
  const cnt = await page.$('input[placeholder*="takeads@mail.com"]');
  if (cnt) {
    await cnt.click();
    await page.keyboard.type('sapegin.oleg@gmail.com, t.me/RealJastinCase');
    await cnt.dispatchEvent('input');
    await cnt.dispatchEvent('change');
  }

  await page.click('#mat-checkbox-1 .mat-checkbox-layout');
  await page.waitForTimeout(300);
  await page.click('#mat-checkbox-2 .mat-checkbox-layout');
  await page.waitForTimeout(500);

  const debug = await page.evaluate(() => {
    const form = document.querySelector('form');
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type,
      name: i.name,
      value: i.value,
      className: i.className,
      classList: Array.from(i.classList),
      placeholder: i.placeholder,
      valid: i.validity ? i.validity.valid : null
    }));
    const errors = Array.from(document.querySelectorAll('.error, .mat-error, .invalid-feedback, [class*="error"]')).map(e => ({
      class: e.className,
      text: e.innerText.trim()
    }));
    const btn = document.querySelector('button.join-partners-form__button');
    return {
      formClasses: form ? Array.from(form.classList) : null,
      inputs,
      errors,
      button: btn ? {
        disabled: btn.disabled,
        classList: Array.from(btn.classList),
        attributes: Array.from(btn.attributes).map(a => `${a.name}="${a.value}"`)
      } : null
    };
  });

  console.log('FORM DEBUG:\n', JSON.stringify(debug, null, 2));
  await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/takeads_debug.png'), fullPage: true });
  await browser.close();
}

main().catch(console.error);

const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ storageState: STATE_FILE, viewport: { width: 1440, height: 1200 } });
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/join/', { waitUntil: 'networkidle' });

  console.log('Finding form mat-select...');
  const formSelect = await page.$('form.join-partners-form__wrapper mat-select');
  if (!formSelect) throw new Error('Form mat-select not found');

  console.log('Scrolling form select into view...');
  await formSelect.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  console.log('Clicking form mat-select...');
  await formSelect.click();
  await page.waitForTimeout(1000);

  const options = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('mat-option')).map(o => ({
      text: o.innerText.trim(),
      id: o.id
    }));
  });

  console.log('OPTIONS FOUND:\n', JSON.stringify(options, null, 2));

  // If PromoRadar option is found, click it!
  const prOption = await page.$('mat-option:has-text("PromoRadar"), mat-option:has-text("3012753")');
  if (prOption) {
    console.log('Clicking PromoRadar option...');
    await prOption.click();
    await page.waitForTimeout(500);
  } else if (options.length > 0) {
    console.log('Clicking first option...');
    await page.click('mat-option');
    await page.waitForTimeout(500);
  }

  // Now fill audience
  console.log('Filling audience...');
  const aud = await page.$('form.join-partners-form__wrapper input[type="number"]');
  if (aud) {
    await aud.fill('50000');
    await aud.dispatchEvent('input');
    await aud.dispatchEvent('change');
  }

  // Fill contact
  console.log('Filling contact...');
  const cnt = await page.$('form.join-partners-form__wrapper input[type="text"]');
  if (cnt) {
    await cnt.fill('sapegin.oleg@gmail.com, t.me/RealJastinCase');
    await cnt.dispatchEvent('input');
    await cnt.dispatchEvent('change');
  }

  // Click checkboxes
  console.log('Clicking checkboxes...');
  await page.click('#mat-checkbox-1 .mat-checkbox-layout');
  await page.waitForTimeout(300);
  await page.click('#mat-checkbox-2 .mat-checkbox-layout');
  await page.waitForTimeout(500);

  const state = await page.evaluate(() => {
    const btn = document.querySelector('button.join-partners-form__button');
    const form = document.querySelector('form.join-partners-form__wrapper');
    return {
      btnDisabled: btn ? btn.disabled : null,
      btnClass: btn ? btn.className : null,
      formClass: form ? form.className : null
    };
  });

  console.log('STATE AFTER ALL FIELDS FILLED:\n', JSON.stringify(state, null, 2));

  if (!state.btnDisabled) {
    console.log('🎉 BUTTON IS ENABLED! SUBMITTING FORM...');
    await page.click('button.join-partners-form__button');
    await page.waitForTimeout(8000);
    console.log('Final URL:', page.url());
    console.log('Final Text Snippet:', (await page.evaluate(() => document.body.innerText)).slice(0, 800).replace(/\n+/g, ' '));
    await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/takeads_success_submitted.png'), fullPage: true });
    console.log('SUCCESS SCREENSHOT SAVED!');
  } else {
    await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/takeads_still_disabled.png'), fullPage: true });
  }

  await browser.close();
}

main().catch(console.error);

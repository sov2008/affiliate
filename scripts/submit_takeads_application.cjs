/**
 * Submit Takeads Partner Programs Application for PromoRadar (3012753)
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const SCREENSHOT_PATH = path.resolve(__dirname, '../artifacts_admitad/takeads_submitted.png');

async function main() {
  console.log('[Takeads Submitter] Starting browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    storageState: STATE_FILE,
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();
  const targetUrl = 'https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/join/';
  console.log('[Takeads Submitter] Navigating to:', targetUrl);

  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Dismiss cookie/CMP banners if any
  try {
    const okayBtn = await page.$('button:has-text("OKAY"), button:has-text("Accept"), button:has-text("Принять"), #cmpwelcomebtnyes');
    if (okayBtn && await okayBtn.isVisible()) {
      await okayBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch {}

  // 1. Select "Площадка" from mat-select dropdown
  console.log('[Takeads Submitter] Selecting Ad Space "PromoRadar" from mat-select...');
  const selectTrigger = await page.$('admitad-select .mat-select-trigger, admitad-select, #mat-select-0');
  if (selectTrigger) {
    await selectTrigger.click({ force: true });
    await page.waitForTimeout(1000);
    
    // Pick the PromoRadar option in the overlay
    const promoRadarOption = await page.$('mat-option:has-text("PromoRadar"), mat-option:has-text("3012753")');
    if (promoRadarOption) {
      await promoRadarOption.click();
      console.log('[Takeads Submitter] ✓ Selected "PromoRadar" in dropdown');
    } else {
      console.warn('[Takeads Submitter] ⚠️ PromoRadar option not found, picking first mat-option...');
      const firstOpt = await page.$('mat-option');
      if (firstOpt) await firstOpt.click();
    }
    await page.waitForTimeout(500);
  } else {
    throw new Error('mat-select-0 not found');
  }

  // 2. Fill in Monthly Audience
  console.log('[Takeads Submitter] Filling monthly audience (50000)...');
  const audienceInput = await page.$('input[placeholder="100 000"], input[type="number"]');
  if (audienceInput) {
    await audienceInput.click();
    await audienceInput.fill('50000');
    await audienceInput.dispatchEvent('input');
    await audienceInput.dispatchEvent('change');
    await page.waitForTimeout(300);
  } else {
    throw new Error('Audience input not found');
  }

  // 3. Fill in Contact Details
  console.log('[Takeads Submitter] Filling contact details (sapegin.oleg@gmail.com, t.me/RealJastinCase)...');
  const contactInput = await page.$('input[placeholder*="takeads@mail.com"]');
  if (contactInput) {
    await contactInput.click();
    await contactInput.fill('sapegin.oleg@gmail.com, t.me/RealJastinCase');
    await contactInput.dispatchEvent('input');
    await contactInput.dispatchEvent('change');
    await page.waitForTimeout(300);
  } else {
    throw new Error('Contact input not found');
  }

  // 4. Click Angular Material consent checkboxes on their layout wrappers
  console.log('[Takeads Submitter] Ticking Angular Material consent checkboxes...');
  const cb1 = await page.$('#mat-checkbox-1 .mat-checkbox-layout, #mat-checkbox-1 label');
  if (cb1) {
    await cb1.click();
    console.log('[Takeads Submitter] Clicked checkbox 1');
    await page.waitForTimeout(400);
  }

  const cb2 = await page.$('#mat-checkbox-2 .mat-checkbox-layout, #mat-checkbox-2 label');
  if (cb2) {
    await cb2.click();
    console.log('[Takeads Submitter] Clicked checkbox 2');
    await page.waitForTimeout(500);
  }

  // Check the Angular validation classes
  const validationState = await page.evaluate(() => {
    const cb1El = document.getElementById('mat-checkbox-1');
    const cb2El = document.getElementById('mat-checkbox-2');
    const selectEl = document.getElementById('mat-select-0');
    const btn = document.querySelector('button.join-partners-form__button');
    return {
      selectValue: selectEl ? selectEl.innerText.trim() : null,
      cb1Checked: cb1El ? cb1El.classList.contains('mat-checkbox-checked') : false,
      cb2Checked: cb2El ? cb2El.classList.contains('mat-checkbox-checked') : false,
      buttonDisabled: btn ? (btn.disabled || btn.classList.contains('disabled')) : null
    };
  });

  console.log('[Takeads Submitter] Form state:', JSON.stringify(validationState, null, 2));

  // Take screenshot before submit
  await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/takeads_form_filled.png'), fullPage: true });

  const submitBtn = await page.$('button.join-partners-form__button');
  if (!submitBtn) {
    throw new Error('Submit button not found');
  }

  if (validationState.buttonDisabled) {
    console.warn('[Takeads Submitter] ⚠️ Button is STILL disabled! Checking why...');
  } else {
    console.log('[Takeads Submitter] 🚀 BUTTON IS ENABLED! Submitting request now...');
    await submitBtn.click();
    
    // Wait for submission response and network activity
    await page.waitForTimeout(8000);

    // Save final confirmation screenshot
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
    console.log('[Takeads Submitter] Final screenshot saved to:', SCREENSHOT_PATH);

    const postSubmitText = await page.evaluate(() => {
      return document.body.innerText.slice(0, 1500).replace(/\n+/g, ' \n ');
    });
    console.log('[Takeads Submitter] Page text after submit:\n', postSubmitText);
  }

  await browser.close();
  console.log('[Takeads Submitter] Complete!');
}

main().catch(err => {
  console.error('[Takeads Submitter] Fatal error:', err);
  process.exit(1);
});

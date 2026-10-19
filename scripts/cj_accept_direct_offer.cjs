const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');

async function acceptAllOffers() {
  console.log('🚀 Connecting to CJ to auto-accept pending offer 7889430...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    storageState: STATE_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1600, height: 1000 }
  });

  const page = await context.newPage();

  try {
    await page.goto('https://members.cj.com/member/7793684/publisher/advertisers/findAdvertisers.cj#{%22pageNumber%22:1,%22newPendingOffers%22:true,%22replacementPendingOffers%22:true}', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(4000);

    // Click on PROGRAM TERMS
    console.log('Clicking on PROGRAM TERMS tab...');
    const programTermsTab = await page.$('text=PROGRAM TERMS');
    if (programTermsTab) {
      await programTermsTab.click();
      await page.waitForTimeout(2500);
    }

    // Look for Accept button
    console.log('Looking for Accept Offer button...');
    const acceptBtn = await page.$('button:has-text("Accept Offer"), button:has-text("Accept"), a:has-text("Accept Offer"), a:has-text("Accept")');
    if (acceptBtn) {
      await acceptBtn.click();
      console.log('🎉 Successfully clicked Accept Offer button!');
      await page.waitForTimeout(3000);

      // Confirm modal if any
      const confirmBtn = await page.$('.modal button:has-text("Accept"), .modal button:has-text("Confirm"), .modal button:has-text("Agree")');
      if (confirmBtn) {
        await confirmBtn.click();
        console.log('Confirmed modal agreement!');
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('Accept button not found directly, checking page content...');
    }

    await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/after_accept_offer.png') });
  } catch (e) {
    console.error('Error accepting offer:', e.message);
  } finally {
    await browser.close();
  }
}

acceptAllOffers();

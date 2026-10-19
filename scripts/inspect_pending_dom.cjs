const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');

async function testClick() {
  console.log('Connecting to browser to inspect Pending Offers DOM...');
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
    await page.goto('https://members.cj.com/member/7793684/publisher/advertisers/findAdvertisers.cj', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(3000);

    // Select Pending Offers radio
    const pendingRadio = await page.$('input[value="pendingOffers"], input[value="newPendingOffers"], input[id*="pending"]');
    if (pendingRadio) {
      await pendingRadio.click({ force: true });
    } else {
      // Find by label
      await page.click('label:has-text("Pending Offers")');
    }

    const searchBtn = await page.$('button:has-text("SEARCH"), .search-button');
    if (searchBtn) await searchBtn.click();
    await page.waitForTimeout(4000);

    // Check all clickable links inside the result row
    const resultRow = await page.$('div:has-text("7889430"), tr:has-text("7889430"), .advertiser-result');
    if (resultRow) {
      console.log('Found result row for 7889430!');
      const links = await resultRow.$$('a, button');
      console.log(`Found ${links.length} interactive elements in row:`);
      for (let i = 0; i < links.length; i++) {
        const text = (await links[i].textContent())?.trim().replace(/\s+/g, ' ');
        const cls = await links[i].getAttribute('class');
        console.log(`[${i}] Text: "${text}" | Class: "${cls}"`);
      }
    } else {
      console.log('Result row not found on current page view');
    }

    await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/pending_offers_dom.png') });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testClick();

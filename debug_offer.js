const { chromium } = require('playwright');
const fs = require('fs');

async function debugOffer() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    storageState: '/var/www/affiliate/artifacts_admitad/auth_state.json',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/offers/186094/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Final URL:', page.url());
  const title = await page.title();
  console.log('Title:', title);
  
  // Find all buttons on page
  const buttons = await page.$$eval('button, a.btn, a[class*="button"], a[class*="join"]', els => els.map(e => ({ tag: e.tagName, text: e.innerText.trim(), class: e.className })));
  console.log('Buttons found:', JSON.stringify(buttons.slice(0, 15), null, 2));
  
  await page.screenshot({ path: '/var/www/affiliate/artifacts_admitad/debug_admitad_offer.png' });
  await browser.close();
}

debugOffer().catch(console.error);

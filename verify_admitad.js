const { chromium } = require('playwright');
const fs = require('fs');

async function testOffer() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    storageState: '/var/www/affiliate/artifacts_admitad/auth_state.json',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Final URL:', page.url());
  const title = await page.title();
  console.log('Title:', title);
  
  if (page.url().includes('login') || page.url().includes('mitgo')) {
    console.log('❌ Still redirected to login');
  } else {
    console.log('🎉 SUCCESSFULLY AUTHENTICATED IN ADMITAD!');
  }
  await browser.close();
}

testOffer().catch(console.error);

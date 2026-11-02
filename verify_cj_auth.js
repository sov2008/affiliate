const { chromium } = require('playwright');

async function testCJAuth() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    storageState: '/var/www/affiliate/artifacts_admitad/cj_auth_state.json',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  console.log('Navigating to members.cj.com...');
  await page.goto('https://members.cj.com/member/publisher/8102806/advertiserSearch.json?pageNumber=1&pageSize=10', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Final URL:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('Response body:', bodyText.replace(/\n+/g, ' '));

  if (bodyText.includes('advertisers') || bodyText.includes('totalResults')) {
    console.log('🎉 SUCCESSFULLY AUTHENTICATED IN CJ MEMBER PORTAL!');
  } else if (bodyText.includes('authenticationRequired')) {
    console.log('❌ Authentication required');
  } else {
    console.log('Notice: URL response:', page.url());
  }
  await browser.close();
}

testCJAuth().catch(console.error);

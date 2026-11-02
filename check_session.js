const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ storageState: '/var/www/affiliate/artifacts_admitad/cj_auth_state.json' });
  const page = await context.newPage();
  await page.goto('https://members.cj.com/member/publisher/8102806/advertiserSearch.json?pageNumber=1&pageSize=10');
  console.log('URL:', page.url());
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Text snippet:', text.slice(0, 300));
  await browser.close();
}

test().catch(console.error);

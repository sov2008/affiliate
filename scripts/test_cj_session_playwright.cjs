const { chromium } = require('playwright');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');

async function testSession() {
  console.log('Testing CJ session with saved cookies in headless browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext({
      storageState: STATE_FILE,
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    console.log('Navigating to CJ Advertisers Search...');
    await page.goto('https://members.cj.com/member/app/publisher/advertisers/search', {
      waitUntil: 'networkidle',
      timeout: 45000
    });

    console.log('Page loaded! Current URL:', page.url());
    const title = await page.title();
    console.log('Page title:', title);

    // Check if redirected to login
    if (page.url().includes('signin.cj.com')) {
      console.log('❌ Redirected to signin. Session token might need cookie refresh.');
    } else {
      console.log('✅ Authenticated successfully! Finding advertiser cards and apply buttons...');
      await page.waitForTimeout(4000);
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a')).map(b => b.innerText.trim()).filter(t => t.length > 0);
      });
      console.log('Sample UI buttons found:', buttons.slice(0, 15));
    }
  } catch (err) {
    console.error('Test error:', err.message);
  } finally {
    await browser.close();
  }
}

testSession();

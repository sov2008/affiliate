const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.resolve(__dirname, '../artifacts_admitad');
const CJ_DIR = path.resolve(__dirname, '../artifacts_cj');

async function run() {
  console.log('🚀 Запуск браузера Chrome для входа в CJ Affiliate...');
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--start-maximized']
  }).catch(async () => {
    return await chromium.launch({ headless: false, args: ['--start-maximized'] });
  });

  const context = await browser.newContext({
    viewport: null
  });

  const page = await context.newPage();

  try {
    await page.goto('https://members.cj.com/member/publisher/login.cj', { waitUntil: 'domcontentloaded' });

    try {
      const emailInput = await page.waitForSelector('input[type="email"], #username', { timeout: 10000 });
      if (emailInput) {
        await emailInput.fill('sapegin.oleg@gmail.com');
      }
    } catch {}

    console.log('Окно открыто. Пожалуйста, введите пароль и пройдите проверку в открывшемся окне Chrome...');

    await page.waitForURL(url => url.toString().includes('members.cj.com') && !url.toString().includes('login') && !url.toString().includes('signin.cj.com'), { timeout: 300000 });

    console.log('🎉 Успешный вход в личный кабинет CJ!');
    await page.waitForTimeout(3000);

    const cookies = await context.cookies();
    const storageState = await context.storageState();

    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    fs.mkdirSync(CJ_DIR, { recursive: true });

    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'cj_auth_state.json'), JSON.stringify(storageState, null, 2));
    fs.writeFileSync(path.join(CJ_DIR, 'cj_auth_state.json'), JSON.stringify(storageState, null, 2));
    fs.writeFileSync(path.join(CJ_DIR, 'cookies.json'), JSON.stringify(cookies, null, 2));

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05_logged_in_dashboard.png') });
    console.log('✅ Сессия успешно сохранена в artifacts_admitad/cj_auth_state.json!');
  } catch (err) {
    console.log('Время ожидания входа истекло или окно было закрыто:', err.message);
  } finally {
    await browser.close().catch(() => {});
  }
}

run();

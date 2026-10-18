const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ storageState: '/var/www/affiliate/artifacts_admitad/cj_auth_state.json' });
  const page = await context.newPage();
  await page.goto('https://members.cj.com/member/7793684/publisher/advertisers/findAdvertisers.cj', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Switch to "All Advertisers"
  const allRadio = await page.$('input[type="radio"][value="all"], input[name="status"][value="all"], label:has-text("All") input[type="radio"]');
  if (allRadio) await allRadio.click({ force: true });

  const searchBtn = await page.$('button:has-text("SEARCH"), input[value="SEARCH"], #searchBtn, .search-button');
  if (searchBtn) {
    await searchBtn.click();
    await page.waitForTimeout(4000);
  }

  const paginationInfo = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a')).map(el => ({
      tag: el.tagName,
      text: (el.innerText || '').trim(),
      className: el.className,
      id: el.id,
      title: el.getAttribute('title') || '',
      ariaLabel: el.getAttribute('aria-label') || ''
    })).filter(b => /next|previous|[0-9] of [0-9]|page/i.test(b.text || b.ariaLabel || b.title));
    return btns;
  });

  console.log('Pagination buttons found:', JSON.stringify(paginationInfo, null, 2));

  // Also check keywords/search input
  const searchInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="text"], input[type="search"]')).map(el => ({
      id: el.id,
      name: el.name,
      placeholder: el.placeholder,
      className: el.className
    }));
  });

  console.log('Search inputs found:', JSON.stringify(searchInputs, null, 2));

  await browser.close();
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

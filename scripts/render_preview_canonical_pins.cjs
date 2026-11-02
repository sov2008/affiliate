const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TEMPLATE_PATH = path.resolve(__dirname, 'promoradar_pin_canonical_template.html');

const PREVIEW_DATA = [
  {
    store: 'Hostinger',
    slug: 'hostinger',
    headline: '75% OFF + FREE DOMAIN',
    subhead: 'Cloud & Premium Web Hosting • Ultra-fast NVMe & LiteSpeed Architecture',
    code: 'HOSTING75',
    output: path.resolve(__dirname, '../scratch/pins_promoradar/preview_pin_hostinger.png')
  },
  {
    store: 'ExpressVPN',
    slug: 'expressvpn',
    headline: '49% OFF + 3 MO FREE',
    subhead: 'Military-Grade RAM-Only Privacy Across 105 Countries • Trusted Lightway',
    code: 'EXPRESS49',
    output: path.resolve(__dirname, '../scratch/pins_promoradar/preview_pin_expressvpn.png')
  },
  {
    store: 'ALLPOWERS',
    slug: 'allpowers',
    headline: 'EXTRA 12% OFF SITEWIDE',
    subhead: 'Save on Portable Solar Generators & Home Battery Stations • Fast Charging',
    code: 'EXTRA12',
    output: path.resolve(__dirname, '../scratch/pins_promoradar/preview_pin_allpowers.png')
  }
];

async function renderPreviewPins() {
  const rawHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 1
  });

  for (const item of PREVIEW_DATA) {
    console.log(`Rendering canonical pin for ${item.store}...`);
    const filledHtml = rawHtml
      .replace(/{{MERCHANT_NAME}}/g, item.store)
      .replace(/{{MERCHANT_SLUG}}/g, item.slug)
      .replace(/{{HEADLINE_DISCOUNT}}/g, item.headline)
      .replace(/{{HEADLINE_SUBHEAD}}/g, item.subhead)
      .replace(/{{COUPON_CODE}}/g, item.code);

    await page.setContent(filledHtml, { waitUntil: 'networkidle' });
    // Wait for webfonts to load
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const dir = path.dirname(item.output);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await page.screenshot({ path: item.output, type: 'png' });
    console.log(`✅ Saved preview to: ${item.output}`);
  }

  // Create combined comparison preview canvas (3 pins side by side)
  console.log('Rendering 3-in-1 comparison showcase...');
  const combinedPage = await browser.newPage({
    viewport: { width: 3100, height: 1650 },
    deviceScaleFactor: 1
  });

  const showcaseHtml = `<!DOCTYPE html><html><body style="margin:0;background:#05070D;padding:75px 50px;display:flex;justify-content:center;gap:50px;font-family:sans-serif;">
    <div style="box-shadow:0 25px 60px rgba(0,0,0,0.8);border-radius:36px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);"><img src="file://${PREVIEW_DATA[0].output}" style="width:960px;height:1440px;display:block;" /></div>
    <div style="box-shadow:0 25px 60px rgba(0,0,0,0.8);border-radius:36px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);"><img src="file://${PREVIEW_DATA[1].output}" style="width:960px;height:1440px;display:block;" /></div>
    <div style="box-shadow:0 25px 60px rgba(0,0,0,0.8);border-radius:36px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);"><img src="file://${PREVIEW_DATA[2].output}" style="width:960px;height:1440px;display:block;" /></div>
  </body></html>`;

  await combinedPage.setContent(showcaseHtml, { waitUntil: 'load' });
  await combinedPage.waitForTimeout(1000);
  const showcasePath = path.resolve(__dirname, '../scratch/pins_promoradar/canonical_3pins_showcase.png');
  await combinedPage.screenshot({ path: showcasePath, type: 'png' });
  console.log(`📸 Saved 3-in-1 showcase to: ${showcasePath}`);

  await browser.close();
}

renderPreviewPins().catch(console.error);


/**
 * CJ Affiliate Multi-Vertical Mass Applier for PromoRadar
 * Searches across top high-EPC verticals and bulk-submits applications.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');
const LOG_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_mass_applier.log');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');

function log(msg) {
  const line = `[${new Date().toISOString()}] [CJ-MASS-APPLIER] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n', 'utf8'); } catch {}
}

const SEARCH_KEYWORDS = [
  // Privacy & Cybersecurity
  'vpn', 'security', 'antivirus', 'password manager', 'proxy', 'cybersecurity', 'cloud storage', 'backup', 'vpn security',
  // Hosting & Web Infrastructure
  'hosting', 'web hosting', 'domain', 'vps', 'server', 'wordpress', 'website builder', 'ecommerce', 'shopify',
  // Software, AI & Productivity
  'software', 'ai', 'crm', 'marketing', 'email marketing', 'seo', 'accounting', 'invoicing', 'productivity', 'project management',
  // Travel & Accommodation
  'travel', 'hotel', 'flight', 'booking', 'resort', 'car rental', 'vacation', 'cruise', 'tour', 'luggage',
  // Fashion & Apparel
  'clothing', 'apparel', 'shoes', 'fashion', 'beauty', 'skincare', 'jewelry', 'watches', 'luxury', 'streetwear',
  // Electronics & Tech Hardware
  'electronics', 'gadget', 'computer', 'laptop', 'gaming', 'smartphone', 'audio', 'headphones', 'smart home',
  // Health & Wellness
  'fitness', 'supplements', 'gym', 'nutrition', 'vitamins', 'wellness', 'eyewear', 'home',
  // Finance & Online Learning
  'finance', 'insurance', 'trading', 'banking', 'credit', 'cashback', 'education', 'courses'
];

async function run() {
  log('================================================================');
  log('🚀 STARTING MASSIVE CJ MULTI-VERTICAL APPLICATION SWEEP');
  log('================================================================');

  if (!fs.existsSync(STATE_FILE)) {
    log('❌ Storage state not found: ' + STATE_FILE);
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    storageState: STATE_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1600, height: 1000 }
  });

  const page = await context.newPage();
  let grandTotalApplied = 0;

  try {
    log('Navigating to CJ Advertisers directory...');
    await page.goto('https://members.cj.com/member/7793684/publisher/advertisers/findAdvertisers.cj', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(4000);

    // 1. Accept any pending offers first
    const acceptOfferButtons = await page.$$('button:has-text("Accept Offer"), a:has-text("Accept Offer"), button:has-text("Accept Terms"), a:has-text("Accept Terms")');
    if (acceptOfferButtons.length > 0) {
      log(`Found ${acceptOfferButtons.length} pending offer acceptance buttons.`);
      for (const btn of acceptOfferButtons) {
        try {
          await btn.click();
          log('✅ Accepted pending offer/terms!');
          await page.waitForTimeout(1500);
        } catch {}
      }
    }

    // 2. Select "All" radio
    const allRadio = await page.$('input[type="radio"][value="all"], input[name="status"][value="all"], label:has-text("All") input[type="radio"]');
    if (allRadio) {
      await allRadio.click({ force: true });
      log('Selected radio: All Advertisers');
      await page.waitForTimeout(1000);
    }

    // 3. Loop over search keywords to discover all top niche advertisers
    for (const kw of SEARCH_KEYWORDS) {
      log(`\n🔎 [KEYWORD: "${kw.toUpperCase()}"] Searching advertisers...`);

      const kwInput = await page.$('#keyword-search-box, input[name="keyword-search-box"], input[placeholder="Keyword(s)"]');
      if (kwInput) {
        await kwInput.fill('');
        await kwInput.fill(kw);
        await page.waitForTimeout(500);
      }

      const searchBtn = await page.$('button:has-text("SEARCH"), input[value="SEARCH"], #searchBtn, .search-button');
      if (searchBtn) {
        await searchBtn.click();
        await page.waitForTimeout(4000);
      }

      // Find all Apply to Program buttons
      const applyButtons = await page.$$('button:has-text("Apply to Program"), a:has-text("Apply to Program"), .apply-button, [title="Apply to Program"]');
      log(`Found ${applyButtons.length} unapplied advertisers for "${kw}"`);

      let kwApplied = 0;
      for (let i = 0; i < Math.min(applyButtons.length, 30); i++) {
        try {
          const btn = applyButtons[i];
          if (await btn.isVisible()) {
            await btn.scrollIntoViewIfNeeded();
            await btn.click();
            kwApplied++;
            grandTotalApplied++;
            log(`  [${grandTotalApplied}] ✅ Applied to advertiser (Niche: ${kw})`);
            await page.waitForTimeout(1200);

            // Check if terms dialog appeared
            const modalAccept = await page.$('.modal button:has-text("Accept"), .modal button:has-text("Agree"), .modal button:has-text("Apply"), .modal button:has-text("Submit"), .modal button:has-text("Confirm")');
            if (modalAccept && await modalAccept.isVisible()) {
              await modalAccept.click();
              log('  Accepted terms modal.');
              await page.waitForTimeout(1200);
            }
          }
        } catch (err) {
          // ignore individual click fails
        }
      }
      log(`Completed keyword "${kw}": ${kwApplied} applications submitted.`);
    }

    log('================================================================');
    log(`🎉 MASS RUN FINISHED! Total applications submitted to CJ: ${grandTotalApplied}`);
    log('================================================================');

    // Save refreshed storage state
    const freshCookies = await context.cookies();
    const freshState = {
      cookies: freshCookies,
      origins: [
        {
          origin: 'https://members.cj.com',
          localStorage: [
            { name: 'active_company', value: '8102806' },
            { name: 'nav_active_session', value: 'true' }
          ]
        }
      ]
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(freshState, null, 2), 'utf8');

  } catch (err) {
    log(`Mass applier fatal: ${err.message}`);
  } finally {
    await browser.close();
    log('Browser closed.');
  }
}

run();

/**
 * Admitad Mass Connect for PromoRadar (Ad space ID: 3012753)
 * Automatically connects PromoRadar to:
 * 1. Tracking Promocode programs (instant coupon requests)
 * 2. E-commerce & Service programs with instant connection (has_moderation=2)
 * 3. High EPC / Top conversion merchants that allow Coupon traffic
 * 4. Partner Network programs (Awin, Impact, CJ Affiliate, Tradedoubler) via public_partners_programs
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const WEBSITE_ID = '3012753';
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const LOG_FILE = path.resolve(__dirname, '../artifacts_admitad/promoradar_connect.log');
const PARTNERS_FILE = path.resolve(__dirname, '../artifacts_admitad/partner_network_links.json');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch {}
}

async function dismissOverlays(page) {
  try {
    const okayBtn = await page.$('button:has-text("OKAY"), button:has-text("Accept"), button:has-text("Принять"), #cmpwelcomebtnyes');
    if (okayBtn && await okayBtn.isVisible()) {
      await okayBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => {
      const banner = document.getElementById('cmpwrapper');
      if (banner) banner.remove();
      const overlays = document.querySelectorAll('.cmpwrapper');
      overlays.forEach(o => o.remove());
    }).catch(() => {});
  } catch (err) {}
}

async function main() {
  log('================================================================');
  log(`🚀 STARTING ADMITAD MASS CONNECT FOR PROMORADAR (ID: ${WEBSITE_ID})`);
  log('================================================================');

  if (!fs.existsSync(STATE_FILE)) {
    log(`❌ Session state file not found at: ${STATE_FILE}`);
    process.exit(1);
  }

  const launchOpts = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };
  if (process.platform === 'win32' && fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')) {
    launchOpts.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }
  const browser = await chromium.launch(launchOpts);

  try {
    const context = await browser.newContext({ storageState: STATE_FILE, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    let totalConnected = 0;

    // =========================================================================
    // STEP 1: Connect instant no-moderation affiliate programs (has_moderation=2)
    // =========================================================================
    log('📋 STEP 1: Scanning instant programs (has_moderation=2)...');
    
    for (let pageNum = 1; pageNum <= 6; pageNum++) {
      const targetUrl = `https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/catalog/?has_moderation=2&page=${pageNum}`;
      log(`📄 Navigating to instant catalog page ${pageNum}: ${targetUrl}`);
      
      try {
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(3000);
        await dismissOverlays(page);
      } catch (err) {
        log(`⚠️ Navigation warning on page ${pageNum}: ${err.message}`);
        continue;
      }

      // Check how many connect buttons exist
      const connectButtons = page.locator('button.offer-card__cta').filter({ hasText: /подключиться/i });
      const count = await connectButtons.count();
      log(`Found ${count} connectable offers on page ${pageNum}`);

      for (let i = 0; i < count && i < 15; i++) {
        try {
          const btn = page.locator('button.offer-card__cta').filter({ hasText: /подключиться/i }).first();
          if (!(await btn.isVisible())) {
            break;
          }

          // Read offer title if available
          const cardText = await btn.evaluate(el => {
            const card = el.closest('.offer-card, mat-card, .catalog-card') || el.parentElement;
            return card ? card.innerText.split('\n')[0] : 'Offer';
          });

          log(`👉 Connecting to offer: "${cardText}"...`);
          await btn.click({ force: true });
          await page.waitForTimeout(1500);

          // Check if modal dialog appears with "Принять" button
          const dialog = page.locator('[role="dialog"], mat-dialog-container, .modal').first();
          if (await dialog.isVisible()) {
            const acceptBtn = dialog.locator('button:has-text("Принять"), button:has-text("Согласен")').first();
            if (await acceptBtn.isVisible()) {
              await acceptBtn.click({ force: true });
              log(`✅ Rules accepted for: "${cardText}"`);
              totalConnected++;
              await page.waitForTimeout(2000);
            } else {
              // Close modal if can't accept
              const closeBtn = dialog.locator('button[mat-dialog-close], button[aria-label="Close"], button:has-text("Отменить")').first();
              if (await closeBtn.isVisible()) await closeBtn.click({ force: true });
            }
          }
          await page.waitForTimeout(1000);
        } catch (innerErr) {
          log(`Notice while connecting offer ${i}: ${innerErr.message}`);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }
      }
    }

    // =========================================================================
    // STEP 2: Request all tracking promocode programs
    // =========================================================================
    log('🎟️ STEP 2: Connecting tracking promocode programs (tracking_promocode_programs)...');
    
    for (let pageNum = 1; pageNum <= 8; pageNum++) {
      const promoUrl = `https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/catalog/tracking_promocode_programs/?page=${pageNum}`;
      log(`📄 Ingesting promocodes from page ${pageNum}: ${promoUrl}`);

      try {
        await page.goto(promoUrl, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(2500);
        await dismissOverlays(page);
      } catch (err) {
        log(`⚠️ Navigation warning on promo page ${pageNum}: ${err.message}`);
        continue;
      }

      let promoPageProcessed = 0;
      let noProgress = 0;

      while (noProgress < 3 && promoPageProcessed < 15) {
        const hasReqBtn = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, a')).filter(el => {
            const t = (el.innerText || '').trim();
            return t === 'Запросить код' && el.offsetParent !== null;
          });
          if (btns.length === 0) return false;
          btns[0].scrollIntoView({ behavior: 'instant', block: 'center' });
          btns[0].click();
          return true;
        });

        if (!hasReqBtn) {
          log(`No more "Запросить код" buttons on promo page ${pageNum}.`);
          break;
        }

        await page.waitForTimeout(1200);

        // Confirm in dialog
        await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"], mat-dialog-container');
          if (!dialog) return;
          const btn = Array.from(dialog.querySelectorAll('button')).find(b => (b.innerText || '').includes('Запросить код'));
          if (btn) btn.click();
        });
        await page.waitForTimeout(1500);

        // Accept rules
        const accepted = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => {
            const t = (b.innerText || '').trim();
            return t === 'Принять' || t === 'Согласен' || t === 'Подать заявку';
          });
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });

        if (accepted) {
          log(`✅ Promo code successfully requested!`);
          totalConnected++;
          promoPageProcessed++;
          noProgress = 0;
          await page.waitForTimeout(2000);
        } else {
          noProgress++;
        }

        // Close any dangling modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(800);
      }
    }

    // =========================================================================
    // STEP 3: Scan and harvest Partner Networks (Awin, Impact, CJ, etc.)
    // =========================================================================
    log('🌐 STEP 3: Scanning Partner Network Programs (Awin / Impact / CJ)...');
    try {
      const partnersUrl = `https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/catalog/public_partners_programs/`;
      await page.goto(partnersUrl, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(3000);
      await dismissOverlays(page);

      // Extract available partner cards with direct affiliate tracking links
      const partnerOffers = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr, mat-card, .offer-card, .catalog-card'));
        return rows.map(r => {
          const text = r.innerText.trim();
          const titleEl = r.querySelector('a, .name, [class*="title"]') || r;
          const title = (titleEl.innerText || '').split('\n')[0].trim();
          const button = r.querySelector('button');
          const hasBtn = button && (button.innerText || '').includes('Получить ссылку');
          return { title, hasBtn, text: text.replace(/\n+/g, ' | ') };
        }).filter(item => item.hasBtn && item.title.length > 2);
      });

      log(`Found ${partnerOffers.length} available partner network offers on first page.`);
      
      const harvestedPartnerLinks = [];
      // Harvest top 10 partner links (e.g. Trip.com, Airalo, Flixbus, etc.)
      const linkButtons = page.locator('button').filter({ hasText: 'Получить ссылку' });
      const btnsCount = await linkButtons.count();

      for (let bIdx = 0; bIdx < btnsCount && bIdx < 30; bIdx++) {
        try {
          const currentBtn = linkButtons.nth(bIdx);
          await currentBtn.scrollIntoViewIfNeeded();
          await currentBtn.click({ force: true });
          await page.waitForTimeout(1500);

          const dialog = page.locator('[role="dialog"], mat-dialog-container, .modal').first();
          if (await dialog.isVisible()) {
            const dialogText = await dialog.innerText();
            const progMatch = dialogText.match(/Программа:\s*([^\n\r]+)/i);
            const networkMatch = dialogText.match(/Партнерская сеть:\s*([^\n\r]+)/i);
            const input = dialog.locator('input').first();
            
            if (await input.isVisible()) {
              const liveLink = await input.inputValue();
              if (liveLink && liveLink.startsWith('http')) {
                const programName = progMatch ? progMatch[1].trim() : `Partner-${bIdx}`;
                const networkName = networkMatch ? networkMatch[1].trim() : 'Partner Network';
                harvestedPartnerLinks.push({
                  name: programName,
                  network: networkName,
                  goto_link: liveLink
                });
                log(`🎯 Harvested partner program: [${networkName}] "${programName}" -> ${liveLink}`);
                totalConnected++;
              }
            }
            await page.keyboard.press('Escape');
            await page.waitForTimeout(800);
          }
        } catch (linkErr) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(800);
        }
      }

      if (harvestedPartnerLinks.length > 0) {
        fs.writeFileSync(PARTNERS_FILE, JSON.stringify(harvestedPartnerLinks, null, 2));
        log(`💾 Saved ${harvestedPartnerLinks.length} partner network tracking links to ${PARTNERS_FILE}`);
      }

    } catch (partnerErr) {
      log(`⚠️ Partner network scan notice: ${partnerErr.message}`);
    }

    // =========================================================================
    // STEP 4: Mass Apply to High-Conversion Catalog Programs
    // =========================================================================
    log('🛍️ STEP 4: Scanning general catalog for high-demand merchants to apply...');
    for (let pageNum = 1; pageNum <= 5; pageNum++) {
      const catUrl = `https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/catalog/?page=${pageNum}`;
      log(`📄 Catalog page ${pageNum}: ${catUrl}`);
      try {
        await page.goto(catUrl, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(2500);
        await dismissOverlays(page);

        const connectButtons = page.locator('button.offer-card__cta').filter({ hasText: /подключиться/i });
        const count = await connectButtons.count();
        log(`Found ${count} unapplied programs on catalog page ${pageNum}`);

        for (let i = 0; i < count && i < 15; i++) {
          try {
            const btn = page.locator('button.offer-card__cta').filter({ hasText: /подключиться/i }).first();
            if (!(await btn.isVisible())) break;

            const cardTitle = await btn.evaluate(el => {
              const card = el.closest('.offer-card, mat-card, .catalog-card') || el.parentElement;
              return card ? card.innerText.split('\n')[0] : 'Merchant';
            });

            log(`  📝 Submitting application to: "${cardTitle}"...`);
            await btn.click({ force: true });
            await page.waitForTimeout(1500);

            const dialog = page.locator('[role="dialog"], mat-dialog-container, .modal').first();
            if (await dialog.isVisible()) {
              const cb = dialog.locator('input[type="checkbox"]').first();
              if (await cb.isVisible() && !(await cb.isChecked())) {
                await cb.check({ force: true });
                await page.waitForTimeout(500);
              }

              const submitBtn = dialog.locator('button:has-text("Подать заявку"), button:has-text("Принять"), button:has-text("Согласен"), button:has-text("Подключиться")').first();
              if (await submitBtn.isVisible()) {
                await submitBtn.click({ force: true });
                log(`  ✅ Application submitted for: "${cardTitle}"`);
                totalConnected++;
                await page.waitForTimeout(2000);
              } else {
                const cancelBtn = dialog.locator('button:has-text("Отменить"), button[mat-dialog-close]').first();
                if (await cancelBtn.isVisible()) await cancelBtn.click({ force: true });
              }
            }
            await page.waitForTimeout(1000);
          } catch (innerErr) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
          }
        }
      } catch (catErr) {
        log(`Catalog page ${pageNum} warning: ${catErr.message}`);
      }
    }

    log('================================================================');
    log(`🎉 SELECTION RUN COMPLETED! Total programs/promos connected: ${totalConnected}`);
    log('================================================================');

  } catch (err) {
    log(`❌ Fatal error in mass connect: ${err.stack || err.message}`);
  } finally {
    await browser.close();
  }
}

main();

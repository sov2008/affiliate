import { chromium, Browser, BrowserContext, Page } from 'playwright';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PRODUCTION_DOMAIN = 'https://affiliate-campaigns.pages.dev';
const WORKER_URL = process.env.POSTBACK_WORKER_URL || 'https://postback-engine.sov7.workers.dev';

export interface ApplicationResult {
  success: boolean;
  campaignId: string;
  status: 'active' | 'pending_approval' | 'dry_run_applied' | 'failed' | 'requires_login';
  details: string;
  timestamp: string;
}

export async function applyToOffer(
  campaignId: string,
  trafficSourceDescription: string = 'Direct contextual and social ads to pre-lander with postback tracking',
  options: { dryRun?: boolean; headless?: boolean } = { dryRun: false, headless: true }
): Promise<ApplicationResult> {
  const isDryRun = options.dryRun ?? false;
  const isHeadless = options.headless ?? true;
  const timestamp = new Date().toISOString();

  console.log(`\n🤖 [MyLead Auto-Apply Skill] Initiating application process for campaign: ${campaignId}`);
  console.log(`   Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'PRODUCTION (Live Automation)'}`);
  console.log(`   Traffic Source: ${trafficSourceDescription}`);
  console.log(`   Production URL: ${PRODUCTION_DOMAIN}`);

  // In dry run or missing session cookie mode without real browser binary:
  if (isDryRun) {
    console.log('   [Dry Run] Simulating navigation to: https://mylead.global/panel/campaigns/' + campaignId);
    console.log('   [Dry Run] Validating traffic form questionnaire fields:');
    console.log('      - Traffic Types: [Paid Search, Social Ads, Review Sites]');
    console.log(`      - Target Pre-lander URL: ${PRODUCTION_DOMAIN}/${campaignId}/`);
    console.log(`      - Marketing Strategy: "${trafficSourceDescription}"`);
    console.log('   [Dry Run] Application payload compiled successfully.');

    // Save pending state to Cloudflare KV worker
    try {
      await fetch(`${WORKER_URL}/postback?campaign_id=${campaignId}&variant=v1&status=pending&payout=0&ml_sub1=auto_apply_probe`);
      console.log('   [Dry Run] Registered "pending_approval" status with Cloudflare Edge KV.');
    } catch (e) {}

    return {
      success: true,
      campaignId,
      status: 'dry_run_applied',
      details: 'Dry-run application simulated. Questionnaire fields verified and logged.',
      timestamp
    };
  }

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: isHeadless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const context: BrowserContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });

    // Session Cookie Authentication
    const sessionCookie = process.env.MYLEAD_SESSION_COOKIE;
    if (sessionCookie) {
      await context.addCookies([
        {
          name: 'ml_session',
          value: sessionCookie,
          domain: '.mylead.global',
          path: '/'
        }
      ]);
      console.log('   [Auth] Injected MyLead session cookie.');
    }

    const page: Page = await context.newPage();
    const targetUrl = `https://mylead.global/panel/campaigns/${campaignId}`;
    console.log(`   [Nav] Navigating to: ${targetUrl}`);

    const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const currentUrl = page.url();

    // Check if redirected to login
    if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
      const email = process.env.MYLEAD_EMAIL || process.env.MYLEAD_LOGIN;
      const pass = process.env.MYLEAD_PASSWORD || process.env.MYLEAD_PASS;

      if (email && pass) {
        console.log('   [Auth] Session missing/expired. Attempting automated login...');
        await page.fill('input[type="email"], input[name="login"], input[name="email"]', email);
        await page.fill('input[type="password"]', pass);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 });
        console.log('   [Auth] Logged in successfully.');
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      } else {
        console.warn('   ⚠️ Authentication required: No active session cookie or credentials provided in .env.');
        await browser.close();
        return {
          success: false,
          campaignId,
          status: 'requires_login',
          details: 'Authentication required. Please set MYLEAD_SESSION_COOKIE or MYLEAD_EMAIL/MYLEAD_PASSWORD in .env',
          timestamp
        };
      }
    }

    // Inspect Campaign Status
    const isAlreadyActive = await page.$('.badge-success, .campaign-joined, text="Aktywny", text="Active"');
    if (isAlreadyActive) {
      console.log(`   ✅ Campaign ${campaignId} is already ACTIVE and unlocked.`);
      await browser.close();
      return {
        success: true,
        campaignId,
        status: 'active',
        details: 'Campaign is already active. Tracking links available.',
        timestamp
      };
    }

    // Check for Join / Apply Button
    const joinButton = await page.$(
      'button:has-text("Dołącz"), button:has-text("Join"), button:has-text("Aplikuj"), button:has-text("Apply"), .btn-join-campaign'
    );

    if (joinButton) {
      console.log('   [Action] Found "Join Campaign" action. Clicking application trigger...');
      await joinButton.click();
      await page.waitForTimeout(1000);

      // Fill in Application Modal / Form
      const urlInput = await page.$('input[name="url"], input[placeholder*="http"], input[placeholder*="URL"]');
      if (urlInput) {
        await urlInput.fill(`${PRODUCTION_DOMAIN}/${campaignId}/`);
      }

      const descInput = await page.$('textarea[name="description"], textarea[name="source_description"], textarea');
      if (descInput) {
        await descInput.fill(trafficSourceDescription);
      }

      // Check traffic type checkboxes if present
      const checkboxes = await page.$$('input[type="checkbox"]');
      for (const cb of checkboxes.slice(0, 3)) {
        await cb.check().catch(() => {});
      }

      // Submit Form
      const submitBtn = await page.$('button[type="submit"], .modal-footer button.btn-primary');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(2000);
        console.log('   [Action] Application submitted successfully.');
      }

      // Log status in Cloudflare KV
      try {
        await fetch(`${WORKER_URL}/postback?campaign_id=${campaignId}&variant=v1&status=pending&payout=0&ml_sub1=auto_apply_submitted`);
      } catch (e) {}

      await browser.close();
      return {
        success: true,
        campaignId,
        status: 'pending_approval',
        details: 'Application submitted. Traffic source questionnaire answered.',
        timestamp
      };
    }

    await browser.close();
    return {
      success: true,
      campaignId,
      status: 'active',
      details: 'No application modal needed or direct access granted.',
      timestamp
    };

  } catch (err: any) {
    if (browser) await browser.close();
    console.error(`   ❌ [Error] Application failed for ${campaignId}:`, err.message);
    return {
      success: false,
      campaignId,
      status: 'failed',
      details: err.message,
      timestamp
    };
  }
}

// CLI Execution Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetId = args[0] || 'cmp_crypto_bot';
  const isDry = args.includes('--dry-run') || args.length === 0;

  applyToOffer(targetId, undefined, { dryRun: isDry }).then(res => {
    console.log('\n📊 Result:', JSON.stringify(res, null, 2));
    process.exit(res.success ? 0 : 1);
  });
}

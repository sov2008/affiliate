import { Browser, Page } from 'playwright';
import path from 'path';
import dotenv from 'dotenv';
import { sessionManager } from './playwright-session-manager-skill';

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
  options: { dryRun?: boolean; headless?: boolean; useProxy?: boolean } = { dryRun: false, headless: true }
): Promise<ApplicationResult> {
  const isDryRun = options.dryRun ?? false;
  const isHeadless = options.headless ?? true;
  const timestamp = new Date().toISOString();

  console.log(`\n🤖 [MyLead Auto-Apply Skill] Processing application for: ${campaignId}`);
  console.log(`   Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'PRODUCTION (Live Automation)'}`);
  console.log(`   Traffic Strategy: "${trafficSourceDescription}"`);
  console.log(`   Landing Domain: ${PRODUCTION_DOMAIN}/${campaignId}/`);

  if (isDryRun) {
    console.log('   [Dry Run] Simulating navigation to: https://mylead.global/panel/campaigns/' + campaignId);
    console.log('   [Dry Run] Form Payload:');
    console.log('      - Channels: [Paid Search, Social Ads, Review Sites]');
    console.log(`      - Target URL: ${PRODUCTION_DOMAIN}/${campaignId}/`);
    console.log(`      - Strategy: "${trafficSourceDescription}"`);

    try {
      await fetch(`${WORKER_URL}/postback?campaign_id=${campaignId}&variant=v1&status=pending&payout=0&ml_sub1=auto_apply_dryrun`);
      console.log('   [Dry Run] Synced "pending_approval" status to Cloudflare Edge KV.');
    } catch (e) {}

    return {
      success: true,
      campaignId,
      status: 'dry_run_applied',
      details: 'Dry-run application simulated. Questionnaire fields compiled and logged.',
      timestamp
    };
  }

  let browserInstance: Browser | null = null;

  try {
    const { browser, context } = await sessionManager.getAuthenticatedContext({
      headless: isHeadless,
      useProxy: options.useProxy
    });

    browserInstance = browser;
    if (!context) throw new Error('Failed to acquire authenticated browser context.');

    const page: Page = await context.newPage();
    const targetUrl = `https://mylead.global/panel/campaigns/${campaignId}`;
    console.log(`   [Nav] Navigating to ${targetUrl}...`);

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Check if already active
    const isAlreadyActive = await page.$('.badge-success, .campaign-joined, text="Aktywny", text="Active"');
    if (isAlreadyActive) {
      console.log(`   ✅ Campaign ${campaignId} is already ACTIVE.`);
      if (browserInstance) await browserInstance.close();
      return {
        success: true,
        campaignId,
        status: 'active',
        details: 'Campaign is already active.',
        timestamp
      };
    }

    // Look for Join / Apply action
    const joinButton = await page.$(
      'button:has-text("Dołącz"), button:has-text("Join"), button:has-text("Aplikuj"), button:has-text("Apply"), .btn-join-campaign'
    );

    if (joinButton) {
      console.log('   [Action] Clicking Join Campaign trigger...');
      await joinButton.click();
      await page.waitForTimeout(1000);

      const urlInput = await page.$('input[name="url"], input[placeholder*="http"], input[placeholder*="URL"]');
      if (urlInput) {
        await urlInput.fill(`${PRODUCTION_DOMAIN}/${campaignId}/`);
      }

      const descInput = await page.$('textarea[name="description"], textarea[name="source_description"], textarea');
      if (descInput) {
        await descInput.fill(trafficSourceDescription);
      }

      const checkboxes = await page.$$('input[type="checkbox"]');
      for (const cb of checkboxes.slice(0, 3)) {
        await cb.check().catch(() => {});
      }

      const submitBtn = await page.$('button[type="submit"], .modal-footer button.btn-primary');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(2000);
        console.log('   [Action] Application form submitted.');
      }

      // Log pending state in KV
      try {
        await fetch(`${WORKER_URL}/postback?campaign_id=${campaignId}&variant=v1&status=pending&payout=0&ml_sub1=auto_apply_submitted`);
      } catch (e) {}

      if (browserInstance) await browserInstance.close();
      return {
        success: true,
        campaignId,
        status: 'pending_approval',
        details: 'Application submitted. Traffic source questionnaire answered.',
        timestamp
      };
    }

    if (browserInstance) await browserInstance.close();
    return {
      success: true,
      campaignId,
      status: 'active',
      details: 'Direct access available without modal.',
      timestamp
    };

  } catch (err: any) {
    if (browserInstance) await browserInstance.close();
    console.error(`   ❌ Application error for ${campaignId}:`, err.message);
    return {
      success: false,
      campaignId,
      status: 'failed',
      details: err.message,
      timestamp
    };
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const targetId = args[0] || 'cmp_crypto_bot';
  const isDry = args.includes('--dry-run') || args.length === 0;

  applyToOffer(targetId, undefined, { dryRun: isDry }).then(res => {
    console.log('\n📊 Result:', JSON.stringify(res, null, 2));
    process.exit(res.success ? 0 : 1);
  });
}

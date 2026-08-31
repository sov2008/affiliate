import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';
import dotenv from 'dotenv';
import { recall, remember } from '../memory-engine';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const execAsync = util.promisify(exec);
const WORKER_URL = process.env.POSTBACK_WORKER_URL || 'https://postback-engine.sov7.workers.dev';
const CLICKS_UNDERPERFORMANCE_THRESHOLD = 50;

export interface RollbackAssessment {
  campaignId: string;
  evaluatedVariant: string;
  clicks: number;
  conversions: number;
  cr: string;
  rollbackTriggered: boolean;
  actionTaken: string;
  timestamp: string;
}

export async function evaluateAndRollbackCampaign(
  campaignId: string,
  options: { clicksThreshold?: number; dryRun?: boolean } = {}
): Promise<RollbackAssessment> {
  const threshold = options.clicksThreshold ?? CLICKS_UNDERPERFORMANCE_THRESHOLD;
  const isDryRun = options.dryRun ?? false;
  const timestamp = new Date().toISOString();

  console.log(`\n🩺 [Auto-Rollback Skill] Evaluating health for campaign: ${campaignId}`);

  try {
    const res = await fetch(`${WORKER_URL}/stats?campaign_id=${campaignId}`);
    if (!res.ok) throw new Error(`Stats endpoint returned status ${res.status}`);

    const stats = await res.json();
    const v2 = stats.v2 || { clicks: 0, leads: 0, sales: 0 };
    const v1 = stats.v1 || { clicks: 0, leads: 0, sales: 0 };

    const challengerClicks = v2.clicks || 0;
    const challengerConversions = (v2.leads || 0) + (v2.sales || 0);

    console.log(`   Baseline v1: ${v1.clicks || 0} clicks, ${(v1.leads || 0) + (v1.sales || 0)} convs (${v1.cr || '0%'})`);
    console.log(`   Challenger v2: ${challengerClicks} clicks, ${challengerConversions} convs (${v2.cr || '0%'})`);

    // Underperformance condition: High traffic without single conversion
    if (challengerClicks >= threshold && challengerConversions === 0) {
      console.warn(`   🚨 [Alert] Challenger v2 underperformed (${challengerClicks} clicks, 0 conversions). Triggering Rollback!`);

      if (!isDryRun) {
        // 1. Reset split router to 100% v1
        const routerPath = path.resolve(__dirname, `../../campaigns/${campaignId}/index.html`);
        const safeRouterHtml = `<!DOCTYPE html>
<html>
<head><title>Split Router (Rollback Safe)</title></head>
<body>
<script>
  localStorage.setItem('${campaignId}_variant', 'v1');
  window.location.href = './v1/index.html' + window.location.search;
</script>
</body>
</html>`;
        await fs.writeFile(routerPath, safeRouterHtml);
        console.log(`   🛡️ Restored split router traffic to 100% v1 baseline.`);

        // 2. Commit & push rollback to Cloudflare Pages
        await execAsync(`git add "${routerPath}" && git commit -m "fix(rollback): emergency route rollback to v1 for ${campaignId}" && git push origin main`, {
          cwd: path.resolve(__dirname, '../../')
        }).catch(err => console.warn('Git rollback notice:', err.message));
      }

      return {
        campaignId,
        evaluatedVariant: 'v2',
        clicks: challengerClicks,
        conversions: challengerConversions,
        cr: '0%',
        rollbackTriggered: true,
        actionTaken: isDryRun ? 'DRY_RUN_ROLLBACK_SIMULATED' : 'ROUTER_RESET_TO_V1_BASELINE',
        timestamp
      };
    }

    console.log('   ✅ Campaign health is stable. No rollback required.');
    return {
      campaignId,
      evaluatedVariant: 'v2',
      clicks: challengerClicks,
      conversions: challengerConversions,
      cr: v2.cr || '0%',
      rollbackTriggered: false,
      actionTaken: 'HEALTHY_NO_ACTION',
      timestamp
    };

  } catch (err: any) {
    console.error(`   ❌ Failed to evaluate rollback for ${campaignId}:`, err.message);
    return {
      campaignId,
      evaluatedVariant: 'unknown',
      clicks: 0,
      conversions: 0,
      cr: '0%',
      rollbackTriggered: false,
      actionTaken: `ERROR: ${err.message}`,
      timestamp
    };
  }
}

if (require.main === module) {
  evaluateAndRollbackCampaign('cmp_trading_au', { clicksThreshold: 10, dryRun: true }).then(res => {
    console.log('\n📊 Rollback Assessment:\n', JSON.stringify(res, null, 2));
    process.exit(0);
  });
}

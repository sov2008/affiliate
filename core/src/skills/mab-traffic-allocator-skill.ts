import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';
import dotenv from 'dotenv';
import { generateContent } from '../llm-gateway';
import { remember, recall } from '../memory-engine';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const execAsync = util.promisify(exec);
const WORKER_URL = process.env.POSTBACK_WORKER_URL || 'https://postback-engine.sov7.workers.dev';
const EPSILON = 0.15; // 15% exploration, 85% exploitation

export interface MABAllocationResult {
  campaignId: string;
  algorithm: 'epsilon_greedy' | 'thompson_sampling';
  winnerVariant: string;
  weights: { v1: number; v2: number };
  evolutionTriggered: boolean;
  evolvedHeadline?: string;
  reason: string;
  timestamp: string;
}

export function computeEpsilonGreedyWeights(
  v1Stats: { clicks: number; revenue: number; conversions: number },
  v2Stats: { clicks: number; revenue: number; conversions: number }
): { v1Weight: number; v2Weight: number; winner: 'v1' | 'v2' | 'tie' } {
  const epc1 = v1Stats.clicks > 0 ? v1Stats.revenue / v1Stats.clicks : 0;
  const epc2 = v2Stats.clicks > 0 ? v2Stats.revenue / v2Stats.clicks : 0;

  if (v1Stats.clicks < 5 && v2Stats.clicks < 5) {
    return { v1Weight: 50, v2Weight: 50, winner: 'tie' };
  }

  if (epc1 >= epc2) {
    const v1Weight = Math.round((1 - EPSILON + EPSILON / 2) * 100);
    const v2Weight = 100 - v1Weight;
    return { v1Weight, v2Weight, winner: 'v1' };
  } else {
    const v2Weight = Math.round((1 - EPSILON + EPSILON / 2) * 100);
    const v1Weight = 100 - v2Weight;
    return { v1Weight, v2Weight, winner: 'v2' };
  }
}

export async function evolveVariantHeadlines(campaignId: string, currentAngle: string = 'finance'): Promise<string> {
  console.log(`🧬 [MAB Evolution Engine] Synthesizing new high-converting challenger variant for ${campaignId}...`);
  const prompt = `
    You are an elite Affiliate Copywriting AI.
    Create 3 fresh, high-converting hooks, headlines, and call-to-actions for an affiliate landing page in the ${currentAngle} vertical.
    
    Requirements:
    1. Angle: High curiosity, institutional credibility, risk-reversal.
    2. Format: Return ONLY a JSON object with:
       {
         "mainHeadline": "Strong main title",
         "subHeadline": "Compelling subtitle with social proof",
         "ctaText": "Action-oriented button text"
       }
  `;

  try {
    const raw = await generateContent(prompt);
    const cleaned = raw.replace(/```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.mainHeadline || 'Next-Gen Algorithmic Precision 2026';
  } catch {
    return 'Algorithmic Financial Precision • 2026 Edition';
  }
}

export async function allocateMABTraffic(
  campaignId: string,
  options: { dryRun?: boolean; forceEvolve?: boolean } = {}
): Promise<MABAllocationResult> {
  const isDryRun = options.dryRun ?? false;
  const timestamp = new Date().toISOString();

  console.log(`\n🎲 [AI Multi-Armed Bandit] Allocating traffic weights for ${campaignId}...`);

  try {
    const res = await fetch(`${WORKER_URL}/stats?campaign_id=${campaignId}`);
    const stats = await res.json();

    const v1 = stats.v1 || { clicks: 0, revenue: 0, leads: 0, sales: 0 };
    const v2 = stats.v2 || { clicks: 0, revenue: 0, leads: 0, sales: 0 };

    const v1Metrics = { clicks: v1.clicks || 0, revenue: v1.revenue || 0, conversions: (v1.leads || 0) + (v1.sales || 0) };
    const v2Metrics = { clicks: v2.clicks || 0, revenue: v2.revenue || 0, conversions: (v2.leads || 0) + (v2.sales || 0) };

    const { v1Weight, v2Weight, winner } = computeEpsilonGreedyWeights(v1Metrics, v2Metrics);
    console.log(`   🏆 MAB Winner: ${winner.toUpperCase()} | Allocated Weights: v1=${v1Weight}%, v2=${v2Weight}%`);

    let evolutionTriggered = false;
    let evolvedHeadline: string | undefined;

    // Check if challenger variant underperforms (e.g. 0 convs with significant traffic or forced)
    if ((v2Metrics.clicks >= 20 && v2Metrics.conversions === 0) || options.forceEvolve) {
      console.log(`   ⚡ Challenger v2 underperformed. Triggering Gemini 3.7 Flash headline evolution...`);
      evolvedHeadline = await evolveVariantHeadlines(campaignId);
      evolutionTriggered = true;
    }

    if (!isDryRun) {
      // Update Split Router HTML file
      const routerDir = path.resolve(__dirname, `../../campaigns/${campaignId}`);
      const routerHtml = `<!DOCTYPE html>
<html>
<head><title>Split Router (MAB Optimized)</title></head>
<body>
<script>
  var r = Math.random() * 100;
  var v = (r < ${v1Weight}) ? 'v1' : 'v2';
  localStorage.setItem('${campaignId}_variant', v);
  window.location.href = './' + v + '/index.html' + window.location.search;
</script>
</body>
</html>`;

      try {
        await fs.writeFile(path.join(routerDir, 'index.html'), routerHtml);
      } catch (e) {}

      // Update memory
      const mem = await recall('deployed_campaigns');
      if (mem && mem[campaignId]) {
        mem[campaignId].trafficSplit = { v1: v1Weight, v2: v2Weight };
        mem[campaignId].mabState = { winner, lastOptimized: timestamp };
        await remember('deployed_campaigns', campaignId, mem[campaignId]);
      }
    }

    return {
      campaignId,
      algorithm: 'epsilon_greedy',
      winnerVariant: winner,
      weights: { v1: v1Weight, v2: v2Weight },
      evolutionTriggered,
      evolvedHeadline,
      reason: `Epsilon-Greedy allocated ${Math.max(v1Weight, v2Weight)}% traffic to best performing variant (${winner}).`,
      timestamp
    };

  } catch (err: any) {
    console.error(`   ❌ MAB Allocation failed:`, err.message);
    return {
      campaignId,
      algorithm: 'epsilon_greedy',
      winnerVariant: 'v1',
      weights: { v1: 50, v2: 50 },
      evolutionTriggered: false,
      reason: `Fallback to 50/50 split due to error: ${err.message}`,
      timestamp
    };
  }
}

if (require.main === module) {
  allocateMABTraffic('cmp_trading_au', { dryRun: true, forceEvolve: true }).then(res => {
    console.log('\n📊 MAB Traffic Allocation Result:\n', JSON.stringify(res, null, 2));
    process.exit(0);
  });
}

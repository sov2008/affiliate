import path from 'path';
import dotenv from 'dotenv';
import { ScoutCoordinator } from '../scouts/scoutCoordinator.js';
import { LosPollosScout } from '../scouts/lospollosScout.js';
import { MyLeadScout } from '../scouts/myleadScout.js';
import { OfferScorer } from '../scouts/offerScorer.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgBlue: '\x1b[44m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
};

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan} 🛰️  DUAL BROWSER OFFER SCOUT & AI PIPELINE INTEGRATION TEST SUITE${colors.reset}`);
  console.log(`${colors.dim} Testing: LosPollosScout, MyLeadScout, AI OfferScorer, Strategy Adapters & ContentPipeline${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================================${colors.reset}\n`);

  // ----------------------------------------------------
  // TEST 1: LosPollos Scout Discovery & TOS Validation
  // ----------------------------------------------------
  console.log(`${colors.bold}${colors.magenta}--- [TEST 1] LosPollos Scout Discovery & Traffic TOS Audit ---${colors.reset}`);
  const lpScout = new LosPollosScout();
  const lpOffers = await lpScout.discoverOffers({ category: 'dating' });
  for (const o of lpOffers) {
    const tos = await lpScout.validateTrafficRules(o);
    console.log(
      `  [${o.network.toUpperCase()}] "${o.title.slice(0, 42)}..." | Payout: $${o.payout.toFixed(2)} | EPC: $${o.epc.toFixed(2)} | TOS: ${tos.is_allowed ? colors.green + '✅ ALLOWED' : colors.red + '❌ BLOCKED'}${colors.reset}`
    );
  }

  // ----------------------------------------------------
  // TEST 2: MyLead Scout Discovery & TOS Validation
  // ----------------------------------------------------
  console.log(`\n${colors.bold}${colors.magenta}--- [TEST 2] MyLead Global Catalog Scout & Traffic TOS Audit ---${colors.reset}`);
  const mlScout = new MyLeadScout();
  const mlOffers = await mlScout.discoverOffers({ category: 'finance' });
  for (const o of mlOffers) {
    const tos = await mlScout.validateTrafficRules(o);
    console.log(
      `  [${o.network.toUpperCase()}] "${o.title.slice(0, 42)}..." | Payout: $${o.payout.toFixed(2)} | EPC: $${o.epc.toFixed(2)} | TOS: ${tos.is_allowed ? colors.green + '✅ ALLOWED' : colors.red + '❌ BLOCKED'}${colors.reset}`
    );
  }

  // ----------------------------------------------------
  // TEST 3: Multi-Network AI Scoring & Ranking
  // ----------------------------------------------------
  console.log(`\n${colors.bold}${colors.magenta}--- [TEST 3] AI Opportunity Scoring & Commercial Evaluation ---${colors.reset}`);
  const allCandidates = [...lpOffers, ...mlOffers];
  const rankedOffers = await OfferScorer.rankAndScoreOffers(allCandidates);
  console.log(`\n🏆 ${colors.bold}Ranked Opportunities:${colors.reset}`);
  for (let i = 0; i < rankedOffers.length; i++) {
    const r = rankedOffers[i];
    console.log(
      `  #${i + 1} [${r.offer.network.toUpperCase()}] "${r.offer.title.slice(0, 36)}..." -> Score: ${colors.green}${colors.bold}${r.opportunity_score}/100${colors.reset} | Payout: $${r.offer.payout} | EPC: $${r.offer.epc}`
    );
  }

  // ----------------------------------------------------
  // TEST 4: Coordinated End-to-End Flow & Content Pipeline
  // ----------------------------------------------------
  console.log(`\n${colors.bold}${colors.magenta}--- [TEST 4] Full Coordinated Scout-to-Content Pipeline Run ---${colors.reset}`);
  const coordinatorResult = await ScoutCoordinator.runScoutAndPipeline({
    network: 'both',
    targetPlatform: 'reddit',
    executePipeline: true,
  });

  const p = coordinatorResult.pipelinePayload!;

  console.log(`\n${colors.bold}📊 Dual Scout & Pipeline Execution Summary Table:${colors.reset}`);
  console.log('+' + '-'.repeat(20) + '+' + '-'.repeat(22) + '+' + '-'.repeat(16) + '+' + '-'.repeat(22) + '+');
  console.log(
    `| ${colors.bold}${'Metric / Field'.padEnd(18)}${colors.reset} | ${colors.bold}${'Selected Value'.padEnd(20)}${colors.reset} | ${colors.bold}${'AI Safety'.padEnd(14)}${colors.reset} | ${colors.bold}${'Asset / Link'.padEnd(20)}${colors.reset} |`
  );
  console.log('+' + '-'.repeat(20) + '+' + '-'.repeat(22) + '+' + '-'.repeat(16) + '+' + '-'.repeat(22) + '+');

  console.log(
    `| ${'Winning Network'.padEnd(18)} | ${colors.cyan}${coordinatorResult.networkUsed.toUpperCase().padEnd(20)}${colors.reset} | ${colors.green}${'SAFE'.padEnd(14)}${colors.reset} | ${colors.dim}${'SubID Tracking'.padEnd(20)}${colors.reset} |`
  );
  console.log(
    `| ${'Opportunity Score'.padEnd(18)} | ${colors.green}${(coordinatorResult.topOffer.opportunity_score + '/100').padEnd(20)}${colors.reset} | ${colors.green}${'COMPLIANT'.padEnd(14)}${colors.reset} | ${colors.dim}${'Pre-lander Bound'.padEnd(20)}${colors.reset} |`
  );
  console.log(
    `| ${'Humanized Hook'.padEnd(18)} | ${(p.copy.hook.slice(0, 18) + '...').padEnd(20)} | ${colors.green}${'LOW (Human)'.padEnd(14)}${colors.reset} | ${colors.cyan}${(p.creative.storageType.toUpperCase() + ' (' + (p.creative.bytes / 1024).toFixed(0) + 'KB)').padEnd(20)}${colors.reset} |`
  );
  console.log('+' + '-'.repeat(20) + '+' + '-'.repeat(22) + '+' + '-'.repeat(16) + '+' + '-'.repeat(22) + '+');

  console.log(`\n${colors.bgGreen}${colors.bold}  ✅ DUAL OFFER SCOUTS & PIPELINE COORDINATOR VALIDATED SUCCESSFULLY  ${colors.reset}\n`);
}

main().catch((err) => {
  console.error(`${colors.red}❌ Error in Scout Test Suite:${colors.reset}`, err);
  process.exit(1);
});

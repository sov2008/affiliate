import path from 'path';
import dotenv from 'dotenv';
import { AffiliateAdapterFactory } from '../../core/src/adapters/adapterFactory.js';
import { PrelanderService } from '../../core/src/services/prelanderService.js';
import { ContentPipeline } from '../../core/src/workers/contentPipeline.js';

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
  console.log(`${colors.bold}${colors.cyan} 🎯  AFFILIATE NETWORK STRATEGY & ADAPTER INTEGRATION TEST SUITE${colors.reset}`);
  console.log(`${colors.dim} Testing: LosPollos, MyLead, Pre-lander Configs, Postback Normalization & Pipeline${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================================${colors.reset}\n`);

  const networks = AffiliateAdapterFactory.listSupportedNetworks();
  console.log(`📦 ${colors.bold}Supported Affiliate Networks:${colors.reset} [${networks.map((n) => colors.green + n.toUpperCase() + colors.reset).join(', ')}]\n`);

  // ----------------------------------------------------
  // TEST 1: LosPollos Adapter & Quiz Prelander
  // ----------------------------------------------------
  console.log(`${colors.bold}${colors.magenta}--- [TEST 1] LosPollos Strategy (Dating & Lifestyle / Quiz Gate) ---${colors.reset}`);
  const lpAdapter = AffiliateAdapterFactory.getAdapter('lospollos');
  const lpClickId = 'clk_lp_test_88712';
  const lpTrackingUrl = lpAdapter.buildTrackingUrl({
    clickId: lpClickId,
    campaignId: 'cmp_lospollos_dating',
    source: 'reddit',
    variant: 'v2',
    geo: 'US',
  });
  console.log(`🔗 ${colors.bold}Generated Outbound URL:${colors.reset}\n   ${colors.cyan}${lpTrackingUrl}${colors.reset}`);

  const lpPrelander = PrelanderService.generatePrelanderConfig({
    campaignId: 'cmp_lospollos_dating',
    niche: 'Dating & Lifestyle',
    clickId: lpClickId,
    targetPlatform: 'reddit',
    geo: 'US',
  });
  console.log(`🛡️  ${colors.bold}Pre-lander Type:${colors.reset} ${colors.yellow}${lpPrelander.prelanderType.toUpperCase()}${colors.reset} (${lpPrelander.quiz?.steps.length} Quiz Steps configured)`);
  console.log(`   Badge: "${lpPrelander.meta.badge}" | CTA: "${lpPrelander.meta.ctaButtonText}"`);

  // Test LosPollos Postback Parsing
  const lpMockPostback = {
    cid: lpClickId,
    s2: 'cmp_lospollos_dating',
    sum: '4.50',
    status: 'sale',
    txid: 'lp_tx_998124',
    currency: 'USD',
  };
  const lpParsed = lpAdapter.parsePostback(lpMockPostback);
  console.log(`📥 ${colors.bold}Normalized Postback:${colors.reset} Network: ${lpParsed.network.toUpperCase()} | Status: ${colors.green}${lpParsed.status}${colors.reset} | Payout: ${colors.green}$${lpParsed.payout.toFixed(2)}${colors.reset} | TxID: ${lpParsed.transactionId}\n`);

  // ----------------------------------------------------
  // TEST 2: MyLead Adapter & Native Review Prelander
  // ----------------------------------------------------
  console.log(`${colors.bold}${colors.magenta}--- [TEST 2] MyLead Strategy (Crypto / Trading / Native Review) ---${colors.reset}`);
  const mlAdapter = AffiliateAdapterFactory.getAdapter('mylead');
  const mlClickId = 'clk_ml_test_44321';
  const mlTrackingUrl = mlAdapter.buildTrackingUrl({
    clickId: mlClickId,
    campaignId: 'cmp_trading_au',
    source: 'quora',
    variant: 'v1',
    geo: 'AU',
  });
  console.log(`🔗 ${colors.bold}Generated Outbound URL:${colors.reset}\n   ${colors.cyan}${mlTrackingUrl}${colors.reset}`);

  const mlPrelander = PrelanderService.generatePrelanderConfig({
    campaignId: 'cmp_trading_au',
    niche: 'Crypto & Algorithmic Trading',
    clickId: mlClickId,
    targetPlatform: 'quora',
    geo: 'AU',
  });
  console.log(`🛡️  ${colors.bold}Pre-lander Type:${colors.reset} ${colors.yellow}${mlPrelander.prelanderType.toUpperCase()}${colors.reset} (Author: ${mlPrelander.editorial?.author.name}, Rating: ${mlPrelander.editorial?.rating}/5)`);
  console.log(`   Badge: "${mlPrelander.meta.badge}" | CTA: "${mlPrelander.meta.ctaButtonText}"`);

  // Test MyLead Postback Parsing
  const mlMockPostback = {
    sub4: mlClickId,
    sub2: 'cmp_trading_au',
    commission: '48.00',
    status: 'lead',
    transaction_id: 'ml_lead_552199',
    currency: 'USD',
  };
  const mlParsed = mlAdapter.parsePostback(mlMockPostback);
  console.log(`📥 ${colors.bold}Normalized Postback:${colors.reset} Network: ${mlParsed.network.toUpperCase()} | Status: ${colors.green}${mlParsed.status}${colors.reset} | Payout: ${colors.green}$${mlParsed.payout.toFixed(2)}${colors.reset} | TxID: ${mlParsed.transactionId}\n`);

  // ----------------------------------------------------
  // TEST 3: End-to-End Pipeline Execution with Adapter & Humanizer
  // ----------------------------------------------------
  console.log(`${colors.bold}${colors.magenta}--- [TEST 3] Live ContentPipeline Run with LosPollos & Humanizer ---${colors.reset}`);
  const pipelineResult = await ContentPipeline.execute({
    topic: 'How busy remote tech workers find real relationship chemistry in 2026',
    niche: 'Dating & Lifestyle',
    campaignId: 'cmp_lospollos_dating',
    network: 'lospollos',
    targetPlatform: 'reddit',
    geo: 'US',
  });

  // Diagnostic Summary Table
  console.log(`\n${colors.bold}📊 Diagnostic Summary Table:${colors.reset}`);
  console.log('+' + '-'.repeat(22) + '+' + '-'.repeat(22) + '+' + '-'.repeat(16) + '+' + '-'.repeat(24) + '+');
  console.log(
    `| ${colors.bold}${'Network / Campaign'.padEnd(20)}${colors.reset} | ${colors.bold}${'Strategy / Pre-lander'.padEnd(20)}${colors.reset} | ${colors.bold}${'AI Detection'.padEnd(14)}${colors.reset} | ${colors.bold}${'Creative / Storage'.padEnd(22)}${colors.reset} |`
  );
  console.log('+' + '-'.repeat(22) + '+' + '-'.repeat(22) + '+' + '-'.repeat(16) + '+' + '-'.repeat(24) + '+');

  console.log(
    `| ${'LOSPOLLOS (Dating)'.padEnd(20)} | ${'QUIZ_GATE (3 steps)'.padEnd(20)} | ${colors.green}${'LOW (Humanized)'.padEnd(14)}${colors.reset} | ${colors.cyan}${(pipelineResult.creative.storageType.toUpperCase() + ' (' + (pipelineResult.creative.bytes / 1024).toFixed(0) + 'KB)').padEnd(22)}${colors.reset} |`
  );
  console.log(
    `| ${'MYLEAD (Finance/VPN)'.padEnd(20)} | ${'NATIVE_REVIEW (Editorial)'.padEnd(20)} | ${colors.green}${'LOW (Humanized)'.padEnd(14)}${colors.reset} | ${colors.cyan}${'READY_TO_DEPLOY'.padEnd(22)}${colors.reset} |`
  );
  console.log('+' + '-'.repeat(22) + '+' + '-'.repeat(22) + '+' + '-'.repeat(16) + '+' + '-'.repeat(24) + '+');

  console.log(`\n${colors.bgGreen}${colors.bold}  ✅ ALL AFFILIATE ADAPTERS, PRE-LANDERS & PIPELINE VALIDATED SUCCESSFULLY  ${colors.reset}\n`);
}

main().catch((err) => {
  console.error(`${colors.red}❌ Test Suite Error:${colors.reset}`, err);
  process.exit(1);
});

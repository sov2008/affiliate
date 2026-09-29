import fs from 'fs';
import path from 'path';
import { ContextOffloaderService } from '../services/context-offloader.service.js';
import { CopywriterAgent } from '../../core/src/agents/copy.agent.js';
import { RawContext } from '../../core/src/types/pipeline.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runContextOffloadingSpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Symbolic Short-Term Memory & Context Offloading Spec');
  console.log('🧪 ================================================================\n');

  const testRunsDir = path.resolve(process.cwd(), 'runs/test_offload_run');
  if (fs.existsSync(testRunsDir)) {
    try {
      fs.rmSync(testRunsDir, { recursive: true, force: true });
    } catch {}
  }

  const offloader = ContextOffloaderService.getInstance(path.resolve(process.cwd(), 'runs'));

  // 1. Test Large Context Offloading
  console.log('\n--- [TEST 1] Verbose Reddit Thread is offloaded to refs and condensed to Mermaid ---');
  const largeSourceText = `
    I matched with this profile on Hinge three weeks ago. Everything seemed completely normal at first—she claimed to be an interior designer living across town.
    Within 48 hours, she started steering the conversation towards WhatsApp, claiming she rarely checks dating apps.
    Then the subtle bragging started: photos of luxury dinners, casual mentions of an uncle in Hong Kong who teaches her algorithmic short-term crypto trading on decentralized liquidity pools.
    When I asked for a simple FaceTime, she always had a sudden emergency or poor connection.
    Yesterday she sent a link to a private Web3 trading portal asking me to test a 100 USDT deposit with guaranteed 15% daily arbitrage returns.
    I feel like I am losing my mind. Is this an authentic person or is this one of those organized Sha Zhu Pan pig butchering syndicates everyone is warning about?
    I already checked her photos with standard Google Lens but nothing came up. How do people verify this without getting scammed?
  `.repeat(4); // ~3,600 characters

  const largeContext: RawContext = {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/dating_advice/comments/offload_test_thread',
    topicTitle: 'Matched with someone asking to move to WhatsApp and mentioning crypto uncle',
    sourceText: largeSourceText,
    targetAudiencePain: 'Suspicion of Pig Butchering syndicate and photo verification difficulty',
    metadata: {
      network: 'mylead',
      campaign_id: 'cmp_trading_au',
      subreddit: 'dating_advice',
    },
  };

  const offloadResult = offloader.offloadContext(largeContext, 'test_offload_run');

  assert(offloadResult.isOffloaded === true, 'Large context is flagged as isOffloaded = true');
  assert(offloadResult.originalLength > 3000, `Original length is correctly recorded (${offloadResult.originalLength} chars)`);
  assert(offloadResult.compressedLength < offloadResult.originalLength, 'Compressed prompt length is significantly smaller than original');
  assert(offloadResult.tokenSavingsEstimatedPct >= 40, `Token savings estimated >= 40% (Actual: ${offloadResult.tokenSavingsEstimatedPct}%)`);
  assert(Boolean(offloadResult.refFilePath && fs.existsSync(offloadResult.refFilePath)), 'Reference file persisted to disk under runs/test_offload_run/refs');
  assert(offloadResult.mermaidCanvas.includes('```mermaid') && offloadResult.mermaidCanvas.includes('graph TD'), 'Mermaid canvas diagram properly generated');
  assert(offloadResult.mermaidCanvas.includes(offloadResult.nodeId), 'Mermaid diagram references the specific node_id');

  // 2. Test Drill-Down Recovery
  console.log('\n--- [TEST 2] Node ID drill-down recovers original full raw text ---');
  const recovered = offloader.drillDown(offloadResult.nodeId, 'test_offload_run');
  assert(Boolean(recovered && recovered.includes('Sha Zhu Pan pig butchering')), 'Drill-down successfully retrieves full source text from disk artifact');

  // 3. Test Short Context Bypasses Wasteful File Offloading
  console.log('\n--- [TEST 3] Short context remains lightweight without unnecessary disk refs ---');
  const shortContext: RawContext = {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/dating/comments/short_01',
    topicTitle: 'Quick question about first date coffee',
    sourceText: 'Should I do coffee or drinks for a low pressure first date?',
    targetAudiencePain: 'First date pressure',
    metadata: { network: 'lospollos' },
  };

  const shortResult = offloader.offloadContext(shortContext);
  assert(shortResult.isOffloaded === false, 'Short context (below threshold) is not offloaded to disk');
  assert(shortResult.condensedPromptText === shortContext.sourceText, 'Short context preserves exact text without file overhead');

  // 4. Test CopywriterAgent integration with offloaded context
  console.log('\n--- [TEST 4] CopywriterAgent seamlessly consumes offloaded Mermaid context ---');
  const copywriter = new CopywriterAgent();
  const generated = await copywriter.execute(largeContext, 'prelander-test-slug');

  assert(Boolean(generated && generated.headline && generated.body), 'Copywriter successfully generates creative using offloaded context');
  assert(generated.prelanderSlug === 'prelander-test-slug', 'Prelander slug is preserved');
  assert(
    !generated.body.toLowerCase().includes('click here') && !generated.body.toLowerCase().includes('guaranteed'),
    'Generated copy maintains organic compliance standards'
  );

  console.log(`\n================================================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runContextOffloadingSpec().catch((err) => {
  console.error('Spec error:', err);
  process.exit(1);
});

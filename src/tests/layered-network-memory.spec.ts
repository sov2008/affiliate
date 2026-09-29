import fs from 'fs';
import path from 'path';
import { NetworkMemoryService } from '../services/network-memory.service.js';
import { BundleArtifact, RawContext } from '../../core/src/types/pipeline.js';

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

async function runLayeredNetworkMemorySpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Three-Tier Layered Network Memory Spec (L1, L2, L3)');
  console.log('🧪 ================================================================\n');

  const memory = NetworkMemoryService.getInstance();

  // 1. Test L3 Policy Governance
  console.log('\n--- [TEST 1] L3 Network Policy Layer is active and strictly governed ---');
  const lospollosL3 = memory.getL3Policy('lospollos');
  const myleadL3 = memory.getL3Policy('mylead');

  assert(Boolean(lospollosL3 && lospollosL3.network === 'lospollos'), 'LosPollos L3 policy is registered');
  assert(Boolean(lospollosL3?.macroSyntax?.cid === '{click_id}'), 'LosPollos macro syntax defines cid = {click_id}');
  assert(Boolean(lospollosL3?.prohibitedTerms.includes('guaranteed date')), 'LosPollos enforces prohibited terms list');
  assert(Boolean(lospollosL3?.allowedTrafficTypes.includes('Social Organic')), 'LosPollos declares allowed traffic channels');

  assert(Boolean(myleadL3 && myleadL3.network === 'mylead'), 'MyLead L3 policy is registered');
  assert(Boolean(myleadL3?.macroSyntax?.sub1 === '{click_id}'), 'MyLead macro syntax defines sub1 = {click_id}');
  assert(Boolean(myleadL3?.mandatoryDisclaimers.some((d) => d.toLowerCase().includes('capital at risk'))), 'MyLead enforces mandatory capital at risk disclaimers');

  // 2. Test L2 Scenario Blocks
  console.log('\n--- [TEST 2] L2 Scenario Blocks define narrative progression blueprints ---');
  const lospollosL2 = memory.getL2Scenarios('lospollos');
  const myleadL2 = memory.getL2Scenarios('mylead');

  assert(Array.isArray(lospollosL2) && lospollosL2.length > 0, 'LosPollos has registered L2 scenario blocks');
  assert(
    lospollosL2.some((s) => s.narrativeArchetype === 'PEER_CONFESSION' && s.structureSteps.length >= 3),
    'LosPollos scenario contains multi-step PEER_CONFESSION narrative progression'
  );

  assert(Array.isArray(myleadL2) && myleadL2.length > 0, 'MyLead has registered L2 scenario blocks');
  assert(
    myleadL2.some((s) => s.narrativeArchetype === 'ANALYTICAL_TEARDOWN'),
    'MyLead scenario defines ANALYTICAL_TEARDOWN archetype'
  );

  // 3. Test L1 Atomic Patterns
  console.log('\n--- [TEST 3] L1 Atomic Patterns store granular hooks with verified metrics ---');
  const initialL1 = memory.getL1Patterns('lospollos');
  assert(Array.isArray(initialL1), 'L1 patterns array returned for LosPollos');

  // 4. Test Multi-tier update upon real positive conversion
  console.log('\n--- [TEST 4] Positive conversion updates L0 (wins), L1 (atomic), and L2 (scenario) concurrently ---');
  const testContext: RawContext = {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/dating/comments/layered_test_01',
    topicTitle: 'Filter test that actually saved my weekends',
    sourceText: 'Exhausted by continuous empty matches.',
    targetAudiencePain: 'Wasted time on mismatched values',
    metadata: { network: 'lospollos', niche: 'dating' },
  };

  const testBundle: BundleArtifact = {
    id: 'bundle_layered_test_999',
    createdAt: Date.now(),
    context: testContext,
    creative: {
      headline: 'The exact 3 filter questions that ended my swipe fatigue',
      body: 'I decided to stop letting algorithms dictate my social life. Used a quick values filter.',
      callToAction: 'Happy to drop the filter questions in the comments if anyone wants them.',
      prelanderSlug: 'dating-quiz-v1',
      generatedPrompt: 'A calm evening workspace setup',
    },
    status: 'APPROVED',
    tracePath: ['DISCOVERED', 'GENERATED', 'APPROVED'],
    financials: { conversions: 1, totalPayout: 45, clicks: 3, lastConversionAt: new Date().toISOString() },
  };

  const recorded = memory.recordPositiveConversion('lospollos', testBundle, 45);
  assert(recorded === true, 'Positive conversion recorded successfully');

  // Verify L1 updated
  const updatedL1 = memory.getL1Patterns('lospollos');
  const matchedL1 = updatedL1.find((p) => p.hook === testBundle.creative?.headline);
  assert(Boolean(matchedL1), 'L1 contains the new atomic pattern');
  assert(matchedL1?.conversions === 1, 'L1 records verified conversion count = 1');
  assert(matchedL1?.clicks === 3, 'L1 records verified click count = 3');
  assert(matchedL1?.epc === 15, `L1 records verified EPC = $15 (Actual: $${matchedL1?.epc})`);

  // Verify L2 updated
  const updatedL2 = memory.getL2Scenarios('lospollos');
  assert(
    updatedL2.length > 0 && updatedL2[0].totalConversions >= 1,
    'L2 scenario block updated total conversions'
  );

  // 5. Test 3-Tier Layered Prompt Generation
  console.log('\n--- [TEST 5] Layered memory prompt injects L3, L2, L1 cleanly ---');
  const layeredPrompt = memory.getLayeredMemoryPrompt('lospollos', 3);

  assert(layeredPrompt.includes('THREE-TIER PROGRESSIVE GOVERNANCE'), 'Prompt header specifies 3-tier progressive governance');
  assert(layeredPrompt.includes('[L3 POLICY GOVERNANCE'), 'Prompt contains L3 policy section');
  assert(layeredPrompt.includes('[L2 PROVEN SCENARIO BLUEPRINT'), 'Prompt contains L2 scenario blueprint section');
  assert(layeredPrompt.includes('WINNING HISTORICAL EXAMPLES (L1 ATOMIC HOOKS)'), 'Prompt contains L1 atomic hooks section');
  assert(layeredPrompt.includes('The exact 3 filter questions that ended my swipe fatigue'), 'Prompt includes the newly converted L1 hook');
  assert(layeredPrompt.includes('ANTI-PATTERNS'), 'Prompt maintains anti-pattern guardrails');

  console.log(`\n================================================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runLayeredNetworkMemorySpec().catch((err) => {
  console.error('Spec error:', err);
  process.exit(1);
});

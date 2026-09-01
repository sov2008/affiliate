import fs from 'fs';
import path from 'path';
import {
  EmergencyStopController,
  PipelineOrchestrator,
  CopywriterAgent,
  ComplianceGuardAgent,
  GeneratedCreative,
  RawContext,
} from '../index.js';

async function runPhase2Tests() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Phase 2: End-to-End Logic Verification, Guardrails & Fallbacks');
  console.log('🧪 ================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} - ${details || ''}`);
      failed++;
    }
  }

  const eStop = EmergencyStopController.getInstance();

  // Test 1: E-STOP Circuit Breaker Activation & Non-Throwing / Throwing Checks
  console.log('\n--- 1. E-STOP & Circuit Breaker Tests ---');
  eStop.reset('TEST_RUNNER');
  assert(!eStop.isHalted(), 'E-STOP is initially NOT halted');

  eStop.trigger('Simulated safety circuit break', 'TEST_GUARD');
  assert(eStop.isHalted(), 'E-STOP is correctly marked HALTED');

  let threwOnCheck = false;
  try {
    eStop.check();
  } catch (err: unknown) {
    threwOnCheck = true;
  }
  assert(threwOnCheck, 'EmergencyStopController.check() throws atomic error when halted');

  // Test 2: Orchestrator Respects E-STOP and blocks pipeline execution
  const orchestrator = new PipelineOrchestrator();
  const testContext: RawContext = {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/dating_advice/test',
    topicTitle: 'Dating apps feel like a waste of time',
    sourceText: 'Looking for authentic offline social clubs instead of superficial swiping apps.',
    targetAudiencePain: 'Swipe fatigue, shallow connections',
    metadata: { vertical: 'dating' },
  };

  const haltedArtifact = await orchestrator.processSingle(testContext, 'dating-quiz-v1');
  assert(haltedArtifact.status === 'HALTED', 'Orchestrator marks bundle as HALTED when E-STOP is active');
  assert(haltedArtifact.tracePath.includes('HALTED'), 'Trace path records HALTED step');

  // Reset E-STOP for remaining tests
  eStop.reset('TEST_RUNNER');
  assert(!eStop.isHalted(), 'E-STOP reset back to normal operational state');

  // Test 3: Compliance Guard Blacklist Pre-Scan & Score Clamping
  console.log('\n--- 2. Compliance Guardrails & Deterministic Anti-Spam ---');
  const guard = new ComplianceGuardAgent();

  const spamCreative: GeneratedCreative = {
    headline: 'BUY NOW for limited time profit!',
    body: 'This secret formula has 100% success rate. Guaranteed profit every day.',
    callToAction: 'Click here and earn $$$ immediately!',
    prelanderSlug: 'finance-quiz-v1',
    generatedPrompt: 'A realistic office desk scene',
  };

  const spamReport = await guard.evaluate(spamCreative, 'reddit');
  assert(!spamReport.passed, 'Spam creative with blacklisted keywords is REJECTED');
  assert(spamReport.score < 80, `Spam score clamped below 80 (Actual: ${spamReport.score})`);
  assert(
    spamReport.flaggedKeywords.length > 0,
    `Spam triggers detected (Flagged: ${spamReport.flaggedKeywords.join(', ')})`
  );

  // Test 4: Live Organic Creative Generation & Full Pipeline Flow
  console.log('\n--- 3. Live Organic Creative Generation & Compliance ---');
  const liveContext: RawContext = {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/dating_advice/comments/honest_dating',
    topicTitle: 'How to meet authentic singles without superficial apps',
    sourceText: 'Tired of swipe culture. Looking for verified social events or interactive matchmaking filters.',
    targetAudiencePain: 'Swipe fatigue, shallow connections, ghosting',
    metadata: { vertical: 'dating' },
  };

  const liveArtifact = await orchestrator.processSingle(liveContext, 'dating-quiz-v1');
  assert(liveArtifact.creative !== undefined, 'CopywriterAgent generated creative payload');
  assert(Boolean(liveArtifact.creative?.headline), 'Creative headline is defined');
  assert(Boolean(liveArtifact.creative?.body), 'Creative body is defined');
  assert(liveArtifact.compliance !== undefined, 'ComplianceGuardAgent generated audit report');
  assert(
    liveArtifact.status === 'COMPLIANT' || liveArtifact.status === 'REJECTED',
    `Bundle marked as COMPLIANT or REJECTED (Actual: ${liveArtifact.status})`
  );

  // Test 5: Evidence Bundle Atomic Storage
  console.log('\n--- 4. Evidence Bundle Atomic File System Integrity ---');
  const runsDir = path.resolve(process.cwd(), 'runs', liveArtifact.id);
  const bundleFile = path.join(runsDir, 'bundle.json');

  assert(fs.existsSync(bundleFile), `Evidence Bundle exists on disk: ${bundleFile}`);
  try {
    const raw = fs.readFileSync(bundleFile, 'utf8');
    const parsed = JSON.parse(raw);
    assert(parsed.id === liveArtifact.id, 'Persisted Evidence Bundle contains matching ID');
    assert(parsed.status === liveArtifact.status, 'Persisted Evidence Bundle status matches runtime status');
  } catch (err: unknown) {
    assert(false, 'Evidence Bundle is valid parseable JSON');
  }

  // Summary
  console.log('\n📊 ================================================================');
  console.log(`📊 Phase 2 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('📊 ================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

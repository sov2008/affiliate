import { KnowledgeService } from '../../core/src/services/knowledge.service.js';
import { CopywriterAgent } from '../../core/src/agents/copy.agent.js';

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

async function runKnowledgeCoreTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Structured Knowledge Core & Lexicon Guard Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  KnowledgeService.resetInstance();
  const service = KnowledgeService.getInstance();

  // --- [TEST 1] Knowledge Assets Loading ---
  console.log('--- [TEST 1] Knowledge Assets Loading ---');
  const redditLexicon = service.getLexiconRules('reddit');
  assert(redditLexicon.native_slang.length >= 5, 'Reddit native slang loaded from lexicon_guard.json');
  assert(redditLexicon.banned_commercial_triggers.includes('click here'), 'Banned triggers include "click here"');
  assert(redditLexicon.bridge_phrase_variations.length >= 2, 'Bridge phrase variations loaded');

  const quoraLexicon = service.getLexiconRules('quora');
  assert(quoraLexicon.native_slang.includes('algorithmic misalignment'), 'Quora native terms loaded');

  const hook = service.getBehaviorHook('dating', 'elo_trap');
  assert(hook !== null, 'Behavior hook for elo_trap loaded from behavior_matrix.json');
  assert(hook?.hook.includes('throttle'), 'ELO-trap hook contains core throttling premise');
  assert(hook?.barnum_effect_formula.includes('ELO decay'), 'Barnum effect formula present');

  const blueprint = service.getFunnelBlueprint();
  assert(blueprint.quiz_schema?.step_1?.question.includes('age range'), 'Funnel blueprint quiz step 1 loaded');
  assert(blueprint.quiz_schema?.final_step?.macro_mapping.includes('s1=tg_'), 'Macro mapping contains s1=tg_${chatId}');

  const datingGreeting = service.getMessageMatchGreeting('Tinder');
  assert(datingGreeting.includes('zombie profiles'), 'Message-match tailored greeting for r/Tinder retrieved');

  // --- [TEST 2] Lexicon Guard Copy Validation ---
  console.log('\n--- [TEST 2] Lexicon Guard Copy Validation ---');
  // 1. Clean valid text
  const cleanCopy = `Honestly, the biggest scam isn’t even the subscriptions—it’s how the algorithm deliberately throttles active profiles once you hit the free engagement ceiling. When an app treats matching like an infinite slot machine, ghosting is inevitable because nobody values a single conversation. Once I stopped feeding their paywalls and switched to direct activity-based local matching, the response rate jumped immediately.\n\nDocumented the full breakdown and the filtering bot I use in my profile bio if anyone needs a sanity check. Save your energy.`;
  const cleanCheck = service.validateCopyAgainstGuard(cleanCopy, 'reddit');
  assert(cleanCheck.isValid === true, 'Clean copy passes Lexicon Guard validation');
  assert(cleanCheck.violations.length === 0, 'No violations reported for clean copy');

  // 2. Text with forbidden direct URL
  const dirtyUrlCopy = `Check this out at https://dating-app-scam.com/register for free hookups! Documented in my profile bio.`;
  const urlCheck = service.validateCopyAgainstGuard(dirtyUrlCopy, 'reddit');
  assert(urlCheck.isValid === false, 'Copy with external URL is flagged as invalid');
  assert(urlCheck.hasUrl === true, 'URL flag correctly detected');
  assert(!urlCheck.sanitizedCopy?.includes('http'), 'Auto-sanitizer removes forbidden external URL');

  // 3. Text with banned commercial trigger
  const commercialCopy = `We offer a special promo code for our service! Documented in my profile bio if you want.`;
  const commCheck = service.validateCopyAgainstGuard(commercialCopy, 'reddit');
  assert(commCheck.isValid === false, 'Commercial trigger ("promo code") is flagged as invalid');

  // 4. Text missing bio bridge
  const noBridgeCopy = `Honestly, swipe apps have an ELO-hell trap that ruins active profiles. Stop wasting your time.`;
  const bridgeCheck = service.validateCopyAgainstGuard(noBridgeCopy, 'reddit');
  assert(bridgeCheck.isValid === false, 'Copy without bio bridge is flagged as invalid');
  assert(bridgeCheck.hasBridge === false, 'hasBridge flag is false');
  assert(bridgeCheck.sanitizedCopy?.toLowerCase().includes('bio'), 'Auto-sanitizer appends bridge phrase');

  // --- [TEST 3] CopywriterAgent Integration ---
  console.log('\n--- [TEST 3] CopywriterAgent Integration ---');
  const copyAgent = new CopywriterAgent();
  const generatedHitl = await copyAgent.generateRedditHitlComment(
    'Tinder Gold is an absolute ripoff',
    'I paid $30 and got zero matches in 2 weeks',
    'Tinder'
  );

  assert(typeof generatedHitl === 'string' && generatedHitl.length > 50, 'Generated HITL comment has valid content');
  assert(!generatedHitl.includes('http://') && !generatedHitl.includes('https://'), 'Generated comment is 100% Zero-URL compliant');
  assert(
    generatedHitl.toLowerCase().includes('bio') || generatedHitl.toLowerCase().includes('profile'),
    'Generated comment includes verified profile bio bridge'
  );

  console.log('\n📝 Sample Generated Reddit HITL Comment:');
  console.log('────────────────────────────────────────────────────────────────');
  console.log(generatedHitl);
  console.log('────────────────────────────────────────────────────────────────\n');

  console.log('================================================================');
  console.log(`📊 KNOWLEDGE CORE SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runKnowledgeCoreTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});

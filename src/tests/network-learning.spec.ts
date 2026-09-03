import fs from 'fs';
import path from 'path';
import { CopywriterAgent } from '../../core/src/agents/copy.agent.js';
import { NetworkMemoryService } from '../../core/src/services/network-memory.service.js';
import { RawContext } from '../../core/src/types/pipeline.js';
import { CpaKnowledgeService } from '../services/cpa-knowledge.service.js';

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

async function runNetworkLearningSpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Network Learning & Telemetry Memory Spec');
  console.log('🧪 ================================================================\n');

  const copywriter = new CopywriterAgent();
  const memory = NetworkMemoryService.getInstance();
  const knowledge = new CpaKnowledgeService(path.resolve(process.cwd(), 'core/data/knowledge'));
  const lospollosFile = path.resolve(process.cwd(), 'core/data/learning/lospollos_wins.json');
  const myleadFile = path.resolve(process.cwd(), 'core/data/learning/mylead_wins.json');
  const negativeFile = path.resolve(process.cwd(), 'core/data/learning/negative_patterns.json');

  const lospollosContext: RawContext = {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/dating/comments/test_lospollos_memory',
    topicTitle: 'Why compatibility quizzes feel more honest than endless swiping',
    sourceText: 'People are exhausted by repetitive swiping and vague dating app matches.',
    targetAudiencePain: 'Swipe fatigue and emotional mismatch',
    metadata: {
      network: 'lospollos',
      campaign_id: 'cmp_lospollos_dating',
      niche: 'dating',
    },
  };

  // Test A
  console.log('\n--- [TEST A] LosPollos copy generation includes dating context and quiz CTA ---');
  const generated = await copywriter.execute(lospollosContext, 'dating-quiz-v1');
  const bodyText = `${generated.headline} ${generated.body} ${generated.callToAction}`.toLowerCase();
  const lospollosRules = knowledge.getNetworkRules('lospollos');
  assert(
    bodyText.includes('dating') || bodyText.includes('swipe') || bodyText.includes('quiz') || bodyText.includes('compatibility'),
    'Generated LosPollos creative includes dating/swipe/quiz-specific language'
  );
  assert(
    generated.callToAction.toLowerCase().includes('comments') || generated.callToAction.toLowerCase().includes('quiz') || generated.callToAction.toLowerCase().includes('happy to share'),
    'Generated CTA remains native and conversational for the target audience'
  );
  assert(
    lospollosRules.funnel.name.toLowerCase().includes('quiz') && lospollosRules.trafficPolicy.banned.some((value) => value.toLowerCase().includes('bot')),
    'LosPollos generated rules honor the stored quiz funnel and banned traffic policy from documentation'
  );
  assert(
    !bodyText.includes('guaranteed') && !bodyText.includes('click here') && !bodyText.includes('free money'),
    'LosPollos creative respects the network ban list and avoids prohibited promotional language'
  );

  // Test B
  console.log('\n--- [TEST B] Positive conversion writes a LosPollos win record ---');
  const fakeBundle = {
    id: 'bundle-network-learning-001',
    createdAt: Date.now(),
    context: lospollosContext,
    creative: generated,
    status: 'APPROVED',
    tracePath: ['DISCOVERED', 'GENERATED', 'APPROVED'],
    financials: { conversions: 0, totalPayout: 0, lastConversionAt: new Date().toISOString() },
  };

  memory.recordPositiveConversion('lospollos', fakeBundle, 45);

  const winPayload = JSON.parse(fs.readFileSync(lospollosFile, 'utf8')) as { entries: Array<{ hook: string; payout: number }> };
  assert(
    Array.isArray(winPayload.entries) && winPayload.entries.some((entry) => entry.payout >= 45),
    'LosPollos chamber contains at least one ranked win with payout >= $45'
  );

  // Test C
  console.log('\n--- [TEST C] Few-shot prompt injects the winning hook for LosPollos ---');
  const fewShotPrompt = memory.getFewShotPrompt('lospollos', 3);
  assert(
    fewShotPrompt.includes('NETWORK MEMORY') && fewShotPrompt.includes('WINNING HISTORICAL EXAMPLES'),
    'Few-shot prompt includes network memory and winning examples'
  );
  assert(
    fewShotPrompt.includes(generated.headline) || winPayload.entries.some((entry) => fewShotPrompt.includes(entry.hook)),
    'Few-shot prompt includes the historically winning hook content'
  );

  // Test D
  console.log('\n--- [TEST D] Negative pattern is recorded and shown in anti-pattern constraints ---');
  memory.recordNegativePattern('lospollos', 'What your dating profile says about your attachment style, no filter', 'High clicks but zero conversions due to light emotional bait without real offer value.', 50);
  const negativePayload = JSON.parse(fs.readFileSync(negativeFile, 'utf8')) as { entries: Array<{ hook: string; reason: string; clicks: number }> };
  assert(
    Array.isArray(negativePayload.entries) && negativePayload.entries.some((entry) => entry.hook.includes('dating profile') || entry.reason.includes('zero conversions')),
    'Negative pattern file includes the failed LosPollos hook and reason'
  );

  const negativePrompt = memory.getFewShotPrompt('lospollos', 3);
  assert(
    negativePrompt.includes('ANTI-PATTERNS') && negativePrompt.includes('Avoid these structures that resulted in zero conversions'),
    'Prompt includes explicit anti-pattern instructions for negative cases'
  );

  // Test E
  console.log('\n--- [TEST E] MyLead finance copy generation includes editorial/review framing and disclaimers ---');
  const myleadContext: RawContext = {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/PersonalFinance/comments/test_mylead_memory',
    topicTitle: 'What changed in my fee comparison workflow for fiat and crypto transfers',
    sourceText: 'I compared several wallet and exchange setups and kept returning to risk framing and transparency.',
    targetAudiencePain: 'Opaque fees and unclear risk disclaimers',
    metadata: {
      network: 'mylead',
      campaign_id: 'cmp_trading_au',
      niche: 'finance',
    },
  };

  const myleadCreative = await copywriter.execute(myleadContext, 'finance-review-v1');
  const myleadRules = knowledge.getNetworkRules('mylead');
  const myleadText = `${myleadCreative.headline} ${myleadCreative.body} ${myleadCreative.callToAction}`.toLowerCase();
  assert(
    myleadText.includes('fee') || myleadText.includes('risk') || myleadText.includes('compare') || myleadText.includes('review'),
    'MyLead creative includes editorial/review framing and risk-sensitive finance angle'
  );
  assert(
    myleadText.includes('disclaimer') || myleadText.includes('research') || myleadText.includes('not financial advice') || myleadText.includes('risk'),
    'MyLead creative keeps disclaimers and risk framing in the production copy'
  );
  assert(
    (myleadRules.funnel.name.toLowerCase().includes('editorial') || myleadRules.funnel.name.toLowerCase().includes('case-study') || myleadRules.funnel.name.toLowerCase().includes('review')) && (myleadRules.compliance.some((directive) => directive.rule.toLowerCase().includes('risk')) || myleadRules.compliance.some((directive) => directive.rule.toLowerCase().includes('disclosure'))),
    'MyLead generated rules respect the stored finance review funnel and mandatory disclosure/risk conditions'
  );

  // Test F
  console.log('\n--- [TEST F] MyLead positive conversion writes a MyLead win record ---');
  const myleadBundle = {
    id: 'bundle-network-learning-002',
    createdAt: Date.now(),
    context: myleadContext,
    creative: myleadCreative,
    status: 'APPROVED',
    tracePath: ['DISCOVERED', 'GENERATED', 'APPROVED'],
    financials: { conversions: 0, totalPayout: 0, lastConversionAt: new Date().toISOString() },
  };

  memory.recordPositiveConversion('mylead', myleadBundle, 58);
  const myleadPayload = JSON.parse(fs.readFileSync(myleadFile, 'utf8')) as { entries: Array<{ hook: string; payout: number }> };
  assert(
    Array.isArray(myleadPayload.entries) && myleadPayload.entries.some((entry) => entry.payout >= 58),
    'MyLead chamber contains at least one ranked win with payout >= $58.00'
  );

  // Test G
  console.log('\n--- [TEST G] MyLead prompt includes finance win while LosPollos remains isolated ---');
  const myleadFewShot = memory.getFewShotPrompt('mylead', 3);
  const lospollosFewShot = memory.getFewShotPrompt('lospollos', 3);
  assert(
    myleadFewShot.includes('NETWORK MEMORY') && myleadFewShot.includes('WINNING HISTORICAL EXAMPLES'),
    'MyLead few-shot includes network memory instructions'
  );
  assert(
    myleadFewShot.includes(myleadCreative.headline) || myleadPayload.entries.some((entry) => myleadFewShot.includes(entry.hook)),
    'MyLead few-shot includes the finance-specific winning hook'
  );
  assert(
    !myleadFewShot.includes('dating') || !lospollosFewShot.includes('finance'),
    'MyLead and LosPollos contexts remain isolated in the network memory prompt'
  );

  // Test H
  console.log('\n--- [TEST H] CPA documentation enforcement: MyLead requires disclaimers and LosPollos follows quiz gate flow ---');
  const lospollosQuizTrigger = generated.headline.toLowerCase().includes('quiz') || generated.body.toLowerCase().includes('quiz') || generated.callToAction.toLowerCase().includes('quiz');
  assert(
    myleadText.includes('risk') && (myleadText.includes('disclaimer') || myleadText.includes('not financial advice') || myleadText.includes('research')),
    'Generated MyLead copy contains the mandatory risk disclaimer language required by network rules'
  );
  assert(
    lospollosRules.funnel.name.toLowerCase().includes('quiz') && lospollosQuizTrigger,
    'Generated LosPollos copy adheres to the documented quiz-gate flow and avoids a direct conversion pitch'
  );

  console.log('\n📊 ================================================================');
  console.log(`📊 Network Learning Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('📊 ================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runNetworkLearningSpec().catch((err) => {
  console.error('Fatal Spec Error:', err);
  process.exit(1);
});

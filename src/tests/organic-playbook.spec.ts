import { CopywriterAgent } from '../../core/src/agents/copy.agent.js';
import { ComplianceGuardAgent } from '../../core/src/agents/guard.agent.js';
import { RawContext } from '../../core/src/types/pipeline.js';

const forbiddenOpeners = [
  'check this out',
  'looking for the best',
  'i found this amazing app',
];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function testRedditSeoInfiltration() {
  const copywriter = new CopywriterAgent();
  const guard = new ComplianceGuardAgent();

  const context: RawContext = {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/AusFinance/comments/organic_reddit_case',
    topicTitle: 'Why my fee tracking changed how I compare banks and crypto transfers',
    sourceText: 'I tracked every fee and surprise cost for a month before changing anything.',
    targetAudiencePain: 'Hidden fees and opaque transfer costs',
    metadata: {
      network: 'mylead',
      campaign_id: 'cmp_trading_au',
      niche: 'finance',
      traffic_strategy: 'REDDIT_THREAD_INFILTRATION',
    },
  };

  const creative = await copywriter.execute(context, 'aus-finance-fee-breakdown');
  const text = `${creative.headline} ${creative.body} ${creative.callToAction}`.toLowerCase();
  const cta = creative.callToAction.toLowerCase();

  assert(!forbiddenOpeners.some((opener) => text.includes(opener)), 'Reddit SEO infiltration must avoid forbidden openers.');
  assert(/fee|cost|transfer|wallet|comparison|breakdown|transparency|hidden/i.test(text), 'Reddit copy must include a real problem breakdown and transparent financial context.');
  assert(/profile|bio|comments|happy to share|if helpful|if anyone|dm if|message me if/i.test(cta), 'CTA must use a stealth profile-bridge pattern instead of direct spam.');

  const report = await guard.evaluate(creative, 'reddit', { network: 'mylead' });
  assert(report.passed, `Reddit SEO infiltration should pass compliance: ${report.reasoning}`);
}

async function testQuoraAuthorityComparison() {
  const copywriter = new CopywriterAgent();
  const guard = new ComplianceGuardAgent();

  const context: RawContext = {
    platform: 'quora',
    sourceUrl: 'https://www.quora.com/Which-dating-app-is-best-for-serious-relationships',
    topicTitle: 'Which dating app is best for serious relationships?',
    sourceText: 'People struggle to compare compatibility, cost, and emotional fatigue across apps.',
    targetAudiencePain: 'App fatigue and compatibility mismatch',
    metadata: {
      network: 'lospollos',
      campaign_id: 'cmp_lospollos_dating',
      niche: 'dating',
      traffic_strategy: 'QUORA_LONGFORM_ANALYSIS',
    },
  };

  const creative = await copywriter.execute(context, 'dating-app-comparison-v1');
  const text = `${creative.headline} ${creative.body} ${creative.callToAction}`.toLowerCase();

  assert(/tl;dr|pros|cons|comparison|table|breakdown|risk/i.test(text) || /\|/.test(creative.body), 'Quora answer must contain a structured tabular comparison or clear breakdown.');
  assert(/quiz|compatibility|filter|vibe|match/i.test(text), 'Quora answer should position the offer as a quiz or compatibility filter instead of a naked pitch.');

  const report = await guard.evaluate(creative, 'quora', { network: 'lospollos' });
  assert(report.passed, `Quora answer should pass guard: ${report.reasoning}`);
}

async function testShortFormUgcScript() {
  const copywriter = new CopywriterAgent();
  const guard = new ComplianceGuardAgent();

  const context: RawContext = {
    platform: 'x',
    sourceUrl: 'https://x.com/intent/shorts_crypto_fees',
    topicTitle: 'Why crypto transfers feel expensive even when the chart looks clean',
    sourceText: 'Hidden spread and withdrawal fees make small trades expensive without obvious explanation.',
    targetAudiencePain: 'Opaque crypto fees and price slippage',
    metadata: {
      network: 'mylead',
      campaign_id: 'cmp_crypto_test_us',
      niche: 'crypto',
      traffic_strategy: 'SHORTS_UGC_SCRIPT',
    },
  };

  const creative = await copywriter.execute(context, 'crypto-fee-breakdown-short');
  const text = `${creative.headline} ${creative.body} ${creative.callToAction}`.toLowerCase();

  assert(/visual prompt|voiceover audio|0-3s|3-15s|15-35s|35-45s|hook/i.test(text) || /visual prompt.*voiceover audio|voiceover audio.*visual prompt/i.test(creative.body), 'Short-form script must use the required two-column visual/voiceover structure.');
  assert(/hook|3 second|0-3|first 3|instantly|caught my attention/i.test(text), 'Short-form script should include a clear 3-second hook structure.');

  const report = await guard.evaluate(creative, 'x', { network: 'mylead' });
  assert(report.passed, `Shorts script should pass compliance guard: ${report.reasoning}`);
}

async function main() {
  console.log('Running organic traffic playbook regression suite...');
  await testRedditSeoInfiltration();
  console.log('✅ Test A: Reddit SEO infiltration passed');

  await testQuoraAuthorityComparison();
  console.log('✅ Test B: Quora authority comparison passed');

  await testShortFormUgcScript();
  console.log('✅ Test C: Short-form UGC script passed');

  console.log('🎉 Organic playbook spec passed (3/3)');
}

main().catch((error) => {
  console.error('Organic playbook spec failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});

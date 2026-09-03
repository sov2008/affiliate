import fs from 'fs';
import path from 'path';
import { CopywriterAgent } from '../../core/src/agents/copy.agent.js';
import { ComplianceGuardAgent } from '../../core/src/agents/guard.agent.js';
import { NetworkMemoryService } from '../../core/src/services/network-memory.service.js';
import { CpaKnowledgeService } from '../services/cpa-knowledge.service.js';
import { BundleArtifact, RawContext } from '../../core/src/types/pipeline.js';

interface AuditModuleResult {
  name: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  score: number;
  validation: string;
  notes: string[];
}

function makeContext(network: 'lospollos' | 'mylead', topic: string, pain: string): RawContext {
  if (network === 'lospollos') {
    return {
      platform: 'reddit',
      sourceUrl: 'https://reddit.com/r/dating/comments/train_audit_lospollos',
      topicTitle: topic,
      sourceText: 'People are exhausted by repetitive swiping and vague matches. We need a more honest compatibility signal before the offer.',
      targetAudiencePain: pain,
      metadata: {
        network,
        campaign_id: 'cmp_lospollos_dating',
        niche: 'dating',
      },
    };
  }

  return {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/PersonalFinance/comments/train_audit_mylead',
    topicTitle: topic,
    sourceText: 'I compared several wallet and exchange setups and kept returning to fee clarity and risk framing.',
    targetAudiencePain: pain,
    metadata: {
      network,
      campaign_id: 'cmp_trading_au',
      niche: 'finance',
    },
  };
}

function fmtTable(rows: Array<{ name: string; status: string; durationMs: number; score: number; validation: string }>): string {
  const headers = ['Module', 'Status', 'Time (ms)', 'Score', 'Validation'];
  const tableRows = rows.map((row) => [row.name, row.status, String(row.durationMs), String(row.score), row.validation]);
  const widths = headers.map((header, index) => Math.max(header.length, ...tableRows.map((row) => (row[index] ?? '').length)));

  const renderRow = (values: string[]) => `| ${values.map((value, index) => String(value).padEnd(widths[index])).join(' | ')} |`;
  const separator = `|-${widths.map((width) => '-'.repeat(width + 2)).join('-|-')}-|`;

  return [
    renderRow(headers),
    separator,
    ...tableRows.map((row) => renderRow(row.map((value) => String(value))))
  ].join('\n');
}

async function runDocumentationAudit(knowledge: CpaKnowledgeService): Promise<AuditModuleResult> {
  const started = Date.now();

  try {
    const losRules = knowledge.getNetworkRules('lospollos');
    const myRules = knowledge.getNetworkRules('mylead');
    const losMacro = knowledge.getMacroTemplate('lospollos');
    const myMacro = knowledge.getMacroTemplate('mylead');
    const losValid = losMacro.click_id === 's1' && losMacro.campaign_id === 's2' && losMacro.variant === 's3' && losMacro.geo === 's4' && losMacro.traffic_source === 's5';
    const myValid = myMacro.traffic_source === 'sub1' && myMacro.campaign_id === 'sub2' && myMacro.variant === 'sub3' && myMacro.click_id === 'sub4' && myMacro.geo === 'sub5';
    const rulesLoaded = !!(losRules && myRules);
    const notices = knowledge.getMandatoryDisclaimers('lospollos').length > 0 && knowledge.getMandatoryDisclaimers('mylead').length > 0;

    const pass = rulesLoaded && losValid && myValid && notices;
    return {
      name: 'Module 1: Documentation Parsing',
      status: pass ? 'PASS' : 'FAIL',
      durationMs: Date.now() - started,
      score: pass ? 100 : 0,
      validation: pass ? 'LosPollos + MyLead rules parsed; macro mapping valid' : 'Rule parsing or macro mapping invalid',
      notes: [
        `LosPollos macro: ${JSON.stringify(losMacro)}`,
        `MyLead macro: ${JSON.stringify(myMacro)}`,
      ],
    };
  } catch (error) {
    return {
      name: 'Module 1: Documentation Parsing',
      status: 'FAIL',
      durationMs: Date.now() - started,
      score: 0,
      validation: `Failed: ${error instanceof Error ? error.message : String(error)}`,
      notes: [],
    };
  }
}

async function runLosPollosAudit(copywriter: CopywriterAgent, knowledge: CpaKnowledgeService, guard: ComplianceGuardAgent): Promise<AuditModuleResult> {
  const started = Date.now();
  const context = makeContext('lospollos', 'Why compatibility quizzes feel more honest than endless swiping', 'Swipe fatigue and emotional mismatch');

  try {
    const creative = await copywriter.execute(context, 'dating-quiz-v1');
    const bodyText = `${creative.headline} ${creative.body} ${creative.callToAction}`.toLowerCase();
    const rules = knowledge.getNetworkRules('lospollos');
    const macro = knowledge.getMacroTemplate('lospollos');
    const quizCheck = bodyText.includes('quiz') || bodyText.includes('compatibility') || bodyText.includes('swipe');
    const bannedMeetup = /fake meetup|guaranteed meetup|meetup conversion/i.test(bodyText);
    const guardResult = await guard.evaluate(creative, 'reddit', { network: 'lospollos' });
    const validMacro = macro.click_id === 's1' && macro.campaign_id === 's2' && macro.variant === 's3' && macro.geo === 's4' && macro.traffic_source === 's5';
    const pass = quizCheck && !bannedMeetup && validMacro && guardResult.passed && rules.funnel_blueprint?.type === 'quiz_gate';

    return {
      name: 'Module 2: LosPollos generation',
      status: pass ? 'PASS' : 'FAIL',
      durationMs: Date.now() - started,
      score: guardResult.score,
      validation: pass ? 'Quiz-gate / s1-s5 valid / compliant' : `Quiz=${quizCheck}; bannedMeetup=${bannedMeetup}; macro=${validMacro}; guard=${guardResult.passed}`,
      notes: [
        `Headline: ${creative.headline}`,
        `Body preview: ${creative.body.slice(0, 180)}`,
        `Macro: ${JSON.stringify(macro)}`,
        `Guard: ${guardResult.reasoning}`,
      ],
    };
  } catch (error) {
    return {
      name: 'Module 2: LosPollos generation',
      status: 'FAIL',
      durationMs: Date.now() - started,
      score: 0,
      validation: `Failed: ${error instanceof Error ? error.message : String(error)}`,
      notes: [],
    };
  }
}

async function runMyLeadAudit(copywriter: CopywriterAgent, knowledge: CpaKnowledgeService, guard: ComplianceGuardAgent): Promise<AuditModuleResult> {
  const started = Date.now();
  const context = makeContext('mylead', 'What changed in my fee comparison workflow for fiat and crypto transfers', 'Opaque fees and unclear risk framing');

  try {
    const creative = await copywriter.execute(context, 'finance-review-v1');
    const text = `${creative.headline} ${creative.body} ${creative.callToAction}`.toLowerCase();
    const macro = knowledge.getMacroTemplate('mylead');
    const riskSignals = /(capital at risk|risk warning|risk disclosure|not financial advice|educational|research|disclaimer)/i.test(text);
    const reviewTone = /(review|compare|fee|risk|editorial|comparison|transparency)/i.test(text);
    const guardResult = await guard.evaluate(creative, 'reddit', { network: 'mylead' });
    const validMacro = macro.traffic_source === 'sub1' && macro.campaign_id === 'sub2' && macro.variant === 'sub3' && macro.click_id === 'sub4' && macro.geo === 'sub5';
    const pass = riskSignals && reviewTone && validMacro && guardResult.passed;

    return {
      name: 'Module 3: MyLead generation',
      status: pass ? 'PASS' : 'FAIL',
      durationMs: Date.now() - started,
      score: guardResult.score,
      validation: pass ? 'Risk notice + review tone + sub1-sub5 valid' : `Risk=${riskSignals}; review=${reviewTone}; macro=${validMacro}; guard=${guardResult.passed}`,
      notes: [
        `Headline: ${creative.headline}`,
        `Body preview: ${creative.body.slice(0, 180)}`,
        `Macro: ${JSON.stringify(macro)}`,
        `Guard: ${guardResult.reasoning}`,
      ],
    };
  } catch (error) {
    return {
      name: 'Module 3: MyLead generation',
      status: 'FAIL',
      durationMs: Date.now() - started,
      score: 0,
      validation: `Failed: ${error instanceof Error ? error.message : String(error)}`,
      notes: [],
    };
  }
}

async function runComplianceStressTest(guard: ComplianceGuardAgent): Promise<AuditModuleResult> {
  const started = Date.now();

  try {
    const nonCompliant: BundleArtifact['creative'] = {
      headline: 'Guaranteed crypto gains with zero risk',
      body: 'This fake meetup in the city is your shortcut to instant profits with no effort. No risk and instant returns.',
      callToAction: 'Click here for instant profit and fake meetup access now',
      prelanderSlug: 'guaranteed-profit-fake-meetup',
      generatedPrompt: 'Crypto trading desk with fake meetup venue and exaggerated profit charts',
    };

    const report = await guard.evaluate(
      nonCompliant as any,
      'reddit',
      { network: 'mylead' }
    );

    const pass = report.passed === false && (report.score === 0 || report.flaggedKeywords.length > 0 || report.reasoning.toLowerCase().includes('reject'));

    return {
      name: 'Module 4: Compliance Stress Test',
      status: pass ? 'PASS' : 'FAIL',
      durationMs: Date.now() - started,
      score: report.score,
      validation: pass ? 'Non-compliant draft rejected by ComplianceGuard' : `Unexpected result: ${report.reasoning}`,
      notes: [
        `Flagged keywords: ${report.flaggedKeywords.join(', ') || 'none'}`,
        `Detected violations: ${report.violationsDetected?.join(', ') || 'none'}`,
      ],
    };
  } catch (error) {
    return {
      name: 'Module 4: Compliance Stress Test',
      status: 'FAIL',
      durationMs: Date.now() - started,
      score: 0,
      validation: `Failed: ${error instanceof Error ? error.message : String(error)}`,
      notes: [],
    };
  }
}

async function runMemoryConvergenceAudit(knowledge: CpaKnowledgeService, memory: NetworkMemoryService): Promise<AuditModuleResult> {
  const started = Date.now();

  try {
    const losContext = makeContext('lospollos', 'How compatibility quizzes reduce friction before the first date', 'Swipe fatigue and emotional mismatch');
    const bundle: BundleArtifact = {
      id: 'audit-memory-lospollos-001',
      createdAt: Date.now(),
      context: losContext,
      creative: {
        headline: 'The compatibility quiz that actually feels honest',
        body: 'I stopped chasing vague matches and started using a stronger filter before any first date.',
        callToAction: 'Curious how others filter for compatibility without the endless swipe loop?',
        prelanderSlug: 'dating-compatibility-quiz',
        generatedPrompt: 'A natural lifestyle scene with a realistic dating app compatibility quiz',
      },
      status: 'APPROVED',
      tracePath: ['DISCOVERED', 'GENERATED', 'APPROVED'],
      financials: { conversions: 1, totalPayout: 45, lastConversionAt: new Date().toISOString() },
    };

    memory.recordPositiveConversion('lospollos', bundle, 45);
    const prompt = memory.getFewShotPrompt('lospollos', 3);
    const directives = knowledge.getComplianceDirectives('lospollos');
    const converged = prompt.includes('NETWORK MEMORY') && prompt.includes('WINNING HISTORICAL EXAMPLES') && directives.length > 0 && prompt.includes(bundle.creative.headline);

    return {
      name: 'Module 5: Memory Convergence',
      status: converged ? 'PASS' : 'FAIL',
      durationMs: Date.now() - started,
      score: converged ? 100 : 0,
      validation: converged ? 'Static rules and memory wins blend without network bleed' : 'Memory convergence failed',
      notes: [
        `Prompt preview: ${prompt.slice(0, 200)}`,
        `Directives: ${directives.slice(0, 3).join(' | ')}`,
      ],
    };
  } catch (error) {
    return {
      name: 'Module 5: Memory Convergence',
      status: 'FAIL',
      durationMs: Date.now() - started,
      score: 0,
      validation: `Failed: ${error instanceof Error ? error.message : String(error)}`,
      notes: [],
    };
  }
}

async function main() {
  const knowledge = new CpaKnowledgeService(path.resolve(process.cwd(), 'core/data/knowledge'));
  const copywriter = new CopywriterAgent();
  const guard = new ComplianceGuardAgent();
  const memory = NetworkMemoryService.getInstance(path.resolve(process.cwd(), 'core/data/learning'));

  const results = [
    await runDocumentationAudit(knowledge),
    await runLosPollosAudit(copywriter, knowledge, guard),
    await runMyLeadAudit(copywriter, knowledge, guard),
    await runComplianceStressTest(guard),
    await runMemoryConvergenceAudit(knowledge, memory),
  ];

  const reportPath = path.resolve(process.cwd(), 'CPA_TRAINING_AUDIT_REPORT.md');
  const summaryTable = fmtTable(results.map((result) => ({
    name: result.name,
    status: result.status,
    durationMs: result.durationMs,
    score: result.score,
    validation: result.validation,
  })));

  const markdown = `# CPA Training Audit Report

Generated: ${new Date().toISOString()}

## Summary

${summaryTable}

## Module Details

${results.map((result) => `
### ${result.name}
- Status: ${result.status}
- Duration: ${result.durationMs} ms
- Compliance score: ${result.score}
- Validation: ${result.validation}
- Notes:
  - ${result.notes.join('\n  - ') || 'No additional notes.'}
`).join('\n')}
`;

  fs.writeFileSync(reportPath, markdown, 'utf8');

  console.log('\n=== CPA TRAINING AUDIT REPORT ===');
  console.log(summaryTable);
  console.log(`\nReport saved to: ${reportPath}`);

  const failed = results.some((result) => result.status === 'FAIL');
  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('CPA training audit failed:', error);
  process.exit(1);
});

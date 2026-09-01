import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { BundleArtifact, EmergencyStopController, RawContext } from './types/pipeline.js';
import { PipelineOrchestrator } from './orchestrator/pipeline.js';
import { CopywriterAgent } from './agents/copy.agent.js';
import { ComplianceGuardAgent } from './agents/guard.agent.js';

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
  bgRed: '\x1b[41m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
};

function renderBundleCard(bundle: BundleArtifact, index: number, total: number): void {
  const cardWidth = 78;
  const line = '─'.repeat(cardWidth);

  console.log(`\n┌${line}┐`);
  console.log(
    `│ ${colors.bold}${colors.magenta}BUNDLE REVIEW [${index + 1}/${total}]${colors.reset} │ ID: ${colors.cyan}${bundle.id.slice(0, 8)}...${colors.reset} │ Platform: ${colors.bold}${bundle.context.platform.toUpperCase().padEnd(8)}${colors.reset} │ Score: ${bundle.compliance && bundle.compliance.score >= 80 ? colors.green : colors.yellow}${bundle.compliance?.score || 0}/100${colors.reset} │`
  );
  console.log(`├${line}┤`);
  console.log(`│ ${colors.bold}Topic:${colors.reset}       ${bundle.context.topicTitle.slice(0, 60)}`);
  console.log(`│ ${colors.bold}Prelander:${colors.reset}   ${bundle.creative?.prelanderSlug || 'N/A'}`);
  console.log(`├${line}┤`);
  console.log(`│ ${colors.yellow}${colors.bold}HEADLINE / OPENER:${colors.reset}`);
  console.log(`│ "${bundle.creative?.headline}"`);
  console.log(`│`);
  console.log(`│ ${colors.bold}BODY STORY:${colors.reset}`);
  const bodyLines = (bundle.creative?.body || '').split('\n');
  for (const bl of bodyLines) {
    console.log(`│ ${bl}`);
  }
  console.log(`│`);
  console.log(`│ ${colors.green}${colors.bold}CALL TO ACTION (CTA):${colors.reset}`);
  console.log(`│ ${bundle.creative?.callToAction}`);
  console.log(`├${line}┤`);
  console.log(`│ ${colors.cyan}${colors.bold}IMAGE PROMPT:${colors.reset}`);
  console.log(`│ ${bundle.creative?.generatedPrompt?.slice(0, 72)}...`);
  if (bundle.compliance?.flaggedKeywords && bundle.compliance.flaggedKeywords.length > 0) {
    console.log(`│ ${colors.red}Flagged Keywords: ${bundle.compliance.flaggedKeywords.join(', ')}${colors.reset}`);
  }
  console.log(`└${line}┘`);
}

function updateBundleOnDisk(bundle: BundleArtifact): void {
  const runsDir = path.resolve(process.cwd(), 'runs', bundle.id);
  if (!fs.existsSync(runsDir)) {
    fs.mkdirSync(runsDir, { recursive: true });
  }
  const filePath = path.join(runsDir, 'bundle.json');
  fs.writeFileSync(filePath, JSON.stringify(bundle, null, 2), 'utf8');
}

export async function runApprovalLoop(bundles: BundleArtifact[]): Promise<BundleArtifact[]> {
  const rl = readline.createInterface({ input, output });
  const copywriter = new CopywriterAgent();
  const complianceGuard = new ComplianceGuardAgent();
  const eStop = EmergencyStopController.getInstance();

  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan} 🛡️  HUMAN-IN-THE-LOOP (HITL) APPROVAL GATEWAY & E-STOP CONTROLLER${colors.reset}`);
  console.log(`${colors.dim} Interactive Verification of Compliant Marketing Bundles${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================================${colors.reset}\n`);

  let compliantBundles = bundles.filter((b) => b.status === 'COMPLIANT');

  if (compliantBundles.length === 0) {
    console.log(`${colors.yellow}⚠️  No COMPLIANT bundles found awaiting human review.${colors.reset}\n`);
    rl.close();
    return bundles;
  }

  let approvedCount = 0;
  let rejectedCount = 0;
  let rerolledCount = 0;

  for (let i = 0; i < compliantBundles.length; i++) {
    let currentBundle = compliantBundles[i];
    let resolved = false;

    while (!resolved) {
      renderBundleCard(currentBundle, i, compliantBundles.length);

      const promptMsg = `${colors.bold}Actions:${colors.reset} [${colors.green}A${colors.reset}]pprove | [${colors.yellow}R${colors.reset}]e-roll | [${colors.red}D${colors.reset}]iscard | [${colors.bgRed}E${colors.reset}]-STOP > `;
      const answer = (await rl.question(promptMsg)).trim().toUpperCase();

      if (answer === 'E') {
        console.log(`\n${colors.bgRed}🚨 EMERGENCY STOP INITIATED BY OPERATOR! 🚨${colors.reset}`);
        eStop.trigger('Operator triggered E-STOP during interactive review loop', 'CLI_OPERATOR');
        currentBundle.status = 'HALTED';
        currentBundle.tracePath.push('HALTED');
        updateBundleOnDisk(currentBundle);
        rl.close();
        process.exit(1);
      } else if (answer === 'A') {
        currentBundle.status = 'APPROVED';
        currentBundle.tracePath.push('APPROVED');
        updateBundleOnDisk(currentBundle);
        approvedCount++;
        resolved = true;
        console.log(`${colors.green}${colors.bold}  ✅ Bundle Approved for Dispatch${colors.reset}`);
      } else if (answer === 'D') {
        currentBundle.status = 'REJECTED';
        currentBundle.tracePath.push('REJECTED');
        updateBundleOnDisk(currentBundle);
        rejectedCount++;
        resolved = true;
        console.log(`${colors.red}${colors.bold}  ❌ Bundle Discarded${colors.reset}`);
      } else if (answer === 'R') {
        console.log(`\n${colors.yellow}🔄 Re-rolling creative via CopywriterAgent & ComplianceGuardAgent...${colors.reset}`);
        try {
          const newCreative = await copywriter.execute(
            currentBundle.context,
            currentBundle.creative?.prelanderSlug || 'dating-quiz-v1'
          );
          const newCompliance = await complianceGuard.evaluate(
            newCreative,
            currentBundle.context.platform
          );

          currentBundle.creative = newCreative;
          currentBundle.compliance = newCompliance;
          currentBundle.tracePath.push('REROLLED');

          if (newCompliance.passed) {
            currentBundle.status = 'COMPLIANT';
            currentBundle.tracePath.push('COMPLIANT');
          } else {
            currentBundle.status = 'REJECTED';
            currentBundle.tracePath.push('REJECTED');
          }

          updateBundleOnDisk(currentBundle);
          rerolledCount++;
          console.log(`${colors.green}  ✨ Regeneration complete! Score: ${newCompliance.score}/100${colors.reset}`);
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`  ❌ Re-roll failed: ${errorMsg}`);
        }
      } else {
        console.log(`${colors.dim}Invalid key. Please press A, R, D, or E.${colors.reset}`);
      }
    }
  }

  rl.close();

  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`\n🏁 ${colors.bold}HITL Review Completed:${colors.reset}`);
  console.log(`   - Approved: ${colors.green}${colors.bold}${approvedCount}${colors.reset}`);
  console.log(`   - Discarded: ${colors.red}${colors.bold}${rejectedCount}${colors.reset}`);
  console.log(`   - Re-rolled: ${colors.yellow}${colors.bold}${rerolledCount}${colors.reset}\n`);

  return bundles;
}

/**
 * CLI Entry point with mock verification data
 */
async function main() {
  const orchestrator = new PipelineOrchestrator();

  const mockContexts: RawContext[] = [
    {
      platform: 'reddit',
      sourceUrl: 'https://reddit.com/r/dating_advice/comments/dating_fatigue',
      topicTitle: 'Dating apps feel like a full-time unpaid job with zero genuine connections',
      sourceText:
        'I have been on Tinder and Hinge for 6 months. Constant swiping, small talk that dies after 3 messages, and ghosting. Looking for intentional social meetups or verified community events.',
      targetAudiencePain: 'Swipe fatigue, endless ghosting, shallow interactions, wasting hours on superficial apps',
      metadata: {
        subreddit: 'dating_advice',
        authorKarma: 4200,
        vertical: 'dating',
      },
    },
    {
      platform: 'quora',
      sourceUrl: 'https://quora.com/how-to-manage-freelance-finances',
      topicTitle: 'How can freelancers manage fluctuating income without stress?',
      sourceText:
        'As a self-employed designer, my income changes monthly. Traditional budgeting apps do not fit irregular cashflow. Need automated savings or smart buffers.',
      targetAudiencePain: 'Income instability, unpredictable cashflow, lack of automated buffer systems for self-employed',
      metadata: {
        topic: 'Personal Finance',
        vertical: 'finance',
      },
    },
  ];

  console.log(`\n🚀 Initializing Pipeline Orchestration for ${mockContexts.length} contexts...`);
  const processedBundles = await orchestrator.processBatch(mockContexts, 'interactive-quiz-v1', {
    concurrency: 2,
  });

  await runApprovalLoop(processedBundles);
}

if (process.argv[1] && (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('index.js'))) {
  main().catch((err) => {
    console.error('Fatal CLI Error:', err);
    process.exit(1);
  });
}

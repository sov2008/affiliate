import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ContentPipeline, PipelineInput } from '../../core/src/workers/contentPipeline.js';
import { ContentQueueRepository, TargetPlatform } from '../../core/src/db/queueRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../core/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

// Parse command line arguments
function parseArgs(): {
  count: number;
  topic: string;
  niche: string;
  campaignId: string;
  platform: TargetPlatform;
  concurrency: number;
} {
  const args = process.argv.slice(2);
  let count = 3;
  let topic = 'Authentic modern dating advice and meaningful lifestyle connections';
  let niche = 'Dating & Lifestyle';
  let campaignId = 'cmp_lospollos_dating';
  let platform: TargetPlatform = 'reddit';
  const concurrency = 2;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--count' || arg === '-c' || arg === '-n') && args[i + 1]) {
      count = parseInt(args[i + 1], 10) || 3;
      i++;
    } else if ((arg === '--topic' || arg === '-t') && args[i + 1]) {
      topic = args[i + 1];
      i++;
    } else if (arg === '--niche' && args[i + 1]) {
      niche = args[i + 1];
      i++;
    } else if (arg === '--campaign' && args[i + 1]) {
      campaignId = args[i + 1];
      i++;
    } else if (arg === '--platform' && args[i + 1]) {
      const p = args[i + 1].toLowerCase();
      if (['reddit', 'quora', 'twitter', 'medium'].includes(p)) {
        platform = p as TargetPlatform;
      }
      i++;
    }
  }

  return { count, topic, niche, campaignId, platform, concurrency };
}

/**
 * Concurrency runner for processing tasks in parallel up to maxConcurrency
 */
async function runWithConcurrency<T, R>(items: T[], fn: (item: T, idx: number) => Promise<R>, maxConcurrency: number): Promise<R[]> {
  const results: R[] = [];
  let currentIndex = 0;

  async function worker(): Promise<void> {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      const res = await fn(items[idx], idx);
      results[idx] = res;
    }
  }

  const workers = Array.from({ length: Math.min(maxConcurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  const config = parseArgs();
  const db = ContentQueueRepository.getInstance();

  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan} ⚡  BATCH CONTENT GENERATOR & SQLITE QUEUE INGESTION${colors.reset}`);
  console.log(`${colors.dim} Batch Size: ${config.count} | Platform: ${config.platform.toUpperCase()} | Campaign: ${config.campaignId}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================================${colors.reset}\n`);

  console.log(`🎯 ${colors.bold}Target Topic:${colors.reset} "${config.topic}"`);
  console.log(`📊 ${colors.bold}Niche:${colors.reset} ${config.niche}`);
  console.log(`⚙️  ${colors.bold}Concurrency Limit:${colors.reset} ${config.concurrency}\n`);

  const tasks = Array.from({ length: config.count }, (_, i) => ({
    topic: `${config.topic} (Angle Variation #${i + 1})`,
    niche: config.niche,
    campaignId: config.campaignId,
    targetAudience: 'Active community members seeking genuine solutions',
  }));

  const startTime = Date.now();
  let enqueuedCount = 0;
  let rejectedComplianceCount = 0;

  await runWithConcurrency(
    tasks,
    async (taskInput: PipelineInput, idx: number) => {
      const postNum = idx + 1;
      console.log(`\n${colors.bold}${colors.magenta}[Task ${postNum}/${config.count}] Starting Generation...${colors.reset}`);
      try {
        const result = await ContentPipeline.execute(taskInput);

        if (result.compliance.is_compliant && result.compliance.risk_score <= 35) {
          const item = db.enqueue({
            campaign_id: result.campaignId,
            target_platform: config.platform,
            hook: result.copy.hook,
            body: result.copy.body,
            cta: result.copy.callToAction,
            image_path: result.creative.imageUrl,
            risk_score: result.compliance.risk_score,
            status: 'PENDING_APPROVAL',
          });

          enqueuedCount++;
          console.log(
            `${colors.green}${colors.bold}✅ [Task ${postNum} Enqueued]${colors.reset} ID: ${colors.cyan}${item.id}${colors.reset} | Risk: ${item.risk_score}/100`
          );
        } else {
          rejectedComplianceCount++;
          console.warn(
            `${colors.yellow}⚠️ [Task ${postNum} Dropped] Risk score ${result.compliance.risk_score}/100 was too high: ${result.compliance.critique}${colors.reset}`
          );
        }
      } catch (err: any) {
        console.error(`${colors.red}❌ [Task ${postNum} Failed] Error:${colors.reset}`, err.message);
      }
    },
    config.concurrency
  );

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const queueStats = db.getStats();

  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`\n${colors.bold}🎉 Batch Generation Complete in ${colors.green}${totalTime}s${colors.reset}!`);
  console.log(`   - Enqueued for Review: ${colors.green}${colors.bold}${enqueuedCount}${colors.reset}`);
  console.log(`   - Compliance Dropped:  ${rejectedComplianceCount}`);
  console.log(`\n📊 ${colors.bold}Current SQLite Queue Status:${colors.reset}`);
  console.log(
    `   Total: ${queueStats.total} | Pending Approval: ${colors.yellow}${queueStats.pending}${colors.reset} | Approved: ${colors.green}${queueStats.approved}${colors.reset} | Dispatched: ${colors.blue}${queueStats.dispatched}${colors.reset}\n`
  );
  console.log(`${colors.dim}💡 Run 'npm run queue:review' to interactively approve or reject pending posts.${colors.reset}\n`);
}

main();

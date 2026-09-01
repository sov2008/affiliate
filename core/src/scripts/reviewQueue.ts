import path from 'path';
import dotenv from 'dotenv';
import prompts from 'prompts';
import { ContentQueueRepository, ContentQueueItem } from '../db/queueRepository.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
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
  bgYellow: '\x1b[43m\x1b[30m',
};

function renderCard(item: ContentQueueItem, index: number, total: number): void {
  const cardWidth = 78;
  const line = '─'.repeat(cardWidth);

  console.log(`\n┌${line}┐`);
  console.log(
    `│ ${colors.bold}${colors.magenta}POST REVIEW [${index + 1}/${total}]${colors.reset} │ ID: ${colors.cyan}${item.id.slice(0, 8)}...${colors.reset} │ Platform: ${colors.bold}${item.target_platform.toUpperCase().padEnd(8)}${colors.reset} │ Risk: ${item.risk_score < 25 ? colors.green : colors.yellow}${item.risk_score}/100${colors.reset} │`
  );
  console.log(`├${line}┤`);
  console.log(`│ ${colors.bold}Campaign:${colors.reset} ${item.campaign_id.padEnd(30)} │ ${colors.bold}Network:${colors.reset} ${colors.cyan}${item.network.toUpperCase()}${colors.reset}`);
  console.log(`│ ${colors.bold}Created:${colors.reset}  ${new Date(item.created_at).toLocaleString()}`);
  console.log(`├${line}┤`);
  console.log(`│ ${colors.yellow}${colors.bold}HOOK / HEADLINE:${colors.reset}`);
  console.log(`│ "${item.hook}"`);
  console.log(`│`);
  console.log(`│ ${colors.bold}BODY STORY:${colors.reset}`);
  console.log(`│ ${item.body}`);
  console.log(`│`);
  console.log(`│ ${colors.green}${colors.bold}STEALTH CALL TO ACTION (CTA):${colors.reset}`);
  console.log(`│ ${item.stealth_cta || (item as any).cta}`);
  console.log(`├${line}┤`);
  console.log(`│ ${colors.cyan}${colors.bold}IMAGE CREATIVE ASSET:${colors.reset}`);
  console.log(`│ ${item.image_path}`);
  if (item.tracking_url) {
    console.log(`│ ${colors.dim}Tracking URL: ${item.tracking_url.slice(0, 60)}...${colors.reset}`);
  }
  console.log(`└${line}┘`);
}

async function main() {
  const repo = ContentQueueRepository.getInstance();
  const args = process.argv.slice(2);
  const isListOnly = args.includes('--list') || args.includes('-l');
  const isAutoApprove = args.includes('--auto-approve') || args.includes('-y');

  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan} 🛡️  INTERACTIVE APPROVAL GATEKEEPER CLI${colors.reset}`);
  console.log(`${colors.dim} SQLite Content Queue Management & Moderation${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================================${colors.reset}\n`);

  const pendingItems = repo.listPending();
  const stats = repo.getStats();

  console.log(`📊 ${colors.bold}Queue Overview:${colors.reset}`);
  console.log(
    `   Pending Approval: ${colors.yellow}${colors.bold}${stats.pending}${colors.reset} | Approved: ${colors.green}${stats.approved}${colors.reset} | Rejected: ${colors.red}${stats.rejected}${colors.reset} | Dispatched: ${colors.blue}${stats.dispatched}${colors.reset} | Total: ${stats.total}\n`
  );

  if (pendingItems.length === 0) {
    console.log(`${colors.green}✨ No pending posts in queue! All content reviewed.${colors.reset}\n`);
    return;
  }

  if (isListOnly) {
    console.log(`${colors.bold}Pending Posts in Queue (${pendingItems.length}):${colors.reset}`);
    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      console.log(` [${i + 1}] ID: ${item.id.slice(0, 8)} | [${item.network.toUpperCase()} / ${item.target_platform.toUpperCase()}] Hook: "${item.hook.slice(0, 40)}..." (Risk: ${item.risk_score})`);
    }
    console.log(`\n${colors.dim}Run 'npm run queue:review' without flags for interactive review mode.${colors.reset}\n`);
    return;
  }

  let approved = 0;
  let rejected = 0;
  let skipped = 0;
  let deleted = 0;

  for (let i = 0; i < pendingItems.length; i++) {
    const item = pendingItems[i];
    renderCard(item, i, pendingItems.length);

    if (isAutoApprove) {
      repo.updateStatus(item.id, 'APPROVED');
      approved++;
      console.log(`${colors.green}${colors.bold}  ✅ Automatically Approved (--auto-approve active)${colors.reset}`);
      continue;
    }

    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'Select action for this post:',
      choices: [
        { title: '✅ [A] Approve for Publishing', value: 'APPROVE' },
        { title: '❌ [R] Reject / Archive', value: 'REJECT' },
        { title: '⏭️  [S] Skip (Review later)', value: 'SKIP' },
        { title: '🗑️  [D] Delete from Queue', value: 'DELETE' },
        { title: '🚪 [Q] Quit Review Session', value: 'QUIT' },
      ],
      initial: 0,
    });

    if (!response.action || response.action === 'QUIT') {
      console.log(`\n${colors.yellow}Review session closed by operator.${colors.reset}`);
      break;
    }

    if (response.action === 'APPROVE') {
      repo.updateStatus(item.id, 'APPROVED');
      approved++;
      console.log(`${colors.green}${colors.bold}  ✅ Status updated to: APPROVED${colors.reset}`);
    } else if (response.action === 'REJECT') {
      repo.updateStatus(item.id, 'REJECTED');
      rejected++;
      console.log(`${colors.red}${colors.bold}  ❌ Status updated to: REJECTED${colors.reset}`);
    } else if (response.action === 'SKIP') {
      skipped++;
      console.log(`${colors.yellow}  ⏭️  Skipped. Remains PENDING_APPROVAL${colors.reset}`);
    } else if (response.action === 'DELETE') {
      repo.deleteItem(item.id);
      deleted++;
      console.log(`${colors.dim}  🗑️  Permanently deleted from database${colors.reset}`);
    }
  }

  const updatedStats = repo.getStats();
  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`\n${colors.bold}🏁 Review Session Summary:${colors.reset}`);
  console.log(`   - Approved: ${colors.green}${colors.bold}${approved}${colors.reset}`);
  console.log(`   - Rejected: ${colors.red}${colors.bold}${rejected}${colors.reset}`);
  console.log(`   - Skipped:  ${colors.yellow}${skipped}${colors.reset}`);
  console.log(`   - Deleted:  ${colors.dim}${deleted}${colors.reset}`);
  console.log(`\n📊 ${colors.bold}Updated SQLite Queue Status:${colors.reset}`);
  console.log(
    `   Total: ${updatedStats.total} | Pending Approval: ${colors.yellow}${updatedStats.pending}${colors.reset} | Approved: ${colors.green}${updatedStats.approved}${colors.reset} | Dispatched: ${colors.blue}${updatedStats.dispatched}${colors.reset}\n`
  );
}

main();

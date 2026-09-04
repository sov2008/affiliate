import path from 'path';
import dotenv from 'dotenv';
import { ContentQueueRepository } from '../db/queueRepository.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

function timestamp(): string {
  return new Date().toISOString();
}

async function checkQueueStatus(): Promise<void> {
  console.log('\n📊 ================================================================');
  console.log('📊 CONTENT QUEUE STATUS & DATABASE INTEGRITY AUDIT');
  console.log('📊 ================================================================\n');

  const repo = ContentQueueRepository.getInstance();
  const stats = repo.getStats();

  console.log(`[${timestamp()}] 🔍 Reading SQLite queue state...`);

  // Получаем детальные выборки по категориям
  const pendingItems = repo.listPending(10);
  const approvedItems = repo.listApproved(10);
  const rejectedItems = repo.listAll('REJECTED', 10);
  const dispatchedItems = repo.listDispatched(Date.now() - 7 * 24 * 3600 * 1000, 10);

  console.log('\n📈 Сводная статистика очереди контента:');
  console.log('+' + '-'.repeat(26) + '+' + '-'.repeat(12) + '+');
  console.log(`| ${'Статус задачи'.padEnd(24)} | ${'Количество'.padEnd(10)} |`);
  console.log('+' + '-'.repeat(26) + '+' + '-'.repeat(12) + '+');
  console.log(`| ⏳ PENDING_APPROVAL       | ${String(stats.pendingApproval).padEnd(10)} |`);
  console.log(`| ✅ APPROVED               | ${String(stats.approved).padEnd(10)} |`);
  console.log(`| ❌ REJECTED               | ${String(stats.rejected).padEnd(10)} |`);
  console.log(`| 🚀 DISPATCHED (POSTED)    | ${String(stats.dispatched).padEnd(10)} |`);
  console.log(`| ⚠️ FAILED                 | ${String(stats.failed).padEnd(10)} |`);
  console.log('+' + '-'.repeat(26) + '+' + '-'.repeat(12) + '+');
  console.log(`| 📦 ВСЕГО В БАЗЕ           | ${String(stats.total).padEnd(10)} |`);
  console.log('+' + '-'.repeat(26) + '+' + '-'.repeat(12) + '+');

  if (pendingItems.length > 0) {
    console.log(`\n⏳ Последние задачи на модерации (HITL):`);
    for (const item of pendingItems.slice(0, 3)) {
      console.log(`  • [${item.id.slice(0, 8)}] [${item.target_platform}] Hook: "${item.hook.slice(0, 45)}..." | Risk: ${item.risk_score}`);
    }
  }

  if (approvedItems.length > 0) {
    console.log(`\n✅ Одобренные задачи (готовы к публикации):`);
    for (const item of approvedItems.slice(0, 3)) {
      console.log(`  • [${item.id.slice(0, 8)}] [${item.target_platform}] Hook: "${item.hook.slice(0, 45)}..."`);
    }
  }

  console.log('\n================================================================');
  console.log('✅ ПРОВЕРКА СОСТОЯНИЯ ОЧЕРЕДИ УСПЕШНО ВЫПОЛНЕНА');
  console.log('================================================================\n');
}

checkQueueStatus().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error('\n❌ [Queue Check Failed]:', msg);
  process.exit(1);
});

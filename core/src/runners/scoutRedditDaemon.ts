import dotenv from 'dotenv';
import path from 'path';
import { scoutRedditWorker } from '../workers/scout-reddit.worker.js';

// Загрузка конфигурации переменных окружения
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const CYCLE_INTERVAL_MS = 10 * 60 * 1000; // 10 минут

function timestamp(): string {
  return new Date().toISOString();
}

async function runDaemonLoop(): Promise<void> {
  console.log(`[${timestamp()}] 🛡️ [ScoutRedditDaemon] Инициализация демона Reddit Scout [KARMA WARMUP / FARMING MODE]...`);
  console.log(`[${timestamp()}] 🎯 [ScoutRedditDaemon] Целевые сабреддиты: r/AskReddit, r/CasualConversation, r/NoStupidQuestions`);
  console.log(`[${timestamp()}] ⏱️ [ScoutRedditDaemon] Интервал опроса: ${CYCLE_INTERVAL_MS / 1000} сек (10 мин).`);

  while (true) {
    const cycleStart = Date.now();
    try {
      console.log(`\n[${timestamp()}] 🚀 [ScoutRedditDaemon] Запуск цикла сканирования субреддитов...`);
      const result = await scoutRedditWorker.runScoutCycle();
      console.log(`[${timestamp()}] 📊 [ScoutRedditDaemon] Результаты цикла: Scanned=${result.scanned}, Matched=${result.matched}, Alerted=${result.alerted}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      console.error(`[${timestamp()}] ❌ [ScoutRedditDaemon Error]: ${msg}`);
    }

    const elapsed = Date.now() - cycleStart;
    const sleepTime = Math.max(5000, CYCLE_INTERVAL_MS - elapsed);
    console.log(`[${timestamp()}] 💤 [ScoutRedditDaemon] Ожидание следующего цикла (${(sleepTime / 1000).toFixed(0)}с)...`);
    await new Promise((resolve) => setTimeout(resolve, sleepTime));
  }
}

// Корректная обработка сигналов завершения от PM2
process.on('SIGINT', () => {
  console.log(`[${timestamp()}] 🛑 [ScoutRedditDaemon] Получен сигнал SIGINT. Завершение работы...`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`[${timestamp()}] 🛑 [ScoutRedditDaemon] Получен сигнал SIGTERM. Завершение работы...`);
  process.exit(0);
});

runDaemonLoop().catch((err: unknown) => {
  console.error(`[${timestamp()}] 💥 [ScoutRedditDaemon Fatal]:`, err);
  process.exit(1);
});

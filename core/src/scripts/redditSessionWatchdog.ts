import path from 'path';
import dotenv from 'dotenv';
import { TelegramControlBot } from '../services/telegram-control-bot.service.js';
import {
  getRedditAccountStatus,
  saveRedditAccountStatus,
  WARMUP_WHITELIST_SUBREDDITS,
  RedditAccountStatus,
} from '../services/reddit-account-state.js';

// Загрузка переменных окружения
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const CHECK_INTERVAL_MS = 30 * 60 * 1000; // Проверка каждые 30 минут
const EXPECTED_USERNAME = process.env.REDDIT_USERNAME || 'sov2008';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function timestamp(): string {
  return new Date().toISOString();
}

interface ValidationStatus {
  healthy: boolean;
  username?: string;
  comment_karma?: number;
  link_karma?: number;
  total_karma?: number;
  statusCode?: number;
  errorMessage?: string;
}

async function validateRedditSession(sessionCookie: string): Promise<ValidationStatus> {
  if (!sessionCookie) {
    return {
      healthy: false,
      errorMessage: 'REDDIT_SESSION_COOKIE отсутствует или пуст в .env',
    };
  }

  try {
    const res = await fetch('https://www.reddit.com/api/me.json', {
      headers: {
        'User-Agent': USER_AGENT,
        Cookie: `reddit_session=${sessionCookie}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      return {
        healthy: false,
        statusCode: res.status,
        errorMessage: `HTTP ${res.status}: Сессия не авторизована либо заблокирована Reddit`,
      };
    }

    if (!res.ok) {
      return {
        healthy: false,
        statusCode: res.status,
        errorMessage: `HTTP ${res.status} ${res.statusText}`,
      };
    }

    const json: any = await res.json();
    if (json?.error) {
      return {
        healthy: false,
        statusCode: typeof json.error === 'number' ? json.error : 403,
        errorMessage: `Reddit API Error: ${JSON.stringify(json.error)}`,
      };
    }

    const username = json?.data?.name;
    const commentKarma = Number(json?.data?.comment_karma ?? 0);
    const linkKarma = Number(json?.data?.link_karma ?? 0);
    const totalKarma = Number(json?.data?.total_karma ?? (commentKarma + linkKarma));

    if (!username) {
      return {
        healthy: false,
        errorMessage: 'Поле data.name отсутствует в ответе /api/me.json',
      };
    }

    if (username.toLowerCase() !== EXPECTED_USERNAME.toLowerCase()) {
      return {
        healthy: false,
        username,
        errorMessage: `Несоответствие аккаунта: ожидался ${EXPECTED_USERNAME}, получен ${username}`,
      };
    }

    return {
      healthy: true,
      username,
      comment_karma: commentKarma,
      link_karma: linkKarma,
      total_karma: totalKarma,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      healthy: false,
      errorMessage: `Сетевая ошибка запроса к Reddit: ${msg}`,
    };
  }
}

async function dispatchAlert(bot: TelegramControlBot, adminChatId: string, errorDetail: string): Promise<void> {
  const alertText = `
🚨 <b>[КРИТИЧЕСКИЙ АЛЕРТ // REDDIT WATCHDOG]</b> 🚨
━━━━━━━━━━━━━━━━━━
⚠️ <b>Внимание: Сессия Reddit протухла. Требуется обновление Reddit_cookie.txt</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Ожидаемый аккаунт:</b> u/<code>${EXPECTED_USERNAME}</code>
⏰ <b>Время обнаружения:</b> ${new Date().toLocaleTimeString('ru-RU')} (UTC+3)
🛑 <b>Причина сбоя:</b> <code>${errorDetail}</code>

📋 <b>План действий:</b>
1. Скопируйте свежую сессионную куку в <code>C:\\Users\\user\\Desktop\\Reddit_cookie.txt</code>
2. Запустите синхронизацию:
<code>npx --prefix core tsx core/src/scripts/syncRedditSession.ts</code>
━━━━━━━━━━━━━━━━━━
⚡ <i>Автономные постеры Reddit переведены в режим ожидания</i>
  `.trim();

  try {
    await bot.sendMessage(adminChatId, alertText, { parse_mode: 'HTML' });
    console.log(`[${timestamp()}] 📨 Критический алерт об инвалидации сессии отправлен в Telegram (${adminChatId}).`);
  } catch (e: any) {
    console.error(`[${timestamp()}] ❌ Ошибка при отправке алерта в Telegram:`, e.message);
  }
}

async function dispatchKarmaMilestoneAlert(bot: TelegramControlBot, adminChatId: string, commentKarma: number): Promise<void> {
  const alertText = `
🎉 <b>Карма достигла ${commentKarma}! Разблокирован доступ к r/dating</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Аккаунт:</b> u/<code>${EXPECTED_USERNAME}</code>
📊 <b>Comment Karma:</b> <b>${commentKarma}</b> (Порог >= 30 достигнут!)
🔓 <b>Разблокировано:</b> Доступ к r/dating открыт
━━━━━━━━━━━━━━━━━━
🛡️ <i>Ограничение WARMUP снято. Разрешена публикация в целевые сабреддиты знакомств.</i>
  `.trim();

  try {
    await bot.sendMessage(adminChatId, alertText, { parse_mode: 'HTML' });
    console.log(`[${timestamp()}] 📨 Алерт о разблокировке кармы (>= 30) отправлен в Telegram (${adminChatId}).`);
  } catch (e: any) {
    console.error(`[${timestamp()}] ❌ Ошибка при отправке алерта кармы в Telegram:`, e.message);
  }
}

async function runWatchdogLoop(): Promise<void> {
  console.log(`[${timestamp()}] 🛡️ [RedditWatchdog] Запуск сторожевого сервиса проверки сессии и кармы Reddit...`);
  console.log(`[${timestamp()}] ⏱️ [RedditWatchdog] Интервал проверок: каждые ${CHECK_INTERVAL_MS / 60000} мин.`);

  const bot = TelegramControlBot.getInstance();
  const adminChatId = bot.getAdminChatId() || process.env.ADMIN_CHAT_ID || '808343978';

  let hasSentAlertForCurrentFailure = false;

  while (true) {
    const sessionCookie = process.env.REDDIT_SESSION_COOKIE || '';
    console.log(`\n[${timestamp()}] 🔍 [RedditWatchdog] Проверка сессии и comment_karma для u/${EXPECTED_USERNAME}...`);

    const result = await validateRedditSession(sessionCookie);

    if (result.healthy && result.comment_karma !== undefined) {
      const commentKarma = result.comment_karma;
      const previousState = getRedditAccountStatus();
      const thresholdReached = commentKarma >= 30;

      console.log(
        `[${timestamp()}] ✅ [RedditWatchdog] Сессия активна: u/${result.username} | Comment Karma: ${commentKarma} | Link Karma: ${result.link_karma} | Total: ${result.total_karma}`
      );
      console.log(
        `[${timestamp()}] 🛡️ [RedditWatchdog] Режим: ${
          thresholdReached
            ? '🔥 UNLOCKED (Разрешен доступ к r/dating и коммерческим сабреддитам)'
            : '🌱 WARMUP (Разрешен скаутинг и постинг ТОЛЬКО в whitelist: r/AskReddit, r/NoStupidQuestions, r/CasualConversation)'
        }`
      );

      // Проверка преодоления барьера в 30 кармы
      if (thresholdReached && !previousState.karma_threshold_reached) {
        console.log(`[${timestamp()}] 🚀 [RedditWatchdog] ОБНАРУЖЕНО ПРЕОДОЛЕНИЕ ПОРОГА КАРМЫ: ${commentKarma} >= 30!`);
        await dispatchKarmaMilestoneAlert(bot, adminChatId, commentKarma);
      }

      // Атомарное сохранение текущего состояния аккаунта в SQLite/JSON
      saveRedditAccountStatus({
        username: result.username || EXPECTED_USERNAME,
        comment_karma: commentKarma,
        link_karma: result.link_karma ?? 0,
        total_karma: result.total_karma ?? commentKarma,
        karma_threshold_reached: thresholdReached,
        allowed_subreddits: thresholdReached
          ? ['dating', ...WARMUP_WHITELIST_SUBREDDITS]
          : [...WARMUP_WHITELIST_SUBREDDITS],
        updated_at: Date.now(),
      });

      hasSentAlertForCurrentFailure = false;
    } else {
      console.error(`[${timestamp()}] 🚨 [RedditWatchdog] Сбой валидации: ${result.errorMessage}`);
      if (!hasSentAlertForCurrentFailure) {
        await dispatchAlert(bot, adminChatId, result.errorMessage || 'Неизвестная ошибка сессии');
        hasSentAlertForCurrentFailure = true;
      }
    }

    console.log(`[${timestamp()}] 💤 [RedditWatchdog] Ожидание следующего цикла (${CHECK_INTERVAL_MS / 60000} мин)...`);
    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL_MS));
  }
}

// Корректная обработка сигналов PM2
process.on('SIGINT', () => {
  console.log(`[${timestamp()}] 🛑 [RedditWatchdog] Получен SIGINT. Остановка сервиса...`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`[${timestamp()}] 🛑 [RedditWatchdog] Получен SIGTERM. Остановка сервиса...`);
  process.exit(0);
});

runWatchdogLoop().catch((err: unknown) => {
  console.error(`[${timestamp()}] 💥 [RedditWatchdog Fatal]:`, err);
  process.exit(1);
});

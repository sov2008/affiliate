import path from 'path';
import dotenv from 'dotenv';
import { TelegramControlBot } from '../services/telegram-control-bot.service.js';
import { ContentQueueRepository } from '../db/queueRepository.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

async function sendTestHitlNotification(): Promise<void> {
  console.log('\n📡 ================================================================');
  console.log('📡 DISPATCH TEST HITL MODERATION ALERT TO TELEGRAM ADMIN');
  console.log('📡 ================================================================\n');

  const bot = TelegramControlBot.getInstance();
  const adminChatId = bot.getAdminChatId() || process.env.ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (!bot.isConfigured()) {
    throw new Error('[HITL Test] TELEGRAM_BOT_TOKEN не сконфигурирован в окружении.');
  }

  if (!adminChatId) {
    throw new Error('[HITL Test] ADMIN_CHAT_ID или TELEGRAM_CHAT_ID отсутствует в .env.');
  }

  console.log(`👤 Admin Chat ID: ${adminChatId}`);
  console.log(`🤖 Bot Service Status: Configured (Online)`);

  // Создаем тестовую запись в очереди контента
  const repo = ContentQueueRepository.getInstance();
  const testItem = repo.enqueue({
    campaign_id: 'cmp_dating_reddit_hitl',
    network: 'lospollos',
    target_platform: 'reddit',
    hook: 'Tinder algorithm feels like a paywall trap now',
    body: 'tbh, the ghosting isn\'t random, it\'s engineered. If you\'ve noticed that matches drop off sharply after the first week, that\'s standard ELO decay designed to trigger subscription sales. I ditched the swipe fatigue for a direct local matching method that actually respects your time.',
    stealth_cta: 'Documented the full breakdown and the filtering bot I use in my profile bio if anyone needs a sanity check.',
    image_path: '/output/creatives/cmp_dating_reddit_hitl.jpg',
    tracking_url: 'https://trk.lospollos.com/smartlink/dating?aff=sov2008&s1=hitl_test',
    risk_score: 12,
    status: 'PENDING_APPROVAL',
  });

  console.log(`📦 Создана тестовая запись в очереди: ID = ${testItem.id} (Статус: PENDING_APPROVAL)`);

  const alertText = `
🎯 <b>[HITL MODERATION] Новый черновик для Reddit</b>
━━━━━━━━━━━━━━━━━━
📌 <b>Субреддит:</b> r/dating
🔗 <b>Тред:</b> <a href="https://reddit.com/r/dating/comments/test_sample_101">Tinder algorithm feels like a paywall trap now</a>
👤 <b>Автор треда:</b> u/dating_insider
🛡️ <b>Lexicon Guard:</b> <b>100% PASSED (Zero-URL, Bio-bridge)</b>
📦 <b>Queue Item ID:</b> <code>${testItem.id}</code>

📝 <b>Сгенерированный нативный ответ:</b>
<pre>${testItem.body}\n\n${testItem.stealth_cta}</pre>
━━━━━━━━━━━━━━━━━━
⚡ <i>Выберите действие для модерации перед публикацией:</i>
  `.trim();

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Одобрить (Approve)', callback_data: `approve_${testItem.id}` },
        { text: '🔄 Пересоздать (Re-roll)', callback_data: `reroll_${testItem.id}` },
      ],
      [
        { text: '❌ Отклонить (Reject)', callback_data: `reject_${testItem.id}` },
        { text: '🌐 Открыть тред', url: 'https://reddit.com/r/dating' },
      ],
      [
        { text: '🚨 Экстренный E-STOP', callback_data: `estop_${testItem.id}` },
      ],
    ],
  };

  console.log('\n📨 Отправка интерактивного сообщения в Telegram...');
  const sent = await bot.sendMessage(adminChatId, alertText, {
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard,
  });

  if (!sent) {
    throw new Error('[HITL Test] Ошибка при отправке сообщения через Telegram Bot API.');
  }

  console.log('\n================================================================');
  console.log('✅ ИНТЕРАКТИВНОЕ СООБЩЕНИЕ HITL УСПЕШНО ДОСТАВЛЕНО В TELEGRAM!');
  console.log('================================================================\n');
}

sendTestHitlNotification().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error('\n❌ [HITL Test Failed]:', msg);
  process.exit(1);
});

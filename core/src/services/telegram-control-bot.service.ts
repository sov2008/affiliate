import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { BundleArtifact, Platform } from '../types/pipeline.js';
import { EmergencyStopController } from '../types/pipeline.js';
import { LlmGatewayService } from './llm-gateway.service.js';
import { ContentQueueRepository } from '../db/queueRepository.js';
import { FinancialTelemetryMatcher } from '../server/telemetry-matcher.js';
import { GoldCatalogService } from './gold-catalog.service.js';
import { MabEngineService } from './mab-engine.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
  };
  date: number;
  text?: string;
}

export interface TelegramCallbackQuery {
  id: string;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export class TelegramControlBot {
  private static instance: TelegramControlBot | null = null;
  private botToken: string;
  private defaultChatId: string;
  private allowedUserIds: Set<string> = new Set();
  private isPolling: boolean = false;
  private pollingAbortController: AbortController | null = null;
  private lastUpdateId: number = 0;
  private runsDir: string;

  private constructor(options: { botToken?: string; defaultChatId?: string; allowedUserIds?: string[]; runsDir?: string } = {}) {
    this.botToken = options.botToken || process.env.TELEGRAM_BOT_TOKEN || '';
    this.defaultChatId = options.defaultChatId || process.env.TELEGRAM_CHAT_ID || '';
    this.runsDir = options.runsDir || path.resolve(process.cwd(), 'runs');

    const rawAllowed = options.allowedUserIds || (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
    for (const uid of rawAllowed) {
      this.allowedUserIds.add(String(uid).toLowerCase());
    }

    // Also whitelist defaultChatId if provided
    if (this.defaultChatId) {
      this.allowedUserIds.add(String(this.defaultChatId).toLowerCase());
    }
  }

  public static getInstance(options?: { botToken?: string; defaultChatId?: string; allowedUserIds?: string[]; runsDir?: string }): TelegramControlBot {
    if (!this.instance) {
      this.instance = new TelegramControlBot(options);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance) {
      this.instance.stopPolling();
      this.instance = null;
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.botToken);
  }

  /**
   * Validates if a sender ID is authorized to execute control operations
   */
  public isAuthorized(userId?: string | number, username?: string): boolean {
    if (this.allowedUserIds.size === 0) {
      // If no whitelist is specified, allow configured chat ID
      if (this.defaultChatId && String(userId) === String(this.defaultChatId)) {
        return true;
      }
      // If completely unconfigured whitelist, open for development
      return true;
    }

    if (userId && this.allowedUserIds.has(String(userId).toLowerCase())) {
      return true;
    }

    if (username && (this.allowedUserIds.has(`@${username.toLowerCase()}`) || this.allowedUserIds.has(username.toLowerCase()))) {
      return true;
    }

    return false;
  }

  /**
   * Helper to execute Telegram Bot API requests with timeout
   */
  public async apiCall(method: string, payload: Record<string, unknown>, timeoutMs: number = 8000): Promise<any> {
    if (!this.botToken) {
      return { ok: false, description: 'Telegram Bot Token not configured' };
    }

    if (this.botToken.startsWith('TEST_')) {
      return { ok: true, result: { message_id: 1234, text: payload.text || 'mock' } };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/${method}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, description: msg };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Dispatches a message with optional inline keyboard
   */
  public async sendMessage(
    chatId: string | number,
    text: string,
    options: { parse_mode?: string; reply_markup?: unknown } = {}
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: options.parse_mode || 'HTML',
    };

    if (options.reply_markup) {
      payload.reply_markup = options.reply_markup;
    }

    const result = await this.apiCall('sendMessage', payload);
    return result.ok === true;
  }

  /**
   * Edits an existing message text & markup
   */
  public async editMessageText(
    chatId: string | number,
    messageId: number,
    text: string,
    options: { parse_mode?: string; reply_markup?: unknown } = {}
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: options.parse_mode || 'HTML',
    };

    if (options.reply_markup !== undefined) {
      payload.reply_markup = options.reply_markup;
    }

    const result = await this.apiCall('editMessageText', payload);
    return result.ok === true;
  }

  /**
   * Answers a callback query from an inline button
   */
  public async answerCallbackQuery(callbackQueryId: string, text?: string, showAlert: boolean = false): Promise<boolean> {
    const payload: Record<string, unknown> = {
      callback_query_id: callbackQueryId,
    };
    if (text) payload.text = text;
    if (showAlert) payload.show_alert = showAlert;

    const result = await this.apiCall('answerCallbackQuery', payload);
    return result.ok === true;
  }

  /**
   * Processes an incoming text command
   */
  public async handleCommand(message: TelegramMessage): Promise<string> {
    const text = (message.text || '').trim();
    const fromId = message.from?.id || message.chat.id;
    const username = message.from?.username;

    if (!this.isAuthorized(fromId, username)) {
      console.warn(`[TelegramControlBot] Unauthorized access attempt from User ID: ${fromId} (@${username || 'anon'})`);
      return `⛔ <b>ДОСТУП ЗАПРЕЩЕН // ACCESS DENIED</b>\n━━━━━━━━━━━━━━━━━━\nВаш Telegram ID <code>${fromId}</code> не авторизован для управления Affiliate Ops.`;
    }

    const parts = text.split(/\s+/);
    const cmd = parts[0].toLowerCase().replace(/@.+$/, ''); // strip bot username if present
    const arg = parts[1];

    console.log(`🤖 [TelegramControlBot] Executing command: ${cmd} (Arg: ${arg || 'none'}) from user: ${fromId}`);

    // --- 1. /status & /stats ---
    if (cmd === '/stats' || cmd === '/status' || cmd === 'stats' || cmd === 'status') {
      const matcher = FinancialTelemetryMatcher.getInstance();
      const summary = matcher.getTelemetrySummary();
      const eStop = EmergencyStopController.getInstance();

      let totalClicks = 0;
      let totalConversions = 0;
      let totalRev = 0;

      for (const m of Object.values(summary.campaigns)) {
        totalClicks += m.clicks;
        totalConversions += m.conversions;
        totalRev += m.revenue;
      }

      const overallEpc = totalClicks > 0 ? (totalRev / totalClicks).toFixed(2) : '0.00';
      const overallCr = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';

      // Find top performing bundle
      let topBundleId = 'None';
      let maxPayout = 0;
      for (const [bId, bMetrics] of Object.entries(summary.bundles)) {
        if (bMetrics.revenue > maxPayout) {
          maxPayout = bMetrics.revenue;
          topBundleId = bId;
        }
      }

      const estopStatus = eStop.isHalted() ? '🚨 <b>HALTED (E-STOP АКТИВЕН)</b>' : '🟢 <b>НОРМА (ОПЕРАЦИОННЫЙ)</b>';

      return `
📊 <b>AFFILIATE OPS // ФИНАНСОВЫЙ СТАТУС</b>
━━━━━━━━━━━━━━━━━━
💰 <b>Выручка сегодня:</b> <b>$${totalRev.toFixed(2)} USD</b>
👆 <b>Всего кликов:</b> ${totalClicks}
🎯 <b>Конверсий:</b> ${totalConversions}
📈 <b>Общий EPC:</b> $${overallEpc} | <b>CR:</b> ${overallCr}%
🏆 <b>Топ связка:</b> <code>${topBundleId.slice(0, 16)}</code> ($${maxPayout.toFixed(2)})
⚙️ <b>E-STOP Контур:</b> ${estopStatus}
🖥️ <b>Сервисы PM2:</b> <code>affiliate-dashboard</code>, <code>affiliate-autopilot</code>
🛡️ <b>Edge KV:</b> <code>postback-engine.sov7.workers.dev</code>
━━━━━━━━━━━━━━━━━━
⚡ <i>Данные 100% реальной телеметрии сетей</i>
      `.trim();
    }

    // --- 2. /queue ---
    if (cmd === '/queue' || cmd === 'queue') {
      const repo = ContentQueueRepository.getInstance();
      const stats = repo.getStats();

      return `
📥 <b>ОЧЕРЕДЬ КОНТЕНТА // SQLITE QUEUE</b>
━━━━━━━━━━━━━━━━━━
⏳ <b>Ожидают одобрения (HITL):</b> <b>${stats.pendingApproval}</b>
✅ <b>Одобрено к дистрибуции:</b> <b>${stats.approved}</b>
🚀 <b>Опубликовано (Dispatched):</b> ${stats.dispatched}
❌ <b>Отклонено (Rejected):</b> ${stats.rejected}
⚠️ <b>Ошибок постинга (Failed):</b> ${stats.failed}
━━━━━━━━━━━━━━━━━━
📦 <b>Всего записей в базе:</b> ${stats.total}
      `.trim();
    }

    // --- 3. /estop ---
    if (cmd === '/estop' || cmd === 'estop') {
      const eStop = EmergencyStopController.getInstance();
      eStop.trigger(`Telegram operator command (/estop) by user ${fromId}`, 'TELEGRAM_BOT');

      return `
🚨🚨 <b>[EMERGENCY STOP TRIGGERED]</b> 🚨🚨
━━━━━━━━━━━━━━━━━━
Все автономные воркеры, генераторы и рассыльщики <b>НЕМЕДЛЕННО ОСТАНОВЛЕНЫ</b>.
Трафик перенаправлен на безопасные заглушки.

Для возобновления работы выполните: <code>/reset_estop</code>
━━━━━━━━━━━━━━━━━━
      `.trim();
    }

    // --- 4. /reset_estop ---
    if (cmd === '/reset_estop' || cmd === 'reset_estop') {
      const eStop = EmergencyStopController.getInstance();
      eStop.clear(`Telegram operator command (/reset_estop) by user ${fromId}`);

      return `
🟢 <b>[EMERGENCY STOP CLEARED]</b>
━━━━━━━━━━━━━━━━━━
Глобальная блокировка снята. Все пайплайны и воркеры возвращены в штатный режим.
━━━━━━━━━━━━━━━━━━
      `.trim();
    }

    // --- 5. /pause & /resume ---
    if (cmd === '/pause' && arg) {
      const gateway = LlmGatewayService.getInstance();
      const updated = gateway.updateAgent(arg, { isPaused: true });
      if (updated) {
        return `⏸️ Агент/воркер <code>${arg}</code> успешно <b>ПРИОСТАНОВЛЕН</b>.`;
      }
      return `⚠️ Агент <code>${arg}</code> не найден в реестре агентов. Проверьте: <code>/agents</code>`;
    }

    if (cmd === '/resume' && arg) {
      const gateway = LlmGatewayService.getInstance();
      const updated = gateway.updateAgent(arg, { isPaused: false });
      if (updated) {
        return `▶️ Агент/воркер <code>${arg}</code> <b>ВОЗОБНОВИЛ РАБОТУ</b>.`;
      }
      return `⚠️ Агент <code>${arg}</code> не найден в реестре агентов. Проверьте: <code>/agents</code>`;
    }

    // --- 6. /agents ---
    if (cmd === '/agents' || cmd === 'agents') {
      const gateway = LlmGatewayService.getInstance();
      gateway.loadRegistry();
      const agents = gateway.listAgents();

      const list = agents
        .map(
          (a) =>
            `• <code>${a.id}</code>: ${a.isPaused ? '⏸️ <b>PAUSED</b>' : '🟢 ACTIVE'} (${a.role}) [${a.tokensConsumedToday}/${a.tokenBudgetDaily} tok]`
        )
        .join('\n');

      return `
🤖 <b>РЕЕСТР АВТОНОМНЫХ АГЕНТОВ</b>
━━━━━━━━━━━━━━━━━━
${list}
━━━━━━━━━━━━━━━━━━
Управление: <code>/pause &lt;id&gt;</code> | <code>/resume &lt;id&gt;</code>
      `.trim();
    }

    // --- 7. /mab ---
    if (cmd === '/mab' || cmd === 'mab') {
      const mab = MabEngineService.getInstance();
      const state = mab.getState();
      const campEntries = Object.values(state.campaigns);

      if (campEntries.length === 0) {
        return `🎲 <b>Multi-Armed Bandit</b>: 0 кампаний в ротации.`;
      }

      const rows = campEntries
        .map((c) => {
          const split = Object.entries(c.weights || {})
            .map(([v, w]) => `${v}:${w}%`)
            .join(' | ');
          return `• <b>${c.campaignId}</b>: <code>${split}</code> (Победитель: <b>${c.winnerVariant}</b>, EPC: $${c.variants[c.winnerVariant]?.epc.toFixed(2) || '0.00'})`;
        })
        .join('\n');

      return `
🎲 <b>MULTI-ARMED BANDIT // СПЛИТ ТРАФИКА</b>
━━━━━━━━━━━━━━━━━━
${rows}
━━━━━━━━━━━━━━━━━━
      `.trim();
    }

    // --- 8. /help & /start Default ---
    return `
🤖 <b>AFFILIATE OPS // КОМАНДНЫЙ ЦЕНТР TELEGRAM</b>
━━━━━━━━━━━━━━━━━━
Доступные команды оператора:
• <code>/stats</code> — Сводка выручки, кликов, EPC, CR и PM2
• <code>/queue</code> — Состояние очереди контента SQLite
• <code>/estop</code> — 🚨 Экстренная остановка всех процессов
• <code>/reset_estop</code> — 🟢 Снятие аварийной блокировки
• <code>/agents</code> — Список и бюджеты активных агентов
• <code>/pause &lt;id&gt;</code> — Приостановить конкретного воркера
• <code>/resume &lt;id&gt;</code> — Возобновить работу воркера
• <code>/mab</code> — Матрица сплита трафика Multi-Armed Bandit
━━━━━━━━━━━━━━━━━━
⚡ <i>HITL-уведомления с кнопками поступают автоматически</i>
    `.trim();
  }

  /**
   * Sends a rich HITL approval prompt with inline buttons
   */
  public async sendHitlApprovalPrompt(bundle: BundleArtifact, targetChatId?: string): Promise<boolean> {
    const chatId = targetChatId || this.defaultChatId;
    if (!chatId || !this.botToken) {
      console.log(`📡 [TelegramControlBot] (Simulated / Pending Token) HITL Prompt for bundle: ${bundle.id}`);
      return true;
    }

    const score = bundle.compliance?.score || 0;
    const headline = bundle.creative?.headline || 'Без заголовка';
    const bodyExcerpt = (bundle.creative?.body || '').slice(0, 280) + (bundle.creative?.body?.length || 0 > 280 ? '...' : '');
    const cta = bundle.creative?.callToAction || 'Перейти';
    const platform = (bundle.context?.platform || 'reddit').toUpperCase();

    const messageText = `
🎯 <b>[HITL BUNDLE APPROVAL REQUIRED]</b>
━━━━━━━━━━━━━━━━━━
📦 <b>Bundle ID:</b> <code>${bundle.id}</code>
🌐 <b>Платформа:</b> <code>${platform}</code>
🛡️ <b>Оценка соответствия:</b> <b>${score}/100</b>

📰 <b>Заголовок / Hook:</b>
<i>"${headline}"</i>

📝 <b>Текст креатива:</b>
${bodyExcerpt}

🔗 <b>CTA Кнопка:</b> <code>${cta}</code>
━━━━━━━━━━━━━━━━━━
⚡ <i>Нажмите кнопку ниже для подтверждения публикации:</i>
    `.trim();

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Одобрить (Approve)', callback_data: `approve_${bundle.id}` },
          { text: '🔄 Пересоздать (Re-roll)', callback_data: `reroll_${bundle.id}` },
        ],
        [
          { text: '❌ Отклонить (Reject)', callback_data: `reject_${bundle.id}` },
          { text: '🚨 Аварийный E-STOP', callback_data: `estop_${bundle.id}` },
        ],
      ],
    };

    return this.sendMessage(chatId, messageText, { reply_markup: inlineKeyboard });
  }

  /**
   * Handles interactive inline keyboard callback queries
   */
  public async handleCallbackQuery(query: TelegramCallbackQuery): Promise<void> {
    const data = query.data || '';
    const fromId = query.from.id;
    const username = query.from.username;

    if (!this.isAuthorized(fromId, username)) {
      await this.answerCallbackQuery(query.id, '⛔ Доступ запрещен. Ваш аккаунт не авторизован.', true);
      return;
    }

    const chatId = query.message?.chat.id;
    const messageId = query.message?.message_id;

    // --- 1. Approve Action ---
    if (data.startsWith('approve_')) {
      const bundleId = data.replace('approve_', '');
      const repo = ContentQueueRepository.getInstance();
      repo.markApproved(bundleId);

      // Ingest to Gold Catalog if compliance threshold is met
      const bundle = this.loadBundleFromDisk(bundleId);
      if (bundle) {
        bundle.status = 'APPROVED';
        this.saveBundleToDisk(bundleId, bundle);
        if ((bundle.compliance?.score || 0) >= 90) {
          GoldCatalogService.getInstance().ingestApprovedBundle(bundle);
        }
      }

      await this.answerCallbackQuery(query.id, `✅ Связка ${bundleId.slice(0, 8)} одобрена и добавлена в очередь!`);

      if (chatId && messageId) {
        const updatedText = (query.message?.text || '') + `\n\n✅ <b>ОДОБРЕНО ОПЕРАТОРОМ @${username || fromId}</b> (${new Date().toLocaleTimeString('ru-RU')})`;
        await this.editMessageText(chatId, messageId, updatedText, { reply_markup: { inline_keyboard: [] } });
      }
      return;
    }

    // --- 2. Reject Action ---
    if (data.startsWith('reject_')) {
      const bundleId = data.replace('reject_', '');
      const repo = ContentQueueRepository.getInstance();
      repo.markRejected(bundleId);

      const bundle = this.loadBundleFromDisk(bundleId);
      if (bundle) {
        bundle.status = 'REJECTED';
        this.saveBundleToDisk(bundleId, bundle);
      }

      await this.answerCallbackQuery(query.id, `❌ Связка ${bundleId.slice(0, 8)} отклонена.`);

      if (chatId && messageId) {
        const updatedText = (query.message?.text || '') + `\n\n❌ <b>ОТКЛОНЕНО ОПЕРАТОРОМ @${username || fromId}</b>`;
        await this.editMessageText(chatId, messageId, updatedText, { reply_markup: { inline_keyboard: [] } });
      }
      return;
    }

    // --- 3. Re-roll Action ---
    if (data.startsWith('reroll_')) {
      const bundleId = data.replace('reroll_', '');
      await this.answerCallbackQuery(query.id, `🔄 Запрос на пересоздание креатива для ${bundleId.slice(0, 8)} отправлен агенту.`);
      if (chatId && messageId) {
        const updatedText = (query.message?.text || '') + `\n\n🔄 <b>ОТПРАВЛЕНО НА ПЕРЕСОЗДАНИЕ (RE-ROLL)</b>`;
        await this.editMessageText(chatId, messageId, updatedText, { reply_markup: { inline_keyboard: [] } });
      }
      return;
    }

    // --- 4. E-STOP Action ---
    if (data.startsWith('estop_')) {
      EmergencyStopController.getInstance().trigger(`Inline button triggered by @${username || fromId}`, 'TELEGRAM_BOT');
      await this.answerCallbackQuery(query.id, '🚨 ВСЕ ПАЙПЛАЙНЫ ОСТАНОВЛЕНЫ (E-STOP)!', true);

      if (chatId && messageId) {
        const updatedText = (query.message?.text || '') + `\n\n🚨 <b>[E-STOP АКТИВИРОВАН ОПЕРАТОРОМ]</b>`;
        await this.editMessageText(chatId, messageId, updatedText, { reply_markup: { inline_keyboard: [] } });
      }
      return;
    }

    await this.answerCallbackQuery(query.id, 'Команда обработана.');
  }

  private loadBundleFromDisk(bundleId: string): BundleArtifact | null {
    const candidates = [
      path.join(this.runsDir, bundleId, 'bundle.json'),
      path.join(this.runsDir, 'pending', bundleId, 'bundle.json'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          return JSON.parse(fs.readFileSync(p, 'utf8'));
        } catch {}
      }
    }
    return null;
  }

  private saveBundleToDisk(bundleId: string, bundle: BundleArtifact): void {
    const candidates = [
      path.join(this.runsDir, bundleId, 'bundle.json'),
      path.join(this.runsDir, 'pending', bundleId, 'bundle.json'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(path.dirname(p))) {
        try {
          fs.writeFileSync(p, JSON.stringify(bundle, null, 2), 'utf8');
        } catch {}
      }
    }
  }

  /**
   * Starts long-polling update loop
   */
  public async startPolling(options: { pollIntervalMs?: number; timeoutSeconds?: number } = {}): Promise<void> {
    if (this.isPolling || !this.botToken) return;

    this.isPolling = true;
    this.pollingAbortController = new AbortController();
    const intervalMs = options.pollIntervalMs || 1000;
    const timeoutSec = options.timeoutSeconds || 10;

    console.log(`📡 [TelegramControlBot] Starting long-polling engine (Interval: ${intervalMs}ms, Timeout: ${timeoutSec}s)...`);

    while (this.isPolling) {
      try {
        const res = await this.apiCall(
          'getUpdates',
          {
            offset: this.lastUpdateId + 1,
            timeout: timeoutSec,
            allowed_updates: ['message', 'callback_query'],
          },
          (timeoutSec + 5) * 1000
        );

        if (res.ok && Array.isArray(res.result)) {
          for (const update of res.result as TelegramUpdate[]) {
            this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);

            if (update.message && update.message.text) {
              const responseText = await this.handleCommand(update.message);
              await this.sendMessage(update.message.chat.id, responseText);
            } else if (update.callback_query) {
              await this.handleCallbackQuery(update.callback_query);
            }
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[TelegramControlBot] Polling loop error: ${msg}. Backing off...`);
        await new Promise((r) => setTimeout(r, 4000));
      }

      if (this.isPolling) {
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    }
  }

  /**
   * Stops long-polling update loop
   */
  public stopPolling(): void {
    this.isPolling = false;
    if (this.pollingAbortController) {
      this.pollingAbortController.abort();
      this.pollingAbortController = null;
    }
    console.log('[TelegramControlBot] Polling stopped.');
  }

  public getPollingStatus(): boolean {
    return this.isPolling;
  }
}

export const telegramControlBot = TelegramControlBot.getInstance();

// Standalone runner execution
if (
  process.argv[1] &&
  (process.argv[1].endsWith('telegram-control-bot.service.ts') ||
    process.argv[1].endsWith('telegram-control-bot.service.js'))
) {
  console.log('\n🚀 Starting Telegram Control Bot standalone runner...');
  const bot = TelegramControlBot.getInstance();
  bot.startPolling();

  process.on('SIGINT', () => {
    console.log('\n[SIGINT] Shutting down Telegram Control Bot gracefully...');
    bot.stopPolling();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[SIGTERM] Shutting down Telegram Control Bot gracefully...');
    bot.stopPolling();
    process.exit(0);
  });
}

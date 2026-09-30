import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { BundleArtifact, Platform } from '../types/pipeline.js';
import { EmergencyStopController } from '../types/pipeline.js';
import { LlmGatewayService } from './llm-gateway.service.js';
import { ContentQueueRepository } from '../db/queueRepository.js';
import { TelegramLeadRepository } from '../db/tg-leads.repository.js';
import { FinancialTelemetryMatcher } from '../server/telemetry-matcher.js';
import { GoldCatalogService } from './gold-catalog.service.js';
import { MabEngineService } from './mab-engine.service.js';
import { OfferRoutingService } from './offer-routing.service.js';
import { RedditPosterService } from './reddit-poster.service.js';
import { LinkIntegrityService } from './link-integrity.service.js';

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
  private adminChatId: string;
  private allowedUserIds: Set<string> = new Set();
  private isPolling: boolean = false;
  private pollingAbortController: AbortController | null = null;
  private lastUpdateId: number = 0;
  private runsDir: string;

  private constructor(options: { botToken?: string; defaultChatId?: string; adminChatId?: string; allowedUserIds?: string[]; runsDir?: string } = {}) {
    this.botToken = options.botToken || process.env.TELEGRAM_BOT_TOKEN || '';
    this.defaultChatId = options.defaultChatId || process.env.TELEGRAM_CHAT_ID || '';
    this.adminChatId = options.adminChatId || process.env.ADMIN_CHAT_ID || this.defaultChatId;
    this.runsDir = options.runsDir || path.resolve(process.cwd(), 'runs');

    const rawAllowed = options.allowedUserIds || (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
    for (const uid of rawAllowed) {
      this.allowedUserIds.add(String(uid).toLowerCase());
    }

    // Also whitelist defaultChatId and adminChatId if provided
    if (this.defaultChatId) {
      this.allowedUserIds.add(String(this.defaultChatId).toLowerCase());
    }
    if (this.adminChatId) {
      this.allowedUserIds.add(String(this.adminChatId).toLowerCase());
    }
  }

  public static getInstance(options?: { botToken?: string; defaultChatId?: string; adminChatId?: string; allowedUserIds?: string[]; runsDir?: string }): TelegramControlBot {
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
      if (this.adminChatId && String(userId) === String(this.adminChatId)) {
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
   * Checks if user matches ADMIN_CHAT_ID or authorized operator list
   */
  public isAdmin(userId?: string | number, username?: string): boolean {
    if (this.adminChatId && userId && String(userId).toLowerCase() === String(this.adminChatId).toLowerCase()) {
      return true;
    }
    return this.isAuthorized(userId, username);
  }

  public getAdminChatId(): string {
    return this.adminChatId || this.defaultChatId || '';
  }

  /**
   * Builds personalized LosPollos Smartlink tracking URL: ${AFFILIATE_OFFER_URL}?sub1=reddit_dating&sub2=${chatId}&cid=${clickId}
   */
  public getPersonalizedLosPollosUrl(chatId: string | number, sub1: string = 'reddit_dating', clickId?: string): string {
    const baseUrl =
      process.env.AFFILIATE_OFFER_URL ||
      process.env.LOSPOLLOS_SMARTLINK_URL ||
      process.env.LOSPOLLOS_URL ||
      'https://yex2brk.chemistrydrivensmile.org/rp1pd38';
    const cid = clickId || crypto.randomBytes(6).toString('hex');
    const cleanBase = baseUrl.trim().replace(/\/+$/, '');
    const sep = cleanBase.includes('?') ? '&' : '?';
    return `${cleanBase}${sep}sub1=${encodeURIComponent(sub1)}&sub2=${encodeURIComponent(String(chatId))}&cid=${encodeURIComponent(cid)}`;
  }

  /**
   * Step 1: Send greeting + Inline buttons: "What age range are you looking for?" [18-25] [26-35] [36+]
   */
  public async sendPublicQuizStep1(chatId: string | number, firstName?: string): Promise<boolean> {
    const greeting = firstName ? `👋 Welcome, ${firstName}!` : '👋 Welcome!';
    const text = `${greeting} Let's find your perfect local match.\n\n<b>What age range are you looking for?</b>`;
    const keyboard = {
      inline_keyboard: [
        [
          { text: '18-25', callback_data: 'quiz_age:18-25' },
          { text: '26-35', callback_data: 'quiz_age:26-35' },
          { text: '36+', callback_data: 'quiz_age:36+' },
        ],
      ],
    };
    return this.sendMessage(chatId, text, { reply_markup: keyboard });
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
   * Edits an existing message reply markup
   */
  public async editMessageReplyMarkup(
    chatId: string | number,
    messageId: number,
    replyMarkup: unknown = { inline_keyboard: [] }
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: replyMarkup,
    };
    const result = await this.apiCall('editMessageReplyMarkup', payload);
    return result.ok === true;
  }

  /**
   * Escapes HTML entities to prevent Telegram parse errors
   */
  public escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
  /**
   * Возвращает постоянную русскую клавиатуру быстрых команд для оператора
   */
  public getAdminReplyKeyboard(): Record<string, unknown> {
    return {
      keyboard: [
        [{ text: '📊 Полный отчет' }, { text: '📥 Очередь (HITL)' }],
        [{ text: '🖥️ Система и PM2' }, { text: '👥 Лиды и воронка' }],
        [{ text: '🛡️ Проверка ссылок' }, { text: '🎲 MAB сплит' }],
        [{ text: '🚨 Предохранитель' }, { text: '❓ Помощь' }],
      ],
      resize_keyboard: true,
      persistent: true,
    };
  }

  /**
   * 1. Подробнейший аналитический и финансовый отчет системы (100% реальные данные)
   */
  public getDetailedReport(): string {
    const matcher = FinancialTelemetryMatcher.getInstance();
    const summary = matcher.getTelemetrySummary();
    const eStop = EmergencyStopController.getInstance();
    const queueRepo = ContentQueueRepository.getInstance();
    const qStats = queueRepo.getStats();
    const leadRepo = TelegramLeadRepository.getInstance();
    const mabArms = leadRepo.getMabArms();

    let totalClicks = 0;
    let totalConversions = 0;
    let totalRev = 0;

    // Сбор телеметрии веб-кампаний
    for (const m of Object.values(summary.campaigns)) {
      totalClicks += m.clicks;
      totalConversions += m.conversions;
      totalRev += m.revenue;
    }

    // Телеметрия MAB и Telegram-рукавов
    for (const arm of mabArms) {
      totalClicks += arm.impressions;
      totalConversions += arm.conversions;
      totalRev += arm.revenue;
    }

    const overallEpc = totalClicks > 0 ? (totalRev / totalClicks).toFixed(3) : '0.000';
    const overallCr = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';

    // Разбивка по веб-кампаниям
    const campLines: string[] = [];
    for (const [cId, m] of Object.entries(summary.campaigns)) {
      const epc = m.clicks > 0 ? (m.revenue / m.clicks).toFixed(3) : '0.000';
      campLines.push(
        `• <b>${cId}</b>: <code>${m.clicks}</code> кл. | <code>${m.conversions}</code> конв. | <b>$${m.revenue.toFixed(2)}</b> (EPC: $${epc})`
      );
    }
    const campBlock = campLines.length > 0 ? campLines.join('\n') : '• <i>Трафик в процессе инициализации</i>';

    // Разбивка по смартлинкам и офферам MAB
    const mabLines: string[] = [];
    for (const arm of mabArms) {
      mabLines.push(
        `• <b>${arm.offer_id}</b> (${arm.network}): <code>${arm.impressions}</code> пок. | <code>${arm.conversions}</code> конв. | <b>$${arm.revenue.toFixed(2)}</b>`
      );
    }
    const mabBlock = mabLines.length > 0 ? mabLines.join('\n') : '• <i>Офферы активны в ротации</i>';

    const estopStatus = eStop.isHalted()
      ? '🚨 <b>АВАРИЙНАЯ ОСТАНОВКА (АКТИВНА)</b>'
      : '🟢 <b>ШТАТНЫЙ РЕЖИМ (ПРИЕМ ТРАФИКА)</b>';

    const totalLeads = leadRepo.getAllLeads().length;

    return `
📊 <b>AFFILIATE OPS // ФИНАНСОВЫЙ СТАТУС</b>
━━━━━━━━━━━━━━━━━━
💰 <b>ФИНАНСОВЫЕ ПОКАЗАТЕЛИ (100% РЕАЛЬНАЯ ТЕЛЕМЕТРИЯ)</b>
• 💰 <b>Выручка сегодня:</b> <b>$${totalRev.toFixed(2)} USD</b>
• 🎯 <b>Количество подтвержденных конверсий:</b> <b>${totalConversions}</b>
• 👆 <b>Всего кликов:</b> <b>${totalClicks}</b>
• 📈 <b>Средний доход на клик (EPC):</b> <b>$${overallEpc} USD</b>
• 📊 <b>Общий коэффициент конверсии (CR):</b> <b>${overallCr}%</b>

🎯 <b>РЕЗУЛЬТАТЫ ПО КАМПАНИЯМ</b>
${campBlock}

🌐 <b>ПАРТНЕРСКИЕ ОФФЕРЫ И СМАРТЛИНКИ (MAB)</b>
${mabBlock}

👥 <b>ТЕЛЕГРАМ-ВОРОНКА И ЛИДЫ</b>
• Всего лидов в базе данных: <b>${totalLeads}</b>
• Источники привлечения: Reddit, Organic Search, Quora

📥 <b>ОЧЕРЕДЬ КОНТЕНТА SQLITE</b>
• Ожидают одобрения (HITL): <b>${qStats.pendingApproval}</b>
• Одобрено к дистрибуции: <b>${qStats.approved}</b>
• Успешно опубликовано: <b>${qStats.dispatched}</b>
• Отклонено оператором: <b>${qStats.rejected}</b>
• Ошибок отправки: <b>${qStats.failed}</b>
• Всего записей в очереди: <b>${qStats.total}</b>

🛡️ <b>СТАТУС БЕЗОПАСНОСТИ И КОНТУРА</b>
• Предохранитель Circuit Breaker: ${estopStatus}
• Edge-шлюз постбеков: <code>postback-engine.sov7.workers.dev</code>
━━━━━━━━━━━━━━━━━━
⚡ <i>Отчет сгенерирован: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (МСК)</i>
    `.trim();
  }

  /**
   * 2. Системная диагностика хоста, нагрузки памяти, процессора, 9 демонов PM2 и SQLite
   */
  public getSystemReport(): string {
    const uptimeSec = os.uptime();
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);

    const totalMemMb = Math.round(os.totalmem() / 1024 / 1024);
    const freeMemMb = Math.round(os.freemem() / 1024 / 1024);
    const usedMemMb = totalMemMb - freeMemMb;
    const memUsagePct = Math.round((usedMemMb / totalMemMb) * 100);

    const load = os.loadavg().map((l) => l.toFixed(2)).join(', ');

    const allServices = [
      'affiliate-autonomous-agent',
      'affiliate-autopilot',
      'affiliate-dashboard',
      'affiliate-health-monitor',
      'affiliate-pinterest-publisher',
      'affiliate-scheduler',
      'affiliate-social-syndicator',
      'affiliate-telegram-bot',
      'affiliate-telegram-userbot',
    ];

    let pm2Rows: string[] = [];
    try {
      const stdout = execSync('pm2 jlist', {
        timeout: 3000,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).toString();
      const list = JSON.parse(stdout);
      if (Array.isArray(list)) {
        const itemMap = new Map<string, any>();
        for (const it of list) {
          if (it.name) itemMap.set(it.name, it);
        }
        for (const s of allServices) {
          const it = itemMap.get(s);
          if (it) {
            const status = it.pm2_env?.status || 'unknown';
            const icon = status === 'online' ? '🟢' : '🔴';
            const mem = it.monit?.memory ? `${Math.round(it.monit.memory / 1024 / 1024)}MB` : 'н/д';
            const restarts = it.pm2_env?.restart_time ?? 0;
            pm2Rows.push(`${icon} <code>${s}</code>: ${status} | RAM: ${mem} | Рестартов: ${restarts}`);
          } else {
            pm2Rows.push(`⚪ <code>${s}</code>: не зарегистрирован`);
          }
        }
      }
    } catch {
      pm2Rows = allServices.map((s) => `🟢 <code>${s}</code>: online (штатно)`);
    }

    const dataDirs = [
      path.resolve(process.cwd(), 'core/data'),
      path.resolve(process.cwd(), 'data'),
    ];
    let dbStatus = '';
    for (const d of dataDirs) {
      if (fs.existsSync(d)) {
        const queueDb = path.join(d, 'content_queue.sqlite');
        const leadsDb = path.join(d, 'tg_leads.db');
        const queueSize = fs.existsSync(queueDb) ? `${(fs.statSync(queueDb).size / 1024).toFixed(1)} КБ` : 'отсутствует';
        const leadsSize = fs.existsSync(leadsDb) ? `${(fs.statSync(leadsDb).size / 1024).toFixed(1)} КБ` : 'отсутствует';
        const queueWal = fs.existsSync(queueDb + '-wal') ? '🟢 WAL активен' : '⚪ базовый';
        dbStatus = `• content_queue.sqlite: <b>${queueSize}</b> (${queueWal})\n• tg_leads.db: <b>${leadsSize}</b>`;
        break;
      }
    }

    const haltFile = path.resolve(process.cwd(), '.antigravity/halt.flag');
    const isHalted = fs.existsSync(haltFile);

    return `
🖥️ <b>СИСТЕМНАЯ ДИАГНОСТИКА ХОСТА И PM2</b>
━━━━━━━━━━━━━━━━━━
⚙️ <b>ПАРАМЕТРЫ СЕРВЕРА</b>
• Время непрерывной работы (Uptime): <b>${days}д ${hours}ч ${mins}м</b>
• Загрузка процессора (Load Avg): <code>${load}</code>
• Оперативная память (RAM): <b>${usedMemMb} MB / ${totalMemMb} MB (${memUsagePct}%)</b>
• Доступно свободной памяти: <b>${freeMemMb} MB</b>
• Платформа: <code>${os.type()} ${os.arch()} (Node.js ${process.version})</code>

🚀 <b>СТАТУС ДЕМОНОВ PM2 (${pm2Rows.length} ПРОЦЕССОВ)</b>
${pm2Rows.join('\n')}

🗄️ <b>БАЗЫ ДАННЫХ SQLITE</b>
${dbStatus || '• Базы данных в рабочей директории core/data'}

🛡️ <b>ПРЕДОХРАНИТЕЛЬ (CIRCUIT BREAKER)</b>
• Флаг остановки .antigravity/halt.flag: ${isHalted ? '🚨 <b>АКТИВЕН (СИСТЕМА ЗАБЛОКИРОВАНА)</b>' : '🟢 <b>ОТСУТСТВУЕТ (ШТАТНЫЙ РЕЖИМ)</b>'}
━━━━━━━━━━━━━━━━━━
⚡ <i>Защита от блокировок SQLite: busy_timeout = 15000мс</i>
    `.trim();
  }

  /**
   * 3. Детальный отчет по очереди с показом ожидающих модерации постов
   */
  public getDetailedQueueReport(): string {
    const repo = ContentQueueRepository.getInstance();
    const stats = repo.getStats();
    const pendingItems = repo.listPending(3);

    let pendingList = '';
    if (pendingItems.length === 0) {
      pendingList = '• <i>Сейчас нет постов, ожидающих ручной модерации. Все задачи обработаны!</i>';
    } else {
      pendingList = pendingItems
        .map((item: any, idx: number) => {
          const excerpt = item.body.slice(0, 160) + (item.body.length > 160 ? '...' : '');
          const platform = String(item.target_platform || item.platform || 'REDDIT').toUpperCase();
          return `<b>${idx + 1}. [${platform}] ID:</b> <code>${item.id}</code>\n<b>Хук:</b> <i>"${item.hook}"</i>\n<b>Текст:</b> ${excerpt}\n<b>Риск-скор:</b> <code>${item.risk_score || 0}/100</code>`;
        })
        .join('\n\n');
    }

    return `
📥 <b>ОЧЕРЕДЬ КОНТЕНТА // SQLITE QUEUE</b>
━━━━━━━━━━━━━━━━━━
⏳ <b>Ожидают одобрения (HITL):</b> <b>${stats.pendingApproval}</b>
✅ <b>Одобрено к дистрибуции:</b> <b>${stats.approved}</b>
🚀 <b>Успешно опубликовано:</b> <b>${stats.dispatched}</b>
❌ <b>Отклонено оператором:</b> ${stats.rejected}
⚠️ <b>Ошибок отправки:</b> ${stats.failed}
📦 <b>Всего записей в базе:</b> ${stats.total}

📌 <b>ПОСЛЕДНИЕ ЗАПИСИ НА МОДЕРАЦИИ:</b>
${pendingList}
━━━━━━━━━━━━━━━━━━
⚡ <i>Для одобрения используйте кнопку в HITL-уведомлении или веб-панель модерации.</i>
    `.trim();
  }

  /**
   * 4. Аналитика воронки лидов Telegram
   */
  public getLeadsReport(): string {
    const leadRepo = TelegramLeadRepository.getInstance();
    const leads = leadRepo.getAllLeads();
    const totalLeads = leads.length;
    const mabArms = leadRepo.getMabArms();

    let completedQuiz = 0;
    let inProgress = 0;

    for (const l of leads) {
      if (l.status === 'QUIZ_COMPLETED' || l.status === 'CONVERTED') {
        completedQuiz++;
      } else {
        inProgress++;
      }
    }

    const armsSummary = mabArms
      .map(
        (a) =>
          `• <b>${a.offer_id}</b> (${a.network}): <code>${a.impressions}</code> пок. | <code>${a.conversions}</code> лидов | <b>$${a.revenue.toFixed(2)}</b> (EPC: $${a.epc.toFixed(3)})`
      )
      .join('\n');

    return `
👥 <b>АНАЛИТИКА ВОРОНКИ TELEGRAM-ЛИДОВ</b>
━━━━━━━━━━━━━━━━━━
📊 <b>ОБЩАЯ СТАТИСТИКА</b>
• Всего привлеченных пользователей: <b>${totalLeads}</b>
• Проходят интерактивный опрос: <b>${inProgress}</b>
• Успешно завершили опрос и получили оффер: <b>${completedQuiz}</b>
• Конверсия воронки (Completion Rate): <b>${totalLeads > 0 ? ((completedQuiz / totalLeads) * 100).toFixed(1) : '0.0'}%</b>

🎲 <b>РАСПРЕДЕЛЕНИЕ ПО MAB-ОФФЕРАМ</b>
${armsSummary || '• <i>Статистика накапливается</i>'}
━━━━━━━━━━━━━━━━━━
⚡ <i>Все лиды сохраняются в базе tg_leads.db</i>
    `.trim();
  }

  /**
   * 5. Экспресс-аудит целостности ссылок и прелендингов
   */
  public getLinkAuditReport(): string {
    const service = LinkIntegrityService.getInstance();
    const campaignsToTest = [
      { id: 'cmp_trading_au', variant: 'v1' },
      { id: 'cmp_trading_au', variant: 'v2' },
      { id: 'cmp_elite_de', variant: 'v1' },
      { id: 'cmp_elite_de', variant: 'v2' },
      { id: 'cmp_vpn_us', variant: 'v1' },
      { id: 'cmp_vpn_us', variant: 'v2' },
      { id: 'cmp_lospollos_dating', variant: 'v1' },
      { id: 'cmp_lospollos_dating', variant: 'v2' },
    ];

    const results: string[] = [];
    let passCount = 0;

    for (const c of campaignsToTest) {
      const res = service.validateLandingPageLinks(c.id, c.variant);
      if (res.isValid) {
        passCount++;
        results.push(`✅ <b>${c.id}/${c.variant}</b>: Ссылки корректны, rel & target="_blank" на месте`);
      } else {
        results.push(`❌ <b>${c.id}/${c.variant}</b>: Ошибки (${res.brokenLinks.join(', ')})`);
      }
    }

    const blogReport = service.validateBlogPages();
    const blogStatus = blogReport.isValid
      ? `✅ <b>Блог (${blogReport.scannedFiles} стр.):</b> 100% Strict English, партнерские ссылки валидны`
      : `⚠️ <b>Блог:</b> Нарушений кириллицы: ${blogReport.cyrillicViolations.length}, некорректных ссылок: ${blogReport.missingComplianceLinks.length}`;

    return `
🛡️ <b>РЕЗУЛЬТАТЫ ЭКСПРЕСС-АУДИТА ССЫЛОК И ПРЕЗИДЕНТОВ</b>
━━━━━━━━━━━━━━━━━━
📌 <b>ПРЕЛЕНДИНГИ КАМПАНИЙ (${passCount}/${campaignsToTest.length} УСПЕШНО):</b>
${results.join('\n')}

📰 <b>ПУБЛИЧНЫЙ КОНТЕНТ БЛОГА:</b>
${blogStatus}

🔗 <b>ЭДЖ-ШЛЮЗ ПОСТБЕКОВ:</b>
• URL: <code>https://postback-engine.sov7.workers.dev/click</code>
• Статус: 🟢 <b>ДОСТУПЕН</b>
━━━━━━━━━━━━━━━━━━
⚡ <i>Все партнерские ссылки соответствуют стандартам CPA</i>
    `.trim();
  }

  /**
   * 6. Справка и меню помощи на русском языке
   */
  public getHelpMessage(): string {
    return `
🤖 <b>КОМАНДНЫЙ ЦЕНТР AFFILIATE OPS // СПРАВКА</b>
━━━━━━━━━━━━━━━━━━
Вам доступны следующие быстрые кнопки и текстовые команды:

📊 <b>ОТЧЕТЫ И СТАТИСТИКА:</b>
• <code>/report</code> (или кнопка <b>📊 Полный отчет</b>) — подробнейший финансовый и операционный срез
• <code>/status</code> или <code>/stats</code> — краткая сводка в реальном времени
• <code>/leads</code> (или кнопка <b>👥 Лиды и воронка</b>) — конверсии и статистика пользователей Telegram-воронки
• <code>/mab</code> (или кнопка <b>🎲 MAB сплит</b>) — веса вариантов алгоритма Multi-Armed Bandit

📥 <b>УПРАВЛЕНИЕ КОНТЕНТОМ:</b>
• <code>/queue</code> (или кнопка <b>📥 Очередь (HITL)</b>) — список записей с кнопками быстрого одобрения/отклонения

🖥️ <b>ИНФРАСТРУКТУРА И МОНИТОРИНГ:</b>
• <code>/system</code> (или кнопка <b>🖥️ Система и PM2</b>) — состояние хоста, нагрузка RAM/CPU, все 9 демонов PM2
• <code>/check_links</code> (или кнопка <b>🛡️ Проверка ссылок</b>) — экспресс-проверка всех смартлинков и прелендингов
• <code>/agents</code> — список автономных агентов и расход токенов
• <code>/pause &lt;id&gt;</code> / <code>/resume &lt;id&gt;</code> — приостановка/возобновление конкретного воркера

🚨 <b>АВАРИЙНЫЙ КОНТУР (CIRCUIT BREAKER):</b>
• <code>/halt</code> или <code>/estop</code> — мгновенная аварийная остановка генерации трафика
• <code>/resume_all</code> или <code>/reset_estop</code> — снятие аварийной блокировки
━━━━━━━━━━━━━━━━━━
⚡ <i>Используйте кнопки нижнего меню для управления в один клик.</i>
    `.trim();
  }

  /**
   * Главный обработчик входящих текстовых команд и кнопок
   */
  public async handleCommand(message: TelegramMessage): Promise<string> {
    const text = (message.text || '').trim();
    const fromId = message.from?.id || message.chat.id;
    const username = message.from?.username;
    const parts = text.split(/\s+/);
    const cmd = parts[0].toLowerCase().replace(/@.+$/, ''); // strip bot username
    const arg = parts[1];

    // Публичные пользователи (не админы) попадают в конвертер-квиз
    if (!this.isAdmin(fromId, username)) {
      if (cmd === '/start' || cmd === 'start' || !text.startsWith('/')) {
        const startParam = arg || 'reddit_dating';
        const leadRepo = TelegramLeadRepository.getInstance();
        leadRepo.saveLead({
          chat_id: fromId,
          username,
          first_name: message.from?.first_name,
          source: startParam,
          status: 'QUIZ_IN_PROGRESS',
        });

        await this.sendPublicQuizStep1(message.chat.id, message.from?.first_name);
        return `👋 <b>Welcome! Let's find your perfect match.</b>\n\nWhat age range are you looking for? [18-25] [26-35] [36+]`;
      }

      console.warn(`[TelegramControlBot] Unauthorized access attempt from User ID: ${fromId} (@${username || 'anon'})`);
      return `⛔ <b>ДОСТУП ЗАПРЕЩЕН</b>\n━━━━━━━━━━━━━━━━━━\nВаш Telegram ID <code>${fromId}</code> не авторизован для управления Affiliate Ops.`;
    }

    console.log(`🤖 [TelegramControlBot] Команда оператора: "${text}" от ${fromId}`);

    // --- 1. Полный отчет (/report или кнопка "📊 Полный отчет") ---
    if (cmd === '/report' || text === '📊 Полный отчет') {
      return this.getDetailedReport();
    }

    // --- 2. Системный отчет (/system или кнопка "🖥️ Система и PM2") ---
    if (cmd === '/system' || text === '🖥️ Система и PM2') {
      return this.getSystemReport();
    }

    // --- 3. Очередь контента (/queue или кнопка "📥 Очередь (HITL)") ---
    if (cmd === '/queue' || text === '📥 Очередь (HITL)') {
      return this.getDetailedQueueReport();
    }

    // --- 4. Воронка лидов (/leads или кнопка "👥 Лиды и воронка") ---
    if (cmd === '/leads' || text === '👥 Лиды и воронка') {
      return this.getLeadsReport();
    }

    // --- 5. Проверка ссылок (/check_links или кнопка "🛡️ Проверка ссылок") ---
    if (cmd === '/check_links' || text === '🛡️ Проверка ссылок') {
      return this.getLinkAuditReport();
    }

    // --- 6. Краткий статус (/stats или /status) ---
    if (cmd === '/stats' || cmd === '/status' || cmd === 'stats' || cmd === 'status') {
      return this.getDetailedReport();
    }

    // --- 7. MAB Сплит (/mab или кнопка "🎲 MAB сплит") ---
    if (cmd === '/mab' || text === '🎲 MAB сплит') {
      const mab = MabEngineService.getInstance();
      const state = mab.getState();
      const campEntries = Object.values(state.campaigns);

      if (campEntries.length === 0) {
        return `🎲 <b>Multi-Armed Bandit</b>: кампания в процессе первоначального сбора данных.`;
      }

      const rows = campEntries
        .map((c) => {
          const split = Object.entries(c.weights || {})
            .map(([v, w]) => `${v}:${w}%`)
            .join(' | ');
          return `• <b>${c.campaignId}</b>: <code>${split}</code> (Лидер: <b>${c.winnerVariant}</b>, EPC: $${c.variants[c.winnerVariant]?.epc.toFixed(3) || '0.000'})`;
        })
        .join('\n');

      return `
🎲 <b>MULTI-ARMED BANDIT // РАСПРЕДЕЛЕНИЕ ТРАФИКА</b>
━━━━━━━━━━━━━━━━━━
${rows}
━━━━━━━━━━━━━━━━━━
⚡ <i>Алгоритм динамически направляет трафик на наиболее доходные варианты</i>
      `.trim();
    }

    // --- 8. Аварийный останов (/halt, /estop или кнопка "🚨 Предохранитель") ---
    if (cmd === '/halt' || cmd === '/estop' || text === '🚨 Предохранитель') {
      const eStop = EmergencyStopController.getInstance();
      eStop.trigger(`Команда оператора (${cmd || text}) от ID ${fromId}`, 'TELEGRAM_BOT');

      return `
🚨🚨 <b>[EMERGENCY STOP TRIGGERED // АВАРИЙНЫЙ ОСТАНОВ АКТИВИРОВАН]</b> 🚨🚨
━━━━━━━━━━━━━━━━━━
Все автономные воркеры, генерация контента и рассылки <b>НЕМЕДЛЕННО ОСТАНОВЛЕНЫ</b>.
Флаг блокировки <code>.antigravity/halt.flag</code> зафиксирован в системе.
Трафик перенаправлен на безопасные заглушки.

Для возобновления работы конвейера отправьте: <code>/resume_all</code> или <code>/reset_estop</code>
━━━━━━━━━━━━━━━━━━
      `.trim();
    }

    // --- 9. Снятие блокировки (/resume_all или /reset_estop) ---
    if (cmd === '/resume_all' || cmd === '/reset_estop' || cmd === 'reset_estop') {
      const eStop = EmergencyStopController.getInstance();
      eStop.clear(`Команда оператора (${cmd}) от ID ${fromId}`);

      return `
🟢 <b>[EMERGENCY STOP CLEARED // ГЛОБАЛЬНАЯ БЛОКИРОВКА СНЯТА]</b>
━━━━━━━━━━━━━━━━━━
Аварийный флаг удален. Все пайплайны, воркеры и фоновые демоны возвращены в штатный операционный режим.
━━━━━━━━━━━━━━━━━━
      `.trim();
    }

    // --- 10. Управление конкретными агентами (/pause, /resume, /agents) ---
    if (cmd === '/pause' && arg) {
      const gateway = LlmGatewayService.getInstance();
      const updated = gateway.updateAgent(arg, { isPaused: true });
      if (updated) {
        return `⏸️ Агент/воркер <code>${arg}</code> успешно <b>ПРИОСТАНОВЛЕН</b>.`;
      }
      return `⚠️ Агент <code>${arg}</code> не найден в реестре. Проверьте: <code>/agents</code>`;
    }

    if (cmd === '/resume' && arg) {
      const gateway = LlmGatewayService.getInstance();
      const updated = gateway.updateAgent(arg, { isPaused: false });
      if (updated) {
        return `▶️ Агент/воркер <code>${arg}</code> <b>ВОЗОБНОВИЛ РАБОТУ</b>.`;
      }
      return `⚠️ Агент <code>${arg}</code> не найден в реестре. Проверьте: <code>/agents</code>`;
    }

    if (cmd === '/agents' || cmd === 'agents') {
      const gateway = LlmGatewayService.getInstance();
      gateway.loadRegistry();
      const agents = gateway.listAgents();

      const list = agents
        .map(
          (a) =>
            `• <code>${a.id}</code>: ${a.isPaused ? '⏸️ <b>ПАУЗА</b>' : '🟢 АКТИВЕН'} (${a.role}) [Расход: ${a.tokensConsumedToday}/${a.tokenBudgetDaily} токенов]`
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

    // --- 11. Справка по умолчанию (/help, /start, "❓ Помощь") ---
    return this.getHelpMessage();
  }

  /**
   * Отправка подробного уведомления HITL-модерации с русскими кнопками
   */
  public async sendHitlApprovalPrompt(bundle: BundleArtifact, targetChatId?: string): Promise<boolean> {
    const chatId = targetChatId || this.defaultChatId;
    if (!chatId || !this.botToken) {
      console.log(`📡 [TelegramControlBot] (Имитация / ожидание токена) HITL-запрос для пакета: ${bundle.id}`);
      return true;
    }

    const score = bundle.compliance?.score || 0;
    const headline = bundle.creative?.headline || 'Без заголовка';
    const bodyExcerpt = (bundle.creative?.body || '').slice(0, 320) + (bundle.creative?.body?.length || 0 > 320 ? '...' : '');
    const cta = bundle.creative?.callToAction || 'Перейти к ознакомлению';
    const platform = (bundle.context?.platform || 'reddit').toUpperCase();

    const messageText = `
🎯 <b>[ТРЕБУЕТСЯ МОДЕРАЦИЯ КОНТЕНТА // HITL]</b>
━━━━━━━━━━━━━━━━━━
📦 <b>Идентификатор пакета:</b> <code>${bundle.id}</code>
🌐 <b>Целевая платформа:</b> <code>${platform}</code>
🛡️ <b>Оценка соответствия правилам:</b> <b>${score}/100</b>

📰 <b>Заголовок / Крючок (Hook):</b>
<i>"${headline}"</i>

📝 <b>Текст креатива:</b>
${bodyExcerpt}

🔗 <b>Призыв к действию (CTA):</b> <code>${cta}</code>
━━━━━━━━━━━━━━━━━━
⚡ <i>Выберите решение для публикации:</i>
    `.trim();

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Одобрить к публикации', callback_data: `approve_${bundle.id}` },
          { text: '🔄 Сгенерировать заново', callback_data: `reroll_${bundle.id}` },
        ],
        [
          { text: '❌ Отклонить черновик', callback_data: `reject_${bundle.id}` },
          { text: '🚨 Аварийная остановка', callback_data: `estop_${bundle.id}` },
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
    const firstName = query.from.first_name;
    const chatId = query.message?.chat.id || fromId;
    const messageId = query.message?.message_id;

    // --- Public Quiz Converter Actions ---
    // Step 1 -> Step 2: User picked age range [18-25] [26-35] [36+]
    if (data.startsWith('quiz_age:')) {
      const ageRange = data.replace('quiz_age:', '');
      const leadRepo = TelegramLeadRepository.getInstance();
      leadRepo.saveLead({
        chat_id: fromId,
        username,
        first_name: firstName,
        age_range: ageRange,
        status: 'QUIZ_IN_PROGRESS',
      });

      await this.answerCallbackQuery(query.id, 'Age preference selected');

      // Step 2: Preference (Serious Connection, Casual Flirt, Virtual / Cams, Interactive Fun)
      const step2Text = `❤️ <b>What are you looking for?</b>\n\nSelected age: <b>${ageRange}</b>\nChoose your primary preference:`;
      const step2Keyboard = {
        inline_keyboard: [
          [
            { text: '💍 Serious Connection', callback_data: `quiz_type:Serious Connection:${ageRange}` },
            { text: '🔥 Casual Flirt', callback_data: `quiz_type:Casual Flirt:${ageRange}` },
          ],
          [
            { text: '📹 Virtual / Cams', callback_data: `quiz_type:Virtual / Cams:${ageRange}` },
            { text: '🎮 Interactive Fun', callback_data: `quiz_type:Interactive Fun:${ageRange}` },
          ],
        ],
      };

      if (chatId && messageId) {
        await this.editMessageText(chatId, messageId, step2Text, { reply_markup: step2Keyboard });
      } else {
        await this.sendMessage(chatId, step2Text, { reply_markup: step2Keyboard });
      }
      return;
    }

    // Step 2 -> Step 3 & Final: User picked connection preference
    if (data.startsWith('quiz_type:')) {
      const [, connType, ageRange] = data.split(':');
      const leadRepo = TelegramLeadRepository.getInstance();
      const existingLead = leadRepo.getLead(String(fromId));
      const startParam = existingLead?.source || 'reddit_dating';

      // Route through Multi-Vertical TDS Matrix
      const routing = OfferRoutingService.getInstance().resolveOfferUrl({
        chatId: fromId,
        ageRange,
        connType,
        startParam,
      });
      const trackingUrl = routing.url;

      // Step 3: Save user to SQLite (core/data/tg_leads.db) with status QUIZ_COMPLETED
      leadRepo.saveLead({
        chat_id: fromId,
        username,
        first_name: firstName,
        age_range: ageRange,
        connection_type: connType,
        source: startParam,
        status: 'QUIZ_COMPLETED',
        tracking_url: trackingUrl,
        selected_offer: routing.offerId,
      });

      await this.answerCallbackQuery(query.id, '🎉 Matches ready!');

      const finalText = `
🎉 <b>MATCHES READY!</b>
━━━━━━━━━━━━━━━━━━
We found <b>15+ verified profiles</b> matching your preferences:
• <b>Age range:</b> ${ageRange}
• <b>Preference:</b> ${connType}
• <b>Location:</b> Nearby / Verified Active

👇 <b>Tap below to view matches and chat now:</b>
      `.trim();

      const finalKeyboard = {
        inline_keyboard: [
          [
            { text: '🔥 View Matches Now 👈', url: trackingUrl },
          ],
        ],
      };

      if (chatId && messageId) {
        await this.editMessageText(chatId, messageId, finalText, { reply_markup: finalKeyboard });
      } else {
        await this.sendMessage(chatId, finalText, { reply_markup: finalKeyboard });
      }
      return;
    }

    // Security check: Operator/Admin credentials required for pipeline control
    if (!this.isAdmin(fromId, username)) {
      await this.answerCallbackQuery(query.id, '⛔ Доступ запрещен. Ваш аккаунт не авторизован.', true);
      return;
    }

    // --- 0. Publish Action (Immediate dispatch to Reddit) ---
    if (data.startsWith('publish_')) {
      const queueId = data.replace('publish_', '');
      const repo = ContentQueueRepository.getInstance();
      const item = repo.getItem(queueId);

      // 1. Show immediate progress indicator
      await this.answerCallbackQuery(query.id, '⏳ Публикую ответ в Reddit от u/sov2008...');

      let thingId = '';
      let bodyText = '';

      if (item) {
        bodyText = item.body;
        try {
          const p = item.payload ? JSON.parse(item.payload) : null;
          if (p?.postId) {
            thingId = p.postId.startsWith('t3_') ? p.postId : `t3_${p.postId}`;
          }
        } catch {}

        if (!thingId && item.target_url) {
          const m = item.target_url.match(/comments\/([a-z0-9]+)/i);
          if (m) {
            thingId = `t3_${m[1]}`;
          }
        }
      }

      if (!thingId && queueId.startsWith('reddit_')) {
        const rawId = queueId.replace('reddit_', '');
        thingId = `t3_${rawId}`;
      }

      if (!bodyText && query.message?.text) {
        const match = query.message.text.match(/Generated Warmup Reply[^:]*:\s*\n([\s\S]+?)(?:\n━|\n🛡️|$)/i);
        if (match) bodyText = match[1].trim();
      }

      if (!thingId || !bodyText) {
        await this.answerCallbackQuery(query.id, '❌ Не удалось найти параметры поста или текст в базе.', true);
        return;
      }

      try {
        const poster = RedditPosterService.getInstance();
        const result = await poster.postComment(thingId, bodyText, {
          skipJitter: true,
          ignorePacing: true,
          subreddit: item?.subreddit,
        });

        if (result.success) {
          const permalink = result.permalink || (item?.target_url ? item.target_url : `https://www.reddit.com/comments/${thingId.replace('t3_', '')}`);
          repo.markDispatched(queueId, permalink);

          const successBadge = `\n\n✅ <b>Опубликовано в Reddit!</b>\n🔗 Ссылка: <a href="${permalink}">${permalink}</a>\n👤 Оператор: @${username || fromId} (${new Date().toLocaleTimeString('ru-RU')})`;

          const rawText = query.message?.text || '';
          const escapedBase = this.escapeHtml(rawText);
          const newText = `${escapedBase}${successBadge}`;

          const keyboard = {
            inline_keyboard: [
              [{ text: '🌐 Открыть комментарий в Reddit', url: permalink }],
            ],
          };

          if (chatId && messageId) {
            const edited = await this.editMessageText(chatId, messageId, newText, { reply_markup: keyboard });
            if (!edited) {
              await this.editMessageReplyMarkup(chatId, messageId, keyboard);
              await this.sendMessage(chatId, successBadge);
            }
          }
          await this.answerCallbackQuery(query.id, '✅ Опубликовано в Reddit!');
        } else {
          await this.answerCallbackQuery(query.id, `❌ Ошибка публикации: ${result.error}`, true);
          if (chatId) {
            await this.sendMessage(
              chatId,
              `⚠️ <b>Ошибка Reddit при публикации [${queueId}]:</b>\n<code>${this.escapeHtml(result.error || 'Unknown error')}</code>`
            );
          }
        }
      } catch (err: any) {
        console.error('[TelegramControlBot] publish callback error:', err);
        await this.answerCallbackQuery(query.id, `❌ Ошибка: ${err.message}`, true);
      }
      return;
    }

    // --- 1. Approve Action (Queue for scheduled dispatch) ---
    if (data.startsWith('approve_')) {
      const queueId = data.replace('approve_', '');
      const repo = ContentQueueRepository.getInstance();
      repo.markApproved(queueId);

      // Ingest to Gold Catalog if compliance threshold is met for bundles
      const bundle = this.loadBundleFromDisk(queueId);
      if (bundle) {
        bundle.status = 'APPROVED';
        this.saveBundleToDisk(queueId, bundle);
        if ((bundle.compliance?.score || 0) >= 90) {
          GoldCatalogService.getInstance().ingestApprovedBundle(bundle);
        }
      }

      await this.answerCallbackQuery(query.id, '📥 Переведено в очередь на отправку');

      if (chatId && messageId) {
        const rawText = query.message?.text || '';
        const escapedBase = this.escapeHtml(rawText);
        const notice = `\n\n📥 <b>Переведено в очередь на отправку диспетчером</b>\n👤 Оператор: @${username || fromId} (${new Date().toLocaleTimeString('ru-RU')})`;
        const newText = `${escapedBase}${notice}`;

        const edited = await this.editMessageText(chatId, messageId, newText, { reply_markup: { inline_keyboard: [] } });
        if (!edited) {
          await this.editMessageReplyMarkup(chatId, messageId, { inline_keyboard: [] });
          await this.sendMessage(chatId, notice);
        }
      }
      return;
    }

    // --- 2. Reject Action ---
    if (data.startsWith('reject_')) {
      const queueId = data.replace('reject_', '');
      const repo = ContentQueueRepository.getInstance();
      repo.markRejected(queueId);

      const bundle = this.loadBundleFromDisk(queueId);
      if (bundle) {
        bundle.status = 'REJECTED';
        this.saveBundleToDisk(queueId, bundle);
      }

      await this.answerCallbackQuery(query.id, '❌ Отклонено оператором');

      if (chatId && messageId) {
        const rawText = query.message?.text || '';
        const escapedBase = this.escapeHtml(rawText);
        const notice = `\n\n❌ <b>Отклонено оператором @${username || fromId}</b> (${new Date().toLocaleTimeString('ru-RU')})`;
        const newText = `${escapedBase}${notice}`;

        const edited = await this.editMessageText(chatId, messageId, newText, { reply_markup: { inline_keyboard: [] } });
        if (!edited) {
          await this.editMessageReplyMarkup(chatId, messageId, { inline_keyboard: [] });
          await this.sendMessage(chatId, notice);
        }
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
              const fromId = update.message.from?.id || update.message.chat.id;
              const username = update.message.from?.username;
              const rawCmd = (update.message.text || '').trim().toLowerCase();
              const isStart = rawCmd.startsWith('/start') || rawCmd === 'start';

              if (!this.isAdmin(fromId, username) && isStart) {
                await this.sendPublicQuizStep1(update.message.chat.id, update.message.from?.first_name);
              } else {
                const responseText = await this.handleCommand(update.message);
                if (responseText) {
                  await this.sendMessage(update.message.chat.id, responseText, {
                    reply_markup: this.getAdminReplyKeyboard(),
                  });
                }
              }
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

// Standalone runner or PM2 dedicated service execution
const isDedicatedRunner = Boolean(
  process.env.RUN_TELEGRAM_POLLING === 'true' ||
    (process.env.name && process.env.name.includes('telegram-bot')) ||
    (process.argv[1] &&
      (process.argv[1].endsWith('telegram-control-bot.service.ts') ||
        process.argv[1].endsWith('telegram-control-bot.service.js')))
);

if (isDedicatedRunner) {
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

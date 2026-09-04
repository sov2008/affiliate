import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { NewMessage } from 'telegram/events/index.js';
import { TelegramLeadRepository } from '../db/tg-leads.repository.js';
import { EmergencyStopController } from '../types/pipeline.js';
import { OfferRoutingService } from './offer-routing.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface UserbotMessageContext {
  peerId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  text: string;
  isOut?: boolean;
  isBot?: boolean;
  isChannel?: boolean;
  isGroup?: boolean;
}

export interface UserbotProcessResult {
  ignored: boolean;
  reason?: 'OUTGOING' | 'CHANNEL_OR_GROUP' | 'BOT' | 'COOLDOWN' | 'NO_TRIGGER' | 'EMERGENCY_STOP';
  matchedTrigger?: string;
  trackingUrl?: string;
  responseText?: string;
  clickId?: string;
}

export class TelegramUserbotService {
  private static instance: TelegramUserbotService | null = null;
  private client: TelegramClient | null = null;
  private isRunning: boolean = false;
  private peerCooldowns: Map<string, number> = new Map();
  private readonly cooldownMs: number = 120 * 1000; // 120s cooldown per peer ID
  private readonly leadRepo: TelegramLeadRepository;

  private readonly apiId: number;
  private readonly apiHash: string;
  private readonly adminChatId: string;
  private readonly botToken: string;
  private readonly offerBaseUrl: string;

  public static readonly KEYWORD_TRIGGERS: string[] = [
    'dating',
    'link',
    'profiles',
    'filter',
    'meet',
    'знакомства',
    'ссылка',
    'познакомиться',
    'анкеты',
    'девушки',
    'парни',
    'бот',
    'bot',
    'сайт',
  ];

  public constructor(customRepo?: TelegramLeadRepository) {
    this.leadRepo = customRepo || TelegramLeadRepository.getInstance();
    this.apiId = Number(process.env.TELEGRAM_APP_API_ID || 36036114);
    this.apiHash = process.env.TELEGRAM_APP_API_HASH || '19bd84292c33441170cad1585e7989fc';
    this.adminChatId = process.env.ADMIN_CHAT_ID || '808343978';
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.offerBaseUrl =
      process.env.LOSPOLLOS_DATING_URL ||
      process.env.AFFILIATE_OFFER_URL ||
      'https://yex2brk.chemistrydrivensmile.org/rp1pd38';
  }

  public static getInstance(): TelegramUserbotService {
    if (!this.instance) {
      this.instance = new TelegramUserbotService();
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Evaluates text against defensive keyword trigger pool
   */
  public matchTrigger(text: string): string | null {
    const textLower = (text || '').toLowerCase();
    for (const kw of TelegramUserbotService.KEYWORD_TRIGGERS) {
      if (textLower.includes(kw)) {
        return kw;
      }
    }
    return null;
  }

  /**
   * Checks if peer ID is currently throttled under the 120s cooldown
   */
  public isRateLimited(peerId: string): boolean {
    const now = Date.now();
    const lastTime = this.peerCooldowns.get(peerId) || 0;
    return now - lastTime < this.cooldownMs;
  }

  /**
   * Updates rate limit timestamp for a peer ID
   */
  public touchCooldown(peerId: string): void {
    this.peerCooldowns.set(peerId, Date.now());
  }

  /**
   * Generates unique clickId and uniform tracking URL for peer
   */
  public generateRoutingLink(peerId: string): { url: string; clickId: string } {
    const router = OfferRoutingService.getInstance();
    const routing = router.resolveOfferUrl({
      chatId: peerId,
      sub1: 'tg_userbot',
    });

    return { url: routing.url, clickId: routing.clickId };
  }

  /**
   * Generates a conversational, native response incorporating the routing link
   */
  public generateNativeResponse(trackingUrl: string): string {
    const responses = [
      `Hey! Here is the direct link to the verified matches portal: ${trackingUrl}`,
      `Here you go! Check the verified active profiles in your area here: ${trackingUrl}`,
      `Hi! You can view and filter nearby matches directly here: ${trackingUrl}`,
      `Hey! You can browse active verified users here: ${trackingUrl}`,
    ];
    const randIdx = Math.floor(Math.random() * responses.length);
    return responses[randIdx];
  }

  /**
   * Processes an incoming message context defensively
   */
  public async evaluateMessage(ctx: UserbotMessageContext): Promise<UserbotProcessResult> {
    // 1. Emergency stop check
    const eStop = EmergencyStopController.getInstance();
    if (eStop.isHalted()) {
      return { ignored: true, reason: 'EMERGENCY_STOP' };
    }

    // 2. Ignore self / outgoing messages
    if (ctx.isOut) {
      return { ignored: true, reason: 'OUTGOING' };
    }

    // 3. Ignore channels, groups, and bots
    if (ctx.isChannel || ctx.isGroup) {
      return { ignored: true, reason: 'CHANNEL_OR_GROUP' };
    }

    if (ctx.isBot) {
      return { ignored: true, reason: 'BOT' };
    }

    // 4. Check rate limiting (120s cooldown per peer ID)
    if (this.isRateLimited(ctx.peerId)) {
      return { ignored: true, reason: 'COOLDOWN' };
    }

    // 5. Check trigger keywords
    const matched = this.matchTrigger(ctx.text);
    if (!matched) {
      return { ignored: true, reason: 'NO_TRIGGER' };
    }

    // Qualified DM -> apply cooldown
    this.touchCooldown(ctx.peerId);

    // Generate tracking link and conversational copy
    const { url, clickId } = this.generateRoutingLink(ctx.peerId);
    const responseText = this.generateNativeResponse(url);

    return {
      ignored: false,
      matchedTrigger: matched,
      trackingUrl: url,
      responseText,
      clickId,
    };
  }

  /**
   * Forwards userbot activity telemetry to Admin Telegram Chat (808343978)
   */
  public async notifyAdmin(payload: {
    peerId: string;
    username?: string;
    text: string;
    trigger: string;
  }): Promise<boolean> {
    if (!this.botToken || !this.adminChatId) {
      console.log(`[Userbot Telemetry Sim] Inbound from ${payload.peerId} (${payload.trigger})`);
      return true;
    }

    const snippet = payload.text.slice(0, 60).replace(/[<>]/g, '');
    const userDisplay = payload.username ? `@${payload.username}` : `id_${payload.peerId}`;
    const alertText = `[Userbot Activity] Inbound conversation from ${userDisplay} (${payload.peerId}) | Trigger: "${snippet}" | Routed: Dating PPL`;

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.adminChatId,
          text: alertText,
        }),
      });
      const data = await res.json();
      return data.ok === true;
    } catch (err) {
      console.error('[TelegramUserbot] Failed to notify admin:', err);
      return false;
    }
  }

  /**
   * Starts the GramJS MTProto Userbot Client
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[TelegramUserbot] Already running.');
      return;
    }

    const sessionString = (process.env.TELEGRAM_USER_SESSION || '').trim();

    if (!sessionString) {
      console.log('\n⚠️ ================================================================');
      console.log('⚠️ [TelegramUserbot] TELEGRAM_USER_SESSION not found in environment.');
      console.log('⚠️ To generate a session, connect to the server and run:');
      console.log('⚠️   npm run session:telegram');
      console.log('⚠️ Process will stay in STANDBY / IDLE mode (checking every 60s)...');
      console.log('⚠️ ================================================================\n');

      this.isRunning = true;
      // Idle poll loop to avoid PM2 crash loops while awaiting session generation
      setInterval(async () => {
        try {
          dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
          dotenv.config({ path: path.resolve(process.cwd(), 'core/.env'), override: true });
          if (process.env.TELEGRAM_USER_SESSION && process.env.TELEGRAM_USER_SESSION.trim() !== '') {
            console.log('🔑 [TelegramUserbot] New session detected! Initializing client...');
            await this.stop();
            await this.start();
          }
        } catch {}
      }, 60000);
      return;
    }

    console.log('\n🤖 ================================================================');
    console.log('🤖 STARTING AUTONOMOUS TELEGRAM MTPROTO USERBOT (GRAMJS)');
    console.log('🤖 ================================================================\n');

    try {
      const stringSession = new StringSession(sessionString);
      this.client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
        connectionRetries: 5,
      });

      await this.client.connect();

      const me: any = await this.client.getMe();
      const meName = [me?.firstName, me?.lastName].filter(Boolean).join(' ') || 'Userbot';
      const meHandle = me?.username ? `@${me.username}` : `id_${me?.id}`;

      console.log(`✓ MTProto Connected as: ${meName} (${meHandle})`);
      console.log(`✓ Trigger Keywords: ${TelegramUserbotService.KEYWORD_TRIGGERS.join(', ')}`);
      console.log(`✓ Cooldown Window: ${this.cooldownMs / 1000}s per unique user`);
      console.log(`✓ Routing Base: ${this.offerBaseUrl}`);
      console.log(`✓ Admin Alerts Target: ${this.adminChatId}\n`);

      this.client.addEventHandler(async (event: any) => {
        try {
          const message = event.message;
          if (!message) return;

          const sender = await message.getSender();
          const peerId = String(message.chatId || sender?.id || '');
          const text = (message.text || message.message || '').trim();

          const evalResult = await this.evaluateMessage({
            peerId,
            username: sender?.username,
            firstName: sender?.firstName,
            lastName: sender?.lastName,
            text,
            isOut: Boolean(message.out),
            isBot: Boolean(sender?.bot),
            isChannel: Boolean(message.isChannel),
            isGroup: Boolean(message.isGroup),
          });

          if (evalResult.ignored || !evalResult.responseText) {
            return;
          }

          console.log(
            `\x1b[36m[TelegramUserbot] Qualified inbound DM from ${peerId} (@${sender?.username || 'anon'}): "${text}"\x1b[0m`
          );

          // Deliver conversational response
          await this.client?.sendMessage(message.chatId || sender, {
            message: evalResult.responseText,
          });

          console.log(
            `\x1b[32m[TelegramUserbot] Responded with offer link: ${evalResult.trackingUrl} (clickId: ${evalResult.clickId})\x1b[0m`
          );

          // Forward telemetry to admin chat
          await this.notifyAdmin({
            peerId,
            username: sender?.username,
            text,
            trigger: evalResult.matchedTrigger || 'dating',
          });
        } catch (msgErr) {
          console.error('[TelegramUserbot] Error handling message event:', msgErr);
        }
      }, new NewMessage({}));

      this.isRunning = true;
      console.log('🟢 [TelegramUserbot] Autonomous listener ACTIVE and awaiting inbound queries.');
    } catch (err) {
      console.error('❌ [TelegramUserbot] Connection failed:', err);
      // Fall back to standby idle loop instead of crashing PM2
      this.isRunning = true;
      setInterval(() => {}, 60000);
    }
  }

  /**
   * Gracefully shuts down the MTProto Client
   */
  public async stop(): Promise<void> {
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch {}
      this.client = null;
    }
    this.isRunning = false;
    console.log('🛑 [TelegramUserbot] Client disconnected and stopped.');
  }
}

export const telegramUserbotService = TelegramUserbotService.getInstance();

// Standalone runner for PM2 execution
const isUserbotRunner = Boolean(
  (process.env.name && process.env.name.includes('telegram-userbot')) ||
  (process.argv[1] && process.argv[1].includes('telegram-userbot')) ||
  process.env.RUN_USERBOT === 'true'
);

if (isUserbotRunner && process.env.NODE_ENV !== 'test') {
  telegramUserbotService.start().catch((err) => {
    console.error('Fatal userbot startup error:', err);
  });
}

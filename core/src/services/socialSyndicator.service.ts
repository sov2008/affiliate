import { URL } from 'url';
import { ContentQueueRepository, ContentQueueItem } from '../db/queueRepository.js';

export interface DispatchResult {
  success: boolean;
  item?: ContentQueueItem;
  messageId?: number;
  publishedUrl?: string;
  isMock?: boolean;
  message?: string;
  cooldownRemainingSec?: number;
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export class SocialSyndicatorService {
  private static instance: SocialSyndicatorService | null = null;
  private queueRepo: ContentQueueRepository;
  private botToken: string;
  private channelId: string;
  private lastDispatchAt: number = 0;

  private constructor() {
    this.queueRepo = ContentQueueRepository.getInstance();
    this.botToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    this.channelId = (
      process.env.TELEGRAM_CHANNEL_ID ||
      process.env.TELEGRAM_ALERT_CHAT_ID ||
      process.env.TELEGRAM_CHAT_ID ||
      process.env.ADMIN_CHAT_ID ||
      ''
    ).trim();
  }

  public static getInstance(): SocialSyndicatorService {
    if (!this.instance) {
      this.instance = new SocialSyndicatorService();
    }
    return this.instance;
  }

  /**
   * Dispatches next pending social snippet to configured Telegram channel
   */
  public async dispatchNextSnippet(options?: { force?: boolean }): Promise<DispatchResult> {
    const minIntervalMinutes = parseInt(process.env.SYNDICATION_INTERVAL_MINUTES || '30', 10) || 30;
    const minIntervalMs = minIntervalMinutes * 60 * 1000;
    const now = Date.now();

    // Spam / Flooding protection (unless explicitly forced from Dashboard UI)
    if (!options?.force && this.lastDispatchAt > 0) {
      const elapsed = now - this.lastDispatchAt;
      if (elapsed < minIntervalMs) {
        const remainingSec = Math.ceil((minIntervalMs - elapsed) / 1000);
        return {
          success: false,
          message: `Cooldown active. Next syndication available in ${remainingSec}s`,
          cooldownRemainingSec: remainingSec,
        };
      }
    }

    // Fetch next eligible item from queue
    const item = this.queueRepo.getNextPendingSnippet();
    if (!item) {
      return {
        success: false,
        message: 'No pending social snippets found in queue.',
      };
    }

    // Parse payload or fallback to hook & body
    let parsedPayload: Record<string, any> = {};
    if (item.payload) {
      try {
        parsedPayload = JSON.parse(item.payload);
      } catch (err: any) {
        console.warn(`[SocialSyndicator] JSON parse warning for item ${item.id}:`, err.message);
      }
    }

    let targetUrl =
      parsedPayload.url ||
      item.target_url ||
      item.tracking_url ||
      'https://flirtcheck.site/blog/';

    try {
      const urlObj = new URL(targetUrl);
      if (!urlObj.searchParams.has('utm_source')) {
        urlObj.searchParams.set('utm_source', 'telegram');
      }
      if (!urlObj.searchParams.has('utm_medium')) {
        urlObj.searchParams.set('utm_medium', 'social_snippet');
      }
      if (!urlObj.searchParams.has('utm_campaign')) {
        urlObj.searchParams.set('utm_campaign', 'syndication');
      }
      targetUrl = urlObj.toString();
    } catch {
      const sep = targetUrl.includes('?') ? '&' : '?';
      targetUrl += `${sep}utm_source=telegram&utm_medium=social_snippet&utm_campaign=syndication`;
    }

    const rawTitle = parsedPayload.title || item.hook || 'FlirtCheck Dating Safety Alert';
    const rawContent = parsedPayload.content || item.body || '';
    const tags = Array.isArray(parsedPayload.tags) && parsedPayload.tags.length > 0
      ? parsedPayload.tags
      : ['DatingSafety', 'OnlineDating', 'FlirtCheck'];

    // Format post text
    const cleanTitle = rawTitle.replace(/^🧵\s*/, '').trim();
    const contentLines = rawContent
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && !line.toLowerCase().startsWith('http') && !line.includes('#'));

    const bodyText = contentLines.slice(0, 5).join('\n\n');

    const hashtagLine = tags
      .map((t: string) => `#${t.replace(/[^a-zA-Z0-9_]/g, '')}`)
      .slice(0, 4)
      .join(' ');

    const telegramMessage = `🛡️ <b>${escapeHtml(cleanTitle)}</b>\n\n${escapeHtml(bodyText)}\n\n👉 <a href="${targetUrl}">Read Full Breakdown ➔</a>\n\n${hashtagLine}`;

    // Dry-run mode if credentials are not configured
    const isMock = !this.botToken || !this.channelId;

    if (isMock) {
      console.log(`⚠️ [SocialSyndicator] Dry-Run Mock Channel active (token=${Boolean(this.botToken)}, channel=${Boolean(this.channelId)}). Simulating syndication for snippet ${item.id}`);
      const mockUrl = `mock://telegram/channel/post_${now}`;
      this.queueRepo.updateStatus(item.id, 'DISPATCHED', mockUrl);
      this.lastDispatchAt = now;

      return {
        success: true,
        item,
        isMock: true,
        publishedUrl: mockUrl,
        message: 'Dispatched in Dry-Run Mock Channel mode (credentials missing).',
      };
    }

    // Real Telegram Dispatch via Bot API
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.channelId,
          text: telegramMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📖 Read Full Breakdown ➔',
                  url: targetUrl,
                },
              ],
            ],
          },
        }),
      });

      const json = await response.json();

      if (!json.ok) {
        console.error('[SocialSyndicator] Telegram API error:', json.description);
        return {
          success: false,
          item,
          message: `Telegram error: ${json.description}`,
        };
      }

      const messageId = json.result?.message_id;
      const cleanChannel = this.channelId.replace('@', '');
      const publishedUrl = this.channelId.startsWith('-')
        ? `tg://msg?chat_id=${this.channelId}&message_id=${messageId}`
        : `https://t.me/${cleanChannel}/${messageId}`;

      // Update SQLite record to DISPATCHED
      this.queueRepo.updateStatus(item.id, 'DISPATCHED', publishedUrl);
      this.lastDispatchAt = now;

      console.log(`🚀 [SocialSyndicator] Successfully dispatched snippet ${item.id} -> Message ID: ${messageId}`);

      return {
        success: true,
        item,
        messageId,
        publishedUrl,
        isMock: false,
        message: 'Snippet successfully syndicated to Telegram channel.',
      };
    } catch (err: any) {
      console.error('[SocialSyndicator] Network exception during syndication:', err.message);
      return {
        success: false,
        item,
        message: `Network exception: ${err.message}`,
      };
    }
  }

  public getStatus(): {
    configured: boolean;
    channelId: string;
    lastDispatchAt: number;
  } {
    return {
      configured: Boolean(this.botToken && this.channelId),
      channelId: this.channelId ? `${this.channelId.slice(0, 4)}***` : 'NOT_SET',
      lastDispatchAt: this.lastDispatchAt,
    };
  }
}

export default SocialSyndicatorService;

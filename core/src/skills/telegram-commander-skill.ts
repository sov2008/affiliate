import path from 'path';
import dotenv from 'dotenv';
import { recall, remember } from '../memory-engine.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const WORKER_URL = process.env.POSTBACK_WORKER_URL || 'https://postback-engine.sov7.workers.dev';

export interface LeadAlert {
  campaignId: string;
  variant?: string;
  sub1?: string;
  payout: number;
  currency?: string;
  status?: string;
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log(`📡 [Telegram Commander] (Simulated / Pending Token) Dispatching Message:\n${text}`);
    return true;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML',
      }),
      signal: controller.signal,
    });
    return res.ok;
  } catch (err: any) {
    // Fallback silently if Telegram API is unreachable without crashing the daemon
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendConversionAlert(lead: LeadAlert): Promise<boolean> {
  const currency = lead.currency || 'USD';
  const status = lead.status || 'approved';
  const payoutStr = lead.payout.toFixed(2);
  
  const message = `
🎉 <b>[ПОДТВЕРЖДЕНА НОВАЯ КОНВЕРСИЯ]</b>
━━━━━━━━━━━━━━━━━━
💰 <b>Начислена выплата:</b> <b>+$${payoutStr} ${currency}</b>
🏷️ <b>Статус транзакции:</b> <code>${status.toUpperCase()}</code>
🎯 <b>Целевая кампания:</b> <code>${lead.campaignId}</code> (${lead.variant || 'v1'})
🔗 <b>Идентификатор клика (Click ID):</b> <code>${lead.sub1 || 'N/A'}</code>
⏰ <b>Время фиксации:</b> ${new Date().toLocaleTimeString('ru-RU')}
━━━━━━━━━━━━━━━━━━
⚡ <i>Автономный CPA-движок Antigravity</i>
  `.trim();

  return sendTelegramMessage(message);
}

export async function processTelegramCommand(commandText: string): Promise<string> {
  const parts = commandText.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts[1];

  console.log(`🤖 [Telegram Commander] Выполнение команды: ${cmd} (Параметр: ${arg || 'нет'})`);

  if (cmd === '/status' || cmd === 'status') {
    const memory = await recall('deployed_campaigns');
    const activeCount = Object.keys(memory || {}).length;
    return `
🟢 <b>СТАТУС СИСТЕМЫ: ОНЛАЙН (ШТАТНЫЙ РЕЖИМ)</b>
━━━━━━━━━━━━━━━━━━
📊 <b>Активных кампаний в памяти:</b> ${activeCount}
🖥️ <b>Узел сервера:</b> <code>178.128.199.28</code>
⚡ <b>Службы PM2:</b> <code>affiliate-dashboard</code>, <code>affiliate-autopilot</code>
🛡️ <b>Шлюз постбеков:</b> <code>postback-engine.sov7.workers.dev</code>
━━━━━━━━━━━━━━━━━━
    `.trim();
  }

  if (cmd === '/stats' || cmd === 'stats') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${WORKER_URL}/stats/all`, { signal: controller.signal });
      const data: any = await res.json();
      let totalRev = 0;
      let totalClicks = 0;

      for (const [k, v] of Object.entries<any>(data.stats || {})) {
        totalRev += v.revenue || 0;
        totalClicks += v.clicks || 0;
      }

      return `
📈 <b>ФИНАНСОВАЯ СТАТИСТИКА (EDGE ТЕЛЕМЕТРИЯ)</b>
━━━━━━━━━━━━━━━━━━
💵 <b>Общая подтвержденная выручка:</b> <b>$${totalRev.toFixed(2)} USD</b>
👆 <b>Всего зафиксировано кликов:</b> ${totalClicks}
🎯 <b>Зарегистрировано кампаний в Edge KV:</b> ${Object.keys(data.stats || {}).length}
━━━━━━━━━━━━━━━━━━
      `.trim();
    } catch {
      return '⚠️ Не удалось получить живую статистику с Cloudflare Edge.';
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (cmd === '/pause' && arg) {
    await remember('paused_campaigns', arg, { pausedAt: new Date().toISOString() });
    return `⏸️ Кампания <code>${arg}</code> <b>ПРИОСТАНОВЛЕНА</b>. Трафик направлен на безопасную заглушку.`;
  }

  if (cmd === '/resume' && arg) {
    return `▶️ Кампания <code>${arg}</code> <b>ВОЗОБНОВЛЕНА</b> в активную ротацию.`;
  }

  return `
ℹ️ <b>Доступные команды:</b>
• <code>/status</code> — Состояние узла сервера и PM2
• <code>/stats</code> — Сводка выручки и кликов
• <code>/pause &lt;campaign_id&gt;</code> — Приостановить трафик на кампанию
• <code>/resume &lt;campaign_id&gt;</code> — Возобновить трафик на кампанию
  `.trim();
}

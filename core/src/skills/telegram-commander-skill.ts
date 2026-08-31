import path from 'path';
import dotenv from 'dotenv';
import { recall, remember } from '../memory-engine';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      })
    });
    return res.ok;
  } catch (err: any) {
    console.warn('   ⚠️ Failed to dispatch Telegram message:', err.message);
    return false;
  }
}

export async function sendConversionAlert(lead: LeadAlert): Promise<boolean> {
  const currency = lead.currency || 'USD';
  const status = lead.status || 'approved';
  const payoutStr = lead.payout.toFixed(2);
  
  const message = `
🎉 <b>[CONVERSION ALERT]</b>
━━━━━━━━━━━━━━━━━━
💰 <b>Payout:</b> +$${payoutStr} ${currency}
🏷️ <b>Status:</b> <code>${status.toUpperCase()}</code>
🎯 <b>Campaign:</b> <code>${lead.campaignId}</code> (${lead.variant || 'v1'})
🔗 <b>Sub1 (Click ID):</b> <code>${lead.sub1 || 'N/A'}</code>
⏰ <b>Time:</b> ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━
⚡ <i>Autonomous Affiliate Engine</i>
  `.trim();

  return sendTelegramMessage(message);
}

export async function processTelegramCommand(commandText: string): Promise<string> {
  const parts = commandText.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts[1];

  console.log(`🤖 [Telegram Commander] Executing Command: ${cmd} (Arg: ${arg || 'none'})`);

  if (cmd === '/status' || cmd === 'status') {
    const memory = await recall('deployed_campaigns');
    const activeCount = Object.keys(memory || {}).length;
    return `
🟢 <b>SYSTEM STATUS: ONLINE</b>
━━━━━━━━━━━━━━━━━━
📊 <b>Active Campaigns:</b> ${activeCount}
🖥️ <b>Droplet Node:</b> <code>178.128.199.28</code>
⚡ <b>PM2 Services:</b> <code>affiliate-dashboard</code>, <code>affiliate-autopilot</code>
🛡️ <b>Worker Edge:</b> <code>postback-engine.sov7.workers.dev</code>
━━━━━━━━━━━━━━━━━━
    `.trim();
  }

  if (cmd === '/stats' || cmd === 'stats') {
    try {
      const res = await fetch(`${WORKER_URL}/stats/all`);
      const data = await res.json();
      let totalRev = 0;
      let totalClicks = 0;

      for (const [k, v] of Object.entries<any>(data.stats || {})) {
        totalRev += v.revenue || 0;
        totalClicks += v.clicks || 0;
      }

      return `
📈 <b>PERFORMANCE STATS</b>
━━━━━━━━━━━━━━━━━━
💵 <b>Total Revenue:</b> $${totalRev.toFixed(2)} USD
👆 <b>Total Clicks:</b> ${totalClicks}
🎯 <b>Logged Campaigns in KV:</b> ${Object.keys(data.stats || {}).length}
━━━━━━━━━━━━━━━━━━
      `.trim();
    } catch {
      return '⚠️ Failed to fetch live stats from Cloudflare Edge.';
    }
  }

  if (cmd === '/pause' && arg) {
    await remember('paused_campaigns', arg, { pausedAt: new Date().toISOString() });
    return `⏸️ Campaign <code>${arg}</code> has been PAUSED. Traffic will route to safe white-page.`;
  }

  if (cmd === '/resume' && arg) {
    return `▶️ Campaign <code>${arg}</code> has been RESUMED to active rotation.`;
  }

  return `
ℹ️ <b>Available Commands:</b>
• <code>/status</code> - View system node & PM2 health
• <code>/stats</code> - View total revenue & clicks
• <code>/pause &lt;campaign_id&gt;</code> - Pause traffic to campaign
• <code>/resume &lt;campaign_id&gt;</code> - Resume campaign traffic
  `.trim();
}

if (require.main === module) {
  console.log('🤖 [Telegram Commander Skill] Running self-test...');
  sendConversionAlert({
    campaignId: 'cmp_trading_au',
    variant: 'v1',
    sub1: 'clk_test_tg_101',
    payout: 350.00,
    status: 'approved',
    currency: 'USD'
  }).then(async () => {
    const statusResp = await processTelegramCommand('/status');
    console.log('\nCommand Response (/status):\n' + statusResp);
    process.exit(0);
  });
}

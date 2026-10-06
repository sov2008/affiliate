const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_ID = Number(process.env.TELEGRAM_APP_API_ID || 36036114);
const API_HASH = process.env.TELEGRAM_APP_API_HASH || '19bd84292c33441170cad1585e7989fc';
const SESSION = process.env.TELEGRAM_USER_SESSION;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const client = new TelegramClient(new StringSession(SESSION), API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log('Connected to Telegram MTProto!');

  const botEntity = await client.getEntity('admitad_bot');

  // Helper to send message and wait for bot response
  async function sendAndReceive(text, waitSeconds = 4) {
    console.log(`\n➡️ Sending to @admitad_bot: "${text}"`);
    const sent = await client.sendMessage(botEntity, { message: text });
    await sleep(waitSeconds * 1000);
    const messages = await client.getMessages(botEntity, { limit: 4 });
    const botReplies = messages.filter(m => !m.out && m.id > sent.id);
    for (const r of botReplies.reverse()) {
      console.log(`⬅️ [admitad_bot]: ${r.message}`);
    }
    return botReplies;
  }

  // 1. Ask for top offers
  await sendAndReceive('/top_offers', 5);

  // 2. Ask for coupons
  await sendAndReceive('/get_coupons', 5);

  // 3. Try generating Deeplink for NordVPN
  await sendAndReceive('https://nordvpn.com/ /subid flirtcheck_dossier', 5);

  // 4. Try generating Deeplink for Surfshark
  await sendAndReceive('https://surfshark.com/ /subid flirtcheck_blog', 5);

  // 5. Try generating Deeplink for AliExpress (Admitad Lite classic)
  await sendAndReceive('https://aliexpress.com/ /subid flirtcheck_test', 5);

  await client.disconnect();
}

run().catch(console.error);

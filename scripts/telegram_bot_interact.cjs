const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_ID = Number(process.env.TELEGRAM_APP_API_ID || 36036114);
const API_HASH = process.env.TELEGRAM_APP_API_HASH || '19bd84292c33441170cad1585e7989fc';
const SESSION = process.env.TELEGRAM_USER_SESSION;

async function checkAdmitadBot() {
  if (!SESSION) {
    console.error('No session found!');
    process.exit(1);
  }

  const client = new TelegramClient(new StringSession(SESSION), API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.connect();
  const me = await client.getMe();
  console.log(`Connected as @${me.username} (${me.firstName})`);

  // Check dialogs for admitad_bot
  const dialogs = await client.getDialogs({ limit: 20 });
  const admitadDialog = dialogs.find(d => {
    const entity = d.entity;
    return entity?.username === 'admitad_bot' || entity?.title?.toLowerCase().includes('admitad');
  });

  if (admitadDialog) {
    console.log(`Found Admitad Bot in dialogs! Title: ${admitadDialog.title || admitadDialog.entity?.username}`);
    const messages = await client.getMessages(admitadDialog.entity, { limit: 5 });
    console.log('\n--- Last 5 messages from @admitad_bot ---');
    for (const msg of messages.reverse()) {
      const sender = msg.out ? 'You' : '@admitad_bot';
      console.log(`[${sender}]: ${msg.message}`);
    }
  } else {
    console.log('Admitad Bot not yet in recent dialogs, resolving entity @admitad_bot...');
    const entity = await client.getEntity('admitad_bot');
    console.log(`Resolved entity: @${entity.username} (ID: ${entity.id})`);
    const messages = await client.getMessages(entity, { limit: 5 });
    console.log('\n--- Last 5 messages with @admitad_bot ---');
    for (const msg of messages.reverse()) {
      const sender = msg.out ? 'You' : '@admitad_bot';
      console.log(`[${sender}]: ${msg.message}`);
    }
  }

  await client.disconnect();
}

checkAdmitadBot().catch(console.error);

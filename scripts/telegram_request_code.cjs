const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const path = require('path');

const API_ID = 36036114;
const API_HASH = '19bd84292c33441170cad1585e7989fc';
const PHONE_NUMBER = '+380960422338';
const AUTH_FILE = path.resolve(__dirname, '../artifacts_telegram/pending_auth.json');

async function main() {
  console.log(`Connecting to Telegram MTProto Gateway for ${PHONE_NUMBER}...`);
  const session = new StringSession('');
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log('Connected! Sending code request...');

  const result = await client.sendCode(
    { apiId: API_ID, apiHash: API_HASH },
    PHONE_NUMBER,
    false
  );

  console.log('SendCode Result:', JSON.stringify(result, null, 2));

  const authData = {
    phoneNumber: PHONE_NUMBER,
    phoneCodeHash: result.phoneCodeHash,
    isCodeViaApp: result.isCodeViaApp,
    session: client.session.save(),
    timestamp: Date.now()
  };

  fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2), 'utf8');
  console.log(`✓ Auth state saved to ${AUTH_FILE}`);
  console.log(`STATUS: CODE_REQUESTED_SUCCESSFULLY`);
  console.log(`Delivered via: ${result.isCodeViaApp ? 'Telegram Official App' : 'SMS'}`);

  await client.disconnect();
}

main().catch(err => {
  console.error('ERROR_SENDING_CODE:', err);
  process.exit(1);
});

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const API_ID = 36036114;
const API_HASH = '19bd84292c33441170cad1585e7989fc';

const QR_FILE_TELEGRAM = path.resolve(__dirname, '../artifacts_telegram/telegram_qr.png');
const ARTIFACT_DIR = 'C:/Users/user/.gemini/antigravity-ide/brain/7224ad78-4514-4772-bbef-24c63c3c5306';
const QR_FILE_ARTIFACT = path.resolve(ARTIFACT_DIR, 'telegram_qr.png');

const ENV_FILE = path.resolve(__dirname, '../.env');
const CORE_ENV_FILE = path.resolve(__dirname, '../core/.env');

function updateEnv(filePath, key, value) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}="${value}"`;
  if (regex.test(content)) {
    content = content.replace(regex, newLine);
  } else {
    content = content.trimEnd() + '\n' + newLine + '\n';
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Updated ${key} in ${filePath}`);
}

async function main() {
  console.log('Initializing MTProto Client for QR Code Login...');
  const stringSession = new StringSession('');
  const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log('Connected to Telegram Gateway. Generating QR Code...');

  let qrGenerated = false;

  try {
    const user = await client.signInUserWithQrCode(
      { apiId: API_ID, apiHash: API_HASH },
      {
        qrCode: async (code) => {
          const loginUrl = `tg://login?token=${code.token.toString('base64url')}`;
          console.log('\n[QR_CODE_GENERATED]');
          console.log('Expires at:', new Date(code.expires * 1000).toLocaleTimeString());
          console.log('Login URL:', loginUrl);

          await QRCode.toFile(QR_FILE_TELEGRAM, loginUrl, {
            errorCorrectionLevel: 'M',
            scale: 8,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
          });

          try {
            fs.copyFileSync(QR_FILE_TELEGRAM, QR_FILE_ARTIFACT);
          } catch (e) {}

          console.log(`QR Code image saved to: ${QR_FILE_TELEGRAM}`);
          console.log(`QR Code artifact saved to: ${QR_FILE_ARTIFACT}`);
          qrGenerated = true;
        },
        onError: (err) => {
          console.error('[QR Auth Error]:', err);
          return false;
        }
      }
    );

    console.log('\n🎉 ================================================================');
    console.log('🎉 TELEGRAM QR LOGIN SUCCESSFUL!');
    console.log('🎉 ================================================================');
    console.log(`User: ${user?.firstName || ''} ${user?.lastName || ''} (@${user?.username || 'none'}, ID: ${user?.id})`);

    const sessionString = client.session.save();
    console.log(`Session length: ${sessionString.length} chars`);

    updateEnv(ENV_FILE, 'TELEGRAM_USER_SESSION', sessionString);
    updateEnv(CORE_ENV_FILE, 'TELEGRAM_USER_SESSION', sessionString);
    updateEnv(ENV_FILE, 'TELEGRAM_APP_API_ID', API_ID.toString());
    updateEnv(CORE_ENV_FILE, 'TELEGRAM_APP_API_ID', API_ID.toString());
    updateEnv(ENV_FILE, 'TELEGRAM_APP_API_HASH', API_HASH);
    updateEnv(CORE_ENV_FILE, 'TELEGRAM_APP_API_HASH', API_HASH);

    fs.writeFileSync(
      path.resolve(__dirname, '../artifacts_telegram/session_info.json'),
      JSON.stringify({
        userId: user?.id?.toString(),
        username: user?.username,
        firstName: user?.firstName,
        lastName: user?.lastName,
        sessionString,
        authMethod: 'QR_CODE',
        savedAt: new Date().toISOString()
      }, null, 2),
      'utf8'
    );

    console.log('STATUS: QR_AUTH_COMPLETED_SUCCESSFULLY');
    await client.disconnect();
    process.exit(0);

  } catch (err) {
    if (err.errorMessage === 'SESSION_PASSWORD_NEEDED') {
      console.log('STATUS: 2FA_PASSWORD_REQUIRED_AFTER_QR');
      // Save session progress
      const sessionString = client.session.save();
      updateEnv(ENV_FILE, 'TELEGRAM_USER_SESSION', sessionString);
      updateEnv(CORE_ENV_FILE, 'TELEGRAM_USER_SESSION', sessionString);
    } else {
      console.error('QR_LOGIN_FATAL_ERROR:', err);
    }
    await client.disconnect();
    process.exit(1);
  }
}

main().catch(console.error);

const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const path = require('path');

const API_ID = 36036114;
const API_HASH = '19bd84292c33441170cad1585e7989fc';
const AUTH_FILE = path.resolve(__dirname, '../artifacts_telegram/pending_auth.json');
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

async function verify(phoneCode, password2fa = '') {
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error('Pending auth file not found. Please request code first.');
  }

  const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  const session = new StringSession(authData.session);
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log('Connected to DC. Verifying code...');

  let user;
  try {
    const signInResult = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: authData.phoneNumber,
        phoneCodeHash: authData.phoneCodeHash,
        phoneCode: phoneCode.trim(),
      })
    );
    user = signInResult.user;
  } catch (err) {
    if (err.errorMessage === 'SESSION_PASSWORD_NEEDED') {
      if (!password2fa) {
        console.log('STATUS: 2FA_PASSWORD_REQUIRED');
        process.exit(2);
      }
      console.log('2FA required, checking 2FA password...');
      user = await client.signInWithPassword(
        { apiId: API_ID, apiHash: API_HASH },
        { password: () => password2fa.trim() }
      );
    } else {
      throw err;
    }
  }

  const sessionString = client.session.save();
  console.log('✅ SIGN IN SUCCESSFUL!');
  console.log(`User: ${user?.firstName || ''} ${user?.lastName || ''} (@${user?.username || 'none'}, ID: ${user?.id})`);

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
      phone: authData.phoneNumber,
      sessionString,
      savedAt: new Date().toISOString()
    }, null, 2),
    'utf8'
  );

  console.log('STATUS: AUTH_COMPLETE');
  await client.disconnect();
}

const codeArg = process.argv[2];
const pwdArg = process.argv[3] || '';

if (!codeArg) {
  console.error('Usage: node telegram_verify_code.cjs <code> [2fa_password]');
  process.exit(1);
}

verify(codeArg, pwdArg).catch(err => {
  console.error('VERIFICATION_ERROR:', err);
  process.exit(1);
});

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
// @ts-ignore
import input from 'input';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const API_ID = 36036114;
const API_HASH = '19bd84292c33441170cad1585e7989fc';

function updateEnvFile(filePath: string, key: string, value: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}="${value}"`;

    if (regex.test(content)) {
      content = content.replace(regex, newLine);
    } else {
      content = content.trimEnd() + '\n' + newLine + '\n';
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✓ Injected ${key} into ${filePath}`);
    return true;
  } catch (err) {
    console.error(`   ❌ Failed to write to ${filePath}:`, err);
    return false;
  }
}

async function runSessionGenerator() {
  console.log('\n📱 ================================================================');
  console.log('📱 TELEGRAM MTPROTO USER SESSION GENERATOR (GRAMJS)');
  console.log('📱 ================================================================\n');

  console.log(`🔑 App API ID:   ${API_ID}`);
  console.log(`🔒 App API Hash: ${API_HASH.slice(0, 6)}...${API_HASH.slice(-4)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const stringSession = new StringSession('');
  const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  console.log('\n🚀 Initializing connection to Telegram MTProto Gateway...');

  await client.start({
    phoneNumber: async () => {
      const phone = await input.text('📞 Введите номер телефона (в международном формате, напр. +1... или +7...): ');
      return phone.trim();
    },
    password: async () => {
      const pwd = await input.password('🔐 Введите пароль двухфакторной аутентификации (2FA Cloud Password, если включен): ');
      return pwd.trim();
    },
    phoneCode: async () => {
      const code = await input.text('📩 Введите код подтверждения из Telegram: ');
      return code.trim();
    },
    onError: (err: unknown) => {
      console.error('❌ Ошибка авторизации MTProto:', err);
    },
  });

  console.log('\n✅ Авторизация успешно пройдена!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const me: any = await client.getMe();
  const username = me.username ? `@${me.username}` : '(без username)';
  const phone = me.phone ? `+${me.phone}` : '(номер скрыт)';
  const name = [me.firstName, me.lastName].filter(Boolean).join(' ') || 'Unknown';
  const sessionString = client.session.save() as unknown as string;

  console.log('👤 Профиль авторизованного аккаунта:');
  console.log(`   • Имя:        ${name}`);
  console.log(`   • Username:   ${username}`);
  console.log(`   • Телефон:    ${phone}`);
  console.log(`   • User ID:    ${me.id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🔑 Сгенерированная MTProto StringSession:');
  console.log('────────────────────────────────────────────────────────────────');
  console.log(sessionString);
  console.log('────────────────────────────────────────────────────────────────');

  // Candidate .env files (VPS droplet paths + local repo paths)
  const envCandidates = [
    '/var/www/affiliate/core/.env',
    '/var/www/affiliate/.env',
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
  ];

  console.log('\n💾 Сохранение сессии в конфигурационные файлы:');
  const updatedFiles: string[] = [];

  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      const ok = updateEnvFile(envPath, 'TELEGRAM_USER_SESSION', sessionString);
      if (ok) updatedFiles.push(envPath);
    }
  }

  // Permissions hardening on Linux/VPS
  if (process.platform !== 'win32') {
    try {
      execSync('chmod 600 /var/www/affiliate/core/.env /var/www/affiliate/.env 2>/dev/null || true');
      console.log('   ✓ Права доступа ограничены: chmod 600 на .env файлы');
    } catch {}
  }

  console.log('\n================================================================');
  console.log('🎉 СЕССИЯ УСПЕШНО СОХРАНЕНА И ГОТОВА К ИСПОЛЬЗОВАНИЮ В ВОРКЕРАХ!');
  console.log('================================================================\n');

  await client.disconnect();
  process.exit(0);
}

runSessionGenerator().catch((err) => {
  console.error('\n💥 FATAL ERROR during session generation:', err);
  process.exit(1);
});

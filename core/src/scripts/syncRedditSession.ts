import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ProfileSessionManager } from '../automation/profileManager.js';
import { RedditPosterService, RedditSessionValidation } from '../services/reddit-poster.service.js';

// Загрузка переменных окружения
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const COOKIE_SRC_PATH = 'C:\\Users\\user\\Desktop\\Reddit_cookie.txt';
const TARGET_PROFILE_ID = 'stealth_reddit_operator_01';

interface ExtractionResult {
  sessionCookie: string;
}

function extractSessionCookie(filePath: string): ExtractionResult {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[CookieSync] Файл с сессионной кукой не найден по пути: ${filePath}`);
  }

  const rawContent = fs.readFileSync(filePath, 'utf8');
  const match = rawContent.match(/REDDIT_SESSION_COOKIE="?([^"\r\n]+)"?/);

  if (!match || !match[1]) {
    throw new Error('[CookieSync] Не удалось извлечь REDDIT_SESSION_COOKIE из содержимого файла.');
  }

  const token = match[1].trim();
  if (token.length < 20) {
    throw new Error(`[CookieSync] Некорректный размер сессионного токена: ${token.length} символов.`);
  }

  return { sessionCookie: token };
}

function updateEnvFiles(sessionCookie: string): void {
  const envTargetPaths: string[] = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'core/.env'),
    path.resolve(process.cwd(), '../.env'),
  ];

  for (const envPath of envTargetPaths) {
    if (fs.existsSync(path.dirname(envPath))) {
      let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      const lines = content
        .split('\n')
        .filter((l) => !l.startsWith('REDDIT_SESSION_COOKIE='));
      
      lines.push(`REDDIT_SESSION_COOKIE="${sessionCookie}"`);
      fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
      console.log(`  ✓ Переменная REDDIT_SESSION_COOKIE обновлена в: ${envPath}`);
    }
  }
}

async function hydratePlaywrightProfile(profileId: string, sessionCookie: string): Promise<void> {
  console.log(`🌐 [ProfileManager] Запуск persistent-контекста профиля: "${profileId}"...`);
  const { context } = await ProfileSessionManager.launchProfile(profileId, {
    headless: true,
  });

  try {
    console.log('🍪 [ProfileManager] Инъекция куки reddit_session в хранилище профиля...');
    await context.addCookies([
      {
        name: 'reddit_session',
        value: sessionCookie,
        domain: '.reddit.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      },
    ]);
  } finally {
    await ProfileSessionManager.closeProfile(profileId);
    console.log(`  ✓ Профиль "${profileId}" сохранен и корректно закрыт.`);
  }
}

async function main(): Promise<void> {
  console.log('\n🔒 ================================================================');
  console.log('🔒 REDDIT SESSION SYNC & PLAYWRIGHT PROFILE HYDRATION');
  console.log('🔒 ================================================================\n');

  // 1. Извлечение токена куки
  console.log(`📂 [1/4] Извлечение куки из "${COOKIE_SRC_PATH}"...`);
  const { sessionCookie } = extractSessionCookie(COOKIE_SRC_PATH);
  console.log(`  ✓ Токен успешно извлечен (длина: ${sessionCookie.length} символов, префикс: ${sessionCookie.slice(0, 16)}...)`);

  // 2. Обновление конфигурационных файлов .env
  console.log('\n📝 [2/4] Синхронизация файлов окружения .env...');
  updateEnvFiles(sessionCookie);
  process.env.REDDIT_SESSION_COOKIE = sessionCookie;

  // 3. Валидация подлинности сессии через Reddit Web API
  console.log('\n🔍 [3/4] Валидация сессии через Reddit API (/api/me.json)...');
  const posterService = RedditPosterService.getInstance();
  posterService.setSessionCookie(sessionCookie);

  const validation: RedditSessionValidation = await posterService.validateSession();
  if (!validation.valid) {
    throw new Error(`[AuthFailure] Сессия Reddit отклонена API: ${validation.error || 'Неизвестная ошибка'}`);
  }

  console.log(`  ✓ Идентификация подтверждена: u/${validation.username}`);
  console.log(`  ✓ Суммарная карма: ${validation.totalKarma ?? 0}`);
  if (validation.modhash) {
    console.log(`  ✓ Modhash получен: ${validation.modhash.slice(0, 12)}...`);
  }

  // 4. Инъекция сессии в Playwright Persistent Profile
  console.log(`\n💾 [4/4] Гидратация persistent-профиля Playwright: storage/profiles/${TARGET_PROFILE_ID}...`);
  await hydratePlaywrightProfile(TARGET_PROFILE_ID, sessionCookie);

  console.log('\n================================================================');
  console.log('✅ СИНХРОНИЗАЦИЯ И ВАЛИДАЦИЯ СЕССИИ REDDIT УСПЕШНО ЗАВЕРШЕНЫ');
  console.log('================================================================\n');
}

main().catch((err: unknown) => {
  const errorMsg = err instanceof Error ? err.message : String(err);
  console.error('\n❌ [FATAL ERROR]:', errorMsg);
  process.exit(1);
});

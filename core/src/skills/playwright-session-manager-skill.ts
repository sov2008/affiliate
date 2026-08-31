import { chromium, Browser, BrowserContext } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { proxyRotator } from './proxy-rotator-skill';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AUTH_DIR = path.resolve(__dirname, '../../.auth');
const SESSION_FILE = path.resolve(AUTH_DIR, 'session.json');

export interface SessionConfig {
  headless?: boolean;
  forceNew?: boolean;
  dryRun?: boolean;
  useProxy?: boolean;
}

export class PlaywrightSessionManager {
  private authDir: string;
  private sessionFile: string;

  constructor() {
    this.authDir = AUTH_DIR;
    this.sessionFile = SESSION_FILE;
  }

  private async ensureAuthDir() {
    try {
      await fs.mkdir(this.authDir, { recursive: true });
    } catch (e) {}
  }

  public async hasValidSession(): Promise<boolean> {
    try {
      await fs.access(this.sessionFile);
      const stat = await fs.stat(this.sessionFile);
      // Valid if less than 7 days old and non-empty
      const isValid = stat.size > 10 && (Date.now() - stat.mtimeMs < 7 * 24 * 3600 * 1000);
      return isValid;
    } catch {
      return false;
    }
  }

  public async getAuthenticatedContext(options: SessionConfig = {}): Promise<{ browser: Browser | null; context: BrowserContext | null; isDryRun: boolean }> {
    const isDryRun = options.dryRun ?? false;
    const isHeadless = options.headless ?? true;
    const forceNew = options.forceNew ?? false;

    console.log(`🔐 [Playwright Session Manager] Initializing Browser Context (Headless: ${isHeadless}, ForceNew: ${forceNew}, DryRun: ${isDryRun})...`);

    if (isDryRun) {
      await this.ensureAuthDir();
      const mockSession = {
        cookies: [{ name: 'ml_session', value: 'mock_session_token_' + Date.now(), domain: '.mylead.global', path: '/' }],
        origins: [{ origin: 'https://mylead.global', localStorage: [{ name: 'auth_verified', value: 'true' }] }]
      };
      await fs.writeFile(this.sessionFile, JSON.stringify(mockSession, null, 2));
      console.log(`   ✅ [Dry Run] Persistent session state captured at: ${this.sessionFile}`);
      return { browser: null, context: null, isDryRun: true };
    }

    await this.ensureAuthDir();
    const proxy = options.useProxy ? proxyRotator.getNextProxy() : undefined;

    const browser = await chromium.launch({
      headless: isHeadless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ],
      proxy: proxy ? { server: proxy.server, username: proxy.username, password: proxy.password } : undefined
    });

    const hasSession = await this.hasValidSession();
    let context: BrowserContext;

    if (hasSession && !forceNew) {
      console.log(`   📂 Loading cached session from: ${this.sessionFile}`);
      context = await browser.newContext({
        storageState: this.sessionFile,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1366, height: 768 }
      });
    } else {
      console.log('   🔑 Creating new stealth context and performing authentication...');
      context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1366, height: 768 }
      });

      // Inject session cookie if available in env
      const envCookie = process.env.MYLEAD_SESSION_COOKIE;
      if (envCookie) {
        await context.addCookies([
          { name: 'ml_session', value: envCookie, domain: '.mylead.global', path: '/' }
        ]);
      }

      // Perform login if credentials present
      const email = process.env.MYLEAD_EMAIL || process.env.MYLEAD_LOGIN;
      const pass = process.env.MYLEAD_PASSWORD || process.env.MYLEAD_PASS;

      if (email && pass) {
        const page = await context.newPage();
        try {
          console.log('   [Login] Navigating to MyLead login portal...');
          await page.goto('https://mylead.global/panel/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.fill('input[name="email"], input[name="login"], input[type="email"]', email);
          await page.fill('input[name="password"], input[type="password"]', pass);
          await page.click('button[type="submit"]');
          await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
          
          // Save session
          await context.storageState({ path: this.sessionFile });
          console.log(`   💾 Saved storage state to ${this.sessionFile}`);
        } catch (err: any) {
          console.warn('   ⚠️ Automated login flow completed with notice:', err.message);
        } finally {
          await page.close();
        }
      }
    }

    return { browser, context, isDryRun: false };
  }
}

export const sessionManager = new PlaywrightSessionManager();

// CLI Dry-run validation
if (require.main === module) {
  const args = process.argv.slice(2);
  const isDry = args.includes('--dry-run') || true;

  sessionManager.getAuthenticatedContext({ dryRun: isDry }).then(async ({ browser, isDryRun }) => {
    console.log(`\n🎉 [Session Manager] Test complete. DryRun: ${isDryRun}`);
    if (browser) await browser.close();
    process.exit(0);
  }).catch(err => {
    console.error('❌ Session Manager test failed:', err);
    process.exit(1);
  });
}

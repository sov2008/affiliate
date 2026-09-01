import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { chromium, BrowserContext, Page } from 'playwright';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

export interface ProfileLaunchOptions {
  headless?: boolean;
  proxy?: ProxyConfig;
  viewport?: { width: number; height: number };
  userAgent?: string;
}

export class ProfileSessionManager {
  private static activeContexts: Map<string, BrowserContext> = new Map();

  /**
   * Returns base path for persistent browser profiles storage
   */
  public static getProfilesDir(): string {
    const dir = path.resolve(process.cwd(), 'storage/profiles');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Launches or attaches a persistent anti-detect browser profile
   */
  public static async launchProfile(
    profileId: string,
    options: ProfileLaunchOptions = {}
  ): Promise<{ context: BrowserContext; page: Page }> {
    const profilePath = path.join(this.getProfilesDir(), profileId);
    if (!fs.existsSync(profilePath)) {
      fs.mkdirSync(profilePath, { recursive: true });
    }

    const envHeadless = process.env.PLAYWRIGHT_HEADLESS === 'true';
    const headless = options.headless ?? (process.env.PLAYWRIGHT_HEADLESS !== undefined ? envHeadless : true);
    const viewport = options.viewport ?? { width: 1280, height: 800 };
    const userAgent =
      options.userAgent ??
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    const launchArgs = [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--no-first-run',
      '--no-service-autorun',
      '--password-store=basic',
      '--use-mock-keychain',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
    ];

    const context = await chromium.launchPersistentContext(profilePath, {
      headless,
      viewport,
      userAgent,
      args: launchArgs,
      proxy: options.proxy,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation', 'notifications'],
      colorScheme: 'dark',
    });

    // Inject stealth bypass scripts into all newly created pages
    await context.addInitScript(() => {
      // 1. Hide navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // 2. Mock Chrome runtime object
      (window as any).chrome = {
        runtime: {},
        app: {},
        csi: () => {},
        loadTimes: () => {},
      };

      // 3. Mock languages & plugins
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // 4. Fix permissions query
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as any)
          : originalQuery(parameters);
    });

    let page = context.pages()[0];
    if (!page) {
      page = await context.newPage();
    }

    this.activeContexts.set(profileId, context);
    return { context, page };
  }

  /**
   * Gracefully closes an active profile session
   */
  public static async closeProfile(profileId: string): Promise<void> {
    const context = this.activeContexts.get(profileId);
    if (context) {
      await context.close();
      this.activeContexts.delete(profileId);
    }
  }

  /**
   * List all stored profile directories
   */
  public static listProfiles(): string[] {
    const dir = this.getProfilesDir();
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isDirectory());
  }
}

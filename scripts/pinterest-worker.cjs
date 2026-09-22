/**
 * Autonomous Pinterest Publisher & Traffic Engine
 * 
 * Production worker for managing @MoneyCashpw / FlirtCheck Pinterest account.
 * Developed in symbiosis with Free Claude Code (FCC) architecture.
 * 
 * Features:
 * - Scans blog/src/content/posts/*.md for fresh content
 * - Deduplication via persistent state (.antigravity/pinterest_state.json)
 * - Dynamic 1000x1500 px visual creative generator (sharp + SVG typography)
 * - Maximum internal cross-linking: article URL, /calculator, related dossiers, UTM tags
 * - Human-like randomized delays and rate limiting
 * - Supports --once (single execution) and daemon mode
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

// --- Configuration ---
const CONFIG = {
  postsDir: path.resolve(__dirname, '../blog/src/content/posts'),
  stateFile: path.resolve(__dirname, '../.antigravity/pinterest_state.json'),
  cookiesFile: path.resolve(__dirname, '../pinterest_cookies.json'),
  pinsOutputDir: path.resolve(__dirname, '../scratch/pins'),
  logsDir: path.resolve(__dirname, '../.antigravity/logs'),
  boardName: 'MoneyCash.pw',
  domain: 'https://flirtcheck.site',
  bridgeUrl: process.env.PINTEREST_BRIDGE_URL || 'https://t.me/flirtcheck', // Fallback unblocked channel/bridge
  useDirectLinks: process.env.PINTEREST_DIRECT_LINKS === 'true',
  minIntervalMs: 60 * 60 * 1000, // 1 hour between pins in daemon mode
  maxDailyPins: 4,
};

// Ensure required directories exist
[path.dirname(CONFIG.stateFile), CONFIG.pinsOutputDir, CONFIG.logsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  }
});

function log(msg, ...args) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [PinterestWorker] ${msg}`, ...args);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- State Management ---
class StateManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = {
      published: {}, // slug -> { publishedAt, pinUrl, board, title }
      lastRunAt: null,
      dailyCount: 0,
      lastDailyReset: new Date().toDateString()
    };
    this.load();
  }

  load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        this.state = { ...this.state, ...data };
      } catch (e) {
        log(`Warning: Failed to parse state file, initializing fresh: ${e.message}`);
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (e) {
      log(`Error saving state: ${e.message}`);
    }
  }

  isPublished(slug) {
    return !!this.state.published[slug];
  }

  recordPublication(slug, data) {
    this.checkDailyReset();
    this.state.published[slug] = {
      publishedAt: new Date().toISOString(),
      ...data
    };
    this.state.dailyCount += 1;
    this.state.lastRunAt = new Date().toISOString();
    this.save();
  }

  checkDailyReset() {
    const today = new Date().toDateString();
    if (this.state.lastDailyReset !== today) {
      this.state.dailyCount = 0;
      this.state.lastDailyReset = today;
    }
  }

  canPublishToday() {
    this.checkDailyReset();
    return this.state.dailyCount < CONFIG.maxDailyPins;
  }
}

// --- Content Scanner ---
class ContentScanner {
  constructor(postsDir) {
    this.postsDir = postsDir;
  }

  scanPosts() {
    if (!fs.existsSync(this.postsDir)) {
      log(`Posts directory not found: ${this.postsDir}`);
      return [];
    }

    const files = fs.readdirSync(this.postsDir).filter(f => f.endsWith('.md'));
    const posts = [];

    for (const file of files) {
      const fullPath = path.join(this.postsDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const slug = file.replace(/\.md$/, '');

      // Parse YAML frontmatter
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) continue;

      const fm = match[1];
      const getVal = (key) => {
        const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
        if (!m) return '';
        let val = m[1].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        return val;
      };

      const title = getVal('title') || slug;
      const description = getVal('description') || '';
      const category = getVal('category') || 'cyber-investigation';
      const author = getVal('author') || 'Technical Intelligence Desk';
      const coverImage = getVal('coverImage') || getVal('image') || '';

      posts.push({
        slug,
        title,
        description,
        category,
        author,
        coverImage,
        fullPath
      });
    }

    return posts;
  }
}

// --- Visual Generator (Sharp + SVG + Real Cover Image) ---
class VisualGenerator {
  static async generatePinImage(post, outputPath) {
    const width = 1000;
    const height = 1500;

    const escapeXml = (str) => (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    function wrapText(text, maxChars) {
      const words = (text || '').split(' ');
      const lines = [];
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).trim().length <= maxChars) {
          cur = (cur + ' ' + w).trim();
        } else {
          if (cur) lines.push(cur);
          cur = w;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    }

    // Attempt to resolve real cover image
    let coverBuffer = null;
    if (post.coverImage) {
      const cleanPath = post.coverImage.replace(/^\/+/, '');
      const fullCoverPath = path.resolve(__dirname, '../blog/public', cleanPath);
      if (fs.existsSync(fullCoverPath)) {
        try {
          coverBuffer = await sharp(fullCoverPath)
            .resize(920, 560, { fit: 'cover', position: 'center' })
            .png()
            .toBuffer();
          log(`Loaded real cover image for pin: ${cleanPath}`);
        } catch (err) {
          log(`Warning: Failed to load cover image: ${err.message}`);
        }
      }
    }

    const categoryUpper = escapeXml((post.category || 'SAFETY DOSSIER // DECLASSIFIED').toUpperCase());
    const safeTitle = escapeXml(post.title);
    const safeDesc = escapeXml(post.description);

    let svgOverlay = '';

    if (coverBuffer) {
      // 1. Layout WITH Cover Image (Top Image + Bottom Title & Forensic Dossier)
      const titleLines = wrapText(post.title, 34).slice(0, 3);
      const descLines = wrapText(post.description, 50).slice(0, 2);

      svgOverlay = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0a0f1d" />
            <stop offset="50%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#ef4444" />
          </linearGradient>
          <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#dc2626" />
            <stop offset="100%" stop-color="#e11d48" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

        <!-- Top Accent Border -->
        <rect x="0" y="0" width="${width}" height="8" fill="url(#goldAccent)" />

        <!-- Header Category Badge -->
        <rect x="40" y="45" width="420" height="42" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
        <circle cx="65" cy="66" r="6" fill="#10b981" />
        <text x="85" y="72" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" fill="#f59e0b" letter-spacing="2">
          ${categoryUpper}
        </text>

        <!-- Brand Watermark -->
        <text x="960" y="72" font-family="Helvetica, Arial, sans-serif" font-size="17" font-weight="900" fill="#94a3b8" text-anchor="end" letter-spacing="2">
          FLIRTCHECK.SITE
        </text>

        <!-- Border Frame around Cover Image -->
        <rect x="38" y="113" width="924" height="564" rx="12" fill="none" stroke="#334155" stroke-width="2" />

        <!-- Main Headline -->
        ${titleLines.map((line, i) => `
          <text x="500" y="${740 + i * 48}" font-family="Helvetica, Arial, sans-serif" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Divider Line -->
        <line x1="80" y1="${740 + titleLines.length * 48 + 15}" x2="920" y2="${740 + titleLines.length * 48 + 15}" stroke="#1e293b" stroke-width="2" />

        <!-- Key Evidence Bullets Box -->
        <rect x="60" y="930" width="880" height="340" rx="16" fill="#0b1120" stroke="#1e293b" stroke-width="1.5" />

        <!-- Bullet 1 -->
        <circle cx="110" cy="990" r="14" fill="#dc2626" />
        <text x="105" y="996" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">!</text>
        <text x="145" y="997" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="bold" fill="#f1f5f9">
          Forensic Breakdown of Modern Romance Funnels
        </text>

        <!-- Bullet 2 -->
        <circle cx="110" cy="1065" r="14" fill="#10b981" />
        <text x="103" y="1071" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">✓</text>
        <text x="145" y="1072" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="bold" fill="#f1f5f9">
          Real Scam Chat Logs &amp; Algorithm Optimization Rules
        </text>

        <!-- Bullet 3 -->
        <circle cx="110" cy="1140" r="14" fill="#3b82f6" />
        <text x="104" y="1146" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">★</text>
        <text x="145" y="1147" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="bold" fill="#f1f5f9">
          Profile Verification &amp; Match Shield Protocol
        </text>

        <!-- Bullet 4 -->
        <circle cx="110" cy="1215" r="14" fill="#8b5cf6" />
        <text x="104" y="1221" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">→</text>
        <text x="145" y="1222" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="bold" fill="#f1f5f9">
          Free Investigation Dossier at flirtcheck.site
        </text>

        <!-- CTA Button -->
        <rect x="220" y="1320" width="560" height="76" rx="38" fill="url(#btnGrad)" />
        <text x="500" y="1368" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">
          READ FULL INVESTIGATION ➔
        </text>

        <!-- Footer -->
        <text x="500" y="1450" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" fill="#64748b" text-anchor="middle" letter-spacing="2">
          FLIRTCHECK LABS • DECLASSIFIED TECHNICAL INTELLIGENCE
        </text>
      </svg>`;

    } else {
      // 2. Fallback Layout WITHOUT Cover Image
      const titleLines = wrapText(post.title, 32).slice(0, 4);
      const descLines = wrapText(post.description, 50).slice(0, 4);

      svgOverlay = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#090d16" />
            <stop offset="40%" stop-color="#111827" />
            <stop offset="100%" stop-color="#030712" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>
          <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#dc2626" />
            <stop offset="100%" stop-color="#e11d48" />
          </linearGradient>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
        <rect x="0" y="0" width="${width}" height="10" fill="url(#accentGrad)" />

        <text x="70" y="80" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="bold" fill="#ef4444" letter-spacing="4">
          FLIRTCHECK LABS • FORENSIC INVESTIGATION
        </text>
        <line x1="70" y1="130" x2="930" y2="130" stroke="#1f2937" stroke-width="2" />

        <rect x="70" y="165" width="340" height="42" rx="8" fill="#1f2937" stroke="#374151" stroke-width="1.5" />
        <circle cx="95" cy="186" r="6" fill="#10b981" />
        <text x="115" y="192" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="bold" fill="#f3f4f6" letter-spacing="1.5">
          ${categoryUpper}
        </text>

        ${titleLines.map((line, i) => `
          <text x="70" y="${280 + i * 65}" font-family="Helvetica, Arial, sans-serif" font-size="50" font-weight="900" fill="#ffffff">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <rect x="70" y="580" width="860" height="200" rx="16" fill="#131c2e" stroke="#1e293b" stroke-width="2" />
        ${descLines.map((line, i) => `
          <text x="105" y="${640 + i * 40}" font-family="Helvetica, Arial, sans-serif" font-size="25" fill="#cbd5e1">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <rect x="70" y="820" width="860" height="360" rx="16" fill="#0b1120" stroke="#1e293b" stroke-width="1.5" />
        <circle cx="115" cy="880" r="14" fill="#dc2626" />
        <text x="110" y="886" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">!</text>
        <text x="150" y="887" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="bold" fill="#f1f5f9">
          Declassified Behavioral Mechanics &amp; Patterns
        </text>

        <rect x="180" y="1230" width="640" height="90" rx="45" fill="url(#btnGrad)" />
        <text x="500" y="1288" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">
          ACCESS FULL DOSSIER →
        </text>

        <rect x="0" y="1390" width="${width}" height="110" fill="#030712" />
        <text x="500" y="1455" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="bold" fill="#9ca3af" text-anchor="middle" letter-spacing="3">
          FLIRTCHECK.SITE • OFFICIAL VERIFIED INVESTIGATION
        </text>
      </svg>`;
    }

    const svgBuffer = Buffer.from(svgOverlay);

    const composites = [
      { input: svgBuffer, top: 0, left: 0 }
    ];

    if (coverBuffer) {
      // Place real cover photo right inside the designed frame
      composites.push({
        input: coverBuffer,
        top: 115,
        left: 40
      });
    }

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 10, g: 15, b: 29, alpha: 1 }
      }
    })
      .composite(composites)
      .png({ quality: 95 })
      .toFile(outputPath);

    return outputPath;
  }
}

// --- Copy & Link Generator ---
class CopyGenerator {
  static generate(post) {
    // Generate Hook Title
    let title = post.title;
    if (!title.includes(':') && !title.includes('?')) {
      title = `${post.title}: Forensic Investigation`;
    }
    if (title.length > 95) {
      title = title.slice(0, 92) + '...';
    }

    // Maximum internal cross-linking in description
    const articleUrl = `https://flirtcheck.site/${post.slug}/`;
    const utmArticleUrl = `https://flirtcheck.site/${post.slug}/?utm_source=pinterest&utm_medium=organic&utm_campaign=${post.slug}`;
    const calculatorUrl = 'https://flirtcheck.site/calculator';
    const dossierCategoryUrl = 'https://flirtcheck.site/category/safety-dossier/';

    const hashtags = [
      '#datingsafety',
      '#onlinescams',
      '#cyberinvestigation',
      '#tindersafety',
      '#hingetips',
      '#romancescam',
      '#flirtcheck'
    ].join(' ');

    const description = `${post.description}\n\n` +
      `🛡️ Full Forensic Dossier: ${articleUrl}\n` +
      `⚡ Free Risk Calculator: ${calculatorUrl}\n` +
      `📂 Archive Database: ${dossierCategoryUrl}\n\n` +
      `${hashtags}`;

    return {
      title,
      description,
      destinationLink: CONFIG.useDirectLinks ? utmArticleUrl : CONFIG.bridgeUrl,
      directArticleUrl: utmArticleUrl
    };
  }
}

// --- Pinterest Playwright Publisher ---
class PinterestPublisher {
  constructor(cookiesPath) {
    this.cookiesPath = cookiesPath;
  }

  async publishPin(pinData) {
    log(`Launching Playwright session for: "${pinData.title}"...`);

    const browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1400, height: 950 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'en-US'
    });

    if (fs.existsSync(this.cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf8'));
      await context.addCookies(cookies);
    } else {
      await browser.close();
      throw new Error(`Cookies file not found at: ${this.cookiesPath}`);
    }

    const page = await context.newPage();

    try {
      log('Navigating to Pin Builder...');
      await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await sleep(rand(3500, 5000));

      // Dismiss any tour modals
      for (let i = 0; i < 3; i++) {
        const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
        if (tourBtn) {
          await tourBtn.click().catch(() => {});
          await sleep(500);
        }
        await page.keyboard.press('Escape');
      }

      // 1. Upload pin graphic
      log(`Uploading pin image: ${pinData.imagePath}`);
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) throw new Error('Could not find file input in Pin Builder');
      await fileInput.setInputFiles(pinData.imagePath);
      await sleep(rand(3000, 4500));

      // 2. Title
      log('Filling Title...');
      const titleArea = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], textarea[id*="title"], input[placeholder*="заголовок"], textarea[placeholder*="заголовок"]');
      if (titleArea) {
        await titleArea.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.type(pinData.title, { delay: rand(10, 30) });
        await sleep(rand(500, 1000));
      }

      // 3. Description
      log('Filling Description...');
      const descArea = await page.$('[aria-label="Добавьте описание пина"], [role="combobox"], textarea[id*="description"], [placeholder*="описание"]');
      if (descArea) {
        await descArea.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.type(pinData.description, { delay: rand(5, 15) });
        await sleep(rand(500, 1000));
      }

      // 4. Destination Link
      log(`Filling Destination Link: ${pinData.destinationLink}`);
      const linkArea = await page.$('textarea[placeholder*="ссылк"], input[placeholder*="ссылк"], textarea[placeholder*="link"], input[placeholder*="link"]');
      if (linkArea) {
        await linkArea.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await sleep(300);
        await page.keyboard.type(pinData.destinationLink, { delay: rand(10, 25) });
        await page.keyboard.press('Tab');
        await sleep(rand(2000, 3000));
      }

      // 5. Select Board
      log(`Selecting board: ${CONFIG.boardName}...`);
      const currentBoard = await page.evaluate(() => {
        const btn = document.querySelector('[data-test-id="board-dropdown-select-button"]');
        return btn ? btn.innerText : '';
      });

      if (!currentBoard.includes(CONFIG.boardName)) {
        await page.evaluate(() => {
          const btn = document.querySelector('[data-test-id="board-dropdown-select-button"]');
          if (btn) btn.click();
        });
        await sleep(1500);

        await page.evaluate((targetBoard) => {
          const rows = Array.from(document.querySelectorAll('[data-test-id="board-row"], [role="listbox"] div, [role="dialog"] div, [role="button"]'));
          for (const r of rows) {
            if (r.innerText && (r.innerText.includes(targetBoard) || r.innerText.includes('Все доски'))) {
              const btn = r.querySelector('button');
              if (btn) { btn.click(); return; }
              r.click();
              return;
            }
          }
        }, CONFIG.boardName);
        await sleep(2000);
      }

      // 6. Click Publish
      log('Clicking Publish button...');
      const published = await page.evaluate(() => {
        const btn = document.querySelector('[data-test-id="board-dropdown-save-button"]') ||
                    document.querySelector('button[aria-label*="Опубликовать"]') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Опубликовать'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (!published) throw new Error('Could not find or click Publish button');

      log('Waiting for publish confirmation...');
      await sleep(12000);

      // Verify pin link on profile
      log('Checking latest pin URL from profile...');
      await page.goto('https://www.pinterest.com/MoneyCashpw/_created/', { waitUntil: 'domcontentloaded', timeout: 35000 });
      await sleep(4000);

      const pinUrl = await page.evaluate(() => {
        const firstA = document.querySelector('div[data-test-id="pin"] a[href*="/pin/"]');
        return firstA ? firstA.href : null;
      });

      // Update cookies
      const newCookies = await context.cookies();
      fs.writeFileSync(this.cookiesPath, JSON.stringify(newCookies, null, 2), 'utf8');

      await browser.close();
      return { success: true, pinUrl: pinUrl || 'published' };

    } catch (err) {
      const errorShot = path.join(CONFIG.logsDir, `pin_publish_err_${Date.now()}.png`);
      try { await page.screenshot({ path: errorShot, fullPage: true }); } catch (e) {}
      await browser.close();
      throw err;
    }
  }
}

// --- Main Orchestrator ---
async function runSingleCycle() {
  log('Starting Pinterest Publisher cycle...');

  const stateMgr = new StateManager(CONFIG.stateFile);
  if (!stateMgr.canPublishToday()) {
    log(`Daily cap (${CONFIG.maxDailyPins}) reached. Skipping cycle.`);
    return;
  }

  const scanner = new ContentScanner(CONFIG.postsDir);
  const allPosts = scanner.scanPosts();
  log(`Found ${allPosts.length} total posts in blog.`);

  // Filter unpublished posts
  const pendingPosts = allPosts.filter(p => !stateMgr.isPublished(p.slug));
  log(`Pending unpublished posts: ${pendingPosts.length}`);

  if (pendingPosts.length === 0) {
    log('All posts have already been published to Pinterest! Resetting oldest or exiting.');
    return;
  }

  // Select next post (round-robin / FIFO)
  const targetPost = pendingPosts[0];
  log(`Selected target post for publishing: "${targetPost.title}" (${targetPost.slug})`);

  // Generate 1000x1500 visual asset
  const imagePath = path.join(CONFIG.pinsOutputDir, `pin_${targetPost.slug}.png`);
  log(`Rendering visual pin creative to: ${imagePath}`);
  await VisualGenerator.generatePinImage(targetPost, imagePath);
  log(`Visual asset created successfully: ${fs.statSync(imagePath).size} bytes`);

  // Generate Copy & Links
  const copyData = CopyGenerator.generate(targetPost);

  // Publish via Playwright
  const publisher = new PinterestPublisher(CONFIG.cookiesFile);
  const result = await publisher.publishPin({
    title: copyData.title,
    description: copyData.description,
    destinationLink: copyData.destinationLink,
    imagePath
  });

  if (result.success) {
    log(`🎉 Successfully published Pin! URL: ${result.pinUrl}`);
    stateMgr.recordPublication(targetPost.slug, {
      title: copyData.title,
      pinUrl: result.pinUrl,
      board: CONFIG.boardName,
      directArticleUrl: copyData.directArticleUrl,
      destinationLink: copyData.destinationLink
    });
  }
}

async function main() {
  const isOnce = process.argv.includes('--once');

  if (isOnce) {
    log('Running in single-execution mode (--once)...');
    await runSingleCycle();
    log('Single execution completed. Exiting.');
    process.exit(0);
  }

  log(`Running in DAEMON mode (Interval: ${CONFIG.minIntervalMs / 60000} mins, Daily Cap: ${CONFIG.maxDailyPins})...`);
  
  // Initial run
  try {
    await runSingleCycle();
  } catch (err) {
    log(`Initial run error: ${err.message}`);
  }

  // Jittered recurring loop
  setInterval(async () => {
    try {
      const jitterMs = rand(0, 15 * 60 * 1000); // 0-15m jitter
      log(`Waiting ${Math.round(jitterMs / 1000)}s jitter before cycle...`);
      await sleep(jitterMs);
      await runSingleCycle();
    } catch (err) {
      log(`Recurring cycle error: ${err.message}`);
    }
  }, CONFIG.minIntervalMs);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal Worker Error:', err);
    process.exit(1);
  });
}

module.exports = {
  StateManager,
  ContentScanner,
  VisualGenerator,
  CopyGenerator,
  PinterestPublisher,
  runSingleCycle
};

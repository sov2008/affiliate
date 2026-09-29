/**
 * Pinterest Queue & Creative Automation Engine
 * Standard: Cheltenham Forensic Evidence Gazette // FlirtCheck Laboratory
 * 
 * Features:
 * - Scans all articles from blog/src/content/posts/*.md
 * - Generates high-converting 1000x1500 px (2:3) vertical editorial pins with Sharp + SVG
 * - Implements Cheltenham Desk editorial typography (Georgia Serif + Monospace technical registers)
 * - Dynamic Glassmorphism Evidence Panels with declassified case findings
 * - High-contrast CTA buttons and brand telemetry badges
 * - Rich Pinterest SEO descriptions with structured hooks and hashtags
 * - Maintains persistent JSON queue (.antigravity/pinterest_queue.json)
 * - Safe publishing via Playwright to board "MoneyCash.pw" with direct canonical URLs
 * 
 * CLI Usage:
 *   node scripts/pinterest-queue-manager.cjs --status
 *   node scripts/pinterest-queue-manager.cjs --build-all
 *   node scripts/pinterest-queue-manager.cjs --publish-next
 *   node scripts/pinterest-queue-manager.cjs --slug <slug>
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const CONFIG = {
  postsDir: path.resolve(__dirname, '../blog/src/content/posts'),
  queueFile: path.resolve(__dirname, '../.antigravity/pinterest_queue.json'),
  stateFile: path.resolve(__dirname, '../.antigravity/pinterest_state.json'),
  cookiesFile: path.resolve(__dirname, '../pinterest_cookies.json'),
  pinsOutputDir: path.resolve(__dirname, '../scratch/pins'),
  boardName: 'MoneyCash.pw',
  domain: 'https://flirtcheck.site',
  minIntervalMs: 60 * 1000,
};

// Ensure directories
[path.dirname(CONFIG.queueFile), CONFIG.pinsOutputDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function log(msg, ...args) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${ts}] [PinterestQueue] ${msg}`, ...args);
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapHeadline(text, maxCharsPerLine = 23) {
  const clean = text.replace(/[*_#`"]/g, '').trim();
  const words = clean.split(/\s+/);
  const lines = [];
  let cur = '';

  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= maxCharsPerLine) {
      cur = (cur + ' ' + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);

  // If ends with a dangling preposition/conjunction, adjust
  const dangling = ['and', 'the', 'in', 'into', 'with', 'to', 'for', 'of', 'a', 'an', 'is'];
  if (lines.length > 3) {
    // Merge last lines or trim cleanly
    const merged = lines.slice(2).join(' ');
    lines[2] = merged.length > maxCharsPerLine + 5 ? merged.substring(0, maxCharsPerLine + 2) + '...' : merged;
    return lines.slice(0, 3);
  }

  return lines;
}

function formatBulletText(rawText) {
  let cleaned = rawText
    .replace(/[*_#`]/g, '')
    .replace(/^\[.*?\]\s*/, '')
    .trim();

  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    const prefix = parts[0].trim();
    const rest = parts.slice(1).join(':').trim();
    return {
      prefix: prefix.length > 26 ? prefix.substring(0, 23) + '...' : prefix,
      body: rest.length > 70 ? rest.substring(0, 67) + '...' : rest
    };
  }

  const words = cleaned.split(/\s+/);
  let prefixWords = [];
  let restWords = [];
  let charCount = 0;
  for (const w of words) {
    if (charCount + w.length <= 22 && prefixWords.length < 3) {
      prefixWords.push(w);
      charCount += w.length + 1;
    } else {
      restWords.push(w);
    }
  }

  const prefix = prefixWords.join(' ');
  const body = restWords.join(' ');
  return {
    prefix: prefix || 'Evidence Finding',
    body: body.length > 70 ? body.substring(0, 67) + '...' : body
  };
}

function extractKeyTakeaways(rawMarkdown, title) {
  const bullets = [];
  
  const takeawayMatch = rawMarkdown.match(/##+\s*(?:Key Takeaways Dossier|Key Takeaways|Executive Summary|Core Findings)[\s\S]*?(?=\n##|$)/i);
  if (takeawayMatch) {
    const lines = takeawayMatch[0].split('\n');
    for (const line of lines) {
      const bMatch = line.match(/^\s*[-*•]\s+(.*)/);
      if (bMatch) {
        const text = bMatch[1].trim();
        if (text.length > 10) {
          bullets.push(formatBulletText(text));
          if (bullets.length >= 3) break;
        }
      }
    }
  }

  if (bullets.length < 3) {
    const generalBullets = rawMarkdown.match(/^\s*[-*•]\s+([^\n]+)/gm);
    if (generalBullets) {
      for (const gb of generalBullets) {
        const text = gb.replace(/^\s*[-*•]\s+/, '').trim();
        if (text.length > 20) {
          bullets.push(formatBulletText(text));
          if (bullets.length >= 3) break;
        }
      }
    }
  }

  if (bullets.length < 3) {
    const t = title.toLowerCase();
    if (t.includes('sextortion') || t.includes('blackmail')) {
      return [
        { prefix: 'Forensic Signals', body: 'Irregular typing latency, token bursts and spoofed EXIF' },
        { prefix: 'Containment Protocol', body: 'Isolate device immediately without paying extortionist' },
        { prefix: 'Evidence Vaulting', body: 'Preserve raw network logs and file headers for reporting' }
      ];
    }
    if (t.includes('shadowban') || t.includes('elo')) {
      return [
        { prefix: 'Visibility Suppression', body: '5 telemetry flags indicating silent swipe pool demotion' },
        { prefix: 'Dynamic Scoring', body: 'How incoming vs outgoing swipe ratios adjust your rank' },
        { prefix: 'Recovery Protocol', body: 'Step-by-step account reset without triggering device hash bans' }
      ];
    }
    if (t.includes('bumble') || t.includes('active')) {
      return [
        { prefix: 'Activity Telemetry', body: 'Background geolocation pings vs real chat activity' },
        { prefix: 'Snooze Mode Detection', body: 'Decoding silent breaks without profile disappearance' },
        { prefix: 'Time-Waster Filter', body: 'Data-backed 3-minute audit to weed out inactive matches' }
      ];
    }
    if (t.includes('catfish') || t.includes('deepfake')) {
      return [
        { prefix: 'AI Face Inspection', body: 'Pupil reflections, ear asymmetry and GAN border artefacts' },
        { prefix: 'Reverse Search Limits', body: 'Why Google Lens fails against newly synthesised personas' },
        { prefix: 'Live Verification Call', body: 'The 30-second video challenge to verify genuine identity' }
      ];
    }
    return [
      { prefix: 'Registry Telemetry', body: 'Technical checks across public databases and OSINT tools' },
      { prefix: 'Safety Verification', body: 'Step-by-step guidelines to protect privacy and finances' },
      { prefix: 'Actionable Checklist', body: 'Data-driven decision framework before meeting in person' }
    ];
  }

  return bullets.slice(0, 3);
}

function resolveEditorialTheme(title, slug, category = '') {
  const text = (title + ' ' + slug + ' ' + category).toLowerCase();

  // Cyber Scam / Extortion / Pig Butchering / Blackmail
  if (text.includes('scam') || text.includes('sextortion') || text.includes('blackmail') || text.includes('crypto') || text.includes('butchering')) {
    return {
      name: 'Cyber Crime Forensic',
      accentPrimary: '#F43F5E',
      accentSecondary: '#FB7185',
      badgeBg: 'rgba(244, 63, 94, 0.12)',
      badgeBorder: '#F43F5E',
      badgeText: '#FECDD3',
      headerTag: 'CRITICAL THREAT DOSSIER',
      ctaText: 'READ EMERGENCY PROTOCOL',
      ctaBg: '#E11D48',
      ctaTextColor: '#FFFFFF',
      icon: '🚨'
    };
  }

  // Tinder & ELO / Shadowban
  if (text.includes('tinder') || text.includes('shadowban') || text.includes('elo')) {
    return {
      name: 'Tinder Forensics',
      accentPrimary: '#FD3A73',
      accentSecondary: '#F472B6',
      badgeBg: 'rgba(253, 58, 115, 0.12)',
      badgeBorder: '#FD3A73',
      badgeText: '#FFE4E6',
      headerTag: 'TINDER ALGORITHM AUDIT',
      ctaText: 'CHECK ACCOUNT HEALTH',
      ctaBg: '#FD3A73',
      ctaTextColor: '#FFFFFF',
      icon: '🔥'
    };
  }

  // Bumble & Activity Telemetry
  if (text.includes('bumble')) {
    return {
      name: 'Bumble Telemetry',
      accentPrimary: '#FBBF24',
      accentSecondary: '#FDE68A',
      badgeBg: 'rgba(251, 191, 36, 0.12)',
      badgeBorder: '#F59E0B',
      badgeText: '#FEF3C7',
      headerTag: 'BUMBLE TELEMETRY REPORT',
      ctaText: 'UNMASK ACTIVITY STATUS',
      ctaBg: '#F59E0B',
      ctaTextColor: '#0F172A',
      icon: '⚡'
    };
  }

  // Hinge & AI Deepfakes / Prompts
  if (text.includes('hinge') || text.includes('deepfake') || text.includes('catfish')) {
    return {
      name: 'Hinge & AI Forensics',
      accentPrimary: '#A855F7',
      accentSecondary: '#C084FC',
      badgeBg: 'rgba(168, 85, 247, 0.12)',
      badgeBorder: '#9333EA',
      badgeText: '#F3E8FF',
      headerTag: 'AI CATFISHING AUDIT',
      ctaText: 'EXAMINE DEEPFAKE PROOF',
      ctaBg: '#9333EA',
      ctaTextColor: '#FFFFFF',
      icon: '👁️'
    };
  }

  // Psychology / Attachment / Advice
  return {
    name: 'Behavioral Intelligence',
    accentPrimary: '#06B6D4',
    accentSecondary: '#38BDF8',
    badgeBg: 'rgba(6, 182, 212, 0.12)',
    badgeBorder: '#0891B2',
    badgeText: '#CFFAFE',
    headerTag: 'BEHAVIORAL INTELLIGENCE',
    ctaText: 'EXAMINE EVIDENCE DOSSIER',
    ctaBg: '#0891B2',
    ctaTextColor: '#FFFFFF',
    icon: '🔍'
  };
}

class PinterestQueueManager {
  constructor() {
    this.queue = [];
    this.loadQueue();
  }

  loadQueue() {
    if (fs.existsSync(CONFIG.queueFile)) {
      try {
        this.queue = JSON.parse(fs.readFileSync(CONFIG.queueFile, 'utf8'));
      } catch (e) {
        log(`Warning: Failed to parse queue file, reinitializing.`);
        this.queue = [];
      }
    }
  }

  saveQueue() {
    fs.writeFileSync(CONFIG.queueFile, JSON.stringify(this.queue, null, 2), 'utf8');
  }

  scanAndSync() {
    const files = fs.readdirSync(CONFIG.postsDir).filter(f => f.endsWith('.md'));
    log(`Scanning ${files.length} markdown posts in ${CONFIG.postsDir}...`);

    let state = { published: {} };
    if (fs.existsSync(CONFIG.stateFile)) {
      try {
        state = JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));
      } catch (e) {}
    }

    let addedCount = 0;
    for (const f of files) {
      const slug = f.replace(/\.md$/, '');
      const fullPath = path.join(CONFIG.postsDir, f);
      const raw = fs.readFileSync(fullPath, 'utf8');

      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) continue;

      const fm = match[1];
      const title = (fm.match(/title:\s*"([^"]+)"/) || [])[1] || slug;
      const desc = (fm.match(/description:\s*"([^"]+)"/) || [])[1] || '';
      const cover = (fm.match(/coverImage:\s*"([^"]+)"/) || [])[1] || '';
      const category = (fm.match(/category:\s*"([^"]+)"/) || [])[1] || 'safety-dossier';
      const caseId = (fm.match(/caseId:\s*"([^"]+)"/) || [])[1] || 'FC-2026-INTEL';

      const creativePath = path.join(CONFIG.pinsOutputDir, `pin_${slug}.png`);
      const isAlreadyPublished = !!(state.published && state.published[slug]);
      const creativeExists = fs.existsSync(creativePath);

      let existing = this.queue.find(item => item.slug === slug);
      if (!existing) {
        existing = {
          slug,
          title,
          description: desc,
          category,
          caseId,
          coverImage: cover,
          targetUrl: `${CONFIG.domain}/${slug}/`,
          status: isAlreadyPublished ? 'published' : (creativeExists ? 'ready' : 'pending'),
          creativePath,
          createdAt: new Date().toISOString(),
          publishedAt: isAlreadyPublished ? (state.published[slug].publishedAt || new Date().toISOString()) : null,
          attempts: 0
        };
        this.queue.push(existing);
        addedCount++;
      } else {
        existing.title = title;
        existing.description = desc;
        existing.coverImage = cover;
        existing.caseId = caseId;
        existing.targetUrl = `${CONFIG.domain}/${slug}/`;
        existing.creativePath = creativePath;
        if (isAlreadyPublished) {
          existing.status = 'published';
          if (!existing.publishedAt) {
            existing.publishedAt = state.published[slug].publishedAt || new Date().toISOString();
          }
        } else if (existing.status !== 'published') {
          existing.status = creativeExists ? 'ready' : 'pending';
        }
      }
    }

    this.saveQueue();
    log(`Sync complete. Total in queue: ${this.queue.length} (New added: ${addedCount})`);
  }

  async renderPinCreative(item) {
    const width = 1000;
    const height = 1500;
    const theme = resolveEditorialTheme(item.title, item.slug, item.category);

    const postPath = path.join(CONFIG.postsDir, `${item.slug}.md`);
    let rawPost = '';
    if (fs.existsSync(postPath)) {
      rawPost = fs.readFileSync(postPath, 'utf8');
    }

    const bullets = extractKeyTakeaways(rawPost, item.title);
    const caseId = item.caseId || 'FC-2026-INTEL';

    // Load cover image
    let coverBuffer = null;
    if (item.coverImage) {
      const cleanPath = item.coverImage.replace(/^\/+/, '');
      const fullCoverPath = path.resolve(__dirname, '../blog/public', cleanPath);
      if (fs.existsSync(fullCoverPath)) {
        try {
          coverBuffer = await sharp(fullCoverPath)
            .resize(920, 580, { fit: 'cover', position: 'attention' })
            .png()
            .toBuffer();
        } catch (e) {}
      }
    }

    // High impact headline (max 3 lines, large Georgia serif)
    const titleLines = wrapHeadline(item.title, 23);
    const fontSize = titleLines.length >= 3 ? 42 : 46;
    const lineHeight = titleLines.length >= 3 ? 54 : 58;

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Glass Panel Gradient -->
        <linearGradient id="glassPanel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#131924" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#0B0F17" stop-opacity="0.98" />
        </linearGradient>

        <!-- Vignette Shadow for Cover Image -->
        <linearGradient id="coverVignette" x1="0%" y1="65%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0C1017" stop-opacity="0" />
          <stop offset="100%" stop-color="#080B11" stop-opacity="1" />
        </linearGradient>
      </defs>

      <!-- Top Accent Line -->
      <rect x="0" y="0" width="${width}" height="8" fill="${theme.accentPrimary}" />

      <!-- Top Dossier Registry Bar -->
      <rect x="40" y="30" width="920" height="46" rx="8" fill="#111622" stroke="#1E2738" stroke-width="1.5" />
      <circle cx="65" cy="53" r="6" fill="${theme.accentPrimary}" />
      
      <text x="85" y="58" font-family="'Courier New', Courier, monospace, 'SF Mono', Consolas" font-size="13" font-weight="bold" fill="${theme.accentSecondary}" letter-spacing="1.5">
        ${escapeXml(theme.headerTag)} // ${escapeXml(caseId)}
      </text>

      <text x="935" y="58" font-family="'Courier New', Courier, monospace, 'SF Mono', Consolas" font-size="13" font-weight="bold" fill="#64748B" text-anchor="end" letter-spacing="1.5">
        CHELTENHAM DESK // UK
      </text>

      <!-- Outer Frame for Cover Image -->
      <rect x="38" y="94" width="924" height="584" rx="14" fill="none" stroke="#1E2738" stroke-width="2" />

      <!-- Corner Reticles for Technical Precision -->
      <path d="M 32 88 L 52 88 M 32 88 L 32 108" stroke="${theme.accentPrimary}" stroke-width="2.5" fill="none" />
      <path d="M 968 88 L 948 88 M 968 88 L 968 108" stroke="${theme.accentPrimary}" stroke-width="2.5" fill="none" />
      <path d="M 32 684 L 52 684 M 32 684 L 32 664" stroke="${theme.accentPrimary}" stroke-width="2.5" fill="none" />
      <path d="M 968 684 L 948 684 M 968 684 L 968 664" stroke="${theme.accentPrimary}" stroke-width="2.5" fill="none" />

      <!-- Image Vignette Overlay -->
      <rect x="40" y="510" width="920" height="170" fill="url(#coverVignette)" />

      <!-- Photo Stamp Badge -->
      <rect x="58" y="622" width="310" height="38" rx="6" fill="rgba(8, 11, 17, 0.88)" stroke="#1E2738" stroke-width="1.2" />
      <text x="75" y="646" font-family="'Courier New', Courier, monospace" font-size="12" font-weight="bold" fill="#94A3B8" letter-spacing="1">
        FORENSIC EVIDENCE REGISTRY
      </text>

      <!-- Main Editorial Headline (Georgia Serif, High Contrast) -->
      ${titleLines.map((line, i) => `
        <text x="500" y="${738 + i * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.3">
          ${escapeXml(line)}
        </text>
      `).join('')}

      <!-- Thin Divider -->
      <line x1="80" y1="${738 + titleLines.length * lineHeight + 8}" x2="920" y2="${738 + titleLines.length * lineHeight + 8}" stroke="#1E2738" stroke-width="1.5" />

      <!-- Key Takeaways & Evidence Panel -->
      <rect x="40" y="${738 + titleLines.length * lineHeight + 22}" width="920" height="310" rx="14" fill="url(#glassPanel)" stroke="#1E2738" stroke-width="1.8" />

      <!-- Evidence Header Badge -->
      <rect x="68" y="${738 + titleLines.length * lineHeight + 40}" width="260" height="28" rx="4" fill="${theme.badgeBg}" stroke="${theme.badgeBorder}" stroke-width="1" />
      <text x="82" y="${738 + titleLines.length * lineHeight + 59}" font-family="'Courier New', Courier, monospace" font-size="11" font-weight="bold" fill="${theme.badgeText}" letter-spacing="1">
        DECLASSIFIED CASE FINDINGS
      </text>

      <!-- Bullets with Prefix + Body -->
      ${bullets.map((b, idx) => {
        const yBase = 738 + titleLines.length * lineHeight + 104 + idx * 68;
        return `
          <g>
            <circle cx="85" cy="${yBase - 8}" r="15" fill="#0A0E17" stroke="${theme.accentPrimary}" stroke-width="1.8" />
            <text x="85" y="${yBase - 2}" font-family="sans-serif" font-size="13" font-weight="bold" fill="${theme.accentPrimary}" text-anchor="middle">✓</text>
            
            <text x="115" y="${yBase - 12}" font-family="'Courier New', Courier, monospace, 'SF Mono', Consolas" font-size="14" font-weight="bold" fill="${theme.accentSecondary}" letter-spacing="0.5">
              [${escapeXml(b.prefix).toUpperCase()}]
            </text>

            <text x="115" y="${yBase + 10}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="500" fill="#E2E8F0">
              ${escapeXml(b.body)}
            </text>
          </g>
        `;
      }).join('')}

      <!-- Bottom CRO Action Bar -->
      <rect x="40" y="1334" width="920" height="122" rx="16" fill="#0F141F" stroke="#1E2738" stroke-width="2" />

      <!-- FlirtCheck Badge -->
      <circle cx="95" cy="1395" r="26" fill="#141C2B" stroke="#253247" stroke-width="1.5" />
      <text x="95" y="1403" font-family="sans-serif" font-size="22" text-anchor="middle">🛡️</text>

      <text x="138" y="1385" font-family="'Courier New', Courier, monospace, 'SF Mono', Consolas" font-size="17" font-weight="bold" fill="#F8FAFC" letter-spacing="1">
        FLIRTCHECK.SITE // FORENSIC LAB
      </text>
      <text x="138" y="1412" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">
        Independent Dating Safety &amp; Telemetry Audits • Cheltenham, UK
      </text>

      <!-- High-Impact Interactive CTA Button -->
      <rect x="630" y="1360" width="310" height="70" rx="35" fill="${theme.ctaBg}" />
      <text x="785" y="1403" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="${theme.ctaTextColor}" text-anchor="middle" letter-spacing="0.8">
        ${escapeXml(theme.ctaText)} ➔
      </text>
    </svg>`;

    const composites = [];
    if (coverBuffer) {
      composites.push({
        input: coverBuffer,
        top: 96,
        left: 40
      });
    }
    composites.push({
      input: Buffer.from(svg),
      top: 0,
      left: 0
    });

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: '#080B11'
      }
    })
    .composite(composites)
    .png({ quality: 95 })
    .toFile(item.creativePath);

    item.status = 'ready';
    this.saveQueue();
    log(`Rendered high-converting editorial pin: ${path.basename(item.creativePath)}`);
  }

  async buildAllCreatives() {
    log('Building 1000x1500 px editorial creatives for all items in queue...');
    let count = 0;
    for (const item of this.queue) {
      try {
        await this.renderPinCreative(item);
        count++;
      } catch (err) {
        log(`Error rendering ${item.slug}: ${err.message}`);
      }
    }
    log(`✅ All ${count} creatives built successfully in ${CONFIG.pinsOutputDir}`);
  }

  generatePinDescription(item) {
    const postPath = path.join(CONFIG.postsDir, `${item.slug}.md`);
    let rawPost = '';
    if (fs.existsSync(postPath)) {
      rawPost = fs.readFileSync(postPath, 'utf8');
    }
    const bullets = extractKeyTakeaways(rawPost, item.title);

    let desc = `🚨 [DECLASSIFIED DOSSIER] ${item.title}\n\n`;
    desc += `${item.description}\n\n`;
    desc += `🔍 Key Evidence Findings:\n`;
    bullets.forEach(b => {
      desc += `• ${b.prefix}: ${b.body}\n`;
    });
    desc += `\nRead the full verified forensic investigation and test your matches at FlirtCheck.site:\n${item.targetUrl}\n\n`;
    desc += `#DatingSafety #ProfileVerification #CatfishDetection #OnlineDatingTips #TinderAdvice #BumbleTips #HingeVerification #ForensicEvidence #FlirtCheck`;
    
    return desc.substring(0, 495);
  }

  async publishItem(item) {
    if (!fs.existsSync(CONFIG.cookiesFile)) {
      throw new Error(`Cookies file not found: ${CONFIG.cookiesFile}`);
    }

    if (!fs.existsSync(item.creativePath)) {
      log(`Creative missing for ${item.slug}, generating first...`);
      await this.renderPinCreative(item);
    }

    log(`🚀 Initiating Pinterest publication for: "${item.title}"`);
    const cookies = JSON.parse(fs.readFileSync(CONFIG.cookiesFile, 'utf8'));

    const browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 950 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });

    await context.addCookies(cookies);
    const page = await context.newPage();

    try {
      await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4000);

      // Dismiss any tour modals / overlays
      for (let i = 0; i < 2; i++) {
        const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
        if (tourBtn) {
          await tourBtn.click().catch(() => {});
          await page.waitForTimeout(800);
        }
        await page.keyboard.press('Escape');
      }

      // 1. Upload File
      log('Uploading pin image...');
      await page.setInputFiles('input[type="file"]', item.creativePath);
      await page.waitForTimeout(3000);

      // 2. Title
      log('Filling Title...');
      const titleInput = page.locator('input[id*="storyboard-selector-title"], textarea[placeholder*="Title"], input[placeholder*="заголовок"], textarea[placeholder*="заголовок"], textarea[placeholder*="название"]').first();
      await titleInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type(item.title.substring(0, 99));
      await page.waitForTimeout(1000);

      // 3. High-Converting Description
      log('Filling High-Converting Pinterest SEO Description...');
      const descArea = page.locator('div[contenteditable="true"], [aria-label="Добавьте описание пина"], textarea[id*="description"], [placeholder*="описание"]').first();
      if (await descArea.isVisible()) {
        await descArea.click();
        await page.keyboard.press('Control+A');
        const descText = this.generatePinDescription(item);
        await page.keyboard.type(descText);
        await page.waitForTimeout(1000);
      }

      // 4. Board Selection & Publish
      log(`Ensuring board "${CONFIG.boardName}" is selected...`);
      const boardButton = await page.$('[data-test-id="board-dropdown-select-button"]');
      const boardText = boardButton ? await boardButton.innerText() : '';
      
      if (!boardText.includes(CONFIG.boardName)) {
        if (boardButton) {
          await boardButton.click();
          await page.waitForTimeout(1500);
          const boardRow = await page.$(`[data-test-id="board-row"]:has-text("${CONFIG.boardName}")`);
          if (boardRow) {
            await boardRow.click();
            await page.waitForTimeout(1000);
          }
        }
      }

      log('🚀 Clicking Publish button...');
      const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать"), button:has-text("Сохранить")');
      if (!publishBtn) throw new Error('Publish button not found');
      await publishBtn.click({ force: true });

      // 5. Wait for success modal confirmation (up to 25 seconds)
      log('⏳ Waiting for Pinterest to process and confirm pin creation...');
      let confirmed = false;
      for (let i = 1; i <= 8; i++) {
        await page.waitForTimeout(3000);
        const modal = await page.$('text="Вы создали пин", [aria-label="Вы создали пин"], button:has-text("Открыть пин")');
        if (modal) {
          log(`🎉 Pinterest confirmed pin creation at ${i * 3}s!`);
          confirmed = true;
          break;
        }
      }

      if (!confirmed) {
        log('⚠️ Warning: Confirmation modal not seen within 24s, checking background update...');
      }

      item.status = 'published';
      item.publishedAt = new Date().toISOString();
      item.attempts += 1;
      this.saveQueue();

      // Sync stateFile (.antigravity/pinterest_state.json)
      try {
        const state = fs.existsSync(CONFIG.stateFile)
          ? JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'))
          : { published: {}, lastRunAt: null, dailyCount: 0, lastDailyReset: new Date().toDateString() };
        state.published = state.published || {};
        state.published[item.slug] = {
          publishedAt: item.publishedAt,
          title: item.title,
          pinUrl: 'published',
          board: CONFIG.boardName,
          directArticleUrl: item.targetUrl,
          destinationLink: item.targetUrl
        };
        state.lastRunAt = item.publishedAt;
        state.dailyCount = (state.dailyCount || 0) + 1;
        fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2), 'utf8');
      } catch (e) {
        log(`Warning: Failed to update stateFile: ${e.message}`);
      }

      // Refresh cookies file
      try {
        const newCookies = await context.cookies();
        fs.writeFileSync(CONFIG.cookiesFile, JSON.stringify(newCookies, null, 2), 'utf8');
      } catch (e) {}

      log(`✅ Successfully published pin for: ${item.slug}`);

    } catch (err) {
      item.attempts += 1;
      item.status = 'failed';
      item.lastError = err.message;
      this.saveQueue();
      throw err;
    } finally {
      await browser.close();
    }
  }

  async publishNext() {
    const nextItem = this.queue.find(item => item.status === 'ready' || item.status === 'pending');
    if (!nextItem) {
      log('No pending or ready items in queue! All pins published.');
      return null;
    }
    await this.publishItem(nextItem);
    return nextItem;
  }

  printStatus() {
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║   PINTEREST QUEUE STATUS // FLIRTCHECK TRAFFIC AUTOMATION            ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

    const total = this.queue.length;
    const published = this.queue.filter(i => i.status === 'published').length;
    const ready = this.queue.filter(i => i.status === 'ready').length;
    const pending = this.queue.filter(i => i.status === 'pending').length;
    const failed = this.queue.filter(i => i.status === 'failed').length;

    console.log(`📊 Total Articles in Queue: ${total}`);
    console.log(`   • Published:  ${published}`);
    console.log(`   • Ready:      ${ready}`);
    console.log(`   • Pending:    ${pending}`);
    console.log(`   • Failed:     ${failed}\n`);

    console.log('Upcoming in Queue:');
    this.queue
      .filter(i => i.status !== 'published')
      .slice(0, 10)
      .forEach((item, idx) => {
        console.log(`  [${idx + 1}] [${item.status.toUpperCase()}] ${item.title.substring(0, 55)}... -> ${item.slug}`);
      });
  }
}

async function main() {
  const manager = new PinterestQueueManager();
  manager.scanAndSync();

  const args = process.argv.slice(2);
  if (args.includes('--status')) {
    manager.printStatus();
    return;
  }

  if (args.includes('--build-all')) {
    await manager.buildAllCreatives();
    manager.printStatus();
    return;
  }

  if (args.includes('--publish-next')) {
    await manager.publishNext();
    manager.printStatus();
    return;
  }

  const slugIdx = args.indexOf('--slug');
  if (slugIdx !== -1 && args[slugIdx + 1]) {
    const targetSlug = args[slugIdx + 1];
    const item = manager.queue.find(i => i.slug === targetSlug);
    if (!item) {
      log(`Slug "${targetSlug}" not found in queue!`);
      return;
    }
    await manager.publishItem(item);
    manager.printStatus();
    return;
  }

  // Default: show status
  manager.printStatus();
}

main().catch(err => {
  log(`Fatal Error: ${err.message}`);
  process.exit(1);
});

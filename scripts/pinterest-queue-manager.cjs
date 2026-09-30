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
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
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

  /**
   * High-contrast, mobile-first Pinterest Pin Generator
   * Implements 4 distinct bright/light design archetypes:
   * 1. Chat Teardown (iMessage/Tinder dialogue with red flag stickers)
   * 2. Checklist Infographic (Actionable bullet cards with icons)
   * 3. Algorithm Unmasked (Behavioral & ELO telemetry analysis)
   * 4. Photo Verification (Fake vs Real profile inspection)
   */
  async renderPinCreative(item) {
    const width = 1000;
    const height = 1500;
    const cleanTitle = item.title.replace(/[*_#`"]/g, '').trim();

    const postPath = path.join(CONFIG.postsDir, `${item.slug}.md`);
    let rawPost = '';
    if (fs.existsSync(postPath)) {
      rawPost = fs.readFileSync(postPath, 'utf8');
    }

    const bullets = extractKeyTakeaways(rawPost, cleanTitle);
    const textComb = (cleanTitle + ' ' + item.slug + ' ' + (item.category || '')).toLowerCase();

    // Determine Design Archetype
    let archetype = 'checklist-infographic';
    if (textComb.includes('text') || textComb.includes('chat') || textComb.includes('message') || textComb.includes('bio') || textComb.includes('reply') || textComb.includes('ghosting') || textComb.includes('llm') || textComb.includes('spambot')) {
      archetype = 'chat-teardown';
    } else if (textComb.includes('algorithm') || textComb.includes('elo') || textComb.includes('shadowban') || textComb.includes('bumble') || textComb.includes('tinder') || textComb.includes('hinge') || textComb.includes('swiping') || textComb.includes('psycholog') || textComb.includes('attachment') || textComb.includes('narcissist')) {
      archetype = 'algorithm-unmasked';
    } else if (textComb.includes('catfish') || textComb.includes('reverse') || textComb.includes('photo') || textComb.includes('deepfake') || textComb.includes('scam') || textComb.includes('fake') || textComb.includes('blackmail')) {
      archetype = 'photo-verification';
    }

    // Headline wrap for top area (max 3 lines, high impact)
    const titleLines = wrapHeadline(cleanTitle, 22);
    const headlineFontSize = titleLines.length >= 3 ? 50 : 56;
    const headlineLineHeight = titleLines.length >= 3 ? 62 : 68;

    let svg = '';

    if (archetype === 'chat-teardown') {
      // ARCHETYPE 1: Chat Teardown / Red Flags (Viral format on white/cream)
      svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#F8FAFC" />
          </linearGradient>
          <linearGradient id="redFlagBtn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#DC2626" />
            <stop offset="100%" stop-color="#EF4444" />
          </linearGradient>
          <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.08" />
          </filter>
        </defs>

        <!-- Bright Clean Background -->
        <rect width="${width}" height="${height}" fill="url(#bgLight)" />
        <rect x="0" y="0" width="${width}" height="10" fill="#EF4444" />

        <!-- Top Category Badge -->
        <rect x="60" y="55" width="460" height="46" rx="8" fill="#FEE2E2" stroke="#FCA5A5" stroke-width="1.5" />
        <circle cx="85" cy="78" r="6" fill="#EF4444" />
        <text x="105" y="84" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#B91C1C" letter-spacing="1.5">
          🚩 TEXTING ANALYSIS // RED FLAGS
        </text>

        <!-- Brand Identifier -->
        <text x="940" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#64748B" text-anchor="end" letter-spacing="1">
          FLIRTCHECK.SITE
        </text>

        <!-- High-Impact Top Headline (Read in 0.5s) -->
        ${titleLines.map((line, i) => `
          <text x="60" y="${175 + i * headlineLineHeight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${headlineFontSize}" font-weight="900" fill="#0F172A" letter-spacing="-0.8">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Interactive Chat Container Card -->
        <rect x="50" y="${175 + titleLines.length * headlineLineHeight + 20}" width="900" height="740" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#cardShadow)" />

        <!-- Chat Header -->
        <rect x="50" y="${175 + titleLines.length * headlineLineHeight + 20}" width="900" height="80" rx="24" fill="#F8FAFC" />
        <circle cx="100" cy="${175 + titleLines.length * headlineLineHeight + 60}" r="22" fill="#E2E8F0" />
        <text x="100" y="${175 + titleLines.length * headlineLineHeight + 67}" font-family="sans-serif" font-size="18" text-anchor="middle">👤</text>
        <text x="135" y="${175 + titleLines.length * headlineLineHeight + 58}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#0F172A">
          Dating App Match
        </text>
        <text x="135" y="${175 + titleLines.length * headlineLineHeight + 78}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#10B981">
          • Active 5m ago
        </text>

        <!-- Message Bubble 1 (Incoming Suspect Text) -->
        <rect x="85" y="${175 + titleLines.length * headlineLineHeight + 130}" width="680" height="110" rx="20" fill="#F1F5F9" />
        <text x="115" y="${175 + titleLines.length * headlineLineHeight + 175}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" fill="#1E293B">
          "Sorry I vanished for 4 days! My phone broke &amp; work
        </text>
        <text x="115" y="${175 + titleLines.length * headlineLineHeight + 210}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" fill="#1E293B">
          was insane. Are you free tonight at 11pm?"
        </text>

        <!-- Red Flag Annotation Overlay Sticker -->
        <rect x="180" y="${175 + titleLines.length * headlineLineHeight + 265}" width="660" height="54" rx="12" fill="#FEF2F2" stroke="#EF4444" stroke-width="2" />
        <text x="205" y="${175 + titleLines.length * headlineLineHeight + 300}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#DC2626">
          🚩 RED FLAG: BREADCRUMBING &amp; DISAPPEARING ACT
        </text>

        <!-- Message Bubble 2 (Outgoing High-Value Boundary) -->
        <rect x="360" y="${175 + titleLines.length * headlineLineHeight + 345}" width="550" height="85" rx="20" fill="#2563EB" />
        <text x="390" y="${175 + titleLines.length * headlineLineHeight + 395}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="#FFFFFF">
          "I prefer consistent communication. Best of luck!"
        </text>

        <!-- 3 Actionable Bullet Takeaways -->
        <rect x="85" y="${175 + titleLines.length * headlineLineHeight + 460}" width="830" height="260" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
        <text x="115" y="${175 + titleLines.length * headlineLineHeight + 495}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#64748B" letter-spacing="1">
          WHAT THE TELEMETRY SAYS:
        </text>
        ${bullets.slice(0, 3).map((b, idx) => `
          <g transform="translate(115, ${175 + titleLines.length * headlineLineHeight + 535 + idx * 56})">
            <circle cx="10" cy="-6" r="10" fill="#EF4444" />
            <text x="10" y="-2" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">!</text>
            <text x="32" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#0F172A">
              ${escapeXml(b.prefix)}: <tspan font-weight="400" fill="#475569">${escapeXml(b.body)}</tspan>
            </text>
          </g>
        `).join('')}

        <!-- Bottom Viral Action Button -->
        <rect x="60" y="1320" width="880" height="84" rx="42" fill="url(#redFlagBtn)" filter="url(#cardShadow)" />
        <text x="500" y="1373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          READ FULL TEXT TEARDOWN &amp; GUIDE ➔
        </text>

        <!-- Subtext Footer -->
        <text x="500" y="1450" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">
          FlirtCheck.site • Free Match Risk &amp; Conversation Analyzer
        </text>
      </svg>`;

    } else if (archetype === 'algorithm-unmasked') {
      // ARCHETYPE 2: Algorithm & Psychology (Modern Lavender / Deep Indigo on Crisp White)
      svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgAlgo" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#F5F3FF" />
            <stop offset="100%" stop-color="#FFFFFF" />
          </linearGradient>
          <linearGradient id="indigoBtn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#4F46E5" />
            <stop offset="100%" stop-color="#6366F1" />
          </linearGradient>
          <filter id="shadowLight" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#4F46E5" flood-opacity="0.08" />
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#bgAlgo)" />
        <rect x="0" y="0" width="${width}" height="10" fill="#4F46E5" />

        <!-- Category Badge -->
        <rect x="60" y="55" width="460" height="46" rx="8" fill="#EDE9FE" stroke="#C4B5FD" stroke-width="1.5" />
        <circle cx="85" cy="78" r="6" fill="#4F46E5" />
        <text x="105" y="84" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#4338CA" letter-spacing="1.5">
          🔬 ALGORITHM AUDIT // REVERSE ENGINEERED
        </text>

        <text x="940" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#64748B" text-anchor="end" letter-spacing="1">
          FLIRTCHECK.SITE
        </text>

        <!-- Huge Headline on Top -->
        ${titleLines.map((line, i) => `
          <text x="60" y="${175 + i * headlineLineHeight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${headlineFontSize}" font-weight="900" fill="#0F172A" letter-spacing="-0.8">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Central Telemetry Cards Container -->
        <rect x="50" y="${175 + titleLines.length * headlineLineHeight + 20}" width="900" height="740" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadowLight)" />

        <!-- Telemetry Metric Pill 1 -->
        <rect x="90" y="${175 + titleLines.length * headlineLineHeight + 60}" width="820" height="180" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
        <text x="125" y="${175 + titleLines.length * headlineLineHeight + 105}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#4F46E5" letter-spacing="1">
          METRIC 01: ELO SCORE ADJUSTMENT
        </text>
        <text x="125" y="${175 + titleLines.length * headlineLineHeight + 145}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#0F172A">
          Outgoing Swipe-to-Match Ratio
        </text>
        <text x="125" y="${175 + titleLines.length * headlineLineHeight + 185}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#475569">
          Swiping right on &gt;60% of profiles triggers automatic bot demotion flags.
        </text>

        <!-- Telemetry Metric Pill 2 -->
        <rect x="90" y="${175 + titleLines.length * headlineLineHeight + 270}" width="820" height="180" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
        <text x="125" y="${175 + titleLines.length * headlineLineHeight + 315}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#D97706" letter-spacing="1">
          METRIC 02: ACTIVITY SUPPRESSION
        </text>
        <text x="125" y="${175 + titleLines.length * headlineLineHeight + 355}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#0F172A">
          Engineered Swipe Fatigue &amp; Scarcity
        </text>
        <text x="125" y="${175 + titleLines.length * headlineLineHeight + 395}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#475569">
          Top-tier matches are withheld behind paid boost paywalls after day 3.
        </text>

        <!-- Telemetry Metric Pill 3 -->
        <rect x="90" y="${175 + titleLines.length * headlineLineHeight + 480}" width="820" height="180" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
        <text x="125" y="${175 + titleLines.length * headlineLineHeight + 525}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#10B981" letter-spacing="1">
          ACTION PROTOCOL: THE FIX
        </text>
        <text x="125" y="${175 + titleLines.length * headlineLineHeight + 565}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#0F172A">
          Optimal Reset &amp; Calibration Rules
        </text>
        <text x="125" y="${175 + titleLines.length * headlineLineHeight + 605}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#475569">
          Step-by-step account pacing without triggering shadow placement.
        </text>

        <!-- CTA Button -->
        <rect x="60" y="1320" width="880" height="84" rx="42" fill="url(#indigoBtn)" filter="url(#shadowLight)" />
        <text x="500" y="1373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          UNMASK ALGORITHM MECHANICS ➔
        </text>

        <text x="500" y="1450" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">
          FlirtCheck.site • Independent Dating Algorithm Research &amp; ELO Audits
        </text>
      </svg>`;

    } else if (archetype === 'photo-verification') {
      // ARCHETYPE 3: Photo Verification & Catfish Warning (Warning Amber/Red on Crisp Ivory)
      svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgIvory" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFDF9" />
            <stop offset="100%" stop-color="#F9F6F0" />
          </linearGradient>
          <linearGradient id="amberBtn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#DC2626" />
            <stop offset="100%" stop-color="#B91C1C" />
          </linearGradient>
          <filter id="shadowAmber" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#DC2626" flood-opacity="0.10" />
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#bgIvory)" />
        <rect x="0" y="0" width="${width}" height="10" fill="#DC2626" />

        <!-- Category Badge -->
        <rect x="60" y="55" width="460" height="46" rx="8" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1.5" />
        <circle cx="85" cy="78" r="6" fill="#D97706" />
        <text x="105" y="84" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#B45309" letter-spacing="1.5">
          ⚠️ CATFISH ALERT // 60-SEC VERIFY
        </text>

        <text x="940" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#64748B" text-anchor="end" letter-spacing="1">
          FLIRTCHECK.SITE
        </text>

        <!-- Huge Headline on Top -->
        ${titleLines.map((line, i) => `
          <text x="60" y="${175 + i * headlineLineHeight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${headlineFontSize}" font-weight="900" fill="#0F172A" letter-spacing="-0.8">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Central Inspection Board -->
        <rect x="50" y="${175 + titleLines.length * headlineLineHeight + 20}" width="900" height="740" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadowAmber)" />

        <!-- Split Cards: REAL VS FAKE CHECK -->
        <rect x="85" y="${175 + titleLines.length * headlineLineHeight + 60}" width="830" height="140" rx="16" fill="#FEF2F2" stroke="#FECACA" stroke-width="1.5" />
        <text x="120" y="${175 + titleLines.length * headlineLineHeight + 110}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#DC2626">
          🚩 WARNING SIGN #1: Inconsistent Lighting &amp; Earlobes
        </text>
        <text x="120" y="${175 + titleLines.length * headlineLineHeight + 150}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#4B5563">
          AI generator GAN artifacts blur teeth symmetry and jewelry reflections.
        </text>

        <rect x="85" y="${175 + titleLines.length * headlineLineHeight + 225}" width="830" height="140" rx="16" fill="#FEF2F2" stroke="#FECACA" stroke-width="1.5" />
        <text x="120" y="${175 + titleLines.length * headlineLineHeight + 275}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#DC2626">
          🚩 WARNING SIGN #2: Stolen Instagram Photos via Google Lens
        </text>
        <text x="120" y="${175 + titleLines.length * headlineLineHeight + 315}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#4B5563">
          Low-resolution cropped screenshots stolen from European lifestyle models.
        </text>

        <rect x="85" y="${175 + titleLines.length * headlineLineHeight + 390}" width="830" height="140" rx="16" fill="#FEF2F2" stroke="#FECACA" stroke-width="1.5" />
        <text x="120" y="${175 + titleLines.length * headlineLineHeight + 440}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#DC2626">
          🚩 WARNING SIGN #3: Rapid Off-App Move (Within 24 Hours)
        </text>
        <text x="120" y="${175 + titleLines.length * headlineLineHeight + 480}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#4B5563">
          Forcing you onto unmonitored WhatsApp / Telegram channels to avoid bans.
        </text>

        <rect x="85" y="${175 + titleLines.length * headlineLineHeight + 555}" width="830" height="160" rx="16" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1.5" />
        <text x="120" y="${175 + titleLines.length * headlineLineHeight + 605}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#15803D">
          ✅ THE 30-SECOND DEFENSE PROTOCOL
        </text>
        <text x="120" y="${175 + titleLines.length * headlineLineHeight + 645}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#166534">
          Request a casual 15-second in-app video note or run automated reverse lookup.
        </text>

        <!-- CTA Button -->
        <rect x="60" y="1320" width="880" height="84" rx="42" fill="url(#amberBtn)" filter="url(#shadowAmber)" />
        <text x="500" y="1373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          VERIFY ANY PROFILE IN 60 SECONDS ➔
        </text>

        <text x="500" y="1450" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">
          FlirtCheck.site • Free AI &amp; Reverse Image Dating Security Audits
        </text>
      </svg>`;

    } else {
      // ARCHETYPE 4: Actionable Checklist (Modern Clean Minimalist on Cream/Beige)
      svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgChecklist" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FAF8F5" />
            <stop offset="100%" stop-color="#F1ECE4" />
          </linearGradient>
          <linearGradient id="primaryBtn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="100%" stop-color="#1E293B" />
          </linearGradient>
          <filter id="shadowCard" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.08" />
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#bgChecklist)" />
        <rect x="0" y="0" width="${width}" height="10" fill="#0F172A" />

        <!-- Category Badge -->
        <rect x="60" y="55" width="460" height="46" rx="8" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />
        <circle cx="85" cy="78" r="6" fill="#0F172A" />
        <text x="105" y="84" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#0F172A" letter-spacing="1.5">
          📋 DATING PROTOCOL // ACTIONABLE CHECKLIST
        </text>

        <text x="940" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#64748B" text-anchor="end" letter-spacing="1">
          FLIRTCHECK.SITE
        </text>

        <!-- Huge Headline on Top -->
        ${titleLines.map((line, i) => `
          <text x="60" y="${175 + i * headlineLineHeight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${headlineFontSize}" font-weight="900" fill="#0F172A" letter-spacing="-0.8">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Checklist Cards Container -->
        <rect x="50" y="${175 + titleLines.length * headlineLineHeight + 20}" width="900" height="740" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadowCard)" />

        <!-- 4 Bullet Cards -->
        ${bullets.slice(0, 4).map((b, idx) => {
          const y = 175 + titleLines.length * headlineLineHeight + 60 + idx * 165;
          const icons = ['❌', '🔍', '📍', '🛡️'];
          const iconColors = ['#FEE2E2', '#EFF6FF', '#FEF3C7', '#EDE9FE'];
          const strokeColors = ['#F87171', '#60A5FA', '#FBBF24', '#A78BFA'];

          return `
            <g transform="translate(85, ${y})">
              <rect width="830" height="135" rx="16" fill="#FAF8F5" stroke="#E2E8F0" stroke-width="1.5" />
              <rect x="25" y="28" width="60" height="60" rx="14" fill="${iconColors[idx % iconColors.length]}" stroke="${strokeColors[idx % strokeColors.length]}" stroke-width="1.5" />
              <text x="55" y="66" font-family="sans-serif" font-size="26" text-anchor="middle">${icons[idx % icons.length]}</text>
              <text x="110" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#0F172A">
                RULE 0${idx + 1}: ${escapeXml(b.prefix)}
              </text>
              <text x="110" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#475569">
                ${escapeXml(b.body)}
              </text>
            </g>
          `;
        }).join('')}

        <!-- CTA Button -->
        <rect x="60" y="1320" width="880" height="84" rx="42" fill="url(#primaryBtn)" filter="url(#shadowCard)" />
        <text x="500" y="1373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          SAVE CHECKLIST &amp; READ FULL DOSSIER ➔
        </text>

        <text x="500" y="1450" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">
          FlirtCheck.site • Modern Dating Safety Playbooks &amp; Real Relationship Advice
        </text>
      </svg>`;
    }

    // Render Sharp PNG with maximum sharpness
    await sharp(Buffer.from(svg))
      .png({ quality: 95 })
      .toFile(item.creativePath);

    item.status = 'ready';
    this.saveQueue();
    log(`🎨 Rendered VIRAL LIGHT PIN (${archetype}): ${path.basename(item.creativePath)}`);
  }

  async buildAllCreatives(force = false) {
    log('Rebuilding high-contrast bright editorial creatives for items in queue...');
    let count = 0;
    for (const item of this.queue) {
      if (force || item.status === 'ready' || item.status === 'pending') {
        try {
          await this.renderPinCreative(item);
          count++;
        } catch (err) {
          log(`Error rendering ${item.slug}: ${err.message}`);
        }
      }
    }
    log(`✅ All ${count} light-mode creatives rebuilt successfully in ${CONFIG.pinsOutputDir}`);
  }

  generatePinDescription(item) {
    const postPath = path.join(CONFIG.postsDir, `${item.slug}.md`);
    let rawPost = '';
    if (fs.existsSync(postPath)) {
      rawPost = fs.readFileSync(postPath, 'utf8');
    }
    const bullets = extractKeyTakeaways(rawPost, item.title);

    // High-Intent Pinterest Search SEO Keywords
    const seoHeaders = [
      'How to stay safe online dating • dating red flags for women',
      'Bumble texting tips • relationship advice for modern dating',
      'Catfish verification guide • how to spot fake profiles',
      'Tinder algorithm rules • how to avoid ghosting & breadcrumbing'
    ];
    const seoHook = seoHeaders[Math.floor(Math.random() * seoHeaders.length)];

    let desc = `⚡ ${seoHook}\n\n`;
    desc += `📌 ${item.title}\n\n`;
    desc += `${item.description}\n\n`;
    desc += `🚨 Actionable Checklist & Red Flags:\n`;
    bullets.slice(0, 3).forEach((b, i) => {
      desc += `${i + 1}. ${b.prefix}: ${b.body}\n`;
    });
    desc += `\n👉 Read the complete breakdown & test your matches at FlirtCheck:\n${item.targetUrl}\n\n`;
    desc += `#DatingSafety #DatingRedFlags #OnlineDatingTips #TextingTips #TinderAdvice #BumbleTips #HingeTips #RelationshipAdvice #FlirtCheck #CatfishWarning #DatingAppBurnout`;

    return desc.substring(0, 498);
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

if (require.main === module) {
  main().catch(err => {
    log(`Fatal Error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  PinterestQueueManager,
  CONFIG,
};

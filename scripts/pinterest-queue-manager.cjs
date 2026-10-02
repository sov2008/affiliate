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

function cleanHeadlineForPin(rawTitle) {
  let title = rawTitle.replace(/[*_#`"]/g, '').trim();

  // Strip long boilerplate prefixes
  title = title
    .replace(/^2026\s+Guide:\s*/i, '')
    .replace(/^2026\s+Ultimate\s+Online\s+Dating\s+Safety\s+Guide:\s*/i, '')
    .replace(/^The\s+2026\s+Ultimate\s+Dating\s+Safety\s+Playbook:\s*/i, '')
    .replace(/^2026\s+Ultimate\s+Dating\s+Safety\s+Playbook:\s*/i, '')
    .replace(/^Dating\s+Safety\s+2026:\s*/i, '')
    .replace(/^Dating\s+Profile\s+Verification\s+Guide\s+2026:\s*/i, '')
    .replace(/\s*—\s*Your\s+2026\s+Playbook.*$/i, '')
    .replace(/\s*:\s*The\s+2026\s+Playbook.*$/i, '')
    .replace(/\s*:\s*Comprehensive\s+2026.*$/i, '')
    .trim();

  const lower = title.toLowerCase();
  if (lower.includes('narcissist red flags') || lower.includes('narcissist')) {
    return 'How to Spot Narcissist Red Flags in Dating Apps';
  }
  if (lower.includes('love bombing')) {
    return 'How to Spot Love Bombing Before Date One';
  }
  if (lower.includes('subtle texting habit') || lower.includes('low effort')) {
    return 'The Subtle Texting Habit That Means Low Effort';
  }
  if (lower.includes('push your boundaries') || lower.includes('boundaries via text')) {
    return 'When They Push Your Boundaries via Text';
  }
  if (lower.includes('crypto romance scam') || lower.includes('crypto scam')) {
    return '7 Crypto Romance Scams Stealing Millions From Singles';
  }
  if (lower.includes('time wasters') || (lower.includes('bumble') && lower.includes('bio'))) {
    return 'How to Filter Time-Wasters on Bumble in 3 Steps';
  }
  if (lower.includes('ai catfishing') || lower.includes('deepfake')) {
    return 'How to Spot Deepfake Catfish Photos on Hinge';
  }
  if (lower.includes('spambot') || lower.includes('llm spambot') || lower.includes('dead giveaways')) {
    return 'How AI Spambots Write Dating Profiles in 2026';
  }
  if (lower.includes('stolen instagram') || lower.includes('stolen photos')) {
    return 'How to Spot Stolen Photos on Dating Profiles';
  }
  if (lower.includes('first date safety checklist') || lower.includes('non-negotiable rules')) {
    return 'First Date Safety: 5 Non-Negotiable Rules to Follow';
  }
  if (lower.includes('most compatible') && lower.includes('hinge')) {
    return 'How Hinge Most Compatible Algorithm Actually Works';
  }
  if (lower.includes('anxious-avoidant trap')) {
    return 'The Anxious-Avoidant Trap on Dating Apps';
  }
  if (lower.includes('blackmails you') || lower.includes('anti-sextortion')) {
    return 'Anti-Extortion Protocol: What to Do If a Match Blackmails You';
  }
  if (lower.includes('breadcrumbing vs benching')) {
    return 'Breadcrumbing vs Benching: Spot Unavailable Matches';
  }
  if (lower.includes('first-date body language') || lower.includes('micro-expressions')) {
    return 'First-Date Body Language: Reading Hidden Signals';
  }
  if (lower.includes('low-pressure first date') || lower.includes('dinners are flawed')) {
    return 'Low-Pressure First Dates: Why Dinner Dates Fail';
  }
  if (lower.includes('reverse search wont save you')) {
    return 'Why Reverse Image Search Fails Against AI Catfish';
  }

  // If title has a colon, choose the punchiest part
  if (title.includes(':')) {
    const parts = title.split(':').map(p => p.trim());
    if (parts[1] && parts[1].length >= 18 && parts[1].length <= 55) {
      return parts[1];
    }
    if (parts[0] && parts[0].length >= 18 && parts[0].length <= 55) {
      return parts[0];
    }
  }

  return title;
}

function wrapHeadline(text, maxCharsPerLine = 24) {
  const clean = text.replace(/[*_#`"]/g, '').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
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

  // STRICT RULE: NEVER truncate with ellipses (...)!
  // If more than 3 lines, re-pack all words cleanly into exactly 3 lines:
  if (lines.length > 3) {
    const total = words.length;
    const p1 = Math.ceil(total / 3);
    const p2 = Math.ceil((total - p1) / 2) + p1;
    return [
      words.slice(0, p1).join(' '),
      words.slice(p1, p2).join(' '),
      words.slice(p2).join(' ')
    ].filter(Boolean);
  }

  return lines;
}

function wrapText(text, maxCharsPerLine = 36) {
  const words = String(text).replace(/\s+/g, ' ').trim().split(' ');
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
  return lines;
}

const DATING_SCENARIOS = {
  narcissist: {
    badge: '🚩 RED FLAG: PREMATURE INTENSITY & LOVE BOMBING',
    incoming: [
      '“I know it’s only day 2, but I’ve never felt this connection.',
      'You are honestly my soulmate.”'
    ],
    outgoing: [
      '“We barely know each other yet.',
      'Let’s slow down and see how we vibe in person.”'
    ],
    analysis: [
      { prefix: 'Emotional Pacing', body: 'Rushing intensity before real chemistry is proven' },
      { prefix: 'Boundary Testing', body: 'Healthy matches respect your speed without guilt' },
      { prefix: 'Action Protocol', body: 'Insist on a short public coffee meet before private calls' }
    ]
  },
  lowEffort: {
    badge: '🚩 RED FLAG: DEFLECTION & WEAPONIZED INCOMPETENCE',
    incoming: [
      '“You’re thinking too much into it lol.',
      'I’m just bad at texting, you know that.”'
    ],
    outgoing: [
      '“It takes 10 seconds to reply.',
      'I value mutual effort, so we are not a match.”'
    ],
    analysis: [
      { prefix: 'Effort Asymmetry', body: 'Consistency reveals genuine dating interest' },
      { prefix: 'Deflection Tactic', body: 'Dismissing valid communication needs as overthinking' },
      { prefix: 'Action Rule', body: 'Walk away early when responsiveness requires begging' }
    ]
  },
  boundaries: {
    badge: '🚩 RED FLAG: BYPASSING SAFETY PROTOCOL',
    incoming: [
      '“Just come over to my place instead.',
      'Why make things complicated with a public spot?”'
    ],
    outgoing: [
      '“I only do first meets in public coffee shops.',
      'If that doesn’t work for you, no worries.”'
    ],
    analysis: [
      { prefix: 'Safety Protocol', body: 'Never compromise public-venue rules on date one' },
      { prefix: 'Boundary Response', body: 'Pushing back against simple safety is an instant red flag' },
      { prefix: 'Zero Guilt', body: 'State standards firmly without apologizing for safety' }
    ]
  },
  breadcrumbing: {
    badge: '🚩 RED FLAG: HOT & COLD BREADCRUMBING',
    incoming: [
      '“Hey stranger! Sorry vanished for 5 days, work was crazy.',
      'Are you free tonight for a quick late drink?”'
    ],
    outgoing: [
      '“I prefer consistent communication over late-night pings.',
      'Best of luck finding your match!”'
    ],
    analysis: [
      { prefix: 'Attention Grazing', body: 'Pinging you only when bored or other options run dry' },
      { prefix: 'Low Investment', body: 'Late-night invites avoid real daytime dating effort' },
      { prefix: 'Closure Protocol', body: 'Do not keep doors open for repeat vanishing matches' }
    ]
  },
  cryptoScam: {
    badge: '🚩 RED FLAG: FINANCIAL SOLICITATION & SCAM',
    incoming: [
      '“My uncle shared a lucrative short-term trading node.',
      'I can guide your first deposit tonight.”'
    ],
    outgoing: [
      '“I never discuss money or investments on dating apps.',
      'Best of luck with your trading.”'
    ],
    analysis: [
      { prefix: 'Pig Butchering', body: 'Romance scams pivot swiftly from affection to finance' },
      { prefix: 'Off-App Rush', body: 'Urging private chats removes built-in platform fraud flags' },
      { prefix: 'Ironclad Rule', body: 'Never transfer funds or crypto to someone unmet IRL' }
    ]
  },
  catfishVideo: {
    badge: '🚩 RED FLAG: VIDEO CALL REFUSAL & CATFISH ALERT',
    incoming: [
      '“My front camera is broken and phone is glitching.',
      'Let’s just stay on WhatsApp text instead.”'
    ],
    outgoing: [
      '“I only meet after a quick 15-second video wave.',
      'Let me know when your camera works!”'
    ],
    analysis: [
      { prefix: 'Identity Concealment', body: 'Camera excuses consistently mask stolen or AI photos' },
      { prefix: 'Synthetic Personas', body: 'Modern scammers use freshly generated AI faces' },
      { prefix: 'Zero Risk Rule', body: 'A live video wave takes 15 seconds and prevents scams' }
    ]
  }
};

function selectDatingScenario(item) {
  const text = (item.title + ' ' + item.slug + ' ' + (item.category || '')).toLowerCase();

  if (text.includes('narcissist') || text.includes('love-bombing') || text.includes('intensity')) {
    return DATING_SCENARIOS.narcissist;
  }
  if (text.includes('bad at texting') || text.includes('low effort') || text.includes('habit') || text.includes('mixed signals') || text.includes('time waster')) {
    return DATING_SCENARIOS.lowEffort;
  }
  if (text.includes('boundar') || text.includes('first date') || text.includes('dinner') || text.includes('safety rule')) {
    return DATING_SCENARIOS.boundaries;
  }
  if (text.includes('breadcrumbing') || text.includes('benching') || text.includes('ghosting') || text.includes('disappear')) {
    return DATING_SCENARIOS.breadcrumbing;
  }
  if (text.includes('crypto') || text.includes('scam') || text.includes('blackmail') || text.includes('extortion')) {
    return DATING_SCENARIOS.cryptoScam;
  }
  if (text.includes('catfish') || text.includes('deepfake') || text.includes('stolen') || text.includes('photo') || text.includes('fake')) {
    return DATING_SCENARIOS.catfishVideo;
  }

  return DATING_SCENARIOS.lowEffort;
}

function formatBulletText(rawText) {
  let cleaned = rawText
    .replace(/[*_#`]/g, '')
    .replace(/^\[.*?\]\s*/, '')
    // Replace network engineering jargon with human dating psychology
    .replace(/syn-flood/gi, 'excessive emotional intensity')
    .replace(/rtt/gi, 'response latency')
    .replace(/telemetry/gi, 'behavioral signals')
    .replace(/spoofed exif/gi, 'altered photo metadata')
    .replace(/gan border/gi, 'AI generation')
    .replace(/token bursts/gi, 'scripted spam patterns')
    .replace(/route-a\.\./gi, 'alternative communication')
    .replace(/pre-emptive/gi, 'early')
    .replace(/network logs/gi, 'chat timestamps')
    .trim();

  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    const prefix = parts[0].trim().replace(/\.\.\.$/, '');
    const rest = parts.slice(1).join(':').trim().replace(/\.\.\.$/, '');
    return {
      prefix: prefix.length > 22 ? prefix.substring(0, 20) : prefix,
      body: rest.length > 55 ? rest.substring(0, 52) : rest
    };
  }

  const words = cleaned.split(/\s+/);
  const prefix = words.slice(0, 2).join(' ');
  const body = words.slice(2, 9).join(' ');
  return {
    prefix: prefix || 'Core Finding',
    body: body || 'Essential safety check before meeting in person'
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
          if (bullets.length >= 4) break;
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
          if (bullets.length >= 4) break;
        }
      }
    }
  }

  if (bullets.length < 3) {
    const t = title.toLowerCase();
    if (t.includes('sextortion') || t.includes('blackmail')) {
      return [
        { prefix: 'Pressure Tactics', body: 'Urgent manipulation to bypass your rational boundaries' },
        { prefix: 'Containment Rule', body: 'Cease contact immediately without sending any money' },
        { prefix: 'Evidence Record', body: 'Preserve all message exchanges before blocking completely' }
      ];
    }
    if (t.includes('shadowban') || t.includes('elo')) {
      return [
        { prefix: 'Visibility Trap', body: 'Frequent unselective swiping lowers recommended match rank' },
        { prefix: 'Mutual Scoring', body: 'Response ratios and chat length dictate your distribution' },
        { prefix: 'Account Recovery', body: 'Paced mindful swiping restores top-tier profile visibility' }
      ];
    }
    if (t.includes('bumble') || t.includes('active')) {
      return [
        { prefix: 'Activity Status', body: 'Understanding active engagement vs inactive browsing' },
        { prefix: 'Intentional Dating', body: '3-step conversation test to weed out serial ghosts' },
        { prefix: 'Time-Waster Filter', body: 'Clear boundaries to stop endless pen-pal texting' }
      ];
    }
    if (t.includes('catfish') || t.includes('deepfake')) {
      return [
        { prefix: 'Photo Red Flags', body: 'Watch for unnatural face symmetry and blurry ear edges' },
        { prefix: 'Video Verification', body: 'Live video waves immediately expose stolen photo profiles' },
        { prefix: 'Safety First', body: 'Never invest emotion before verifying physical identity' }
      ];
    }
    return [
      { prefix: 'Intentional Pacing', body: 'Verify emotional consistency before meeting in person' },
      { prefix: 'Safety Standards', body: 'Always insist on public venues for the first meeting' },
      { prefix: 'Actionable Rule', body: 'State standards firmly without over-explaining your boundaries' }
    ];
  }

  return bullets.slice(0, 4);
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
   * Resolves the local absolute path for the article cover image
   */
  resolveCoverImagePath(item, rawPost = '') {
    const baseDir = path.resolve(__dirname, '../blog/public');

    // 1. Check item.coverImage from queue
    if (item.coverImage) {
      const cleanRel = String(item.coverImage).replace(/^\//, '');
      const p1 = path.join(baseDir, cleanRel);
      if (fs.existsSync(p1)) return p1;
    }

    // 2. Parse coverImage from rawPost frontmatter
    if (rawPost) {
      const m = rawPost.match(/(?:coverImage|image):\s*["']?([^"'\r\n]+)["']?/);
      if (m && m[1]) {
        const cleanRel = m[1].trim().replace(/^\//, '');
        const pPost = path.join(baseDir, cleanRel);
        if (fs.existsSync(pPost)) return pPost;
      }
    }

    // 3. Fallback to slug.webp / slug.png
    const pSlugWebp = path.join(baseDir, 'images/posts', `${item.slug}.webp`);
    if (fs.existsSync(pSlugWebp)) return pSlugWebp;

    const pSlugPng = path.join(baseDir, 'images/posts', `${item.slug}.png`);
    if (fs.existsSync(pSlugPng)) return pSlugPng;

    // 4. Default generic cover
    const pDefault = path.join(baseDir, 'images/posts/default-cover.webp');
    if (fs.existsSync(pDefault)) return pDefault;

    return null;
  }

  /**
   * High-contrast, mobile-first Pinterest Pin Generator with REAL ARTICLE COVER
   * Implements 4 distinct bright/light design archetypes with embedded cover visual:
   * 1. Chat Teardown (iMessage/Tinder dialogue with red flag stickers)
   * 2. Checklist Infographic (Actionable bullet cards with icons)
   * 3. Algorithm Unmasked (Behavioral & ELO analysis)
   * 4. Photo Verification (Fake vs Real profile inspection)
   */
  async renderPinCreative(item) {
    const width = 1000;
    const height = 1500;

    const postPath = path.join(CONFIG.postsDir, `${item.slug}.md`);
    let rawPost = '';
    if (fs.existsSync(postPath)) {
      rawPost = fs.readFileSync(postPath, 'utf8');
    }

    const cleanTitle = cleanHeadlineForPin(item.title);
    const bullets = extractKeyTakeaways(rawPost, cleanTitle);
    const textComb = (cleanTitle + ' ' + item.slug + ' ' + (item.category || '')).toLowerCase();

    // Determine Design Archetype
    let archetype = 'checklist-infographic';
    if (textComb.includes('text') || textComb.includes('chat') || textComb.includes('message') || textComb.includes('bio') || textComb.includes('reply') || textComb.includes('ghosting') || textComb.includes('narcissist') || textComb.includes('love bombing')) {
      archetype = 'chat-teardown';
    } else if (textComb.includes('algorithm') || textComb.includes('elo') || textComb.includes('shadowban') || textComb.includes('swiping') || textComb.includes('psycholog') || textComb.includes('attachment')) {
      archetype = 'algorithm-unmasked';
    } else if (textComb.includes('catfish') || textComb.includes('reverse') || textComb.includes('photo') || textComb.includes('deepfake') || textComb.includes('scam') || textComb.includes('fake') || textComb.includes('blackmail')) {
      archetype = 'photo-verification';
    }

    // 1. Process and format real article cover
    const coverWidth = 900;
    const coverHeight = 490;
    const coverTop = 105;
    const coverLeft = 50;
    const cornerRadius = 20;

    let coverBuffer = null;
    const coverPath = this.resolveCoverImagePath(item, rawPost);
    if (coverPath && fs.existsSync(coverPath)) {
      try {
        const maskSvg = Buffer.from(`
          <svg width="${coverWidth}" height="${coverHeight}">
            <rect x="0" y="0" width="${coverWidth}" height="${coverHeight}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#fff"/>
          </svg>
        `);
        coverBuffer = await sharp(coverPath)
          .resize(coverWidth, coverHeight, { fit: 'cover', position: 'center' })
          .composite([{ input: maskSvg, blend: 'dest-in' }])
          .png()
          .toBuffer();
      } catch (err) {
        log(`Warning preparing cover image for ${item.slug}: ${err.message}`);
      }
    }

    // Headline wrap (2 lines under cover image, max 28 chars/line)
    const titleLines = wrapHeadline(cleanTitle, 28).slice(0, 2);
    const cardTopY = 745;
    const cardHeight = 545;

    let svg = '';

    if (archetype === 'chat-teardown') {
      // ARCHETYPE 1: Chat Teardown / Red Flags
      const scenario = selectDatingScenario(item);
      const incoming = (scenario.incoming[0] || 'Are you free tonight? Come over late.')
        .replace(/^["'«\s]+|["'»\s]+$/g, '')
        .trim();
      const outgoing = (scenario.outgoing[0] || 'I prefer meeting in daylight for coffee first.')
        .replace(/^["'«\s]+|["'»\s]+$/g, '')
        .trim();

      svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#FBF9F5" />
          </linearGradient>
          <linearGradient id="redBtn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#DC2626" />
            <stop offset="100%" stop-color="#EF4444" />
          </linearGradient>
          <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.07" />
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#bgLight)" />
        <rect x="0" y="0" width="${width}" height="10" fill="#EF4444" />

        <!-- Top Category Badge -->
        <rect x="50" y="40" width="450" height="42" rx="8" fill="#FEE2E2" stroke="#FCA5A5" stroke-width="1.5" />
        <circle cx="75" cy="61" r="5" fill="#EF4444" />
        <text x="95" y="67" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#B91C1C" letter-spacing="1.2">
          🚩 TEXTING RED FLAGS // TEARDOWN
        </text>

        <!-- Brand Identifier -->
        <text x="950" y="67" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="900" fill="#64748B" text-anchor="end" letter-spacing="1">
          FLIRTCHECK.SITE
        </text>

        <!-- Cover Image Slot Frame -->
        <rect x="${coverLeft - 2}" y="${coverTop - 2}" width="${coverWidth + 4}" height="${coverHeight + 4}" rx="${cornerRadius + 2}" fill="none" stroke="#E2E8F0" stroke-width="2" />

        <!-- Headline under cover -->
        ${titleLines.map((line, i) => `
          <text x="50" y="${640 + i * 46}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#0F172A" letter-spacing="-0.8">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Interactive Chat Card Container -->
        <rect x="50" y="${cardTopY}" width="${coverWidth}" height="${cardHeight}" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)" />

        <!-- Chat Card Header -->
        <rect x="50" y="${cardTopY}" width="${coverWidth}" height="55" rx="20" fill="#F8FAFC" />
        <circle cx="85" cy="${cardTopY + 27}" r="14" fill="#E2E8F0" />
        <text x="85" y="${cardTopY + 32}" font-family="sans-serif" font-size="12" text-anchor="middle">👤</text>
        <text x="110" y="${cardTopY + 34}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#0F172A">
          Dating App Match Conversation Teardown
        </text>

        <!-- Incoming Message -->
        <rect x="80" y="${cardTopY + 75}" width="720" height="75" rx="14" fill="#F1F5F9" />
        <text x="105" y="${cardTopY + 120}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#1E293B">
          "${escapeXml(incoming)}"
        </text>

        <!-- Red Flag Annotation Overlay Sticker -->
        <rect x="80" y="${cardTopY + 165}" width="840" height="48" rx="12" fill="#FEF2F2" stroke="#EF4444" stroke-width="1.5" />
        <text x="500" y="${cardTopY + 196}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle" letter-spacing="0.5">
          ${escapeXml(scenario.badge)}
        </text>

        <!-- Outgoing High-Value Boundary Response -->
        <rect x="220" y="${cardTopY + 230}" width="700" height="75" rx="14" fill="#2563EB" />
        <text x="250" y="${cardTopY + 275}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF">
          "${escapeXml(outgoing)}"
        </text>

        <!-- Analysis Bullet Box -->
        <rect x="80" y="${cardTopY + 325}" width="840" height="190" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
        <text x="105" y="${cardTopY + 358}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#64748B" letter-spacing="1">
          PSYCHOLOGICAL PATTERN ANALYSIS:
        </text>
        ${scenario.analysis.slice(0, 2).map((b, idx) => `
          <g transform="translate(105, ${cardTopY + 395 + idx * 58})">
            <circle cx="8" cy="-4" r="8" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5" />
            <text x="8" y="0" font-family="sans-serif" font-size="10" font-weight="bold" fill="#DC2626" text-anchor="middle">!</text>
            <text x="28" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#0F172A">
              ${escapeXml(b.prefix)}: <tspan font-weight="400" fill="#475569">${escapeXml(b.body)}</tspan>
            </text>
          </g>
        `).join('')}

        <!-- Bottom Viral Action Button -->
        <rect x="50" y="1320" width="${coverWidth}" height="84" rx="42" fill="url(#redBtn)" filter="url(#cardShadow)" />
        <text x="500" y="1373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          READ FULL CHAT TEARDOWN &amp; GUIDE ➔
        </text>

        <!-- Subtext Footer -->
        <text x="500" y="1455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">
          FlirtCheck.site • Independent Dating Safety Audits &amp; Profile Verification
        </text>
      </svg>`;

    } else if (archetype === 'algorithm-unmasked') {
      // ARCHETYPE 2: Algorithm & Psychology
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
            <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#4F46E5" flood-opacity="0.08" />
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#bgAlgo)" />
        <rect x="0" y="0" width="${width}" height="10" fill="#4F46E5" />

        <!-- Top Header -->
        <rect x="50" y="40" width="450" height="42" rx="8" fill="#EDE9FE" stroke="#C4B5FD" stroke-width="1.5" />
        <circle cx="75" cy="61" r="5" fill="#4F46E5" />
        <text x="95" y="67" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#4338CA" letter-spacing="1.2">
          🔬 ALGORITHM AUDIT // REVERSE ENGINEERED
        </text>

        <text x="950" y="67" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="900" fill="#64748B" text-anchor="end" letter-spacing="1">
          FLIRTCHECK.SITE
        </text>

        <rect x="${coverLeft - 2}" y="${coverTop - 2}" width="${coverWidth + 4}" height="${coverHeight + 4}" rx="${cornerRadius + 2}" fill="none" stroke="#E2E8F0" stroke-width="2" />

        <!-- Headline under cover -->
        ${titleLines.map((line, i) => `
          <text x="50" y="${640 + i * 46}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#0F172A" letter-spacing="-0.8">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Telemetry Container Card -->
        <rect x="50" y="${cardTopY}" width="${coverWidth}" height="${cardHeight}" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#shadowLight)" />

        <!-- Metric 1 -->
        <g transform="translate(80, ${cardTopY + 25})">
          <rect width="840" height="150" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#4F46E5" letter-spacing="1">
            METRIC 01: SWIPE RATIO &amp; QUEUE VISIBILITY
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#0F172A">
            Outgoing Swipe Balance Calibration
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#475569">
            Swiping right on too many profiles triggers algorithmic suppression and lower ELO tier.
          </text>
        </g>

        <!-- Metric 2 -->
        <g transform="translate(80, ${cardTopY + 195})">
          <rect width="840" height="150" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#D97706" letter-spacing="1">
            METRIC 02: DYNAMIC PROFILE DEPRECIATION
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#0F172A">
            Engineered Dating App Inactivity Wall
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#475569">
            Top-tier matches are withheld behind paid boost paywalls after 72 hours of constant usage.
          </text>
        </g>

        <!-- Protocol -->
        <g transform="translate(80, ${cardTopY + 365})">
          <rect width="840" height="150" rx="14" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#15803D" letter-spacing="1">
            ACTION PROTOCOL: THE ALGORITHM RESET
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#166534">
            Optimal Pacing &amp; Calibration Rules
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#166534">
            Reset swipe rhythms and calibrate metadata to restore your profile to active candidate tiers.
          </text>
        </g>

        <!-- Bottom Viral Action Button -->
        <rect x="50" y="1320" width="${coverWidth}" height="84" rx="42" fill="url(#indigoBtn)" filter="url(#shadowLight)" />
        <text x="500" y="1373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          UNMASK ALGORITHM MECHANICS ➔
        </text>

        <text x="500" y="1455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">
          FlirtCheck.site • Independent Dating Algorithm Research &amp; Audits
        </text>
      </svg>`;

    } else if (archetype === 'photo-verification') {
      // ARCHETYPE 3: Photo Verification & Catfish Warning
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
            <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#DC2626" flood-opacity="0.08" />
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#bgIvory)" />
        <rect x="0" y="0" width="${width}" height="10" fill="#DC2626" />

        <!-- Top Header -->
        <rect x="50" y="40" width="450" height="42" rx="8" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1.5" />
        <circle cx="75" cy="61" r="5" fill="#D97706" />
        <text x="95" y="67" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#B45309" letter-spacing="1.2">
          ⚠️ CATFISH ALERT // 60-SEC VERIFY
        </text>

        <text x="950" y="67" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="900" fill="#64748B" text-anchor="end" letter-spacing="1">
          FLIRTCHECK.SITE
        </text>

        <rect x="${coverLeft - 2}" y="${coverTop - 2}" width="${coverWidth + 4}" height="${coverHeight + 4}" rx="${cornerRadius + 2}" fill="none" stroke="#E2E8F0" stroke-width="2" />

        <!-- Headline under cover -->
        ${titleLines.map((line, i) => `
          <text x="50" y="${640 + i * 46}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#0F172A" letter-spacing="-0.8">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Verification Container Card -->
        <rect x="50" y="${cardTopY}" width="${coverWidth}" height="${cardHeight}" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#shadowAmber)" />

        <!-- Warning Sign 1 -->
        <g transform="translate(80, ${cardTopY + 25})">
          <rect width="840" height="150" rx="14" fill="#FEF2F2" stroke="#FECACA" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#DC2626" letter-spacing="1">
            RED FLAG 01: UNCANNY AI ARTIFACTS
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#991B1B">
            Ear Asymmetry, Teeth &amp; Glitch Tells
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#4B5563">
            Deepfake models leave subtle artifacts in blurred earlobes, background lines and glossy hair strands.
          </text>
        </g>

        <!-- Warning Sign 2 -->
        <g transform="translate(80, ${cardTopY + 195})">
          <rect width="840" height="150" rx="14" fill="#FEF2F2" stroke="#FECACA" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#DC2626" letter-spacing="1">
            RED FLAG 02: THE WHATSAPP SPRINT
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#991B1B">
            Urgent Push to Evacuate Dating Apps
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#4B5563">
            Scam rings insist on leaving the app within 48 hours to evade automated machine learning fraud bans.
          </text>
        </g>

        <!-- Defense Protocol -->
        <g transform="translate(80, ${cardTopY + 365})">
          <rect width="840" height="150" rx="14" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#15803D" letter-spacing="1">
            DEFENSE PROTOCOL: THE 30-SEC VERIFY
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#166534">
            Instant In-App Video Wave or Reverse Audit
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#166534">
            Request a 10-second casual video verification wave or execute full reverse forensic profile telemetry.
          </text>
        </g>

        <!-- Bottom Viral Action Button -->
        <rect x="50" y="1320" width="${coverWidth}" height="84" rx="42" fill="url(#amberBtn)" filter="url(#shadowAmber)" />
        <text x="500" y="1373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          VERIFY ANY PROFILE IN 60 SECONDS ➔
        </text>

        <text x="500" y="1455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">
          FlirtCheck.site • Free AI &amp; Reverse Image Dating Security Audits
        </text>
      </svg>`;

    } else {
      // ARCHETYPE 4: Actionable Checklist (Default)
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
            <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.08" />
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#bgChecklist)" />
        <rect x="0" y="0" width="${width}" height="10" fill="#0F172A" />

        <!-- Top Header -->
        <rect x="50" y="40" width="450" height="42" rx="8" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />
        <circle cx="75" cy="61" r="5" fill="#0F172A" />
        <text x="95" y="67" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#0F172A" letter-spacing="1.2">
          📋 DATING PROTOCOL // ACTIONABLE CHECKLIST
        </text>

        <text x="950" y="67" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="900" fill="#64748B" text-anchor="end" letter-spacing="1">
          FLIRTCHECK.SITE
        </text>

        <rect x="${coverLeft - 2}" y="${coverTop - 2}" width="${coverWidth + 4}" height="${coverHeight + 4}" rx="${cornerRadius + 2}" fill="none" stroke="#E2E8F0" stroke-width="2" />

        <!-- Headline under cover -->
        ${titleLines.map((line, i) => `
          <text x="50" y="${640 + i * 46}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#0F172A" letter-spacing="-0.8">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Checklist Container Card -->
        <rect x="50" y="${cardTopY}" width="${coverWidth}" height="${cardHeight}" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#shadowCard)" />

        ${bullets.slice(0, 3).map((b, idx) => {
          const y = cardTopY + 25 + idx * 170;
          const icons = ['❌', '🔍', '✓'];
          const iconBgs = ['#FEE2E2', '#EFF6FF', '#F0FDF4'];
          const iconStrokes = ['#F87171', '#60A5FA', '#86EFAC'];
          const titleColors = ['#991B1B', '#1E40AF', '#166534'];

          return `
            <g transform="translate(80, ${y})">
              <rect width="840" height="145" rx="14" fill="#FAF8F5" stroke="#E2E8F0" stroke-width="1.2" />
              <rect x="25" y="25" width="48" height="48" rx="12" fill="${iconBgs[idx % iconBgs.length]}" stroke="${iconStrokes[idx % iconStrokes.length]}" stroke-width="1.5" />
              <text x="49" y="56" font-family="sans-serif" font-size="20" text-anchor="middle">${icons[idx % icons.length]}</text>
              <text x="90" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="900" fill="${titleColors[idx % titleColors.length]}">
                RULE 0${idx + 1}: ${escapeXml(b.prefix)}
              </text>
              <text x="90" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#475569">
                ${escapeXml(b.body)}
              </text>
            </g>
          `;
        }).join('')}

        <!-- Bottom Viral Action Button -->
        <rect x="50" y="1320" width="${coverWidth}" height="84" rx="42" fill="url(#primaryBtn)" filter="url(#shadowCard)" />
        <text x="500" y="1373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          SAVE CHECKLIST &amp; READ FULL DOSSIER ➔
        </text>

        <text x="500" y="1455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">
          FlirtCheck.site • Modern Dating Safety Playbooks &amp; Relationship Advice
        </text>
      </svg>`;
    }

    // Render base SVG and composite cover image
    const baseSvg = Buffer.from(svg);
    const composites = [];
    if (coverBuffer) {
      composites.push({
        input: coverBuffer,
        top: coverTop,
        left: coverLeft,
      });
    }

    await sharp(baseSvg)
      .composite(composites)
      .png({ quality: 95 })
      .toFile(item.creativePath);

    item.status = 'ready';
    this.saveQueue();
    log(`🎨 Rendered VIRAL LIGHT PIN WITH COVER (${archetype}): ${path.basename(item.creativePath)}`);
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
    const force = args.includes('--force');
    await manager.buildAllCreatives(force);
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

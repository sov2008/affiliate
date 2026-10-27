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
const {
  CATEGORY_MAP,
  generateHookTitle,
  parseArticleContent,
  buildSeoDescription,
  renderPinImage
} = require('./pinterest-pin-generator.cjs');

const CONFIG = {
  postsDir: path.resolve(__dirname, '../blog/src/content/posts'),
  queueFile: path.resolve(__dirname, '../.antigravity/pinterest_queue.json'),
  stateFile: path.resolve(__dirname, '../.antigravity/pinterest_state.json'),
  cookiesFile: path.resolve(__dirname, '../pinterest_cookies.json'),
  pinsOutputDir: path.resolve(__dirname, '../scratch/pins'),
  boardName: 'FlirtCheck',
  fallbackBoard: 'MoneyCash.pw',
  domain: 'https://flirtcheck.site',
  minIntervalMs: 60 * 1000,
  omitDestinationLink: process.env.PINTEREST_OMIT_LINK === 'true',
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
    .replace(/'/g, '&apos;')
    .replace(/&QUOT;/gi, '&quot;')
    .replace(/&APOS;/gi, '&apos;')
    .replace(/&AMP;/gi, '&amp;')
    .replace(/&LT;/gi, '&lt;')
    .replace(/&GT;/gi, '&gt;');
}

function escapeXmlUpper(str) {
  if (!str) return '';
  return escapeXml(String(str).toUpperCase())
    .replace(/&QUOT;/gi, '&quot;')
    .replace(/&APOS;/gi, '&apos;')
    .replace(/&AMP;/gi, '&amp;')
    .replace(/&LT;/gi, '&lt;')
    .replace(/&GT;/gi, '&gt;');
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
    .replace(/\(2026\s+Guide\)/i, '')
    .replace(/\(2026\)/i, '')
    .trim();

  const lower = title.toLowerCase();

  // Targeted high-intent Pinterest search queries & viral headlines
  if (lower.includes('tinder elo') || lower.includes('ranking reset')) {
    return 'Tinder ELO Algorithm: 2026 Ranking Reset';
  }
  if (lower.includes('pig butchering')) {
    return 'Pig Butchering Scam on Dating Apps: Survival Guide';
  }
  if (lower.includes('optimal photo order')) {
    return 'Optimal Photo Order on Dating Apps: The Anchor Rule';
  }
  if (lower.includes('stolen instagram photos') || lower.includes('stolen photos')) {
    return 'How to Detect Stolen Photos on Dating Profiles';
  }
  if (lower.includes('bumble show when you were last active') || lower.includes('last active')) {
    return 'Does Bumble Show When You Were Last Active?';
  }
  if (lower.includes('what to say when a match disappears') || lower.includes('match disappears')) {
    return 'What to Say When a Match Disappears & Comes Back';
  }
  if (lower.includes('why dating scammers demand whatsapp') || lower.includes('demand whatsapp')) {
    return 'Why Dating Scammers Demand WhatsApp Instantly';
  }
  if (lower.includes('deleting and remaking dating profiles')) {
    return 'Why Deleting & Remaking Dating Profiles Fails';
  }
  if (lower.includes('matches but no dates') || lower.includes('matches‑but‑no‑dates')) {
    return 'Why You Get Matches But No Dates & How to Fix It';
  }
  if (lower.includes('move from match to real date') || lower.includes('match to real date')) {
    return 'Move From Tinder Match to Real Date in 3 Steps';
  }
  if (lower.includes('how fast response times reveal') || lower.includes('ten-second text rule')) {
    return 'The 10-Second Text Rule: Response Times & True Intent';
  }
  if (lower.includes('reviving stalled') || lower.includes('revive a dead tinder')) {
    return 'How to Revive Dead Dating Conversations in 2026';
  }
  if (lower.includes('facial symmetry') || lower.includes('rank facial symmetry')) {
    return 'How Dating Algorithms Rank Facial Symmetry & Photos';
  }
  if (lower.includes('subtle signs of infidelity') || lower.includes('infidelity in text')) {
    return 'Subtle Signs of Infidelity in Text Messages';
  }
  if (lower.includes('is he flirting with you over text') || lower.includes('is-he-flirting')) {
    return 'Is He Flirting With You Over Text? 9 Hidden Clues';
  }
  if (lower.includes('is she flirting or just polite') || lower.includes('is-she-flirting')) {
    return 'Is She Flirting or Just Polite? The Behavioral Test';
  }
  if (lower.includes('mastering group photos')) {
    return 'Mastering Group Photos on Dating Apps: The Rules';
  }
  if (lower.includes('fake verification checkmark')) {
    return 'Fake Verification Checkmarks: How Bots Bypass Checks';
  }
  if (lower.includes('ai spambot') || lower.includes('using chatgpt')) {
    return 'Signs Your Dating App Match Is Using ChatGPT';
  }
  if (lower.includes('voice note verification') || lower.includes('audio deepfakes')) {
    return 'The Voice Note Verification Trick to Spot Deepfakes';
  }
  if (lower.includes('voice phishing on tinder') || lower.includes('voice-phishing')) {
    return 'Voice Phishing on Tinder: The Audio Note Trap';
  }
  if (lower.includes('voice prompts on hinge') || lower.includes('vocal tone triggers')) {
    return 'Voice Prompts on Hinge: Vocal Tones & Attraction';
  }
  if (lower.includes('slot machine algorithm')) {
    return 'The Slot Machine Algorithm: Dating App Psychology';
  }
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
  if (lower.includes('crypto romance scam') || lower.includes('crypto dating funnel') || lower.includes('48-hour whatsapp move')) {
    return 'The 48-Hour WhatsApp Move: Crypto Romance Scams';
  }
  if (lower.includes('time wasters') || (lower.includes('bumble') && lower.includes('bio'))) {
    return 'How to Filter Time-Wasters on Bumble in 3 Steps';
  }
  if (lower.includes('ai catfishing') || lower.includes('deepfake')) {
    return 'How to Spot Deepfake Catfish Photos on Hinge';
  }
  if (lower.includes('first date safety checklist') || lower.includes('non-negotiable rules')) {
    return 'First Date Safety: 5 Non-Negotiable Rules';
  }
  if (lower.includes('most compatible') && lower.includes('hinge')) {
    return 'How Hinge Most Compatible Algorithm Actually Works';
  }
  if (lower.includes('anxious-avoidant trap')) {
    return 'The Anxious-Avoidant Trap on Dating Apps';
  }
  if (lower.includes('blackmails you') || lower.includes('anti-sextortion') || lower.includes('counter dating app sextortion')) {
    return 'Anti-Extortion Protocol: What to Do If Blackmailed';
  }
  if (lower.includes('breadcrumbing vs benching')) {
    return 'Breadcrumbing vs Benching: Spot Unavailable Matches';
  }
  if (lower.includes('first-date body language') || lower.includes('micro-expressions')) {
    return 'First-Date Body Language: Reading Hidden Signals';
  }
  if (lower.includes('low-pressure first date') || lower.includes('dinners are flawed') || lower.includes('formal dinners fail')) {
    return 'Low-Pressure First Dates: Why Dinner Dates Fail';
  }
  if (lower.includes('reverse search wont save you') || lower.includes('reverse image search won\'t save you')) {
    return 'Why Reverse Image Search Fails Against AI Catfish';
  }
  if (lower.includes('reverse face search & identity verification') || lower.includes('osint and ai')) {
    return 'Reverse Face Search: How to Detect Catfishing Fast';
  }

  // If title has a colon, inspect both sides:
  if (title.includes(':')) {
    const parts = title.split(':').map(p => p.trim());
    if (parts[0].length >= 15 && parts[0].length <= 48) {
      return parts[0];
    }
    if (parts[1] && parts[1].length >= 15 && parts[1].length <= 48) {
      return parts[1];
    }
  }

  return title.length > 55 ? title.substring(0, 52) + '...' : title;
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
    .replace(/^["'“”«\s]+|["'“”»\s]+$/g, '')
    .replace(/[*_#`"]/g, '')
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
    const prefix = parts[0].trim().replace(/^["'\s]+|["'\s]+$/g, '').replace(/\.\.\.$/, '');
    const rest = parts.slice(1).join(':').trim().replace(/^["'\s]+|["'\s]+$/g, '').replace(/\.\.\.$/, '');
    if (prefix.length >= 3 && rest.length >= 8) {
      return {
        prefix: prefix.length > 24 ? prefix.substring(0, 22) : prefix,
        body: rest.length > 60 ? rest.substring(0, 57) + '...' : rest
      };
    }
  }

  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  if (words.length >= 5) {
    const prefix = words.slice(0, 2).join(' ');
    const body = words.slice(2, 10).join(' ');
    return {
      prefix: prefix.length > 22 ? prefix.substring(0, 20) : prefix,
      body: body.length > 60 ? body.substring(0, 57) + '...' : body
    };
  }

  return {
    prefix: 'Verified Signal',
    body: cleaned.length > 55 ? cleaned.substring(0, 52) + '...' : cleaned
  };
}

function resolveCardBullets(archetype, bullets) {
  const defaults = {
    'photo-verification': [
      { prefix: 'Reverse Face Search', body: 'Cross-reference photos across search engines and social handles' },
      { prefix: 'Social Graph Audit', body: 'Verify consistent locations, friend networks and timeline history' },
      { prefix: 'Live Video Wave', body: 'Request a spontaneous 15-second video wave before meeting in person' }
    ],
    'algorithm-unmasked': [
      { prefix: 'Swipe Activity Balance', body: 'Selective right-swiping maintains high queue tier and distribution' },
      { prefix: 'Queue Priority Scoring', body: 'Responsive conversation depth elevates your profile ranking' },
      { prefix: 'Account Reset Protocol', body: 'Paced mindful swiping restores top-tier candidate visibility' }
    ],
    'checklist-infographic': [
      { prefix: 'Public Venue Protocol', body: 'Always hold first dates in populated, well-lit public venues' },
      { prefix: 'Independent Travel', body: 'Arrange your own transportation to and from the initial meeting' },
      { prefix: 'Firm Boundary Rules', body: 'State personal boundaries clearly without apologizing or justifying' }
    ]
  };

  const list = defaults[archetype] || defaults['checklist-infographic'];
  const res = [];

  for (let i = 0; i < 3; i++) {
    const raw = bullets[i];
    if (raw && raw.body && raw.body.length >= 10 && raw.prefix !== 'Verified Signal' && raw.prefix !== 'Core Finding') {
      res.push(raw);
    } else if (raw && raw.body && raw.body.length >= 10) {
      res.push({
        prefix: list[i].prefix,
        body: raw.body
      });
    } else {
      res.push(list[i]);
    }
  }
  return res;
}

function extractKeyTakeaways(rawMarkdown, title) {
  const bullets = [];
  const bodyMarkdown = rawMarkdown.replace(/^---\r?\n[\s\S]*?\r?\n---/, '');

  const takeawayMatch = bodyMarkdown.match(/##+\s*(?:Key Takeaways Dossier|Key Takeaways|Executive Summary|Core Findings|Action Protocol|Detection Blueprint)[\s\S]*?(?=\n##|$)/i);
  if (takeawayMatch) {
    const lines = takeawayMatch[0].split('\n');
    for (const line of lines) {
      const bMatch = line.match(/^\s*[-*•]\s+(.*)/);
      if (bMatch) {
        const text = bMatch[1].trim();
        if (text.length > 15) {
          bullets.push(formatBulletText(text));
          if (bullets.length >= 4) break;
        }
      }
    }
  }

  if (bullets.length < 3) {
    const generalBullets = bodyMarkdown.match(/^\s*[-*•]\s+([^\n]+)/gm);
    if (generalBullets) {
      for (const gb of generalBullets) {
        const text = gb.replace(/^\s*[-*•]\s+/, '').trim();
        if (text.length > 25 && !text.startsWith('http') && !text.startsWith('"') && !text.startsWith('“')) {
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

function resolveTargetBoard(item) {
  if (item && item.category && CATEGORY_MAP[item.category] && CATEGORY_MAP[item.category].board) {
    return CATEGORY_MAP[item.category].board;
  }
  return CONFIG.boardName || 'FlirtCheck';
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

      const primaryMode = (CATEGORY_MAP[category] && CATEGORY_MAP[category].mode) || 'editorial';
      const modesToSupport = [primaryMode, primaryMode === 'chat' ? 'checklist' : 'chat'];

      for (const m of modesToSupport) {
        const itemKey = m === primaryMode ? slug : `${slug}-${m}`;
        const creativePathVar = path.join(CONFIG.pinsOutputDir, `pin_${itemKey}.png`);
        const isPublished = !!(state.published && (state.published[itemKey] || (m === primaryMode && state.published[slug])));
        const creativeExistsVar = fs.existsSync(creativePathVar);

        let existing = this.queue.find(item => (item.key || item.slug) === itemKey);
        if (!existing) {
          existing = {
            key: itemKey,
            slug,
            mode: m,
            title,
            description: desc,
            category,
            caseId,
            coverImage: cover,
            targetUrl: `${CONFIG.domain}/${slug}/?utm_source=pinterest&utm_medium=social&utm_campaign=${itemKey}`,
            board: (CATEGORY_MAP[category] && CATEGORY_MAP[category].board) || CONFIG.boardName,
            status: isPublished ? 'published' : (creativeExistsVar ? 'ready' : 'pending'),
            creativePath: creativePathVar,
            createdAt: new Date().toISOString(),
            publishedAt: isPublished ? ((state.published[itemKey] && state.published[itemKey].publishedAt) || (state.published[slug] && state.published[slug].publishedAt) || new Date().toISOString()) : null,
            attempts: 0
          };
          this.queue.push(existing);
          addedCount++;
        } else {
          existing.key = itemKey;
          existing.mode = m;
          existing.title = title;
          existing.description = desc;
          existing.coverImage = cover;
          existing.caseId = caseId;
          existing.targetUrl = `${CONFIG.domain}/${slug}/?utm_source=pinterest&utm_medium=social&utm_campaign=${itemKey}`;
          existing.board = (CATEGORY_MAP[category] && CATEGORY_MAP[category].board) || CONFIG.boardName;
          existing.creativePath = creativePathVar;
          if (isPublished) {
            existing.status = 'published';
            if (!existing.publishedAt) {
              existing.publishedAt = (state.published[itemKey] && state.published[itemKey].publishedAt) || (state.published[slug] && state.published[slug].publishedAt) || new Date().toISOString();
            }
          } else if (existing.status !== 'published') {
            existing.status = creativeExistsVar ? 'ready' : 'pending';
          }
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
   * High-contrast, mobile-first Pinterest Pin Generator (New Editorial / Chat / Checklist Engine)
   */
  async renderPinCreative(item, browserInstance = null) {
    const article = parseArticleContent(item.slug);
    if (!article) {
      log(`Warning: Failed to parse article content for ${item.slug}`);
      return;
    }
    const mode = (item.mode && ['editorial', 'chat', 'checklist'].includes(item.mode)) 
      ? item.mode 
      : (CATEGORY_MAP[article.category]?.mode || 'editorial');
    item.mode = mode;
    await renderPinImage(article, item.creativePath, mode, browserInstance);

    item.board = item.board || CATEGORY_MAP[article.category]?.board || CONFIG.boardName;
    item.hookTitle = article.hookTitle;

    if (item.status !== 'published') {
      item.status = 'ready';
    }
    this.saveQueue();
    log(`🎨 Rendered VIRAL EDITORIAL PIN (${mode}): ${path.basename(item.creativePath)}`);
  }

  async buildAllCreatives(force = false) {
    log('Rebuilding high-contrast bright editorial creatives for items in queue...');
    let count = 0;
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
    });
    try {
      for (const item of this.queue) {
        if (force || item.status === 'ready' || item.status === 'pending') {
          try {
            await this.renderPinCreative(item, browser);
            count++;
          } catch (err) {
            log(`Error rendering ${item.slug}: ${err.message}`);
          }
        }
      }
    } finally {
      await browser.close().catch(() => {});
    }
    log(`✅ All ${count} editorial creatives rebuilt successfully in ${CONFIG.pinsOutputDir}`);
  }

  generatePinDescription(item) {
    const article = parseArticleContent(item.slug);
    if (article) {
      return buildSeoDescription(article);
    }
    return `Save this dating guide for your next match! ${item.title}. Dating app safety checklist, chat analysis, and profile verification breakdown.`;
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
      let createdPinId = null;
      page.on('response', async res => {
        if (res.url().includes('PinResource/create')) {
          try {
            const json = await res.json();
            const nodeId = json.resource_response?.data?.node_id;
            if (nodeId) {
              const raw = Buffer.from(nodeId, 'base64').toString('utf8');
              createdPinId = raw.replace('Pin:', '');
            }
          } catch (e) {}
        }
      });


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
      // 1. Upload File
      log('Uploading pin image...');
      await page.setInputFiles('input[type="file"]', item.creativePath);
      await page.waitForTimeout(3500);

      // 2. Title (Ensure React controlled component is filled and verified)
      log('Filling Title via keyboard simulation...');
      const titleInput = page.locator('textarea[id*="pin-draft-title"], textarea[placeholder*="название" i], textarea[placeholder*="title" i], [data-test-id="editor-title"] textarea').first();
      await titleInput.waitFor({ state: 'visible', timeout: 8000 });
      const pinTitle = (item.hookTitle || generateHookTitle(item.title)).substring(0, 99);
      await titleInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(pinTitle, { delay: 10 });
      log(`Title status: "${await titleInput.inputValue()}" ✅`);

      // 3. High-Converting SEO Description
      log('Filling High-Converting Pinterest SEO Description via keyboard simulation...');
      const descArea = page.locator('div[aria-label*="описание пина" i], div[contenteditable="true"], [data-test-id="editor-description"] div[contenteditable="true"]').first();
      if (await descArea.isVisible({ timeout: 5000 }).catch(() => false)) {
        await descArea.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        const descText = this.generatePinDescription(item);
        await page.keyboard.type(descText, { delay: 5 });
        log('Description filled ✅');
      }

      // 4. Destination Link (Optional / Omitted when pending domain whitelist)
      if (!CONFIG.omitDestinationLink && item.targetUrl) {
        log(`Filling Destination Link: ${item.targetUrl} via keyboard simulation...`);
        const linkInput = page.locator('textarea[id*="pin-draft-link"], textarea[placeholder*="целевую ссылку" i], textarea[placeholder*="ссылк" i], textarea[placeholder*="destination" i], input[placeholder*="link" i]').first();
        await linkInput.waitFor({ state: 'visible', timeout: 8000 });
        await linkInput.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.type(item.targetUrl, { delay: 10 });
        const curLink = await linkInput.inputValue().catch(() => '');
        if (!curLink || !curLink.startsWith('http')) {
          throw new Error(`CRITICAL: Destination link was NOT set for ${item.slug}. Aborting publish to prevent untitled/broken pins.`);
        }
        log(`Destination link status: ${curLink} ✅`);
      } else {
        log('Destination link omitted as requested (publishing direct organic pins without link to bypass spam filter) ✅');
      }

      // 5. Alt Text (Accessibility & Pinterest Visual Search OCR Boost)
      try {
        const altBtn = await page.$('button:has-text("Добавить альтернативный текст"), button:has-text("Add alt text"), [aria-label*="альтернативн"]');
        if (altBtn && await altBtn.isVisible()) {
          await altBtn.click();
          await page.waitForTimeout(500);
        }
        const altInput = page.locator('textarea[placeholder*="альтернативн"], textarea[placeholder*="alt text" i], [aria-label*="альтернативн"]').first();
        if (await altInput.isVisible({ timeout: 1500 }).catch(() => false)) {
          const categoryTag = (item.category || '').replace(/-/g, ' ');
          const altText = `Visual guide and infographic: ${item.title}. ${categoryTag} dating guide, safety checklist, and verification protocols.`;
          await altInput.fill(altText.slice(0, 480));
          log('Alt text successfully filled for Pinterest Visual Search.');
        }
      } catch (altErr) {
        log(`Alt text step passed: ${altErr.message}`);
      }

      // 6. Board Selection & Publish
      const targetBoard = item.board || resolveTargetBoard(item);
      log(`Ensuring target board "${targetBoard}" (fallback: "${CONFIG.boardName}") is selected...`);
      const boardButton = await page.$('[data-test-id="board-dropdown-select-button"]');
      const boardText = boardButton ? await boardButton.innerText() : '';
      
      if (!boardText.includes(targetBoard)) {
        if (boardButton) {
          await boardButton.click();
          await page.waitForTimeout(1500);

          // Try finding board row across different Pinterest DOM selector variations
          let boardRow = await page.$(`[data-test-id="board-row-${targetBoard}"], [data-test-id="board-row"]:has-text("${targetBoard}")`);
          if (!boardRow && CONFIG.boardName) {
            boardRow = await page.$(`[data-test-id="board-row-${CONFIG.boardName}"], [data-test-id="board-row"]:has-text("${CONFIG.boardName}")`);
          }
          if (!boardRow && CONFIG.fallbackBoard) {
            boardRow = await page.$(`[data-test-id="board-row-${CONFIG.fallbackBoard}"], [data-test-id="board-row"]:has-text("${CONFIG.fallbackBoard}")`);
          }

          if (boardRow) {
            await boardRow.click();
            await page.waitForTimeout(1000);
          } else {
            // Check if we can create the board on the fly
            const createBoardBtn = await page.$('[data-test-id="create-board-button"], div:has-text("Создать доску"), button:has-text("Создать доску")');
            if (createBoardBtn) {
              log(`Target board "${targetBoard}" not found. Creating new board "${targetBoard}"...`);
              await createBoardBtn.click();
              await page.waitForTimeout(1500);
              const nameInput = await page.$('input[id*="board-name"], input[placeholder*="Название"], input[name*="name"]');
              if (nameInput) {
                await nameInput.fill(targetBoard);
                await page.waitForTimeout(500);
                const submitCreateBtn = await page.$('button[type="submit"]:has-text("Создать"), button:has-text("Создать"), [data-test-id="board-creation-submit"]');
                if (submitCreateBtn) {
                  await submitCreateBtn.click();
                  log(`Created and selected board "${targetBoard}" ✅`);
                  await page.waitForTimeout(2500);
                }
              }
            } else {
              log(`Target board "${targetBoard}" not in list and create button not found, keeping current selection`);
            }
          }

          // Ensure flyout is dismissed so it never covers the Publish button
          const flyout = await page.$('[data-test-id="board-picker-flyout"]');
          if (flyout) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(800);
          }
        }
      }

      log('🚀 Clicking Publish button...');
      const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать"), button:has-text("Сохранить")');
      if (!publishBtn) throw new Error('Publish button not found');
      
      const isBtnEnabled = await publishBtn.isEnabled().catch(() => true);
      if (!isBtnEnabled) {
        log('Publish button appears disabled, checking form fields...');
      }

      // Pinterest's Publish button is a div[role="button"][tabindex="0"].
      // Playwright's click() sometimes misses React event delegation in headless mode.
      // Triggering focus + Enter + click ensures 100% activation of React onClick/onKeyDown.
      await publishBtn.focus().catch(() => {});
      await publishBtn.click({ force: true }).catch(() => {});
      await page.keyboard.press('Enter').catch(() => {});

      // 7. Wait for success confirmation or network API response
      log('⏳ Waiting for Pinterest to process and confirm pin creation...');
      let confirmed = false;
      for (let i = 1; i <= 15; i++) {
        await page.waitForTimeout(1500);
        if (createdPinId) {
          confirmed = true;
          log(`🎉 Pinterest confirmed pin creation via PinResource API! Pin ID: ${createdPinId}`);
          break;
        }
        const currentUrl = page.url();
        if (currentUrl.includes('/pin/')) {
          const m = currentUrl.match(/\/pin\/(\d+)/);
          if (m && m[1]) {
            createdPinId = m[1];
            confirmed = true;
            log(`🎉 Pinterest redirected to pin page! Pin ID: ${createdPinId}`);
            break;
          }
        }
        
        // Comprehensive check for Pinterest success toast / notification / modal
        const toasts = await page.$$eval('[role="alert"], [data-test-id*="toast"], div[class*="toast"], div[class*="alert"]', els => els.map(e => (e.innerText || '').trim())).catch(() => []);
        const successToast = toasts.find(t => 
          t.includes('Сохранено на доске') || 
          t.includes('Вы создали пин') || 
          t.includes('Pin created') || 
          t.includes('Saved to') ||
          t.includes('создан')
        );
        if (successToast) {
          log(`🎉 Pinterest confirmed pin creation via toast: "${successToast}" at ${i * 1.5}s!`);
          confirmed = true;
          break;
        }

        const modal = await page.$('text="Вы создали пин", [aria-label="Вы создали пин"], button:has-text("Открыть пин"), text="Сохранено на доске", text="Pin created", a[href*="/pin/"]');
        if (modal) {
          log(`🎉 Pinterest confirmed pin creation via modal/link at ${i * 1.5}s!`);
          confirmed = true;
          break;
        }
      }

      if (!confirmed) {
        const failPath = path.join(CONFIG.pinsOutputDir, `failed_publish_${item.slug}.png`);
        await page.screenshot({ path: failPath, fullPage: true }).catch(() => {});
        throw new Error(`CRITICAL: Pinterest did NOT confirm pin creation for "${item.slug}". Screenshot saved to ${failPath}. Aborting to prevent ghost published status.`);
      }

            const pinDirectUrl = createdPinId ? `https://www.pinterest.com/pin/${createdPinId}/` : 'published';
      item.status = 'published';
      item.pinUrl = pinDirectUrl;
      item.publishedAt = new Date().toISOString();
      item.attempts += 1;
      this.saveQueue();

      // Sync stateFile (.antigravity/pinterest_state.json)
      try {
        const state = fs.existsSync(CONFIG.stateFile)
          ? JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'))
          : { published: {}, lastRunAt: null, dailyCount: 0, lastDailyReset: new Date().toDateString() };
        state.published = state.published || {};
        const pubKey = item.key || item.slug;
        state.published[pubKey] = {
          publishedAt: item.publishedAt,
          title: item.title,
          pinUrl: pinDirectUrl,
          board: targetBoard || CONFIG.boardName,
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

  const renderIdx = args.indexOf('--render');
  if (renderIdx !== -1 && args[renderIdx + 1]) {
    const targetSlug = args[renderIdx + 1];
    const item = manager.queue.find(i => i.slug === targetSlug);
    if (!item) {
      log(`Slug "${targetSlug}" not found in queue!`);
      return;
    }
    await manager.renderPinCreative(item);
    log(`Rendered creative for ${targetSlug}: ${item.creativePath}`);
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
  cleanHeadlineForPin,
  wrapHeadline,
  selectDatingScenario,
  extractKeyTakeaways,
  escapeXml,
};

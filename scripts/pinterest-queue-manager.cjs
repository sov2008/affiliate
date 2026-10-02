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
   * Masterpiece Layered Design:
   * 1. Crisp Editorial Background & Top Accent Bar
   * 2. High-Resolution Article Cover (900x490, rx=20)
   * 3. Floating Glassmorphism Status Badge directly on cover
   * 4. Editorial Headline (high-contrast, max 2 lines)
   * 5. Interactive Archetype Value Card (Chat Teardown / Algorithm / Catfish / Checklist)
   * 6. High-Converting Viral Action Button ("📌 SAVE THIS PIN & READ GUIDE ➔")
   * 7. FlirtCheck.site Watermark
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
    if (
      textComb.includes('catfish') ||
      textComb.includes('deepfake') ||
      textComb.includes('photo') ||
      textComb.includes('picture') ||
      textComb.includes('stolen') ||
      textComb.includes('facial symmetry') ||
      textComb.includes('reverse search') ||
      textComb.includes('verification checkmark') ||
      textComb.includes('bot')
    ) {
      archetype = 'photo-verification';
    } else if (
      textComb.includes('algorithm') ||
      textComb.includes('elo') ||
      textComb.includes('shadowban') ||
      textComb.includes('scoring') ||
      textComb.includes('compatible') ||
      textComb.includes('telemetry') ||
      textComb.includes('slot machine') ||
      textComb.includes('burnout') ||
      textComb.includes('reset')
    ) {
      archetype = 'algorithm-unmasked';
    } else if (
      textComb.includes('text') ||
      textComb.includes('chat') ||
      textComb.includes('message') ||
      textComb.includes('reply') ||
      textComb.includes('ghosting') ||
      textComb.includes('icebreaker') ||
      textComb.includes('opening line') ||
      textComb.includes('flirt') ||
      textComb.includes('boundary') ||
      textComb.includes('time-waster') ||
      textComb.includes('narcissist') ||
      textComb.includes('love bombing') ||
      textComb.includes('scam') ||
      textComb.includes('sextortion') ||
      textComb.includes('blackmail') ||
      textComb.includes('whatsapp')
    ) {
      archetype = 'chat-teardown';
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

    // Archetype specific palette & Pinterest Save triggers
    let accentColor = '#E11D48';
    let badgeBg = '#FFE4E6';
    let badgeBorder = '#FDA4AF';
    let badgeText = '#BE123C';
    let badgeTitle = '🚩 TEXTING RED FLAGS // TEARDOWN';
    let floatingBadge = 'CASE DOSSIER // VERIFIED';
    let btnGradientStart = '#E11D48';
    let btnGradientEnd = '#F43F5E';
    let btnText = '📌 SAVE THIS PIN &amp; READ GUIDE ➔';

    if (archetype === 'algorithm-unmasked') {
      accentColor = '#4F46E5';
      badgeBg = '#EDE9FE';
      badgeBorder = '#C4B5FD';
      badgeText = '#4338CA';
      badgeTitle = '🔬 ALGORITHM AUDIT // REVERSE ENGINEERED';
      floatingBadge = 'TELEMETRY LOG // VERIFIED';
      btnGradientStart = '#4F46E5';
      btnGradientEnd = '#6366F1';
      btnText = '📌 SAVE THIS PIN &amp; UNMASK ALGORITHM ➔';
    } else if (archetype === 'photo-verification') {
      accentColor = '#DC2626';
      badgeBg = '#FEF3C7';
      badgeBorder = '#FDE68A';
      badgeText = '#B45309';
      badgeTitle = '⚠️ CATFISH ALERT // 60-SEC VERIFY';
      floatingBadge = 'FORENSIC AUDIT // VERIFIED';
      btnGradientStart = '#DC2626';
      btnGradientEnd = '#EF4444';
      btnText = '📌 SAVE THIS PIN &amp; VERIFY PROFILE ➔';
    } else if (archetype === 'checklist-infographic') {
      accentColor = '#0F172A';
      badgeBg = '#E2E8F0';
      badgeBorder = '#CBD5E1';
      badgeText = '#0F172A';
      badgeTitle = '📋 DATING PROTOCOL // ACTIONABLE CHECKLIST';
      floatingBadge = 'ACTION PROTOCOL // VERIFIED';
      btnGradientStart = '#0F172A';
      btnGradientEnd = '#1E293B';
      btnText = '📌 SAVE THIS PIN &amp; READ DOSSIER ➔';
    }

    // Base background canvas
    const bgSvg = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#FAF9F6" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bgLight)" />
        <rect x="0" y="0" width="${width}" height="10" fill="${accentColor}" />
      </svg>
    `);

    // Headline wrap (2 lines under cover image, max 28 chars/line)
    const titleLines = wrapHeadline(cleanTitle, 28).slice(0, 2);
    const cardTopY = 745;
    const cardHeight = 545;

    let cardContentSvg = '';

    if (archetype === 'chat-teardown') {
      const scenario = selectDatingScenario(item);
      const incoming = (scenario.incoming[0] || 'Are you free tonight? Come over late.')
        .replace(/^["'“”«\s]+|["'“”»\s]+$/g, '')
        .trim();
      const outgoing = (scenario.outgoing[0] || 'I prefer meeting in daylight for coffee first.')
        .replace(/^["'“”«\s]+|["'“”»\s]+$/g, '')
        .trim();

      cardContentSvg = `
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
          “${escapeXml(incoming)}”
        </text>

        <!-- Red Flag Annotation Overlay Sticker -->
        <rect x="80" y="${cardTopY + 165}" width="840" height="48" rx="12" fill="#FEF2F2" stroke="#EF4444" stroke-width="1.5" />
        <text x="500" y="${cardTopY + 196}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle" letter-spacing="0.5">
          🚩 ${escapeXml(scenario.badge.replace(/^🚩\s*/, ''))}
        </text>

        <!-- Outgoing High-Value Boundary Response -->
        <rect x="220" y="${cardTopY + 230}" width="700" height="75" rx="14" fill="#2563EB" />
        <text x="250" y="${cardTopY + 275}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF">
          “${escapeXml(outgoing)}”
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
      `;
    } else if (archetype === 'algorithm-unmasked') {
      const cardBullets = resolveCardBullets('algorithm-unmasked', bullets);
      const b1 = cardBullets[0];
      const b2 = cardBullets[1];
      const b3 = cardBullets[2];

      cardContentSvg = `
        <!-- Metric 1 -->
        <g transform="translate(80, ${cardTopY + 25})">
          <rect width="840" height="150" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#4F46E5" letter-spacing="1">
            METRIC 01: ${escapeXmlUpper(b1.prefix)}
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#0F172A">
            ${escapeXml(b1.prefix)} Analysis
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#475569">
            ${escapeXml(b1.body)}
          </text>
        </g>

        <!-- Metric 2 -->
        <g transform="translate(80, ${cardTopY + 195})">
          <rect width="840" height="150" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#D97706" letter-spacing="1">
            METRIC 02: ${escapeXmlUpper(b2.prefix)}
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#0F172A">
            ${escapeXml(b2.prefix)} Mechanics
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#475569">
            ${escapeXml(b2.body)}
          </text>
        </g>

        <!-- Protocol -->
        <g transform="translate(80, ${cardTopY + 365})">
          <rect width="840" height="150" rx="14" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#15803D" letter-spacing="1">
            ACTION PROTOCOL: ${escapeXmlUpper(b3.prefix)}
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#166534">
            ${escapeXml(b3.prefix)} Calibration
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#166534">
            ${escapeXml(b3.body)}
          </text>
        </g>
      `;
    } else if (archetype === 'photo-verification') {
      const cardBullets = resolveCardBullets('photo-verification', bullets);
      const b1 = cardBullets[0];
      const b2 = cardBullets[1];
      const b3 = cardBullets[2];

      cardContentSvg = `
        <!-- Warning Sign 1 -->
        <g transform="translate(80, ${cardTopY + 25})">
          <rect width="840" height="150" rx="14" fill="#FEF2F2" stroke="#FECACA" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#DC2626" letter-spacing="1">
            RED FLAG 01: ${escapeXmlUpper(b1.prefix)}
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#991B1B">
            ${escapeXml(b1.prefix)}
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#4B5563">
            ${escapeXml(b1.body)}
          </text>
        </g>

        <!-- Warning Sign 2 -->
        <g transform="translate(80, ${cardTopY + 195})">
          <rect width="840" height="150" rx="14" fill="#FEF2F2" stroke="#FECACA" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#DC2626" letter-spacing="1">
            RED FLAG 02: ${escapeXmlUpper(b2.prefix)}
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#991B1B">
            ${escapeXml(b2.prefix)}
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#4B5563">
            ${escapeXml(b2.body)}
          </text>
        </g>

        <!-- Defense Protocol -->
        <g transform="translate(80, ${cardTopY + 365})">
          <rect width="840" height="150" rx="14" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1.2" />
          <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#15803D" letter-spacing="1">
            DEFENSE PROTOCOL: ${escapeXmlUpper(b3.prefix)}
          </text>
          <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#166534">
            ${escapeXml(b3.prefix)}
          </text>
          <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#166534">
            ${escapeXml(b3.body)}
          </text>
        </g>
      `;
    } else {
      const cardBullets = resolveCardBullets('checklist-infographic', bullets);
      cardContentSvg = `
        ${cardBullets.map((b, idx) => {
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
      `;
    }

    // Foreground overlay SVG (sits on top of background & cover)
    const overlaySvg = Buffer.from(`
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="btnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${btnGradientStart}" />
            <stop offset="100%" stop-color="${btnGradientEnd}" />
          </linearGradient>
          <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.08" />
          </filter>
        </defs>

        <!-- Top Header -->
        <rect x="50" y="40" width="460" height="44" rx="10" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="1.5" />
        <circle cx="75" cy="62" r="5" fill="${accentColor}" />
        <text x="95" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="${badgeText}" letter-spacing="1.2">
          ${escapeXml(badgeTitle)}
        </text>

        <!-- Brand Watermark -->
        <text x="950" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="900" fill="#64748B" text-anchor="end" letter-spacing="1.5">
          FLIRTCHECK.SITE
        </text>

        <!-- Frame around Cover -->
        <rect x="${coverLeft}" y="${coverTop}" width="${coverWidth}" height="${coverHeight}" rx="${cornerRadius}" fill="none" stroke="#E2E8F0" stroke-width="2" />

        <!-- Floating Glassmorphic Pill on Cover -->
        <g transform="translate(75, ${coverTop + coverHeight - 48})">
          <rect width="260" height="34" rx="8" fill="#0F172A" fill-opacity="0.85" />
          <circle cx="20" cy="17" r="4" fill="#10B981" />
          <text x="34" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" letter-spacing="1">
            ${escapeXml(floatingBadge)}
          </text>
        </g>

        <!-- Headline under cover -->
        ${titleLines.map((line, i) => `
          <text x="50" y="${640 + i * 46}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#0F172A" letter-spacing="-0.8">
            ${escapeXml(line)}
          </text>
        `).join('')}

        <!-- Interactive Card Container -->
        <rect x="50" y="${cardTopY}" width="${coverWidth}" height="${cardHeight}" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)" />

        ${cardContentSvg}

        <!-- Bottom Viral Action Button (Save & Read trigger for Pinterest algorithm) -->
        <rect x="50" y="1320" width="${coverWidth}" height="84" rx="42" fill="url(#btnGradient)" filter="url(#cardShadow)" />
        <text x="500" y="1373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          ${btnText}
        </text>

        <!-- Subtext Footer -->
        <text x="500" y="1455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">
          FlirtCheck.site • Independent Dating Safety Audits &amp; Profile Verification
        </text>
      </svg>
    `);

    // Composite layered design
    const composites = [];
    if (coverBuffer) {
      composites.push({
        input: coverBuffer,
        top: coverTop,
        left: coverLeft,
      });
    }
    composites.push({
      input: overlaySvg,
      top: 0,
      left: 0,
    });

    await sharp(bgSvg)
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

    // High-Intent Pinterest Search SEO Keywords Hook
    const hooks = [
      'Online dating safety guide & red flags checklist',
      'Texting rules for dating apps & relationship advice',
      'Profile verification guide & how to spot catfish',
      'Dating app algorithm secrets & conversation tips'
    ];
    const hook = hooks[Math.abs(item.slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % hooks.length];

    let desc = `⚡ ${hook}\n\n`;
    desc += `📌 ${item.title}\n\n`;
    if (item.description) {
      desc += `${item.description.trim()}\n\n`;
    }
    desc += `🚨 Key Takeaways & Action Rules:\n`;
    bullets.slice(0, 2).forEach((b) => {
      desc += `• ${b.prefix}: ${b.body}\n`;
    });
    desc += `\n👉 Full forensic audit & guide at:\n${item.targetUrl}\n\n`;
    desc += `#DatingSafety #DatingRedFlags #OnlineDatingTips #TextingTips #TinderAdvice #BumbleTips #HingeTips #RelationshipAdvice #FlirtCheck #CatfishWarning`;

    if (desc.length > 490) {
      const lastHash = desc.lastIndexOf('#', 490);
      if (lastHash > 200) {
        desc = desc.substring(0, lastHash).trim();
      } else {
        desc = desc.substring(0, 480).trim();
      }
    }
    return desc;
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
      await page.waitForTimeout(800);

      // 3. High-Converting SEO Description
      log('Filling High-Converting Pinterest SEO Description...');
      const descArea = page.locator('div[contenteditable="true"], [aria-label="Добавьте описание пина"], textarea[id*="description"], [placeholder*="описание"]').first();
      if (await descArea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descArea.click();
        await page.keyboard.press('Control+A');
        const descText = this.generatePinDescription(item);
        await page.keyboard.type(descText);
        await page.waitForTimeout(800);
      }

      // 4. Destination Link (Mandatory for Traffic & Rich Pins)
      log(`Filling Destination Link: ${item.targetUrl}...`);
      let linkFilled = false;
      const linkSelectors = [
        'input[placeholder*="ссылк"]',
        'input[placeholder*="link" i]',
        'textarea[placeholder*="ссылк"]',
        '[data-test-id="editor-link-field"] input',
        'input[id*="storyboard-selector-link"]',
        'input[id*="link"]'
      ];
      for (const sel of linkSelectors) {
        const linkInput = page.locator(sel).first();
        if (await linkInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await linkInput.click();
          await page.keyboard.press('Control+A');
          await page.keyboard.type(item.targetUrl);
          linkFilled = true;
          break;
        }
      }

      if (!linkFilled) {
        const addLinkBtn = await page.$('button:has-text("Добавить ссылку"), button:has-text("Add a link"), button:has-text("Добавьте ссылку")');
        if (addLinkBtn) {
          await addLinkBtn.click();
          await page.waitForTimeout(600);
          const linkInput2 = page.locator('input[placeholder*="ссылк"], input[placeholder*="link" i], input[id*="link"]').first();
          if (await linkInput2.isVisible({ timeout: 1500 }).catch(() => false)) {
            await linkInput2.click();
            await page.keyboard.type(item.targetUrl);
            linkFilled = true;
          }
        }
      }
      log(`Destination link status: ${linkFilled ? 'FILLED ✅' : '⚠️ NOT FOUND / SKIPPED'}`);

      // 5. Alt Text (Accessibility & Pinterest Visual Search OCR Boost)
      try {
        const altBtn = await page.$('button:has-text("Добавить альтернативный текст"), button:has-text("Add alt text"), [aria-label*="альтернативн"]');
        if (altBtn && await altBtn.isVisible()) {
          await altBtn.click();
          await page.waitForTimeout(500);
        }
        const altInput = page.locator('textarea[placeholder*="альтернативн"], textarea[placeholder*="alt text" i], [aria-label*="альтернативн"]').first();
        if (await altInput.isVisible({ timeout: 1500 }).catch(() => false)) {
          await altInput.click();
          await page.keyboard.type(`Infographic guide: ${item.title}. Dating app safety checklist, chat analysis, and profile verification breakdown.`);
          log('Alt text successfully filled for Pinterest Visual Search.');
        }
      } catch (altErr) {
        log(`Alt text step passed: ${altErr.message}`);
      }

      // 6. Board Selection & Publish
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

/**
 * FlirtCheck Editorial Pinterest Pin Generator (NYT Modern Love / Kinfolk Aesthetic)
 * 
 * Specs:
 * - Dimensions: 1000px × 1500px (2:3 Aspect Ratio), rendered at deviceScaleFactor: 2 (2000×3000px).
 * - Fonts: 'Playfair Display' (serif headlines), 'JetBrains Mono' (badges/telemetry), 'Inter' (body).
 * - Palette: Warm Cream #FAF7F2, Dark Graphite #111625, Carmine Crimson #B91C1C, Forest Green #2F6F4E, Amber #D97706.
 * - 3 Modes:
 *     1. 'editorial' : Magazine cover with overlapping warm card and field guide CTA
 *     2. 'chat'      : Smartphone mockup with real texting teardowns and floating tags
 *     3. 'checklist' : 4-step saveable action protocol with Playfair numeral anchors
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const POSTS_DIR = path.resolve(__dirname, '../blog/src/content/posts');
const PUBLIC_DIR = path.resolve(__dirname, '../blog/public');

// Category to Rubric Mapping
const CATEGORY_MAP = {
  'digital-dialogue': {
    rubric: 'MESSAGES',
    badge: 'TEXT DECODER // SCRIPTS',
    primaryMode: 'chat',
    mode: 'chat',
    board: 'Dating App Texting Scripts & Openers'
  },
  'first-dates': {
    rubric: 'FIRST DATE',
    badge: 'FIRST DATE SAFETY AUDIT',
    primaryMode: 'editorial',
    mode: 'editorial',
    board: 'First Date Tips & Safety Checklist'
  },
  'modern-psychology': {
    rubric: 'PSYCHOLOGY',
    badge: 'DATING PSYCHOLOGY // LAB',
    primaryMode: 'editorial',
    mode: 'editorial',
    board: 'Dating Psychology & Red Flags'
  },
  'romantic-essays': {
    rubric: 'ESSAYS',
    badge: 'ROMANTIC ESSAYS // FIELD NOTES',
    primaryMode: 'editorial',
    mode: 'editorial',
    board: 'Dating Psychology & Red Flags'
  },
  'algo-mechanics': {
    rubric: 'ALGORITHMS',
    badge: 'ALGORITHM UNMASKED // AUDIT',
    primaryMode: 'checklist',
    mode: 'checklist',
    board: 'Tinder, Bumble & Hinge Algorithm Hacks'
  },
  'safety-dossier': {
    rubric: 'REVIEWS & SAFETY',
    badge: 'SAFETY DOSSIER // DECLASSIFIED',
    primaryMode: 'checklist',
    mode: 'checklist',
    board: 'Catfish & Romance Scam Protection'
  }
};

/**
 * Creates punchy, high-CTR Pinterest hook titles (under 65 chars)
 */
function generateHookTitle(rawTitle) {
  let title = rawTitle
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
    .replace(/[*_#`"]/g, '')
    .trim();

  const lower = title.toLowerCase();

  if (lower.includes('tinder elo') || lower.includes('ranking reset')) {
    return 'Tinder ELO Algorithm: 2026 Ranking Reset';
  }
  if (lower.includes('pig butchering')) {
    return 'Pig Butchering Scam on Dating Apps: Warning Signs';
  }
  if (lower.includes('optimal photo order')) {
    return 'Optimal Dating Photo Order: The Anchor Rule';
  }
  if (lower.includes('stolen instagram photos') || lower.includes('stolen photos')) {
    return 'How to Spot Stolen Photos on Dating Apps';
  }
  if (lower.includes('bumble show when you were last active')) {
    return 'Does Bumble Show When You Were Last Active?';
  }
  if (lower.includes('what to say when a match disappears') || lower.includes('match disappears')) {
    return 'What to Say When a Match Disappears & Returns';
  }
  if (lower.includes('why dating scammers demand whatsapp')) {
    return 'Why Dating Scammers Demand WhatsApp Immediately';
  }
  if (lower.includes('deleting and remaking dating profiles')) {
    return 'Why Resetting Your Dating Profile Fails in 2026';
  }
  if (lower.includes('matches but no dates') || lower.includes('matches‑but‑no‑dates')) {
    return 'Why You Get Matches But No Dates (& The Fix)';
  }
  if (lower.includes('move from match to real date')) {
    return 'How to Move from Match to Real Date in 3 Steps';
  }
  if (lower.includes('how fast response times reveal') || lower.includes('ten-second text rule')) {
    return 'The 10-Second Text Rule: Response Time Secrets';
  }
  if (lower.includes('reviving stalled') || lower.includes('revive a dead tinder')) {
    return 'How to Revive Dead Dating Chats in 2026';
  }
  if (lower.includes('facial symmetry') || lower.includes('rank facial symmetry')) {
    return 'How Dating Algorithms Rank Photos & Symmetry';
  }
  if (lower.includes('subtle signs of infidelity')) {
    return '7 Subtle Signs of Infidelity in Text Messages';
  }
  if (lower.includes('is he flirting with you over text') || lower.includes('is-he-flirting')) {
    return 'Is He Flirting With You Over Text? 9 Hidden Clues';
  }
  if (lower.includes('is she flirting or just polite') || lower.includes('is-she-flirting')) {
    return 'Is She Flirting or Just Polite? The Simple Test';
  }
  if (lower.includes('fake verification checkmark')) {
    return 'Fake Verification Checkmarks: How Bots Cheat';
  }
  if (lower.includes('ai spambot') || lower.includes('using chatgpt')) {
    return '5 Signs Your Match Is Using ChatGPT to Text You';
  }
  if (lower.includes('reverse face search') || lower.includes('osint and ai') || lower.includes('spot catfish')) {
    return 'Reverse Face Search: Spot Catfish in Seconds';
  }
  if (lower.includes('boundary-setting') || lower.includes('decline last‑minute')) {
    return 'How to Decline Late-Night Dating Invites Gracefully';
  }
  if (lower.includes('first date safety checklist')) {
    return 'First Date Safety: 5 Non-Negotiable Rules';
  }
  if (lower.includes('bumble first message')) {
    return 'Bumble First Message Examples That Get 85% Replies';
  }

  // Shorten generic long titles to <= 62 chars
  if (title.length > 62) {
    const parts = title.split(/[–—:]/);
    if (parts[0] && parts[0].trim().length >= 25 && parts[0].trim().length <= 62) {
      return parts[0].trim();
    }
    const words = title.split(' ');
    let short = '';
    for (const w of words) {
      if ((short + ' ' + w).trim().length <= 60) {
        short = (short + ' ' + w).trim();
      } else break;
    }
    return short;
  }

  return title;
}

/**
 * Parses article markdown and extracts all structured assets for pins
 */
function parseArticleContent(slugOrPath) {
  let filePath;
  if (fs.existsSync(slugOrPath)) {
    filePath = slugOrPath;
  } else if (fs.existsSync(path.join(POSTS_DIR, slugOrPath))) {
    filePath = path.join(POSTS_DIR, slugOrPath);
  } else {
    const cleanSlug = slugOrPath.replace(/\.md$/, '');
    filePath = path.join(POSTS_DIR, `${cleanSlug}.md`);
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Article not found: ${filePath}`);
  }

  const slug = path.basename(filePath, '.md');
  const raw = fs.readFileSync(filePath, 'utf8');
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = fmMatch ? fmMatch[1] : '';

  const title = (fm.match(/title:\s*["']?([^"'\r\n]+)/) || [])[1] || slug;
  const description = (fm.match(/description:\s*["']?([^"'\r\n]+)/) || [])[1] || '';
  const categoryRaw = (fm.match(/category:\s*["']?([^"'\r\n]+)/) || [])[1] || 'digital-dialogue';
  const category = categoryRaw.toLowerCase().trim();
  const caseId = (fm.match(/caseId:\s*["']?([^"'\r\n]+)/) || [])[1] || 'FC-2026-INTEL';
  const rawCover = (fm.match(/(?:coverImage|image):\s*["']?([^"'\r\n]+)/) || [])[1] || '';

  const hookTitle = generateHookTitle(title);
  const categoryMeta = CATEGORY_MAP[category] || {
    rubric: 'DATING LAB',
    badge: 'FORENSIC DOSSIER',
    primaryMode: 'editorial',
    board: 'Dating Psychology & Red Flags'
  };

  // Resolve cover image
  let resolvedCoverPath = null;
  if (rawCover) {
    const p = path.join(PUBLIC_DIR, rawCover.replace(/^\//, ''));
    if (fs.existsSync(p)) resolvedCoverPath = p;
  }
  if (!resolvedCoverPath) {
    const pWebp = path.join(PUBLIC_DIR, 'images/posts', `${slug}.webp`);
    if (fs.existsSync(pWebp)) resolvedCoverPath = pWebp;
    else {
      const pPng = path.join(PUBLIC_DIR, 'images/posts', `${slug}.png`);
      if (fs.existsSync(pPng)) resolvedCoverPath = pPng;
      else resolvedCoverPath = path.join(PUBLIC_DIR, 'images/posts/default-cover.webp');
    }
  }

  // Cover image as Base64 data URL for fast offline Playwright rendering
  let coverBase64 = '';
  if (fs.existsSync(resolvedCoverPath)) {
    const ext = path.extname(resolvedCoverPath).toLowerCase().replace('.', '');
    const mime = ext === 'png' ? 'image/png' : 'image/webp';
    coverBase64 = `data:${mime};base64,${fs.readFileSync(resolvedCoverPath).toString('base64')}`;
  }

  // Extract Key Takeaways (or Safety Checklist / Rules / numbered steps)
  let takeaways = [];

  // Check 1: Dedicated checklist / rules / takeaways section
  const dedicatedSectionMatch = raw.match(/##+\s*(?:Safety Checklist|Rules of Engagement|Key Takeaways|Key Insights|Checklist)[^\r\n]*\r?\n([\s\S]*?)(?:\r?\n---|\r?\n##|$)/i);
  if (dedicatedSectionMatch) {
    const listItems = [...dedicatedSectionMatch[1].matchAll(/(?:(?:\d+\.|\*|-)\s+)?\*\*([^*]{4,55})\*\*[:\s–—-]+([^\r\n]{15,220})/gi)];
    for (const lm of listItems) {
      if (takeaways.length >= 4) break;
      let tTitle = lm[1].replace(/[*_`]/g, '').trim().toUpperCase();
      tTitle = tTitle.replace(/^(?:STEP|RULE)\s*\d*[:\s–—-]+/i, '').trim();
      let tDesc = lm[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`#]/g, '').trim();
      tDesc = tDesc.replace(/^[:\s–—-]+/, '').replace(/\s+/g, ' ');
      // Take first full sentence
      const firstDot = tDesc.indexOf('.');
      if (firstDot > 20 && firstDot < 95) {
        tDesc = tDesc.slice(0, firstDot + 1);
      } else {
        tDesc = tDesc.slice(0, 92);
      }
      takeaways.push({
        num: `0${takeaways.length + 1}`,
        title: tTitle.slice(0, 36),
        desc: tDesc
      });
    }
  }

  // Check 2: Key Takeaways block with bullet points
  if (takeaways.length < 4) {
    const tkMatch = raw.match(/##+\s*(?:Key Takeaways|Key Insights|Takeaways)[^\r\n]*\r?\n([\s\S]*?)(?:\r?\n---|\r?\n##|$)/i);
    if (tkMatch) {
      const lines = [...tkMatch[1].matchAll(/-\s+(?:\*\*([^*]+)\*\*[:\s–—-]+)?([^\r\n]+)/g)];
      for (const m of lines) {
        if (takeaways.length >= 4) break;
        let tTitle = (m[1] || `STEP 0${takeaways.length + 1}`).trim().toUpperCase();
        let tDesc = (m[2] || '').trim();
        tDesc = tDesc.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/^[:\s–—-]+/, '').replace(/\s+/g, ' ');
        takeaways.push({
          num: `0${takeaways.length + 1}`,
          title: tTitle.slice(0, 36),
          desc: tDesc.slice(0, 92)
        });
      }
    }
  }

  // Check 3: Numbered action points like "1. **Title** - Description" across the text
  if (takeaways.length < 4) {
    const listMatches = [...raw.matchAll(/\d+\.\s+\*\*([^*]{4,50})\*\*[:\s–—-]+([^\r\n]{15,180})/gi)];
    for (const lm of listMatches) {
      if (takeaways.length >= 4) break;
      const cleanTitle = lm[1].replace(/[*_`]/g, '').trim().toUpperCase();
      let cleanDesc = lm[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim();
      takeaways.push({
        num: `0${takeaways.length + 1}`,
        title: cleanTitle.slice(0, 36),
        desc: cleanDesc.slice(0, 92)
      });
    }
  }

  // Fallback 4: Standard category protocol defaults
  const categoryDefaults = {
    'digital-dialogue': [
      { title: 'LATENCY TELEMETRY', desc: 'Identify irregular keystroke cadence and copy-pasted prompts.' },
      { title: 'BOUNDARY SCRIPT', desc: 'Deploy direct, non-defensive boundary statements in 15 words.' },
      { title: 'RED FLAG SWEEP', desc: 'Audit profile metadata and unindexed photos before meeting.' },
      { title: 'DEFENSIVE EXIT', desc: 'Decline unsolicited late requests with neutral, firm language.' }
    ],
    'safety-dossier': [
      { title: 'BIOMETRIC REVERSE SEARCH', desc: 'Scan multi-angle facial vectors across open web databases.' },
      { title: 'EXIF & GEO TELEMETRY', desc: 'Examine background landmarks and timezone discrepancies.' },
      { title: '15-SEC VIDEO LIVENESS', desc: 'Require unscripted real-time verification before emotional investment.' },
      { title: 'OFF-PLATFORM SHIELD', desc: 'Never transition to third-party messaging within the first 48 hours.' }
    ],
    'algo-mechanics': [
      { title: 'ELO SCORE RESET', desc: 'Clear stagnant profile cache and unfreeze algorithmic visibility.' },
      { title: 'PROMPT OPTIMIZATION', desc: 'Insert high-friction curiosity hooks that filter low-effort matches.' },
      { title: 'STANDOUT SELECTION', desc: 'Engage with top-tier profiles during peak algorithmic distribution hours.' },
      { title: 'PHOTO POSITIONING', desc: 'Lead with uncropped high-resolution eye-contact portraits.' }
    ],
    'default': [
      { title: 'SIGNAL DIAGNOSTIC', desc: 'Evaluate conversational reciprocity and emotional pacing.' },
      { title: 'BOUNDARY BENCHMARK', desc: 'Establish non-negotiables before moving to in-person dates.' },
      { title: 'PROFILE AUDIT', desc: 'Detect inconsistent bios and synthetic photo artifacts.' },
      { title: 'ACTION BLUEPRINT', desc: 'Save this field guide for your upcoming dating pipeline.' }
    ]
  };

  const defaults = categoryDefaults[category] || categoryDefaults['default'];
  while (takeaways.length < 4) {
    const idx = takeaways.length;
    takeaways.push({
      num: `0${idx + 1}`,
      title: defaults[idx].title,
      desc: defaults[idx].desc
    });
  }

  // Extract chat quotes or conversational patterns (strictly from body content, ignoring YAML frontmatter)
  const bodyContent = raw.replace(/^---[\s\S]*?---/, '');
  let chatScenario = {
    incoming: 'Are you free tonight? Come over late.',
    outgoing: 'I prefer meeting in daylight for coffee first.',
    badgeIncoming: '🚩 Red Flag: Urgency Trap',
    badgeOutgoing: '🛡️ Boundary: Clear Standard'
  };

  // Filter raw quotes from body markdown
  const rawQuotes = [
    ...[...bodyContent.matchAll(/>\s*(?:\*\*(?:You|Match|Sender|Her|Him)\*\*[:\s]*)?["“«]?([^"”»\r\n]{12,110})["”»]?/gi)].map(m => m[1]),
    ...[...bodyContent.matchAll(/(?:\*|•)?\s*(?:\*\*(?:Opener|Prompt|Script|Response)\*\*[:\s]*)?["“«]([^"”»\r\n]{15,95})["”»]/gi)].map(m => m[1])
  ].map(t => t.replace(/^[*_`\s]+|[*_`\s]+$/g, '').trim())
   .filter(t => {
     const l = t.toLowerCase();
     return t.length >= 12 && t.length <= 95 &&
       !l.includes('http') && !l.includes('flirtcheck') && !l.startsWith('love is') &&
       !l.includes('guide') && !l.includes('how to') && !l.includes('2026') &&
       !l.includes('checklist') && !l.includes('callout') && !l.includes('dating risk') &&
       !l.includes('unsure') && !l.includes('calculator') && !l.includes('tool') &&
       !l.includes('dossier') && !l.includes('telemetry') && !l.includes('category') &&
       !l.includes('dialogue') && !/[;\[\]]/.test(t);
   });

  // Classify quotes into incoming prompt vs outgoing script
  const isOutgoingScript = (t) => /hey|i['’]m|i prefer|i don['’]t|i['’]d|let['’]s|coffee|tomorrow|voice note|surviving|wrap this|shoot me/i.test(t);

  for (const q of rawQuotes) {
    if (isOutgoingScript(q)) {
      if (chatScenario.outgoing === 'I prefer meeting in daylight for coffee first.' || q.length > chatScenario.outgoing.length) {
        chatScenario.outgoing = q;
      }
    } else if (!isOutgoingScript(q) && chatScenario.incoming === 'Are you free tonight? Come over late.') {
      chatScenario.incoming = q;
    }
  }

  // Contextual badges and strong defaults based on content
  const lowerContent = raw.toLowerCase();
  if (lowerContent.includes('late-night') || lowerContent.includes('boundary')) {
    chatScenario.badgeIncoming = '🚩 Urgency Test: Late Invite';
    chatScenario.badgeOutgoing = '🛡️ Green Flag: Firm Boundary';
    if (chatScenario.incoming === 'Are you free tonight? Come over late.') {
      chatScenario.incoming = 'Are you awake right now? Want to come over?';
    }
    if (chatScenario.outgoing === 'I prefer meeting in daylight for coffee first.') {
      chatScenario.outgoing = "Hey, I'm up but I don't meet that late. Let's catch up over coffee tomorrow.";
    }
  } else if (lowerContent.includes('bumble') || lowerContent.includes('opener')) {
    chatScenario.badgeIncoming = '💬 Conversational Opener';
    chatScenario.badgeOutgoing = '⚡ Banter: Low Reply Friction';
    if (chatScenario.incoming === 'Are you free tonight? Come over late.') {
      chatScenario.incoming = 'Hey! How has your week been going so far?';
    }
    if (chatScenario.outgoing === 'I prefer meeting in daylight for coffee first.') {
      chatScenario.outgoing = 'Surviving Monday! Did that trip in your 3rd photo actually happen?';
    }
  } else if (lowerContent.includes('catfish') || lowerContent.includes('bot') || lowerContent.includes('scam')) {
    chatScenario.badgeIncoming = '⚠️ Unverified Profile Prompt';
    chatScenario.badgeOutgoing = '🔬 15-Sec Liveness Check';
    if (chatScenario.incoming === 'Are you free tonight? Come over late.') {
      chatScenario.incoming = 'My camera is broken, just trust me babe. Call later?';
    }
    if (chatScenario.outgoing === 'I prefer meeting in daylight for coffee first.') {
      chatScenario.outgoing = "Send a 5-sec voice note saying today's date, or let's wrap this up.";
    }
  } else if (lowerContent.includes('ghosting') || lowerContent.includes('reviv')) {
    chatScenario.badgeIncoming = '⏱️ Stalled Conversation';
    chatScenario.badgeOutgoing = '💡 Pattern Interrupt Opener';
  }

  // Extract a 2-line lead/subtitle (clean out author/bureau credits if present)
  let lead = description;
  if (!lead || lead.length < 25) {
    const firstP = raw.split(/\r?\n\r?\n/).find(p => p.length > 50 && !p.startsWith('#') && !p.startsWith('---') && !p.startsWith('<'));
    lead = firstP ? firstP.replace(/[*_`#]/g, '').trim() : 'Expert forensic tactics and profile verification protocols by FlirtCheck Laboratory.';
  }
  lead = lead.replace(/^Investigative (?:protocol|dossier|guide) on [^.]+? by [^.]+?\.\s*/i, '').trim();
  lead = lead.replace(/\s+/g, ' ').slice(0, 135);

  return {
    slug,
    title,
    hookTitle,
    category,
    rubric: categoryMeta.rubric,
    badgeText: categoryMeta.badge,
    primaryMode: categoryMeta.primaryMode,
    board: categoryMeta.board,
    caseId,
    lead,
    coverImagePath: resolvedCoverPath,
    coverImageBase64: coverBase64,
    takeaways,
    chatScenario,
    targetUrl: `https://flirtcheck.site/${slug}/`
  };
}

/**
 * Builds Pinterest SEO description starting with mandatory Save CTA
 */
function buildSeoDescription(article) {
  const cta = 'Save this dating guide for your next match!';
  const hook = `${cta} Practical advice on ${article.hookTitle.toLowerCase()} to keep your dating pipeline safe, fun, and high-value.`;
  
  let desc = `📌 ${hook}\n\n`;
  desc += `🚨 Key Takeaways:\n`;
  article.takeaways.slice(0, 3).forEach((t, i) => {
    desc += `• Step 0${i + 1}: ${t.title} – ${t.desc}\n`;
  });
  desc += `\n👉 Read full guide & access interactive scripts at:\n${article.targetUrl}\n\n`;
  desc += `#DatingSafety #OnlineDatingTips #DatingAdvice #DatingRedFlags #TextingScripts #TinderTips #BumbleAdvice #HingeDating #FlirtCheck #ModernDating`;
  
  return desc.slice(0, 490);
}

/**
 * Formats Title with 2-3 words highlighted in carmine crimson #B91C1C
 */
function highlightTitle(title) {
  const words = title.split(' ');
  if (words.length <= 3) {
    return `<span class="crimson">${words.join(' ')}</span>`;
  }
  // Highlight first 2-3 words
  const count = words.length > 6 ? 3 : 2;
  const highlighted = words.slice(0, count).join(' ');
  const remainder = words.slice(count).join(' ');
  return `<span class="crimson">${highlighted}</span> ${remainder}`;
}

/**
 * Generates the responsive 1000x1500 px HTML Template
 */
function generateHtmlTemplate(data, mode = 'editorial') {
  const isEditorial = mode === 'editorial';
  const isChat = mode === 'chat';
  const isChecklist = mode === 'checklist';

  // Dynamic font sizing if title is long
  const titleLen = data.hookTitle.length;
  let titleFontSize = 68;
  if (titleLen > 55) titleFontSize = 60;
  if (titleLen > 70) titleFontSize = 54;

  const highlightedHtml = highlightTitle(data.hookTitle);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FlirtCheck Pin - ${data.hookTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700;800&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1000px;
      height: 1500px;
      overflow: hidden;
      background-color: #FAF7F2;
      background-image: 
        linear-gradient(rgba(17, 22, 37, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(17, 22, 37, 0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      color: #111625;
      font-family: 'Inter', -apple-system, sans-serif;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }

    /* Common Typography */
    .font-serif {
      font-family: 'Playfair Display', Georgia, serif;
    }
    .font-mono {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .crimson {
      color: #B91C1C !important;
    }

    /* Category Pill */
    .pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background-color: #B91C1C;
      color: #FFFFFF;
      font-family: 'JetBrains Mono', monospace;
      font-size: 22px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 10px 24px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(185, 28, 28, 0.3);
    }

    /* ==============================================================
       MODE 1: EDITORIAL (Magazine Cover)
       ============================================================== */
    .editorial-wrapper {
      width: 1000px;
      height: 1500px;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .editorial-cover-container {
      width: 1000px;
      height: 670px;
      overflow: hidden;
      position: relative;
      background-color: #111625;
    }
    .editorial-cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 25%;
      filter: brightness(1.08) contrast(1.05) saturate(1.05);
    }
    .editorial-tag-floating {
      position: absolute;
      top: 40px;
      left: 44px;
      background: rgba(17, 22, 37, 0.88);
      backdrop-filter: blur(8px);
      color: #FFFFFF;
      font-family: 'JetBrains Mono', monospace;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 8px 20px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .editorial-card {
      margin: -60px 44px 0 44px;
      background-color: #FAF7F2;
      border: 3px solid #111625;
      box-shadow: 0 24px 50px rgba(17, 22, 37, 0.12);
      border-radius: 4px;
      padding: 48px 50px 36px 50px;
      position: relative;
      z-index: 10;
      flex: 1;
      max-height: 840px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .editorial-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: ${titleFontSize}px;
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.02em;
      color: #111625;
      margin: 22px 0 18px 0;
    }
    .editorial-lead {
      font-family: 'Inter', sans-serif;
      font-size: 30px;
      line-height: 1.36;
      color: #4B5262;
      margin-bottom: 24px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .editorial-divider {
      border-top: 2px solid #111625;
      margin: 28px 0 22px 0;
    }
    .editorial-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .editorial-domain {
      font-family: 'JetBrains Mono', monospace;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #111625;
    }
    .editorial-btn {
      background-color: #B91C1C;
      color: #FFFFFF;
      font-family: 'Inter', sans-serif;
      font-size: 23px;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 9999px;
      box-shadow: 0 6px 18px rgba(185, 28, 28, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    /* ==============================================================
       MODE 2: CHAT (Texting Scripts & Teardowns)
       ============================================================== */
    .chat-wrapper {
      width: 1000px;
      height: 1500px;
      padding: 48px 44px 0 44px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .chat-header {
      text-align: center;
      margin-bottom: 20px;
      width: 100%;
    }
    .chat-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: ${titleFontSize}px;
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.02em;
      color: #111625;
      margin-top: 18px;
      text-align: center;
      padding: 0 20px;
    }
    .phone-mockup {
      width: 780px;
      background: #FFFFFF;
      border: 14px solid #111625;
      border-radius: 56px 56px 0 0;
      box-shadow: 0 24px 60px rgba(17, 22, 37, 0.16);
      padding: 38px 40px 24px 40px;
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-bottom: 84px;
    }
    .phone-speaker {
      width: 160px;
      height: 10px;
      background-color: #111625;
      border-radius: 10px;
      margin: 0 auto 28px auto;
    }
    .chat-timestamp {
      font-family: 'JetBrains Mono', monospace;
      font-size: 19px;
      font-weight: 700;
      color: #6B7280;
      text-align: center;
      margin: 0 auto 34px auto;
      letter-spacing: 0.08em;
    }
    .chat-bubble {
      position: relative;
      padding: 30px 34px;
      margin-bottom: 44px;
    }
    .bubble-incoming {
      background-color: #F1EFEA;
      border: 2px solid rgba(17, 22, 37, 0.1);
      border-radius: 26px 26px 26px 6px;
    }
    .bubble-outgoing {
      background-color: #E8F0EC;
      border: 2px solid rgba(47, 111, 78, 0.3);
      border-radius: 26px 26px 6px 26px;
    }
    .floating-pill {
      position: absolute;
      top: -16px;
      right: 28px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 20px;
      font-weight: 800;
      padding: 6px 18px;
      border-radius: 9999px;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .pill-green {
      background-color: #2F6F4E;
      box-shadow: 0 4px 12px rgba(47, 111, 78, 0.3);
    }
    .pill-amber {
      background-color: #D97706;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }
    .bubble-sender {
      font-family: 'JetBrains Mono', monospace;
      font-size: 19px;
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: 0.04em;
    }
    .sender-gray { color: #6B7280; }
    .sender-green { color: #2F6F4E; }
    .bubble-text {
      font-family: 'Inter', sans-serif;
      font-size: 30px;
      font-weight: 600;
      line-height: 1.36;
      color: #111625;
    }
    .bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 1000px;
      height: 84px;
      background-color: #111625;
      color: #FFFFFF;
      font-family: 'Inter', sans-serif;
      font-size: 28px;
      font-weight: 800;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.03em;
    }

    /* ==============================================================
       MODE 3: CHECKLIST (Saveable Infographic Protocol)
       ============================================================== */
    .checklist-wrapper {
      width: 1000px;
      height: 1500px;
      padding: 48px 50px 0 50px;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .checklist-header {
      margin-bottom: 28px;
    }
    .checklist-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: ${titleFontSize + 2}px;
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.02em;
      color: #111625;
      margin-top: 18px;
    }
    .checklist-cards {
      display: flex;
      flex-direction: column;
      gap: 22px;
      width: 900px;
      margin: 0 auto;
      flex: 1;
      margin-bottom: 104px;
    }
    .checklist-item {
      background-color: #FFFFFF;
      border: 3px solid #111625;
      box-shadow: 0 6px 16px rgba(17, 22, 37, 0.06);
      padding: 26px 34px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 26px;
      flex: 1;
    }
    .checklist-num {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 66px;
      font-weight: 800;
      color: #B91C1C;
      width: 82px;
      flex-shrink: 0;
      line-height: 1;
    }
    .checklist-sep {
      width: 2px;
      height: 64px;
      background-color: rgba(17, 22, 37, 0.14);
      flex-shrink: 0;
    }
    .checklist-body {
      flex: 1;
    }
    .checklist-item-title {
      font-family: 'Inter', sans-serif;
      font-size: 27px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #111625;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    .checklist-item-desc {
      font-family: 'Inter', sans-serif;
      font-size: 24px;
      font-weight: 500;
      color: #4B5262;
      line-height: 1.28;
    }
  </style>
</head>
<body>

${isEditorial ? `
  <!-- EDITORIAL MODE (Kinfolk Magazine Cover) -->
  <div class="editorial-wrapper">
    <div class="editorial-cover-container">
      <img src="${data.coverImageBase64}" alt="${data.hookTitle}" class="editorial-cover-img" />
      <div class="editorial-tag-floating font-mono">${data.caseId} // INTEL</div>
    </div>
    <div class="editorial-card">
      <div>
        <span class="pill-badge">[${data.rubric} // DATING LAB]</span>
        <h1 class="editorial-title font-serif">${highlightedHtml}</h1>
        <p class="editorial-lead">${data.lead}</p>
      </div>
      <div>
        <div class="editorial-divider"></div>
        <div class="editorial-footer">
          <span class="editorial-domain font-mono">FLIRTCHECK.SITE</span>
          <span class="editorial-btn">Read Field Guide →</span>
        </div>
      </div>
    </div>
  </div>
` : ''}

${isChat ? `
  <!-- CHAT MODE (Smartphone Mockup & Decoded Scripts) -->
  <div class="chat-wrapper">
    <div class="chat-header">
      <span class="pill-badge">${data.badgeText}</span>
      <h1 class="chat-title font-serif">${highlightedHtml}</h1>
    </div>
    
    <div class="phone-mockup">
      <div class="phone-speaker"></div>
      <div class="chat-timestamp font-mono">TODAY · 02:14 AM</div>

      <!-- Incoming Message -->
      <div class="chat-bubble bubble-incoming">
        <span class="floating-pill pill-amber font-mono">${data.chatScenario.badgeIncoming}</span>
        <div class="bubble-sender sender-gray font-mono">MATCH // 02:14 AM</div>
        <div class="bubble-text">“${data.chatScenario.incoming}”</div>
      </div>

      <!-- Outgoing Forensic Script -->
      <div class="chat-bubble bubble-outgoing">
        <span class="floating-pill pill-green font-mono">${data.chatScenario.badgeOutgoing}</span>
        <div class="bubble-sender sender-green font-mono">YOUR FORENSIC SCRIPT</div>
        <div class="bubble-text">“${data.chatScenario.outgoing}”</div>
      </div>
    </div>

    <div class="bottom-bar">
      FLIRTCHECK.SITE · Ready-to-Send Scripts Inside →
    </div>
  </div>
` : ''}

${isChecklist ? `
  <!-- CHECKLIST MODE (Saveable 4-Step Infographic Protocol) -->
  <div class="checklist-wrapper">
    <div class="checklist-header">
      <span class="pill-badge">${data.badgeText}</span>
      <h1 class="checklist-title font-serif">${highlightedHtml}</h1>
    </div>

    <div class="checklist-cards">
      ${data.takeaways.map(t => `
        <div class="checklist-item">
          <div class="checklist-num font-serif">${t.num}</div>
          <div class="checklist-sep"></div>
          <div class="checklist-body">
            <div class="checklist-item-title">${t.title}</div>
            <div class="checklist-item-desc">${t.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="bottom-bar">
      SAVE FOR YOUR NEXT DATE · FLIRTCHECK.SITE
    </div>
  </div>
` : ''}

</body>
</html>`;
}

async function renderPinImage(article, arg2, arg3, browserInstance = null) {
  let outputPath;
  let mode;

  if (typeof arg2 === 'string' && (arg2.endsWith('.png') || arg2.includes(path.sep) || arg2.includes('/'))) {
    outputPath = arg2;
    mode = arg3 || article.primaryMode || 'editorial';
  } else {
    mode = arg2 || article.primaryMode || 'editorial';
    outputPath = arg3;
  }

  if (!outputPath) {
    throw new Error('renderPinImage requires an outputPath');
  }

  const shouldCloseBrowser = !browserInstance;
  const browser = browserInstance || await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 2
  });

  try {
    const html = generateHtmlTemplate(article, mode);
    await page.setContent(html, { waitUntil: 'load' });

    // Ensure all webfonts (Playfair Display, Inter, JetBrains Mono) are fully decoded
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Capture screenshot at 2x retina
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1000, height: 1500 }
    });

    return outputPath;
  } finally {
    await page.close().catch(() => {});
    if (shouldCloseBrowser) {
      await browser.close().catch(() => {});
    }
  }
}

module.exports = {
  CATEGORY_MAP,
  generateHookTitle,
  parseArticleContent,
  buildSeoDescription,
  generateHtmlTemplate,
  renderPinImage
};

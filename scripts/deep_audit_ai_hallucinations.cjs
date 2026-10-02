const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

console.log('======================================================================');
console.log('🔬 DEEP AI HALLUCINATION & FACTUAL INTEGRITY AUDITOR (2026)');
console.log('======================================================================\n');

const postsDir = path.resolve('blog/src/content/posts');
const dbPath = path.resolve('core/data/content_queue.sqlite');

const findings = {
  metaLeakage: [],       // "As an AI...", "Here is...", etc.
  placeholders: [],      // "[Insert link]", "[Your name]", etc.
  cyrillicInPosts: [],   // Russian text in English posts (Rule 3)
  fakeTools: [],         // Hallucinated software (VoiceGuard, VisionScout, etc.)
  fakePortalClaims: [],  // "FlirtCheck Verified Portal", etc.
  brokenLinks: [],       // Non-functional / hallucinated links
  queueAnomalies: []     // Hallucinations in SQLite queue
};

// 1. Audit Blog Posts
if (fs.existsSync(postsDir)) {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  console.log(`[AUDIT 1/3] Scanning ${files.length} markdown posts in blog/src/content/posts...`);

  for (const file of files) {
    const fullPath = path.join(postsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Check 1: AI meta-leakage
    const metaRegex = /(?:as an ai language model|here is (?:the|a) (?:article|post|guide|dossier)|certainly! here|sure, here is|i hope this helps|let me know if you need)/i;
    const metaMatch = content.match(metaRegex);
    if (metaMatch) {
      findings.metaLeakage.push({ file, snippet: metaMatch[0] });
    }

    // Check 2: Unfilled Placeholders
    const placeholderRegex = /\[(?:insert|replace|link|url|your\s+name|author\s+name|date)[^\]]*\]|\bTODO\b|\bFIXME\b/i;
    const phMatch = content.match(placeholderRegex);
    if (phMatch) {
      findings.placeholders.push({ file, placeholder: phMatch[0] });
    }

    // Check 3: Cyrillic characters in body (Violation of Strict English Rule 3)
    // Exclude YAML frontmatter comments if any, check main body
    const bodyOnly = content.replace(/^---[\s\S]*?---/, '');
    const cyrillicMatches = bodyOnly.match(/[\u0400-\u04FF]{3,}/g);
    if (cyrillicMatches) {
      findings.cyrillicInPosts.push({ file, samples: cyrillicMatches.slice(0, 5) });
    }

    // Check 4: Hallucinated fake software & tools
    const fakeToolsRegex = /\b(VoiceGuard AI|VisionScout|Sensity AI|AI-Shield|DeepTrace AI|ScamShield Pro|CyberSentinel 2026)\b/i;
    const toolMatch = content.match(fakeToolsRegex);
    if (toolMatch) {
      findings.fakeTools.push({ file, tool: toolMatch[0] });
    }

    // Check 5: Hallucinated "FlirtCheck Verified Portal / Member Login"
    const portalRegex = /(?:FlirtCheck(?:'s)? Verified Portal|video call on FlirtCheck|portal\.flirtcheck|FlirtCheck Member Area)/i;
    const portalMatch = content.match(portalRegex);
    if (portalMatch) {
      findings.fakePortalClaims.push({ file, claim: portalMatch[0] });
    }

    // Check 6: Broken or suspicious external links
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];
      if (linkUrl.includes('example.com') || linkUrl.includes('placeholder') || linkUrl.includes('mysite.com')) {
        findings.brokenLinks.push({ file, text: linkText, url: linkUrl });
      }
    }
  }
} else {
  console.warn('⚠️ Posts dir not found:', postsDir);
}

// 2. Audit SQLite Queue Items (Twitter, Reddit, Telegram)
if (fs.existsSync(dbPath)) {
  console.log(`\n[AUDIT 2/3] Scanning SQLite database: ${dbPath}...`);
  try {
    const db = new DatabaseSync(dbPath);
    const items = db.prepare("SELECT id, platform, status, hook, body, target_url FROM content_queue_v2").all();
    console.log(`Scanning ${items.length} queue items across all platforms...`);

    for (const item of items) {
      const text = `${item.hook || ''} ${item.body || ''}`;

      // Check meta-leakage
      if (/(?:as an ai|here is|certainly!)/i.test(text)) {
        findings.queueAnomalies.push({ id: item.id, platform: item.platform, type: 'META_LEAK', text: text.slice(0, 80) });
      }
      // Check placeholders
      if (/\[(?:insert|replace|link|url)[^\]]*\]/i.test(text)) {
        findings.queueAnomalies.push({ id: item.id, platform: item.platform, type: 'PLACEHOLDER', text: text.slice(0, 80) });
      }
      // Check hallucinated fake software
      if (/\b(VoiceGuard AI|VisionScout|FlirtCheck Verified Portal)\b/i.test(text)) {
        findings.queueAnomalies.push({ id: item.id, platform: item.platform, type: 'FAKE_TOOL', text: text.slice(0, 80) });
      }
    }
  } catch (err) {
    console.error('Error auditing SQLite:', err.message);
  }
}

// 3. Output Summary & Audit Report
console.log('\n======================================================================');
console.log('📊 AUDIT SUMMARY & INTEGRITY SCORE');
console.log('======================================================================');

const totalIssues = 
  findings.metaLeakage.length +
  findings.placeholders.length +
  findings.cyrillicInPosts.length +
  findings.fakeTools.length +
  findings.fakePortalClaims.length +
  findings.brokenLinks.length +
  findings.queueAnomalies.length;

console.log(`• LLM Meta-Leakage ("As an AI...", etc.):      ${findings.metaLeakage.length}`);
console.log(`• Unfilled Placeholders ([Insert...], TODO):  ${findings.placeholders.length}`);
console.log(`• Cyrillic in English Posts (Rule 3):         ${findings.cyrillicInPosts.length}`);
console.log(`• Hallucinated Fake Software/Tools:           ${findings.fakeTools.length}`);
console.log(`• Fake "Verified Portal" Claims:              ${findings.fakePortalClaims.length}`);
console.log(`• Broken/Placeholder External Links:          ${findings.brokenLinks.length}`);
console.log(`• SQLite Queue Anomalies:                     ${findings.queueAnomalies.length}`);
console.log('----------------------------------------------------------------------');
console.log(`TOTAL DETECTED ANOMALIES: ${totalIssues}`);

if (totalIssues > 0) {
  console.log('\n📋 DETAILED ANOMALIES BREAKDOWN:');
  console.log(JSON.stringify(findings, null, 2));
} else {
  console.log('\n✅ 100% CLEAN: ZERO AI HALLUCINATIONS DETECTED ACROSS ALL POSTS AND QUEUES!');
}

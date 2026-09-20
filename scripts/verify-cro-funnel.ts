/**
 * CRO Funnel Gatekeeper Verification Script
 * Validates all /go smartlink transitions across compiled HTML pages and source components.
 * Usage: npx tsx scripts/verify-cro-funnel.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(process.cwd(), 'blog/dist');
const SRC_DIR = path.resolve(process.cwd(), 'blog/src');

interface FunnelViolation {
  file: string;
  tag: string;
  reasons: string[];
}

function findHtmlFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtmlFiles(fullPath, fileList);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function findAstroFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAstroFiles(fullPath, fileList);
    } else if (entry.isFile() && entry.name.endsWith('.astro')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function verifyLinkTag(file: string, tag: string): string[] {
  const reasons: string[] = [];

  // 1. Check rel attribute
  const relMatch = tag.match(/rel=(["'])(.*?)\1/i);
  if (!relMatch) {
    reasons.push('Missing rel attribute (must include "nofollow" and "sponsored")');
  } else {
    const relVal = relMatch[2].toLowerCase();
    if (!relVal.includes('nofollow') || !relVal.includes('sponsored')) {
      reasons.push(`Incomplete rel attribute: "${relVal}" (required: "nofollow sponsored")`);
    }
  }

  // 2. Check target="_blank"
  const targetMatch = tag.match(/target=(["'])(.*?)\1/i);
  if (!targetMatch || targetMatch[2] !== '_blank') {
    reasons.push('Missing or invalid target attribute (required: target="_blank")');
  }

  // 3. Check query parameters
  const hrefMatch = tag.match(/href=(["'])(.*?)\1/i);
  if (hrefMatch) {
    const hrefVal = hrefMatch[2];
    const urlParams = hrefVal.split('?')[1] || '';

    const hasSource = urlParams.includes('source=');
    const hasIntent = urlParams.includes('intent=');
    const hasTrigger = urlParams.includes('trigger=') || urlParams.includes('trigger_source=');

    if (!hasSource) reasons.push('Missing required query parameter "source"');
    if (!hasIntent) reasons.push('Missing required query parameter "intent"');
    if (!hasTrigger) reasons.push('Missing required query parameter "trigger" / "trigger_source"');
  } else {
    reasons.push('Could not parse href value');
  }

  return reasons;
}

function run() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   CRO FUNNEL GATEKEEPER // SMARTLINK ATTRIBUTION AUDIT               ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  let targetFiles: string[] = [];
  let isDist = false;

  if (fs.existsSync(DIST_DIR)) {
    targetFiles = findHtmlFiles(DIST_DIR);
    isDist = true;
    console.log(`Auditing compiled production distribution: ${DIST_DIR} (${targetFiles.length} HTML files)\n`);
  }

  if (targetFiles.length === 0) {
    targetFiles = findAstroFiles(SRC_DIR);
    isDist = false;
    console.log(`Auditing source components: ${SRC_DIR} (${targetFiles.length} Astro files)\n`);
  }

  const violations: FunnelViolation[] = [];
  let totalLinksChecked = 0;

  // Regex to match <a ... href="/go..." ...>
  const linkRegex = /<a\b[^>]*?\bhref=(["'])(?:https?:\/\/[^"'>]+)?\/go(?:\?[^"'>]*)?\1[^>]*?>/gi;

  for (const file of targetFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(content)) !== null) {
      totalLinksChecked++;
      const tag = match[0];
      const reasons = verifyLinkTag(file, tag);

      if (reasons.length > 0) {
        violations.push({
          file: path.relative(process.cwd(), file),
          tag: tag.replace(/\s+/g, ' '),
          reasons,
        });
      }
    }
  }

  console.log(`Total /go smartlink touchpoints verified: ${totalLinksChecked}`);

  if (violations.length === 0) {
    console.log('\n✅ CRO GATEKEEPER PASSED: All monetization touchpoints satisfy:');
    console.log('   - rel="nofollow sponsored" verified');
    console.log('   - target="_blank" enforced');
    console.log('   - Complete attribution telemetry (source, trigger, intent) confirmed.\n');
    process.exit(0);
  } else {
    console.error(`\n❌ CRO GATEKEEPER FAILED: Discovered ${violations.length} attribution violation(s):\n`);
    for (const v of violations) {
      console.error(`   [!] File: ${v.file}`);
      console.error(`       Tag:  ${v.tag}`);
      for (const r of v.reasons) {
        console.error(`       - ${r}`);
      }
      console.error('');
    }
    process.exit(1);
  }
}

run();

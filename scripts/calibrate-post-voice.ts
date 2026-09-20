import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// Directory containing blog markdown posts
const POSTS_DIR = path.resolve(process.cwd(), 'blog/src/content/posts');

// Risk level mapping per editorial specification
function getTelemetryRisk(category: string): 'CRITICAL' | 'ELEVATED' | 'MODERATE' {
  switch (category) {
    case 'safety-dossier':
    case 'algo-mechanics':
      return 'CRITICAL';
    case 'modern-psychology':
    case 'digital-dialogue':
      return 'ELEVATED';
    case 'first-dates':
    case 'romantic-essays':
    default:
      return 'MODERATE';
  }
}

// Generate unique, deterministic Case ID from slug & category (e.g. FC-942-SEC)
function generateCaseId(slug: string, category: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  const caseNumber = (Math.abs(hash) % 900) + 100; // 100..999

  const categoryCodes: Record<string, string> = {
    'safety-dossier': 'SEC',
    'algo-mechanics': 'ALG',
    'modern-psychology': 'PSY',
    'digital-dialogue': 'NET',
    'first-dates': 'OPS',
    'romantic-essays': 'ARC',
  };
  const suffix = categoryCodes[category] || 'SEC';
  return `FC-${caseNumber}-${suffix}`;
}

async function calibratePostVoice() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   CHELTENHAM INVESTIGATION DESK // POST VOICE CALIBRATION PIPELINE    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`❌ Posts directory not found: ${POSTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  console.log(`🔍 Discovered ${files.length} dossiers in ${POSTS_DIR}\n`);

  const riskStats: Record<string, number> = {
    CRITICAL: 0,
    ELEVATED: 0,
    MODERATE: 0,
  };

  let processedCount = 0;

  for (const filename of files) {
    const filePath = path.join(POSTS_DIR, filename);
    const slug = path.basename(filename, '.md');
    const rawContent = fs.readFileSync(filePath, 'utf8');

    const parsed = matter(rawContent);
    const currentData = parsed.data;

    const category = currentData.category || 'safety-dossier';
    const caseId = currentData.caseId || generateCaseId(slug, category);
    const telemetryRisk = getTelemetryRisk(category);
    riskStats[telemetryRisk]++;

    // 1. Structured Frontmatter (retaining existing fields + updating forensic metadata)
    const pubDateStr = currentData.pubDate instanceof Date 
      ? currentData.pubDate.toISOString().split('T')[0] 
      : (currentData.pubDate || '2026-09-15');

    const updatedData = {
      title: currentData.title,
      description: currentData.description,
      pubDate: pubDateStr,
      category: category,
      caseId: caseId,
      classification: 'PUBLIC INVESTIGATION DOSSIER // DECLASSIFIED 2026',
      author: 'Cheltenham Investigation Desk',
      telemetryRisk: telemetryRisk,
      tags: currentData.tags || [],
      seoKeywords: currentData.seoKeywords || [],
      ...(currentData.canonicalUrl ? { canonicalUrl: currentData.canonicalUrl } : {}),
      ...(currentData.image ? { image: currentData.image } : {}),
      ...(currentData.coverImage ? { coverImage: currentData.coverImage } : {}),
      ...(currentData.readingTime ? { readingTime: currentData.readingTime } : {}),
      ...(currentData.hook ? { hook: currentData.hook } : {}),
      ...(currentData.motto ? { motto: currentData.motto } : {}),
      draft: Boolean(currentData.draft),
    };

    // 2. Clean existing incident block if previously injected to maintain idempotency
    let body = parsed.content.trim();
    const incidentBlockRegex = /^>\s*\*\*INCIDENT DISPATCH \/\/ CASE:[^\n]+\n>\s*\*\*FIELD LOG:\*\*[^\n]+\n\n---\s*\n+/;
    body = body.replace(incidentBlockRegex, '');

    // 3. Construct Dossier Header Stamp per specification
    const dossierHeaderStamp = `> **INCIDENT DISPATCH // CASE: #${caseId}**  
> **FIELD LOG:** Commercial matchmaking platforms operate on variable ratio reward mechanics and hidden ELO filtering. This dossier deconstructs underlying mechanics, synthetic bot telemetry, and reverse-engineered mitigation protocols.

---

`;

    const newBody = `\n${dossierHeaderStamp}${body}\n`;
    const serialized = matter.stringify(newBody, updatedData);

    fs.writeFileSync(filePath, serialized, 'utf8');
    processedCount++;

    console.log(`[+] Calibrated: [${caseId}] | Risk: ${telemetryRisk.padEnd(8)} | ${filename}`);
  }

  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log(`✅ Completed editorial voice calibration for ${processedCount} files.`);
  console.log(`   Telemetry Risk Profile:`);
  console.log(`   - CRITICAL: ${riskStats.CRITICAL}`);
  console.log(`   - ELEVATED: ${riskStats.ELEVATED}`);
  console.log(`   - MODERATE: ${riskStats.MODERATE}`);
  console.log('══════════════════════════════════════════════════════════════════════\n');
}

calibratePostVoice().catch((err) => {
  console.error('❌ Pipeline failed:', err);
  process.exit(1);
});

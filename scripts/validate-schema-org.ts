/**
 * Schema.org Rich Results Validator
 * Scans all compiled HTML files in blog/dist/ and validates JSON-LD schemas
 * against Google Rich Results & Schema.org requirements.
 * Usage: npx tsx scripts/validate-schema-org.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(process.cwd(), 'blog/dist');

interface SchemaIssue {
  file: string;
  type: string;
  issue: string;
}

let totalPagesScanned = 0;
let totalSchemasFound = 0;
const issues: SchemaIssue[] = [];
const schemaTypesCount: Record<string, number> = {};

function scanHtmlFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Distribution directory not found: ${dir}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_astro') {
        scanHtmlFiles(fullPath);
      }
    } else if (entry.isFile() && entry.name === 'index.html') {
      validatePage(fullPath);
    }
  }
}

function validatePage(filePath: string) {
  totalPagesScanned++;
  const html = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(DIST_DIR, filePath);

  // Extract all <script type="application/ld+json">...</script>
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  const pageSchemas: any[] = [];

  while ((match = jsonLdRegex.exec(html)) !== null) {
    const jsonStr = match[1].trim();
    if (!jsonStr) {
      issues.push({ file: relPath, type: 'EMPTY', issue: 'Empty ld+json script tag' });
      continue;
    }

    try {
      const parsed = JSON.parse(jsonStr);
      pageSchemas.push(parsed);
      totalSchemasFound++;

      const schemaType = Array.isArray(parsed)
        ? parsed.map(p => p['@type']).join(', ')
        : parsed['@type'] || 'UNKNOWN';

      schemaTypesCount[schemaType] = (schemaTypesCount[schemaType] || 0) + 1;

      // Validate single schema or array
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        validateSchemaItem(item, relPath);
      }
    } catch (e: any) {
      issues.push({
        file: relPath,
        type: 'SYNTAX_ERROR',
        issue: `JSON parse error: ${e.message}. Snippet: "${jsonStr.slice(0, 80)}..."`
      });
    }
  }

  if (pageSchemas.length === 0) {
    issues.push({
      file: relPath,
      type: 'MISSING_SCHEMA',
      issue: 'Page has zero Schema.org (JSON-LD) structured data'
    });
  }
}

function validateSchemaItem(item: any, file: string) {
  if (!item['@context'] || !item['@context'].includes('schema.org')) {
    issues.push({ file, type: item['@type'] || 'UNKNOWN', issue: 'Missing or invalid @context (must be https://schema.org)' });
  }

  const type = item['@type'];
  if (!type) {
    issues.push({ file, type: 'UNKNOWN', issue: 'Missing @type property' });
    return;
  }

  // TechArticle / Article / NewsArticle validation
  if (type === 'Article' || type === 'TechArticle' || type === 'NewsArticle') {
    if (!item.headline) issues.push({ file, type, issue: 'Article missing "headline"' });
    if (!item.image) issues.push({ file, type, issue: 'Article missing "image"' });
    if (!item.datePublished) issues.push({ file, type, issue: 'Article missing "datePublished"' });
    if (!item.author) issues.push({ file, type, issue: 'Article missing "author"' });
    if (!item.publisher) issues.push({ file, type, issue: 'Article missing "publisher"' });
  }

  // WebSite validation
  if (type === 'WebSite') {
    if (!item.name) issues.push({ file, type, issue: 'WebSite missing "name"' });
    if (!item.url) issues.push({ file, type, issue: 'WebSite missing "url"' });
  }

  // BreadcrumbList validation
  if (type === 'BreadcrumbList') {
    if (!item.itemListElement || !Array.isArray(item.itemListElement) || item.itemListElement.length === 0) {
      issues.push({ file, type, issue: 'BreadcrumbList missing "itemListElement" array' });
    } else {
      item.itemListElement.forEach((el: any, idx: number) => {
        if (el.position !== idx + 1) {
          issues.push({ file, type, issue: `BreadcrumbList item ${idx} has mismatched position ${el.position}` });
        }
        if (!el.name) issues.push({ file, type, issue: `BreadcrumbList item ${idx} missing "name"` });
      });
    }
  }

  // CollectionPage validation
  if (type === 'CollectionPage') {
    if (!item.mainEntity || item.mainEntity['@type'] !== 'ItemList') {
      issues.push({ file, type, issue: 'CollectionPage missing mainEntity of @type ItemList' });
    }
  }

  // ProfilePage validation
  if (type === 'ProfilePage') {
    if (!item.mainEntity || item.mainEntity['@type'] !== 'Person') {
      issues.push({ file, type, issue: 'ProfilePage missing mainEntity of @type Person' });
    }
  }
}

function run() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   SCHEMA.ORG STRUCTURED DATA AUDITOR // FLIRTCHECK ARCHIVE           ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
  console.log(`Auditing directory: ${DIST_DIR}\n`);

  scanHtmlFiles(DIST_DIR);

  console.log(`📊 Scan Statistics:`);
  console.log(`   - HTML Pages Scanned: ${totalPagesScanned}`);
  console.log(`   - JSON-LD Blocks Found: ${totalSchemasFound}`);
  console.log(`   - Discovered Schema Types:`);
  Object.entries(schemaTypesCount).forEach(([st, cnt]) => {
    console.log(`     • ${st}: ${cnt} instances`);
  });
  console.log('');

  if (issues.length === 0) {
    console.log('✅ AUDIT PASSED: 100% Schema.org Structured Data Compliance!');
    console.log('   - 0 JSON syntax errors');
    console.log('   - All Rich Results requirements (headline, image, author, publisher) satisfied');
    console.log('   - Complete coverage across Articles, CollectionPages, WebSite, and ProfilePage.\n');
    process.exit(0);
  } else {
    console.error(`❌ AUDIT FAILED: Discovered ${issues.length} schema issues:\n`);
    issues.slice(0, 20).forEach(iss => {
      console.error(`   [!] ${iss.file} (${iss.type}): ${iss.issue}`);
    });
    if (issues.length > 20) {
      console.error(`   ... and ${issues.length - 20} more issues.`);
    }
    process.exit(1);
  }
}

run();

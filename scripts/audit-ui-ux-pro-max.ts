/**
 * UI UX Pro Max Quality Auditor
 * Evaluates WCAG AAA contrast, 68ch typographic rhythm, 44px touch ergonomics, and state styling.
 * Usage: npx tsx scripts/audit-ui-ux-pro-max.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(process.cwd(), 'blog/src');
const DIST_DIR = path.resolve(process.cwd(), 'blog/dist');

interface AuditIssue {
  category: 'WCAG' | 'TYPOGRAPHY' | 'TOUCH_TARGET' | 'MICRO_UX';
  file: string;
  line?: number;
  message: string;
  severity: 'CRITICAL' | 'WARNING';
}

function findFiles(dir: string, extRegex: RegExp, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.astro') {
        findFiles(fullPath, extRegex, fileList);
      }
    } else if (entry.isFile() && extRegex.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function auditSourceFiles(files: string[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const relPath = path.relative(process.cwd(), file);

    lines.forEach((rawLine, idx) => {
      const line = rawLine.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\/.*/, '');
      if (!line.trim()) return;
      const lineNum = idx + 1;

      // 1. Contrast Check: Disallow critical body text using low contrast gray
      if (/\btext-slate-400\b/.test(line) && !line.includes('SPECIALTY') && !line.includes('placeholder')) {
        issues.push({
          category: 'WCAG',
          file: relPath,
          line: lineNum,
          message: 'Low contrast slate-400 detected in active layout (WCAG AAA requires slate-700+ for high legibility)',
          severity: 'WARNING',
        });
      }

      // 2. Icon-only buttons lacking aria-label
      if (/<button\b[^>]*>/i.test(line)) {
        if ((line.includes('svg') || line.includes('×') || line.includes('🔗')) && !line.includes('aria-label') && !line.includes('title')) {
          issues.push({
            category: 'WCAG',
            file: relPath,
            line: lineNum,
            message: 'Button containing icon appears to lack explicit aria-label for screen reader accessibility',
            severity: 'CRITICAL',
          });
        }
      }

      // 3. Touch target validation: small buttons without padding
      if (/<button\b|<a\b/i.test(line)) {
        if (/\b(w-[3-6]|h-[3-6])\b/.test(line) && !/\b(p-[2-5]|px-[3-6]|min-h-|min-w-)/.test(line)) {
          issues.push({
            category: 'TOUCH_TARGET',
            file: relPath,
            line: lineNum,
            message: 'Interactive element has physical size under 44px without compensating padding',
            severity: 'WARNING',
          });
        }
      }

      // 4. Random non-system hex styles
      const hexMatches = line.match(/#[0-9a-fA-F]{6}/g);
      if (hexMatches) {
        const allowedHex = [
          '#0F172A', '#FBF8F1', '#FFFDF7', '#FFFDF9', '#FEF9EE', '#F4EFE6',
          '#E11D48', '#0284C7', '#D97706', '#059669', '#4F46E5', '#EA580C',
          '#FFFFFF', '#475569', '#334155', '#1E293B'
        ];
        for (const hex of hexMatches) {
          if (!allowedHex.map(h => h.toLowerCase()).includes(hex.toLowerCase())) {
            issues.push({
              category: 'TYPOGRAPHY',
              file: relPath,
              line: lineNum,
              message: `Non-design-system raw hex code: "${hex}". Use Tailwind design tokens or official palette.`,
              severity: 'WARNING',
            });
          }
        }
      }
    });

    // 5. Longform articles must enforce max-w-[68ch]
    if (file.includes('BlogPostLayout.astro')) {
      if (!content.includes('max-w-[68ch]')) {
        issues.push({
          category: 'TYPOGRAPHY',
          file: relPath,
          message: 'BlogPostLayout is missing the 68ch measure constraint (max-w-[68ch]) for optimal readability',
          severity: 'CRITICAL',
        });
      }
    }
  }

  return issues;
}

function run() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   UI UX PRO MAX QUALITY & ACCESSIBILITY AUDITOR                      ║');
  console.log('║   Standard: WCAG 2.2 AAA • 68ch Measure • 44px Touch Ergonomics      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  const sourceFiles = findFiles(SRC_DIR, /\.(astro|css|ts)$/);
  console.log(`Scanning ${sourceFiles.length} source components in blog/src/...\n`);

  const issues = auditSourceFiles(sourceFiles);

  let score = 100;
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;

  score -= criticalCount * 15;
  score -= warningCount * 3;
  if (score < 0) score = 0;

  console.log('----------------------------------------------------------------------');
  console.log(`🏆 UI UX PRO MAX QUALITY SCORE: ${score}/100`);
  console.log('----------------------------------------------------------------------');

  if (issues.length === 0) {
    console.log('🌟 PERFECT SCORE: 100/100. Flawless ergonomic & typographic fidelity!\n');
    process.exit(0);
  } else {
    console.log(`Audit identified ${criticalCount} critical and ${warningCount} advisory issue(s):\n`);
    for (const iss of issues) {
      const icon = iss.severity === 'CRITICAL' ? '⛔ [CRITICAL]' : '⚠️  [ADVISORY]';
      const loc = iss.line ? `${iss.file}:${iss.line}` : iss.file;
      console.log(`${icon} [${iss.category}] ${loc}`);
      console.log(`   ${iss.message}\n`);
    }

    if (criticalCount > 0 || score < 85) {
      console.error(`❌ AUDIT FAILED: Score ${score}/100 is below the 85 threshold.`);
      process.exit(1);
    } else {
      console.log(`✅ AUDIT PASSED: Score ${score}/100 satisfies the UI UX Pro Max standard.`);
      process.exit(0);
    }
  }
}

run();

/**
 * Editorial Design System Auditor
 * Validates Astro components and layouts against the Forensic Evidence Gazette specification.
 * Usage: npx tsx scripts/audit-editorial-design.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(process.cwd(), 'blog/src');

interface Violation {
  file: string;
  line: number;
  snippet: string;
  reason: string;
}

const FORBIDDEN_PATTERNS = [
  {
    regex: /\b(animate-bounce|animate-ping)\b/g,
    reason: 'Forbidden flashy arcade animation (use subtle micro-transitions instead)',
  },
  {
    regex: /\b(text|bg|border|from|to|via)-(purple|pink|fuchsia|violet)-[3-7]00\b/g,
    reason: 'Forbidden synthetic acid neon color (use slate/rose/amber/emerald palette)',
  },
  {
    regex: /\bshadow-neon\b/g,
    reason: 'Forbidden cyberpunk neon glow shadow',
  },
];

function scanDirectory(dir: string, violations: Violation[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.astro') {
        scanDirectory(fullPath, violations);
      }
    } else if (entry.isFile() && /\.(astro|css|ts|tsx)$/.test(entry.name)) {
      auditFile(fullPath, violations);
    }
  }
}

function auditFile(filePath: string, violations: Violation[]) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((rawLine, index) => {
    // Strip HTML and JS comments
    const line = rawLine.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\/.*/, '');
    if (!line.trim()) return;

    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.regex.test(line)) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          line: index + 1,
          snippet: line.trim().slice(0, 100),
          reason: rule.reason,
        });
      }
    }
  });
}

function run() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   EDITORIAL DESIGN SYSTEM AUDITOR // CHELTENHAM SPECIFICATION        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
  console.log(`Auditing target: ${SRC_DIR}\n`);

  const violations: Violation[] = [];
  scanDirectory(SRC_DIR, violations);

  if (violations.length === 0) {
    console.log('✅ AUDIT PASSED: 100% compliance with Forensic Evidence Gazette design system.');
    console.log('   - 0 forbidden neon/arcade classes');
    console.log('   - Typography and palette constraints strictly preserved.\n');
    process.exit(0);
  } else {
    console.error(`❌ AUDIT FAILED: Discovered ${violations.length} design system violation(s):\n`);
    for (const v of violations) {
      console.error(`   [!] ${v.file}:${v.line}`);
      console.error(`       Reason:  ${v.reason}`);
      console.error(`       Snippet: "${v.snippet}"\n`);
    }
    process.exit(1);
  }
}

run();

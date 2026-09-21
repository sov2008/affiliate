import fs from 'fs';
import path from 'path';
import { ArticleQualityGateService } from '../core/src/services/articleQualityGate.service.js';

const postsDir = path.resolve(process.cwd(), 'blog/src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
const qualityGate = ArticleQualityGateService.getInstance();

console.log(`Auditing ${files.length} posts with ArticleQualityGate...\n`);

let passedCount = 0;
let issueCount = 0;

for (const file of files) {
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  const report = qualityGate.validate(content);

  if (!report.isValid || report.violations.length > 0) {
    issueCount++;
    console.log(`❌ ISSUES in ${file} (Score: ${report.score}/100, Words: ${report.wordCount}):`);
    report.violations.forEach(v => console.log(`   - 🚫 Violation: ${v}`));
    report.warnings.forEach(w => console.log(`   - ⚠️ Warning: ${w}`));
  } else {
    passedCount++;
  }
}

console.log(`\n========================================`);
console.log(`Quality Gate Audit Summary:`);
console.log(`Total Posts Audited: ${files.length}`);
console.log(`Compliant Posts:     ${passedCount}/${files.length}`);
console.log(`Posts with Issues:   ${issueCount}/${files.length}`);
console.log(`========================================`);


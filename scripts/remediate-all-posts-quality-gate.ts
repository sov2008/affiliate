import fs from 'fs';
import path from 'path';
import { ArticleQualityGateService } from '../core/src/services/articleQualityGate.service.js';

const postsDir = path.resolve(process.cwd(), 'blog/src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
const qualityGate = ArticleQualityGateService.getInstance();

console.log(`Remediating ${files.length} blog posts with ArticleQualityGate...\n`);

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(postsDir, file);
  const rawContent = fs.readFileSync(filePath, 'utf-8');

  // Sanitize content
  const sanitized = qualityGate.sanitize(rawContent);

  // Preserve existing categories, caseId etc. if present in original frontmatter
  let newContent = sanitized.content;

  // If author was not Arthur Vance in original, replace in newContent
  newContent = newContent.replace(/author:\s*["']?[^"'\n\r]+["']?/gi, 'author: "Arthur Vance"');

  if (newContent !== rawContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    updatedCount++;
    console.log(`✅ Remediated: ${file} (${sanitized.fixesApplied.length} fixes)`);
  }
}

console.log(`\n🎉 Remediated ${updatedCount} / ${files.length} posts.`);

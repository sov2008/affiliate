const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.resolve(__dirname, '../blog/src/content/posts');

function processPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`❌ Posts directory not found at: ${POSTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  console.log(`📁 Found ${files.length} posts in ${POSTS_DIR}\n`);

  let updatedCount = 0;
  let sampleUpdated = null;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const slug = file.replace(/\.md$/, '');
    const canonicalCover = `/images/posts/${slug}.webp`;

    const content = fs.readFileSync(filePath, 'utf8');

    // Match YAML frontmatter between first --- and second ---
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n[\s\S]*)$/);
    if (!fmMatch) {
      console.warn(`⚠️ Skipping ${file}: invalid or missing frontmatter delimiter`);
      continue;
    }

    const rawFm = fmMatch[1];
    const body = fmMatch[2];

    let fm = rawFm;
    let modified = false;

    // Check existing 'image:' field
    const imageRegex = /^image:\s*(.+)$/m;
    const coverRegex = /^coverImage:\s*(.+)$/m;

    const imgMatch = fm.match(imageRegex);
    const coverMatch = fm.match(coverRegex);

    if (imgMatch) {
      const currentVal = imgMatch[1].trim().replace(/^["']|["']$/g, '');
      // If points to /blog/images/, default-cover, http, or needs normalization to canonical slug
      if (
        currentVal.startsWith('/blog/images/') ||
        currentVal.includes('default-cover') ||
        currentVal.startsWith('http://') ||
        currentVal.startsWith('https://')
      ) {
        fm = fm.replace(imageRegex, `image: "${canonicalCover}"`);
        modified = true;
      }
    } else {
      // image field is missing: insert it
      // Place right after coverImage if present, or before draft/category, or at the end of frontmatter
      if (coverMatch) {
        fm = fm.replace(coverRegex, `$&\nimage: "${canonicalCover}"`);
      } else {
        fm = `${fm}\nimage: "${canonicalCover}"`;
      }
      modified = true;
    }

    // Also normalize coverImage if it points to default-cover or /blog/images/
    if (coverMatch) {
      const currentCover = coverMatch[1].trim().replace(/^["']|["']$/g, '');
      if (
        currentCover.startsWith('/blog/images/') ||
        currentCover.includes('default-cover') ||
        currentCover.startsWith('http://') ||
        currentCover.startsWith('https://')
      ) {
        fm = fm.replace(coverRegex, `coverImage: "${canonicalCover}"`);
        modified = true;
      }
    }

    if (modified) {
      const newContent = `---` + (fm.startsWith('\n') ? '' : '\n') + fm + `\n---` + body;
      fs.writeFileSync(filePath, newContent, 'utf8');
      updatedCount++;

      if (!sampleUpdated) {
        sampleUpdated = {
          file,
          slug,
          canonicalCover,
          frontmatterSnippet: fm.split('\n').slice(0, 14).join('\n')
        };
      }
    }
  }

  console.log(`========================================`);
  console.log(`✅ Синхронизация обложек завершена`);
  console.log(`📊 Всего обработано файлов: ${files.length}`);
  console.log(`📝 Обновлено файлов: ${updatedCount}`);
  console.log(`========================================\n`);

  if (sampleUpdated) {
    console.log(`🔍 Пример обновленного frontmatter (${sampleUpdated.file}):`);
    console.log(`----------------------------------------`);
    console.log(sampleUpdated.frontmatterSnippet);
    console.log(`----------------------------------------\n`);
  }
}

processPosts();

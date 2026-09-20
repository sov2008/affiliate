import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const yaml = require(path.resolve(process.cwd(), 'blog/node_modules/js-yaml'));

const POSTS_DIR = path.resolve(process.cwd(), 'blog/src/content/posts');
const PUBLIC_DIR = path.resolve(process.cwd(), 'blog/public');
const DIST_DIR = path.resolve(process.cwd(), 'blog/dist');

interface PostAudit {
  file: string;
  slug: string;
  title: string;
  category: string;
  coverImage?: string;
  coverFileExists: boolean;
  coverPhysicalPath?: string;
  coverFileSizeKb?: string;
  distPageExists: boolean;
  distHtmlPath?: string;
  themeKeywordMatch: boolean;
  themeNotes: string;
}

function parseFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  try {
    return yaml.load(match[1]) || {};
  } catch (e) {
    console.error('YAML parse error:', e);
    return {};
  }
}

async function audit() {
  console.log('======================================================================');
  console.log('🔍 FULL CONTENT, ROUTING & COVER ART INTEGRITY AUDIT');
  console.log('======================================================================\n');

  if (!fs.existsSync(POSTS_DIR)) {
    console.error('❌ Posts directory does not exist:', POSTS_DIR);
    process.exit(1);
  }

  const postFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  console.log(`Found ${postFiles.length} investigative dispatches in ${POSTS_DIR}\n`);

  const audits: PostAudit[] = [];
  let missingCovers = 0;
  let missingDistPages = 0;

  for (const file of postFiles) {
    const fullPath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const fm = parseFrontmatter(content);

    const slug = file.replace(/\.(md|mdx)$/, '');
    const title = (fm.title || 'UNTITLED').replace(/\*\*/g, '').trim();
    const category = fm.category || 'UNKNOWN';
    const coverRaw = (fm.coverImage || fm.image || '').trim();

    let coverFileExists = false;
    let coverPhysicalPath = '';
    let coverFileSizeKb = '0';

    if (coverRaw) {
      const cleanCover = coverRaw.replace(/^\/blog/, '').replace(/^\//, '');
      const pubPath = path.join(PUBLIC_DIR, cleanCover);
      if (fs.existsSync(pubPath)) {
        coverFileExists = true;
        coverPhysicalPath = pubPath;
        const stat = fs.statSync(pubPath);
        coverFileSizeKb = (stat.size / 1024).toFixed(1);
      } else {
        // Check dist
        const distImgPath = path.join(DIST_DIR, cleanCover);
        if (fs.existsSync(distImgPath)) {
          coverFileExists = true;
          coverPhysicalPath = distImgPath;
          const stat = fs.statSync(distImgPath);
          coverFileSizeKb = (stat.size / 1024).toFixed(1);
        }
      }
    }

    if (!coverFileExists) {
      missingCovers++;
    }

    // Check if dist HTML page exists
    const distHtmlPath = path.join(DIST_DIR, slug, 'index.html');
    const distPageExists = fs.existsSync(distHtmlPath);
    if (!distPageExists) {
      missingDistPages++;
    }

    // Thematic relevance calculation
    const cleanImgName = coverRaw ? path.basename(coverRaw).toLowerCase() : '';
    const titleLower = title.toLowerCase();
    const slugLower = slug.toLowerCase();

    const titleWords = (titleLower + ' ' + slugLower).split(/[\s\-_,:()]+/).filter(w => w.length > 3);
    const imgWords = cleanImgName.replace(/\.(webp|jpg|png)$/, '').split(/[\s\-_]+/).filter(w => w.length > 3);
    const hasOverlap = imgWords.some(w => titleWords.some(tw => tw.includes(w) || w.includes(tw)));

    let themeNotes = '';
    const imgBase = cleanImgName.replace(/\.(webp|jpg|png)$/, '');
    if (imgBase === slugLower || slugLower.includes(imgBase) || imgBase.includes(slugLower)) {
      themeNotes = '1:1 Dedicated Graphic (Exact Slug Match)';
    } else if (hasOverlap) {
      themeNotes = 'Thematic Contextual Match';
    } else {
      themeNotes = 'Archive Shared Graphic';
    }

    audits.push({
      file,
      slug,
      title,
      category,
      coverImage: coverRaw,
      coverFileExists,
      coverPhysicalPath,
      coverFileSizeKb,
      distPageExists,
      distHtmlPath,
      themeKeywordMatch: hasOverlap || themeNotes.includes('1:1'),
      themeNotes
    });
  }

  console.log('----------------------------------------------------------------------');
  console.log('📊 DISPATCHES INTEGRITY REPORT');
  console.log('----------------------------------------------------------------------');
  audits.forEach((a, i) => {
    const statusIcon = a.coverFileExists && a.distPageExists ? '✅' : '❌';
    console.log(`${statusIcon} #${(i + 1).toString().padStart(2, '0')} [${a.category.padEnd(17)}] ${a.title.slice(0, 52)}`);
    console.log(`   🔗 Route: /${a.slug}/ -> ${a.distPageExists ? 'Page Built (200 OK)' : 'MISSING (404)'}`);
    console.log(`   🖼️ Cover: ${a.coverImage} [${a.coverFileSizeKb} KB] -> ${a.coverFileExists ? 'File Found' : 'FILE MISSING (404)'} | ${a.themeNotes}`);
  });

  console.log('\n======================================================================');
  console.log(`TOTAL DISPATCHES ANALYZED: ${audits.length}`);
  console.log(`MISSING COVERS (404):      ${missingCovers}`);
  console.log(`MISSING HTML ROUTES (404): ${missingDistPages}`);
  console.log('======================================================================\n');

  // Verify Homepage Feeds & Slugs
  console.log('🧭 VERIFYING HOMEPAGE INTERNAL DESTINATION LINKS');
  const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  
  // Extract all post links from homepage
  const postLinkMatches = [...indexHtml.matchAll(/href="\/([a-zA-Z0-9\-_]+)\/"/g)].map(m => m[1]);
  const uniquePostLinks = [...new Set(postLinkMatches)].filter(l => l !== 'desk' && !l.startsWith('category'));

  console.log(`Found ${uniquePostLinks.length} distinct article links on homepage.`);
  let brokenHomeLinks = 0;
  uniquePostLinks.forEach(slug => {
    const targetHtml = path.join(DIST_DIR, slug, 'index.html');
    const exists = fs.existsSync(targetHtml);
    if (!exists) {
      console.log(`❌ Broken link on homepage: /${slug}/`);
      brokenHomeLinks++;
    }
  });

  if (brokenHomeLinks === 0) {
    console.log(`✅ All ${uniquePostLinks.length} article links on homepage resolve to active compiled HTML pages!`);
  }

  // Header and Navigation routes
  const navTargets = [
    { name: 'Investigations Anchor', href: '/#investigations', test: indexHtml.includes('id="feed"') || indexHtml.includes('id="investigations"') },
    { name: 'The Desk Page', href: '/desk/', test: fs.existsSync(path.join(DIST_DIR, 'desk/index.html')) },
    { name: 'Methodology Anchor', href: '/#protocol', test: indexHtml.includes('id="protocol"') },
    { name: 'Audit Profile /go Gateway', href: '/go', test: indexHtml.includes('/go?source=header') }
  ];

  console.log('\n🧭 HEADER & ANCHOR NAVIGATION AUDIT:');
  navTargets.forEach(t => {
    console.log(`${t.test ? '✅' : '❌'} ${t.name} (${t.href}): ${t.test ? 'Verified' : 'Target Missing'}`);
  });
}

audit().catch(console.error);

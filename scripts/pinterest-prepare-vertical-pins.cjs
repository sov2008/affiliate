/**
 * Pinterest Vertical Pin Generator (Editorial / Chat / Checklist)
 * Modern Love / Kinfolk Editorial Design System (1000x1500 px, 2:3)
 */
const path = require('path');
const fs = require('fs');
const { parseArticleContent, renderPinImage, buildSeoDescription, CATEGORY_MAP } = require('./pinterest-pin-generator.cjs');

const PINS_DIR = path.resolve(__dirname, '../scratch/pins');
if (!fs.existsSync(PINS_DIR)) fs.mkdirSync(PINS_DIR, { recursive: true });

const SAMPLE_POSTS = [
  {
    slug: 'the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy',
    mode: 'checklist'
  },
  {
    slug: 'boundary-setting-via-text-declining-late-night-invites',
    mode: 'chat'
  },
  {
    slug: 'tinder-elo-algorithm-2026-ranking-reset-the-truth-the-myths-and-t',
    mode: 'checklist'
  },
  {
    slug: 'dating-app-burnout-14-day-reset-protocol-emotional-exhaustion',
    mode: 'editorial'
  },
  {
    slug: 'how-to-spot-catfish-osint-ai',
    mode: 'checklist'
  }
];

async function generateAll() {
  console.log('🎨 Generating Editorial Vertical Pins (1000x1500) for FlirtCheck.site...');

  for (const item of SAMPLE_POSTS) {
    try {
      const article = parseArticleContent(item.slug);
      const outPath = path.join(PINS_DIR, `${item.slug}_${item.mode}.png`);
      console.log(`\nRendering ${item.slug} in [${item.mode}] mode...`);
      console.log(`📌 Hook Title: "${article.hookTitle}"`);
      console.log(`🎯 Board: "${article.board}"`);
      
      await renderPinImage(article, outPath, item.mode);
      console.log(`✅ Saved: ${outPath}`);
    } catch (err) {
      console.error(`❌ Error rendering ${item.slug}:`, err.message);
    }
  }

  console.log('\n🎉 All editorial vertical pins successfully generated!');
}

if (require.main === module) {
  generateAll().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { generateAll, SAMPLE_POSTS };

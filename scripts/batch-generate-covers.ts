/**
 * Batch Generate Covers Pipeline (16:9 Cinematic WebP 1200x675)
 * Character Bible V2: Asuka & Shinji "Love is..." Editorial Investigative Aesthetics
 * Usage: npx tsx scripts/batch-generate-covers.ts [--all | --force] [--limit N]
 */

import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import sharp from 'sharp';
import dotenv from 'dotenv';
import {
  buildAntiScamComicPrompt,
  NEGATIVE_ANCHOR_V2,
  SceneComposition,
} from '../core/src/services/character-bible.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const POSTS_DIR = path.resolve(process.cwd(), 'blog/src/content/posts');
const OUTPUT_DIR = path.resolve(process.cwd(), 'blog/public/images/posts');

// ---------------------------------------------------------------------------
// 1. Scene Composition Matrix
// ---------------------------------------------------------------------------

export type SceneArchetype =
  | 'algo-mechanics'
  | 'safety-dossier'
  | 'voice-and-acoustics'
  | 'bot-syntax'
  | 'modern-psychology';

interface SceneTemplate {
  archetype: SceneArchetype;
  actionPrompt: string;
  compositionNotes: string;
  asukaProp: string;
  shinjiProp: string;
}

const SCENE_TEMPLATES: Record<SceneArchetype, SceneTemplate> = {
  'algo-mechanics': {
    archetype: 'algo-mechanics',
    actionPrompt:
      'Asuka sarcastically points a brass metal pointer at a glowing wall chart showing a Tinder dopamine funnel. Shinji sits at the forensic desk studying a printed ELO rating graph, holding a pencil in his hand.',
    compositionNotes:
      'waist-up medium shot, wide 16:9 horizontal layout, all props 15-20% above the bottom edge strictly centered, zero edge cropping, glowing ELO chart in background, calm analytical forensic room',
    asukaProp: 'a brass pointer directed at a dopamine funnel graph',
    shinjiProp: 'a pencil and printed ELO rating diagram sheets',
  },
  'safety-dossier': {
    archetype: 'safety-dossier',
    actionPrompt:
      'On the desk sits an articulated metallic robot manipulator hand gripping a smartphone. Asuka uses precision forensic tweezers to hover a glowing cutout blue verification badge over the phone screen. Shinji cross-checks suspicious IP address server logs with a thick stack of reports. A vintage digital wall timer displays 48:00 in the background.',
    compositionNotes:
      'waist-up medium shot, wide 16:9 horizontal layout, robotic hand with smartphone and tweezers held strictly in center 15-20% above bottom edge, zero edge cropping, vintage countdown timer 48:00',
    asukaProp: 'precision forensic tweezers holding a blue checkmark badge',
    shinjiProp: 'a thick stack of printed IP server logs',
  },
  'voice-and-acoustics': {
    archetype: 'voice-and-acoustics',
    actionPrompt:
      'Asuka wears massive retro studio headphones, listening closely to a desktop laboratory oscilloscope display showing an electric green sine soundwave. Shinji holds a vintage portable cassette voice recorder with an external microphone, analyzing the synthetic frequency.',
    compositionNotes:
      'waist-up medium shot, wide 16:9 horizontal layout, green sine soundwave oscilloscope and cassette recorder strictly centered 15-20% above bottom edge, zero edge cropping, acoustic forensic atmosphere',
    asukaProp: 'chunky retro studio headphones and hand on frequency dial',
    shinjiProp: 'a vintage cassette voice recorder with microphone',
  },
  'bot-syntax': {
    archetype: 'bot-syntax',
    actionPrompt:
      'Spread across the forensic desk is a large printed dating profile bio sheet. Shinji holds a bright red highlighter marker, carefully drawing a red circle around an exaggerated long em-dash in the text. Asuka stands with arms crossed mockingly across her chest with a skeptical smirk, observing his analysis.',
    compositionNotes:
      'waist-up medium shot, wide 16:9 horizontal layout, paper bio and red marker strictly held by Shinji in center 15-20% above bottom border, Asuka hands folded, zero edge cropping',
    asukaProp: 'arms crossed with skeptical smirk',
    shinjiProp: 'a bright red chisel-tip highlighter marker circling an em-dash',
  },
  'modern-psychology': {
    archetype: 'modern-psychology',
    actionPrompt:
      'The characters sit beside each other at a vintage outdoor cafe table on a gentle rainy evening. A warm cup of coffee and a writer notebook sit before them. Asuka gazes with a soft knowing smile through the cafe window at the city rain, while Shinji calmly closes an investigative case folder.',
    compositionNotes:
      'waist-up medium shot, wide 16:9 horizontal layout, cafe table with coffee and notebook centered 15-20% above bottom border, rainy window backdrop, melancholic warm editorial atmosphere',
    asukaProp: 'a vintage coffee cup at cafe table',
    shinjiProp: 'a closed investigative dossier folder',
  },
};

/**
 * Resolves post archetype based on category, frontmatter, slug, and title keywords
 */
function resolvePostArchetype(
  category: string,
  slug: string,
  title: string
): SceneArchetype {
  const text = `${category} ${slug} ${title}`.toLowerCase();

  // 1. Voice & acoustics
  if (
    text.includes('voice') ||
    text.includes('audio') ||
    text.includes('acoustic') ||
    text.includes('soundwave') ||
    text.includes('deepfake-audio')
  ) {
    return 'voice-and-acoustics';
  }

  // 2. Bot syntax & LLM punctuation
  if (
    text.includes('punctuation') ||
    text.includes('llm') ||
    text.includes('syntax') ||
    text.includes('em-dash') ||
    text.includes('spambot')
  ) {
    return 'bot-syntax';
  }

  // 3. Algo mechanics
  if (
    category === 'algo-mechanics' ||
    text.includes('elo') ||
    text.includes('slot-machine') ||
    text.includes('algorithm') ||
    text.includes('ranking') ||
    text.includes('shadowban')
  ) {
    return 'algo-mechanics';
  }

  // 4. Safety dossier, scams, catfishing, bot-farms
  if (
    category === 'safety-dossier' ||
    text.includes('scam') ||
    text.includes('pig-butchering') ||
    text.includes('crypto') ||
    text.includes('whatsapp') ||
    text.includes('reverse-image') ||
    text.includes('catfish') ||
    text.includes('military') ||
    text.includes('bot-farm') ||
    text.includes('checkmark')
  ) {
    return 'safety-dossier';
  }

  // 5. Default: Modern psychology, first dates, romantic essays
  return 'modern-psychology';
}

// ---------------------------------------------------------------------------
// 2. Fetch & Sharp Conversion Pipeline
// ---------------------------------------------------------------------------

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchImageBuffer(payload: {
  prompt: string;
  width: number;
  height: number;
  seed: number;
  nologo: boolean;
}, timeoutMs = 30000): Promise<Buffer> {
  // First attempt via POST (fastest and supports arbitrarily long prompts)
  try {
    const response = await axios.post('https://image.pollinations.ai/', payload, {
      responseType: 'arraybuffer',
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 FlirtCheck/2.0',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });
    return Buffer.from(response.data);
  } catch (postErr: any) {
    // Fallback to GET with truncated prompt if needed
    const safePrompt = encodeURIComponent(payload.prompt.slice(0, 1000));
    const getUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=${payload.width}&height=${payload.height}&nologo=true&seed=${payload.seed}`;
    const getRes = await axios.get(getUrl, {
      responseType: 'arraybuffer',
      timeout: timeoutMs,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 FlirtCheck/2.0',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });
    return Buffer.from(getRes.data);
  }
}

async function generateCoverForPost(
  slug: string,
  archetype: SceneArchetype,
  title: string,
  outputPath: string
): Promise<{ success: boolean; size: number; durationMs: number; archetype: SceneArchetype }> {
  const template = SCENE_TEMPLATES[archetype];

  // Specific contextual action prompt embedding the article theme
  const customActionPrompt = `${template.actionPrompt} Context topic: "${title}".`;

  const scene: SceneComposition = {
    title,
    actionPrompt: customActionPrompt,
    compositionNotes: template.compositionNotes,
    asukaProp: template.asukaProp,
    shinjiProp: template.shinjiProp,
  };

  const { prompt } = buildAntiScamComicPrompt(scene);
  const fullPrompt = `${prompt}. Negative: ${NEGATIVE_ANCHOR_V2}`;
  const seed = Math.floor(Math.random() * 900000) + 100000;

  const startTime = Date.now();
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const rawBuffer = await fetchImageBuffer({
        prompt: fullPrompt,
        width: 1200,
        height: 675,
        seed,
        nologo: true,
      }, 35000);

      if (rawBuffer.length < 2000) {
        throw new Error(`Downloaded buffer is suspiciously small (${rawBuffer.length} bytes)`);
      }

      // Convert & optimize with sharp strictly matching specs
      await sharp(rawBuffer)
        .resize(1200, 675, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      const durationMs = Date.now() - startTime;

      return {
        success: true,
        size: stats.size,
        durationMs,
        archetype,
      };
    } catch (err: any) {
      console.warn(
        `   ⚠️ [Attempt ${attempts}/${maxAttempts}] Failed for ${slug}: ${err.message}`
      );
      if (attempts < maxAttempts) {
        await sleep(3000 * attempts);
      }
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts for ${slug}`);
}

// ---------------------------------------------------------------------------
// 3. Batch Orchestrator
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const forceAll = args.includes('--all') || args.includes('--force');
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : Infinity;

  console.log('=================================================================');
  console.log('🎨 BATCH GENERATE COVERS (Asuka & Shinji Cinematic 16:9 WebP)');
  console.log('=================================================================');
  console.log(`Directory: ${POSTS_DIR}`);
  console.log(`Output:    ${OUTPUT_DIR}`);
  console.log(`Mode:      ${forceAll ? 'FORCE OVERWRITE (ALL)' : 'INCREMENTAL (MISSING ONLY)'}`);
  if (limit !== Infinity) console.log(`Limit:     ${limit} articles`);
  console.log('-----------------------------------------------------------------\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  console.log(`📚 Found ${files.length} total articles.`);

  // Parse files
  const tasks: Array<{
    file: string;
    slug: string;
    title: string;
    category: string;
    archetype: SceneArchetype;
    outputPath: string;
    exists: boolean;
  }> = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const fullPath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    const titleMatch = content.match(/^title:\s*["']?([^"'\r\n]+)["']?/m);
    const categoryMatch = content.match(/^category:\s*["']?([^"'\r\n]+)["']?/m);

    const title = titleMatch ? titleMatch[1].trim() : slug;
    const category = categoryMatch ? categoryMatch[1].trim() : 'safety-dossier';
    const archetype = resolvePostArchetype(category, slug, title);
    const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);

    const exists =
      fs.existsSync(outputPath) &&
      fs.statSync(outputPath).size > 5000 &&
      !outputPath.includes('default-cover.webp');

    tasks.push({
      file,
      slug,
      title,
      category,
      archetype,
      outputPath,
      exists,
    });
  }

  const pendingTasks = tasks.filter((t) => forceAll || !t.exists).slice(0, limit);

  console.log(`🎯 Existing valid covers: ${tasks.filter((t) => t.exists).length}`);
  console.log(`🚀 Covers queued for generation: ${pendingTasks.length}\n`);

  if (pendingTasks.length === 0) {
    console.log('✨ All covers are already generated and up to date! Nothing to do.');
    return;
  }

  let completed = 0;
  let failed = 0;

  for (let i = 0; i < pendingTasks.length; i++) {
    const task = pendingTasks[i];
    console.log(
      `[${i + 1}/${pendingTasks.length}] Generating: ${task.slug}.webp`
    );
    console.log(`   🏷️  Category:  ${task.category}  ->  Archetype: [${task.archetype}]`);
    console.log(`   📖 Title:     "${task.title}"`);

    try {
      const result = await generateCoverForPost(
        task.slug,
        task.archetype,
        task.title,
        task.outputPath
      );

      console.log(
        `   ✅ Saved: ${path.basename(task.outputPath)} (${(result.size / 1024).toFixed(1)} KB) in ${result.durationMs}ms\n`
      );
      completed++;
    } catch (err: any) {
      console.error(`   ❌ ERROR generating ${task.slug}: ${err.message}\n`);
      failed++;
    }

    // Polite rate-limit delay between generations
    if (i < pendingTasks.length - 1) {
      await sleep(2500);
    }
  }

  console.log('=================================================================');
  console.log(`🏁 Batch Generation Finished: ${completed} succeeded, ${failed} failed.`);
  console.log('=================================================================');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

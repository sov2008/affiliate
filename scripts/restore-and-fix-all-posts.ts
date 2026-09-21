import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

const POSTS_DIR = path.resolve(process.cwd(), 'blog/src/content/posts');
const IMAGES_DIR = path.resolve(process.cwd(), 'blog/public/images/posts');

console.log('🔄 Restoring and fixing all 39 blog post frontmatters from git commit 52a2f50...\n');

if (!fs.existsSync(POSTS_DIR)) {
  console.error(`❌ Posts directory not found: ${POSTS_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
let restoredCount = 0;

for (const file of files) {
  const currentFilePath = path.join(POSTS_DIR, file);
  const currentContent = fs.readFileSync(currentFilePath, 'utf8');
  const slug = file.replace(/\.md$/, '').toLowerCase();

  // Extract current body (which already has synthetic hallucinations removed)
  let currentBody = currentContent;
  const currentFmMatch = currentContent.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  if (currentFmMatch) {
    currentBody = currentFmMatch[1].trim();
  }

  // Fetch intact original frontmatter from git commit 52a2f50
  let originalRaw = '';
  try {
    originalRaw = execSync(`git show 52a2f50:blog/src/content/posts/${file}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  } catch (err) {
    console.warn(`⚠️ Could not fetch 52a2f50 for ${file}, using current content.`);
    originalRaw = currentContent;
  }

  let origFm: any = {};
  const origMatch = originalRaw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (origMatch) {
    try {
      origFm = yaml.load(origMatch[1]) || {};
    } catch (e: any) {
      console.error(`❌ YAML parse error in ${file}:`, e.message);
    }
  }

  // Clean title & description
  let title = (origFm.title && origFm.title !== '>-') ? String(origFm.title).trim() : '';
  if (!title) {
    // Try to derive title from slug
    title = slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  let description = (origFm.description && origFm.description !== '>-') ? String(origFm.description).trim() : '';
  if (!description) {
    description = `Investigative protocol on ${title} by Arthur Vance (Cheltenham Bureau). Verification guidelines and field telemetry.`;
  }

  const pubDate = origFm.pubDate ? String(origFm.pubDate).trim() : '2026-09-01';
  const category = origFm.category || 'safety-dossier';
  const caseId = origFm.caseId || `FC-${Math.floor(Math.random() * 899 + 100)}-DOS`;
  const classification = origFm.classification || 'PUBLIC INVESTIGATION DOSSIER // DECLASSIFIED 2026';
  const telemetryRisk = origFm.telemetryRisk || 'MEDIUM';
  const tags = Array.isArray(origFm.tags) && origFm.tags.length > 0 ? origFm.tags : ['Safety', 'Dating Advice', 'Verification'];
  const seoKeywords = Array.isArray(origFm.seoKeywords) && origFm.seoKeywords.length > 0 ? origFm.seoKeywords : [title];

  // Resolve cover image
  const expectedCover = `/images/posts/${slug}.webp`;
  const localImageFile = path.join(IMAGES_DIR, `${slug}.webp`);
  let finalCoverImage = expectedCover;

  if (!fs.existsSync(localImageFile)) {
    if (origFm.coverImage && fs.existsSync(path.join(process.cwd(), 'blog/public', origFm.coverImage))) {
      finalCoverImage = origFm.coverImage;
    } else if (origFm.image && fs.existsSync(path.join(process.cwd(), 'blog/public', origFm.image))) {
      finalCoverImage = origFm.image;
    } else {
      finalCoverImage = '/images/posts/default-cover.webp';
    }
  }

  const canonicalUrl = `https://flirtcheck.site/blog/${slug}/`;

  const newFrontmatter = `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
pubDate: "${pubDate}"
category: ${JSON.stringify(category)}
caseId: ${JSON.stringify(caseId)}
classification: ${JSON.stringify(classification)}
author: "Arthur Vance"
telemetryRisk: ${JSON.stringify(telemetryRisk)}
tags: ${JSON.stringify(tags)}
seoKeywords: ${JSON.stringify(seoKeywords)}
canonicalUrl: "${canonicalUrl}"
coverImage: "${finalCoverImage}"
image: "${finalCoverImage}"
draft: false
---

${currentBody}
`;

  fs.writeFileSync(currentFilePath, newFrontmatter, 'utf8');
  restoredCount++;
  console.log(`✅ Restored [${restoredCount}/${files.length}]: ${file} (Cover: ${finalCoverImage})`);
}

console.log(`\n🎉 Successfully restored all ${restoredCount} post frontmatters!`);

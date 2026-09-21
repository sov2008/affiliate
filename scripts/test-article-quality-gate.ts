import { ArticleQualityGateService } from '../core/src/services/articleQualityGate.service.js';

console.log('🧪 Starting Article Quality Gate Automated Test Suite...\n');

const qualityGate = ArticleQualityGateService.getInstance();

// 1. Synthetic Dirty Markdown with known AI garbage, clichés, and emoji headers
const dirtyMarkdown = `---
title: "How to Spot Romantic Deepfakes in 2026"
description: "A quick guide to dating safety."
pubDate: "2026-09-21"
author: "FlirtCheck Editorial Team"
tags: ["Safety", "AI"]
seoKeywords: ["deepfakes", "dating"]
canonicalUrl: "https://flirtcheck.site/blog/how-to-spot-romantic-deepfakes/"
draft: false
---

# How to Spot Romantic Deepfakes in 2026

In today's fast-paced digital world, online dating has become very popular. Love is... noticing when a smile fails to touch the eyes on a compressed video feed.

## 🔍 Key Takeaways for Profiling
- Never send funds.
- Check acoustic artifacts.

## 🛡️ Moving to Verified Platforms
If you want to be safe, visit [FlirtCheck Verified Portal](https://flirtcheck.site/portal). We achieved 98.4% accuracy with our tool. You can also analyze voices using VoiceGuard AI and check avatars using VisionScout.

Let's dive into the technical details of spectrogram telemetry. Working in Cheltenham, Arthur Vance analyzed network packet signals to detect artificial token generation. When audio packets drop unnaturally, it reveals synthetic voice cloning.

## ❓ Frequently Asked Questions (FAQ)
### How can I verify a match?
Always perform an unscripted video call and run the profile through our client-side calculator.

### What is the primary sign of an automated bot?
Delayed mechanical responses and immediate requests to transfer the chat to unmoderated messengers.

### Is reverse image searching effective?
Yes, multi-engine indexing exposes recycled model portfolios.

## Conclusion
Protect your emotional boundaries at all costs.
`;

console.log('--- TEST 1: Sanitization of Dirty AI Content ---');
const sanitizedResult = qualityGate.sanitize(dirtyMarkdown, { slug: 'how-to-spot-romantic-deepfakes' });

console.log(`Fixes applied (${sanitizedResult.fixesApplied.length}):`);
sanitizedResult.fixesApplied.forEach((fix, idx) => console.log(`  ${idx + 1}. ${fix}`));

// Verifications
const content = sanitizedResult.content;
const assertions: Array<{ name: string; condition: boolean }> = [
  { name: 'Author enforced to Arthur Vance', condition: /author:\s*"Arthur Vance"/i.test(content) },
  { name: 'Hallucinated portal link removed', condition: !/FlirtCheck Verified Portal/i.test(content) },
  { name: 'VoiceGuard AI removed', condition: !/VoiceGuard AI/i.test(content) },
  { name: 'VisionScout removed', condition: !/VisionScout/i.test(content) },
  { name: '98.4% metric removed', condition: !/98\.4%/i.test(content) },
  { name: 'Emojis stripped from ## Key Takeaways', condition: /^## Key Takeaways/m.test(content) },
  { name: 'Normalized FAQ heading without emojis', condition: /^## Frequently Asked Questions$/m.test(content) },
  { name: 'Duplicate top # H1 stripped from body', condition: !/\n# How to Spot/i.test(content) },
  { name: 'Client-side Dating Risk Calculator linked', condition: content.includes('[Dating Risk Calculator](/calculator/)') },
];

let allPassed = true;
for (const a of assertions) {
  if (a.condition) {
    console.log(`  ✅ PASS: ${a.name}`);
  } else {
    console.log(`  ❌ FAIL: ${a.name}`);
    allPassed = false;
  }
}

console.log('\n--- TEST 2: Validation of Dirty vs Sanitized Content ---');
const dirtyReport = qualityGate.validate(dirtyMarkdown);
console.log(`Dirty Markdown Validation (Expected: Invalid): isValid=${dirtyReport.isValid}, Score=${dirtyReport.score}/100`);
console.log(`Violations detected:`, dirtyReport.violations);

const sanitizedReport = qualityGate.validate(sanitizedResult.content);
console.log(`Sanitized Markdown Validation: isValid=${sanitizedReport.isValid}, Score=${sanitizedReport.score}/100`);
if (sanitizedReport.violations.length > 0) {
  console.log(`Remaining violations:`, sanitizedReport.violations);
}
if (sanitizedReport.warnings.length > 0) {
  console.log(`Warnings:`, sanitizedReport.warnings);
}

if (!dirtyReport.isValid && (sanitizedReport.isValid || sanitizedReport.score > dirtyReport.score)) {
  console.log('  ✅ PASS: Quality Gate distinguishes between dirty and clean content.');
} else {
  console.log('  ❌ FAIL: Quality Gate validation behavior unexpected.');
  allPassed = false;
}

if (allPassed) {
  console.log('\n🎉 ALL QUALITY GATE TESTS PASSED!');
  process.exit(0);
} else {
  console.error('\n❌ SOME QUALITY GATE TESTS FAILED!');
  process.exit(1);
}

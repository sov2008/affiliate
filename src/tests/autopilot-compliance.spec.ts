import fs from 'fs';
import path from 'path';
import { AutopilotStateService } from '../../core/src/services/autopilot-state.service.js';
import { PostPublicationComplianceService } from '../../core/src/services/post-compliance.service.js';
import { TelegramControlBot } from '../../core/src/services/telegram-control-bot.service.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runAutopilotComplianceTests() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Automated Content Publishing & Post-Compliance Verification Suite');
  console.log('🧪 ================================================================\n');

  // --- [TEST 1] Autopilot State Management & Thresholds ---
  console.log('--- [TEST 1] Autopilot State Management & Thresholds ---');
  const autopilot = AutopilotStateService.getInstance();
  autopilot.setAutoPublish(true);
  assert(autopilot.isAutoPublishEnabled() === true, 'Autopilot enable flag is true');

  assert(autopilot.shouldAutoApproveSnippet(1) === true, 'Low risk score (1) is auto-approved');
  assert(autopilot.shouldAutoApproveSnippet(5) === true, 'Acceptable risk score (5) is auto-approved');
  assert(autopilot.shouldAutoApproveSnippet(25) === false, 'High risk score (25) is blocked from auto-approval');

  autopilot.setAutoPublish(false);
  assert(autopilot.isAutoPublishEnabled() === false, 'Autopilot disable flag is false');
  assert(autopilot.shouldAutoApproveSnippet(1) === false, 'When autopilot is off, no snippets are auto-approved (HITL required)');
  autopilot.setAutoPublish(true);

  // --- [TEST 2] Post-Publication Compliance Gate: Valid Content ---
  console.log('\n--- [TEST 2] Post-Publication Compliance Gate: Valid Content ---');
  const compliance = PostPublicationComplianceService.getInstance();

  const validMarkdown = `---
title: "Verification Heuristics: Detecting Synthetic Activity in 2026"
description: "Forensic breakdown of digital safety protocols and unscripted tests."
author: "Arthur Vance"
---

# Forensic Guide to Digital Safety

When communicating on modern platforms, synthetic profiles can be identified through telemetry:
1. Inconsistent response timing.
2. Pressure to migrate to unmonitored channels.

[Explore Dating Safety Advice](/go/dating)
`;

  const validHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Verification Heuristics: Detecting Synthetic Activity in 2026</title>
  <meta name="description" content="Forensic breakdown of digital safety protocols." />
  <meta property="og:image" content="https://flirtcheck.site/images/cover.webp" />
</head>
<body>
  <h1>Forensic Guide to Digital Safety</h1>
  <p>Standardized verification checks for online communication.</p>
  <a href="/go/dating" target="_blank" rel="nofollow sponsored">Access Verified Singles Portal</a>
</body>
</html>`;

  const validResult = await compliance.verifyBlogPost(
    'https://flirtcheck.site/blog/test-valid-post/',
    'test-valid-post',
    validMarkdown,
    validHtml
  );

  assert(validResult.isValid === true, 'Valid article passes compliance verification');
  assert(validResult.hasCyrillic === false, 'Strict English confirmed (no Cyrillic)');
  assert(validResult.compliantLinks === 1, 'Monetization link correctly identified as compliant');
  assert(validResult.nonCompliantLinks.length === 0, 'No broken or missing attributes');

  // --- [TEST 3] Post-Publication Compliance Gate: Cyrillic Violation ---
  console.log('\n--- [TEST 3] Post-Publication Compliance Gate: Cyrillic Violation ---');
  const cyrillicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>English Title with Русский текст</title>
  <meta name="description" content="Valid description" />
</head>
<body>
  <p>This is a guide, but here is a русское слово in the body.</p>
  <a href="/go/dating" target="_blank" rel="nofollow sponsored">Link</a>
</body>
</html>`;

  const cyrillicResult = await compliance.verifyBlogPost(
    'https://flirtcheck.site/blog/test-cyrillic-post/',
    'test-cyrillic-post',
    undefined,
    cyrillicHtml
  );

  assert(cyrillicResult.isValid === false, 'Article with Cyrillic text is blocked by Strict English Gate');
  assert(cyrillicResult.hasCyrillic === true, 'Cyrillic violation detected');
  assert(cyrillicResult.errors.some((e) => e.includes('Strict English')), 'Strict English error recorded');

  // --- [TEST 4] Post-Publication Compliance Gate: Missing rel/target ---
  console.log('\n--- [TEST 4] Post-Publication Compliance Gate: Missing rel/target ---');
  const missingAttrsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Clean Title Without Cyrillic</title>
  <meta name="description" content="Valid description" />
</head>
<body>
  <p>Clean text without Cyrillic.</p>
  <a href="/click?cid=123">Bare Monetization Link Missing Target and Rel</a>
</body>
</html>`;

  const missingAttrsResult = await compliance.verifyBlogPost(
    'https://flirtcheck.site/blog/test-missing-attrs/',
    'test-missing-attrs',
    undefined,
    missingAttrsHtml
  );

  assert(missingAttrsResult.isValid === false, 'Link missing target="_blank" and rel is blocked');
  assert(missingAttrsResult.nonCompliantLinks.length > 0, 'Non-compliant link captured in report');

  // --- [TEST 5] Telegram Bot Interactive Autopilot Commands ---
  console.log('\n--- [TEST 5] Telegram Bot Interactive Autopilot Commands ---');
  TelegramControlBot.resetInstance();
  const bot = TelegramControlBot.getInstance({
    botToken: 'TEST_BOT_TOKEN_AUTOPILOT',
    defaultChatId: '12345678',
    allowedUserIds: ['12345678'],
  });

  const statusMsg = await bot.handleCommand({
    message_id: 101,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/autopilot',
  });
  assert(statusMsg.includes('УПРАВЛЕНИЕ АВТОНОМНЫМ АВТОПИЛОТОМ'), '/autopilot returns status card');

  const onMsg = await bot.handleCommand({
    message_id: 102,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/autopilot on',
  });
  assert(onMsg.includes('АВТОПИЛОТ ВКЛЮЧЕН'), '/autopilot on confirms activation');
  assert(autopilot.isAutoPublishEnabled() === true, 'Autopilot is verified enabled');

  const offMsg = await bot.handleCommand({
    message_id: 103,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/autopilot off',
  });
  assert(offMsg.includes('АВТОПИЛОТ ОТКЛЮЧЕН'), '/autopilot off confirms deactivation');
  assert(autopilot.isAutoPublishEnabled() === false, 'Autopilot is verified disabled');

  // Re-enable for production
  autopilot.setAutoPublish(true);

  console.log('\n================================================================');
  console.log(`📊 AUTOPILOT & COMPLIANCE SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAutopilotComplianceTests().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});

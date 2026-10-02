import fs from 'fs';
import path from 'path';
import { AIGateway } from '../core/src/services/aiGateway.js';

async function regenerate() {
  console.log('Regenerating coffee vs dinner article with Gemini 3.5 Flash...');

  const systemPrompt = `You are Arthur Vance, Senior Essayist and Lead Analyst at FlirtCheck.site (Cheltenham Bureau).
You write observant, witty, and grounded dating guides that cut through modern dating app illusions.

CATEGORY: first-dates
TOPIC: Coffee vs Dinner for Date One: Why Low-Investment Venues Yield Better Chemistry
KEYWORD: coffee vs dinner first date low investment venues
SEO KEYWORDS: why dinner first dates are bad idea, best low pressure first date ideas, coffee date etiquette online dating, first date psychology venue choice
MOTTO: "Love is... finding magic over a simple morning coffee with zero forced expectations."

CORE EDITORIAL REQUIREMENTS:
1. TITLE: # Coffee vs Dinner on a First Date: Why Low-Investment Venues Yield Better Chemistry
2. OPENING SIGNATURE: Open directly with the motto: «Love is... finding magic over a simple morning coffee with zero forced expectations.»
3. BODY STRUCTURE:
   - Field Hook & Context: The psychological pressure of dinner dates vs low-stakes coffee dates. Why locking two strangers into a 90-minute multi-course meal is a terrible recipe for natural connection.
   - Key Takeaways Dossier: 3-4 bullet points summarizing venue selection strategy.
   - Deep Tactical Sections with H3 headers:
     * The Trap of Performative Romance (Why expensive meals create artificial expectations and economic awkwardness).
     * Time-Compression & Graceful Exits (How a 45-minute coffee lets you extend if there's chemistry, or leave politely without guilt).
     * Genuine Chemistry vs Staged Ambience (Observing real human micro-cues without silverware clatter or menu anxiety).
     * Essential Public Safety Rules (Public venues, independent arrival, leaving a plan with a friend).
   - Natural Callout to [Dating Risk Calculator](/calculator/) to evaluate pre-date profile consistency if meeting someone from an app.
   - Frequently Asked Questions: ## Frequently Asked Questions with 3 practical Q&A pairs.
4. STRICT PROHIBITIONS:
   - NEVER suggest recording conversations or running Audacity spectrograms!
   - NO fake tools or fake portals (no VoiceGuard, no VisionScout, no FlirtCheck Verified Portal).
   - NO corporate AI clichés ("In today's fast-paced world", "Let's dive into", "In conclusion").
   - NO emojis or keycaps in titles or headings.
5. TONE: Deadpan British wit, observant, empathetic, warm, completely human.
6. LENGTH: 900 - 1200 words.`;

  const userPrompt = `Write the complete Markdown content for the article. Output ONLY Markdown starting with the main # Title.`;

  const { text, telemetry } = await AIGateway.generateText(systemPrompt, userPrompt, {
    temperature: 0.72,
    maxTokens: 3000
  });

  console.log(`Generated via ${telemetry.provider} (${telemetry.model}) in ${telemetry.latencyMs}ms!`);

  const titleMatch = text.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "Coffee vs Dinner on a First Date: Why Low-Investment Venues Yield Better Chemistry";
  const bodyMarkdown = text.replace(/^#\s+.+$/m, '').trim();

  const frontmatter = `---
title: ${JSON.stringify(title)}
description: "Why coffee and low-investment venues consistently outperform formal dinner dates in 2026. Tactical venue psychology, conversational pacing, and safety rules."
pubDate: "2026-10-02"
category: "first-dates"
caseId: "FC-399-DAT"
classification: "UNRESTRICTED // PUBLIC INTELLIGENCE"
author: "Arthur Vance"
telemetryRisk: "LOW"
motto: "Love is... finding magic over a simple morning coffee with zero forced expectations."
tags: ["First Date Prep", "Venue Choice", "Low Pressure Dating", "Safety Protocol"]
seoKeywords: ["why dinner first dates are bad idea", "best low pressure first date ideas", "coffee date etiquette online dating", "first date psychology venue choice"]
canonicalUrl: "https://flirtcheck.site/coffee-vs-dinner-date-one-why-low-investment-venues-win/"
coverImage: "/images/posts/coffee-vs-dinner-date-one-why-low-investment-venues-win.webp"
draft: false
---

${bodyMarkdown}
`;

  const targetPath = path.resolve('blog/src/content/posts/coffee-vs-dinner-date-one-why-low-investment-venues-win.md');
  fs.writeFileSync(targetPath, frontmatter, 'utf8');
  console.log(`✅ Successfully saved clean article to: ${targetPath}`);
}

regenerate().catch(console.error);

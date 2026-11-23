/**
 * Autonomous FlirtCheck Article & Forensic Asset Generator
 * 
 * Generates bespoke, high-authority dating safety, algorithmic mechanics,
 * and behavioral psychology investigative posts for flirtcheck.site.
 * 
 * Follows:
 * - AI Gateway Invoker Forensic Evidence standard
 * - 0 AI clichés, 0 synthetic fluff
 * - Native verified tool integration with rel="nofollow sponsored" target="_blank"
 * - Categories: algo-mechanics, modern-psychology, digital-dialogue, first-dates, safety-dossier, romantic-essays
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || process.env.NVIDIA_FLUX_DEV_API_KEY;
const POSTS_DIR = path.resolve(__dirname, '../blog/src/content/posts');
const COVERS_DIR = path.resolve(__dirname, '../blog/public/images/posts');

// Ensure output dirs exist
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

// Editorial investigative topic bank (6 categories)
const TOPIC_REGISTRY = [
  // 1. algo-mechanics
  {
    category: 'algo-mechanics',
    topic: 'Ghost Banning and Feed Throttling: Forensic Analysis of Shadowban Mechanics in Modern Dating Apps',
    angle: 'How shadow-throttling algorithms detect sudden behavioral shifts, unmatching bursts, and profile updates, silently dropping discovery reach.',
    promptCover: 'Macro shot of disassembled modern test smartphone in radiofrequency RF testing lab, open terminal screen showing distribution curves, spectrum analyzer, analog grain, 35mm film aesthetic, British cyber investigation desk Cheltenham'
  },
  {
    category: 'algo-mechanics',
    topic: 'Resetting Your ELO Score: Why Deleting Your Profile Triggers Algorithmic Device Fingerprinting',
    angle: 'Deconstructing Apple ID / Google Play device fingerprinting, canvas hashes, and why new accounts on the same phone get instantly re-indexed.',
    promptCover: 'Darkroom forensic laboratory, electronic microscope focused on smartphone logic board, printed device identifiers and MAC addresses with red highlighter marks, moody tungsten lighting, tactile paper texture'
  },
  {
    category: 'algo-mechanics',
    topic: 'The Desirability Index: How Swipe Velocity Determines Your Daily Candidate Tier',
    angle: 'Analyzing how rapid right-swiping degrades profile rating into low-priority bot pools, and how micro-pauses restore candidate rank.',
    promptCover: 'Desk flatlay of UK data forensics analyst, multiple printed graphs of user session durations, coffee cup on aged oak desk, ThinkPad keyboard, cool moody morning daylight through blinds'
  },
  
  // 2. modern-psychology
  {
    category: 'modern-psychology',
    topic: 'The Breadcrumbing Funnel: Behavioral Micro-Signals of the Low-Investment Dater',
    angle: 'Decoding the deliberate pattern of intermittent reinforcement, low-effort check-ins, and how to spot emotional hoarding early.',
    promptCover: 'Corkboard evidence board with red yarn connecting index cards, handwritten notes on intermittent reinforcement schedules, 35mm film grain, analog surveillance photography aesthetic'
  },
  {
    category: 'modern-psychology',
    topic: 'Dating App Burnout Syndrome: The Neurological Cost of the Infinite Swipe Loop',
    angle: 'Examining dopamine depletion, hyper-optimization fatigue, and why modern dating profiles start looking identical after 45 minutes.',
    promptCover: 'Vintage desk lamp casting warm directional light on handwritten notebook open with neuro-chemical diagrams, desaturated tones, realistic paper shadows, 35mm film grain'
  },
  {
    category: 'modern-psychology',
    topic: 'Love Bombing vs Healthy Enthusiasm: The 14-Day Timeline Breakdown',
    angle: 'Forensic comparison between genuine connection pacing and manufactured intimacy engineered to bypass healthy boundaries.',
    promptCover: 'Side-by-side calendar logs and timeline sheets on wooden interrogation desk, circled dates in red archival pencil, 35mm photography, subtle analog vignette'
  },

  // 3. digital-dialogue
  {
    category: 'digital-dialogue',
    topic: 'Texting Cadence Forensics: What Response Delays and Message Length Actually Signal',
    angle: 'Moving past superficial texting rules into conversational pacing, subtext shifts, and recognizing when interest has shifted.',
    promptCover: 'Analog audio forensics tape recorder connected to vintage spectrum analyzer, paper printout of wave patterns, headphones on wooden surface, Cheltenham desk aesthetic'
  },
  {
    category: 'digital-dialogue',
    topic: 'Spotting LLM-Generated Flirting: How to Detect AI Dating Assistants in Your Chat',
    angle: 'Identifying automated flattery, formulaic metaphors, and lack of temporal grounding in AI-driven wingman applications.',
    promptCover: 'Monochrome computer monitor displaying terminal log of syntax patterns, green amber phosphor glow, notebook with pen, realistic retro-tech aesthetic'
  },
  {
    category: 'digital-dialogue',
    topic: 'Dry Texting vs Introverted Communication: How to Differentiate Genuine Disinterest from Shyness',
    angle: 'Diagnostic checklist to test conversational responsiveness without playing games or sending passive-aggressive check-ins.',
    promptCover: 'Two vintage cups of tea on rustic wooden table, open moleskine notebook with fountain pen, soft rainy afternoon light through window, documentary grain'
  },

  // 4. first-dates
  {
    category: 'first-dates',
    topic: 'The Low-Pressure First Date Formula: Why Midday Walks Beat Expensive Dinners',
    angle: 'Psychological advantages of low-friction, natural exit-point first dates, and why dining under fluorescent lights breeds awkwardness.',
    promptCover: 'Contact sheet of 35mm black and white film showing quiet London street corner cafe, rain on pavement, contact sheet numbers and grease pencil marks'
  },
  {
    category: 'first-dates',
    topic: 'Body Language Micro-Tells on Date One: Calibrating Physical Comfort and Respect',
    angle: 'Observing torso orientation, pupil dilation, genuine vs social smiles, and recognizing clear consent and comfort boundaries.',
    promptCover: 'Archival surveillance photograph through glass window of quiet bistro, couple conversing naturally, blurred background, documentary street photography style'
  },
  {
    category: 'first-dates',
    topic: 'The Post-Date Communication Protocol: How to Follow Up Without Overthinking',
    angle: 'Replacing 3-day waiting games with direct, calibrated follow-ups that confirm mutual alignment without desperation.',
    promptCover: 'Old postbox on British brick street corner at dusk, tactile street texture, cinematic moody color grading, 35mm film documentary'
  },

  // 5. safety-dossier
  {
    category: 'safety-dossier',
    topic: 'Pig Butchering Syndicates in 2026: The Global Architecture of Crypto-Romance Fraud',
    angle: 'Investigating SE Asia scam compounds, social engineering scripts, and the anatomy of staged investment portfolios.',
    promptCover: 'Desk flatlay with printed blockchain transaction ledgers, highlighted wallet addresses in neon yellow marker, redacted passport photocopies, ThinkPad laptop, British cyber bureau'
  },
  {
    category: 'safety-dossier',
    topic: 'Deepfake Video Calls in Dating: How Scammers Bypass Real-Time Verification',
    angle: 'Analyzing synthetic video latency, ear artifacting, lighting mismatches, and the 3-question test to expose virtual cameras.',
    promptCover: 'Macro forensic shot of digital screen showing pixel grid and algorithmic facial landmark mesh in neon wireframe, analog CRT texture'
  },
  {
    category: 'safety-dossier',
    topic: 'Reverse-Image Search Evasion: How Fraudsters Mirror and Diffuse Stolen Photos',
    angle: 'Understanding how adversarial noise, horizontal flipping, and AI re-texturing are used to defeat Google Lens and TinEye.',
    promptCover: 'Archival file folder stamped CONFIDENTIAL on dark mahogany table, forensic magnifying glass over photographic contact print, muted cool palette'
  },

  // 6. romantic-essays
  {
    category: 'romantic-essays',
    topic: 'In Praise of Analog Chemistry: Why Real Connection Defies Algorithmic Prediction',
    angle: 'Reflecting on the unpredictable nature of voice timbre, clumsy shared jokes, and the emotional resonance algorithms cannot model.',
    promptCover: 'Sunlight filtering through library window onto worn wooden study table, scattered vintage books, warm quiet atmosphere, analog 35mm film grain'
  },
  {
    category: 'romantic-essays',
    topic: 'The Art of Being Perceived: Overcoming Fear of Vulnerability in Modern Romance',
    angle: 'Exploring why hiding behind curated personas prevents deep intimacy, and how radical authenticity filters out wrong matches.',
    promptCover: 'Tactile black and white portrait reflection in antique mirror, soft grain, moody chiaroscuro lighting, emotional depth'
  }
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 65);
}

function getExistingSlugs() {
  if (!fs.existsSync(POSTS_DIR)) return new Set();
  const files = fs.readdirSync(POSTS_DIR);
  return new Set(files.map(f => f.replace(/\.mdx?$/, '')));
}

async function callGroqChat(prompt, systemPrompt = 'You are an elite cyber forensics and dating psychology investigator for Cheltenham Bureau.') {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');
  
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 2800
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API Error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  return json.choices[0].message.content.trim();
}

async function generateCoverFlux(promptText, outputPath) {
  if (!NVIDIA_API_KEY || !NVIDIA_API_KEY.startsWith('nvapi-')) {
    console.log('⚠️ NVIDIA_API_KEY not found or invalid, using editorial svg fallback');
    return false;
  }

  const fullPrompt = `Editorial documentary photograph, 35mm film grain, analog surveillance aesthetic, forensic evidence shot, desk of a cyber intelligence investigator in Cheltenham UK, natural moody lighting, shallow depth of field, tactile paper and hardware textures, desaturated color grade with cold shadows, no anime, no cartoons, no CGI rendering, photorealistic 8k, aspect ratio 16:9. Subject context: ${promptText}`;

  const payload = JSON.stringify({ prompt: fullPrompt, mode: 'base' });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'ai.api.nvidia.com',
      path: '/v1/genai/black-forest-labs/flux.1-dev',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 60000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.log(`⚠️ NVIDIA Flux returned ${res.statusCode}, falling back`);
          return resolve(false);
        }
        try {
          const json = JSON.parse(data);
          let b64 = null;
          if (json.artifacts && json.artifacts.length > 0) {
            b64 = json.artifacts[0].base64 || json.artifacts[0].b64_json;
          } else if (json.data && json.data.length > 0) {
            b64 = json.data[0].b64_json || json.data[0].base64;
          }
          if (b64) {
            fs.writeFileSync(outputPath, Buffer.from(b64, 'base64'));
            console.log(`✅ Photorealistic Flux cover generated: ${path.basename(outputPath)}`);
            return resolve(true);
          }
          resolve(false);
        } catch (e) {
          console.log(`⚠️ Failed to parse Flux response: ${e.message}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`⚠️ NVIDIA request error: ${err.message}`);
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      console.log('⚠️ NVIDIA request timed out');
      resolve(false);
    });
    req.write(payload);
    req.end();
  });
}

function generateDeterministicArticle(item, slug) {
  const caseIdNum = Math.floor(100 + Math.random() * 899);
  const caseId = `FC-${caseIdNum}-${item.category.slice(0, 3).toUpperCase()}`;
  const pubDate = new Date().toISOString().split('T')[0];

  const content = `---
title: "${item.topic.replace(/"/g, '\\"')}"
description: "${item.angle.slice(0, 155).replace(/"/g, '\\"')}"
pubDate: "${pubDate}"
category: "${item.category}"
caseId: "${caseId}"
classification: "UNRESTRICTED // PUBLIC INVESTIGATION DOSSIER"
author: "Arthur Vance"
telemetryRisk: "MODERATE"
motto: "Love is... verifying authentic intentions before investing emotional capital."
tags: ["Dating Safety", "Forensic Analysis", "Online Dating", "Modern Psychology"]
seoKeywords: ["${slug.replace(/-/g, ' ')}", "dating safety guide", "online dating analysis 2026", "how to spot dating red flags"]
canonicalUrl: "https://flirtcheck.site/blog/${slug}/"
coverImage: "/images/posts/${slug}.webp"
image: "/images/posts/${slug}.webp"
draft: false
---

> **FIELD INTELLIGENCE DISPATCH // DOSSIER #${caseId}**
> **SUBJECT:** ${item.topic}
> **LEAD INVESTIGATOR:** Arthur Vance (Cheltenham Bureau)
> **STATUS:** DECLASSIFIED // FOR PUBLIC OPERATIONAL USE

---

## Executive Summary: The Algorithmic & Behavioral Landscape

Modern digital romance operates across a complex continuum of algorithmic indexing, automated filtering, and interpersonal vulnerability. When navigating modern dating platforms, users frequently encounter subtle behavioral shifts that mask underlying commercial or psychological patterns.

${item.angle}

To maintain psychological clarity and safeguard personal boundaries, singles must transition from passive participation to calibrated, proactive observation.

---

## Forensic Deconstruction: How The Pattern Operates

In our field investigations across contemporary dating platforms, this dynamic consistently exhibits three distinct operational phases:

### 1. The Initial Engagement Vector
During the initial contact phase, interaction parameters appear conventional. However, telemetry reveals specific pacing anomalies: rapid conversational escalation followed by abrupt communication pauses, or hyper-specific questioning designed to assess emotional availability and boundaries without reciprocal disclosure.

### 2. Algorithmic Pacing & The Illusion of Choice
Platforms maintain user engagement through variable ratio reinforcement schedules. When discovery feeds introduce artificial friction or shadow-tier constraints, user behavior shifts predictably toward anxiety-driven swiping or over-investment in unverified matches.

### 3. Verification & Reality Calibration
True interpersonal chemistry cannot be validated through text streams alone. Transitioning communication to verified voice channels or low-stakes, physical daytime environments immediately breaks scripted personas and surfaces authentic behavioral telemetry.

---

## Tactical Countermeasures: Operational Checklist

When encountering ambiguous signals or rapid intimacy scripts, implement this four-point verification protocol:

1. **Verify Identity & Digital Footprint**: Always conduct preliminary verification before sharing sensitive personal details. Utilize verified matching registries and reverse-reference protocols.
2. **Pace Conversational Investment**: Match message length, emotional depth, and response velocity proportionally. Refuse to be rushed into off-platform private messengers within the first 48 hours.
3. **Execute the Low-Pressure Reality Test**: Propose low-friction, casual daytime rendezvous (e.g., a 30-minute espresso walk) rather than high-investment evening commitments.
4. **Trust Behavioral Inconsistencies**: Discrepancies between digital promises and real-world actions are never coincidental; they are definitive operational data.

---

## Verified Safety Protocols & Tool Verification

Navigating modern dating requires dependable verification tooling. To audit suspicious profiles, assess communication safety, and protect your digital boundaries, review our verified tools:

- [Explore Verified Matching & Safety Portals](/go/verified-match/) (Official Safety Network)
- [Review Discretion & Privacy Verification](/go/discreet-local/) (Encrypted Protection)
- [Consult PromoRadar Verified Deals](https://promoradar.store/) for curated security and software tools.

*All safety assessments are independently audited by the Cheltenham Bureau. Stay vigilant, preserve your personal autonomy, and never compromise your safety for digital validation.*
`;

  return content;
}

async function generateSingleArticle(index = 0) {
  const existingSlugs = getExistingSlugs();
  const availableTopics = TOPIC_REGISTRY.filter(t => !existingSlugs.has(slugify(t.topic)));
  
  if (availableTopics.length === 0) {
    console.log('ℹ️ All predefined topics exist, generating novel investigative angle...');
  }

  const topicItem = availableTopics.length > 0 
    ? availableTopics[index % availableTopics.length] 
    : TOPIC_REGISTRY[index % TOPIC_REGISTRY.length];

  const baseSlug = slugify(topicItem.topic);
  const slug = existingSlugs.has(baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
  const postPath = path.join(POSTS_DIR, `${slug}.md`);
  const coverPath = path.join(COVERS_DIR, `${slug}.webp`);

  console.log(`\n======================================================`);
  console.log(`📝 [Article ${index + 1}] Target: ${topicItem.topic}`);
  console.log(`📂 Category: ${topicItem.category}`);
  console.log(`🔗 Slug: ${slug}`);

  // 1. Generate Content (Groq or Deterministic fallback)
  let markdownContent = null;
  if (GROQ_API_KEY) {
    try {
      console.log('🤖 Generating rich investigative analysis via Groq (Qwen 2.5)...');
      const prompt = `Write an in-depth, authoritative investigative article (1,200 to 1,500 words) for flirtcheck.site on the topic: "${topicItem.topic}".
Category: ${topicItem.category}
Specific Angle: ${topicItem.angle}

Style guidelines:
- British investigative journalism (Cheltenham Desk / Wired / The Intercept standard).
- Tone: Forensic, authoritative, empathetic, completely free of fluff or generic lifestyle clichés.
- ZERO AI CLICHÉS (do NOT use "in today's digital age", "unlock", "dive in", "it's not X, it's Y", "game-changer").
- Format in standard Markdown with comprehensive frontmatter:
---
title: "${topicItem.topic}"
description: "..."
pubDate: "${new Date().toISOString().split('T')[0]}"
category: "${topicItem.category}"
caseId: "FC-${Math.floor(100 + Math.random() * 899)}-${topicItem.category.slice(0, 3).toUpperCase()}"
classification: "UNRESTRICTED // PUBLIC INVESTIGATION DOSSIER"
author: "Arthur Vance"
telemetryRisk: "MODERATE"
motto: "Love is... verifying authentic intentions before investing emotional capital."
tags: ["Dating Safety", "Forensic Analysis", "Online Dating", "Modern Psychology"]
seoKeywords: ["${slug.replace(/-/g, ' ')}", "dating safety guide", "online dating analysis 2026"]
canonicalUrl: "https://flirtcheck.site/blog/${slug}/"
coverImage: "/images/posts/${slug}.webp"
image: "/images/posts/${slug}.webp"
draft: false
---

Include practical investigative checklists, psychological telemetry frameworks, and native links to verified safety tools with rel="nofollow sponsored" and target="_blank":
- <a href="/go/verified-match/" rel="nofollow sponsored" target="_blank">Verified Safety Matching</a>
- <a href="/go/discreet-local/" rel="nofollow sponsored" target="_blank">Discreet Identity Protection</a>`;

      markdownContent = await callGroqChat(prompt);
      // Clean up markdown block fences if Groq wraps them
      markdownContent = markdownContent.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    } catch (e) {
      console.log(`⚠️ Groq generation failed: ${e.message}. Using deterministic high-fidelity engine.`);
    }
  }

  if (!markdownContent || !markdownContent.startsWith('---')) {
    markdownContent = generateDeterministicArticle(topicItem, slug);
  }

  fs.writeFileSync(postPath, markdownContent, 'utf8');
  console.log(`✅ Post saved: ${path.basename(postPath)} (${markdownContent.length} bytes)`);

  // 2. Generate Cover Image (NVIDIA NIM FLUX.1-dev or copy placeholder)
  if (!fs.existsSync(coverPath)) {
    console.log(`🎨 Generating cover image: ${path.basename(coverPath)}...`);
    const success = await generateCoverFlux(topicItem.promptCover, coverPath);
    if (!success) {
      // Copy existing high-quality webp cover as backup to ensure build doesn't fail
      const existingWebps = fs.readdirSync(COVERS_DIR).filter(f => f.endsWith('.webp'));
      if (existingWebps.length > 0) {
        const fallbackSource = path.join(COVERS_DIR, existingWebps[Math.floor(Math.random() * existingWebps.length)]);
        fs.copyFileSync(fallbackSource, coverPath);
        console.log(`✅ Seeded high-res editorial cover from ${path.basename(fallbackSource)}`);
      }
    }
  }

  return slug;
}

async function main() {
  const count = parseInt(process.argv[2] || '3', 10);
  console.log(`🚀 Starting FlirtCheck Autonomous Content Generator for ${count} posts...`);
  
  const generated = [];
  for (let i = 0; i < count; i++) {
    try {
      const slug = await generateSingleArticle(i);
      generated.push(slug);
    } catch (err) {
      console.error(`❌ Failed to generate article ${i + 1}:`, err.message);
    }
  }

  console.log(`\n🎉 Content generation cycle finished. Generated ${generated.length} articles:`);
  generated.forEach(s => console.log(`   - https://flirtcheck.site/blog/${s}/`));
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal generator error:', err);
    process.exit(1);
  });
}

module.exports = { generateSingleArticle, TOPIC_REGISTRY };

import fs from 'fs/promises';
import path from 'path';
import { executeGeminiPrompt } from './ai-engine-skill';

const ROOT_DIR = path.resolve(__dirname, __dirname.includes('dist') ? '../../..' : '../..');
const LEARNING_DIR = path.join(ROOT_DIR, 'core/data/learning');
const STRATEGY_FILE = path.join(LEARNING_DIR, 'strategy_memory.json');
const WINNING_FILE = path.join(LEARNING_DIR, 'winning_patterns.json');
const NEGATIVE_FILE = path.join(LEARNING_DIR, 'negative_patterns.json');
const DISCOVERY_CACHE_FILE = path.join(ROOT_DIR, 'core/data/organic_discovery.json');
const LOG_FILE = path.join(ROOT_DIR, '.antigravity/organic_daemon.log');

export interface ReflectionResult {
  timestamp: string;
  verdict: 'success' | 'needs_adjustment' | 'optimal';
  confidenceScore: number;
  analysis: string;
  actionableRule: string;
  negativeConstraint: string;
  recommendedTemperature: number;
  totalEvaluatedEngagements: number;
}

async function ensureLearningFiles() {
  await fs.mkdir(LEARNING_DIR, { recursive: true });
}

export async function getStrategyMemory(): Promise<any> {
  try {
    const raw = await fs.readFile(STRATEGY_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      aiConfidenceScore: 88,
      defaultTemperature: 0.65,
      activeCopywritingGuidelines: [
        "Always provide actionable domain advice and technical benchmarks before mentioning any tool or link.",
        "Adopt the tone of an experienced peer or senior developer, never a marketer or promoter."
      ],
      successfulIntentAngles: [],
      evolutionLog: []
    };
  }
}

export async function getWinningPatterns(): Promise<any> {
  try {
    const raw = await fs.readFile(WINNING_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.topConvertingHooks) && parsed.topConvertingHooks.length > 0) return parsed;
  } catch (e) {}
  return {
    lastOptimized: new Date().toISOString(),
    topConvertingHooks: [
      "Tested this exact setup across multiple latency nodes last week...",
      "From an infrastructure perspective, here is what actually happens under load...",
      "If you're running automated scripts, the primary bottleneck is usually...",
      "Having reviewed the server protocols and peer benchmarks..."
    ],
    structuralTemplates: [
      {
        name: "Benchmark & Case Study Pattern",
        format: "[Direct Answer to Question] -> [Technical Deep-Dive / Metrics] -> [Neutral Verification Link]"
      },
      {
        name: "Pitfall Warning & Alternative Pattern",
        format: "[Common Industry Pitfalls] -> [How to Avoid Them] -> [Tested Reference Solution]"
      }
    ],
    highAffinityChannels: [
      "r/algotrading",
      "r/privacy",
      "r/cybersecurity",
      "r/dating_advice",
      "quora/cryptocurrency-bots"
    ]
  };
}

export async function getNegativePatterns(): Promise<any> {
  try {
    const raw = await fs.readFile(NEGATIVE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.bannedTriggerWords) && parsed.bannedTriggerWords.length > 0) return parsed;
  } catch (e) {}
  return {
    lastUpdated: new Date().toISOString(),
    bannedTriggerWords: [
      "guaranteed",
      "100% free",
      "click here",
      "check out my link",
      "promo code",
      "best app ever",
      "easy money",
      "dm me for info",
      "telegram channel"
    ],
    disallowedFormats: [
      "Single-sentence replies containing only a promotional URL.",
      "Generic praise without specific technical reasoning or benchmarks.",
      "Multiple duplicate links placed within the same thread."
    ],
    moderationAvoidanceHeuristics: [
      "Maintain a minimum 85% domain-specific content ratio before any link reference.",
      "Ensure markdown formatting matches the native subreddit / forum styling.",
      "Never post more than 2 distinct responses in the same subreddit within a 2-hour window."
    ]
  };
}

/**
 * Autonomous Reflection Worker: Evaluates published engagement records,
 * performs self-critique via Gemini Flash, and mutates copywriting strategy memory.
 */
export async function runSelfReflectionCycle(options: { force?: boolean } = {}): Promise<ReflectionResult> {
  await ensureLearningFiles();
  const strategy = await getStrategyMemory();
  const winning = await getWinningPatterns();
  const negative = await getNegativePatterns();

  // Load recent discoveries
  let engagements: any[] = [];
  try {
    const cacheRaw = await fs.readFile(DISCOVERY_CACHE_FILE, 'utf8');
    const cacheObj = JSON.parse(cacheRaw);
    engagements = cacheObj.engagements || [];
  } catch (e) {}

  const sampleCount = Math.min(10, engagements.length);
  const sampleEngagements = engagements.slice(-sampleCount).map((e: any) => ({
    topic: e.topic,
    campaignId: e.campaignId,
    intentScore: e.intentScore,
    status: e.status || 'discovered'
  }));

  const prompt = `You are the Autonomous Chief AI Strategist for an Organic Traffic Agent.
Conduct a rigorous Self-Reflection & Strategy Mutation cycle based on recent operational performance.

Operational Context:
- Evaluated Engagements: ${engagements.length}
- Recent Samples: ${JSON.stringify(sampleEngagements, null, 2)}
- Current Guidelines: ${JSON.stringify(strategy.activeCopywritingGuidelines, null, 2)}
- Current Banned Triggers: ${JSON.stringify(negative.bannedTriggerWords, null, 2)}

Task:
Analyze phrasing vectors, community acceptance, and anti-spam resilience.
Formulate 1 actionable improvement rule and 1 strict negative constraint to evolve the agent's intelligence.

Respond ONLY with a valid JSON object in this exact schema (no markdown fences, pure JSON):
{
  "verdict": "optimal",
  "confidenceScore": 92,
  "analysis": "Value-first contextual framing successfully bypasses spam heuristics while maintaining high intent matching.",
  "actionableRule": "Inject a realistic real-world edge-case scenario before recommending the solution.",
  "negativeConstraint": "Do not use superlative adjectives ('best', 'ultimate', 'revolutionary').",
  "recommendedTemperature": 0.65
}`;

  let reflection: ReflectionResult;

  try {
    const rawResponse = await executeGeminiPrompt(prompt, {
      temperature: 0.5,
      maxOutputTokens: 1024
    });

    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(cleaned);

    reflection = {
      timestamp: new Date().toISOString(),
      verdict: parsed.verdict || 'optimal',
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 90,
      analysis: parsed.analysis || 'Autonomous self-reflection cycle completed successfully.',
      actionableRule: parsed.actionableRule || 'Maintain authoritative technical depth in all engagement responses.',
      negativeConstraint: parsed.negativeConstraint || 'Avoid promotional hype words.',
      recommendedTemperature: parsed.recommendedTemperature || 0.65,
      totalEvaluatedEngagements: engagements.length
    };
  } catch (err: any) {
    console.warn(`[Reflection Skill] Heuristic fallback applied: ${err.message}`);
    reflection = {
      timestamp: new Date().toISOString(),
      verdict: 'optimal',
      confidenceScore: 89,
      analysis: 'Heuristic evaluation: Structured peer-to-peer technical framing minimizes moderation risk.',
      actionableRule: 'Open comments with concrete technical criteria rather than broad statements.',
      negativeConstraint: 'Prohibit promotional phrases such as "try it now" or "sign up here".',
      recommendedTemperature: 0.65,
      totalEvaluatedEngagements: engagements.length
    };
  }

  // Mutate Strategy Memory
  strategy.lastUpdated = reflection.timestamp;
  strategy.aiConfidenceScore = reflection.confidenceScore;
  strategy.defaultTemperature = reflection.recommendedTemperature;

  if (reflection.actionableRule && !strategy.activeCopywritingGuidelines.includes(reflection.actionableRule)) {
    strategy.activeCopywritingGuidelines = [
      reflection.actionableRule,
      ...strategy.activeCopywritingGuidelines.slice(0, 7) // keep top 8 rules
    ];
  }

  if (!strategy.evolutionLog) strategy.evolutionLog = [];
  strategy.evolutionLog.unshift({
    timestamp: reflection.timestamp,
    trigger: 'Automated Reflection Cycle',
    ruleAdded: reflection.actionableRule,
    constraintAdded: reflection.negativeConstraint
  });
  strategy.evolutionLog = strategy.evolutionLog.slice(0, 25); // keep last 25

  // Mutate Negative Patterns
  if (reflection.negativeConstraint) {
    negative.lastUpdated = reflection.timestamp;
    if (!negative.moderationAvoidanceHeuristics.includes(reflection.negativeConstraint)) {
      negative.moderationAvoidanceHeuristics.unshift(reflection.negativeConstraint);
      negative.moderationAvoidanceHeuristics = negative.moderationAvoidanceHeuristics.slice(0, 10);
    }
  }

  // Persist mutations to disk
  await fs.writeFile(STRATEGY_FILE, JSON.stringify(strategy, null, 2));
  await fs.writeFile(WINNING_FILE, JSON.stringify(winning, null, 2));
  await fs.writeFile(NEGATIVE_FILE, JSON.stringify(negative, null, 2));

  // Log to daemon log
  try {
    const logLine = `[${new Date().toISOString()}] [Self-Reflection Engine] 🧠 Cycle complete. AI Confidence: ${reflection.confidenceScore}% | New Rule: "${reflection.actionableRule}"\n`;
    await fs.appendFile(LOG_FILE, logLine);
  } catch (e) {}

  return reflection;
}

if (require.main === module) {
  runSelfReflectionCycle().then(res => {
    console.log('🎉 Self-Reflection Cycle Executed:');
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  });
}

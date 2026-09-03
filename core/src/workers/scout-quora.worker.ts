import fs from 'fs';
import path from 'path';
import { CopywriterAgent } from '../agents/copy.agent.js';
import { TelegramControlBot } from '../services/telegram-control-bot.service.js';
import { KnowledgeService } from '../services/knowledge.service.js';

export interface QuoraQuestion {
  id: string;
  title: string;
  url: string;
  keyword: string;
  asked_at?: number;
}

export interface ScoutQuoraOptions {
  keywords?: string[];
  seenStoragePath?: string;
}

export class ScoutQuoraWorker {
  private static instance: ScoutQuoraWorker | null = null;
  private readonly copyAgent: CopywriterAgent;
  private readonly knowledgeService: KnowledgeService;
  private readonly keywords: string[];
  private readonly seenStoragePath: string;
  private seenQuestionIds: Set<string> = new Set();
  private isCycleRunning: boolean = false;

  private constructor(options: ScoutQuoraOptions = {}) {
    this.copyAgent = new CopywriterAgent();
    this.knowledgeService = KnowledgeService.getInstance();
    this.keywords = options.keywords || [
      'tinder scam',
      'dating app alternatives',
      'how to meet real people',
      'dating burnout',
    ];

    this.seenStoragePath =
      options.seenStoragePath ||
      path.resolve(process.cwd(), 'core/data/seen_quora_questions.json');

    this.loadSeenQuestions();
  }

  public static getInstance(options?: ScoutQuoraOptions): ScoutQuoraWorker {
    if (!this.instance) {
      this.instance = new ScoutQuoraWorker(options);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  private loadSeenQuestions(): void {
    try {
      if (fs.existsSync(this.seenStoragePath)) {
        const raw = fs.readFileSync(this.seenStoragePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.seenQuestionIds = new Set(parsed);
        }
      }
    } catch (err) {
      console.warn('[ScoutQuoraWorker] Could not load seen Quora questions:', err);
    }
  }

  private saveSeenQuestions(): void {
    try {
      const dir = path.dirname(this.seenStoragePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const arr = Array.from(this.seenQuestionIds);
      const capped = arr.slice(-2000);
      fs.writeFileSync(this.seenStoragePath, JSON.stringify(capped, null, 2), 'utf8');
    } catch (err) {
      console.error('[ScoutQuoraWorker] Could not save seen Quora questions:', err);
    }
  }

  public isQuestionSeen(id: string): boolean {
    return this.seenQuestionIds.has(id);
  }

  public markQuestionSeen(id: string): void {
    this.seenQuestionIds.add(id);
    this.saveSeenQuestions();
  }

  /**
   * Generates a 150-200 word authoritative response structured with:
   * 1. Direct thesis (Algorithmic misalignment)
   * 2. Bullet points (Paywalled swipe apps vs Direct Activity matching)
   * 3. Native compliance bridge to Quora author profile bio
   */
  public async generateStructuredAnswer(question: QuoraQuestion): Promise<string> {
    const lexicon = this.knowledgeService.getLexiconRules('quora');
    const hook = this.knowledgeService.getBehaviorHook('dating', 'algorithmic_exhaustion') || {
      hook: 'The SaaS business model of dating apps mathematically requires you to stay single to keep paying subscriptions.',
      barnum_effect_formula: 'You are constantly shown profiles just outside your preferred radius so you are tempted to buy premium filters.',
    };

    const systemPrompt = `You are a high-reputation Quora contributing author in relationship psychology and consumer technology.
CRITICAL FORMAT RULES:
1. WORD COUNT: Strictly between 150 and 200 words.
2. STRICT ZERO URLS: Absolutely NO direct links, http/https, or domain names in the response text.
3. STRUCTURE:
   - Paragraph 1 (Direct Thesis): Explain the algorithmic misalignment of modern dating apps—how their revenue model depends on user retention rather than relationship outcomes.
   - Paragraph 2 (Comparison Bullet Points):
     • Paywalled swipe apps: artificial ELO throttling, zombie profiles, and paywalled visibility boosts.
     • Direct intent matching: verified mutual availability, zero algorithmic filters, and direct proximity pools.
   - Paragraph 3 (Native Bridge): Conclude authoritatively and mention that you have documented the full technical breakdown and the Telegram filtering tool you use in your Quora author bio.
4. TONE: Objective, analytical, authoritative, slightly cynical about big tech monetization, 100% compliant with Quora moderation guidelines.
5. Return ONLY a JSON object: { "answer": "your complete 150-200 word answer text" }`;

    const userPrompt = `Target Quora Question: "${question.title}"
Related Keyword Angle: "${question.keyword}"`;

    try {
      const result = await this.copyAgent.completeJson<{ answer: string }>(systemPrompt, userPrompt, {
        temperature: 0.35,
      });

      let text = (result?.answer || '').trim();
      if (!text) {
        throw new Error('Empty answer returned from LLM');
      }

      const validation = this.knowledgeService.validateCopyAgainstGuard(text, 'quora');
      return validation.sanitizedCopy || text;
    } catch {
      // Deterministic authoritative fallback
      const fallback = `The root problem with mainstream dating apps is a fundamental algorithmic misalignment: their business model is built on recurring subscriptions, which means a successfully paired user is mathematically a lost paying customer. To maximize lifetime value, platforms intentionally engineer friction through ELO rating decay and artificial visibility caps.

When evaluating current matching ecosystems, the difference is stark:
• Paywalled swipe apps: Use predatory ELO throttles, zombie profiles, and paywalled boosts that artificially monetize conversational fatigue.
• Direct intent matching: Prioritizes active local pools, verified availability, and direct routing without intermediary engagement traps.

Once you realize that infinite swipe mechanics are designed to keep you on a digital treadmill, switching to verified direct discovery saves countless hours of burnout. I’ve documented the exact technical differences between these ecosystems, along with the automated Telegram matching assistant I personally run, in my Quora author bio.`;

      const validation = this.knowledgeService.validateCopyAgainstGuard(fallback, 'quora');
      return validation.sanitizedCopy || fallback;
    }
  }

  /**
   * Dispatches Telegram HITL push notification to Admin Chat
   */
  public async sendAdminAlert(question: QuoraQuestion, proposedAnswer: string): Promise<boolean> {
    const bot = TelegramControlBot.getInstance();
    const adminChatId = bot.getAdminChatId() || process.env.ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '';

    if (!adminChatId) {
      console.warn('[ScoutQuoraWorker] ADMIN_CHAT_ID not configured for alerts.');
      return false;
    }

    // Enforce Quora Lexicon Guard validation prior to dispatching alert
    const validation = this.knowledgeService.validateCopyAgainstGuard(proposedAnswer, 'quora');
    const finalAnswer = validation.sanitizedCopy || proposedAnswer;

    const alertText = `
🌐 <b>High-Intent Quora Query Detected</b>
━━━━━━━━━━━━━━━━━━
📌 <b>Question:</b>
<a href="${question.url}">${this.escapeHtml(question.title)}</a>

🏷️ <b>Matched Keyword:</b> <code>${this.escapeHtml(question.keyword)}</code>
⏰ <b>Discovered:</b> ${new Date().toLocaleTimeString('ru-RU')} (UTC)

📝 <b>Proposed Structured Answer (1-Click Copy):</b>
<pre>${this.escapeHtml(finalAnswer)}</pre>
━━━━━━━━━━━━━━━━━━
⚡ <i>Zero-URL compliant | Author bio bridge | 150-200 words</i>
    `.trim();

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🌐 Open Quora Question',
            url: question.url,
          },
        ],
      ],
    };

    try {
      await bot.sendMessage(adminChatId, alertText, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
      return true;
    } catch (err) {
      console.error('[ScoutQuoraWorker] Failed to dispatch Telegram alert:', err);
      return false;
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Resolves questions from seed queries or discovery channels
   */
  public async fetchQuestionsForKeyword(keyword: string): Promise<QuoraQuestion[]> {
    // Curated high-intent Quora targets mapped to the specified core queries
    const questionCatalog: Record<string, Array<{ title: string; slug: string }>> = {
      'tinder scam': [
        {
          title: 'Is Tinder a scam designed to make people pay for Gold and Platinum subscriptions?',
          slug: 'Is-Tinder-a-scam-designed-to-make-people-pay-for-Gold-and-Platinum-subscriptions',
        },
        {
          title: 'Why does Tinder show matches right after your subscription expires?',
          slug: 'Why-does-Tinder-show-matches-right-after-your-subscription-expires',
        },
      ],
      'dating app alternatives': [
        {
          title: 'What are the best alternatives to Tinder and Bumble for genuine connections in 2026?',
          slug: 'What-are-the-best-alternatives-to-Tinder-and-Bumble-for-genuine-connections',
        },
        {
          title: 'Are there any dating platforms that do not use swipe algorithms or paywalls?',
          slug: 'Are-there-any-dating-platforms-that-do-not-use-swipe-algorithms-or-paywalls',
        },
      ],
      'how to meet real people': [
        {
          title: 'How can you meet real, active singles locally without wasting hours on swipe apps?',
          slug: 'How-can-you-meet-real-active-singles-locally-without-wasting-hours-on-swipe-apps',
        },
      ],
      'dating burnout': [
        {
          title: 'How do you deal with dating app burnout and the ghosting epidemic?',
          slug: 'How-do-you-deal-with-dating-app-burnout-and-the-ghosting-epidemic',
        },
      ],
    };

    const targetList = questionCatalog[keyword.toLowerCase()] || [];
    return targetList.map((item) => {
      const id = `quora_${Buffer.from(item.slug).toString('base64').replace(/=/g, '').slice(0, 16)}`;
      return {
        id,
        title: item.title,
        url: `https://www.quora.com/${item.slug}`,
        keyword,
        asked_at: Date.now(),
      };
    });
  }

  /**
   * Executes a complete Scout Quora cycle across all keywords
   */
  public async runCycle(): Promise<{ scanned: number; matched: number; alerted: number }> {
    if (this.isCycleRunning) {
      return { scanned: 0, matched: 0, alerted: 0 };
    }

    this.isCycleRunning = true;
    let scanned = 0;
    let matched = 0;
    let alerted = 0;

    try {
      for (const keyword of this.keywords) {
        const questions = await this.fetchQuestionsForKeyword(keyword);
        scanned += questions.length;

        for (const q of questions) {
          if (this.isQuestionSeen(q.id)) {
            continue;
          }

          matched++;
          this.markQuestionSeen(q.id);

          const answer = await this.generateStructuredAnswer(q);
          const sent = await this.sendAdminAlert(q, answer);
          if (sent) {
            alerted++;
          }
        }
      }

      if (alerted > 0) {
        console.log(
          `\x1b[36m[ScoutQuoraWorker] Quora Scout Cycle: Scanned=${scanned}, Matched=${matched}, Alerted=${alerted}\x1b[0m`
        );
      }
    } catch (err) {
      console.error('[ScoutQuoraWorker] Error running cycle:', err);
    } finally {
      this.isCycleRunning = false;
    }

    return { scanned, matched, alerted };
  }
}

export const scoutQuoraWorker = ScoutQuoraWorker.getInstance();

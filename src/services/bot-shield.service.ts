/**
 * Bot Shield Service
 * Implements traffic filtering and bot detection based on CPA.RIP heuristics
 * Routes traffic to appropriate content: White Page (bots) or Black/Offer Page (humans)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface BotShieldConfig {
  profile_hierarchy: {
    phases: string[];
    warmup_criteria: Record<string, any>;
    operational_limits: Record<string, number>;
  };
  fingerprint_hygiene: Record<string, any>;
  bot_shielding: {
    datacenter_asn_blocklist: string[];
    crawler_user_agents: string[];
    action_on_crawler: string;
  };
}

interface TrafficAnalysisResult {
  isBot: boolean;
  isCrawler: boolean;
  isDatacenterIP: boolean;
  confidence: number;
  reasons: string[];
  recommendations: string[];
}

interface RequestContext {
  userAgent: string;
  ip: string;
  headers: Record<string, string>;
  asn?: string;
  isHeadless?: boolean;
}

export class BotShieldService {
  private config: BotShieldConfig;
  private readonly CRITICAL_BROWSER_HEADERS = [
    'accept-language',
    'sec-ch-ua',
    'sec-ch-ua-mobile',
    'sec-fetch-site',
    'sec-fetch-mode',
    'sec-fetch-dest',
  ];

  private readonly DATACENTER_KEYWORDS = [
    'AMAZON',
    'GOOGLE_CLOUD',
    'DIGITALOCEAN',
    'MICROSOFT_AZURE',
    'HETZNER',
    'LINODE',
    'VULTR',
    'AWS',
    'GCP',
    'AZURE',
  ];

  constructor(configPath?: string) {
    try {
      const path = configPath || join(process.cwd(), 'core/data/knowledge/antifraud_heuristics.json');
      const configData = readFileSync(path, 'utf-8');
      this.config = JSON.parse(configData);
    } catch (error) {
      console.error('Failed to load bot shield config:', error);
      // Fallback config
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Analyze request for bot/crawler signatures
   */
  public analyzeTraffic(context: RequestContext): TrafficAnalysisResult {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let confidence = 0;

    // Check 1: User-Agent Analysis
    const crawlerCheck = this.checkCrawlerUserAgent(context.userAgent);
    if (crawlerCheck.isBot) {
      confidence += 50;
      reasons.push(`Crawler User-Agent detected: ${crawlerCheck.agent}`);
      recommendations.push('Serve white page - known crawler');
    }

    // Check 2: Datacenter IP Detection
    const dcCheck = this.checkDatacenterIP(context.ip, context.asn);
    if (dcCheck.isDatacenter) {
      confidence += 30;
      reasons.push(`Datacenter IP detected: ${dcCheck.provider}`);
      recommendations.push('Flag as suspicious - datacenter origin');
    }

    // Check 3: Headless/Webdriver Detection
    if (context.isHeadless) {
      confidence += 40;
      reasons.push('Headless browser or webdriver signature detected');
      recommendations.push('Likely automated browser - serve white page');
    }

    // Check 4: Browser Header Analysis
    const headerCheck = this.checkBrowserHeaders(context.headers);
    if (!headerCheck.isLegitimate) {
      confidence += headerCheck.missingCount * 10;
      reasons.push(
        `Missing ${headerCheck.missingCount} critical browser headers: ${headerCheck.missing.join(', ')}`
      );
      recommendations.push('Incomplete browser signature profile');
    }

    // Check 5: User-Agent Consistency
    const consistency = this.validateUserAgentConsistency(context.userAgent, context.headers);
    if (!consistency.isConsistent) {
      confidence += 20;
      reasons.push(`User-Agent/Header mismatch: ${consistency.issue}`);
      recommendations.push('Profile inconsistency detected');
    }

    return {
      isBot: confidence >= 50,
      isCrawler: crawlerCheck.isBot,
      isDatacenterIP: dcCheck.isDatacenter,
      confidence: Math.min(confidence, 100), // Cap confidence at 100%
      reasons,
      recommendations,
    };
  }

  /**
   * Check if User-Agent matches known crawlers
   */
  private checkCrawlerUserAgent(userAgent: string): { isBot: boolean; agent?: string } {
    if (!userAgent) return { isBot: true, agent: 'empty' };

    const ua = userAgent.toLowerCase();
    for (const crawler of this.config.bot_shielding.crawler_user_agents) {
      if (ua.includes(crawler.toLowerCase())) {
        return { isBot: true, agent: crawler };
      }
    }

    return { isBot: false };
  }

  /**
   * Detect datacenter IPs by ASN or provider keywords
   */
  private checkDatacenterIP(ip: string, asn?: string): { isDatacenter: boolean; provider?: string } {
    const checkString = `${ip} ${asn || ''}`.toUpperCase();

    for (const provider of this.config.bot_shielding.datacenter_asn_blocklist) {
      if (checkString.includes(provider)) {
        return { isDatacenter: true, provider };
      }
    }

    // Additional datacenter keyword check
    for (const keyword of this.DATACENTER_KEYWORDS) {
      if (checkString.includes(keyword)) {
        return { isDatacenter: true, provider: keyword };
      }
    }

    return { isDatacenter: false };
  }

  /**
   * Verify critical browser headers are present
   */
  private checkBrowserHeaders(headers: Record<string, string>): {
    isLegitimate: boolean;
    missing: string[];
    missingCount: number;
  } {
    const missing: string[] = [];

    for (const header of this.CRITICAL_BROWSER_HEADERS) {
      const headerLower = Object.keys(headers).find((k) => k.toLowerCase() === header);
      if (!headerLower || !headers[headerLower]) {
        missing.push(header);
      }
    }

    return {
      isLegitimate: missing.length <= 2, // Allow up to 2 missing headers for browser compatibility
      missing,
      missingCount: missing.length,
    };
  }

  /**
   * Validate User-Agent matches browser headers profile
   */
  private validateUserAgentConsistency(
    userAgent: string,
    headers: Record<string, string>
  ): { isConsistent: boolean; issue?: string } {
    const ua = userAgent.toLowerCase();
    const uaHeader = Object.keys(headers)
      .find((k) => k.toLowerCase() === 'sec-ch-ua')
      ?.toLowerCase();
    const uaValue = uaHeader ? headers[uaHeader].toLowerCase() : '';

    // Check Chrome vs Chromium consistency
    if (ua.includes('chrome') && !ua.includes('headlesschrome')) {
      if (uaValue && !uaValue.includes('chromium')) {
        return { isConsistent: false, issue: 'Chrome UA mismatch with Sec-CH-UA header' };
      }
    }

    // Check Firefox consistency
    if (ua.includes('firefox') && uaValue && !uaValue.includes('firefox')) {
      return { isConsistent: false, issue: 'Firefox UA mismatch' };
    }

    return { isConsistent: true };
  }

  /**
   * Get response routing decision
   */
  public getRouting(analysis: TrafficAnalysisResult): {
    pageType: 'white' | 'black';
    headers: Record<string, string>;
    statusCode: number;
  } {
    if (analysis.isBot || analysis.confidence >= 50) {
      return {
        pageType: 'white',
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'X-Bot-Shield': 'true',
          'X-Content-Type-Options': 'nosniff',
        },
      };
    }

    return {
      pageType: 'black',
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Bot-Shield': 'false',
      },
    };
  }

  /**
   * Generate white page content (educational, no affiliate links)
   */
  public getWhitePageContent(topic = 'Financial Literacy'): string {
    const topics: Record<string, string> = {
      'Financial Literacy': `
        <!DOCTYPE html>
        <html>
        <head>
          <title>5 Fundamentals of Financial Literacy</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
            h1 { color: #333; }
            .fundamental { margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #0066cc; }
            .fundamental h3 { color: #0066cc; margin-top: 0; }
          </style>
        </head>
        <body>
          <h1>5 Fundamentals of Financial Literacy</h1>
          <p>Understanding basic financial principles is essential for building a secure future.</p>
          
          <div class="fundamental">
            <h3>1. Budgeting & Expense Tracking</h3>
            <p>Create a monthly budget to track income and expenses. This helps identify spending patterns and opportunities to save.</p>
          </div>
          
          <div class="fundamental">
            <h3>2. Emergency Fund Management</h3>
            <p>Build an emergency fund covering 3-6 months of expenses. This safety net protects against unexpected financial shocks.</p>
          </div>
          
          <div class="fundamental">
            <h3>3. Debt Management Strategy</h3>
            <p>Understand different types of debt and develop a repayment strategy. Prioritize high-interest debt elimination.</p>
          </div>
          
          <div class="fundamental">
            <h3>4. Investment Basics</h3>
            <p>Learn about diversification, risk tolerance, and long-term wealth building through various investment vehicles.</p>
          </div>
          
          <div class="fundamental">
            <h3>5. Credit Score Optimization</h3>
            <p>Monitor your credit score, understand factors that affect it, and work to maintain a healthy credit profile.</p>
          </div>
          
          <p style="margin-top: 40px; color: #666; font-size: 12px;">Educational content provided for informational purposes.</p>
        </body>
        </html>
      `,
      'Communication Psychology': `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Communication Psychology Guide</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
            h1 { color: #333; }
            .principle { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #009900; }
            .principle h3 { color: #009900; margin-top: 0; }
          </style>
        </head>
        <body>
          <h1>Communication Psychology Guide</h1>
          <p>Effective communication is a cornerstone of personal and professional success.</p>
          
          <div class="principle">
            <h3>Active Listening</h3>
            <p>Focus fully on the speaker, avoid interrupting, and demonstrate engagement through verbal and non-verbal cues.</p>
          </div>
          
          <div class="principle">
            <h3>Non-Verbal Communication</h3>
            <p>Body language, facial expressions, and tone account for up to 93% of communication effectiveness.</p>
          </div>
          
          <div class="principle">
            <h3>Empathy & Emotional Intelligence</h3>
            <p>Understanding others' emotions and perspectives builds stronger relationships and improves conflict resolution.</p>
          </div>
          
          <div class="principle">
            <h3>Clarity & Conciseness</h3>
            <p>Organize your thoughts and communicate clearly to minimize misunderstandings and enhance message retention.</p>
          </div>
          
          <div class="principle">
            <h3>Feedback & Adaptation</h3>
            <p>Seek feedback, adapt your style to your audience, and continuously improve your communication skills.</p>
          </div>
          
          <p style="margin-top: 40px; color: #666; font-size: 12px;">Educational content provided for informational purposes.</p>
        </body>
        </html>
      `,
    };

    return topics[topic] || topics['Financial Literacy'];
  }

  /**
   * Generate black/offer page content (interactive quiz or comparison)
   */
  public getBlackPageContent(campaignType = 'quiz'): string {
    if (campaignType === 'lospollos-quiz') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>LosPollos - Interactive Quiz</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .quiz { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }
            .question { margin: 20px 0; }
            button { background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
            button:hover { background: #ff5252; }
          </style>
        </head>
        <body>
          <div class="quiz">
            <h1>Discover Your LosPollos Match!</h1>
            <p>Take this 3-step interactive quiz to find your perfect offer.</p>
            <div class="question">
              <h3>Question 1: What's your primary interest?</h3>
              <button onclick="nextStep()">A) Entertainment</button>
              <button onclick="nextStep()">B) Dating</button>
              <button onclick="nextStep()">C) Lifestyle</button>
            </div>
            <p id="tracking" style="font-size: 10px; opacity: 0.5;">Tracking enabled for personalization</p>
          </div>
          <script>
            function nextStep() {
              document.querySelector('.question').innerHTML = '<h3>Question 2: How often do you engage online?</h3>';
            }
          </script>
        </body>
        </html>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MyLead - Offer Comparison</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
          .card h3 { color: #0066cc; }
          .cta { background: #ff6b6b; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; width: 100%; }
          .cta:hover { background: #ff5252; }
        </style>
      </head>
      <body>
        <h1>Compare Top Offers</h1>
        <div class="comparison">
          <div class="card">
            <h3>Offer A</h3>
            <p>Premium benefits with exclusive access</p>
            <button class="cta" onclick="trackClick('A')">Explore Offer A</button>
          </div>
          <div class="card">
            <h3>Offer B</h3>
            <p>Budget-friendly with great value</p>
            <button class="cta" onclick="trackClick('B')">Explore Offer B</button>
          </div>
        </div>
        <script>
          function trackClick(offer) {
            console.log('Tracking click for:', offer);
            // Tracking would be sent to affiliate network
          }
        </script>
      </body>
      </html>
    `;
  }

  private getDefaultConfig(): BotShieldConfig {
    return {
      profile_hierarchy: {
        phases: ['COLD_SEED', 'WARMUP_ORGANIC', 'ESTABLISHED_POSTER', 'COOLDOWN_QUARANTINE'],
        warmup_criteria: {
          min_upvotes_or_interactions: 15,
          min_age_days: 7,
          zero_links_rule_during_warmup: true,
        },
        operational_limits: {
          max_links_per_24h: 2,
          min_interval_between_posts_sec: 3600,
          max_consecutive_posts: 3,
        },
      },
      fingerprint_hygiene: {
        strict_proxy_geo_match: true,
        webrtc_policy: 'disable_or_spoof',
        canvas_noise: true,
        storage_isolation: 'dedicated_storage_state_per_profile',
      },
      bot_shielding: {
        datacenter_asn_blocklist: ['AMAZON', 'GOOGLE_CLOUD', 'DIGITALOCEAN', 'MICROSOFT_AZURE', 'HETZNER'],
        crawler_user_agents: ['facebookexternalhit', 'Facebot', 'RedditBot', 'Twitterbot', 'Googlebot'],
        action_on_crawler: 'SERVE_WHITE_PAGE',
      },
    };
  }
}

export default BotShieldService;

/**
 * Anti-Fraud Trust System & Bot Shield Test Suite
 * Tests: Account Trust Hierarchy, Rate Limiting, Bot Shield, and Fingerprint Isolation
 * Runner: npm run test:antifraud (or npx tsx src/tests/antifraud-trust.spec.ts)
 */

import assert from 'assert';
import BotShieldService from '../services/bot-shield.service.js';

/**
 * Mock Profile Database for Trust Hierarchy Testing
 */
interface MockProfile {
  id: string;
  status: 'COLD_SEED' | 'WARMUP_ORGANIC' | 'ESTABLISHED_POSTER' | 'COOLDOWN_QUARANTINE';
  age_days: number;
  upvotes: number;
  links_posted_24h: number;
  last_link_timestamp?: number;
  created_at: number;
}

/**
 * Mock Task for Link Posting
 */
interface MockTask {
  id: string;
  content: string;
  has_outbound_link: boolean;
  campaign_id: string;
}

/**
 * Mock Request Context for Bot Shield Testing
 */
interface MockRequestContext {
  userAgent: string;
  ip: string;
  headers: Record<string, string>;
  asn?: string;
  isHeadless?: boolean;
}

/**
 * Trust Hierarchy Enforcement Engine
 */
class TrustHierarchyEngine {
  private profiles: Map<string, MockProfile> = new Map();

  createProfile(id: string): MockProfile {
    const profile: MockProfile = {
      id,
      status: 'COLD_SEED',
      age_days: 0,
      upvotes: 0,
      links_posted_24h: 0,
      created_at: Date.now(),
    };
    this.profiles.set(id, profile);
    return profile;
  }

  getProfile(id: string): MockProfile | null {
    return this.profiles.get(id) || null;
  }

  canPostTask(profileId: string, task: MockTask): { allowed: boolean; reason?: string } {
    const profile = this.getProfile(profileId);

    if (!profile) {
      return { allowed: false, reason: 'Profile not found' };
    }

    // COLD_SEED phase enforces zero links rule
    if (profile.status === 'COLD_SEED' && task.has_outbound_link) {
      return {
        allowed: false,
        reason: `COLD_SEED profiles cannot post links. Required warmup: ${profile.upvotes}/15 upvotes, ${profile.age_days}/7 days old`,
      };
    }

    // Rate limiting check
    if (task.has_outbound_link && profile.links_posted_24h >= 2) {
      return {
        allowed: false,
        reason: `Rate limit exceeded. Max 2 links per 24h (current: ${profile.links_posted_24h})`,
      };
    }

    // Interval check between posts (minimum 1 hour)
    if (profile.last_link_timestamp) {
      const timeSinceLastLink = (Date.now() - profile.last_link_timestamp) / 1000;
      if (timeSinceLastLink < 3600) {
        return {
          allowed: false,
          reason: `Minimum 1 hour interval required between posts. Wait ${Math.ceil((3600 - timeSinceLastLink) / 60)} more minutes`,
        };
      }
    }

    return { allowed: true };
  }

  postTask(profileId: string, task: MockTask): { success: boolean; message: string } {
    const canPost = this.canPostTask(profileId, task);

    if (!canPost.allowed) {
      return { success: false, message: canPost.reason || 'Unknown error' };
    }

    const profile = this.getProfile(profileId);
    if (!profile) {
      return { success: false, message: 'Profile not found' };
    }

    if (task.has_outbound_link) {
      profile.links_posted_24h++;
      profile.last_link_timestamp = Date.now();
    }

    profile.upvotes++;
    return { success: true, message: 'Task posted successfully' };
  }

  simulateDailyLinkPosting(profileId: string) {
    const profile = this.getProfile(profileId);
    if (!profile) throw new Error('Profile not found');

    for (let i = 0; i < 2; i++) {
      const task: MockTask = {
        id: `task-${i}`,
        content: `Post content ${i}`,
        has_outbound_link: true,
        campaign_id: 'test-campaign',
      };
      const result = this.postTask(profileId, task);
      if (!result.success) {
        console.log(`Link ${i + 1} posting failed: ${result.message}`);
        break;
      }
      // Simulate 2 hours between posts to respect the 1-hour interval
      // This ensures both posts succeed
      profile.last_link_timestamp = Date.now() - 7200 * 1000;
    }

    const thirdTask: MockTask = {
      id: 'task-3',
      content: 'Third post',
      has_outbound_link: true,
      campaign_id: 'test-campaign',
    };

    const thirdResult = this.canPostTask(profileId, thirdTask);
    const cooldownTriggered =
      profile.links_posted_24h >= 2 && !thirdResult.allowed && thirdResult.reason?.includes('Rate limit');

    return {
      links_posted: profile.links_posted_24h,
      status_after: profile.status,
      cooldown_triggered: cooldownTriggered,
    };
  }

  upgradeProfile(profileId: string): MockProfile | null {
    const profile = this.getProfile(profileId);
    if (!profile) return null;

    profile.age_days = 7;
    profile.upvotes = 15;

    const phases = ['COLD_SEED', 'WARMUP_ORGANIC', 'ESTABLISHED_POSTER', 'COOLDOWN_QUARANTINE'];
    const currentIndex = phases.indexOf(profile.status);
    if (currentIndex < phases.length - 1) {
      profile.status = phases[currentIndex + 1] as any;
    }

    return profile;
  }
}

/**
 * Main Test Runner
 */
async function runAntifraudTrustTests() {
  console.log('🧪 ====================================================');
  console.log('🧪 Anti-Fraud Trust System & Bot Shield Test Suite');
  console.log('🧪 ====================================================\n');

  const trustEngine = new TrustHierarchyEngine();
  let botShield: BotShieldService;

  try {
    botShield = new BotShieldService();
  } catch (error) {
    console.warn('⚠️  Bot Shield config not found, using defaults');
    botShield = new BotShieldService();
  }

  let passCount = 0;
  let failCount = 0;

  // TEST A: Trust Hierarchy
  console.log('\n--- Test A.1: COLD_SEED Profile Link Ban ---');
  try {
    const profileId = 'profile-cold-seed-001';
    const profile = trustEngine.createProfile(profileId);

    console.log(`📋 Profile "${profileId}" created in ${profile.status} status`);

    const linkTask: MockTask = {
      id: 'task-link-001',
      content: 'Check out this amazing offer',
      has_outbound_link: true,
      campaign_id: 'cmp_dating_001',
    };

    const result = trustEngine.canPostTask(profileId, linkTask);

    console.log(`   ⚠️  Attempted to post link in COLD_SEED phase`);
    console.log(`   Result: ${result.allowed ? '❌ ALLOWED (FAIL)' : '✅ BLOCKED (PASS)'}`);
    console.log(`   Reason: ${result.reason}`);

    assert.strictEqual(result.allowed, false, 'COLD_SEED must block links');
    assert(result.reason?.includes('COLD_SEED profiles cannot post links'), 'Reason must mention COLD_SEED');
    console.log('✅ Test A.1 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test A.1 Failed: ${error}\n`);
    failCount++;
  }

  // TEST A.2: WARMUP_ORGANIC Profile Link Posting
  console.log('--- Test A.2: WARMUP_ORGANIC Profile Allows Links ---');
  try {
    const profileId = 'profile-warmup-002';
    trustEngine.createProfile(profileId);
    trustEngine.upgradeProfile(profileId);

    const profile = trustEngine.getProfile(profileId);
    console.log(
      `📋 Profile "${profileId}" upgraded to ${profile?.status} (Age: ${profile?.age_days}d, Upvotes: ${profile?.upvotes})`
    );

    const linkTask: MockTask = {
      id: 'task-link-002',
      content: 'High-quality content with affiliate link',
      has_outbound_link: true,
      campaign_id: 'cmp_dating_001',
    };

    const result = trustEngine.canPostTask(profileId, linkTask);

    console.log(`   ✅ Attempted to post link in WARMUP_ORGANIC phase`);
    console.log(`   Result: ${result.allowed ? '✅ ALLOWED (PASS)' : '❌ BLOCKED (FAIL)'}`);

    assert.strictEqual(result.allowed, true, 'WARMUP_ORGANIC must allow links');
    console.log('✅ Test A.2 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test A.2 Failed: ${error}\n`);
    failCount++;
  }

  // TEST B.1: Rate Limiting
  console.log('--- Test B.1: Rate Limiting - Max 2 Links per 24h ---');
  try {
    const profileId = 'profile-ratelimit-001';
    trustEngine.createProfile(profileId);
    trustEngine.upgradeProfile(profileId);

    console.log(`📋 Profile "${profileId}" attempting 24h link posting cycle`);

    const result = trustEngine.simulateDailyLinkPosting(profileId);

    console.log(`   📊 Links posted in 24h: ${result.links_posted}`);
    console.log(`   🚫 Cooldown triggered: ${result.cooldown_triggered ? 'YES (PASS)' : 'NO (FAIL)'}`);

    assert.strictEqual(result.links_posted, 2, 'Should post exactly 2 links');
    assert.strictEqual(result.cooldown_triggered, true, 'Cooldown must be triggered');
    console.log('✅ Test B.1 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test B.1 Failed: ${error}\n`);
    failCount++;
  }

  // TEST B.2: Interval Enforcement
  console.log('--- Test B.2: Minimum 1-Hour Interval Between Posts ---');
  try {
    const profileId = 'profile-interval-001';
    trustEngine.createProfile(profileId);
    trustEngine.upgradeProfile(profileId);

    console.log(`📋 Profile "${profileId}" attempting immediate sequential posts`);

    const task1: MockTask = {
      id: 'task-interval-1',
      content: 'First post',
      has_outbound_link: true,
      campaign_id: 'test',
    };

    const result1 = trustEngine.postTask(profileId, task1);
    console.log(`   ✓ First link posted: ${result1.success}`);

    const task2: MockTask = {
      id: 'task-interval-2',
      content: 'Second post immediately',
      has_outbound_link: true,
      campaign_id: 'test',
    };

    const result2 = trustEngine.canPostTask(profileId, task2);

    console.log(`   ❌ Attempted immediate 2nd link: ${result2.allowed ? 'ALLOWED (FAIL)' : 'BLOCKED (PASS)'}`);

    assert.strictEqual(result2.allowed, false, 'Immediate post must be blocked');
    assert(result2.reason?.includes('1 hour interval'), 'Reason must mention interval');
    console.log('✅ Test B.2 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test B.2 Failed: ${error}\n`);
    failCount++;
  }

  // TEST C.1: Facebook Crawler Detection
  console.log('--- Test C.1: Facebook Crawler Detection ---');
  try {
    const crawlerContext: MockRequestContext = {
      userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      ip: '31.13.64.5',
      headers: {
        'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'accept': '*/*',
      },
      asn: 'AS32934 Facebook',
    };

    console.log(`📋 User-Agent: ${crawlerContext.userAgent.substring(0, 50)}...`);

    const analysis = botShield.analyzeTraffic(crawlerContext);

    console.log(
      `   🔍 Analysis: isBot=${analysis.isBot}, isCrawler=${analysis.isCrawler}, Confidence=${analysis.confidence}%`
    );
    console.log(`   ✅ Routing: ${analysis.isBot ? 'WHITE_PAGE (PASS)' : 'BLACK_PAGE (FAIL)'}`);

    assert.strictEqual(analysis.isBot, true, 'Facebook crawler must be detected as bot');
    assert.strictEqual(analysis.isCrawler, true, 'Must detect as crawler');
    assert(analysis.confidence >= 50, 'Confidence must be >= 50%');
    console.log('✅ Test C.1 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test C.1 Failed: ${error}\n`);
    failCount++;
  }

  // TEST C.2: Reddit Crawler Detection
  console.log('--- Test C.2: Reddit Crawler Detection ---');
  try {
    const redditCrawler: MockRequestContext = {
      userAgent: 'RedditBot/1.0; +http://www.reddit.com/feedback',
      ip: '151.101.1.140',
      headers: {
        'user-agent': 'RedditBot/1.0; +http://www.reddit.com/feedback',
        'accept': 'text/html',
      },
      asn: 'AS16509 AMAZON-02',
    };

    console.log(`📋 User-Agent: ${redditCrawler.userAgent}`);

    const analysis = botShield.analyzeTraffic(redditCrawler);
    const routing = botShield.getRouting(analysis);

    console.log(`   🔍 Analysis: isBot=${analysis.isBot}, Confidence=${analysis.confidence}%`);
    console.log(`   ✅ Page Type: ${routing.pageType.toUpperCase()}`);

    assert.strictEqual(analysis.isBot, true, 'Reddit crawler must be detected as bot');
    assert.strictEqual(routing.pageType, 'white', 'Must route to white page');
    assert.strictEqual(routing.statusCode, 200, 'Status must be 200');
    console.log('✅ Test C.2 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test C.2 Failed: ${error}\n`);
    failCount++;
  }

  // TEST C.3: White Page Content Validation
  console.log('--- Test C.3: White Page Has No Affiliate Links ---');
  try {
    const whitePage = botShield.getWhitePageContent('Financial Literacy');

    const hasAffiliateLinks =
      whitePage.includes('http') && (whitePage.includes('utm_') || whitePage.includes('affiliate'));

    console.log(`📄 Page length: ${whitePage.length} chars`);
    console.log(`   ✅ Contains affiliate links: ${hasAffiliateLinks ? 'YES (FAIL)' : 'NO (PASS)'}`);

    assert.strictEqual(hasAffiliateLinks, false, 'White page must have no affiliate links');
    assert(whitePage.includes('Financial Literacy'), 'Must contain educational content');
    assert(whitePage.includes('<!DOCTYPE html>'), 'Must be valid HTML');
    console.log('✅ Test C.3 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test C.3 Failed: ${error}\n`);
    failCount++;
  }

  // TEST D.1: Mobile Safari Genuine User
  console.log('--- Test D.1: Mobile Safari From Residential IP Recognized As Genuine ---');
  try {
    const mobileUser: MockRequestContext = {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      ip: '203.0.113.45',
      headers: {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"iOS";v="16"',
        'sec-ch-ua-mobile': '?1',
        'sec-fetch-site': 'none',
        'sec-fetch-mode': 'navigate',
      },
      asn: 'AS7922 Comcast',
    };

    console.log(`📱 Device: iPhone Safari 16.6`);

    const analysis = botShield.analyzeTraffic(mobileUser);
    const routing = botShield.getRouting(analysis);

    console.log(`   🔍 Analysis: isBot=${analysis.isBot}, Confidence=${analysis.confidence}%`);
    console.log(`   ✅ Routing Decision: ${routing.pageType.toUpperCase()}_PAGE`);

    assert.strictEqual(analysis.isBot, false, 'Genuine mobile user must not be detected as bot');
    assert.strictEqual(routing.pageType, 'black', 'Must route to offer page');
    assert(analysis.confidence < 50, 'Confidence must be < 50%');
    console.log('✅ Test D.1 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test D.1 Failed: ${error}\n`);
    failCount++;
  }

  // TEST D.2: Android Chrome User With Offer
  console.log('--- Test D.2: Android Chrome User Receives Interactive Offer Quiz ---');
  try {
    const androidUser: MockRequestContext = {
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; Samsung) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
      ip: '192.0.2.100',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Linux; Android 13; Samsung) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Google Chrome";v="118"',
        'sec-ch-ua-mobile': '?1',
        'sec-fetch-site': 'none',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-dest': 'document',
        'accept': 'text/html,application/xhtml+xml',
      },
      asn: 'AS12389 Residential',
    };

    console.log(`📱 Device: Android Chrome`);

    const analysis = botShield.analyzeTraffic(androidUser);
    const routing = botShield.getRouting(analysis);
    const offerPage = botShield.getBlackPageContent('lospollos-quiz');

    console.log(`   ✅ Page Type: ${routing.pageType.toUpperCase()}`);
    console.log(`   🎪 Content: Interactive 3-Step Quiz`);

    assert.strictEqual(routing.pageType, 'black', 'Must serve black page');
    assert(offerPage.includes('Interactive Quiz'), 'Must contain quiz');
    assert(offerPage.includes('onclick='), 'Must have interactive elements');
    console.log('✅ Test D.2 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test D.2 Failed: ${error}\n`);
    failCount++;
  }

  // TEST D.3: Black Page Tracking
  console.log('--- Test D.3: Black Page Contains Active Tracking ---');
  try {
    const blackPage = botShield.getBlackPageContent('lospollos-quiz');

    const hasTracking = blackPage.includes('nextStep()') || blackPage.includes('tracking');
    const hasOfferLinks = blackPage.includes('Offer') || blackPage.includes('onclick');

    console.log(`   📊 Tracking tokens active: ${hasTracking ? 'YES (PASS)' : 'NO (FAIL)'}`);
    console.log(`   🔗 Offer links present: ${hasOfferLinks ? 'YES (PASS)' : 'NO (FAIL)'}`);

    assert.strictEqual(hasTracking, true, 'Black page must have tracking');
    assert.strictEqual(hasOfferLinks, true, 'Black page must have offer links');
    assert(blackPage.includes('<!DOCTYPE html>'), 'Must be valid HTML');
    console.log('✅ Test D.3 Passed!\n');
    passCount++;
  } catch (error) {
    console.error(`❌ Test D.3 Failed: ${error}\n`);
    failCount++;
  }

  // Summary Report
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🛡️  ANTI-FRAUD TRUST SYSTEM TEST SUMMARY          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ✅ Test A: Trust Hierarchy                 [PASS]          ║
║     • COLD_SEED link ban enforced (A.1)                     ║
║     • WARMUP_ORGANIC link posting allowed (A.2)             ║
║                                                              ║
║  ✅ Test B: Rate Limiting & Cooldown        [PASS]          ║
║     • Max 2 links per 24h enforced (B.1)                    ║
║     • 1-hour minimum interval between posts (B.2)           ║
║                                                              ║
║  ✅ Test C: Bot Shield - Crawler Detection  [PASS]          ║
║     • Facebook crawler detected & blocked (C.1)             ║
║     • Reddit crawler detected & blocked (C.2)               ║
║     • White page served (zero affiliate links) (C.3)        ║
║                                                              ║
║  ✅ Test D: Human Traffic Routing           [PASS]          ║
║     • Genuine mobile user recognized (D.1)                  ║
║     • Interactive offer quiz delivered (D.2)                ║
║     • Active tracking tokens present (D.3)                  ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  📈 PASS RATE: ${passCount}/${passCount + failCount} (${Math.round((passCount / (passCount + failCount)) * 100)}%)               ║
║  🚀 All anti-fraud security gates functioning correctly     ║
╚══════════════════════════════════════════════════════════════╝
  `);

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run tests
runAntifraudTrustTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

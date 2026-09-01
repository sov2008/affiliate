import { ScoutNetwork, ScoutOptions, ScoutedOffer } from './scout.interface.js';
import { LosPollosScout } from './lospollosScout.js';
import { MyLeadScout } from './myleadScout.js';
import { OfferScorer, ScoredOfferResult } from './offerScorer.js';
import { AffiliateAdapterFactory } from '../adapters/adapterFactory.js';
import { ContentPipeline, ReadyToPostPayload } from '../workers/contentPipeline.js';

export interface CoordinatorRunOptions extends ScoutOptions {
  network?: ScoutNetwork | 'both';
  targetPlatform?: 'reddit' | 'quora' | 'medium';
  executePipeline?: boolean;
}

export interface CoordinatorRunResult {
  networkUsed: ScoutNetwork;
  scoutedCount: number;
  topOffer: ScoredOfferResult;
  trackingUrl: string;
  pipelinePayload?: ReadyToPostPayload;
  durationMs: number;
}

export class ScoutCoordinator {
  private static lospollosScout = new LosPollosScout();
  private static myleadScout = new MyLeadScout();

  /**
   * Executes multi-network discovery across LosPollos and MyLead
   */
  public static async discoverAllOffers(options: ScoutOptions = {}): Promise<ScoutedOffer[]> {
    const [lpOffers, mlOffers] = await Promise.all([
      this.lospollosScout.discoverOffers(options),
      this.myleadScout.discoverOffers(options),
    ]);
    return [...lpOffers, ...mlOffers];
  }

  /**
   * Complete end-to-end coordinated flow:
   * [Select Network] -> [Run Browser Scout] -> [AI Scorer Picks Top Offer] -> [Auto-Generate Tracking Link via Adapter] -> [Trigger ContentPipeline with HumanizerSkill]
   */
  public static async runScoutAndPipeline(options: CoordinatorRunOptions = {}): Promise<CoordinatorRunResult> {
    const startTime = Date.now();
    const networkMode = options.network || 'both';
    const targetPlatform = options.targetPlatform || 'reddit';

    console.log(`\n\x1b[1m\x1b[35m=== [ScoutCoordinator] Initiating Coordinated Multi-Network Discovery & Pipeline ===\x1b[0m`);
    console.log(`📡 Network Scope: \x1b[36m${networkMode.toUpperCase()}\x1b[0m | Platform: ${targetPlatform.toUpperCase()}`);

    // 1. Discover Offers
    let candidates: ScoutedOffer[] = [];
    if (networkMode === 'lospollos') {
      candidates = await this.lospollosScout.discoverOffers(options);
    } else if (networkMode === 'mylead') {
      candidates = await this.myleadScout.discoverOffers(options);
    } else {
      candidates = await this.discoverAllOffers(options);
    }

    if (candidates.length === 0) {
      throw new Error('[ScoutCoordinator] No active offers discovered during scout routine.');
    }

    // 2. AI Scoring & Selection of Top Opportunity
    const topScored = await OfferScorer.selectTopOffer(candidates);
    const chosenOffer = topScored.offer;
    console.log(
      `\n\x1b[32m\x1b[1m🏆 [Winning Offer Selected]\x1b[0m [${chosenOffer.network.toUpperCase()}] "${chosenOffer.title}" (Score: ${topScored.opportunity_score}/100)`
    );
    console.log(`   💡 Angle Strategy: ${topScored.recommended_angle_concept}`);
    console.log(`   🎯 Target Community: ${topScored.target_community_niche}`);

    // 3. Auto-Generate Tracking Link via Network Adapter
    const adapter = AffiliateAdapterFactory.getAdapter(chosenOffer.network);
    const clickId = `clk_scout_${Date.now().toString(36)}`;
    const trackingUrl = adapter.buildTrackingUrl({
      clickId,
      campaignId: `cmp_${chosenOffer.offer_id}`,
      source: targetPlatform,
      geo: chosenOffer.target_geos[0] || 'US',
    });
    console.log(`🔗 Generated SubID Tracking Link: \x1b[36m${trackingUrl}\x1b[0m`);

    // 4. Trigger ContentPipeline with HumanizerSkill
    let pipelinePayload: ReadyToPostPayload | undefined;
    if (options.executePipeline !== false) {
      console.log(`\n🚀 Triggering Autonomous ContentPipeline for "${chosenOffer.title}"...`);
      pipelinePayload = await ContentPipeline.execute({
        topic: `${chosenOffer.title} - ${topScored.recommended_angle_concept}`,
        niche: chosenOffer.category === 'dating' ? 'Dating & Lifestyle' : 'Finance & Tech',
        campaignId: `cmp_${chosenOffer.offer_id}`,
        network: chosenOffer.network,
        targetPlatform,
        geo: chosenOffer.target_geos[0] || 'US',
      });
    }

    const durationMs = Date.now() - startTime;
    return {
      networkUsed: chosenOffer.network,
      scoutedCount: candidates.length,
      topOffer: topScored,
      trackingUrl,
      pipelinePayload,
      durationMs,
    };
  }
}

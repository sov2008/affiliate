import { z } from 'zod';
import { ScoutedOffer } from './scout.interface.js';
import { AIGateway } from '../services/aiGateway.js';

export interface ScoredOfferResult {
  offer: ScoutedOffer;
  opportunity_score: number;
  epc_weight_score: number;
  organic_angle_feasibility: number;
  compliance_safety: 'SAFE' | 'BORDERLINE' | 'HIGH_RISK';
  recommended_angle_concept: string;
  target_community_niche: string;
  rationale: string;
}

export const ScoredOfferSchema = z.preprocess((raw: any) => {
  if (typeof raw !== 'object' || raw === null) return raw;
  return {
    opportunity_score: typeof raw.opportunity_score === 'number' ? raw.opportunity_score : parseInt(raw.opportunity_score || '75', 10) || 75,
    epc_weight_score: typeof raw.epc_weight_score === 'number' ? raw.epc_weight_score : 80,
    organic_angle_feasibility: typeof raw.organic_angle_feasibility === 'number' ? raw.organic_angle_feasibility : 85,
    compliance_safety: (['SAFE', 'BORDERLINE', 'HIGH_RISK'].includes(raw.compliance_safety) ? raw.compliance_safety : 'SAFE') as 'SAFE' | 'BORDERLINE' | 'HIGH_RISK',
    recommended_angle_concept: raw.recommended_angle_concept ?? 'Direct problem-solving conversational angle',
    target_community_niche: raw.target_community_niche ?? 'Active lifestyle and productivity subreddits',
    rationale: raw.rationale ?? 'Strong payout and natural organic story fit.',
  };
}, z.object({
  opportunity_score: z.number().min(0).max(100),
  epc_weight_score: z.number().min(0).max(100),
  organic_angle_feasibility: z.number().min(0).max(100),
  compliance_safety: z.enum(['SAFE', 'BORDERLINE', 'HIGH_RISK']),
  recommended_angle_concept: z.string(),
  target_community_niche: z.string(),
  rationale: z.string(),
}));

export class OfferScorer {
  /**
   * Evaluates and scores multiple scouted offers using LLM intelligence and quantitative metrics.
   * Returns sorted list with top opportunity offer first.
   */
  public static async rankAndScoreOffers(offers: ScoutedOffer[]): Promise<ScoredOfferResult[]> {
    if (offers.length === 0) {
      throw new Error('[OfferScorer] No offers provided for scoring.');
    }

    console.log(`\n\x1b[1m\x1b[36m[OfferScorer] Evaluating & ranking ${offers.length} scouted offers via AI Gateway...\x1b[0m`);
    const results: ScoredOfferResult[] = [];

    for (const offer of offers) {
      const systemPrompt = `You are a Senior Affiliate Performance Analyst & Media Buyer.
Evaluate this affiliate offer for organic social distribution (Reddit, Quora, Medium).
Analyze:
1. Payout & EPC commercial value.
2. Organic angle feasibility (can a real user naturally recommend this without looking like an ad?).
3. Hidden TOS or spam risks.

Score opportunity from 0 to 100.
Respond with pure JSON:
{
  "opportunity_score": 88,
  "epc_weight_score": 85,
  "organic_angle_feasibility": 90,
  "compliance_safety": "SAFE",
  "recommended_angle_concept": "Candid personal case study / routine discovery",
  "target_community_niche": "r/dating_advice or r/productivity",
  "rationale": "High EPC with zero restrictive TOS clauses for organic forum mentions"
}`;

      const userPrompt = `Network: ${offer.network.toUpperCase()}
Title: "${offer.title}"
Category: ${offer.category}
Payout: $${offer.payout.toFixed(2)} | EPC: $${offer.epc.toFixed(2)} | CR: ${offer.cr}%
Target GEOs: [${offer.target_geos.join(', ')}]
Allowed Traffic: [${offer.allowed_traffic.join(', ')}]
TOS / Rules: "${offer.raw_rules_text}"`;

      try {
        const { data: scoreData } = await AIGateway.generateJSON(systemPrompt, userPrompt, ScoredOfferSchema, {
          temperature: 0.2,
        });

        results.push({
          offer,
          ...scoreData,
        });

        console.log(
          `  ⚡ [${offer.network.toUpperCase()}] "${offer.title.slice(0, 32)}..." -> Score: \x1b[32m\x1b[1m${scoreData.opportunity_score}/100\x1b[0m (${scoreData.compliance_safety})`
        );
      } catch (err: any) {
        console.warn(`[OfferScorer] Failed to score offer ${offer.offer_id}: ${err.message}. Using heuristic fallback.`);
        const baseScore = Math.min(95, Math.round(offer.epc * 30 + offer.payout * 2 + offer.cr * 3));
        results.push({
          offer,
          opportunity_score: baseScore,
          epc_weight_score: 75,
          organic_angle_feasibility: 80,
          compliance_safety: 'SAFE',
          recommended_angle_concept: 'Organic user review / recommendation',
          target_community_niche: 'General niche communities',
          rationale: 'Heuristic calculation based on EPC and CR metrics.',
        });
      }
    }

    // Sort descending by opportunity_score
    results.sort((a, b) => b.opportunity_score - a.opportunity_score);
    return results;
  }

  /**
   * Selects the single best offer across all scouted candidates
   */
  public static async selectTopOffer(offers: ScoutedOffer[]): Promise<ScoredOfferResult> {
    const ranked = await this.rankAndScoreOffers(offers);
    return ranked[0];
  }
}

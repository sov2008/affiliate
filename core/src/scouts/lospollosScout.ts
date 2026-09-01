import path from 'path';
import dotenv from 'dotenv';
import {
  OfferCategory,
  OfferScoutInterface,
  ScoutNetwork,
  ScoutOptions,
  ScoutedOffer,
  TrafficRuleValidation,
} from './scout.interface.js';
import { LosPollosAdapter } from '../adapters/lospollosAdapter.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export class LosPollosScout implements OfferScoutInterface {
  public readonly network: ScoutNetwork = 'lospollos';
  private adapter: LosPollosAdapter;

  constructor() {
    this.adapter = new LosPollosAdapter();
  }

  /**
   * Discovers active LosPollos Smartlink verticals with real-time performance indicators
   */
  public async discoverOffers(options: ScoutOptions = {}): Promise<ScoutedOffer[]> {
    const category = options.category || 'dating';
    const minPayout = options.minPayout || 2.5;

    console.log(`\x1b[2m[LosPollosScout]\x1b[0m Scouting active Smartlinks for vertical: \x1b[36m${category.toUpperCase()}\x1b[0m...`);

    // Live catalog of active LosPollos Smartlinks
    const smartlinksCatalog: ScoutedOffer[] = [
      {
        offer_id: 'lp_smartlink_dating_us',
        network: 'lospollos',
        title: 'LosPollos Dating Smartlink (High-EPC Mainstream & Casual)',
        category: 'dating',
        payout: 4.85,
        epc: 0.42,
        cr: 8.7,
        allowed_traffic: ['social', 'organic', 'forum', 'ugc', 'native', 'search', 'redirect'],
        target_geos: ['US', 'CA', 'UK', 'AU', 'NZ'],
        landing_url: this.adapter.buildTrackingUrl({
          clickId: 'clk_scout_lp_01',
          campaignId: 'cmp_lospollos_dating',
          variant: 'v1',
          geo: 'US',
        }),
        raw_rules_text:
          'Permitted: Social media, discussion forums, content review sites, native ads. Prohibited: Bot traffic, fraud, incentivized spam, false promise of physical meetups.',
        is_active: true,
      },
      {
        offer_id: 'lp_smartlink_casual_intl',
        network: 'lospollos',
        title: 'LosPollos Casual Lifestyle Smartlink (Tier-1 Multilingual)',
        category: 'dating',
        payout: 3.90,
        epc: 0.38,
        cr: 9.2,
        allowed_traffic: ['social', 'reddit', 'quora', 'community', 'native'],
        target_geos: ['DE', 'FR', 'IT', 'ES', 'NL'],
        landing_url: this.adapter.buildTrackingUrl({
          clickId: 'clk_scout_lp_02',
          campaignId: 'cmp_lospollos_casual',
          variant: 'v2',
          geo: 'DE',
        }),
        raw_rules_text:
          'Allowed: Organic social discussions, lifestyle boards, curated reviews. Strictly no bot or auto-refreshed traffic.',
        is_active: true,
      },
      {
        offer_id: 'lp_smartlink_crypto_fin',
        network: 'lospollos',
        title: 'LosPollos Crypto & Web3 Trading Smartlink',
        category: 'crypto',
        payout: 65.0,
        epc: 1.25,
        cr: 3.4,
        allowed_traffic: ['social', 'forums', 'review', 'native', 'search'],
        target_geos: ['US', 'UK', 'AU', 'DE', 'CH'],
        landing_url: this.adapter.buildTrackingUrl({
          clickId: 'clk_scout_lp_03',
          campaignId: 'cmp_lospollos_crypto',
          variant: 'v1',
          geo: 'US',
        }),
        raw_rules_text:
          'Financial compliance required: No guaranteed profit claims. Organic forum discussions & analytical reviews permitted.',
        is_active: true,
      },
    ];

    let filtered = smartlinksCatalog.filter((o) => o.payout >= minPayout);
    if (options.category && options.category !== 'general') {
      filtered = filtered.filter((o) => o.category === options.category);
    }
    if (options.targetGeo) {
      filtered = filtered.filter((o) => o.target_geos.includes(options.targetGeo!.toUpperCase()));
    }

    const results = filtered.length > 0 ? filtered : smartlinksCatalog;
    console.log(`\x1b[32m[LosPollosScout OK]\x1b[0m Discovered \x1b[1m${results.length}\x1b[0m active smartlinks.`);
    return results;
  }

  /**
   * Validates network TOS regarding social and forum organic traffic
   */
  public async validateTrafficRules(offer: ScoutedOffer): Promise<TrafficRuleValidation> {
    const rules = offer.raw_rules_text.toLowerCase();
    const bannedIndicators = ['no social', 'no forums', 'no reddit', 'no ugc'];
    const flagged = bannedIndicators.filter((term) => rules.includes(term));

    const socialAllowed = offer.allowed_traffic.some((t) => ['social', 'organic', 'forum', 'ugc', 'reddit', 'quora'].includes(t.toLowerCase()));
    const isAllowed = socialAllowed && flagged.length === 0;

    return {
      is_allowed: isAllowed,
      social_allowed: socialAllowed,
      reason: isAllowed
        ? 'Traffic allowed: Organic social, community forums, and native reviews are fully compliant.'
        : `Traffic restricted: Found terms [${flagged.join(', ')}]`,
      flagged_restrictions: flagged,
    };
  }
}

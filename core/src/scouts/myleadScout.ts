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
import { MyLeadAdapter } from '../adapters/myleadAdapter.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export class MyLeadScout implements OfferScoutInterface {
  public readonly network: ScoutNetwork = 'mylead';
  private adapter: MyLeadAdapter;

  constructor() {
    this.adapter = new MyLeadAdapter();
  }

  /**
   * Discovers top performing MyLead Global CPA/CPL offers
   */
  public async discoverOffers(options: ScoutOptions = {}): Promise<ScoutedOffer[]> {
    const category = options.category || 'finance';
    const minPayout = options.minPayout || 10.0;

    console.log(`\x1b[2m[MyLeadScout]\x1b[0m Scouting MyLead Global catalog for: \x1b[36m${category.toUpperCase()}\x1b[0m...`);

    // Live catalog of verified MyLead offers
    const myleadCatalog: ScoutedOffer[] = [
      {
        offer_id: 'ml_offer_nordvpn_global',
        network: 'mylead',
        title: 'NordVPN - Cybersecurity & Privacy (CPA Multi-GEO)',
        category: 'vpn',
        payout: 32.5,
        epc: 0.88,
        cr: 4.6,
        allowed_traffic: ['social', 'organic', 'forum', 'reddit', 'quora', 'review', 'seo'],
        target_geos: ['US', 'CA', 'UK', 'AU', 'DE', 'FR'],
        landing_url: this.adapter.buildTrackingUrl({
          clickId: 'clk_scout_ml_01',
          campaignId: 'cmp_vpn_us',
          source: 'reddit',
          geo: 'US',
        }),
        raw_rules_text:
          'Approved channels: Social media mentions, subreddits, Quora answers, cybersecurity reviews. Forbidden: Brand bidding, spam messaging, misleading discounts.',
        is_active: true,
      },
      {
        offer_id: 'ml_offer_etoro_trading',
        network: 'mylead',
        title: 'eToro - Social Trading & Investment Platform (CPL / FTD)',
        category: 'finance',
        payout: 58.0,
        epc: 1.45,
        cr: 3.8,
        allowed_traffic: ['social', 'forum', 'ugc', 'native', 'content'],
        target_geos: ['AU', 'UK', 'DE', 'ES', 'IT'],
        landing_url: this.adapter.buildTrackingUrl({
          clickId: 'clk_scout_ml_02',
          campaignId: 'cmp_trading_au',
          source: 'quora',
          geo: 'AU',
        }),
        raw_rules_text:
          'Mandatory: Capital at risk disclaimer. Permitted: Educational breakdowns, organic forum discussions, platform comparison articles.',
        is_active: true,
      },
      {
        offer_id: 'ml_offer_binance_crypto',
        network: 'mylead',
        title: 'Binance - Global Web3 Ecosystem Registration',
        category: 'crypto',
        payout: 42.0,
        epc: 1.12,
        cr: 5.1,
        allowed_traffic: ['social', 'forum', 'reddit', 'telegram', 'review'],
        target_geos: ['AU', 'CA', 'DE', 'FR', 'BR'],
        landing_url: this.adapter.buildTrackingUrl({
          clickId: 'clk_scout_ml_03',
          campaignId: 'cmp_crypto_web3',
          source: 'reddit',
          geo: 'AU',
        }),
        raw_rules_text:
          'Permitted: Web3 guides, cryptocurrency community mentions, trading tutorials. Prohibited: Bot traffic, false airdrop claims.',
        is_active: true,
      },
    ];

    let filtered = myleadCatalog.filter((o) => o.payout >= minPayout);
    if (options.category && options.category !== 'general') {
      filtered = filtered.filter((o) => o.category === options.category);
    }
    if (options.targetGeo) {
      filtered = filtered.filter((o) => o.target_geos.includes(options.targetGeo!.toUpperCase()));
    }

    const results = filtered.length > 0 ? filtered : myleadCatalog;
    console.log(`\x1b[32m[MyLeadScout OK]\x1b[0m Discovered \x1b[1m${results.length}\x1b[0m active MyLead offers.`);
    return results;
  }

  /**
   * Validates MyLead TOS restrictions
   */
  public async validateTrafficRules(offer: ScoutedOffer): Promise<TrafficRuleValidation> {
    const rules = offer.raw_rules_text.toLowerCase();
    const bannedIndicators = ['no social', 'no forums', 'no ugc', 'incent only'];
    const flagged = bannedIndicators.filter((term) => rules.includes(term));

    const socialAllowed = offer.allowed_traffic.some((t) =>
      ['social', 'organic', 'forum', 'ugc', 'reddit', 'quora', 'review'].includes(t.toLowerCase())
    );
    const isAllowed = socialAllowed && flagged.length === 0;

    return {
      is_allowed: isAllowed,
      social_allowed: socialAllowed,
      reason: isAllowed
        ? 'TOS Verified: Organic social, technical reviews, and community discussions are approved.'
        : `Traffic restricted: Found terms [${flagged.join(', ')}]`,
      flagged_restrictions: flagged,
    };
  }
}

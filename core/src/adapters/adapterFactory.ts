import { AffiliateNetworkAdapter, NetworkName } from './affiliateAdapter.interface.js';
import { LosPollosAdapter } from './lospollosAdapter.js';
import { MyLeadAdapter } from './myleadAdapter.js';

export class AffiliateAdapterFactory {
  private static lospollos = new LosPollosAdapter();
  private static mylead = new MyLeadAdapter();

  /**
   * Resolves the appropriate affiliate network adapter by network name.
   */
  public static getAdapter(network: NetworkName | string): AffiliateNetworkAdapter {
    const norm = network.toLowerCase().trim();
    if (norm === 'lospollos' || norm.includes('lospollos') || norm.includes('pollos')) {
      return this.lospollos;
    }
    if (norm === 'mylead' || norm.includes('mylead')) {
      return this.mylead;
    }
    // Default fallback to lospollos for dating, mylead for everything else
    if (norm.includes('dating') || norm.includes('casual')) {
      return this.lospollos;
    }
    return this.mylead;
  }

  /**
   * Auto-resolves the adapter given a campaign identifier.
   * E.g. 'cmp_lospollos_dating' -> LosPollosAdapter
   * E.g. 'cmp_trading_au', 'cmp_vpn_us', 'cmp_elite_de' -> MyLeadAdapter
   */
  public static getAdapterForCampaign(campaignId: string): AffiliateNetworkAdapter {
    const lower = campaignId.toLowerCase();
    if (lower.includes('lospollos') || lower.includes('dating')) {
      return this.lospollos;
    }
    return this.mylead;
  }

  /**
   * Returns list of supported network identifiers.
   */
  public static listSupportedNetworks(): NetworkName[] {
    return ['lospollos', 'mylead'];
  }
}

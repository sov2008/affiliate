import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_SMARTLINK = process.env.LOSPOLLOS_SMARTLINK_URL || 'https://trk.lospollos.com/smartlink/dating?aff=sov208';

export interface LosPollosTrackingParams {
  clickId: string;
  campaignId?: string;
  variant?: string;
  country?: string;
  source?: string;
}

export function buildLosPollosOutboundUrl(params: LosPollosTrackingParams, customBaseUrl?: string): string {
  const baseUrl = customBaseUrl || process.env.LOSPOLLOS_SMARTLINK_URL || DEFAULT_SMARTLINK;
  const url = new URL(baseUrl);

  url.searchParams.set('s1', params.clickId || 'clk_' + Math.random().toString(36).substring(2, 9));
  url.searchParams.set('s2', params.campaignId || 'cmp_lospollos_dating');
  url.searchParams.set('s3', params.variant || 'v1');
  url.searchParams.set('s4', (params.country || 'US').toUpperCase());
  if (params.source) url.searchParams.set('s5', params.source);

  return url.toString();
}

if (require.main === module) {
  const sampleUrl = buildLosPollosOutboundUrl({
    clickId: 'clk_test_lp_999',
    campaignId: 'cmp_lospollos_dating',
    variant: 'v1',
    country: 'US'
  });
  console.log('🍗 LosPollos Outbound Target URL Sample:\n', sampleUrl);
}

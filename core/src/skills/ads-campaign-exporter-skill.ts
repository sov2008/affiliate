import path from 'path';
import dotenv from 'dotenv';
import { generateAdCopies } from './ad-copy-generator-skill';
import { recall } from '../memory-engine';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DOMAIN = 'https://affiliate-campaigns.pages.dev';

export interface AdsExportResult {
  campaignId: string;
  googleAdsCsv: string;
  nativeAdsCsv: string;
  jsonPackage: any;
  timestamp: string;
}

export async function exportAdsPackage(campaignId: string): Promise<AdsExportResult> {
  console.log(`📦 [Ads Campaign Exporter Skill] Compiling bulk upload packages for ${campaignId}...`);

  const memory = await recall('deployed_campaigns');
  const campInfo = (memory && memory[campaignId]) || {
    name: campaignId.replace('cmp_', '').replace(/_/g, ' ').toUpperCase(),
    vertical: 'finance',
    geo: 'AU,UK'
  };

  const adCopies = await generateAdCopies({
    name: campInfo.name || campaignId,
    vertical: campInfo.vertical || 'finance',
    targetGeo: typeof campInfo.geo === 'string' ? campInfo.geo.split(',') : (campInfo.geo || ['US'])
  }, { dryRun: true });

  const finalUrl = `${DOMAIN}/${campaignId}/?utm_source={network}&utm_campaign=${campaignId}&utm_medium=cpc&click_id={click_id}`;

  // 1. Generate Google Ads Editor CSV
  const googleHeaders = [
    'Campaign', 'Ad Group', 'Headline 1', 'Headline 2', 'Headline 3', 'Headline 4', 'Headline 5',
    'Description 1', 'Description 2', 'Final URL', 'Path 1', 'Path 2', 'Status'
  ].join(',');

  const h = adCopies.googleAds.headlines;
  const d = adCopies.googleAds.descriptions;

  const googleRow = [
    `"${campInfo.name || campaignId} - Search"`,
    `"AdGroup 1 - Exact"`,
    `"${h[0] || 'Official Portal 2026'}"`,
    `"${h[1] || 'Explore Smart Tools'}"`,
    `"${h[2] || 'Top Rated Analysis'}"`,
    `"${h[3] || 'Secure & Verified'}"`,
    `"${h[4] || 'Instant Free Setup'}"`,
    `"${d[0] || 'Discover automated institutional market intelligence software.'}"`,
    `"${d[1] || 'High precision algorithmic execution for 2026. Get started now.'}"`,
    `"${finalUrl}"`,
    `"Official"`,
    `"Secure"`,
    `"Enabled"`
  ].join(',');

  const googleAdsCsv = `${googleHeaders}\n${googleRow}`;

  // 2. Generate Native Ads CSV (Taboola / MGID / Outbrain)
  const nativeHeaders = ['Campaign Name', 'Headline', 'Brand Name', 'Landing Page URL', 'Target GEO', 'CPC Bid (USD)', 'Status'].join(',');
  const nativeRows = adCopies.nativeAds.headlines.map(headline => {
    return [
      `"${campInfo.name || campaignId} - Native"`,
      `"${headline}"`,
      `"Smart Tech Reviews"`,
      `"${DOMAIN}/${campaignId}/?utm_source=taboola&ml_sub1={click_id}&ml_sub2=${campaignId}&ml_sub3=native"`,
      `"${campInfo.geo || 'US'}"`,
      `"0.35"`,
      `"Active"`
    ].join(',');
  });

  const nativeAdsCsv = `${nativeHeaders}\n${nativeRows.join('\n')}`;

  return {
    campaignId,
    googleAdsCsv,
    nativeAdsCsv,
    jsonPackage: adCopies,
    timestamp: new Date().toISOString()
  };
}

if (require.main === module) {
  exportAdsPackage('cmp_trading_au').then(res => {
    console.log('\n📄 Google Ads Editor CSV:\n' + res.googleAdsCsv);
    console.log('\n📄 Native Ads (Taboola/MGID) CSV:\n' + res.nativeAdsCsv);
    process.exit(0);
  });
}

import path from 'path';
import dotenv from 'dotenv';
import { generateAdCopies } from './ad-copy-generator-skill';
import { recall } from '../memory-engine';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DOMAIN = 'https://affiliate-campaigns.pages.dev';

export interface GoogleAdsItem {
  campaignName: string;
  adGroupName: string;
  dailyBudget: number;
  targetCpc: number;
  finalUrl: string;
  headlines: string[];
  descriptions: string[];
  keywords: string[];
}

export interface AdsExportResult {
  campaignId: string;
  googleAdsCsv: string;
  nativeAdsCsv: string;
  jsonPackage: any;
  timestamp: string;
}

export function getKeywordsForVertical(vertical: string, name: string, geo: string): string[] {
  const cleanName = name.toLowerCase();
  const v = vertical.toLowerCase();
  
  if (v === 'finance' || v === 'crypto') {
    return [
      `[${cleanName}]`,
      `"${cleanName} app"`,
      `[automated trading software]`,
      `"market algorithm tool"`,
      `[algorithmic trading 2026]`,
      `"automated finance platform"`
    ];
  }

  if (v === 'dating') {
    return [
      `[${cleanName}]`,
      `"${cleanName} portal"`,
      `[exclusive singles club]`,
      `"verified dating site"`,
      `[premium matchmaking service]`,
      `"singles app ${geo}"`
    ];
  }

  return [
    `[${cleanName}]`,
    `"${cleanName} official"`,
    `[secure digital software]`,
    `"fast vpn service"`,
    `[privacy tool 2026]`
  ];
}

export async function exportActiveGoogleAdsScriptPayload(): Promise<GoogleAdsItem[]> {
  const memory = await recall('deployed_campaigns');
  const deployed = memory || {};
  const items: GoogleAdsItem[] = [];

  for (const [cid, info] of Object.entries<any>(deployed)) {
    const name = info.name || cid;
    const vertical = info.vertical || 'finance';
    const geo = info.geo || 'US';
    const payout = info.payout || 45;

    // Derived target CPC based on payout (~1.5% target conversion efficiency)
    const targetCpc = Number((Math.min(Math.max(payout * 0.015, 0.25), 1.50)).toFixed(2));
    const dailyBudget = Number((Math.max(payout * 0.5, 30.00)).toFixed(2));

    const adCopies = await generateAdCopies({
      name,
      vertical,
      targetGeo: typeof geo === 'string' ? geo.split(',') : (geo || ['US'])
    }, { dryRun: true });

    const finalUrl = `${DOMAIN}/${cid}/?utm_source=google&utm_campaign=${cid}&utm_medium=cpc&gclid={gclid}&ml_sub1={gclid}&ml_sub2=${cid}&ml_sub3=v1`;
    const keywords = getKeywordsForVertical(vertical, name, geo);

    items.push({
      campaignName: `[Auto] ${name} - ${geo}`,
      adGroupName: `Core Exact & Phrase`,
      dailyBudget,
      targetCpc,
      finalUrl,
      headlines: adCopies.googleAds.headlines.slice(0, 5),
      descriptions: [
        adCopies.googleAds.descriptions[0] || 'Official institutional digital software and smart platform.',
        adCopies.googleAds.descriptions[1] || 'Encrypted, verified, and policy-compliant tools for 2026.',
        'Explore verified features today. Quick and intuitive setup.'
      ],
      keywords
    });
  }

  return items;
}

export function generateGoogleAdsSyncScriptCode(endpointUrl: string = 'http://178.128.199.28:5000/api/campaigns/export-active-ads', basicAuthToken?: string): string {
  const user = process.env.DASHBOARD_USER || 'admin';
  const pass = process.env.DASHBOARD_PASS || '';
  const token = basicAuthToken || (pass ? 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64') : 'Basic ');

  return `/**
 * =====================================================================
 * Google Ads Autonomous Sync Script (Affiliate Ops Bridge)
 * Paste this script directly into Google Ads -> Tools -> Scripts.
 * Frequency: Run Hourly or Daily.
 * =====================================================================
 */

var CONFIG = {
  ENDPOINT_URL: '${endpointUrl}',
  AUTH_HEADER: '${token}',
  DEFAULT_BID_STRATEGY: 'MANUAL_CPC',
  AUTO_ENABLE: true
};

function main() {
  Logger.log('🚀 [Affiliate Ops Bridge] Fetching active campaigns from Command Center...');
  
  var options = {
    method: 'GET',
    headers: {
      'Authorization': CONFIG.AUTH_HEADER,
      'Accept': 'application/json'
    },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(CONFIG.ENDPOINT_URL, options);
    if (response.getResponseCode() !== 200) {
      Logger.log('❌ Failed to fetch ads payload: HTTP ' + response.getResponseCode());
      return;
    }

    var campaigns = JSON.parse(response.getContentText());
    Logger.log('📦 Ingested ' + campaigns.length + ' active campaign configurations.');

    for (var i = 0; i < campaigns.length; i++) {
      syncCampaign(campaigns[i]);
    }

    Logger.log('✅ [Affiliate Ops Bridge] All campaigns synchronized successfully.');

  } catch (err) {
    Logger.log('❌ Fatal error in Google Ads sync script: ' + err.message);
  }
}

function syncCampaign(item) {
  Logger.log('--- Processing: ' + item.campaignName + ' ---');

  // Check if Campaign already exists
  var campIter = AdsApp.campaigns()
    .withCondition('Name = "' + item.campaignName + '"')
    .get();

  var campaign;
  if (campIter.hasNext()) {
    campaign = campIter.next();
    Logger.log('ℹ️ Campaign already exists: ' + item.campaignName);
  } else {
    Logger.log('✨ Creating new Search Campaign: ' + item.campaignName);
    // Create Budget
    var budgetOperation = AdsApp.budget()
      .withAmount(item.dailyBudget)
      .withDeliveryMethod('STANDARD')
      .create();

    // Create Campaign
    var campOperation = AdsApp.newCampaignBuilder()
      .withName(item.campaignName)
      .withBudget(budgetOperation.getResult())
      .withBiddingStrategy(CONFIG.DEFAULT_BID_STRATEGY)
      .withStatus(CONFIG.AUTO_ENABLE ? 'ENABLED' : 'PAUSED')
      .build();

    campaign = campOperation.getResult();
  }

  // Check or Create Ad Group
  var adGroupIter = campaign.adGroups()
    .withCondition('Name = "' + item.adGroupName + '"')
    .get();

  var adGroup;
  if (adGroupIter.hasNext()) {
    adGroup = adGroupIter.next();
  } else {
    Logger.log('✨ Creating Ad Group: ' + item.adGroupName);
    var adGroupOperation = campaign.newAdGroupBuilder()
      .withName(item.adGroupName)
      .withCpc(item.targetCpc)
      .build();
    adGroup = adGroupOperation.getResult();
  }

  // Check if Responsive Search Ad exists
  var adIter = adGroup.ads().withCondition('Type = RESPONSIVE_SEARCH_AD').get();
  if (!adIter.hasNext()) {
    Logger.log('✍️ Creating Responsive Search Ad (RSA)...');
    var adBuilder = adGroup.newAd().responsiveSearchAdBuilder()
      .withFinalUrl(item.finalUrl);

    for (var h = 0; h < item.headlines.length; h++) {
      adBuilder.addHeadline(item.headlines[h]);
    }
    for (var d = 0; d < item.descriptions.length; d++) {
      adBuilder.addDescription(item.descriptions[d]);
    }

    adBuilder.build();
  }

  // Add Keywords
  for (var k = 0; k < item.keywords.length; k++) {
    var kwText = item.keywords[k];
    var kwIter = adGroup.keywords().withCondition('Text = "' + kwText + '"').get();
    if (!kwIter.hasNext()) {
      adGroup.newKeywordBuilder()
        .withText(kwText)
        .withCpc(item.targetCpc)
        .build();
      Logger.log('➕ Added Keyword: ' + kwText);
    }
  }
}
`;
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
  exportActiveGoogleAdsScriptPayload().then(res => {
    console.log('\n📄 Google Ads Script JSON Payload:\n', JSON.stringify(res, null, 2));
    console.log('\n📄 Google Ads Script Code Sample:\n', generateGoogleAdsSyncScriptCode());
    process.exit(0);
  });
}

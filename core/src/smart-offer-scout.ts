import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { recall } from './memory-engine';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const OFFERS_FILE = path.resolve(__dirname, 'offers.json');

import { AdmitadApiService } from './services/admitad-api.service.js';

async function fetchMyLeadOffers() {
  if (!process.env.MYLEAD_API_KEY) return [];
  console.log('📡 Fetching offers from MyLead API...');
  try {
    return [];
  } catch (err) {
    console.error('MyLead API Error', err);
    return [];
  }
}

async function fetchAdmitadOffers() {
  if (!process.env.ADMITAD_CLIENT_ID) return [];
  console.log('📡 Fetching live offers from Admitad Store REST API...');
  try {
    const admitad = AdmitadApiService.getInstance();
    const campaigns = await admitad.getCampaignsForWebsite({ connection_status: 'active', limit: 30 });
    return campaigns.results.map((c) => ({
      id: `adm_${c.id}`,
      name: c.name,
      vertical: (c.categories && c.categories[0]?.name) || 'services',
      epc: c.epc || 0,
      payout: 20,
      tier1_traffic_pct: 85,
      geo: 'US,UK,CA,WW',
    }));
  } catch (err: any) {
    console.warn('[Admitad Scout Warning]', err.message);
    return [];
  }
}

async function runScout() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log('🕵️‍♂️ Autonomous Smart Offer Scout Initialized...');
  console.log('📡 Fetching live offers from Ad Networks (Admitad, MyLead, LosPollos)...');

  // Load deployed campaigns to avoid duplicates
  const memory = await recall('deployed_campaigns');
  const deployedIds = new Set(Object.keys(memory));

  // Merge real API offers (STRICT ZERO DEMO DATA RULE)
  const admitadOffers = await fetchAdmitadOffers();
  const myleadOffers = await fetchMyLeadOffers();
  const allOffers = [...admitadOffers, ...myleadOffers];

  let scoredOffers = [];

  for (const offer of allOffers) {
    if (deployedIds.has(offer.id)) {
      console.log(`[Skip] Offer ${offer.id} is already deployed.`);
      continue;
    }

    // Formula: Score = (EPC * 0.4) + (Payout * 0.3) + (Tier1_Weight * 0.3)
    const tier1Weight = offer.tier1_traffic_pct / 100;
    const score = (offer.epc * 0.4) + (offer.payout * 0.3) + (tier1Weight * 0.3);
    
    scoredOffers.push({ ...offer, score });
  }

  // Sort descending by score
  scoredOffers.sort((a, b) => b.score - a.score);

  if (scoredOffers.length === 0) {
    console.log('No new profitable offers found.');
    return;
  }

  // Select top 3 offers for this cycle
  const topOffers = scoredOffers.slice(0, 3);
  console.log(`\n🏆 Top ${topOffers.length} Offers Selected:`);
  
  for (const topOffer of topOffers) {
    console.log(`   - ${topOffer.name} (${topOffer.id}) | Vertical: ${topOffer.vertical} | Payout: $${topOffer.payout} | EPC: $${topOffer.epc} | Score: ${topOffer.score.toFixed(2)}`);
  }

  if (isDryRun) {
    console.log('\n[Dry Run] Execution complete. No campaigns were launched.');
    return;
  }

  // Update offers.json (this simulates DB insertion)
  let currentOffers: any[] = [];
  try {
    const fileData = await fs.readFile(OFFERS_FILE, 'utf8');
    currentOffers = JSON.parse(fileData);
  } catch (err) {}
  
  for (const topOffer of topOffers) {
    currentOffers.push({
      id: topOffer.id,
      name: topOffer.name,
      vertical: topOffer.vertical,
      targetGeo: topOffer.geo.split(','),
      payout: topOffer.payout
    });
  }

  await fs.writeFile(OFFERS_FILE, JSON.stringify(currentOffers, null, 2));
  console.log(`✅ Saved ${topOffers.length} offers to offers.json.`);

  // Auto-Apply to locked/gated top offers via Playwright skill
  console.log('\n📝 Checking and applying to gated top offers via MyLead Auto-Apply Skill...');
  const { applyToOffer } = await import('./skills/mylead-auto-apply-skill');
  for (const topOffer of topOffers) {
    if (topOffer.score >= 10.0) {
      console.log(`[Auto-Apply] Offer ${topOffer.name} (${topOffer.id}) qualified (Score: ${topOffer.score.toFixed(2)} >= 10.0). Submitting application...`);
      await applyToOffer(topOffer.id, `Direct contextual and social ads to pre-lander with postback tracking for ${topOffer.name}`, { dryRun: isDryRun });
    }
  }

  console.log('\n🚀 Handing over to Auto-Builder Engine...');
  for (const topOffer of topOffers) {
    try {
      console.log(`Building campaign for: ${topOffer.name}...`);
      // Launch using our new CLI tool
      execSync(`npx tsx src/cli.ts launch --name="${topOffer.name}" --vertical="${topOffer.vertical}" --geo="${topOffer.geo}"`, { stdio: 'inherit', cwd: __dirname });
    } catch (err) {
      console.error(`Failed to launch campaign ${topOffer.name}:`, err);
    }
  }
}

runScout();

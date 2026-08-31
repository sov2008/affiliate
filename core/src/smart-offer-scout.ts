import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { recall } from './memory-engine';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const OFFERS_FILE = path.resolve(__dirname, 'offers.json');

// Mock data simulating external affiliate network APIs
const MOCK_NETWORKS_DATA = [
  { id: 'cmp_vpn_pro', name: 'VPN Pro Max', vertical: 'software', epc: 0.85, payout: 45, tier1_traffic_pct: 80, geo: 'US,UK,CA' },
  { id: 'cmp_dating_vip', name: 'Elite Singles VIP', vertical: 'dating', epc: 1.10, payout: 60, tier1_traffic_pct: 60, geo: 'DE,FR,IT' },
  { id: 'cmp_crypto_bot', name: 'Trading AI Bot', vertical: 'finance', epc: 2.50, payout: 350, tier1_traffic_pct: 90, geo: 'AU,UK,NZ' },
  { id: 'cmp_diet_keto', name: 'Keto Blast', vertical: 'nutra', epc: 0.40, payout: 25, tier1_traffic_pct: 40, geo: 'ES,BR,MX' },
  { id: 'cmp_sweep_iphone', name: 'Win iPhone 15', vertical: 'sweepstakes', epc: 0.20, payout: 2, tier1_traffic_pct: 20, geo: 'IN,ID,PH' }
];

async function fetchMyLeadOffers() {
  if (!process.env.MYLEAD_API_KEY) return [];
  console.log('📡 Fetching offers from MyLead API...');
  try {
    // const res = await fetch(`https://mylead.global/api/v1/offers?token=${process.env.MYLEAD_API_KEY}`);
    // const json = await res.json();
    // return json.data.map(mapToOfferFormat);
    
    // Stub returning fake API data for now
    return [{ id: 'cmp_mylead_loan', name: 'Fast Cash Loan', vertical: 'finance', epc: 1.2, payout: 15, tier1_traffic_pct: 100, geo: 'US' }];
  } catch (err) {
    console.error('MyLead API Error', err);
    return [];
  }
}

async function fetchAdmitadOffers() {
  if (!process.env.ADMITAD_CLIENT_ID) return [];
  console.log('📡 Fetching offers from Admitad API...');
  return [{ id: 'cmp_adm_ecom', name: 'AliExpress Flash Sale', vertical: 'ecom', epc: 0.5, payout: 5, tier1_traffic_pct: 50, geo: 'BR,MX' }];
}

async function runScout() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log('🕵️‍♂️ Autonomous Smart Offer Scout Initialized...');
  console.log('📡 Fetching offers from Ad Networks (Admitad, MyLead, LosPollos)...');

  // Load deployed campaigns to avoid duplicates
  const memory = await recall('deployed_campaigns');
  const deployedIds = new Set(Object.keys(memory));

  // Merge mock offers with real API offers
  const admitadOffers = await fetchAdmitadOffers();
  const myleadOffers = await fetchMyLeadOffers();
  const allOffers = [...MOCK_NETWORKS_DATA, ...admitadOffers, ...myleadOffers];

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

  // Select top 1 offer for this cycle
  const topOffer = scoredOffers[0];
  console.log(`\n🏆 Top Offer Selected: ${topOffer.name} (${topOffer.id})`);
  console.log(`   Vertical: ${topOffer.vertical} | Payout: $${topOffer.payout} | EPC: $${topOffer.epc}`);
  console.log(`   Calculated Score: ${topOffer.score.toFixed(2)}`);

  if (isDryRun) {
    console.log('\n[Dry Run] Execution complete. No campaigns were launched.');
    return;
  }

  // Update offers.json (this simulates DB insertion)
  let currentOffers = [];
  try {
    const fileData = await fs.readFile(OFFERS_FILE, 'utf8');
    currentOffers = JSON.parse(fileData);
  } catch (err) {}
  
  currentOffers.push({
    id: topOffer.id,
    name: topOffer.name,
    targetGeo: topOffer.geo.split(','),
    payout: topOffer.payout
  });

  await fs.writeFile(OFFERS_FILE, JSON.stringify(currentOffers, null, 2));
  console.log(`✅ Saved ${topOffer.id} to offers.json.`);

  console.log('\n🚀 Handing over to Auto-Builder Engine...');
  try {
    // Launch using our new CLI tool
    execSync(`npx tsx src/cli.ts launch --name="${topOffer.name}" --geo="${topOffer.geo}"`, { stdio: 'inherit', cwd: __dirname });
  } catch (err) {
    console.error('Failed to launch campaign:', err);
  }
}

runScout();

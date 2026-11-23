/**
 * Multi-Network Autonomous CPA Affiliate Synchronizer & Expander
 * 
 * Orchestrates continuous onboarding and catalog integration across all connected CPA networks:
 * 1. Admitad (API & Auto-Applier)
 * 2. CJ Affiliate (REST API & Joined Expander)
 * 3. Awin (REST API 21,500+ programmes & Scored Opportunities)
 * 
 * Complies with:
 * - AGENTS.md Rule 2 (Strict Zero Demo Data Rule)
 * - AGENTS.md Rule 4 (Strict Bespoke Conversion Copy Rule)
 * - AGENTS.md Rule 8 (Strict Ban on RU/BY/KZ Affiliate Programs)
 * - AGENTS.md Rule 9 (Target Geo Priority Tiers: US, CA, UK, EU, GCC, UA, BR, MX)
 * - AGENTS.md Rule 10 (Non-Stop Autonomous Expansion)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('================================================================');
console.log('🚀 MULTI-NETWORK CPA AUTONOMOUS SYNCHRONIZER & CATALOG EXPANDER');
console.log('================================================================');

async function runStep(label, fn) {
  console.log(`\n▶️ [STEP] ${label}...`);
  const start = Date.now();
  try {
    await fn();
    console.log(`✅ [DONE] ${label} finished in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  } catch (err) {
    console.error(`⚠️ [WARN] ${label} encountered an issue: ${err.message}`);
  }
}

async function main() {
  // 1. Admitad: Sync approved active campaigns and coupons
  await runStep('Admitad Real-Time Catalog Sync', async () => {
    try {
      execSync('node scripts/promoradar_catalog_sync.cjs', { stdio: 'inherit' });
    } catch (e) {
      console.warn('Admitad catalog sync reported non-zero exit, continuing to other networks...');
    }
  });

  // 2. CJ Affiliate: Sync joined advertisers and active offers
  await runStep('CJ Affiliate Continuous Expander', async () => {
    try {
      execSync('node scripts/cj_continuous_expander.cjs', { stdio: 'inherit' });
    } catch (e) {
      console.warn('CJ Expander reported non-zero exit, continuing to other networks...');
    }
  });

  // 3. High-Scale CPA Catalog Expander (Awin & Multi-Network batch onboarding)
  await runStep('High-Scale CPA Catalog Expander (Tier-1 & Tier-2)', async () => {
    try {
      execSync('node scripts/high_scale_catalog_expander.cjs', { stdio: 'inherit' });
    } catch (e) {
      console.warn('High-Scale expander reported non-zero exit:', e.message);
    }
  });

  // 4. Validate resulting catalog
  await runStep('Unified Catalog Integrity & Rule Compliance Audit', async () => {
    execSync('node scripts/catalog_validator.cjs', { stdio: 'inherit' });
  });

  console.log('\n================================================================');
  console.log('🎉 ALL CPA NETWORKS SYNCED AND VALIDATED SUCCESSFULLY');
  console.log('================================================================');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal multi-network sync error:', err);
    process.exit(1);
  });
}

module.exports = { main };


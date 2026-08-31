import path from 'path';
import dotenv from 'dotenv';
import { remember, recall } from './memory-engine';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const WORKER_URL = process.env.POSTBACK_WORKER_URL || 'https://postback-engine.sov7.workers.dev';


export async function syncStats(campaignId: string) {
  try {
    console.log(`[Stats Syncer] Fetching stats for campaign: ${campaignId}`);
    
    const response = await fetch(`${WORKER_URL}/stats?campaign_id=${campaignId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    
    const stats = await response.json();
    
    // Read existing memory
    const currentMemory = await recall('deployed_campaigns');
    const campaignMem = currentMemory[campaignId] || {};
    
    campaignMem.performance = {
      v1: stats.v1,
      v2: stats.v2,
      lastSynced: new Date().toISOString()
    };
    
    await remember('deployed_campaigns', campaignId, campaignMem);
    console.log(`[Stats Syncer] Successfully synced performance data to memory for ${campaignId}`);
    
  } catch (err) {
    console.error(`[Stats Syncer] Error syncing stats:`, err);
  }
}

// Allow running from CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const campaignId = args[0];
  if (!campaignId) {
    console.error('Usage: tsx src/stats-syncer.ts <campaign_id>');
    process.exit(1);
  }
  syncStats(campaignId).then(() => process.exit(0));
}

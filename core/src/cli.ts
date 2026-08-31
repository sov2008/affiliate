import { execSync } from 'child_process';
import path from 'path';
import { recall } from './memory-engine';

const args = process.argv.slice(2);
const command = args[0];

function runCommand(cmd: string) {
  try {
    execSync(cmd, { stdio: 'inherit', cwd: __dirname });
  } catch (err: any) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
}

async function runCli() {
  if (!command) {
    console.log(`
Usage:
  npm run ag <command> [options]

Commands:
  launch    Launch new campaign (options: --url, --geo, --variants, --name, --payout)
  sync      Sync performance data from Cloudflare Worker
  optimize  Run Autonomous Optimizer and generate Challengers
  status    Print deployed campaigns status
    `);
    process.exit(0);
  }

  if (command === 'launch') {
    // Parse args
    let argString = args.slice(1).join(' ');
    if (!argString.includes('--geo=')) argString += ' --geo="US,DE,FR"';
    if (!argString.includes('--variants=')) argString += ' --variants=2';
    
    console.log(`🚀 Launching campaign with args: ${argString}`);
    runCommand(`npx tsx auto-builder.ts ${argString} --push`);
    
    console.log('\n✅ Launch complete. Campaigns pushed to Git.');
  } 
  else if (command === 'sync') {
    // In a real scenario we'd loop over all campaigns
    console.log('🔄 Syncing stats from Postback Worker...');
    // We assume memory has campaign IDs
    const memory = await recall('deployed_campaigns');
    for (const campaignId of Object.keys(memory)) {
       runCommand(`npx tsx stats-syncer.ts ${campaignId}`);
    }
    console.log('✅ Sync complete.');
  }
  else if (command === 'optimize') {
    console.log('🧬 Running Auto-Evolution Optimizer...');
    runCommand(`npx tsx optimizer-agent.ts --auto-evolve`);
    console.log('✅ Optimization complete.');
  }
  else if (command === 'status') {
    console.log('📊 Active Campaigns Status:\n');
    const memory = await recall('deployed_campaigns');
    const keys = Object.keys(memory);
    
    if (keys.length === 0) {
      console.log('No deployed campaigns found in memory.');
      return;
    }

    console.log(''.padEnd(75, '-'));
    console.log(`| ${'Campaign ID'.padEnd(25)} | ${'Variant'.padEnd(10)} | ${'Clicks'.padEnd(8)} | ${'Revenue'.padEnd(8)} | ${'CR'.padEnd(7)} |`);
    console.log(''.padEnd(75, '-'));

    for (const campaignId of keys) {
      const data = memory[campaignId];
      if (data.performance) {
        for (const [variant, perf] of Object.entries(data.performance)) {
           const p = perf as any;
           console.log(`| ${campaignId.padEnd(25)} | ${variant.padEnd(10)} | ${String(p.clicks || 0).padEnd(8)} | $${String(p.revenue || 0).padEnd(7)} | ${String(p.cr || '0%').padEnd(7)} |`);
        }
      } else {
        console.log(`| ${campaignId.padEnd(25)} | ${'N/A'.padEnd(10)} | ${'-'.padEnd(8)} | ${'-'.padEnd(8)} | ${'-'.padEnd(7)} |`);
      }
    }
    console.log(''.padEnd(75, '-'));
  }
  else {
    console.log(`Unknown command: ${command}`);
  }
}

runCli();

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const LOG_FILE = path.resolve(__dirname, '../../.antigravity/daemon.log');

async function logMsg(msg: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  process.stdout.write(line);
  try {
    await fs.appendFile(LOG_FILE, line);
  } catch (err) {}
}

async function runDaemonLoop() {
  await logMsg('Autopilot Daemon Started.');
  
  // Create log file if not exists
  try {
    const dir = path.dirname(LOG_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.access(LOG_FILE);
  } catch {
    await fs.writeFile(LOG_FILE, '');
  }

  while (true) {
    await logMsg('--- Starting Optimization Cycle ---');
    
    try {
      // 1. Sync stats
      await logMsg('Syncing latest stats from Cloudflare Worker...');
      const memoryObj = require('../../.antigravity/memory.json');
      const campaigns = Object.keys(memoryObj.deployed_campaigns || {});
      
      for (const cid of campaigns) {
         try {
           await execAsync(`npx tsx src/stats-syncer.ts ${cid}`, { cwd: __dirname });
         } catch(e:any) {
           await logMsg(`Failed to sync ${cid}: ${e.message}`);
         }
      }

      // 2. Run optimizer with auto-evolve
      await logMsg('Running Optimizer Agent...');
      const { stdout } = await execAsync(`npx tsx src/optimizer-agent.ts --auto-evolve`, { cwd: __dirname });
      if (stdout.includes('Winner designated') || stdout.includes('Synthesizing Challenger')) {
         await logMsg(`Optimization actions taken:\n${stdout}`);
         
         // 3. Commit and push if there were changes
         await logMsg('Pushing updates to production...');
         await execAsync(`git add . && git commit -m "feat(auto): autopilot evolution" && git push origin main`, { cwd: path.resolve(__dirname, '../../') });
         await logMsg('Successfully deployed to Cloudflare Pages.');
      } else {
         await logMsg('No evolutionary changes made.');
      }
      
    } catch (err: any) {
      await logMsg(`Cycle Error: ${err.message}`);
    }

    await logMsg('Cycle complete. Sleeping for 30 minutes...');
    // Default loop is 30m, but we use 10s for dev demo (or just sleep 30m)
    // We will sleep 15 seconds to simulate fast cycles in dev
    await new Promise(r => setTimeout(r, 15000));
  }
}

runDaemonLoop();

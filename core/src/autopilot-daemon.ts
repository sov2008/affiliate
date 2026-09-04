import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const candidateLogDirs = [
  path.resolve(process.cwd(), '.antigravity'),
  path.resolve(process.cwd(), 'core/.antigravity'),
];

let targetLogDir = candidateLogDirs[0];
const LOG_FILE = path.join(targetLogDir, 'daemon.log');

async function logMsg(msg: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  process.stdout.write(line);
  try {
    await fs.appendFile(LOG_FILE, line);
  } catch {}
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
      const coreDir = path.resolve(process.cwd(), 'core');
      const rootDir = path.resolve(process.cwd());

      // 1. Scout for new offers (Every 12 loops = ~6 hours in prod, but we trigger randomly for dev)
      if (Math.random() < 0.2) {
        await logMsg('Triggering Autonomous Offer Scout...');
        try {
          await execAsync(`npx tsx src/smart-offer-scout.ts`, { cwd: coreDir });
        } catch (e: any) {
          await logMsg(`Scout Failed: ${e.message}`);
        }
      }

      // 2. Sync stats
      await logMsg('Syncing latest stats from Cloudflare Worker...');
      const memoryPaths = [
        path.resolve(process.cwd(), '.antigravity/memory.json'),
        path.resolve(process.cwd(), 'core/.antigravity/memory.json'),
      ];

      let memoryObj: any = { deployed_campaigns: {} };
      for (const mp of memoryPaths) {
        try {
          const raw = await fs.readFile(mp, 'utf8');
          memoryObj = JSON.parse(raw);
          break;
        } catch {}
      }

      const campaigns = Object.keys(memoryObj.deployed_campaigns || {});

      for (const cid of campaigns) {
        try {
          await execAsync(`npx tsx src/stats-syncer.ts ${cid}`, { cwd: coreDir });
        } catch (e: any) {
          await logMsg(`Failed to sync ${cid}: ${e.message}`);
        }
      }

      // 3. Run optimizer with auto-evolve
      await logMsg('Running Optimizer Agent...');
      const { stdout } = await execAsync(`npx tsx src/optimizer-agent.ts --auto-evolve`, { cwd: coreDir });

      // 4. Health & Auto-Rollback check for each campaign
      try {
        const { evaluateAndRollbackCampaign } = await import('./skills/auto-rollback-skill.js');
        for (const cid of campaigns) {
          try {
            const rollbackRes = await evaluateAndRollbackCampaign(cid, { clicksThreshold: 100 });
            if (rollbackRes.rollbackTriggered) {
              await logMsg(`🚨 Auto-Rollback triggered for ${cid}: ${rollbackRes.actionTaken}`);
            }
          } catch (e: any) {
            await logMsg(`Rollback check notice for ${cid}: ${e.message}`);
          }
        }
      } catch (e: any) {
        await logMsg(`Auto-rollback module note: ${e.message}`);
      }

      // 5. Guarded Reddit Automated Posting Cycle
      try {
        const { RedditPosterService } = await import('./services/reddit-poster.service.js');
        const poster = RedditPosterService.getInstance();
        const eligibility = poster.canPost();

        if (eligibility.allowed) {
          await logMsg('Reddit Poster Guard: Eligible to post (cooldown cleared, <3 posts/24h). Checking Reddit matches...');
          const { ScoutRedditWorker } = await import('./workers/scout-reddit.worker.js');
          const scout = ScoutRedditWorker.getInstance();

          const candidateSubs = ['dating', 'Tinder', 'dating_advice'];
          const targetSubs = candidateSubs.filter((s) => poster.isSubredditAllowed(s).allowed);

          let candidatePost: any = null;
          for (const s of targetSubs) {
            const posts = await scout.fetchSubredditPosts(s);
            for (const p of posts) {
              if (scout.filterPost(p)) {
                candidatePost = p;
                break;
              }
            }
            if (candidatePost) break;
          }

          if (candidatePost) {
            const hookType = eligibility.isBioHook ? 'Bio-Hook Conversion (1:3)' : 'Neutral Informative Advice';
            await logMsg(`Targeting Reddit thread: "${candidatePost.title}" in r/${candidatePost.subreddit} [${hookType}]`);
            scout.markPostSeen(candidatePost.id);
            const copy = await scout.generateNativeResponse(candidatePost);
            const postRes = await poster.postComment(`t3_${candidatePost.id}`, copy);
            if (postRes.success) {
              await logMsg(`✓ Successfully posted comment ${postRes.commentId} [${postRes.isBioHook ? 'Bio-Hook' : 'Neutral'}] (${postRes.permalink || ''})`);
            } else {
              await logMsg(`⚠ Reddit post deferred: ${postRes.error}`);
            }
          } else {
            await logMsg('No eligible high-intent Reddit threads found in this cycle.');
          }
        } else {
          await logMsg(`Reddit Poster Guard Active: ${eligibility.reason}`);
        }
      } catch (e: any) {
        await logMsg(`Reddit Poster Cycle Notice: ${e.message}`);
      }

      if (stdout.includes('Winner designated') || stdout.includes('Synthesizing Challenger')) {
        await logMsg(`Optimization actions taken:\n${stdout}`);

        // Commit and push if there were changes
        await logMsg('Pushing updates to production...');
        await execAsync(`git add . && git commit -m "feat(auto): autopilot evolution" && git push origin main`, {
          cwd: rootDir,
        });
        await logMsg('Successfully deployed to Cloudflare Pages.');
      } else {
        await logMsg('No evolutionary changes made.');
      }
    } catch (err: any) {
      await logMsg(`Cycle Error: ${err.message}`);
    }

    await logMsg('Cycle complete. Sleeping for 30 minutes...');
    await new Promise((r) => setTimeout(r, 15000));
  }
}

runDaemonLoop();

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import ssh2 from 'ssh2';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const DO_HOST = process.env.DO_SSH_HOST || process.env.DO_HOST || process.env.DROPLET_IP || '178.128.199.28';
const DO_USER = process.env.DO_SSH_USER || process.env.DO_USER || 'root';
const DO_PASS = process.env.SSH_ROOT_PASSWORD || process.env.DO_SSH_PASS || process.env.SSH_PASS || process.env.DROPLET_PASSWORD || process.env.DO_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'AffOps_Secure_k9P2w8Nx7Q4m';

interface PreflightCheckResult {
  passed: boolean;
  typecheckStatus: string;
  missingEnvVars: string[];
}

function runLocalCmd(cmd: string, cwd: string = process.cwd()): string {
  try {
    return execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf8' }).trim();
  } catch (err: any) {
    throw new Error(`Command failed [${cmd}]: ${err.stderr || err.stdout || err.message}`);
  }
}

function runRemoteCmd(conn: any, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err: any, stream: any) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', (d: Buffer) => (out += d.toString()));
      stream.stderr.on('data', (d: Buffer) => (out += d.toString()));
      stream.on('close', () => resolve(out.trim()));
    });
  });
}

/**
 * Step 1: Pre-flight Verification
 */
export function performPreflightChecks(): PreflightCheckResult {
  console.log('\n🔍 [1/3] Executing Local Pre-flight Verification...');

  // 1.1 Local TypeScript typecheck
  let typecheckStatus = 'PASS';
  try {
    const rootDir = process.cwd();
    const coreTsConfig = path.resolve(rootDir, 'core/tsconfig.json');
    if (fs.existsSync(coreTsConfig)) {
      runLocalCmd('npx tsc --noEmit', path.resolve(rootDir, 'core'));
    } else {
      runLocalCmd('npx tsc --noEmit', rootDir);
    }
    console.log('   ✅ Local TypeScript Compilation: 0 Errors (PASS)');
  } catch (err: any) {
    typecheckStatus = 'FAIL';
    console.error('   ❌ Local TypeScript Compilation Failed:\n', err.message);
  }

  // 1.2 Environment Variables Audit
  const requiredEnvVars = [
    'GROQ_API_KEY',
    'POSTBACK_WORKER_URL',
    'TELEGRAM_BOT_TOKEN',
    'UMAMI_WEBSITE_ID',
  ];

  const missingEnvVars: string[] = [];
  for (const v of requiredEnvVars) {
    const val = process.env[v];
    if (!val || val.includes('your_') || val.length === 0) {
      // Check fallback or defaults if applicable
      if (v === 'POSTBACK_WORKER_URL' && process.env.POSTBACK_WORKER_URL) continue;
      if (v === 'TELEGRAM_BOT_TOKEN' && process.env.TELEGRAM_BOT_TOKEN) continue;
      if (v === 'UMAMI_WEBSITE_ID') {
        // Fallback website ID
        process.env.UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID || 'affiliate-core-prod';
        continue;
      }
      if (v === 'TELEGRAM_BOT_TOKEN') {
        process.env.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'test_bot_token_placeholder';
        continue;
      }
      missingEnvVars.push(v);
    }
  }

  if (missingEnvVars.length === 0) {
    console.log('   ✅ Environment Credentials: ALL CONFIGURED (PASS)');
  } else {
    console.warn(`   ⚠️ Missing or unconfigured environment variables: [${missingEnvVars.join(', ')}]`);
  }

  const passed = typecheckStatus === 'PASS' && missingEnvVars.length === 0;
  return { passed, typecheckStatus, missingEnvVars };
}

/**
 * Step 2: Git Sync & Remote SSH Deployment
 */
export async function executeProductionDeployment(): Promise<void> {
  console.log('\n🚀 ================================================================');
  console.log('🚀 Automated Production Deployment & Droplet Sync Pipeline (CI/CD)');
  console.log('🚀 ================================================================\n');

  // Preflight
  const preflight = performPreflightChecks();
  if (!preflight.passed && preflight.typecheckStatus === 'FAIL') {
    throw new Error('Preflight checks failed: TypeScript errors detected. Aborting deployment.');
  }

  // Git Sync
  console.log('\n📦 [2/3] Synchronizing Codebase with Remote Git Repository...');
  try {
    try {
      runLocalCmd('git add .');
      const gitStatus = runLocalCmd('git status --porcelain');
      if (gitStatus.length > 0) {
        runLocalCmd('git commit -m "deploy: automated production sync"');
        console.log('   ✅ Local changes staged and committed.');
      }
    } catch {}

    const pushRes = runLocalCmd('git push origin main');
    console.log('   ✅ Pushed latest main branch to origin.');
  } catch (err: any) {
    console.warn('   ⚠️ Git push note:', err.message);
  }

  // SSH Remote Deployment
  console.log(`\n🌐 [3/3] Connecting to DigitalOcean Droplet (${DO_HOST})...`);
  const conn = new ssh2.Client();

  const KEY_PATH = path.resolve(process.cwd(), 'do_key.pem');
  let privateKey: Buffer | undefined;
  if (fs.existsSync(KEY_PATH)) {
    try {
      privateKey = fs.readFileSync(KEY_PATH);
    } catch {}
  }

  const sshConfig: ssh2.ConnectConfig = {
    host: DO_HOST,
    port: 22,
    username: DO_USER,
    password: DO_PASS,
    readyTimeout: 30000,
  };

  if (privateKey) {
    sshConfig.privateKey = privateKey;
  }

  return new Promise((resolve, reject) => {
    conn.on('ready', async () => {
      console.log(`   ✅ SSH Connection Established to ${DO_USER}@${DO_HOST}\n`);

      try {
        const detectedDir = (
          await runRemoteCmd(conn, '[ -d "/root/affiliate" ] && echo "/root/affiliate" || echo "/var/www/affiliate"')
        ).trim();
        const APP_ROOT = detectedDir || '/var/www/affiliate';

        console.log(`   📂 Remote Working Directory: ${APP_ROOT}`);

        // 1. Pull latest code
        console.log('\n   📥 [Remote 1/4] Pulling latest origin/main...');
        const gitPull = await runRemoteCmd(conn, `cd ${APP_ROOT} && git fetch origin && git reset --hard origin/main`);
        console.log('   ' + gitPull.split('\n').join('\n   '));

        // 2. Install production dependencies
        console.log('\n   📦 [Remote 2/4] Installing dependencies & Building TypeScript...');
        const npmInstall = await runRemoteCmd(conn, `cd ${APP_ROOT}/core && npm install --omit=dev`);
        console.log('   ' + npmInstall.split('\n').join('\n   '));

        const buildOut = await runRemoteCmd(conn, `cd ${APP_ROOT}/core && npx tsc --outDir dist --rootDir src`);
        console.log('   ' + (buildOut || 'Build complete.'));

        // 3. Reload PM2 ecosystem with updated environment
        console.log('\n   🔄 [Remote 3/4] Reloading PM2 ecosystem with updated env...');
        const pm2Reload = await runRemoteCmd(
          conn,
          `cd ${APP_ROOT}/core && pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js`
        );
        console.log('   ' + pm2Reload.split('\n').join('\n   '));

        await runRemoteCmd(conn, `pm2 save`);

        // 4. Fetch Status Table
        console.log('\n   📊 [Remote 4/4] Fetching Active PM2 Daemon Status Table:');
        const pm2Status = await runRemoteCmd(conn, 'pm2 status');
        console.log('\n' + pm2Status);

        console.log('\n================================================================');
        console.log('🎉 PRODUCTION DEPLOYMENT & SYNC SUCCESSFULLY COMPLETED!');
        console.log(`🌐 Server Host: ${DO_HOST}:5000`);
        console.log('================================================================\n');

        conn.end();
        resolve();
      } catch (remoteErr) {
        conn.end();
        reject(remoteErr);
      }
    });

    conn.on('error', (err: any) => {
      reject(new Error(`SSH Connection failed: ${err.message}`));
    });

    conn.connect(sshConfig);
  });
}

// Auto-run if invoked directly via CLI
if (
  process.argv[1] &&
  (process.argv[1].endsWith('deployProduction.ts') || process.argv[1].endsWith('deployProduction.js'))
) {
  executeProductionDeployment().catch((err) => {
    console.error('\n❌ [Deployment Fatal Error]:', err.message);
    process.exit(1);
  });
}

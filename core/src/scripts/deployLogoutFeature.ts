import { Client } from 'ssh2';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DO_SSH_HOST || process.env.DO_HOST || '178.128.199.28';
const USERNAME = process.env.DO_SSH_USER || 'root';
const PASSWORD = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';

function runSSHCommand(conn: Client, cmd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream
        .on('close', (code: number) => resolve({ stdout, stderr, code }))
        .on('data', (data: Buffer) => {
          stdout += data.toString();
        })
        .stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
    });
  });
}

function uploadFile(conn: Client, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);
      writeStream.on('close', () => resolve());
      writeStream.on('error', (e) => reject(e));
      readStream.pipe(writeStream);
    });
  });
}

async function main() {
  console.log('=====================================================');
  console.log(`🚀 Deploying Logout Feature & Updated UI to Droplet (${HOST})`);
  console.log('=====================================================\n');

  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn
      .on('ready', () => resolve())
      .on('error', reject)
      .connect({
        host: HOST,
        port: 22,
        username: USERNAME,
        password: PASSWORD,
      });
  });

  console.log('✓ SSH Connection established.');

  // Step 1: Upload dashboard.html and dashboard-server.ts
  console.log('=== [Step 1] Uploading updated source files via SFTP ===');
  const localHtml = path.resolve(process.cwd(), 'core/src/dashboard.html');
  const localServer = path.resolve(process.cwd(), 'core/src/dashboard-server.ts');

  await uploadFile(conn, localHtml, '/var/www/affiliate/core/src/dashboard.html');
  await uploadFile(conn, localHtml, '/var/www/affiliate/core/dist/dashboard.html');
  console.log('✓ Uploaded core/src/dashboard.html & core/dist/dashboard.html');

  await uploadFile(conn, localServer, '/var/www/affiliate/core/src/dashboard-server.ts');
  console.log('✓ Uploaded core/src/dashboard-server.ts');

  // Step 2: Build TypeScript on Droplet
  console.log('\n=== [Step 2] Building TypeScript on Droplet ===');
  const buildRes = await runSSHCommand(conn, 'cd /var/www/affiliate/core && npm run build');
  console.log(buildRes.stdout);
  if (buildRes.code !== 0) {
    throw new Error(`Remote build failed: ${buildRes.stderr}`);
  }

  // Step 3: Restart affiliate-dashboard PM2 process
  console.log('\n=== [Step 3] Restarting affiliate-dashboard in PM2 ===');
  const restartRes = await runSSHCommand(conn, 'pm2 restart affiliate-dashboard --update-env && pm2 list');
  console.log(restartRes.stdout);

  conn.end();
  console.log('\n✓ Core application update completed.');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});

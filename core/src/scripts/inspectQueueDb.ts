import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';

function runSsh(conn: Client, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      stream.on('data', (d: Buffer) => (stdout += d.toString()));
      stream.stderr.on('data', (d: Buffer) => (stdout += d.toString()));
      stream.on('close', () => resolve(stdout.trim()));
    });
  });
}

async function main() {
  const conn = new Client();
  await new Promise<void>((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: HOST,
      username: USER,
      password: PASS,
      readyTimeout: 15000,
    });
  });

  console.log('--- Upgrading Node to v22 on server ---');
  const upRes = await runSsh(conn, 'curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs');
  console.log(upRes.slice(-500));

  const nodeVer = await runSsh(conn, 'node -v');
  console.log('New Node version:', nodeVer);

  const testSqlite = await runSsh(conn, 'node -e \'const { DatabaseSync } = require("node:sqlite"); const db = new DatabaseSync("/var/www/affiliate/core/data/content_queue.sqlite"); console.log("node:sqlite successfully opened database!"); db.close();\'');
  console.log('node:sqlite test:', testSqlite);

  console.log('--- Done testing Node v22 and sqlite ---');

  conn.end();
}

main().catch(console.error);

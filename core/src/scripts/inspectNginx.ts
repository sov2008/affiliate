import { Client } from 'ssh2';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = '178.128.199.28';
const USERNAME = 'root';
const PASSWORD = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';

function runSSHCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on('ready', () => {
        conn.exec(cmd, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }
          let output = '';
          stream
            .on('close', (code: number) => {
              conn.end();
              resolve(output);
            })
            .on('data', (data: Buffer) => {
              output += data.toString();
            })
            .stderr.on('data', (data: Buffer) => {
              output += data.toString();
            });
        });
      })
      .on('error', (err) => reject(err))
      .connect({
        host: HOST,
        port: 22,
        username: USERNAME,
        password: PASSWORD,
      });
  });
}

async function main() {
  console.log('Inspecting remote Nginx configuration on 178.128.199.28...');
  const lsSites = await runSSHCommand('ls -la /etc/nginx/sites-enabled/ /etc/nginx/conf.d/');
  console.log('--- Enabled sites & conf.d ---\n', lsSites);

  const grepFlirtcheck = await runSSHCommand('grep -rn "flirtcheck" /etc/nginx/');
  console.log('--- Grep flirtcheck ---\n', grepFlirtcheck);

  const nginxVhost = await runSSHCommand('cat /etc/nginx/sites-available/* 2>/dev/null || true');
  console.log('--- Sites available contents ---\n', nginxVhost);
}

main().catch(console.error);

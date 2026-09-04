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
  console.log('Reading dashboard entries in auth_debug.log...');
  const res = await runSSHCommand('grep -a "dashboard" /var/log/nginx/auth_debug.log | tail -n 20');
  console.log('Result:\n', res);
}

main().catch(console.error);

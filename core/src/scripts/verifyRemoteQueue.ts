import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`sqlite3 -header -column /var/www/affiliate/core/data/content_queue.sqlite "SELECT id, platform, status, subreddit, target_url, datetime(created_at/1000, 'unixepoch') as created FROM content_queue_v2 ORDER BY created_at DESC LIMIT 5;"`, (err, stream) => {
    let out = '';
    stream.on('data', (d: Buffer) => (out += d.toString()));
    stream.on('close', () => {
      console.log('--- RECENT SQLITE QUEUE ITEMS ---');
      console.log(out);
      conn.exec('pm2 logs affiliate-telegram-bot --lines 20 --nostream', (err2, stream2) => {
        let out2 = '';
        stream2.on('data', (d: Buffer) => (out2 += d.toString()));
        stream2.on('close', () => {
          console.log('--- TELEGRAM BOT LOGS ---');
          console.log(out2);
          conn.end();
        });
      });
    });
  });
}).connect({ host: HOST, username: USER, password: PASS });

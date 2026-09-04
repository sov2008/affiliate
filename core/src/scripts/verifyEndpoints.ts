import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const conn = new Client();
conn.on('ready', () => {
  console.log('✓ SSH connected');
  conn.exec(
    `pm2 list`,
    (err, stream) => {
      if (err) throw err;
      stream.on('data', (d: Buffer) => process.stdout.write(d));
      stream.on('close', () => {
        conn.end();
        process.exit(0);
      });
    }
  );
}).connect({
  host: '178.128.199.28',
  username: 'root',
  password: process.env.SSH_ROOT_PASSWORD,
});

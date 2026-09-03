import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /var/www/affiliate/core && node -e "
    const dotenv = require('dotenv');
    dotenv.config({ path: '/var/www/affiliate/.env' });
    dotenv.config({ path: '/var/www/affiliate/core/.env' });
    console.log('ENV TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'EXISTS' : 'MISSING');
    console.log('ENV ADMIN:', process.env.ADMIN_CHAT_ID);
    const { TelegramControlBot } = require('./dist/services/telegram-control-bot.service.js');
    const bot = TelegramControlBot.getInstance();
    console.log('BOT CONFIGURED:', bot.isConfigured());
    console.log('BOT ADMIN ID:', bot.getAdminChatId());
  "`;

  conn.exec(remoteCmd, (err, stream) => {
    let out = '';
    stream.on('data', (d: Buffer) => (out += d.toString()));
    stream.stderr.on('data', (d: Buffer) => (out += d.toString()));
    stream.on('close', (code: number) => {
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  password: process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8',
});

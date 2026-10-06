const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const ssh2 = require('ssh2');

dotenv.config();

const DO_HOST = process.env.DO_SSH_HOST || process.env.DO_HOST || process.env.DROPLET_IP || '178.128.199.28';
const DO_USER = process.env.DO_SSH_USER || process.env.DO_USER || 'root';
const KEY_PATH = path.resolve(__dirname, '../do_key.pem');

const filesToUpload = [
  {
    local: path.resolve(__dirname, '../blog/src/components/MobileStickyCTA.astro'),
    remote: '/var/www/affiliate/blog/src/components/MobileStickyCTA.astro'
  },
  {
    local: path.resolve(__dirname, '../blog/src/pages/index.astro'),
    remote: '/var/www/affiliate/blog/src/pages/index.astro'
  }
];

let privateKey;
if (fs.existsSync(KEY_PATH)) {
  privateKey = fs.readFileSync(KEY_PATH);
}

const conn = new ssh2.Client();

conn.on('ready', () => {
  console.log(`✅ SSH подключение к ${DO_HOST} установлено.`);

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('❌ SFTP error:', err);
      conn.end();
      return;
    }

    let completed = 0;
    for (const f of filesToUpload) {
      const buffer = fs.readFileSync(f.local);
      const stream = sftp.createWriteStream(f.remote);
      stream.write(buffer);
      stream.end();

      stream.on('close', () => {
        console.log(`📤 Загружен: ${f.remote}`);
        completed++;
        if (completed === filesToUpload.length) {
          console.log('🚀 Запуск сборки блога на сервере...');
          conn.exec('cd /var/www/affiliate && npm --prefix blog run build', (execErr, cmdStream) => {
            if (execErr) {
              console.error('❌ Ошибка сборки:', execErr);
              conn.end();
              return;
            }

            cmdStream.on('data', (d) => process.stdout.write(d.toString()));
            cmdStream.stderr.on('data', (d) => process.stderr.write(d.toString()));
            cmdStream.on('close', () => {
              console.log('\n🎉 CRO-обновления успешно скомпилированы на боевом сервере!');
              conn.end();
            });
          });
        }
      });
    }
  });
});

conn.connect({
  host: DO_HOST,
  port: 22,
  username: DO_USER,
  privateKey: privateKey,
});

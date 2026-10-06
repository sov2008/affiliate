const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const ssh2 = require('ssh2');

dotenv.config();

const DO_HOST = process.env.DO_SSH_HOST || process.env.DO_HOST || process.env.DROPLET_IP || '178.128.199.28';
const DO_USER = process.env.DO_SSH_USER || process.env.DO_USER || 'root';
const KEY_PATH = path.resolve(__dirname, '../do_key.pem');

const slug = 'the-ghosting-algorithm-how-dating-app-weight-drops-before-inactivity';
const localMdPath = path.resolve(__dirname, `../blog/src/content/posts/${slug}.md`);
const localImgPath = path.resolve(__dirname, `../blog/public/images/posts/${slug}.webp`);

const remoteMdPath = `/var/www/affiliate/blog/src/content/posts/${slug}.md`;
const remoteImgPath = `/var/www/affiliate/blog/public/images/posts/${slug}.webp`;

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

    console.log(`📤 Загрузка ${localMdPath} -> ${remoteMdPath}...`);
    const mdBuffer = fs.readFileSync(localMdPath);
    const mdStream = sftp.createWriteStream(remoteMdPath);
    mdStream.write(mdBuffer);
    mdStream.end();

    mdStream.on('close', () => {
      console.log(`✅ Markdown файл статьи загружен.`);

      console.log(`📤 Загрузка ${localImgPath} -> ${remoteImgPath}...`);
      const imgBuffer = fs.readFileSync(localImgPath);
      const imgStream = sftp.createWriteStream(remoteImgPath);
      imgStream.write(imgBuffer);
      imgStream.end();

      imgStream.on('close', () => {
        console.log(`✅ Обложка загружена.`);

        const buildAndTriggerCmd = `
          cd /var/www/affiliate &&
          npm --prefix blog run build &&
          pm2 reload affiliate-pinterest-publisher
        `;

        console.log('🚀 Запуск сборки блога на сервере и перезапуск Pinterest воркера...');
        conn.exec(buildAndTriggerCmd, (execErr, stream) => {
          if (execErr) {
            console.error('❌ Ошибка команды:', execErr);
            conn.end();
            return;
          }

          stream.on('data', (d) => process.stdout.write(d.toString()));
          stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
          stream.on('close', () => {
            console.log('\n🎉 Новая статья успешно скомпилирована на сервере, воркер Pinterest перезапущен!');
            conn.end();
          });
        });
      });
    });
  });
});

conn.connect({
  host: DO_HOST,
  port: 22,
  username: DO_USER,
  privateKey: privateKey,
});

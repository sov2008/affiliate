const fs = require('fs');

const FILE_PATH = '/var/www/affiliate/core/src/services/telegram-control-bot.service.ts';
let content = fs.readFileSync(FILE_PATH, 'utf8');

// Ensure import of getDirectorReport at the top
if (!content.includes('director-helper.service.js')) {
  content = `import { getDirectorReport } from './director-helper.service.js';\n` + content;
}

// Replace the previous broken block
const brokenRegex = /\/\/ --- 👑 КОМАНДЫ ГЕНЕРАЛЬНОГО ДИРЕКТОРА ---[\s\S]*?\/\/ --- 0\. Автопилот/;

const cleanDirectorBlock = `// --- 👑 КОМАНДЫ ГЕНЕРАЛЬНОГО ДИРЕКТОРА ---
    if (cmd === '/director' || text === '👑 Сводка директора' || cmd === 'director') {
      return getDirectorReport();
    }

    if (cmd === '/sync_products' || text === '🔄 Синхронизировать товары' || cmd === 'sync_products') {
      try {
        await this.sendMessage(message.chat.id, '⏳ <i>Директор запустил внеочередную синхронизацию каталога и товаров из CJ / Admitad...</i>');
        execSync('node /var/www/affiliate/scripts/autonomous_product_sync.cjs', { timeout: 60000, stdio: 'ignore' });
        return '✅ <b>[СИНХРОНИЗАЦИЯ ТОВАРОВ ЗАВЕРШЕНА]</b>\\nКаталог товаров и посадочные страницы PromoRadar актуализированы.';
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return \`❌ Ошибка синхронизации: \${this.escapeHtml(msg)}\`;
      }
    }

    if (cmd === '/apply_batch' || text === '🎯 Подать 25 заявок' || cmd === 'apply_batch') {
      try {
        await this.sendMessage(message.chat.id, '⏳ <i>Директор запустил автономного робота подачи заявок (25 программ)...</i>');
        execSync('node /var/www/affiliate/scripts/cj_autonomous_applier.cjs &', { timeout: 5000, stdio: 'ignore' });
        return '🚀 <b>[РОБОТ ЗАЯВОК ЗАПУЩЕН]</b>\\nПартия из 25 программ обрабатывается в фоне. Итоговый алерт поступит по завершении.';
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return \`❌ Ошибка запуска подачи заявок: \${this.escapeHtml(msg)}\`;
      }
    }

    // --- 0. Автопилот`;

content = content.replace(brokenRegex, cleanDirectorBlock);

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log('Cleaned up telegram-control-bot.service.ts with director-helper import');


const fs = require('fs');

const FILE_PATH = '/var/www/affiliate/core/src/services/telegram-control-bot.service.ts';
let content = fs.readFileSync(FILE_PATH, 'utf8');

// 1. Extend getAdminReplyKeyboard with Director buttons
const oldKeyboard = `    return {
      keyboard: [
        [{ text: '📊 Полный отчет' }, { text: '🚀 Автопилот' }],
        [{ text: '📥 Очередь (HITL)' }, { text: '💼 Admitad API' }],
        [{ text: '🖥️ Система и PM2' }, { text: '🛡️ Проверка ссылок' }],
        [{ text: '🎲 MAB сплит' }, { text: '👥 Лиды и воронка' }],
        [{ text: '🚨 Предохранитель' }, { text: '❓ Помощь' }],
      ],
      resize_keyboard: true,
      persistent: true,
    };`;

const newKeyboard = `    return {
      keyboard: [
        [{ text: '📊 Полный отчет' }, { text: '👑 Сводка директора' }],
        [{ text: '🔄 Синхронизировать товары' }, { text: '🎯 Подать 25 заявок' }],
        [{ text: '🚀 Автопилот' }, { text: '💼 Admitad API' }],
        [{ text: '📥 Очередь (HITL)' }, { text: '🖥️ Система и PM2' }],
        [{ text: '🎲 MAB сплит' }, { text: '👥 Лиды и воронка' }],
        [{ text: '🚨 Предохранитель' }, { text: '❓ Помощь' }],
      ],
      resize_keyboard: true,
      persistent: true,
    };`;

content = content.replace(oldKeyboard, newKeyboard);

// 2. Extend handleCommand with Director Commands
const commandAnchor = `    // --- 0. Автопилот и авто-публикация (/autopilot или кнопка "🚀 Автопилот") ---`;

const directorCommands = `    // --- 👑 КОМАНДЫ ГЕНЕРАЛЬНОГО ДИРЕКТОРА ---
    if (cmd === '/director' || text === '👑 Сводка директора' || cmd === 'director') {
      try {
        const { FleetCommanderAgent } = await import('../agents/fleet-commander.agent.js');
        const agent = FleetCommanderAgent.getInstance();
        const report = await agent.runControlCycle();
        const emoji = report.fleetHealth === 'HEALTHY' ? '🟢' : report.fleetHealth === 'RECOVERED' ? '🟡' : '🔴';
        const actionsText = report.remediationActions.length > 0 ? \`\\n⚡ <b>Действия директора:</b>\\n\${report.remediationActions.map(a => \`• \${a}\`).join('\\n')}\` : '';

        return \`
👑 <b>[ОПЕРАТИВНАЯ СВОДКА ДИРЕКТОРА]</b>
━━━━━━━━━━━━━━━━━━
\${emoji} <b>Статус здоровья флота:</b> <b>\${report.fleetHealth}</b>
🖥️ <b>Хост:</b> RAM: <b>\${report.host.ramUsedPercent}%</b> (\${report.host.ramFreeMb}MB свободно) | Uptime: <b>\${report.host.uptimeHours}ч</b>
⚙️ <b>Процессы PM2:</b> <b>\${report.processes.filter(p => p.status === 'online').length}/\${report.processes.length}</b> активны

🛍️ <b>КАТАЛОГ И ТОВАРНЫЙ КОНВЕЙЕР PROMORADAR:</b>
• Подключенных магазинов и страниц: <b>\${report.catalogStats?.totalStores || 'н/д'}</b>
• Физических товаров (SKU) в наличии: <b>\${report.catalogStats?.totalProducts || 'н/д'}</b>
• Авто-синхронизация: каждые 15 минут

🌐 <b>ДОСТУПНОСТЬ ВИТРИНЫ (PERIMETER HEALTH):</b>
\${report.endpoints.map(e => \`• \${e.url}: \${e.ok ? '🟢 OK' : '🔴 ERROR'} (\${e.latencyMs}мс)\`).join('\\n')}
\${actionsText}
━━━━━━━━━━━━━━━━━━
⚡ <i>Команды быстрого управления: /sync_products, /apply_batch, /status</i>
        \`.trim();
      } catch (err) {
        return \`❌ Ошибка вызова директора: \${this.escapeHtml(err.message)}\`;
      }
    }

    if (cmd === '/sync_products' || text === '🔄 Синхронизировать товары' || cmd === 'sync_products') {
      try {
        await this.sendMessage(message.chat.id, '⏳ <i>Директор запустил внеочередную синхронизацию каталога и товаров из CJ / Admitad...</i>');
        execSync('node /var/www/affiliate/scripts/autonomous_product_sync.cjs', { timeout: 60000, stdio: 'ignore' });
        return '✅ <b>[СИНХРОНИЗАЦИЯ ТОВАРОВ ЗАВЕРШЕНА]</b>\\nКаталог товаров и посадочные страницы PromoRadar актуализированы.';
      } catch (err) {
        return \`❌ Ошибка синхронизации: \${this.escapeHtml(err.message)}\`;
      }
    }

    if (cmd === '/apply_batch' || text === '🎯 Подать 25 заявок' || cmd === 'apply_batch') {
      try {
        await this.sendMessage(message.chat.id, '⏳ <i>Директор запустил автономного робота подачи заявок (25 программ)...</i>');
        execSync('node /var/www/affiliate/scripts/cj_autonomous_applier.cjs &', { timeout: 5000, stdio: 'ignore' });
        return '🚀 <b>[РОБОТ ЗАЯВОК ЗАПУЩЕН]</b>\\nПартия из 25 программ обрабатывается в фоне. Итоговый алерт поступит по завершении.';
      } catch (err) {
        return \`❌ Ошибка запуска подачи заявок: \${this.escapeHtml(err.message)}\`;
      }
    }

`;

content = content.replace(commandAnchor, directorCommands + commandAnchor);

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log('Successfully updated telegram-control-bot.service.ts with director commands');


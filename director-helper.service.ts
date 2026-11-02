import fs from 'fs';
import path from 'path';

const STATE_FILE = '/var/www/affiliate/.antigravity/fleet_state.json';

export function getDirectorReport(): string {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return '⚠️ Файл состояния директора пока не создан. Ожидайте следующего 15-минутного цикла.';
    }

    const report = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const emoji = report.fleetHealth === 'HEALTHY' ? '🟢' : report.fleetHealth === 'RECOVERED' ? '🟡' : '🔴';
    const actions = report.remediationActions || [];
    const actionsText = actions.length > 0 
      ? `\n⚡ <b>Действия директора:</b>\n${actions.map((a: any) => `• ${a}`).join('\n')}` 
      : '';

    const endpoints = report.endpoints || [];
    const endpointsText = endpoints
      .map((e: any) => `• ${e.url}: ${e.ok ? '🟢 OK' : '🔴 ERROR'} (${e.latencyMs || 0}мс)`)
      .join('\n');

    const totalOnline = (report.processes || []).filter((p: any) => p.status === 'online').length;
    const totalProc = (report.processes || []).length;

    return `
👑 <b>[ОПЕРАТИВНАЯ СВОДКА ДИРЕКТОРА]</b>
━━━━━━━━━━━━━━━━━━
${emoji} <b>Статус здоровья флота:</b> <b>${report.fleetHealth}</b>
🖥️ <b>Хост:</b> RAM: <b>${report.host?.ramUsedPercent}%</b> (${report.host?.ramFreeMb}MB свободно) | Uptime: <b>${report.host?.uptimeHours}ч</b>
⚙️ <b>Процессы PM2:</b> <b>${totalOnline}/${totalProc}</b> активны

🛍️ <b>КАТАЛОГ И ТОВАРНЫЙ КОНВЕЙЕР PROMORADAR:</b>
• Подключенных магазинов и страниц: <b>${report.catalogStats?.totalStores || 'н/д'}</b>
• Физических товаров (SKU) в наличии: <b>${report.catalogStats?.totalProducts || 'н/д'}</b>
• Авто-синхронизация: каждые 15 минут

🌐 <b>ДОСТУПНОСТЬ ВИТРИНЫ (PERIMETER HEALTH):</b>
${endpointsText}
${actionsText}
━━━━━━━━━━━━━━━━━━
⚡ <i>Команды быстрого управления: /sync_products, /apply_batch, /status</i>
    `.trim();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `❌ Ошибка формирования сводки директора: ${msg}`;
  }
}


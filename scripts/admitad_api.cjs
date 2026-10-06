const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

const clientId = process.env.ADMITAD_CLIENT_ID;
const clientSecret = process.env.ADMITAD_CLIENT_SECRET;
const base64Header = process.env.ADMITAD_BASE64_HEADER;
const websiteId = process.env.ADMITAD_WEBSITE_ID || '3007248';
const scopes = process.env.ADMITAD_SCOPES || 'advcampaigns advcampaigns_for_website banners banners_for_website payments statistics coupons coupons_for_website websites private_data_balance deeplink_generator announcements referrals broken_links';

const https = require('https');

async function getAccessToken() {
  const postData = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    scope: scopes
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.admitad.com',
      port: 443,
      path: '/token/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Header}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          if (json.access_token) resolve(json.access_token);
          else reject(new Error('No access_token: ' + d));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function apiGet(token, apiPath) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.admitad.com',
      port: 443,
      path: apiPath,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const cmd = process.argv[2] || 'status';
  const token = await getAccessToken();

  switch (cmd) {
    case 'balance': {
      const data = await apiGet(token, '/me/balance/');
      console.log('💰 БАЛАНС АККАУНТА (Admitad Store):');
      console.table(data.filter(b => parseFloat(b.balance) > 0 || ['USD', 'EUR', 'RUB', 'UAH'].includes(b.currency)));
      break;
    }
    case 'campaigns': {
      const statusFilter = process.argv[3] || 'active'; // 'active', 'pending', 'all'
      const p = statusFilter === 'all' 
        ? `/advcampaigns/website/${websiteId}/?limit=50`
        : `/advcampaigns/website/${websiteId}/?connection_status=${statusFilter}&limit=50`;
      const data = await apiGet(token, p);
      console.log(`📋 ПРОГРАММЫ ПЛОЩАДКИ (Статус: ${statusFilter.toUpperCase()}, Всего: ${data._meta ? data._meta.count : data.results.length}):`);
      if (data.results) {
        console.table(data.results.map(r => ({
          ID: r.id,
          Name: r.name.slice(0, 35),
          Status: r.connection_status,
          Rating: r.rating,
          CR: r.cr,
          EPC: r.epc
        })));
      }
      break;
    }
    case 'coupons': {
      const data = await apiGet(token, `/coupons/website/${websiteId}/?limit=50`);
      console.log(`🎟️ КУПОНЫ И ПРОМОКОДЫ (Всего: ${data._meta ? data._meta.count : data.results.length}):`);
      if (data.results) {
        console.table(data.results.map(c => ({
          ID: c.id,
          Campaign: (c.campaign ? c.campaign.name : '').slice(0, 25),
          Promocode: c.promocode || 'СКИДКА',
          Discount: c.discount || 'Special offer',
          Expires: c.date_end ? c.date_end.slice(0, 10) : 'Permanent'
        })));
      }
      break;
    }
    case 'stats': {
      const data = await apiGet(token, `/statistics/campaigns/?website=${websiteId}&limit=20`);
      console.log('📊 СТАТИСТИКА ПО КАМПАНИЯМ:');
      if (data.results && data.results.length > 0) {
        console.table(data.results.map(s => ({
          Campaign: s.advcampaign_name,
          Clicks: s.clicks,
          CR: s.cr,
          Leads: s.leads_sum,
          PaymentOpen: s.payment_sum_open,
          PaymentApproved: s.payment_sum_approved,
          Currency: s.currency
        })));
      } else {
        console.log('Пока нет кликов и действий в выбранном периоде.');
      }
      break;
    }
    case 'deeplink': {
      const campId = process.argv[3];
      const targetUrl = process.argv[4];
      const subid = process.argv[5] || 'manual_cli';
      if (!campId || !targetUrl) {
        console.log('Использование: node scripts/admitad_api.cjs deeplink <CAMPAIGN_ID> <TARGET_URL> [SUBID]');
        process.exit(1);
      }
      const p = `/deeplink/${websiteId}/advcampaign/${campId}/?ulp=${encodeURIComponent(targetUrl)}&subid=${encodeURIComponent(subid)}`;
      const res = await apiGet(token, p);
      console.log('🔗 СГЕНЕРИРОВАН DEEPLINK:', res);
      break;
    }
    case 'status':
    default: {
      const site = await apiGet(token, `/websites/${websiteId}/`);
      const bal = await apiGet(token, '/me/balance/');
      const act = await apiGet(token, `/advcampaigns/website/${websiteId}/?connection_status=active&limit=1`);
      const pend = await apiGet(token, `/advcampaigns/website/${websiteId}/?connection_status=pending&limit=1`);
      const coup = await apiGet(token, `/coupons/website/${websiteId}/?limit=1`);
      console.log('====================================================');
      console.log('⚡ ADMITAD STORE REST API — ПОДКЛЮЧЕНИЕ АКТИВНО');
      console.log('====================================================');
      console.log(`🌐 Площадка: [${site.id}] ${site.name} (${site.site_url})`);
      console.log(`📊 Статус площадки: ${site.status.toUpperCase()}`);
      console.log(`🔗 Активных подключенных программ: ${act._meta ? act._meta.count : 0}`);
      console.log(`⏳ Программ на модерации: ${pend._meta ? pend._meta.count : 0}`);
      console.log(`🎟️ Доступных промокодов/купонов: ${coup._meta ? coup._meta.count : 0}`);
      console.log(`💰 Баланс: USD ${bal.find(b => b.currency === 'USD')?.balance || '0.00'}`);
      console.log('\nДоступные команды:');
      console.log('  node scripts/admitad_api.cjs status');
      console.log('  node scripts/admitad_api.cjs balance');
      console.log('  node scripts/admitad_api.cjs campaigns [active|pending|all]');
      console.log('  node scripts/admitad_api.cjs coupons');
      console.log('  node scripts/admitad_api.cjs stats');
      console.log('  node scripts/admitad_api.cjs deeplink <campaign_id> <target_url> [subid]');
      break;
    }
  }
}

main().catch(err => {
  console.error('❌ Ошибка Admitad API CLI:', err.message);
  process.exit(1);
});

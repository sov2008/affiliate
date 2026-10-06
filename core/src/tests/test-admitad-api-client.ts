import { AdmitadApiService } from '../services/admitad-api.service.js';

async function verify() {
  console.log('--- ТЕСТИРОВАНИЕ ПОДКЛЮЧЕНИЯ ADMITAD API СЕРВИСА ---');
  const admitad = AdmitadApiService.getInstance();

  console.log('\n1. Проверка авторизации и токена...');
  const token = await admitad.getAccessToken();
  console.log('✅ Access Token успешно получен:', token.slice(0, 10) + '...');

  console.log('\n2. Запрос живого баланса...');
  const balances = await admitad.getBalance();
  console.log('✅ Реальный баланс аккаунта:', balances.filter(b => parseFloat(b.balance) > 0 || ['USD', 'EUR', 'RUB', 'UAH'].includes(b.currency)));

  console.log('\n3. Запрос площадки 3007248...');
  const site = await admitad.getWebsite();
  console.log(`✅ Площадка: ID ${site.id} | ${site.name} | ${site.site_url} | Статус: ${site.status}`);

  console.log('\n4. Проверка подключенных программ (активные)...');
  const activeCampaigns = await admitad.getCampaignsForWebsite({ connection_status: 'active', limit: 5 });
  console.log(`✅ Активных программ: ${activeCampaigns._meta.count}`);
  activeCampaigns.results.forEach(c => console.log(`   - [ID ${c.id}] ${c.name} -> Gotolink: ${c.gotolink}`));

  console.log('\n5. Проверка промокодов и купонов...');
  const coupons = await admitad.getCoupons({ limit: 3 });
  console.log(`✅ Активных купонов для площадки: ${coupons._meta.count}`);
  coupons.results.forEach(cp => console.log(`   - [${cp.promocode || 'СКИДКА'}] ${cp.name} (до ${cp.date_end})`));

  console.log('\n6. Проверка генератора Deeplink...');
  if (activeCampaigns.results.length > 0) {
    const testCamp = activeCampaigns.results[0];
    const deeplink = await admitad.generateDeeplink({
      advcampaignId: testCamp.id,
      ulp: testCamp.site_url,
      subid: 'fc_api_test_01'
    });
    console.log(`✅ Сгенерирован боевой Deeplink для ${testCamp.name}:`, deeplink[0].link);
  }

  console.log('\n🎉 ВСЕ ТЕСТЫ ADMITAD API УСПЕШНО ПРОЙДЕНЫ!');
}

verify().catch(err => {
  console.error('❌ Ошибка тестирования Admitad API:', err);
  process.exit(1);
});

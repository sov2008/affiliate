const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

// Potential credentials paths
const candidateKeyPaths = [
  process.env.GA_KEY_PATH,
  path.resolve(__dirname, '../ga-credentials.json'),
  path.resolve(__dirname, '../google-analytics-key.json'),
  path.resolve(__dirname, '../core/ga-credentials.json'),
  path.resolve(__dirname, '../service-account.json'),
].filter(Boolean);

let keyFilePath = candidateKeyPaths.find((p) => fs.existsSync(p));

const propertyId = (process.env.GA_PROPERTY_ID || '').trim();

async function runReport() {
  console.log('====================================================');
  console.log('📊 Google Analytics 4 (GA4) Telemetry Fetcher');
  console.log('====================================================');

  if (!keyFilePath) {
    console.error('❌ Файл ключа сервисного аккаунта не найден!');
    console.log('\nДля подключения выполните следующие 3 простых шага:');
    console.log('1. В Google Cloud Console создайте сервисный аккаунт и скачайте JSON-ключ:');
    console.log('   Сохраните его как: ga-credentials.json в корне проекта.');
    console.log('2. В Google Analytics (настройки ресурса) добавьте email этого сервисного аккаунта с ролью "Читатель".');
    console.log('3. В .env укажите числовой ID вашего ресурса:');
    console.log('   GA_PROPERTY_ID=123456789 (в GA4 это "Сведения о ресурсе" -> "Идентификатор ресурса")\n');
    process.exit(1);
  }

  if (!propertyId) {
    console.error('❌ Не указан GA_PROPERTY_ID в файле .env!');
    console.log('\nУкажите числовой идентификатор ресурса в .env:');
    console.log('GA_PROPERTY_ID=XXXXXXXXX');
    console.log('(В Google Analytics: Шестеренка Администратор -> Настройки ресурса -> Идентификатор ресурса)\n');
    process.exit(1);
  }

  console.log(`🔑 Ключ: ${keyFilePath}`);
  console.log(`🎯 Property ID: ${propertyId}\n`);

  const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: keyFilePath,
  });

  try {
    // 1. Realtime report (активные пользователи за последние 30 минут)
    console.log('⏳ Запрос Realtime данных (последние 30 минут)...');
    try {
      const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: 'activeUsers' }],
      });
      const currentActive = realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || '0';
      console.log(`🟢 Активных пользователей на сайте прямо сейчас: ${currentActive}`);
    } catch (e) {
      console.log(`ℹ️ Realtime недоступен: ${e.message}`);
    }

    // 2. Основная сводка за 30 дней
    console.log('\n📈 Сводка трафика за последние 30 дней:');
    const [overviewResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    if (overviewResponse.rows && overviewResponse.rows.length > 0) {
      const m = overviewResponse.rows[0].metricValues;
      console.log(`   👥 Уникальных пользователей: ${m[0].value}`);
      console.log(`   🔄 Всего сессий:            ${m[1].value}`);
      console.log(`   📄 Просмотров страниц:       ${m[2].value}`);
      console.log(`   📉 Показатель отказов:       ${(parseFloat(m[3].value || 0) * 100).toFixed(1)}%`);
      console.log(`   ⏱️ Среднее время на сайте:   ${Math.round(parseFloat(m[4].value || 0))} сек.`);
    } else {
      console.log('   Нет накопленных данных за указанный период.');
    }

    // 3. Топ-10 страниц блога
    console.log('\n📄 Топ-10 самых читаемых страниц:');
    const [topPagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    if (topPagesResponse.rows && topPagesResponse.rows.length > 0) {
      console.log('   ' + 'Страница'.padEnd(50) + 'Просмотры'.padEnd(12) + 'Пользователи');
      console.log('   ' + '-'.repeat(75));
      for (const row of topPagesResponse.rows) {
        const pathStr = row.dimensionValues[0].value;
        const views = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        console.log(`   ${pathStr.padEnd(50)} ${views.padEnd(12)} ${users}`);
      }
    } else {
      console.log('   Данных по страницам пока нет.');
    }

    // 4. Источники трафика (Twitter, Pinterest, Reddit, Google)
    console.log('\n🌐 Источники трафика (Traffic Sources):');
    const [sourcesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 8,
    });

    if (sourcesResponse.rows && sourcesResponse.rows.length > 0) {
      console.log('   ' + 'Источник / Канал'.padEnd(40) + 'Сессии'.padEnd(12) + 'Пользователи');
      console.log('   ' + '-'.repeat(65));
      for (const row of sourcesResponse.rows) {
        const source = `${row.dimensionValues[0].value} / ${row.dimensionValues[1].value}`;
        const users = row.metricValues[0].value;
        const sessions = row.metricValues[1].value;
        console.log(`   ${source.padEnd(40)} ${sessions.padEnd(12)} ${users}`);
      }
    } else {
      console.log('   Данных по источникам пока нет.');
    }

    // 5. Конверсионные клики по смартлинкам (affiliate_click)
    console.log('\n🎯 Конверсии по монетизации (Событие affiliate_click):');
    const [eventsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: 'affiliate_click', matchType: 'EXACT' },
        },
      },
    });

    const affiliateClicks = eventsResponse.rows?.[0]?.metricValues?.[0]?.value || '0';
    console.log(`   💰 Зафиксировано кликов по смартлинкам (/go): ${affiliateClicks}`);

    console.log('\n====================================================');
    console.log('✅ Отчет успешно сформирован!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ Ошибка получения отчета из Google Analytics API:', err.message);
    if (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED')) {
      console.log('\n💡 Подсказка: убедитесь, что в Google Analytics (Управление доступом к ресурсу)');
      console.log('   email сервисного аккаунта добавлен с ролью "Читатель" (Viewer).');
    }
  }
}

runReport();

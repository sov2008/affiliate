const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const keyFilePath = path.resolve(__dirname, '../ga-credentials.json');
const flirtPropertyId = (process.env.GA_PROPERTY_ID || '555602756').trim();
const promoradarPropertyId = (process.env.GA_PROMORADAR_PROPERTY_ID || '').trim();

const client = new BetaAnalyticsDataClient({ keyFilename: keyFilePath });

async function printPropertyReport(propertyName, propId) {
  console.log(`\n====================================================`);
  console.log(`📊 GA4 Report: ${propertyName} (Property: ${propId})`);
  console.log(`====================================================`);

  try {
    const [realtime] = await client.runRealtimeReport({
      property: `properties/${propId}`,
      metrics: [{ name: 'activeUsers' }],
    });
    console.log(`🟢 Активных прямо сейчас: ${realtime.rows?.[0]?.metricValues?.[0]?.value || '0'}`);
  } catch (e) {
    console.log(`ℹ️ Realtime недоступен: ${e.message}`);
  }

  try {
    const [overview] = await client.runReport({
      property: `properties/${propId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    if (overview.rows && overview.rows.length > 0) {
      const m = overview.rows[0].metricValues;
      console.log(`📈 За 30 дней:`);
      console.log(`   👥 Уникальных пользователей: ${m[0].value}`);
      console.log(`   🔄 Всего сессий:            ${m[1].value}`);
      console.log(`   📄 Просмотров страниц:       ${m[2].value}`);
      console.log(`   📉 Отказов (Bounce Rate):    ${(parseFloat(m[3].value || 0) * 100).toFixed(1)}%`);
      console.log(`   ⏱️ Среднее время:            ${Math.round(parseFloat(m[4].value || 0))} сек.`);
    } else {
      console.log('   Нет накопленных данных.');
    }

    const [sources] = await client.runReport({
      property: `properties/${propId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 6,
    });

    if (sources.rows && sources.rows.length > 0) {
      console.log('\n🌐 Топ источников:');
      for (const row of sources.rows) {
        console.log(`   ${row.dimensionValues[0].value} / ${row.dimensionValues[1].value}: ${row.metricValues[1].value} сессий (${row.metricValues[0].value} пользователей)`);
      }
    }

    const [events] = await client.runReport({
      property: `properties/${propId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 8,
    });

    if (events.rows && events.rows.length > 0) {
      console.log('\n🎯 Топ событий:');
      for (const row of events.rows) {
        console.log(`   🔹 ${row.dimensionValues[0].value}: ${row.metricValues[0].value} (пользователей: ${row.metricValues[1].value})`);
      }
    }
  } catch (err) {
    console.error(`❌ Ошибка получения отчета для ${propId}:`, err.message);
  }
}

async function run() {
  await printPropertyReport('flirtcheck.site', flirtPropertyId);
  if (promoradarPropertyId) {
    await printPropertyReport('promoradar.store', promoradarPropertyId);
  } else {
    console.log(`\nℹ️ Для подключения promoradar.store укажите GA_PROMORADAR_PROPERTY_ID в .env`);
  }
}

run();

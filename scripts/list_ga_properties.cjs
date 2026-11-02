const path = require('path');
const { AnalyticsAdminServiceClient } = require('@google-analytics/admin');

async function listProperties() {
  const keyFilename = path.resolve(__dirname, '../ga-credentials.json');
  const client = new AnalyticsAdminServiceClient({ keyFilename });

  try {
    const [accounts] = await client.listAccountSummaries();
    console.log('=== Доступные аккаунты и ресурсы GA4 ===');
    for (const acc of accounts) {
      console.log(`\nАккаунт: ${acc.displayName} (${acc.name})`);
      if (acc.propertySummaries) {
        for (const prop of acc.propertySummaries) {
          console.log(`  👉 Ресурс: ${prop.displayName}`);
          console.log(`     ID: ${prop.property.replace('properties/', '')}`);
        }
      }
    }
  } catch (err) {
    console.error('Ошибка доступа через AnalyticsAdminServiceClient:', err.message);
  }
}

listProperties();

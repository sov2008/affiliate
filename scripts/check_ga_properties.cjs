const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');
const fs = require('fs');

async function checkAccountProperties() {
  const keyFilePath = path.resolve(__dirname, '../ga-credentials.json');
  if (!fs.existsSync(keyFilePath)) {
    console.error('Credentials file not found');
    return;
  }

  const client = new BetaAnalyticsDataClient({ keyFilename: keyFilePath });
  
  // List of property IDs to test
  const candidateIds = ['555602756']; // flirtcheck ID, let's see if there are other properties or if we can test
  for (const pid of candidateIds) {
    try {
      console.log(`Checking Property ID: ${pid}...`);
      const [response] = await client.runRealtimeReport({
        property: `properties/${pid}`,
        metrics: [{ name: 'activeUsers' }],
      });
      const active = response.rows?.[0]?.metricValues?.[0]?.value || '0';
      console.log(`Property ${pid} Realtime Active Users: ${active}`);

      const [summary] = await client.runReport({
        property: `properties/${pid}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'conversions' }
        ],
      });
      console.log('7-day summary:');
      if (summary.rows?.[0]) {
        console.log({
          activeUsers: summary.rows[0].metricValues[0].value,
          sessions: summary.rows[0].metricValues[1].value,
          screenPageViews: summary.rows[0].metricValues[2].value,
        });
      }
    } catch (err) {
      console.error(`Error querying ${pid}:`, err.message);
    }
  }
}

checkAccountProperties();


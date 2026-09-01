const WORKER_URL = 'https://postback-engine.sov7.workers.dev';

export async function runPostbackProbe() {
  console.log('🧪 Starting E2E MyLead Postback & Webhook Ingestion Probe...');
  
  const testClickId = 'ml_click_' + Math.random().toString(36).substring(2, 9);
  const testCampaignId = 'cmp_trading_au';
  const testVariant = 'v1';
  const testPayout = 350.00;
  const testLeadId = 'ml_lead_' + Date.now();

  console.log(`\n1️⃣ Emulating Click via Beacon: ${testClickId} on ${testCampaignId}/${testVariant}`);
  const clickRes = await fetch(`${WORKER_URL}/click?ml_sub1=${testClickId}&ml_sub2=${testCampaignId}&ml_sub3=${testVariant}&wallet=0x1796EaD42E41dDCB692fD82C8b71A7ec4FC8Adf1`);
  const clickData = await clickRes.json();
  console.log('   Click Ingestion Response:', clickData);

  console.log(`\n2️⃣ Emulating MyLead Webhook / Postback Event (status: "approved", payout: $${testPayout} USD)...`);
  const postbackRes = await fetch(`${WORKER_URL}/postback?ml_sub1=${testClickId}&ml_sub2=${testCampaignId}&ml_sub3=${testVariant}&lead_id=${testLeadId}&payout=${testPayout}&status=approved&currency=USD`);
  const postbackData = await postbackRes.json();
  console.log('   Postback Ingestion Response:', postbackData);

  console.log(`\n3️⃣ Testing JSON Webhook Endpoint (/webhook/mylead)...`);
  const webhookRes = await fetch(`${WORKER_URL}/webhook/mylead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ml_sub1: testClickId,
      ml_sub2: testCampaignId,
      ml_sub3: 'v2',
      lead_id: 'ml_lead_json_' + Date.now(),
      payout: 350.00,
      status: 'approved',
      currency: 'USD'
    })
  });
  const webhookData = await webhookRes.json();
  console.log('   Webhook Ingestion Response:', webhookData);

  console.log(`\n4️⃣ Querying Edge Stats from Cloudflare KV (/stats?campaign_id=${testCampaignId})...`);
  const statsRes = await fetch(`${WORKER_URL}/stats?campaign_id=${testCampaignId}`);
  const statsData = await statsRes.json();
  console.log('   Aggregated Campaign Performance:', JSON.stringify(statsData, null, 2));

  console.log('\n5️⃣ Querying Global Summary (/stats/all)...');
  const allRes = await fetch(`${WORKER_URL}/stats/all`);
  const allData = await allRes.json();
  console.log('   Global Stats in KV:', JSON.stringify(allData, null, 2));

  return { clickData, postbackData, webhookData, statsData, allData };
}

if (require.main === module) {
  runPostbackProbe().then(() => {
    console.log('\n✅ E2E MyLead Postback Probe Completed Successfully!');
  }).catch(err => {
    console.error('❌ Probe Failed:', err);
    process.exit(1);
  });
}

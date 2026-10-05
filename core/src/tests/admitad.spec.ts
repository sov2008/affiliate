import assert from 'assert';
import { AdmitadService } from '../services/admitad.service.js';
import { OfferRoutingService } from '../services/offer-routing.service.js';
import { extractPostbackEvent } from '../server/routes/postback.router.js';

console.log('🧪 ================================================================');
console.log('🧪 Admitad Tier-1 Monetization Integration Test Suite');
console.log('🧪 ================================================================');

async function runAdmitadTests() {
  console.log('\n--- [TEST 1] Admitad Service Catalog & SubID Generation ---');
  const admitad = AdmitadService.getInstance();
  const offers = admitad.listOffers();
  assert.ok(offers.length >= 5, 'Should have at least 5 Tier-1 Admitad offers');

  const spokeo = admitad.getOffer('admitad_spokeo');
  assert.ok(spokeo, 'Spokeo offer must exist');
  assert.strictEqual(spokeo?.category, 'people-search');

  const generatedUrl = admitad.generateTrackingUrl({
    offerId: 'admitad_spokeo',
    clickId: 'fc_test_cid_123',
    platform: 'blog',
    slug: 'ghosting-algorithm',
    trigger: 'inline_box',
  });

  assert.ok(generatedUrl.includes('subid=fc_test_cid_123'), 'URL must contain subid click ID');
  assert.ok(generatedUrl.includes('subid1=blog'), 'URL must contain subid1 platform');
  assert.ok(generatedUrl.includes('subid2=ghosting-algorithm'), 'URL must contain subid2 slug');
  assert.ok(generatedUrl.includes('subid3=inline_box'), 'URL must contain subid3 trigger');
  console.log('✅ [PASS] Admitad tracking URL formatted properly with all subids');

  console.log('\n--- [TEST 2] Context-Aware Smart Offer Matching ---');
  const safetyOffer = admitad.getBestOfferForContext('forensic scam investigation');
  assert.strictEqual(safetyOffer.id, 'admitad_spokeo', 'Safety content should match Spokeo');

  const privacyOffer = admitad.getBestOfferForContext('cybersecurity data removal extortion');
  assert.strictEqual(privacyOffer.id, 'admitad_nordvpn', 'Privacy content should match NordVPN');

  const datingOffer = admitad.getBestOfferForContext('dating psychology matching');
  assert.strictEqual(datingOffer.id, 'admitad_eharmony', 'Dating content should match eHarmony');
  console.log('✅ [PASS] Context matching dynamically maps high-intent niches');

  console.log('\n--- [TEST 3] OfferRoutingService Integration ---');
  OfferRoutingService.resetInstance();
  const router = OfferRoutingService.getInstance();
  const routingOffers = router.getEligibleOffers();
  const hasSpokeo = routingOffers.some(o => o.id === 'admitad_spokeo');
  const hasNordvpn = routingOffers.some(o => o.id === 'admitad_nordvpn');
  assert.ok(hasSpokeo, 'OfferRoutingService must include admitad_spokeo');
  assert.ok(hasNordvpn, 'OfferRoutingService must include admitad_nordvpn');

  const spokeoConfig = router.getOfferConfig('admitad_spokeo');
  assert.strictEqual(spokeoConfig?.network, 'admitad');
  assert.strictEqual(spokeoConfig?.subParam, 'subid');
  console.log('✅ [PASS] OfferRoutingService initializes Admitad catalog');

  console.log('\n--- [TEST 4] Postback Event Extraction for Admitad Webhooks ---');
  const mockAdmitadReq: any = {
    query: {
      subid: 'fc_live_cid_9999',
      payment: '22.50',
      currency: 'USD',
      status: 'approved',
      order_id: 'adm_ord_88421',
      advcampaign_id: 'spokeo_us',
    },
    body: {},
  };

  const extracted = extractPostbackEvent(mockAdmitadReq);
  assert.strictEqual(extracted.clickId, 'fc_live_cid_9999', 'clickId must match subid');
  assert.strictEqual(extracted.payout, 22.5, 'payout must match payment float value');
  assert.strictEqual(extracted.status, 'sale', 'approved status must be mapped to sale');
  assert.strictEqual(extracted.transactionId, 'adm_ord_88421', 'transactionId must match order_id');
  assert.strictEqual(extracted.currency, 'USD', 'currency must match USD');
  console.log('✅ [PASS] Postback router correctly decodes Admitad parameters');

  console.log('\n================================================================');
  console.log('🎉 ALL ADMITAD INTEGRATION TESTS PASSED SUCCESSFULLY');
  console.log('================================================================');
}

runAdmitadTests().catch((err) => {
  console.error('❌ [FAIL] Admitad test failed:', err);
  process.exit(1);
});

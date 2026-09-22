import assert from 'assert';
import { OfferRoutingService, OfferConfig } from '../services/offer-routing.service.js';

console.log('🧪 ================================================================');
console.log('🧪 Revenue Circuit Breaker & Traffic Preservation Test Suite');
console.log('🧪 ================================================================');

// Set low test threshold for test execution
process.env.CIRCUIT_BREAKER_MIN_IMPRESSIONS = '10';

const testOffers: OfferConfig[] = [
  {
    id: 'test_burning_offer',
    name: 'Burning Test Smartlink',
    network: 'test_net',
    baseUrl: 'https://smartlink.trackcdn.org/burn',
    subParam: 'cid',
    isPrimary: false,
    enabled: true
  },
  {
    id: 'lospollos_casual',
    name: 'LosPollos Casual Fallback',
    network: 'lospollos',
    baseUrl: 'https://smartlink.trackcdn.org/casual',
    subParam: 'cid',
    isPrimary: true,
    enabled: true
  }
];

OfferRoutingService.resetInstance();
const routingService = OfferRoutingService.getInstance({
  offers: testOffers,
  explorationRate: 0
});

async function runCircuitBreakerTests() {
  console.log('\n--- [TEST 1] Initial Health & Eligibility ---');
  const initialEligible = routingService.getEligibleOffers().map(o => o.id);
  assert.ok(initialEligible.includes('test_burning_offer'), 'test_burning_offer must initially be eligible');
  assert.ok(initialEligible.includes('lospollos_casual'), 'lospollos_casual must be eligible');
  console.log('✅ [PASS] All initial test arms are eligible');

  console.log('\n--- [TEST 2] Simulation of Traffic Drain (Zero Conversions) ---');
  // Record 10 impressions with 0 conversions
  for (let i = 0; i < 10; i++) {
    routingService.recordImpression('test_burning_offer');
  }

  const eligibleAfterBurn = routingService.getEligibleOffers().map(o => o.id);
  assert.strictEqual(
    eligibleAfterBurn.includes('test_burning_offer'),
    false,
    'Burning offer must be removed from eligible pool after reaching zero-conversion threshold'
  );
  console.log('✅ [PASS] Revenue Circuit Breaker tripped: burning offer successfully marked degraded');

  console.log('\n--- [TEST 3] Safe Fallback Redirection ---');
  const selected = routingService.selectBestOffer('test_chat_123');
  assert.strictEqual(
    selected.offerId,
    'lospollos_casual',
    'Traffic must automatically fall back to resilient fallback arm'
  );
  console.log('✅ [PASS] Traffic preserved and seamlessly routed to fallback offer');

  console.log('\n--- [TEST 4] Automatic Recovery on Conversion ---');
  // Simulate receiving a conversion for the degraded offer
  routingService.recordConversion('test_burning_offer', 25.00);

  const eligibleAfterRecovery = routingService.getEligibleOffers().map(o => o.id);
  assert.ok(
    eligibleAfterRecovery.includes('test_burning_offer'),
    'Burning offer must be automatically restored after receiving conversion'
  );
  console.log('✅ [PASS] Degraded offer restored to healthy state after confirmed conversion');

  console.log('\n================================================================');
  console.log('📊 REVENUE CIRCUIT BREAKER RESULTS: ALL TESTS PASSED (4/4)');
  console.log('================================================================\n');
}

runCircuitBreakerTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

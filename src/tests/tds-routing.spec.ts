import { strict as assert } from 'assert';
import express from 'express';
import http from 'http';
import { tdsRouter } from '../../core/src/server/routes/tds.router.js';
import { OfferRoutingService } from '../../core/src/services/offer-routing.service.js';

async function testTdsRouting() {
  console.log('🧪 Testing TDS Routing Engine (/go and /)');

  const app = express();
  app.use(tdsRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as any).port;

  try {
    // Test 1: Root redirect
    const resRoot = await fetch(`http://127.0.0.1:${port}/`, { redirect: 'manual' });
    assert.equal(resRoot.status, 302, 'Root / must return 302 redirect');
    const rootLoc = resRoot.headers.get('location') || '';
    assert.ok(rootLoc.includes('/go'), 'Root / must redirect to /go');
    console.log('✅ [PASS] Root / redirects to /go');

    // Test 2: /go with explicit offer
    const resGoOffer = await fetch(`http://127.0.0.1:${port}/go?offer=lospollos_cams&sub1=test_source&sub2=12345&cid=test_cid_123`, { redirect: 'manual' });
    assert.equal(resGoOffer.status, 302, '/go must return 302 redirect');
    const goLoc = resGoOffer.headers.get('location') || '';
    assert.ok(goLoc.includes('yearningcompanion.org') || goLoc.includes('sub1=test_source'), 'Target URL must match lospollos_cams');
    assert.ok(goLoc.includes('cid=test_cid_123'), 'Target URL must contain cid');
    assert.ok(goLoc.includes('sub2=12345'), 'Target URL must contain sub2');
    console.log('✅ [PASS] /go with explicit offer redirects to correct partner smartlink with subids');

    // Test 3: /go default fallback
    const resGoDefault = await fetch(`http://127.0.0.1:${port}/go?sub1=organic`, { redirect: 'manual' });
    assert.equal(resGoDefault.status, 302, '/go default must return 302 redirect');
    const defLoc = resGoDefault.headers.get('location') || '';
    assert.ok(defLoc.includes('chemistrydrivensmile.org') || defLoc.includes('rp1pd38'), 'Default URL must route to primary dating offer');
    assert.ok(defLoc.includes('cid='), 'Default URL must auto-generate cid');
    console.log('✅ [PASS] /go default fallback routes to primary dating offer with generated cid');

    console.log('\n🎉 ALL TDS ROUTING TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

testTdsRouting().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

const fs = require('fs');
const { OfferRoutingService } = require('/var/www/affiliate/core/dist/services/offer-routing.service.js');

// Test how it runs with cwd = /var/www/affiliate/core
process.chdir('/var/www/affiliate/core');
const router = new OfferRoutingService();
console.log('Total offers loaded from core dir:', router.getAllOffers().length);
console.log('admitad_49070:', router.getOfferConfig('admitad_49070'));
console.log('admitad_191148:', router.getOfferConfig('admitad_191148'));
console.log('All offer IDs starting with admitad_:', router.getAllOffers().filter(o => o.id.startsWith('admitad_')).map(o => o.id));

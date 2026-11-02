const { OfferRoutingService } = require('/var/www/affiliate/core/dist/services/offer-routing.service.js');
const r = OfferRoutingService.getInstance();
console.log('Offer 49070:', r.getOfferConfig('admitad_49070'));
console.log('Offer 191148:', r.getOfferConfig('admitad_191148'));
console.log('Total offers loaded:', r.getAllOffers().length);

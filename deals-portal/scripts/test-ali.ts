import { COUPONS_DATA } from '../src/data/couponsData';
import { extractSmartDiscountBadge } from '../src/utils/dealNormalizer';

const ali = COUPONS_DATA.find(d => d.id === 'net_899182');
if (ali) {
  console.log('net_899182 raw:', ali.discountBadge, '-> extracted:', extractSmartDiscountBadge(ali.discountBadge, ali.title));
} else {
  console.log('Alibaba deal net_899182 not found');
}


import { extractSmartDiscountBadge } from '../src/utils/dealNormalizer';

console.log('20 $ OFF ->', extractSmartDiscountBadge('20 $ OFF', '20 $ OFF On Alibaba'));
console.log('$20 OFF ->', extractSmartDiscountBadge('$20 OFF', 'Save $20 on order'));
console.log('OnlineSim ->', extractSmartDiscountBadge('', 'OnlineSim Direct Activation'));
console.log('Random deal ->', extractSmartDiscountBadge('', 'Some random deal'));


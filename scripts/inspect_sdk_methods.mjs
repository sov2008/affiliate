import * as sdk from '@google/stitch-sdk';
import { stitch } from '@google/stitch-sdk';

console.log('SDK exports:', Object.keys(sdk));

const client = new sdk.StitchToolClient();
console.log('StitchToolClient methods:');
let curr = client;
while (curr && curr !== Object.prototype) {
  console.log(Object.getOwnPropertyNames(curr));
  curr = Object.getPrototypeOf(curr);
}


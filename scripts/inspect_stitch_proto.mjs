import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as sdk from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new sdk.StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
console.log('StitchToolClient instance created successfully.');

let curr = client;
while (curr && curr !== Object.prototype) {
  console.log('Proto:', Object.getOwnPropertyNames(curr));
  curr = Object.getPrototypeOf(curr);
}

// Project prototype
const proj = new sdk.Project(client, '1424553323989134013');
console.log('Project prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(proj)));

// Screen prototype
const scr = new sdk.Screen(client, '1424553323989134013', 'fake');
console.log('Screen prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(scr)));


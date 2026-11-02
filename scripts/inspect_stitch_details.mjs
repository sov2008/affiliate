import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { stitch } from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const projectId = '1424553323989134013';
  const project = stitch.project(projectId);
  const screens = await project.screens();

  console.log(`Inspecting ${screens.length} screens in Stitch...`);
  for (const s of screens) {
    console.log(`\nScreen ID: ${s.id}`);
    console.log(`Title/Name: ${s.title || s.name || 'N/A'}`);
    console.log('Keys:', Object.keys(s));
    if (typeof s.getData === 'function') {
      try {
        const d = await s.getData();
        console.log('Data keys:', Object.keys(d));
      } catch (e) {
        console.log('getData error:', e.message);
      }
    }
  }
}

main().catch(console.error);


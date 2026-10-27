import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

console.log('STITCH_API_KEY present:', Boolean(process.env.STITCH_API_KEY));

import { stitch, StitchToolClient } from '@google/stitch-sdk';

async function main() {
  const projectId = '1424553323989134013';
  console.log(`Connecting to Stitch project ${projectId}...`);

  try {
    const project = stitch.project(projectId);
    console.log('Fetching screens...');
    const screens = await project.screens();
    console.log(`Found ${screens.length} screens in project ${projectId}`);

    const outDir = path.resolve(__dirname, '../scratch/stitch_project');
    fs.mkdirSync(outDir, { recursive: true });

    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];
      console.log(`\n--- Screen ${i + 1}/${screens.length}: ID=${screen.id || screen.screenId} ---`);
      
      try {
        const htmlUrl = await screen.getHtml();
        console.log(`HTML URL: ${htmlUrl}`);
        if (htmlUrl) {
          const resp = await fetch(htmlUrl);
          const htmlText = await resp.text();
          const screenFile = path.join(outDir, `screen_${i + 1}_${screen.id || screen.screenId}.html`);
          fs.writeFileSync(screenFile, htmlText, 'utf8');
          console.log(`Saved HTML to ${screenFile} (${htmlText.length} bytes)`);
        }
      } catch (err) {
        console.error(`Error getting HTML for screen ${screen.id}:`, err.message);
      }

      try {
        const imgUrl = await screen.getImage();
        console.log(`Image URL: ${imgUrl}`);
      } catch (err) {
        console.error(`Error getting image for screen ${screen.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Project screens error:', err);

    console.log('\nTrying list projects...');
    try {
      const all = await stitch.projects();
      console.log(`Total projects accessible: ${all.length}`);
      for (const p of all) {
        console.log(`- Project ID: ${p.id} / ${p.projectId}`);
      }
    } catch (err2) {
      console.error('List projects error:', err2);
    }
  }
}

main().catch(console.error);

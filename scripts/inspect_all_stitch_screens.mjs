import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as sdk from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const client = new sdk.StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
  console.log('Connecting to Stitch Tool Client...');
  await client.connect();

  try {
    const projectId = '1424553323989134013';
    console.log(`Listing screens for project ${projectId}...`);
    const project = await client.callTool('get_project', { name: `projects/${projectId}` });
    console.log('Project info:', project);

    const listRes = await client.callTool('list_screens', { parent: `projects/${projectId}` });
    console.log(`Found ${listRes.screens ? listRes.screens.length : 0} screens`);

    const screensDir = '/var/www/affiliate/scratch/stitch_all_screens';
    if (!fs.existsSync(screensDir)) fs.mkdirSync(screensDir, { recursive: true });

    const screensSummary = [];

    for (let i = 0; i < (listRes.screens || []).length; i++) {
      const screen = listRes.screens[i];
      console.log(`\n[${i+1}] Screen: ${screen.name} | Title: ${screen.title || 'Untitled'}`);
      
      const fileId = screen.screenshot?.name;
      let localPath = null;
      if (fileId) {
        try {
          const fileRes = await client.callTool('download_file', { name: fileId });
          let buf;
          if (Buffer.isBuffer(fileRes.image)) buf = fileRes.image;
          else if (typeof fileRes.image === 'string') buf = Buffer.from(fileRes.image, 'base64');

          if (buf) {
            localPath = path.join(screensDir, `screen_${i+1}_${path.basename(screen.name)}.png`);
            fs.writeFileSync(localPath, buf);
            console.log(`  Saved screenshot (${buf.length} bytes) to ${localPath}`);
          }
        } catch (e) {
          console.log(`  Download error: ${e.message}`);
        }
      }

      screensSummary.push({
        name: screen.name,
        title: screen.title,
        prompt: screen.prompt,
        fileId: fileId,
        localPath: localPath
      });
    }

    fs.writeFileSync('/var/www/affiliate/scratch/stitch_screens_summary.json', JSON.stringify(screensSummary, null, 2), 'utf8');
    console.log('\nSaved screens summary to /var/www/affiliate/scratch/stitch_screens_summary.json');

  } catch (err) {
    console.error('Error listing stitch screens:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);


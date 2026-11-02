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
  await client.connect();

  const res = await client.callTool('get_project', { name: 'projects/1424553323989134013' });
  const instances = res.screenInstances || [];
  console.log('Total screenInstances:', instances.length);

  const outDir = '/var/www/affiliate/scratch/stitch_pin_variants';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const foundVariants = [];

  for (const inst of instances) {
    const label = inst.label || '';
    console.log(`- Instance ${inst.id}: ${label.substring(0, 70)}...`);

    if (label.toLowerCase().includes('pinterest') || label.toLowerCase().includes('voucher') || label.toLowerCase().includes('theme') || label.toLowerCase().includes('color')) {
      const screenId = inst.sourceScreen ? inst.sourceScreen.replace(/^projects\/[^\/]+\/screens\//, '') : inst.id;
      console.log(`  Fetching screen ${screenId}...`);

      try {
        const scrDetails = await client.callTool('get_screen', { name: `projects/1424553323989134013/screens/${screenId}` });
        const scr = scrDetails.screen || scrDetails;
        const fileId = scr.screenshot?.name;
        console.log(`  FileId: ${fileId}`);

        if (fileId) {
          const fileRes = await client.callTool('download_file', { name: fileId });
          let buf;
          if (Buffer.isBuffer(fileRes.image)) buf = fileRes.image;
          else if (typeof fileRes.image === 'string') buf = Buffer.from(fileRes.image, 'base64');

          if (buf) {
            const outPath = path.join(outDir, `stitch_theme_${screenId}.png`);
            fs.writeFileSync(outPath, buf);
            console.log(`  Saved ${buf.length} bytes to ${outPath} ✅`);
            foundVariants.push({
              screenId,
              label,
              path: outPath
            });
          }
        }
      } catch (err) {
        console.log(`  Fetch error for ${screenId}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync('/var/www/affiliate/scratch/stitch_found_variants.json', JSON.stringify(foundVariants, null, 2), 'utf8');
  await client.close();
}

main().catch(console.error);

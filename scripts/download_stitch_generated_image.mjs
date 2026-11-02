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

  console.log('Downloading screenshot via Stitch client.callTool...');
  try {
    const res = await client.callTool('download_file', {
      name: 'projects/1424553323989134013/files/4fc245ab31474c9898d448283a7244e5'
    });

    console.log('Download result keys:', Object.keys(res));
    if (res.content && res.content[0]) {
      const c = res.content[0];
      console.log('Content type:', c.type);
      if (c.data) {
        const buffer = Buffer.from(c.data, 'base64');
        const outPath = '/var/www/affiliate/scratch/pins_promoradar/stitch_ai_pin_hostinger.png';
        fs.writeFileSync(outPath, buffer);
        console.log(`✅ Saved ${buffer.length} bytes to ${outPath}`);
      } else if (c.text) {
        console.log('Text content preview:', c.text.substring(0, 200));
      }
    }
  } catch (err) {
    console.error('Download error:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);


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

  try {
    const res = await client.callTool('download_file', {
      name: 'projects/1424553323989134013/files/4fc245ab31474c9898d448283a7244e5'
    });

    console.log('image type:', typeof res.image);
    console.log('imageMetadata:', res.imageMetadata);

    if (res.image) {
      let buf;
      if (Buffer.isBuffer(res.image)) {
        buf = res.image;
      } else if (typeof res.image === 'string') {
        buf = Buffer.from(res.image, 'base64');
      }
      if (buf) {
        const outPath = '/var/www/affiliate/scratch/pins_promoradar/stitch_ai_pin_hostinger.png';
        fs.writeFileSync(outPath, buf);
        console.log(`✅ Saved ${buf.length} bytes to ${outPath}`);
      }
    }
  } catch (err) {
    console.error('Download error:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);


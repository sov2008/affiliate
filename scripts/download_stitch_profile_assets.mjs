import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as sdk from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function downloadAsset(client, resourceName, outPath) {
  console.log(`Downloading ${resourceName}...`);
  const res = await client.callTool('download_file', { name: resourceName });
  if (res.image) {
    let buf;
    if (Buffer.isBuffer(res.image)) {
      buf = res.image;
    } else if (typeof res.image === 'string') {
      buf = Buffer.from(res.image, 'base64');
    }
    if (buf) {
      fs.writeFileSync(outPath, buf);
      console.log(`✅ Saved ${buf.length} bytes to ${outPath}`);
      return true;
    }
  }
  console.error(`Failed to download ${resourceName}:`, res);
  return false;
}

async function main() {
  const client = new sdk.StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
  await client.connect();

  const outDir = '/var/www/affiliate/scratch/stitch_pinterest';
  fs.mkdirSync(outDir, { recursive: true });

  const bannerFile = 'projects/1424553323989134013/files/9b6ecb2c6c0746858ae6e1b3566819a9';
  const avatarFile = 'projects/1424553323989134013/files/fcdc01aa65be44e6bef3ab1e4a061c31';

  try {
    await downloadAsset(client, bannerFile, path.join(outDir, 'stitch_pinterest_banner.jpg'));
    await downloadAsset(client, avatarFile, path.join(outDir, 'stitch_pinterest_avatar.jpg'));
    console.log('🎉 Both Pinterest assets downloaded successfully!');
  } catch (err) {
    console.error('Download error:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);


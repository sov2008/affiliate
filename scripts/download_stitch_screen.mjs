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

  console.log('Downloading file via project.client.client.callTool download_file...');
  try {
    const res = await project.client.client.callTool({
      name: 'download_file',
      arguments: {
        name: 'projects/1424553323989134013/screens/9b60a2bb53e946f9a8287ce731781dc4/fileEntries/html'
      }
    });

    console.log('Result type:', typeof res);
    console.log('Keys:', Object.keys(res));
    if (res.content && res.content[0]) {
      console.log('Content type:', res.content[0].type);
      const text = res.content[0].text;
      console.log('Downloaded length:', text.length);
      fs.writeFileSync('/var/www/affiliate/scratch/stitch_home_downloaded.html', text, 'utf8');
      console.log('✅ Successfully saved to /var/www/affiliate/scratch/stitch_home_downloaded.html');
    }
  } catch (err) {
    console.error('CallTool error:', err);
  }
}

main().catch(console.error);


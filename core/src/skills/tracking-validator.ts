import fs from 'fs/promises';
import path from 'path';

async function validateTracking() {
  console.log('[Tracking Validator] Starting macro validation...');
  const campaignsDir = path.resolve(__dirname, '../../../campaigns');
  
  try {
    const entries = await fs.readdir(campaignsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const htmlPath = path.join(campaignsDir, entry.name, 'index.html');
        try {
          const html = await fs.readFile(htmlPath, 'utf8');
          const hasClickId = html.includes('click_id');
          const hasSub1 = html.includes('sub1');
          const hasSubId = html.includes('sub_id');
          
          if (!hasClickId && !hasSub1 && !hasSubId) {
            console.warn(`[Tracking Validator] ⚠️ WARNING: Campaign ${entry.name} may be missing required tracking macros (click_id, sub1, sub_id).`);
          } else {
            console.log(`[Tracking Validator] ✅ Campaign ${entry.name} passed tracking validation.`);
          }
        } catch (err) {
          // No index.html, skip
        }
      }
    }
  } catch (err) {
    console.error('[Tracking Validator] Failed to read campaigns directory.', err);
  }
}

validateTracking();

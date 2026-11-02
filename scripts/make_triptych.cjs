const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const p1 = fs.readFileSync(path.resolve(__dirname, '../scratch/pins_promoradar/preview_pin_hostinger.png')).toString('base64');
  const p2 = fs.readFileSync(path.resolve(__dirname, '../scratch/pins_promoradar/preview_pin_expressvpn.png')).toString('base64');
  const p3 = fs.readFileSync(path.resolve(__dirname, '../scratch/pins_promoradar/preview_pin_allpowers.png')).toString('base64');

  const html = `<!DOCTYPE html><html><body style="margin:0;background:#05070D;padding:60px 40px;display:flex;justify-content:center;gap:40px;">
    <div style="border-radius:32px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.9);"><img src="data:image/png;base64,${p1}" style="width:700px;height:1050px;display:block;" /></div>
    <div style="border-radius:32px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.9);"><img src="data:image/png;base64,${p2}" style="width:700px;height:1050px;display:block;" /></div>
    <div style="border-radius:32px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.9);"><img src="data:image/png;base64,${p3}" style="width:700px;height:1050px;display:block;" /></div>
  </body></html>`;

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 2300, height: 1180 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: path.resolve(__dirname, '../scratch/pins_promoradar/triptych_preview.png') });
  await browser.close();
  console.log('Triptych saved!');
}

main().catch(console.error);


const fs = require('fs');
const sharp = require('sharp');

async function inspect(slug) {
  const file = 'deals-portal/public/logos/' + slug + '.png';
  if (!fs.existsSync(file)) {
    console.log(slug, 'NOT FOUND');
    return;
  }
  const meta = await sharp(file).metadata();
  const stats = await sharp(file).stats();
  const isOpaque = stats.channels[3] ? (stats.channels[3].min === 255) : true;
  console.log(slug, meta.width + 'x' + meta.height, 'hasAlpha:', meta.hasAlpha, 'isOpaque (no transp):', isOpaque);
}

async function run() {
  const list = ['turbosto', 'hostinger', 'purevpn', 'touch', 'polis-ua', 'allpowers', 'kodland', 'airalo', 'expressvpn'];
  for (const s of list) {
    await inspect(s);
  }
}
run();


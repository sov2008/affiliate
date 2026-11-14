const sharp = require('sharp');

async function checkBorders(slug) {
  const file = 'deals-portal/public/logos/' + slug + '.png';
  const img = sharp(file);
  const meta = await img.metadata();
  const raw = await img.raw().toBuffer();
  
  // check corner pixels (0,0), (width-1, 0), (0, height-1), (width-1, height-1)
  const getPixel = (x, y) => {
    const idx = (y * meta.width + x) * meta.channels;
    return {
      r: raw[idx],
      g: raw[idx + 1],
      b: raw[idx + 2],
      a: meta.channels === 4 ? raw[idx + 3] : 255
    };
  };

  console.log('=== ' + slug + ' === (' + meta.width + 'x' + meta.height + ')');
  console.log('TopLeft:', getPixel(0, 0));
  console.log('TopRight:', getPixel(meta.width - 1, 0));
  console.log('BottomLeft:', getPixel(0, meta.height - 1));
  console.log('BottomRight:', getPixel(meta.width - 1, meta.height - 1));
  console.log('Center:', getPixel(Math.floor(meta.width / 2), Math.floor(meta.height / 2)));
}

async function run() {
  const list = ['touch', 'kodland', 'airalo', 'polis-ua', 'allpowers', 'purevpn', 'hostinger'];
  for (const s of list) {
    await checkBorders(s);
  }
}
run();


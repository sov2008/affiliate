const sharp = require('sharp');
const fs = require('fs');

async function createBanner728() {
  const width = 728;
  const height = 90;
  const logoBuf = fs.readFileSync('deals-portal/public/logos/nike.png');
  const logoResized = await sharp(logoBuf).resize({ height: 50, fit: 'inside' }).toBuffer();

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" rx="16"/>
      <rect width="100%" height="100%" fill="none" stroke="#e21b23" stroke-width="1.5" stroke-opacity="0.3" rx="16"/>
      
      <text x="140" y="38" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="20" fill="#ffffff" letter-spacing="0.5">
        NIKE OFFICIAL VERIFIED STORE
      </text>
      <text x="140" y="62" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="13" fill="#e21b23">
        UP TO 40% OFF AIR MAX &amp; PEGASUS RUNNING SHOES
      </text>

      <g transform="translate(560, 24)">
        <rect width="144" height="42" rx="10" fill="#e21b23"/>
        <text x="72" y="26" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" fill="#ffffff" text-anchor="middle">
          SHOP DEALS &#x2192;
        </text>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .composite([{ input: logoResized, top: 20, left: 30 }])
    .jpeg({ quality: 90 })
    .toFile('deals-portal/public/promo-media/nike/nike_hero_728x90.jpg');
  console.log('Created high-end branded 728x90 hero with red swoosh');
}

async function createBanner300() {
  const width = 300;
  const height = 250;
  const logoBuf = fs.readFileSync('deals-portal/public/logos/nike.png');
  const logoResized = await sharp(logoBuf).resize({ height: 54, fit: 'inside' }).toBuffer();

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg2)" rx="20"/>
      <rect width="100%" height="100%" fill="none" stroke="#e21b23" stroke-width="1.5" stroke-opacity="0.35" rx="20"/>

      <text x="150" y="116" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle">
        JUST DO IT.
      </text>
      <text x="150" y="142" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="#e21b23" text-anchor="middle">
        UP TO 40% OFF
      </text>
      <text x="150" y="165" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="11" fill="#94a3b8" text-anchor="middle">
        Official Footwear &amp; Apparel
      </text>

      <g transform="translate(60, 185)">
        <rect width="180" height="38" rx="10" fill="#e21b23"/>
        <text x="90" y="24" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="12" fill="#ffffff" text-anchor="middle">
          CLAIM DISCOUNT &#x2192;
        </text>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .composite([{ input: logoResized, top: 28, left: 105 }])
    .jpeg({ quality: 90 })
    .toFile('deals-portal/public/promo-media/nike/nike_card_300x250.jpg');
  console.log('Created high-end branded 300x250 rectangle with red swoosh');
}

Promise.all([createBanner728(), createBanner300()]).then(() => console.log('All Nike banners updated!'));

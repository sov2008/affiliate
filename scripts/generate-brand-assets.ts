/**
 * Generate Brand Identity Assets (PNG + ICO + SVG Logo)
 * Engine: Sharp & Pure Node.js
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(process.cwd(), 'blog/public');
const IMAGES_DIR = path.resolve(PUBLIC_DIR, 'images');

const SVG_FAVICON_PATH = path.join(PUBLIC_DIR, 'favicon.svg');
const APPLE_TOUCH_ICON_PATH = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
const FAVICON_ICO_PATH = path.join(PUBLIC_DIR, 'favicon.ico');
const LOGO_SVG_PATH = path.join(IMAGES_DIR, 'logo.svg');

// Horizontal Brand Logo SVG
const LOGO_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 36" width="260" height="36" fill="none">
  <!-- Brand Icon Badge (28x28 inside 32x32 box) -->
  <g transform="translate(2, 2)">
    <rect width="32" height="32" rx="6" fill="#0F172A" />
    <!-- Verification Shield -->
    <path d="M16 6 L24 9.5 V16.5 C24 21.5 16 25 16 25 C16 25 8 21.5 8 16.5 V9.5 Z" 
          stroke="#FFFDF7" 
          stroke-width="1.6" 
          stroke-linejoin="round" 
          stroke-linecap="round" />
    <!-- Reticle Crosshairs -->
    <line x1="11" y1="15.5" x2="21" y2="15.5" stroke="#FFFDF7" stroke-width="1.2" stroke-linecap="round" />
    <line x1="16" y1="10.5" x2="16" y2="20.5" stroke="#FFFDF7" stroke-width="1.2" stroke-linecap="round" />
    <!-- Target Core -->
    <circle cx="16" cy="15.5" r="2.8" stroke="#FFFDF7" stroke-width="1.1" fill="none" />
    <circle cx="16" cy="15.5" r="1.4" fill="#BE123C" />
  </g>

  <!-- Typography Group -->
  <text x="44" y="20" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" letter-spacing="-0.04em" fill="#0F172A">
    FLIRT<tspan fill="#BE123C">CHECK</tspan>
  </text>
  
  <text x="44" y="31" font-family="'Courier New', Courier, monospace" font-size="8.5" font-weight="700" letter-spacing="0.14em" fill="#64748B">
    INVESTIGATIVE DESK · CHELTENHAM
  </text>
</svg>
`;

// Helper to create valid ICO format from PNG buffers
function createIco(pngBuffers: { width: number; height: number; buffer: Buffer }[]): Buffer {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalHeaderSize = headerSize + numImages * dirEntrySize;

  let currentOffset = totalHeaderSize;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(numImages, 4);

  const dirEntries: Buffer[] = [];
  const imageBuffers: Buffer[] = [];

  for (const img of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // Offset to image data

    dirEntries.push(entry);
    imageBuffers.push(img.buffer);
    currentOffset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function generateBrandAssets() {
  console.log('Generating Brand Assets for FlirtCheck Forensic Desk...\n');

  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  // 1. Write logo.svg
  fs.writeFileSync(LOGO_SVG_PATH, LOGO_SVG_CONTENT, 'utf8');
  console.log(`✅ Saved: ${LOGO_SVG_PATH}`);

  // 2. Generate Apple Touch Icon 180x180 PNG
  const svgBuffer = fs.readFileSync(SVG_FAVICON_PATH);

  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(APPLE_TOUCH_ICON_PATH);
  console.log(`✅ Saved: ${APPLE_TOUCH_ICON_PATH} (180x180)`);

  // 3. Generate Multi-size Favicon.ico (16, 32, 48)
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map(async (s) => ({
      width: s,
      height: s,
      buffer: await sharp(svgBuffer).resize(s, s).png().toBuffer(),
    }))
  );

  const icoBuffer = createIco(pngBuffers);
  fs.writeFileSync(FAVICON_ICO_PATH, icoBuffer);
  console.log(`✅ Saved: ${FAVICON_ICO_PATH} (Multi-res: 16x16, 32x32, 48x48)`);

  console.log('\n🎉 All brand assets generated successfully!');
}

generateBrandAssets().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});

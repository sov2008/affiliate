import fs from 'node:fs';
import path from 'node:path';

const FONTS_DIR = path.resolve(process.cwd(), 'blog/public/fonts');

interface FontTarget {
  family: string;
  weight: string;
  style: string;
  filename: string;
}

const TARGETS: FontTarget[] = [
  { family: 'Playfair Display', weight: '700', style: 'normal', filename: 'PlayfairDisplay-Bold.woff2' },
  { family: 'Playfair Display', weight: '900', style: 'normal', filename: 'PlayfairDisplay-Black.woff2' },
  { family: 'Playfair Display', weight: '400', style: 'italic', filename: 'PlayfairDisplay-Italic.woff2' },
  { family: 'JetBrains Mono', weight: '400', style: 'normal', filename: 'JetBrainsMono-Regular.woff2' },
  { family: 'JetBrains Mono', weight: '700', style: 'normal', filename: 'JetBrainsMono-Bold.woff2' },
];

const CSS_URLS = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'
];

// Modern Chrome User-Agent to receive .woff2 responses from Google Fonts
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchCss(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': CHROME_UA }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch CSS from ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

interface ParsedFontFace {
  family: string;
  style: string;
  weight: string;
  subset: string;
  url: string;
}

function parseFontFaces(css: string): ParsedFontFace[] {
  const results: ParsedFontFace[] = [];
  const blocks = css.split('@font-face');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const prevBlock = blocks[i - 1];
    
    // Check subset from preceding comment e.g. /* latin */
    const subsetMatch = prevBlock.match(/\/\*\s*([\w-]+)\s*\*\/[^\/]*$/);
    const subset = subsetMatch ? subsetMatch[1].trim() : 'unknown';

    const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)['"]?/i);
    const styleMatch = block.match(/font-style:\s*([^;]+);/i);
    const weightMatch = block.match(/font-weight:\s*([^;]+);/i);
    const urlMatch = block.match(/src:\s*url\((https:\/\/[^)]+\.woff2)\)/i);

    if (familyMatch && styleMatch && weightMatch && urlMatch) {
      results.push({
        family: familyMatch[1].trim(),
        style: styleMatch[1].trim(),
        weight: weightMatch[1].trim(),
        subset,
        url: urlMatch[1].trim()
      });
    }
  }

  return results;
}

async function downloadBinary(url: string, outputPath: string): Promise<number> {
  const res = await fetch(url, {
    headers: { 'User-Agent': CHROME_UA }
  });
  if (!res.ok) {
    throw new Error(`Failed to download font binary from ${url}: ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  return buffer.byteLength;
}

async function main() {
  console.log('--- DOWNLOADING CLEAN WOFF2 FONT SUBSETS (LATIN) ---');
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
    console.log(`Created directory: ${FONTS_DIR}`);
  }

  const allParsed: ParsedFontFace[] = [];
  for (const cssUrl of CSS_URLS) {
    console.log(`Fetching CSS catalog: ${cssUrl}`);
    const css = await fetchCss(cssUrl);
    const parsed = parseFontFaces(css);
    allParsed.push(...parsed);
  }

  console.log(`Parsed ${allParsed.length} total font-face blocks.`);

  let totalBytes = 0;

  for (const target of TARGETS) {
    const match = allParsed.find(
      (f) =>
        f.family.toLowerCase() === target.family.toLowerCase() &&
        f.weight === target.weight &&
        f.style === target.style &&
        f.subset === 'latin'
    );

    if (!match) {
      console.error(`❌ Could not find latin match for: ${target.family} ${target.weight} ${target.style}`);
      continue;
    }

    const destPath = path.join(FONTS_DIR, target.filename);
    console.log(`⬇️ Downloading ${target.filename} from ${match.url} ...`);
    const bytes = await downloadBinary(match.url, destPath);
    totalBytes += bytes;
    console.log(`   Saved ${target.filename}: ${(bytes / 1024).toFixed(2)} KB`);
  }

  console.log('----------------------------------------------------');
  console.log(`✅ All fonts downloaded! Total size: ${(totalBytes / 1024).toFixed(2)} KB`);
}

main().catch((err) => {
  console.error('Fatal error downloading fonts:', err);
  process.exit(1);
});

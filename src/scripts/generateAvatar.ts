import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

export async function generateTechHudAvatar(outputPath: string): Promise<{ sizeBytes: number; path: string }> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 400, height: 400 },
    deviceScaleFactor: 1,
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 400px;
      height: 400px;
      background: #0a0a0c;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
    }
    svg {
      width: 400px;
      height: 400px;
    }
  </style>
</head>
<body>
  <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Radial Gradients -->
      <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#241306" stop-opacity="0.9"/>
        <stop offset="60%" stop-color="#120c08" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#0a0a0c" stop-opacity="1"/>
      </radialGradient>
      
      <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff2df" stop-opacity="1"/>
        <stop offset="30%" stop-color="#ffaa00" stop-opacity="0.9"/>
        <stop offset="70%" stop-color="#ff5500" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#ff3300" stop-opacity="0"/>
      </radialGradient>

      <!-- Glow Filters -->
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Background Base -->
    <rect width="400" height="400" fill="#0a0a0c"/>
    <circle cx="200" cy="200" r="195" fill="url(#bgGlow)"/>

    <!-- Geometric Grid lines -->
    <g stroke="#ff7700" stroke-width="0.75" opacity="0.2">
      <line x1="20" y1="200" x2="380" y2="200"/>
      <line x1="200" y1="20" x2="200" y2="380"/>
      <line x1="72" y1="72" x2="328" y2="328"/>
      <line x1="72" y1="328" x2="328" y2="72"/>
      
      <!-- Coordinate circles -->
      <circle cx="200" cy="200" r="170" fill="none" stroke-dasharray="3, 6"/>
      <circle cx="200" cy="200" r="135" fill="none"/>
      <circle cx="200" cy="200" r="95" fill="none" stroke-dasharray="8, 4"/>
      <circle cx="200" cy="200" r="55" fill="none"/>
    </g>

    <!-- Outer Ring with Tech Ticks -->
    <circle cx="200" cy="200" r="182" fill="none" stroke="#ff7700" stroke-width="2.5" opacity="0.7" filter="url(#subtleGlow)"/>
    
    <!-- Outer Arc segments -->
    <path d="M 200 12 A 188 188 0 0 1 388 200" fill="none" stroke="#ffaa00" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>
    <path d="M 200 388 A 188 188 0 0 1 12 200" fill="none" stroke="#ffaa00" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>

    <!-- Circular Tech Ticks around 182 radius -->
    <g stroke="#ffaa00" stroke-width="1.8" opacity="0.8">
      <line x1="200" y1="12" x2="200" y2="24"/>
      <line x1="200" y1="376" x2="200" y2="388"/>
      <line x1="12" y1="200" x2="24" y2="200"/>
      <line x1="376" y1="200" x2="388" y2="200"/>
      
      <line x1="67" y1="67" x2="76" y2="76"/>
      <line x1="333" y1="67" x2="324" y2="76"/>
      <line x1="67" y1="333" x2="76" y2="324"/>
      <line x1="333" y1="333" x2="324" y2="324"/>
    </g>

    <!-- Rotating Radar Sector Blade -->
    <path d="M 200 200 L 320 80 A 170 170 0 0 0 200 30 Z" fill="#ff7700" opacity="0.12"/>

    <!-- Inner Data Ring -->
    <circle cx="200" cy="200" r="135" fill="none" stroke="#ff7700" stroke-width="1.5" stroke-dasharray="14, 5, 2, 5" opacity="0.8"/>
    <circle cx="200" cy="200" r="115" fill="none" stroke="#ffaa00" stroke-width="1" opacity="0.5"/>

    <!-- Hexagonal or Octagonal Tech Brackets in Center -->
    <polygon points="200,105 267,133 295,200 267,267 200,295 133,267 105,200 133,133" 
             fill="none" stroke="#ff7700" stroke-width="1.5" stroke-dasharray="12, 6" opacity="0.65"/>

    <!-- Secondary Node Points -->
    <circle cx="267" cy="133" r="3.5" fill="#ffaa00" filter="url(#subtleGlow)"/>
    <circle cx="295" cy="200" r="3.5" fill="#ffaa00" filter="url(#subtleGlow)"/>
    <circle cx="267" cy="267" r="3.5" fill="#ffaa00" filter="url(#subtleGlow)"/>
    <circle cx="133" cy="267" r="3.5" fill="#ffaa00" filter="url(#subtleGlow)"/>
    <circle cx="105" cy="200" r="3.5" fill="#ffaa00" filter="url(#subtleGlow)"/>
    <circle cx="133" cy="133" r="3.5" fill="#ffaa00" filter="url(#subtleGlow)"/>

    <!-- High-Tech Central Crosshair -->
    <g stroke="#ffaa00" stroke-width="2" filter="url(#glow)">
      <!-- Reticle notches -->
      <line x1="165" y1="200" x2="185" y2="200"/>
      <line x1="215" y1="200" x2="235" y2="200"/>
      <line x1="200" y1="165" x2="200" y2="185"/>
      <line x1="200" y1="215" x2="200" y2="235"/>
      
      <!-- Target Corner brackets -->
      <path d="M 175 185 L 175 175 L 185 175" fill="none" stroke-width="2.5"/>
      <path d="M 225 185 L 225 175 L 215 175" fill="none" stroke-width="2.5"/>
      <path d="M 175 215 L 175 225 L 185 225" fill="none" stroke-width="2.5"/>
      <path d="M 225 215 L 225 225 L 215 225" fill="none" stroke-width="2.5"/>
    </g>

    <!-- Glowing Central Core / Radar Pulse Node -->
    <circle cx="200" cy="200" r="28" fill="url(#coreGlow)"/>
    <circle cx="200" cy="200" r="7" fill="#ffffff" filter="url(#glow)"/>
    <circle cx="200" cy="200" r="3" fill="#ffaa00"/>

    <!-- Tech Typography / HUD Micro-labels -->
    <text x="200" y="78" text-anchor="middle" fill="#ffaa00" font-size="10" font-weight="bold" letter-spacing="3" opacity="0.9">SYSTEM // SCANNER</text>
    <text x="200" y="328" text-anchor="middle" fill="#ff7700" font-size="9" font-weight="bold" letter-spacing="2.5" opacity="0.8">RADAR LOCK: ACTIVE</text>
    <text x="50" y="204" text-anchor="middle" fill="#ffaa00" font-size="8" font-weight="bold" opacity="0.6">SEC.04</text>
    <text x="350" y="204" text-anchor="middle" fill="#ffaa00" font-size="8" font-weight="bold" opacity="0.6">808.OPS</text>

    <!-- Detailed Tech Sub-grid Dots -->
    <g fill="#ffaa00" opacity="0.35">
      <circle cx="100" cy="100" r="1.5"/><circle cx="300" cy="100" r="1.5"/>
      <circle cx="100" cy="300" r="1.5"/><circle cx="300" cy="300" r="1.5"/>
      <circle cx="150" cy="150" r="1.2"/><circle cx="250" cy="150" r="1.2"/>
      <circle cx="150" cy="250" r="1.2"/><circle cx="250" cy="250" r="1.2"/>
      <circle cx="80" cy="200" r="1.5"/><circle cx="320" cy="200" r="1.5"/>
      <circle cx="200" cy="80" r="1.5"/><circle cx="200" cy="320" r="1.5"/>
    </g>

    <!-- Sub-millimeter Radar Scale Ticks -->
    <g stroke="#ff7700" stroke-width="1" opacity="0.5">
      <line x1="190" y1="135" x2="210" y2="135"/>
      <line x1="190" y1="265" x2="210" y2="265"/>
      <line x1="135" y1="190" x2="135" y2="210"/>
      <line x1="265" y1="190" x2="265" y2="210"/>
    </g>

    <!-- HUD Telemetry telemetry micro-strings -->
    <text x="35" y="45" fill="#ff7700" font-size="7" font-family="monospace" opacity="0.6">FRQ: 4.88 GHz</text>
    <text x="35" y="57" fill="#ffaa00" font-size="7" font-family="monospace" opacity="0.6">AZM: 084.22°</text>
    <text x="365" y="45" text-anchor="end" fill="#ff7700" font-size="7" font-family="monospace" opacity="0.6">TRK // ENCRYPT</text>
    <text x="365" y="57" text-anchor="end" fill="#ffaa00" font-size="7" font-family="monospace" opacity="0.6">AUTH: ROOT</text>
    <text x="35" y="365" fill="#ff7700" font-size="7" font-family="monospace" opacity="0.6">SIG: 99.8%</text>
    <text x="365" y="365" text-anchor="end" fill="#ffaa00" font-size="7" font-family="monospace" opacity="0.6">LAT: 4.2ms</text>
  </svg>
</body>
</html>
`;

  await page.setContent(htmlContent);
  await page.waitForTimeout(300);

  // Take screenshot with quality 98 (creates crisp JPG between 50KB and 120KB)
  const buffer = await page.screenshot({
    type: 'jpeg',
    quality: 98,
  });

  await browser.close();

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  const sizeBytes = buffer.length;

  return { sizeBytes, path: outputPath };
}

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PINS_DIR = path.resolve(__dirname, '../scratch/pins');
if (!fs.existsSync(PINS_DIR)) fs.mkdirSync(PINS_DIR, { recursive: true });

const PINS = [
  {
    id: 'pin_1_whatsapp',
    imageSrc: 'blog/public/images/posts/the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy.webp',
    title: 'THE 48-HOUR WHATSAPP MOVE',
    subtitle: 'Anatomy of a Crypto Romance Scam & Dating Funnel',
    category: 'SAFETY DOSSIER // DECLASSIFIED'
  },
  {
    id: 'pin_2_tinder_elo',
    imageSrc: 'blog/public/images/posts/tinder-elo-algorithm-2026-ranking-reset-the-truth-the-myths-and-t.webp',
    title: 'TINDER ELO ALGORITHM 2026',
    subtitle: 'Ranking Reset, Dynamic Visibility & Shadowban Truth',
    category: 'ALGORITHM MECHANICS'
  },
  {
    id: 'pin_3_pig_butchering',
    imageSrc: 'blog/public/images/posts/pig-butchering-scam-dating-apps-2026s-ultimate-survival-guide.webp',
    title: 'PIG BUTCHERING SCAMS EXPOSED',
    subtitle: '5 Non-Negotiable Signs of Crypto Romance Fraud',
    category: 'CRIMINAL INVESTIGATION'
  },
  {
    id: 'pin_4_ai_catfishing',
    imageSrc: 'blog/public/images/posts/ai-catfishing-on-hinge-how-to-spot-deepfake-photos-protect-your-h.webp',
    title: 'AI CATFISHING ON HINGE',
    subtitle: 'Spot Deepfake Photos & Bot Profiles in 30 Seconds',
    category: 'AI FORENSICS LAB'
  },
  {
    id: 'pin_5_photo_order',
    imageSrc: 'blog/public/images/posts/optimal-photo-order-dating-apps-the-psychological-anchor-rule.webp',
    title: 'OPTIMAL PHOTO ORDER RULE',
    subtitle: 'Why Your 3rd Photo Controls 70% of Match Decisions',
    category: 'BEHAVIORAL PSYCHOLOGY'
  }
];

async function generateVerticalPin(pin) {
  const src = path.resolve(__dirname, '..', pin.imageSrc);
  const dest = path.join(PINS_DIR, `${pin.id}_1000x1500.png`);

  if (!fs.existsSync(src)) {
    console.warn('Source image missing:', src);
    return;
  }

  // 1. Resize cover image to 920 width
  const coverResized = await sharp(src)
    .resize(920, 560, { fit: 'cover' })
    .png()
    .toBuffer();

  const safeCategory = (pin.category || '').replace(/&/g, 'and');
  const safeTitle = (pin.title || '').replace(/&/g, 'and');
  const safeSubtitle = (pin.subtitle || '').replace(/&/g, 'and');

  // 2. Create SVG overlay for header and footer text
  const svgOverlay = `
    <svg width="1000" height="1500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0a0f1d"/>
          <stop offset="50%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1000" height="1500" fill="url(#bgGrad)"/>
      
      <!-- Top Border Accent -->
      <rect x="0" y="0" width="1000" height="8" fill="url(#goldAccent)"/>

      <!-- Header Label -->
      <rect x="40" y="45" width="380" height="36" rx="4" fill="#1e293b"/>
      <text x="55" y="69" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#f59e0b" letter-spacing="2">
        ${safeCategory}
      </text>

      <!-- FlirtCheck Watermark -->
      <text x="960" y="70" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="end" letter-spacing="1">
        FLIRTCHECK.SITE
      </text>

      <!-- Main Headline Box -->
      <text x="500" y="760" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
        ${safeTitle}
      </text>

      <!-- Subtitle -->
      <text x="500" y="820" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#cbd5e1" text-anchor="middle">
        ${safeSubtitle}
      </text>

      <!-- Divider line -->
      <line x1="100" y1="870" x2="900" y2="870" stroke="#334155" stroke-width="2"/>

      <!-- Key Bullet Points Box -->
      <rect x="60" y="910" width="880" height="380" rx="16" fill="#1e293b" fill-opacity="0.7" stroke="#334155" stroke-width="1.5"/>

      <circle cx="110" cy="980" r="16" fill="#ef4444"/>
      <text x="110" y="986" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">!</text>
      <text x="150" y="986" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#f8fafc">
        Forensic breakdown of modern algorithm tricks
      </text>

      <circle cx="110" cy="1060" r="16" fill="#f59e0b"/>
      <text x="110" y="1066" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">✓</text>
      <text x="150" y="1066" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#f8fafc">
        Real case studies and chat logs analyzed
      </text>

      <circle cx="110" cy="1140" r="16" fill="#10b981"/>
      <text x="110" y="1146" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">★</text>
      <text x="150" y="1146" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#f8fafc">
        Full technical safety blueprint inside
      </text>

      <circle cx="110" cy="1220" r="16" fill="#3b82f6"/>
      <text x="110" y="1226" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">➔</text>
      <text x="150" y="1226" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#f8fafc">
        Read free dossier at flirtcheck.site
      </text>

      <!-- Bottom Call To Action Button -->
      <rect x="250" y="1340" width="500" height="72" rx="36" fill="#e11d48"/>
      <text x="500" y="1385" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
        READ INVESTIGATION ➔
      </text>
    </svg>
  `;

  // 3. Composite everything onto 1000x1500
  await sharp({
    create: {
      width: 1000,
      height: 1500,
      channels: 4,
      background: { r: 10, g: 15, b: 29, alpha: 1 }
    }
  })
    .composite([
      { input: Buffer.from(svgOverlay), top: 0, left: 0 },
      { input: coverResized, top: 120, left: 40 }
    ])
    .png()
    .toFile(dest);

  console.log(`✅ Generated premium 1000x1500 Pin: ${dest}`);
  return dest;
}

async function main() {
  console.log('🎨 Generating 5 Premium 2:3 Vertical Pins (1000x1500)...');
  for (const p of PINS) {
    await generateVerticalPin(p);
  }
  console.log('🎉 All 5 pins generated in standard Pinterest 2:3 ratio!');
}

main().catch(console.error);

const fs = require('fs');

function auditContrastInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace text-slate-400 with text-slate-600 dark:text-slate-300 for readable contrast
  // Except where it's explicitly an icon or border
  const replacements = [
    { from: /text-slate-400 dark:text-slate-500/g, to: 'text-slate-600 dark:text-slate-400' },
    { from: /text-slate-400 dark:text-slate-400/g, to: 'text-slate-600 dark:text-slate-300' },
    { from: /text-slate-400/g, to: 'text-slate-600 dark:text-slate-300' },
    { from: /text-gray-400/g, to: 'text-gray-600 dark:text-gray-300' }
  ];

  for (const r of replacements) {
    if (r.from.test(content)) {
      content = content.replace(r.from, r.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched contrast in:', filePath);
  }
}

const targetFiles = [
  'deals-portal/src/pages/index.astro',
  'deals-portal/src/components/Header.astro',
  'deals-portal/src/components/Footer.astro',
  'deals-portal/src/components/PartnerBannerRotator.astro',
  'deals-portal/src/components/CuratedSpotlightSection.astro'
];

targetFiles.forEach(f => {
  if (fs.existsSync(f)) auditContrastInFile(f);
});


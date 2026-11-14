const fs = require('fs');
const filePath = 'deals-portal/src/components/PartnerBannerRotator.astro';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<script\b[^>]*>[\s\S]*?<\/script>/i;
const newScript = `<script defer src="/scripts/partner-rotator-interactive.js"></script>`;

if (regex.test(content)) {
  content = content.replace(regex, newScript);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Replaced PartnerBannerRotator script with deferred external script');
} else {
  console.error('❌ Script not found in PartnerBannerRotator.astro');
}


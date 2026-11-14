const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/PartnerBannerRotator.astro', 'utf8');

let updated = content;
// Let's slice leaderboards to 6 items
updated = updated.replace(
  `const { leaderboards = [], rectangles = [] } = rotatorData;`,
  `const rawLeaderboards = rotatorData.leaderboards || [];
const leaderboards = rawLeaderboards.slice(0, 6);
const rectangles = (rotatorData.rectangles || []).slice(0, 6);`
);

fs.writeFileSync('deals-portal/src/components/PartnerBannerRotator.astro', updated, 'utf8');
console.log('PartnerBannerRotator.astro updated: leaderboards sliced to 6 items');


const fs = require('fs');

const FILE_PATH = '/var/www/affiliate/scripts/autonomous_product_sync.cjs';
let content = fs.readFileSync(FILE_PATH, 'utf8');

const expandedPartners = `const TARGET_PARTNERS = [
  { id: '7709572', slug: '945industries', name: '945 Industries', defaultBadge: 'Best Seller' },
  { id: '7958531', slug: 'whokeys', name: 'Whokeys', defaultBadge: 'Top Rated' },
  { id: '7997220', slug: 'carpuride', name: 'Carpuride', defaultBadge: 'Verified Hardware' },
  { id: '7971085', slug: 'pure-genius-protein', name: 'Pure Genius Protein', defaultBadge: 'Staff Pick' },
  { id: '8023201', slug: 'creality', name: 'Creality', defaultBadge: '3D Maker Deal' },
  { id: '4837117', slug: 'nordvpn-standard-term', name: 'NordVPN', defaultBadge: 'Cyber Deal' },
  { id: '5357356', slug: 'rexing', name: 'Rexing Dash Cams', defaultBadge: '4K Tech' },
  { id: '5725175', slug: 'braceability', name: 'BraceAbility', defaultBadge: 'Health & Care' },
  { id: '6260179', slug: 'abelssoft', name: 'Abelssoft', defaultBadge: 'Security Utility' },
  { id: '7961854', slug: 'kincmo', name: 'Kincmo Smart Home', defaultBadge: 'Smart Automation' },
  { id: '8004940', slug: 'fufugaga', name: 'FUFUGAGA Furniture', defaultBadge: 'Home Design' },
  { id: '8022425', slug: 'kaiya-baby', name: 'Kaiya Baby', defaultBadge: 'Organic Essentials' },
  { id: '8027729', slug: 'homsee', name: 'Homsee Luxury Living', defaultBadge: 'Modern Interior' }
];`;

content = content.replace(/const TARGET_PARTNERS = \[[\s\S]*?\];/, expandedPartners);

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log('Successfully expanded TARGET_PARTNERS in autonomous_product_sync.cjs');


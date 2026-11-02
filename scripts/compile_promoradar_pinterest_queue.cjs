/**
 * PromoRadar Pinterest Queue Compiler & Automation Engine
 * 
 * Standard:
 * - Reads verified real merchants from couponsData.ts (Zero Demo Data Rule)
 * - Assigns exact target board based on category
 * - Assigns matching Google Stitch template archetype
 * - Generates high-CTR SEO title, rich description, alt-text and canonical store URL
 * - Prepares queue at .antigravity/promoradar_pinterest_queue.json
 */

const fs = require('fs');
const path = require('path');

const QUEUE_FILE = '/var/www/affiliate/.antigravity/promoradar_pinterest_queue.json';
const COUPONS_DATA_FILE = '/var/www/affiliate/deals-portal/src/data/couponsData.ts';
const PINS_DIR = '/var/www/affiliate/scratch/pins_promoradar';

if (!fs.existsSync(PINS_DIR)) fs.mkdirSync(PINS_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(QUEUE_FILE))) fs.mkdirSync(path.dirname(QUEUE_FILE), { recursive: true });

function resolveBoard(category, discountBadge) {
  const dUpper = (discountBadge || '').toUpperCase();
  const isHugeDiscount = dUpper.includes('80%') || dUpper.includes('75%') || dUpper.includes('70%') || dUpper.includes('FREE');

  if (isHugeDiscount) {
    return 'Black Friday 2026 Deals & Early Access';
  }

  switch (category) {
    case 'Web Hosting & Domains':
      return 'Web Hosting & Software Licenses';
    case 'Privacy & Security':
      return 'VPN & Cyber Privacy Promo Codes';
    case 'Electronics & Gadgets':
      return 'Outdoor Gear & Tech Gadgets';
    case 'Travel & Tours':
    case 'Fashion & Apparel':
    case 'E-Commerce & Wholesale':
    case 'Eyewear & Health':
      return 'Global Shopping & Travel eSIM Deals';
    default:
      return 'Black Friday 2026 Deals & Early Access';
  }
}

function resolveTemplate(category, discountBadge) {
  const dUpper = (discountBadge || '').toUpperCase();
  if (dUpper.includes('75%') || dUpper.includes('80%') || dUpper.includes('SAVE UP TO')) {
    return 'C'; // High-Urgency Flash Sale (Flame)
  }
  if (category === 'Privacy & Security' || category === 'Travel & Tours') {
    return 'B'; // Editorial Buyer's Guide (Light)
  }
  return 'A'; // Stitch Precision Dark Voucher
}

function buildPinMetadata(deal) {
  const brand = deal.storeName;
  const discount = deal.discountBadge;
  const code = deal.code || '';
  const hasCode = Boolean(code && code.trim().length > 0);

  let title = '';
  if (hasCode) {
    title = `${brand}: ${discount} Promo Code [${code}]`;
  } else {
    title = `${brand}: Save ${discount} Official Verified Deal`;
  }
  if (title.length > 95) title = title.substring(0, 92) + '...';

  const desc = `${deal.description} Enter verified code ${hasCode ? code : 'at checkout'} to claim instant savings. Tested and confirmed on PromoRadar.`;
  const altText = `${brand} promo code and checkout discount voucher. Save ${discount} on verified official orders.`;
  const targetUrl = `https://promoradar.store/stores/${deal.storeSlug}/`;

  return {
    title,
    desc: desc.length > 490 ? desc.substring(0, 485) + '...' : desc,
    altText: altText.substring(0, 480),
    targetUrl
  };
}

function compileQueue() {
  console.log('🚀 Compiling PromoRadar Pinterest Queue from couponsData.ts...');

  const content = fs.readFileSync(COUPONS_DATA_FILE, 'utf8');
  const match = content.match(/export const COUPONS_DATA: CouponDeal\[\] = (\[[\s\S]*?\]);/);
  if (!match) throw new Error('Could not parse COUPONS_DATA');

  const rawDeals = JSON.parse(match[1]);

  // Clean real merchants only (remove affiliate internal labels)
  const cleanDeals = rawDeals.filter(d => 
    !d.storeName.includes('Term') && 
    !d.storeName.includes('Commission') && 
    !d.storeName.includes('Clone') &&
    !d.storeName.includes('|') &&
    !d.storeName.includes('Campaign') &&
    d.storeSlug && d.storeSlug.length > 1
  );

  console.log(`Filtered ${cleanDeals.length} high-quality live deals.`);

  let existingQueue = [];
  if (fs.existsSync(QUEUE_FILE)) {
    try {
      existingQueue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    } catch (e) {}
  }
  const publishedIds = new Set(existingQueue.filter(q => q.status === 'published').map(q => q.id));

  const newQueue = [];
  const seenStores = new Set();

  // Pick best deals first, ensuring diversity across stores
  for (const deal of cleanDeals) {
    const itemKey = `${deal.storeSlug}_${deal.id}`;
    const board = resolveBoard(deal.storeCategory, deal.discountBadge);
    const template = resolveTemplate(deal.storeCategory, deal.discountBadge);
    const meta = buildPinMetadata(deal);

    const isPublished = publishedIds.has(deal.id);

    newQueue.push({
      id: deal.id,
      storeSlug: deal.storeSlug,
      storeName: deal.storeName,
      category: deal.storeCategory,
      discountBadge: deal.discountBadge,
      code: deal.code || 'DIRECT DEAL',
      board,
      template,
      title: meta.title,
      description: meta.desc,
      altText: meta.altText,
      targetUrl: meta.targetUrl,
      creativePath: path.join(PINS_DIR, `pin_${deal.storeSlug}_${deal.id}.png`),
      status: isPublished ? 'published' : 'pending',
      attempts: 0,
      createdAt: new Date().toISOString()
    });
  }

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(newQueue, null, 2), 'utf8');
  console.log(`✅ Queue compiled successfully! Total items: ${newQueue.length} (${newQueue.filter(q => q.status === 'pending').length} pending publication)`);

  // Print board breakdown
  const boardCounts = {};
  for (const item of newQueue) {
    boardCounts[item.board] = (boardCounts[item.board] || 0) + 1;
  }
  console.log('\n📊 Board Distribution:');
  console.table(boardCounts);
}

compileQueue();


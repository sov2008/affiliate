const fs = require('fs');
const banners = require('../deals-portal/src/data/homeRotatorBanners.json');

const rectangles = banners.rectangles || [];
console.log('Total rectangles in homeRotatorBanners.json:', rectangles.length);

const seenImages = new Set();
const seenIds = new Set();
const seenPartners = new Set();
const uniqueBanners = [];

rectangles.forEach(b => {
  const img = b.src || b.imageUrl || b.image;
  const id = b.id || b.name || img;
  if (!seenImages.has(img) && !seenIds.has(id)) {
    seenImages.add(img);
    seenIds.add(id);
    uniqueBanners.push(b);
  }
});

console.log('Unique banners by image and id:', uniqueBanners.length);

// Also check unique partners
const onePerPartner = [];
rectangles.forEach(b => {
  const p = b.partnerSlug || b.brand;
  const img = b.src || b.imageUrl || b.image;
  if (!seenPartners.has(p) && !seenImages.has(img)) {
    seenPartners.add(p);
    onePerPartner.push(b);
  }
});

console.log('Unique banners with 1 per partner:', onePerPartner.length);


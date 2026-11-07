const fs = require('fs');
const banners = require('../deals-portal/src/data/homeRotatorBanners.json');
const rectangles = banners.rectangles || [];

const seenImg = new Set();
const seenIds = new Set();
const uniqueBanners = [];

rectangles.forEach(b => {
  const img = b.src || b.imageUrl || b.image;
  const id = b.id || b.name || img;
  if (!seenImg.has(img) && !seenIds.has(id)) {
    seenImg.add(img);
    seenIds.add(id);
    uniqueBanners.push(b);
  }
});

console.log('Unique banners available:', uniqueBanners.length);
// Count how many partner stores
const partnerCounts = {};
uniqueBanners.forEach(b => {
  partnerCounts[b.brand] = (partnerCounts[b.brand] || 0) + 1;
});
console.log('Top banner brands:', Object.entries(partnerCounts).sort((a,b) => b[1] - a[1]).slice(0, 10));


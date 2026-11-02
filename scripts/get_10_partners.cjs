const fs = require('fs');

const queue = JSON.parse(fs.readFileSync('/var/www/affiliate/.antigravity/promoradar_pinterest_queue.json', 'utf8'));
const stores = [];

for (const item of queue) {
  if (!stores.find(s => s.storeName === item.storeName) && item.code && item.storeName) {
    stores.push({
      storeName: item.storeName,
      storeSlug: item.storeSlug,
      discountBadge: item.discountBadge,
      code: item.code,
      board: item.board,
      category: item.category,
      description: item.description,
      title: item.title
    });
  }
  if (stores.length >= 10) break;
}

console.log(JSON.stringify(stores, null, 2));


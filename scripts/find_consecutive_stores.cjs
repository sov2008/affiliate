const fs = require('fs');

const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const deals = [];
const re = /"id":\s*"([^"]+)"[\s\S]*?"storeName":\s*"([^"]+)"/g;
let m;
while ((m = re.exec(content)) !== null) {
  deals.push({ id: m[1], store: m[2] });
}

// Find consecutive identical stores in result of diversify
const buckets = new Map();
for (const d of deals) {
  const key = d.store.toLowerCase();
  if (!buckets.has(key)) buckets.set(key, []);
  buckets.get(key).push(d);
}

const result = [];
let added = true;
while (added) {
  added = false;
  for (const [key, list] of buckets.entries()) {
    if (list.length > 0) {
      result.push(list.shift());
      added = true;
    }
  }
}

// Count runs of consecutive identical stores
let consecutiveRuns = [];
let currentRun = { store: result[0].store, count: 1, startIndex: 0 };

for (let i = 1; i < result.length; i++) {
  if (result[i].store === currentRun.store) {
    currentRun.count++;
  } else {
    if (currentRun.count > 1) {
      consecutiveRuns.push({ ...currentRun });
    }
    currentRun = { store: result[i].store, count: 1, startIndex: i };
  }
}
if (currentRun.count > 1) consecutiveRuns.push(currentRun);

console.log('Consecutive identical stores runs count:', consecutiveRuns.length);
consecutiveRuns.forEach(r => {
  console.log(`- Store "${r.store}" repeated ${r.count} times in a row starting at index ${r.startIndex}`);
});


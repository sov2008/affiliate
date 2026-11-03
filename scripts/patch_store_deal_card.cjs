const fs = require('fs');
const path = require('path');

const storeFile = path.join(__dirname, '../deals-portal/src/pages/stores/[store].astro');
let content = fs.readFileSync(storeFile, 'utf8');

// 1. Add data-deal-id={deal.id} to store-deal-card article
const targetArticle = 'class={`store-deal-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 card-hover shadow-sm flex flex-col justify-between dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${isTopDeal ? \'ring-1 ring-amber-400/30\' : \'\'}`}\r\n                    data-deal-type={isCode ? \'code\' : \'deal\'}';

const replacementArticle = 'class={`store-deal-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 card-hover shadow-sm flex flex-col justify-between dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${isTopDeal ? \'ring-1 ring-amber-400/30\' : \'\'}`}\r\n                    data-deal-id={deal.id}\r\n                    data-deal-type={isCode ? \'code\' : \'deal\'}';

if (content.includes('data-deal-id={deal.id}')) {
  console.log('data-deal-id already present in [store].astro');
} else if (content.includes('data-deal-type={isCode ? \'code\' : \'deal\'}')) {
  content = content.replace('data-deal-type={isCode ? \'code\' : \'deal\'}', 'data-deal-id={deal.id}\r\n                    data-deal-type={isCode ? \'code\' : \'deal\'}');
  fs.writeFileSync(storeFile, content, 'utf8');
  console.log('Successfully injected data-deal-id into [store].astro');
} else {
  console.error('Could not find data-deal-type in [store].astro');
}


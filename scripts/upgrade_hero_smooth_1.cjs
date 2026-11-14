const fs = require('fs');
const filePath = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Upgrade heroDealTimerBar to use transform: scaleX(0) instead of width
const oldBarMarkup = `<div id="heroDealTimerBar" class="h-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-500 w-0 transition-all duration-300 rounded-full"></div>`;
const newBarMarkup = `<div id="heroDealTimerBar" class="h-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-500 w-full origin-left rounded-full" style="transform: scaleX(0); will-change: transform;"></div>`;

if (content.includes(oldBarMarkup)) {
  content = content.replace(oldBarMarkup, newBarMarkup);
  console.log('Replaced timerBar markup');
} else {
  console.log('timerBar markup not matched directly, checking...');
}

// 2. Add will-change and transform3d to heroDealDynamicContent
content = content.replace(
  'id="heroDealDynamicContent" class="flex-1 flex flex-col justify-between space-y-3 transition-all duration-300"',
  'id="heroDealDynamicContent" class="flex-1 flex flex-col justify-between space-y-3 transition-all duration-300" style="will-change: transform, opacity; transform: translate3d(0, 0, 0); backface-visibility: hidden;"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Saved index.astro step 1');


import { topicEngine } from '../core/src/services/topicEngine.service.js';

console.log('🧪 Testing TopicEngineService and Category Deficit Intelligence...\n');

const stats = topicEngine.getCategoryStats();
console.log('1. Current Category Distribution:');
console.table(stats.distribution);

console.log('\n2. Category Deficits (Highest deficit = Top priority for next articles):');
stats.deficits.forEach((d, idx) => {
  const bar = d.deficitScore > 0 ? '🟢 NEED MORE' : '⚪ SATURATED';
  console.log(`  ${idx + 1}. [${d.category.padEnd(18)}] Count: ${d.count} | Deficit Score: ${(d.deficitScore * 100).toFixed(1)}% | ${bar}`);
});

console.log('\n3. Next Recommended 5 Topics for Maximum Traffic & Deficit Filling:');
const nextBatch = topicEngine.getBalancedNextTopicBatch(5);
nextBatch.forEach((t, idx) => {
  console.log(`\n  📌 TOPIC ${idx + 1}:`);
  console.log(`     Title:    ${t.topic}`);
  console.log(`     Category: ${t.category}`);
  console.log(`     Keyword:  "${t.keyword}"`);
  console.log(`     Tier:     ${t.searchVolumeTier}`);
  console.log(`     Intent:   ${t.intent}`);
  console.log(`     Motto:    "${t.motto}"`);
  console.log(`     LSI:      ${t.seoKeywords.join(', ')}`);
});

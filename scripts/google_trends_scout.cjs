/**
 * Google Trends Intelligence Engine for PromoRadar & FlirtCheck
 * Automatically mines trending queries, breakout keywords and high-intent article topics.
 */

const googleTrends = require('google-trends-api');
const fs = require('fs');
const path = require('path');

// Seeds configuration for both projects across priority GEOs
const TREND_SEEDS = {
  promoradar: {
    name: 'PromoRadar (Deals & Coupons Hub)',
    geos: ['US', 'GB', 'UA', 'DE'],
    keywords: [
      'black friday deals',
      'promo code',
      'discount code',
      'coupon voucher',
      'cyber monday deals',
      'vpn discount',
      'travel promo code'
    ],
    niche: 'e-commerce, coupons, seasonal shopping, tech discounts'
  },
  flirtcheck: {
    name: 'FlirtCheck (Relationship Intelligence & Dating Blog)',
    geos: ['US', 'GB', 'UA'],
    keywords: [
      'online dating red flags',
      'first date questions',
      'dating app fatigue',
      'catfishing detection',
      'hinge profile tips',
      'slow dating'
    ],
    niche: 'dating psychology, safety, profile optimization, relationship advice'
  }
};

/**
 * Fetch rising and top queries for a keyword and geo
 */
async function fetchKeywordTrends(keyword, geo, timeframeDays = 30) {
  try {
    const startTime = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
    const res = await googleTrends.relatedQueries({
      keyword,
      geo,
      startTime
    });

    const data = JSON.parse(res);
    const top = (data.default?.rankedList?.[0]?.rankedKeyword || []).map(k => ({
      query: k.query,
      value: k.value,
      type: 'TOP'
    }));

    const rising = (data.default?.rankedList?.[1]?.rankedKeyword || []).map(k => ({
      query: k.query,
      value: k.value,
      formattedValue: k.formattedValue || 'Breakout',
      type: 'RISING'
    }));

    return { keyword, geo, top, rising };
  } catch (err) {
    return { keyword, geo, top: [], rising: [], error: err.message };
  }
}

/**
 * Generate actionable article topic ideas from mined trends
 */
function synthesizeTopicIdeas(projectKey, trendsData) {
  const allRising = [];
  const allTop = [];

  trendsData.forEach(item => {
    item.rising.forEach(r => allRising.push({ ...r, seed: item.keyword, geo: item.geo }));
    item.top.forEach(t => allTop.push({ ...t, seed: item.keyword, geo: item.geo }));
  });

  // Sort rising queries by growth intensity
  allRising.sort((a, b) => (b.value || 0) - (a.value || 0));

  const uniqueQueries = new Set();
  const curatedTopics = [];

  for (const item of allRising) {
    const q = item.query.trim().toLowerCase();
    if (uniqueQueries.has(q) || q.length < 5) continue;
    uniqueQueries.add(q);

    let suggestedTitle = '';
    let targetSite = projectKey === 'promoradar' ? 'promoradar.store' : 'flirtcheck.site';
    let intent = '';

    if (projectKey === 'promoradar') {
      const isBlackFriday = q.includes('black friday') || q.includes('cyber');
      const brandMatch = q.replace(/promo code|discount code|coupon|deals|voucher/gi, '').trim();
      const capBrand = brandMatch.charAt(0).toUpperCase() + brandMatch.slice(1);

      if (isBlackFriday) {
        suggestedTitle = `Black Friday Deals 2026: Verified ${capBrand || 'Holiday'} Discounts & Promo Codes`;
        intent = 'Seasonal High-EPC Conversion';
      } else {
        suggestedTitle = `${capBrand || item.seed} Promo Codes & Tested Savings: Complete Buyer Guide`;
        intent = 'Direct Affiliate Purchase Intent';
      }
    } else {
      suggestedTitle = `Forensic Guide: How ${item.query} Shapes Modern Dating Psychology in 2026`;
      intent = 'Information / Lead Nurturing & Affiliate Smartlink';
    }

    curatedTopics.push({
      trendingQuery: item.query,
      growth: item.formattedValue || `+${item.value}%`,
      geo: item.geo,
      seedKeyword: item.seed,
      suggestedTitle,
      targetSite,
      intent
    });

    if (curatedTopics.length >= 12) break;
  }

  return curatedTopics;
}

/**
 * Main scout engine execution
 */
async function runTrendsScout(specificProject = null) {
  console.log('🚀 [Google Trends Scout] Starting automated trend mining...');
  const startTime = Date.now();

  const projectsToScan = specificProject ? [specificProject] : Object.keys(TREND_SEEDS);
  const fullReport = {
    generatedAt: new Date().toISOString(),
    projects: {}
  };

  for (const pKey of projectsToScan) {
    const cfg = TREND_SEEDS[pKey];
    console.log(`\n🔎 Mining trends for ${cfg.name}...`);
    const projectResults = [];

    // Query top 3 seeds across top 2 priority geos to respect rate limits
    const targetGeos = cfg.geos.slice(0, 2);
    const targetSeeds = cfg.keywords.slice(0, 4);

    for (const geo of targetGeos) {
      for (const kw of targetSeeds) {
        process.stdout.write(`   Scanning [${geo}] "${kw}"... `);
        const res = await fetchKeywordTrends(kw, geo, 30);
        projectResults.push(res);
        console.log(`✓ (${res.rising.length} rising, ${res.top.length} top)`);
        // Gentle delay to prevent Google Trends rate limiting
        await new Promise(r => setTimeout(r, 600));
      }
    }

    const topicIdeas = synthesizeTopicIdeas(pKey, projectResults);
    fullReport.projects[pKey] = {
      project: cfg.name,
      topicsCount: topicIdeas.length,
      topics: topicIdeas
    };
  }

  // Save report to artifacts and data folder
  const outPath = path.resolve(__dirname, '../data/trending_article_topics.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(fullReport, null, 2), 'utf8');

  console.log(`\n✅ [Google Trends Scout] Finished in ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
  console.log(`📁 Report saved to: ${outPath}`);

  return fullReport;
}

if (require.main === module) {
  const target = process.argv[2] || null;
  runTrendsScout(target).then(report => {
    console.log('\n================ TOP SUGGESTED ARTICLE TOPICS ================');
    for (const [key, data] of Object.entries(report.projects)) {
      console.log(`\n📌 ${data.project}:`);
      data.topics.slice(0, 5).forEach((t, i) => {
        console.log(`   ${i + 1}. [${t.geo}] "${t.trendingQuery}" (${t.growth})`);
        console.log(`      ↳ Заголовок: "${t.suggestedTitle}"`);
        console.log(`      ↳ Интент: ${t.intent}`);
      });
    }
  }).catch(err => {
    console.error('Fatal Scout Error:', err);
    process.exit(1);
  });
}

module.exports = { runTrendsScout, fetchKeywordTrends, TREND_SEEDS };


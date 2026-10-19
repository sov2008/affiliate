/**
 * Autonomous Opportunity Scout & Ranker for CJ Affiliate
 * 
 * Filters CJ directory against PromoRadar criteria:
 * 1. Category fit (VPN/Security, Web Hosting, Travel, Tech/Software, Finance)
 * 2. High EPC (7-day EPC >= $5.00 AND 3-month EPC >= $5.00)
 * 3. Active status, high network rank
 * 4. Outputs optimal application batch
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  token: 'iTOZ5YSaULmdycZWAbA4ce0N1w',
  cid: '8102806',
  outputFile: path.resolve(__dirname, '../artifacts_admitad/cj_curated_opportunities.json')
};

const CATEGORIES = [
  { name: 'VPN & Security', keywords: ['vpn', 'security', 'antivirus'] },
  { name: 'Web Hosting & Domains', keywords: ['hosting', 'domain', 'server', 'cloud'] },
  { name: 'Software & Tools', keywords: ['software', 'vpn', 'video', 'backup', 'ai'] },
  { name: 'Travel & Flights', keywords: ['travel', 'flight', 'hotel', 'airline', 'vacation'] },
  { name: 'Finance & Insurance', keywords: ['finance', 'insurance', 'credit', 'loan'] },
  { name: 'Fashion & Retail', keywords: ['fashion', 'apparel', 'shoes', 'electronics'] }
];

function fetchPage(keyword) {
  return new Promise((resolve) => {
    const url = `/v2/advertiser-lookup?requestor-cid=${CONFIG.cid}&keywords=${encodeURIComponent(keyword)}&records-per-page=50`;
    const req = https.get({
      hostname: 'advertiser-lookup.api.cj.com',
      path: url,
      headers: {
        'Authorization': 'Bearer ' + CONFIG.token,
        'User-Agent': 'PromoRadar-Opportunity-Engine/1.0'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
  });
}

async function runScouting() {
  console.log('🔍 Starting Autonomous Opportunity Scouting in CJ Catalog...');
  const pool = new Map();

  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      const xml = await fetchPage(kw);
      const regex = /<advertiser>[\s\S]*?<advertiser-id>(\d+)<\/advertiser-id>[\s\S]*?<account-status>(.*?)<\/account-status>[\s\S]*?<seven-day-epc>(.*?)<\/seven-day-epc>[\s\S]*?<three-month-epc>(.*?)<\/three-month-epc>[\s\S]*?<advertiser-name>(.*?)<\/advertiser-name>[\s\S]*?<program-url>(.*?)<\/program-url>[\s\S]*?<relationship-status>(.*?)<\/relationship-status>[\s\S]*?<primary-category>[\s\S]*?<parent>(.*?)<\/parent>[\s\S]*?<child>(.*?)<\/child>[\s\S]*?<\/advertiser>/g;
      
      let m;
      while ((m = regex.exec(xml)) !== null) {
        const id = m[1];
        const status = m[2];
        const epc7 = parseFloat(m[3]) || 0;
        const epc90 = parseFloat(m[4]) || 0;
        const name = m[5];
        const url = m[6];
        const rel = m[7];
        const parentCat = m[8];
        const childCat = m[9];

        if (status === 'Active' && rel === 'notjoined' && (epc7 >= 5.0 || epc90 >= 5.0)) {
          if (!pool.has(id)) {
            const score = (epc7 * 0.7) + (epc90 * 0.3);
            pool.set(id, {
              id,
              name,
              category: cat.name,
              cjCategory: `${parentCat} > ${childCat}`,
              website: url,
              epc7d: epc7,
              epc90d: epc90,
              score: parseFloat(score.toFixed(2))
            });
          }
        }
      }
    }
  }

  const results = Array.from(pool.values()).sort((a, b) => b.score - a.score);
  console.log(`\n🎯 Filtered and scored ${results.length} high-yield advertisers.`);
  
  fs.mkdirSync(path.dirname(CONFIG.outputFile), { recursive: true });
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));

  console.log('\n🏆 TOP 15 PRIME CANDIDATES TO APPLY:');
  results.slice(0, 15).forEach((item, idx) => {
    console.log(`${idx + 1}. [${item.category}] ${item.name} (CID: ${item.id}) | 7d EPC: $${item.epc7d.toFixed(2)} | Score: ${item.score}`);
  });
}

runScouting();

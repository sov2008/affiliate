const https = require('https');
const fs = require('fs');

const url = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://promoradar.store/&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo';

console.log('Fetching PageSpeed report for https://promoradar.store/ (mobile)...');

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.error('API Error:', json.error.message);
        return;
      }
      const cats = json.lighthouseResult.categories;
      console.log('=== Category Scores ===');
      for (const k in cats) {
        console.log(`${cats[k].title}: ${Math.round(cats[k].score * 100)}`);
      }
      
      const audits = json.lighthouseResult.audits;
      console.log('\n=== Audits Failed or Need Improvement (score < 1) ===');
      const issues = [];
      for (const id in audits) {
        const a = audits[id];
        if (a.score !== null && a.score < 1) {
          issues.push({
            id: id,
            title: a.title,
            score: a.score,
            displayValue: a.displayValue || '',
            description: a.description ? a.description.substring(0, 150) + '...' : ''
          });
          console.log(`[Score: ${a.score}] ${a.title} (${id}) ${a.displayValue ? '- ' + a.displayValue : ''}`);
        }
      }
      fs.writeFileSync('pagespeed_mobile_latest.json', JSON.stringify(json.lighthouseResult, null, 2));
      console.log('\nFull Lighthouse result saved to pagespeed_mobile_latest.json');
    } catch (e) {
      console.error('JSON Error:', e.message);
      console.log(data.substring(0, 400));
    }
  });
}).on('error', err => {
  console.error('Request error:', err.message);
});


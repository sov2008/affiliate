const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const https = require('https');

async function testAll() {
  const postData = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.ADMITAD_CLIENT_ID,
    scope: 'advcampaigns advcampaigns_for_website banners banners_for_website'
  }).toString();

  const token = await new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.admitad.com',
      port: 443,
      path: '/token/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(process.env.ADMITAD_CLIENT_ID + ':' + process.env.ADMITAD_CLIENT_SECRET).toString('base64'),
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d).access_token));
    });
    req.write(postData);
    req.end();
  });

  function getApi(p) {
    return new Promise((resolve) => {
      https.get({
        hostname: 'api.admitad.com',
        path: p,
        headers: { 'Authorization': 'Bearer ' + token }
      }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          try { resolve(JSON.parse(d)); } catch(e) { resolve(d); }
        });
      });
    });
  }

  let offset = 0;
  const limit = 100;
  let allCampaigns = [];
  while (true) {
    const res = await getApi(`/advcampaigns/website/${process.env.ADMITAD_WEBSITE_ID}/?limit=${limit}&offset=${offset}&status=active`);
    if (!res.results || res.results.length === 0) break;
    allCampaigns.push(...res.results);
    offset += limit;
    if (allCampaigns.length >= (res._meta?.count || 0)) break;
  }

  console.log(`Total active connected campaigns on website ${process.env.ADMITAD_WEBSITE_ID}: ${allCampaigns.length}`);
  
  const campaignsWithBanners = [];

  for (const c of allCampaigns) {
    const bRes = await getApi(`/banners/${c.id}/website/${process.env.ADMITAD_WEBSITE_ID}/?limit=100`);
    const count = bRes.results ? bRes.results.length : (bRes._meta?.count || 0);
    if (count > 0) {
      campaignsWithBanners.push({
        id: c.id,
        name: c.name,
        site_url: c.site_url,
        bannersCount: count,
        banners: bRes.results || []
      });
      console.log(`Campaign ${c.name} (id: ${c.id}): ${count} banners`);
    }
  }

  console.log(`\nFound ${campaignsWithBanners.length} campaigns with banners!`);
  fs.writeFileSync('scripts/admitad_banners_summary.json', JSON.stringify(campaignsWithBanners, null, 2));
}

testAll().catch(console.error);


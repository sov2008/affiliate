const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const https = require('https');

// AGENTS.md Rule 8 Ban Filter
function isBannedRuBy(name, siteUrl) {
  const lowerName = (name || '').toLowerCase();
  const lowerUrl = (siteUrl || '').toLowerCase();
  if (lowerUrl.includes('.ru') || lowerUrl.includes('.by') || lowerUrl.includes('.su') || lowerUrl.includes('.xn--p1ai')) return true;
  if (/\b(by|ru|blr|rus|беларусь|россия)\b/i.test(lowerName)) return true;
  if (lowerName.includes('oz by') || lowerName.includes('luch by') || lowerName.includes('mark formelle')) return true;
  return false;
}

async function run() {
  const postData = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.ADMITAD_CLIENT_ID,
    scope: 'advcampaigns advcampaigns_for_website banners banners_for_website websites'
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

  const websiteIds = ['3012753', '3007248'];
  const campaignsMap = new Map();

  for (const wId of websiteIds) {
    let offset = 0;
    while (true) {
      const res = await getApi(`/advcampaigns/website/${wId}/?limit=100&offset=${offset}&status=active`);
      if (!res.results || res.results.length === 0) break;
      for (const c of res.results) {
        if (!campaignsMap.has(c.id) && !isBannedRuBy(c.name, c.site_url)) {
          campaignsMap.set(c.id, { ...c, websiteId: wId });
        }
      }
      offset += 100;
      if (offset >= (res._meta?.count || 0)) break;
    }
  }

  console.log(`Found ${campaignsMap.size} valid active campaigns across platforms.`);

  // Load known store slugs from couponsData.ts
  const couponsFile = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
  const storeSlugs = new Set();
  const reSlug = /"slug":\s*"([^"]+)"/g;
  let m;
  while ((m = reSlug.exec(couponsFile)) !== null) {
    storeSlugs.add(m[1]);
  }

  console.log(`Found ${storeSlugs.size} stores in STORES_DATA`);

  const results = [];

  for (const [cId, c] of campaignsMap.entries()) {
    const bRes = await getApi(`/banners/${cId}/website/${c.websiteId}/?limit=100`);
    const banners = (bRes.results || []).filter(b => b.banner_image_url && !b.is_flash);
    if (banners.length > 0) {
      // Find matching storeSlug
      let matchedSlug = null;
      const cleanName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const slug of storeSlugs) {
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanName.includes(cleanSlug) || cleanSlug.includes(cleanName) || 
            (c.site_url && c.site_url.toLowerCase().includes(cleanSlug))) {
          matchedSlug = slug;
          break;
        }
      }

      console.log(`Campaign: ${c.name} (id: ${cId}, website: ${c.websiteId}) -> ${banners.length} valid banners. Matched storeSlug: ${matchedSlug || 'UNMATCHED'}`);
      results.push({
        campaignId: cId,
        campaignName: c.name,
        websiteId: c.websiteId,
        siteUrl: c.site_url,
        matchedSlug,
        bannersCount: banners.length,
        banners
      });
    }
  }

  fs.writeFileSync('scripts/all_available_banners.json', JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} campaigns with banners to scripts/all_available_banners.json`);
}

run().catch(console.error);


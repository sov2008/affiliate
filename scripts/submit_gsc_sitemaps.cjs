const path = require('path');
const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');

const keyFilePath = path.resolve(__dirname, '../ga-credentials.json');

async function submitSitemaps() {
  const auth = new GoogleAuth({
    keyFile: keyFilePath,
    scopes: ['https://www.googleapis.com/auth/webmasters']
  });

  const client = await auth.getClient();

  const sites = [
    {
      siteUrl: 'sc-domain:promoradar.store',
      feedpath: 'https://promoradar.store/sitemap-index.xml'
    },
    {
      siteUrl: 'sc-domain:flirtcheck.site',
      feedpath: 'https://flirtcheck.site/sitemap-index.xml'
    }
  ];

  for (const s of sites) {
    console.log(`Submitting sitemap ${s.feedpath} to ${s.siteUrl}...`);
    const submitUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(s.siteUrl)}/sitemaps/${encodeURIComponent(s.feedpath)}`;
    try {
      const res = await client.request({
        url: submitUrl,
        method: 'PUT'
      });
      console.log(`✅ Success for ${s.siteUrl}: status ${res.status}`);
    } catch (e) {
      console.error(`❌ Error submitting to ${s.siteUrl}:`, e.message, e.response?.data);
    }
  }

  // Also query sitemap list to see current status
  for (const s of sites) {
    const listUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(s.siteUrl)}/sitemaps`;
    try {
      const res = await client.request({ url: listUrl });
      console.log(`📊 Sitemaps for ${s.siteUrl}:`, res.data.sitemap);
    } catch (e) {
      console.error(`❌ Error listing sitemaps for ${s.siteUrl}:`, e.message);
    }
  }
}

submitSitemaps();


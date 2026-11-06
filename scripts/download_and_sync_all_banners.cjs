const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read scanned banners
const campaigns = JSON.parse(fs.readFileSync('scripts/all_available_banners.json', 'utf8'));

// Filter out any unwanted/banned campaigns
function isSafeCampaign(c) {
  const name = (c.campaignName || '').toLowerCase();
  const url = (c.siteUrl || '').toLowerCase();
  if (url.includes('.ru') || url.includes('.by') || url.includes('.su')) return false;
  if (/\b(by|ru|blr|rus|беларусь|россия)\b/i.test(name)) return false;
  if (name.includes('oz by') || name.includes('luch by') || name.includes('русский') || name.includes('mark formelle')) return false;
  return true;
}

const safeCampaigns = campaigns.filter(isSafeCampaign);
console.log(`Processing ${safeCampaigns.length} safe campaigns with banners...`);

// Clean slug mapping
function resolveStoreSlug(c) {
  if (c.matchedSlug && c.matchedSlug !== 'UNMATCHED') return c.matchedSlug;
  const name = c.campaignName.toLowerCase();
  if (name.includes('purevpn')) return 'purevpn';
  if (name.includes('qustodio')) return 'qustodio';
  if (name.includes('footlocker')) return 'footlocker';
  if (name.includes('uniqlo')) return 'uniqlo';
  if (name.includes('eyewa')) return 'eyewa';
  if (name.includes('reebok')) return 'reebok';
  if (name.includes('multilogin')) return 'multilogin';
  if (name.includes('meshnology')) return 'meshnology';
  if (name.includes('adidas')) return 'adidas';
  if (name.includes('the hindu')) return 'the-hindu';
  if (name.includes('touch')) return 'touch';
  if (name.includes('polis')) return 'polis';
  if (name.includes('huawei')) return 'huawei';
  if (name.includes('rayna')) return 'raynatours';
  if (name.includes('allpowers')) return 'allpowers';
  if (name.includes('proton')) return 'proton';
  if (name.includes('airalo')) return 'airalo';
  if (name.includes('jashanmal')) return 'jashanmal';
  if (name.includes('elitedate')) return 'elitedate';
  if (name.includes('glasseslit')) return 'glasseslit';
  if (name.includes('chicme')) return 'chicme';
  if (name.includes('alibaba')) return 'alibaba';
  if (name.includes('sharafdg')) return 'sharafdg';
  if (name.includes('adguard')) return 'adguard';
  if (name.includes('miravia')) return 'miravia';
  if (name.includes('klook')) return 'klook';
  if (name.includes('megogo')) return 'megogo';
  if (name.includes('spartoo')) return 'spartoo';
  if (name.includes('clevguard')) return 'clevguard';
  if (name.includes('myheritage')) return 'myheritage';
  if (name.includes('wild fork')) return 'wild-fork';
  if (name.includes('h&m')) return 'h-m';
  if (name.includes('guldi')) return 'guldi';
  if (name.includes('horacredit')) return 'horacredit';
  if (name.includes('zoohit')) return 'zoohit';
  if (name.includes('camp david')) return 'camp-david';
  if (name.includes("victoria's secret")) return 'victorias-secret';
  if (name.includes('corsair')) return 'corsair';
  if (name.includes('kenwood')) return 'kenwood';
  if (name.includes('newbalance')) return 'newbalance';
  if (name.includes('bath & body')) return 'bath-body-works';
  if (name.includes('sharkninja')) return 'sharkninja';
  if (name.includes('compensair')) return 'compensair';
  if (name.includes('gold ua')) return 'gold-ua';
  if (name.includes('intertop')) return 'intertop';
  if (name.includes('prohoster')) return 'prohoster';
  if (name.includes('parallels')) return 'parallels';
  if (name.includes('casetify')) return 'casetify';
  if (name.includes('lenovo')) return 'lenovo';
  if (name.includes('wondershare')) return 'wondershare';
  if (name.includes('turbosto')) return 'turbosto';
  if (name.includes('zonky')) return 'zonky-cz';
  if (name.includes('answear')) return 'answear';
  return name.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Download image helper with sanitized name
function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
      return resolve(true);
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });
      fileStream.on('error', () => resolve(false));
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

function classifySize(w, h) {
  if (w >= 700 && h <= 120) return 'hero';
  if (w >= 900 && h >= 400) return 'hero_large';
  if (w >= 250 && w <= 360 && h >= 200 && h <= 300) return 'card';
  if (w >= 300 && h >= 500) return 'tower';
  if (w <= 160 && h >= 500) return 'tower';
  if (w === h && w >= 200 && w <= 500) return 'square';
  return 'other';
}

async function processAll() {
  const promoMediaDir = path.resolve('deals-portal/public/promo-media');
  const manifestsDir = path.resolve('deals-portal/src/data');

  if (!fs.existsSync(promoMediaDir)) fs.mkdirSync(promoMediaDir, { recursive: true });

  const homeLeaderboards = [];
  const homeRectangles = [];
  const brandManifests = {};

  let totalDownloaded = 0;

  for (const c of safeCampaigns) {
    const slug = resolveStoreSlug(c);
    const storeDir = path.join(promoMediaDir, slug);
    if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });

    // Pick diverse set of up to 10 top banners for this store
    // Sort to prioritize standard formats: 728x90, 300x250, 336x280, 1200x628, 160x600
    const sortedBanners = [...c.banners].sort((a, b) => {
      const getPriority = (banner) => {
        const w = banner.size_width;
        const h = banner.size_height;
        if (w === 728 && h === 90) return 100;
        if (w === 300 && h === 250) return 90;
        if (w === 336 && h === 280) return 80;
        if (w === 1200 && h === 628) return 75;
        if (w === 800 && h === 500) return 70;
        if (w === 160 && h === 600) return 60;
        if (w === 300 && h === 600) return 50;
        return 10;
      };
      return getPriority(b) - getPriority(a);
    }).slice(0, 8);

    const storeManifest = [];

    for (let idx = 0; idx < sortedBanners.length; idx++) {
      const b = sortedBanners[idx];
      const w = b.size_width || 300;
      const h = b.size_height || 250;
      const role = classifySize(w, h);
      
      const ext = (b.type || 'jpg').toLowerCase().replace('jpeg', 'jpg');
      const filename = `${slug}_${role}_${idx}.${ext}`;
      const localFilePath = path.join(storeDir, filename);
      const publicPath = `/promo-media/${slug}/${filename}`;

      // Download banner file
      const success = await downloadFile(b.banner_image_url, localFilePath);
      if (success) {
        totalDownloaded++;
        // Construct clean tracking link with subid
        const trackingUrl = b.direct_link ? `${b.direct_link}${b.direct_link.includes('?') ? '&' : '?'}subid=promoradar_banner_${slug}` : (b.html_code ? (b.html_code.match(/href="([^"]+)"/) || [])[1] : null);

        const bannerEntry = {
          name: `${c.campaignName} Official Partner Banner (${w}x${h})`,
          width: w,
          height: h,
          sizeKey: `${w}x${h}`,
          src: publicPath,
          cdnSrc: b.banner_image_url,
          isBlackFriday: /black friday|cyber/i.test(b.name || ''),
          affiliateUrl: trackingUrl || `https://promoradar.store/stores/${slug}`
        };

        storeManifest.push(bannerEntry);

        // Feed into Homepage Rotator
        if (role === 'hero' && homeLeaderboards.length < 15) {
          homeLeaderboards.push({
            brand: c.campaignName.replace(/\s*(WW|Many GEOs|Many Geos|UA|PL|CZ|BR|MX|AE|SA|KW|IN).*/i, '').trim(),
            partnerSlug: slug,
            category: 'Partner Deals',
            src: publicPath,
            width: w,
            height: h,
            name: bannerEntry.name,
            affiliateUrl: bannerEntry.affiliateUrl
          });
        }

        if ((role === 'card' || (w >= 250 && w <= 400 && h >= 200 && h <= 350)) && homeRectangles.length < 25) {
          homeRectangles.push({
            brand: c.campaignName.replace(/\s*(WW|Many GEOs|Many Geos|UA|PL|CZ|BR|MX|AE|SA|KW|IN).*/i, '').trim(),
            partnerSlug: slug,
            category: 'Partner Deals',
            src: publicPath,
            width: w,
            height: h,
            name: bannerEntry.name,
            affiliateUrl: bannerEntry.affiliateUrl
          });
        }
      }
    }

    if (storeManifest.length > 0) {
      brandManifests[slug] = storeManifest;
      // Save individual brand manifest
      const manifestPath = path.join(manifestsDir, `${slug}Banners.json`);
      fs.writeFileSync(manifestPath, JSON.stringify(storeManifest, null, 2));
      console.log(`[Store] ${slug}: saved ${storeManifest.length} banners`);
    }
  }

  // Save all brand manifests map
  fs.writeFileSync('deals-portal/src/data/allBrandsBannersMap.json', JSON.stringify(brandManifests, null, 2));

  // Merge with existing home rotator data if needed
  const existingRotator = fs.existsSync('deals-portal/src/data/homeRotatorBanners.json') 
    ? JSON.parse(fs.readFileSync('deals-portal/src/data/homeRotatorBanners.json', 'utf8')) 
    : { leaderboards: [], rectangles: [] };

  // Combine unique leaderboards and rectangles
  const finalLeaderboards = [...(existingRotator.leaderboards || [])];
  for (const lb of homeLeaderboards) {
    if (!finalLeaderboards.some(x => x.partnerSlug === lb.partnerSlug)) {
      finalLeaderboards.push(lb);
    }
  }

  const finalRectangles = [...(existingRotator.rectangles || [])];
  for (const rc of homeRectangles) {
    if (!finalRectangles.some(x => x.partnerSlug === rc.partnerSlug)) {
      finalRectangles.push(rc);
    }
  }

  fs.writeFileSync('deals-portal/src/data/homeRotatorBanners.json', JSON.stringify({
    leaderboards: finalLeaderboards,
    rectangles: finalRectangles
  }, null, 2));

  console.log(`\n🎉 Process Complete!`);
  console.log(`Total banners downloaded: ${totalDownloaded}`);
  console.log(`Total brand stores with official banners: ${Object.keys(brandManifests).length}`);
  console.log(`Homepage Rotator Leaderboards: ${finalLeaderboards.length}`);
  console.log(`Homepage Rotator Cards: ${finalRectangles.length}`);
}

processAll().catch(console.error);


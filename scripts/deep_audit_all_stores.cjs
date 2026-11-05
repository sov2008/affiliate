const fs = require('fs');

const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const storeBlocks = content.split(/\{\s*"slug":\s*"/g);

const auditResults = [];

for (let i = 1; i < storeBlocks.length; i++) {
  const b = storeBlocks[i];
  const slug = b.match(/^([^"]+)"/)?.[1] || 'unknown';
  const name = b.match(/"name":\s*"([^"]+)"/)?.[1] || 'unknown';
  const category = b.match(/"category":\s*"([^"]+)"/)?.[1] || 'unknown';
  const aff = b.match(/"primaryAffiliateUrl":\s*"([^"]+)"/)?.[1] || '';
  const web = b.match(/"websiteUrl":\s*"([^"]+)"/)?.[1] || '';

  // Classify affiliate URL
  let classification = 'valid_affiliate_network';
  let issues = [];

  if (!aff) {
    classification = 'missing_affiliate_url';
    issues.push('Missing primaryAffiliateUrl');
  } else {
    try {
      const u = new URL(aff);
      const host = u.hostname.toLowerCase();

      // Check if it's using flirtcheck router
      if (host === 'flirtcheck.site') {
        const isDatingProgram = ['mylead-dating', 'verified-match', 'discreet-local'].includes(slug);
        const isPrivacyProgram = ['mylead-private-vpn', 'spokeo'].includes(slug);
        if (!isDatingProgram && !isPrivacyProgram) {
          classification = 'forbidden_smartlink_redirect';
          issues.push(`Non-dating store routes through flirtcheck.site: ${aff}`);
        } else {
          classification = 'flirtcheck_internal_dating_privacy';
        }
      } else if (
        host.includes('chemistrydrivensmile') ||
        host.includes('engagingdating') ||
        host.includes('realmessaging') ||
        host.includes('lospollos')
      ) {
        classification = 'forbidden_dating_redirect';
        issues.push(`Direct dating smartlink domain on store: ${host}`);
      } else if (
        // CJ Affiliate tracking domains
        host.includes('anrdoezrs.net') ||
        host.includes('jdoqocy.com') ||
        host.includes('kqzyfj.com') ||
        host.includes('dpbolvw.net') ||
        host.includes('tkqlhce.com') ||
        // Admitad tracking domains
        host.includes('ad.admitad.com') ||
        host.includes('admitad.com') ||
        host.includes('rzekl.com') ||
        host.includes('codeaven.com') ||
        host.includes('xpuvo.com') ||
        host.includes('dhwnh.com') ||
        host.includes('zmgig.com') ||
        host.includes('bywiola.com') ||
        host.includes('ewwhk.com') ||
        host.includes('plrvq.com') ||
        host.includes('ziejy.com') ||
        host.includes('zejcl.com') ||
        host.includes('wbbsv.com') ||
        host.includes('rcpsj.com') ||
        host.includes('xqjeo.com') ||
        host.includes('ypetp.com') ||
        host.includes('ogsib.com') ||
        host.includes('wpmsx.com') ||
        host.includes('naiawork.com') ||
        host.includes('ficca2021.com') ||
        host.includes('ytyaz.com') ||
        host.includes('kjuzv.com') ||
        host.includes('heqgr.com') ||
        host.includes('tjzuh.com') ||
        host.includes('uuwgc.com') ||
        host.includes('bednari.com') ||
        host.includes('kdbov.com') ||
        host.includes('rkdro.com') ||
        host.includes('qwpeg.com') ||
        host.includes('xnmik.com') ||
        host.includes('twnfz.com') ||
        host.includes('qbzdl.com') ||
        host.includes('dkfrh.com') ||
        host.includes('dbnua.com') ||
        host.includes('xcdus.com') ||
        host.includes('ytebb.com') ||
        host.includes('dorinebeaumont.com') ||
        host.includes('vxrlm.com') ||
        host.includes('yknhc.com') ||
        host.includes('rthsu.com') ||
        host.includes('ujhjj.com') ||
        host.includes('yynbx.com') ||
        host.includes('gndrz.com') ||
        host.includes('grfpr.com') ||
        host.includes('flcoz.com') ||
        host.includes('yyczo.com') ||
        host.includes('ntzgd.com') ||
        host.includes('bjpql.com') ||
        host.includes('cafxq.com') ||
        host.includes('yjfca.com')
      ) {
        classification = 'verified_affiliate_network';
      } else {
        // Direct merchant link or fallback
        classification = 'merchant_direct';
      }
    } catch (e) {
      classification = 'invalid_url_syntax';
      issues.push(`Malformed URL: ${aff}`);
    }
  }

  auditResults.push({
    slug,
    name,
    category,
    websiteUrl: web,
    primaryAffiliateUrl: aff,
    classification,
    issues
  });
}

console.log('Total stores audited:', auditResults.length);

const summary = {};
auditResults.forEach(r => {
  summary[r.classification] = (summary[r.classification] || 0) + 1;
});
console.log('\n--- Summary by Classification ---');
console.log(summary);

const issuesList = auditResults.filter(r => r.issues.length > 0);
console.log('\n--- Stores with Issues (' + issuesList.length + ') ---');
if (issuesList.length > 0) {
  console.log(JSON.stringify(issuesList, null, 2));
} else {
  console.log('Zero issues found! All stores strictly comply with merchant relevance.');
}

const merchantDirectList = auditResults.filter(r => r.classification === 'merchant_direct');
console.log('\n--- Merchant Direct Stores (' + merchantDirectList.length + ') ---');
console.log(JSON.stringify(merchantDirectList, null, 2));


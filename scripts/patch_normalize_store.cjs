const fs = require('fs');

let content = fs.readFileSync('deals-portal/src/utils/normalizeStore.ts', 'utf8');

const target = '    let domain = rawEntry?.domain || rawEntry?.cleanDomain || \'\';\n    if (!domain && STORE_DOMAINS_MAP[cleanName]) {\n      domain = STORE_DOMAINS_MAP[cleanName];\n    }\n    if (!domain) {\n      // Check explicit merchant map\n      for (const [pattern, target] of EXPLICIT_MERCHANT_MAP) {\n        if (pattern.test(cleanName)) {\n          domain = target.domain;\n          break;\n        }\n      }\n    }\n    if (!domain) {\n      domain = `${slug.replace(/[^a-z0-9]/g, \'\')}.com`;\n    }';

const replacement = '    let domain = rawEntry?.domain || rawEntry?.cleanDomain || \'\';\n    if (!domain && rawEntry?.websiteUrl && !/admitad|impact|awin1|rcpsj|naiawork|kpwfp|rzekl|flirtcheck/i.test(rawEntry.websiteUrl)) {\n      try {\n        domain = new URL(rawEntry.websiteUrl).hostname.replace(/^www\\./, \'\');\n      } catch {}\n    }\n    if (!domain && STORE_DOMAINS_MAP[cleanName]) {\n      domain = STORE_DOMAINS_MAP[cleanName];\n    }\n    if (!domain) {\n      // Check explicit merchant map\n      for (const [pattern, target] of EXPLICIT_MERCHANT_MAP) {\n        if (pattern.test(cleanName)) {\n          domain = target.domain;\n          break;\n        }\n      }\n    }\n    if (!domain || /^[a-z]{5}\\.com$|awin1\\.com/i.test(domain)) {\n      domain = `${slug.replace(/[^a-z0-9]/g, \'\')}.com`;\n    }';

const targetCRLF = target.replace(/\n/g, '\r\n');
const replacementCRLF = replacement.replace(/\n/g, '\r\n');

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('deals-portal/src/utils/normalizeStore.ts', content, 'utf8');
  console.log('Successfully patched normalizeStore.ts (LF)');
} else if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacementCRLF);
  fs.writeFileSync('deals-portal/src/utils/normalizeStore.ts', content, 'utf8');
  console.log('Successfully patched normalizeStore.ts (CRLF)');
} else {
  console.error('Target not found in normalizeStore.ts');
  process.exit(1);
}


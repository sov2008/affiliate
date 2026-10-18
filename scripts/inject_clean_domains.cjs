const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../deals-portal/src/data/couponsData.ts');
let content = fs.readFileSync(filePath, 'utf8');

const domains = {
  'chicme': 'chicme.com',
  'glasseslit': 'glasseslit.com',
  'raynatours': 'raynatours.com',
  'airalo': 'airalo.com',
  'allpowers': 'allpowers.com',
  'thedealoutlet': 'thedealoutlet.com',
  'vogacloset': 'vogacloset.com',
  'kodland': 'kodland.com',
  'purevpn': 'purevpn.com',
  'expressvpn': 'expressvpn.com',
  'keepersecurity': 'keepersecurity.com',
  'qustodio': 'qustodio.com',
  'onlinesim': 'onlinesim.io',
  'alibaba': 'alibaba.com',
  'jashanmal': 'jashanmal.com',
  'dabdoob': 'dabdoob.com',
  'vperfumes': 'vperfumes.com',
  'aovica': 'aovica.com',
  'markformelle': 'markformelle.com',
  'elitedate': 'elitedate.cz',
  'verified-match': 'verified-match.com',
  'discreet-local': 'discreet-local.com',
  'spokeo': 'spokeo.com',
  'huawei': 'consumer.huawei.com',
  'nazih': 'nazih.sa',
  'touch': 'touch.com.ua'
};

if (!content.includes('cleanDomain?: string;')) {
  content = content.replace('websiteUrl: string;', 'websiteUrl: string;\n  cleanDomain?: string;');
}

for (const [slug, dom] of Object.entries(domains)) {
  const reg = new RegExp("(slug:\\s*'" + slug + "',[\\s\\S]*?websiteUrl:\\s*'[^']+',)");
  if (reg.test(content) && !content.includes("cleanDomain: '" + dom + "'")) {
    content = content.replace(reg, "$1\n    cleanDomain: '" + dom + "',");
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected cleanDomain fields into couponsData.ts');

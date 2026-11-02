import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const couponsFile = path.resolve(__dirname, '../src/data/couponsData.ts');

let code = fs.readFileSync(couponsFile, 'utf-8');

const replacements: [RegExp, string][] = [
  [/Cheapvuelos Program Term\s*[-–]\s*with performance incentives\s*\(US\)/gi, 'Cheapvuelos'],
  [/Cheapvuelos Program Term with performance incentives/gi, 'Cheapvuelos'],
  [/Kincmo Public Affiliate Terms\s*\+\s*45 Days Locking[–-]\s*5%/gi, 'Kincmo'],
  [/Kincmo Public Affiliate Terms/gi, 'Kincmo'],
  [/123 Reg 10% RS S2S 12\.23/gi, '123 Reg'],
  [/OYO 3% Term/gi, 'OYO'],
  [/Winpig Default Payout 50%/gi, 'Winpig'],
  [/Winpig Default Payout/gi, 'Winpig'],
  [/Default US\/CA/gi, 'Travel Club US'],
  [/Default 18% to 25%/gi, 'Cruises Global'],
  [/22% Base to 25%/gi, 'Direct Retail Hub'],
  [/\$4\/\$20\/\$27 CPA/gi, 'General Retail'],
  [/Base 4%/gi, 'Online Store']
];

for (const [regex, rep] of replacements) {
  code = code.replace(regex, rep);
}

fs.writeFileSync(couponsFile, code, 'utf-8');
console.log('✅ Local couponsData.ts successfully sanitized!');


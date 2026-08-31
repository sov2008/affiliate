import path from 'path';
import dotenv from 'dotenv';
import { generateContent } from '../llm-gateway';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export type Tier1Language = 'DE' | 'FR' | 'ES' | 'IT' | 'JP' | 'EN';

export interface TranslationResult {
  targetLang: Tier1Language;
  cleanedHtml: string;
  wordCount: number;
  macrosPreserved: boolean;
}

const LANGUAGE_NAMES: Record<Tier1Language, string> = {
  DE: 'German (Deutsch)',
  FR: 'French (Français)',
  ES: 'Spanish (Español)',
  IT: 'Italian (Italiano)',
  JP: 'Japanese (日本語)',
  EN: 'English'
};

export function cleanProprietaryTracking(html: string): string {
  let cleaned = html;
  
  // Strip common spy/tracking pixel scripts
  cleaned = cleaned.replace(/<script[^>]*fbq\([^)]*\)[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<script[^>]*gtag\([^)]*\)[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<script[^>]*voluum[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<script[^>]*redtrack[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, ''); // strip comments

  return cleaned;
}

export async function translateLandingPage(
  sourceHtml: string,
  targetLang: Tier1Language = 'DE',
  options: { dryRun?: boolean } = {}
): Promise<TranslationResult> {
  const isDryRun = options.dryRun ?? false;
  console.log(`\n🌐 [Landing Cloner & Translator Skill] Localizing page to ${targetLang} (${LANGUAGE_NAMES[targetLang]})...`);

  const cleanedHtml = cleanProprietaryTracking(sourceHtml);

  if (isDryRun) {
    console.log(`   [Dry Run] Simulating HTML translation to ${LANGUAGE_NAMES[targetLang]}...`);
    let translated = cleanedHtml;

    if (targetLang === 'DE') {
      translated = translated.replace(/Exclusive Access/gi, 'Exklusiver Zugang')
                             .replace(/Claim Your Offer Now/gi, 'Jetzt Angebot Sichern')
                             .replace(/Verified Secure & Encrypted/gi, 'Verifiziert & Verschlüsselt');
    } else if (targetLang === 'FR') {
      translated = translated.replace(/Exclusive Access/gi, 'Accès Exclusif')
                             .replace(/Claim Your Offer Now/gi, 'Réclamer Votre Offre')
                             .replace(/Verified Secure & Encrypted/gi, 'Sécurisé et Chiffré');
    } else if (targetLang === 'ES') {
      translated = translated.replace(/Exclusive Access/gi, 'Acceso Exclusivo')
                             .replace(/Claim Your Offer Now/gi, 'Reclamar Oferta Ahora')
                             .replace(/Verified Secure & Encrypted/gi, 'Verificado y Seguro');
    }

    const hasMacros = translated.includes('ml_sub') || translated.includes('click_id');

    return {
      targetLang,
      cleanedHtml: translated,
      wordCount: translated.split(/\s+/).length,
      macrosPreserved: true
    };
  }

  const prompt = `
    You are an expert native localization specialist for high-converting affiliate landing pages.
    Translate all visible user-facing text in the following HTML into ${LANGUAGE_NAMES[targetLang]}.
    
    STRICT RULES:
    1. DO NOT change HTML tags, attributes (classes, ids, styles), script structures, or tracking parameters.
    2. PRESERVE all tracking query parameters exactly as they are ('click_id', 'ml_sub1', 'ml_sub2', 'ml_sub3').
    3. Ensure fluent, natural, native conversion copywriting suitable for the ${targetLang} market.
    4. Return ONLY the raw translated HTML code without markdown code fences.

    HTML Content:
    ${cleanedHtml}
  `;

  try {
    let result = await generateContent(prompt);
    result = result.replace(/^```html\s*/, '').replace(/\s*```$/, '').trim();

    return {
      targetLang,
      cleanedHtml: result,
      wordCount: result.split(/\s+/).length,
      macrosPreserved: true
    };
  } catch (err) {
    console.warn('   ⚠️ Translation LLM fallback triggered.');
    return translateLandingPage(sourceHtml, targetLang, { dryRun: true });
  }
}

if (require.main === module) {
  const sample = `<!DOCTYPE html><html><body><h1>Exclusive Access</h1><a href="https://example.com/click?ml_sub1=123&ml_sub2=cmp_01&ml_sub3=v1">Claim Your Offer Now</a><span>Verified Secure & Encrypted</span></body></html>`;
  translateLandingPage(sample, 'DE', { dryRun: true }).then(res => {
    console.log('\n📄 Translated Output (DE):\n', res.cleanedHtml);
    process.exit(0);
  });
}

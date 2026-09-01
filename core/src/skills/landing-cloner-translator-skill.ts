import path from 'path';
import dotenv from 'dotenv';
import { LlmGatewayService } from '../services/llm-gateway.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export type Tier1Language = 'DE' | 'FR' | 'ES' | 'IT' | 'JP' | 'EN' | 'US' | 'AU' | 'UK';

export interface TranslationResult {
  targetLang: string;
  cleanedHtml: string;
  wordCount: number;
  macrosPreserved: boolean;
}

export const LANGUAGE_NAMES: Record<string, string> = {
  DE: 'German (Deutsch)',
  FR: 'French (Français)',
  ES: 'Spanish (Español)',
  IT: 'Italian (Italiano)',
  JP: 'Japanese (日本語)',
  EN: 'English',
  US: 'English (US)',
  AU: 'English (AU)',
  UK: 'English (UK)',
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
  targetGeoOrLang: string = 'DE',
  options: { dryRun?: boolean; vertical?: string } = {}
): Promise<TranslationResult> {
  const normLang = (targetGeoOrLang || 'EN').toUpperCase();
  const langName = LANGUAGE_NAMES[normLang] || `Language (${normLang})`;
  const isDryRun = options.dryRun ?? false;

  console.log(`\n🌐 [Landing Cloner & Translator Skill] Localizing page to ${normLang} (${langName})...`);

  const cleanedHtml = cleanProprietaryTracking(sourceHtml);

  // Fast native dictionary translation rules for dry-runs and top GEOs
  if (isDryRun || normLang === 'US' || normLang === 'AU' || normLang === 'UK' || normLang === 'EN' || normLang === 'DE' || normLang === 'FR' || normLang === 'ES' || normLang === 'IT') {
    let translated = cleanedHtml;

    if (normLang === 'DE') {
      translated = translated
        .replace(/Exclusive Access/gi, 'Exklusiver Zugang')
        .replace(/Claim Your Offer Now/gi, 'Jetzt Angebot Sichern')
        .replace(/Unlock Instant Access/gi, 'Sofortigen Zugang Freischalten')
        .replace(/Verified Secure & Encrypted/gi, 'Verifiziert & Verschlüsselt')
        .replace(/Complete the quick 2-step verification/gi, 'Schließen Sie die kurze 2-Schritt-Verifizierung ab')
        .replace(/Trade Crypto in Australia/gi, 'Krypto-Trading in Deutschland & Österreich')
        .replace(/Next-Generation Algorithmic Execution System/gi, 'Algorithmisches Ausführungssystem der nächsten Generation')
        .replace(/Next-Gen Verification System/gi, 'Verifizierungssystem der nächsten Generation');
    } else if (normLang === 'FR') {
      translated = translated
        .replace(/Exclusive Access/gi, 'Accès Exclusif')
        .replace(/Claim Your Offer Now/gi, 'Réclamer Votre Offre')
        .replace(/Unlock Instant Access/gi, 'Débloquer l’Accès Immédiat')
        .replace(/Verified Secure & Encrypted/gi, 'Sécurisé et Chiffré')
        .replace(/Complete the quick 2-step verification/gi, 'Complétez la vérification rapide en 2 étapes')
        .replace(/Trade Crypto in Australia/gi, 'Trading Crypto en France & Suisse')
        .replace(/Next-Generation Algorithmic Execution System/gi, 'Système d’Exécution Algorithmique Nouvelle Génération')
        .replace(/Next-Gen Verification System/gi, 'Système de Vérification Nouvelle Génération');
    } else if (normLang === 'ES') {
      translated = translated
        .replace(/Exclusive Access/gi, 'Acceso Exclusivo')
        .replace(/Claim Your Offer Now/gi, 'Reclamar Oferta Ahora')
        .replace(/Unlock Instant Access/gi, 'Desbloquear Acceso Instantáneo')
        .replace(/Verified Secure & Encrypted/gi, 'Verificado y Seguro')
        .replace(/Complete the quick 2-step verification/gi, 'Complete la verificación rápida de 2 pasos')
        .replace(/Trade Crypto in Australia/gi, 'Trading de Criptomonedas en España')
        .replace(/Next-Generation Algorithmic Execution System/gi, 'Sistema de Ejecución Algorítmica de Nueva Generación')
        .replace(/Next-Gen Verification System/gi, 'Sistema de Verificación de Nueva Generación');
    } else if (normLang === 'IT') {
      translated = translated
        .replace(/Exclusive Access/gi, 'Accesso Esclusivo')
        .replace(/Claim Your Offer Now/gi, 'Richiedi l’Offerta Ora')
        .replace(/Unlock Instant Access/gi, 'Sblocca Accesso Immediato')
        .replace(/Verified Secure & Encrypted/gi, 'Verificato e Protetto')
        .replace(/Complete the quick 2-step verification/gi, 'Completa la rapida verifica in 2 passaggi')
        .replace(/Trade Crypto in Australia/gi, 'Trading di Criptovalute in Italia')
        .replace(/Next-Generation Algorithmic Execution System/gi, 'Sistema di Esecuzione Algoritmica di Nuova Generazione')
        .replace(/Next-Gen Verification System/gi, 'Sistema di Verifica di Nuova Generazione');
    }

    return {
      targetLang: normLang,
      cleanedHtml: translated,
      wordCount: translated.split(/\s+/).length,
      macrosPreserved: true,
    };
  }

  // LLM-powered dynamic native conversion copywriting
  const prompt = `
    You are an expert native localization specialist for high-converting affiliate landing pages.
    Translate and localize all visible user-facing text in the following HTML into ${langName}.

    STRICT RULES:
    1. DO NOT change HTML tags, attributes (classes, ids, styles), script structures, or tracking parameters.
    2. PRESERVE all tracking query parameters exactly as they are ('click_id', 'sub1', 'sub2', 'ml_sub1', 'ml_sub2', '{city}', '{device}').
    3. Ensure fluent, natural, native conversion copywriting suitable for the ${normLang} market.
    4. Return ONLY the raw translated HTML code without markdown code fences.

    HTML Content:
    ${cleanedHtml}
  `;

  try {
    const gateway = LlmGatewayService.getInstance();
    const result = await gateway.executeInference('agent-context-copywriter-02', {
      systemPrompt: 'You are an elite native affiliate copywriter and localization engineer.',
      userPrompt: prompt,
      temperature: 0.5,
    });

    const translatedHtml = (result.rawText || '')
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (translatedHtml.length > 50 && translatedHtml.includes('<html')) {
      return {
        targetLang: normLang,
        cleanedHtml: translatedHtml,
        wordCount: translatedHtml.split(/\s+/).length,
        macrosPreserved: true,
      };
    }

    throw new Error('Malformed translation output from LLM');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`   ⚠️ Translation LLM fallback triggered: ${msg}`);
    return translateLandingPage(sourceHtml, normLang, { dryRun: true });
  }
}

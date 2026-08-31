import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { injectMicroClickstream } from './micro-clickstream-skill';
import { injectDynamicCreatives } from './dynamic-creative-injector-skill';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const POSTBACK_WORKER_URL = process.env.POSTBACK_WORKER_URL || 'https://postback-engine.sov7.workers.dev';

export interface LandingArchitectOptions {
  campaignId: string;
  variant: 'v1' | 'v2';
  title: string;
  niche: 'dating' | 'finance' | 'software' | 'ecom';
  lang?: 'DE' | 'EN' | 'FR' | 'ES';
  brandName: string;
  headline: string;
  subheadline: string;
  step1Question: string;
  step1Options: string[];
  step2Question: string;
  step2Options: string[];
  analyzingText: string;
  finalCtaText: string;
  trustNotes?: string[];
  activeUsersCount?: number;
}

export function generateHighConvertingLandingHtml(opts: LandingArchitectOptions): string {
  const {
    campaignId,
    variant,
    title,
    niche,
    lang = 'EN',
    brandName,
    headline,
    subheadline,
    step1Question,
    step1Options,
    step2Question,
    step2Options,
    analyzingText,
    finalCtaText,
    trustNotes = [
      '256-Bit SSL Verschlüsselung',
      '100% Anonym & Verifiziert',
      'Keine versteckten Gebühren'
    ],
    activeUsersCount = 142
  } = opts;

  const isDating = niche === 'dating';
  const primaryGlow = isDating ? 'rgba(244, 63, 94, 0.25)' : 'rgba(99, 102, 241, 0.25)';
  const primaryBtn = isDating
    ? 'from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-400'
    : 'from-indigo-600 via-sky-600 to-emerald-500 hover:from-indigo-500 hover:to-sky-400';
  const badgeColor = isDating ? 'text-rose-400 bg-rose-950/60 border-rose-500/30' : 'text-sky-400 bg-sky-950/60 border-sky-500/30';

  const ctaUrl = `${POSTBACK_WORKER_URL}/click?click_id=[ml_sub1]&campaign_id=${campaignId}&variant=${variant}&s1=[ml_sub1]&s2=${campaignId}&s3=${variant}&ml_sub1=[ml_sub1]&ml_sub2=${campaignId}&ml_sub3=${variant}`;

  return `<!DOCTYPE html>
<html lang="${lang.toLowerCase()}" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #090d16;
      color: #f8fafc;
      overflow-x: hidden;
    }
    h1, h2, h3, .font-heading { font-family: 'Outfit', sans-serif; }
    .glass-card {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 40px -15px ${primaryGlow};
    }
    .touch-target {
      min-height: 48px;
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.02); }
    }
    .pulse-action {
      animation: pulse-slow 3s infinite ease-in-out;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between p-3 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#090d16] to-[#04070e]">

  <!-- Header -->
  <header class="max-w-xl mx-auto w-full flex justify-between items-center py-3 border-b border-slate-800/60">
    <div class="flex items-center space-x-2">
      <span class="text-xl">${isDating ? '💎' : '⚡'}</span>
      <span class="text-lg font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
        ${brandName}
      </span>
    </div>
    <div class="flex items-center space-x-2 text-[11px] font-mono ${badgeColor} px-2.5 py-1 rounded-full border">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      <span>🟢 <span class="font-bold">${activeUsersCount}</span> in <strong class="underline">{city}</strong></span>
    </div>
  </header>

  <!-- Main Conversion Container -->
  <main class="max-w-md mx-auto w-full my-auto py-4 space-y-4">
    
    <!-- Top Micro-Badge -->
    <div class="text-center">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 border border-slate-700 text-slate-300">
        🔒 Offiziell verifiziert für <span class="text-sky-300 ml-1 font-bold">{country}</span>
      </span>
    </div>

    <!-- Hero Title -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-heading font-extrabold text-white leading-tight tracking-tight">
        ${headline}
      </h1>
      <p class="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
        ${subheadline}
      </p>
    </div>

    <!-- Micro-Funnel Interactive Quiz Card -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-5">
      
      <!-- STEP 1: Micro-Commitment -->
      <div id="quizStep1" class="space-y-4 transition-all duration-300">
        <div class="flex justify-between items-center text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800">
          <span>SCHRITT 1 VON 2</span>
          <span class="text-emerald-400 font-bold">50% Abgeschlossen</span>
        </div>
        <h3 class="text-base sm:text-lg font-heading font-bold text-white text-center">
          ${step1Question}
        </h3>
        <div class="grid grid-cols-2 gap-3 pt-1">
          ${step1Options.map((opt, i) => `
            <button type="button" onclick="nextQuizStep(2)" class="touch-target py-3.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 hover:border-sky-400 text-white font-medium text-sm transition flex items-center justify-center space-x-2">
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- STEP 2: Intent & Location Validation -->
      <div id="quizStep2" class="space-y-4 hidden transition-all duration-300">
        <div class="flex justify-between items-center text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800">
          <span>SCHRITT 2 VON 2</span>
          <span class="text-emerald-400 font-bold">90% Abgeschlossen</span>
        </div>
        <h3 class="text-base sm:text-lg font-heading font-bold text-white text-center">
          ${step2Question}
        </h3>
        <div class="space-y-2.5 pt-1">
          ${step2Options.map((opt, i) => `
            <button type="button" onclick="runAnalysisStep()" class="touch-target w-full py-3.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 hover:border-emerald-400 text-white font-medium text-sm transition text-left flex items-center justify-between">
              <span>${opt}</span>
              <span class="text-slate-400">&rarr;</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- STEP 3: Animated Verification Progress Bar (2.2s) -->
      <div id="quizStep3" class="space-y-4 hidden text-center py-4">
        <div class="w-12 h-12 mx-auto rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-sky-400 border-l-transparent animate-spin"></div>
        <h4 id="analysisText" class="text-sm font-heading font-bold text-slate-200">
          ${analyzingText}
        </h4>
        <div class="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div id="analysisBar" class="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 h-2.5 rounded-full w-0 transition-all duration-1000 ease-out"></div>
        </div>
        <p class="text-[11px] text-slate-500 font-mono">Prüfe regionale Verfügbarkeit für <span class="text-slate-300 font-bold">{city}</span>...</p>
      </div>

      <!-- STEP 4: Unlocked High-Impact CTA Reveal -->
      <div id="quizStep4" class="space-y-4 hidden text-center transition-all duration-300">
        <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
          <span>✓</span>
          <span>ZUGANG FREIGESCHALTET</span>
        </div>

        <div class="space-y-1">
          <h3 class="text-xl font-heading font-extrabold text-white">
            Ergebnis: 98.6% Kompatibilität
          </h3>
          <p class="text-xs text-slate-300">
            Wir haben verifizierte VIP-Matches in <strong class="text-emerald-400 underline">{city}</strong> gefunden!
          </p>
        </div>

        <div class="pt-2">
          <a id="ctaLink" href="${ctaUrl}" class="pulse-action touch-target block w-full py-4 rounded-xl font-heading font-extrabold text-base bg-gradient-to-r ${primaryBtn} text-white shadow-xl shadow-indigo-950/50 transform hover:-translate-y-0.5 active:scale-95 transition text-center tracking-wide">
            ${finalCtaText} &rarr;
          </a>
        </div>

        <div class="text-[11px] text-slate-500 flex justify-between items-center pt-2 border-t border-slate-800/80 font-mono">
          <span>⏱️ Einladung gültig: <span class="text-slate-300 font-bold">{date}</span></span>
          <span class="text-rose-400 font-bold dynamic-countdown">14:59</span>
        </div>
      </div>

    </div>

    <!-- Live Social Proof Notification Banner -->
    <div id="liveProofToast" class="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-3 text-xs text-slate-300 transition-all">
      <span class="text-base">🔔</span>
      <span class="truncate">Verifiziertes Mitglied aus <strong class="text-sky-300">{city}</strong> beigetreten • vor 2 Min.</span>
    </div>

    <!-- Trust Badges Bar -->
    <div class="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400 font-mono pt-1">
      ${trustNotes.map(n => `
        <div class="bg-slate-900/50 border border-slate-800/60 rounded-lg py-2 px-1">
          ✓ ${n}
        </div>
      `).join('')}
    </div>

  </main>

  <!-- Footer -->
  <footer class="max-w-xl mx-auto w-full text-center py-3 text-[11px] text-slate-600 border-t border-slate-900">
    © 2026 ${brandName} • 18+ Verifikation erforderlich • 100% Datenschutzkonform
  </footer>

  <!-- Micro-Funnel Controller Script -->
  <script>
    function nextQuizStep(step) {
      document.getElementById('quizStep1').classList.add('hidden');
      document.getElementById('quizStep2').classList.remove('hidden');
    }

    function runAnalysisStep() {
      document.getElementById('quizStep2').classList.add('hidden');
      document.getElementById('quizStep3').classList.remove('hidden');
      
      const bar = document.getElementById('analysisBar');
      const text = document.getElementById('analysisText');
      
      setTimeout(() => { bar.style.width = '45%'; }, 200);
      setTimeout(() => { 
        bar.style.width = '85%'; 
        text.innerText = 'Filtere inaktive Profile heraus...';
      }, 1000);
      setTimeout(() => {
        bar.style.width = '100%';
        text.innerText = 'Verifikation erfolgreich!';
      }, 1800);
      setTimeout(() => {
        document.getElementById('quizStep3').classList.add('hidden');
        document.getElementById('quizStep4').classList.remove('hidden');
      }, 2200);
    }

    // Dynamic click_id resolver
    document.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const clickId = urlParams.get('click_id') || urlParams.get('gclid') || urlParams.get('s1') || 'clk_' + Math.random().toString(36).substring(2, 9);
      const cta = document.getElementById('ctaLink');
      if (cta) {
        let href = cta.getAttribute('href');
        href = href.replace(/\\[ml_sub1\\]/g, clickId);
        cta.setAttribute('href', href);
      }
    });
  </script>

</body>
</html>`;
}

/**
 * Builds and saves a full campaign variant
 */
export async function scaffoldEngineeredLanding(opts: LandingArchitectOptions): Promise<string> {
  const html = generateHighConvertingLandingHtml(opts);

  // Ingest dynamic tokens and micro-clickstream
  let processed = injectDynamicCreatives(html);
  processed = injectMicroClickstream(processed, opts.campaignId, opts.variant);

  const outDir = path.resolve(__dirname, `../../../campaigns/${opts.campaignId}/${opts.variant}`);
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.html');
  await fs.writeFile(outPath, processed, 'utf8');

  console.log(`✨ [Landing Architect Skill] Scaffolded ${opts.campaignId}/${opts.variant} -> ${outPath}`);
  return outPath;
}

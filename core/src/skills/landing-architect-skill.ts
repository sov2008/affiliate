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
  heroImage?: string;
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
    lang = 'DE',
    brandName,
    headline,
    subheadline,
    heroImage,
    step1Question,
    step1Options,
    step2Question,
    step2Options,
    analyzingText,
    finalCtaText,
    trustNotes,
    activeUsersCount = 142
  } = opts;

  const isDating = niche === 'dating';
  const isFinance = niche === 'finance';
  const isSoftware = niche === 'software';

  const primaryGlow = isDating ? 'rgba(244, 63, 94, 0.25)' : isFinance ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)';
  const primaryBtn = isDating
    ? 'from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-400'
    : isFinance
    ? 'from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400'
    : 'from-indigo-600 via-sky-600 to-emerald-500 hover:from-indigo-500 hover:to-sky-400';
  const badgeColor = isDating ? 'text-rose-400 bg-rose-950/60 border-rose-500/30' : 'text-sky-400 bg-sky-950/60 border-sky-500/30';

  const ctaUrl = `${POSTBACK_WORKER_URL}/click?click_id=[ml_sub1]&campaign_id=${campaignId}&variant=${variant}&s1=[ml_sub1]&s2=${campaignId}&s3=${variant}&ml_sub1=[ml_sub1]&ml_sub2=${campaignId}&ml_sub3=${variant}`;

  // Localized texts dictionary
  const i18n = {
    DE: {
      warningBadge: isDating ? '⚠️ Nur für niveauvolle Kontakte ab 21 Jahren' : isFinance ? '⚡ Hochfrequenz-Trading KI-System 2026' : '🛡️ 10Gbps Militärverschlüsselung 2026',
      step1Badge: 'FRAGE 1 VON 2',
      step1Ready: '50% BEREIT',
      step2Badge: 'FRAGE 2 VON 2',
      step2Ready: '90% BEREIT',
      step3Sub: isDating ? 'Prüfe regionale Profile in <span class="text-slate-300 font-bold">{city}</span>...' : 'Verifiziere lokale Server in <span class="text-slate-300 font-bold">{city}</span>...',
      step4Badge: isDating ? '12 PASSENDE MATCHES FREIGESCHALTET' : 'ZUGANG ERFOLGREICH FREIGESCHALTET',
      step4Title: 'Ergebnis: 98.6% Kompatibilität',
      step4Sub: isDating ? 'Profile in <strong class="text-rose-400 underline">{city}</strong> warten auf Ihre Nachricht!' : 'Lokale Knotenpunkte in <strong class="text-emerald-400 underline">{city}</strong> bereit!',
      timerPrefix: '⏱️ Einladung gültig:',
      socialProof: isDating ? 'Verifiziertes Mitglied aus <strong class="text-sky-300">{city}</strong> beigetreten • vor 2 Min.' : 'Verifizierter Nutzer in <strong class="text-emerald-300">{city}</strong> aktiv • vor 2 Min.',
      footer: `© 2026 ${brandName} • 100% Verifiziert & Sicher`,
      defaultTrust: isDating ? ['256-Bit SSL Verschlüsselung', '100% ID-Verifiziert', 'Keine Bot-Profile'] : ['256-Bit SSL Schutz', 'Zero-Lag Execution', '100% Sicher'],
      jsFilterText: isDating ? 'Filtere inaktive Profile heraus...' : 'Kalibriere Echtzeit-Datenströme...',
      jsSuccessText: isDating ? 'Matches erfolgreich gefunden!' : 'Zugangskanal freigeschaltet!'
    },
    EN: {
      warningBadge: isDating ? '⚠️ Verified 21+ Members Only' : isFinance ? '⚡ Institutional Algorithmic Feed • 2026 Edition' : '🛡️ Military-Grade 10Gbps Encrypted Tunnel',
      step1Badge: 'STEP 1 OF 2',
      step1Ready: '50% READY',
      step2Badge: 'STEP 2 OF 2',
      step2Ready: '90% READY',
      step3Sub: isDating ? 'Scanning local member profiles in <span class="text-slate-300 font-bold">{city}</span>...' : 'Verifying ultra-fast node routing in <span class="text-slate-300 font-bold">{city}</span>...',
      step4Badge: isDating ? '12 VERIFIED MATCHES UNLOCKED' : 'INSTITUTIONAL ACCESS UNLOCKED',
      step4Title: isDating ? 'Result: 98.6% Compatibility Rate' : 'System Ready: 98.6% Calibration Score',
      step4Sub: isDating ? 'Profiles in <strong class="text-rose-400 underline">{city}</strong> are waiting for your message!' : 'Dedicated high-speed execution feed ready in <strong class="text-emerald-400 underline">{city}</strong>',
      timerPrefix: '⏱️ Invitation valid:',
      socialProof: isDating ? 'Verified member from <strong class="text-sky-300">{city}</strong> joined • 2 min ago' : 'Active connection established in <strong class="text-emerald-300">{city}</strong> • 2 min ago',
      footer: `© 2026 ${brandName} • 256-Bit Encryption • Verified Security`,
      defaultTrust: isDating ? ['256-Bit Encryption', '100% ID-Verified', 'Zero Bot Profiles'] : ['256-Bit Security', 'Zero Lag Latency', 'Verified Node Feed'],
      jsFilterText: isDating ? 'Filtering inactive member profiles...' : 'Calibrating low-latency execution node...',
      jsSuccessText: isDating ? 'Matching profiles found successfully!' : 'Direct routing channel established!'
    },
    FR: {
      warningBadge: isDating ? '⚠️ Réservé aux membres vérifiés 21+' : '⚡ Système d\'exécution algorithmique 2026',
      step1Badge: 'ÉTAPE 1 SUR 2',
      step1Ready: '50% PRÊT',
      step2Badge: 'ÉTAPE 2 SUR 2',
      step2Ready: '90% PRÊT',
      step3Sub: 'Recherche des profils actifs à <span class="text-slate-300 font-bold">{city}</span>...',
      step4Badge: '12 PROFILS COMPATIBLES DÉBLOQUÉS',
      step4Title: 'Résultat: 98.6% de compatibilité',
      step4Sub: 'Des profils à <strong class="text-rose-400 underline">{city}</strong> attendent votre réponse!',
      timerPrefix: '⏱️ Invitation valide:',
      socialProof: 'Membre vérifié de <strong class="text-sky-300">{city}</strong> connecté • il y a 2 min',
      footer: `© 2026 ${brandName} • 100% Vérifié & Sécurisé`,
      defaultTrust: ['Chiffrement SSL 256-bit', 'Profils vérifiés', 'Discrétion totale'],
      jsFilterText: 'Filtrage des profils inactifs...',
      jsSuccessText: 'Profils correspondants trouvés avec succès!'
    },
    ES: {
      warningBadge: isDating ? '⚠️ Acceso solo para miembros mayores de 21 años' : '⚡ Sistema de trading algorítmico 2026',
      step1Badge: 'PASO 1 DE 2',
      step1Ready: '50% LISTO',
      step2Badge: 'PASO 2 DE 2',
      step2Ready: '90% LISTO',
      step3Sub: 'Verificando perfiles activos en <span class="text-slate-300 font-bold">{city}</span>...',
      step4Badge: '12 PERFILES COMPATIBLES DESBLOQUEADOS',
      step4Title: 'Resultado: 98.6% de compatibilidad',
      step4Sub: '¡Perfiles en <strong class="text-rose-400 underline">{city}</strong> esperando tu mensaje!',
      timerPrefix: '⏱️ Invitación válida:',
      socialProof: 'Miembro verificado de <strong class="text-sky-300">{city}</strong> conectado • hace 2 min',
      footer: `© 2026 ${brandName} • 100% Verificado y Seguro`,
      defaultTrust: ['Cifrado SSL de 256 bits', 'Perfiles verificados', 'Total discreción'],
      jsFilterText: 'Filtrando perfiles inactivos...',
      jsSuccessText: '¡Perfiles coincidentes encontrados con éxito!'
    }
  };

  const loc = i18n[lang] || i18n.EN;
  const activeTrustNotes = trustNotes && trustNotes.length > 0 ? trustNotes : loc.defaultTrust;

  const heroSectionHtml = isDating ? `
    <!-- Compact Mobile-Optimized VIP Match Preview (Above-The-Fold) -->
    <div class="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 shadow-lg">
      <div class="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[11px] font-mono">
        <span class="flex items-center text-emerald-400 font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
          ${lang === 'DE' ? 'AKTIVE PROFILE IN DER NÄHE' : 'ACTIVE PROFILES NEARBY'}
        </span>
        <span class="text-slate-400 font-mono text-[10px]">${lang === 'DE' ? 'Umkreis:' : 'Radius:'} <strong class="text-sky-300">10 km</strong></span>
      </div>

      <!-- 3 Verified VIP Avatars -->
      <div class="grid grid-cols-3 gap-2 pt-2 text-center">
        <div class="bg-slate-950/70 border border-slate-800 rounded-lg p-1.5 relative group">
          <div class="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-base font-bold text-white shadow-md relative">
            👩
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
          </div>
          <div class="text-[11px] font-bold text-slate-200 mt-1 truncate">Elena (26)</div>
          <div class="text-[9px] text-rose-300 font-mono">2.4 km</div>
        </div>

        <div class="bg-slate-950/70 border border-slate-800 rounded-lg p-1.5 relative group">
          <div class="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center text-base font-bold text-white shadow-md relative">
            👱‍♀️
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
          </div>
          <div class="text-[11px] font-bold text-slate-200 mt-1 truncate">Sophie (29)</div>
          <div class="text-[9px] text-rose-300 font-mono">3.8 km</div>
        </div>

        <div class="bg-slate-950/70 border border-slate-800 rounded-lg p-1.5 relative group">
          <div class="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-sky-500 to-blue-400 flex items-center justify-center text-base font-bold text-white shadow-md relative">
            🧑
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
          </div>
          <div class="text-[11px] font-bold text-slate-200 mt-1 truncate">Max (32)</div>
          <div class="text-[9px] text-rose-300 font-mono">1.9 km</div>
        </div>
      </div>
    </div>
  ` : (heroImage ? `
    <!-- Compact Tech Hero Asset -->
    <div class="relative overflow-hidden rounded-xl border border-slate-800 shadow-md max-h-32 sm:max-h-44">
      <img src="${heroImage}" alt="${title}" loading="lazy" class="w-full h-32 sm:h-44 object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
    </div>
  ` : '');

  return `<!DOCTYPE html>
<html lang="${lang.toLowerCase()}" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #090d16;
      color: #f8fafc;
      overflow-x: hidden;
    }
    h1, h2, h3, .font-heading { font-family: 'Outfit', sans-serif; }
    .glass-card {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 15px 35px -10px ${primaryGlow};
    }
    .touch-target {
      min-height: 48px;
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.9; transform: scale(1.02); }
    }
    .pulse-action {
      animation: pulse-slow 2.5s infinite ease-in-out;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between p-3 sm:p-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#090d16] to-[#04070e]">

  <!-- Header -->
  <header class="max-w-md mx-auto w-full flex justify-between items-center py-2.5 border-b border-slate-800/60">
    <div class="flex items-center space-x-2">
      <span class="text-xl">${isDating ? '💎' : '⚡'}</span>
      <span class="text-base font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
        ${brandName}
      </span>
    </div>
    <div class="flex items-center space-x-1.5 text-[11px] font-mono ${badgeColor} px-2.5 py-0.5 rounded-full border">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      <span>🟢 <span class="font-bold">${activeUsersCount}</span> in <strong class="underline">{city}</strong></span>
    </div>
  </header>

  <!-- Main Conversion Container -->
  <main class="max-w-md mx-auto w-full my-auto py-2.5 space-y-3">
    
    <!-- Hero Title & Micro Hook -->
    <div class="text-center space-y-1">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-900/80 border border-slate-700 text-slate-300">
        ${loc.warningBadge}
      </span>
      <h1 class="text-xl sm:text-2xl font-heading font-extrabold text-white leading-tight tracking-tight pt-1">
        ${headline}
      </h1>
      <p class="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
        ${subheadline}
      </p>
    </div>

    ${heroSectionHtml}

    <!-- Micro-Funnel Interactive Quiz Card (100% Above-the-Fold) -->
    <div class="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
      
      <!-- STEP 1: Micro-Commitment -->
      <div id="quizStep1" class="space-y-3 transition-all duration-300">
        <div class="flex justify-between items-center text-[10px] font-mono text-slate-400 pb-1.5 border-b border-slate-800">
          <span>${loc.step1Badge}</span>
          <span class="text-emerald-400 font-bold">${loc.step1Ready}</span>
        </div>
        <h3 class="text-sm sm:text-base font-heading font-bold text-white text-center">
          ${step1Question}
        </h3>
        <div class="grid grid-cols-2 gap-2.5 pt-0.5">
          ${step1Options.map((opt, i) => `
            <button type="button" onclick="nextQuizStep(2)" class="touch-target py-3 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 hover:border-emerald-400 text-white font-medium text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 shadow-sm">
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- STEP 2: Intent & Location Validation -->
      <div id="quizStep2" class="space-y-3 hidden transition-all duration-300">
        <div class="flex justify-between items-center text-[10px] font-mono text-slate-400 pb-1.5 border-b border-slate-800">
          <span>${loc.step2Badge}</span>
          <span class="text-emerald-400 font-bold">${loc.step2Ready}</span>
        </div>
        <h3 class="text-sm sm:text-base font-heading font-bold text-white text-center">
          ${step2Question}
        </h3>
        <div class="space-y-2 pt-0.5">
          ${step2Options.map((opt, i) => `
            <button type="button" onclick="runAnalysisStep()" class="touch-target w-full py-3 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 hover:border-emerald-400 text-white font-medium text-xs sm:text-sm transition text-left flex items-center justify-between">
              <span>${opt}</span>
              <span class="text-slate-400">&rarr;</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- STEP 3: Animated Verification Progress Bar (2.2s) -->
      <div id="quizStep3" class="space-y-3 hidden text-center py-3">
        <div class="w-10 h-10 mx-auto rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-sky-400 border-l-transparent animate-spin"></div>
        <h4 id="analysisText" class="text-xs sm:text-sm font-heading font-bold text-slate-200">
          ${analyzingText}
        </h4>
        <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div id="analysisBar" class="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 h-2 rounded-full w-0 transition-all duration-1000 ease-out"></div>
        </div>
        <p class="text-[10px] text-slate-500 font-mono">${loc.step3Sub}</p>
      </div>

      <!-- STEP 4: Unlocked High-Impact CTA Reveal -->
      <div id="quizStep4" class="space-y-3.5 hidden text-center transition-all duration-300">
        <div class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold font-mono">
          <span>✓</span>
          <span>${loc.step4Badge}</span>
        </div>

        <div class="space-y-0.5">
          <h3 class="text-lg font-heading font-extrabold text-white">
            ${loc.step4Title}
          </h3>
          <p class="text-xs text-slate-300">
            ${loc.step4Sub}
          </p>
        </div>

        <div class="pt-1">
          <a id="ctaLink" href="${ctaUrl}" class="pulse-action touch-target block w-full py-3.5 rounded-xl font-heading font-extrabold text-sm sm:text-base bg-gradient-to-r ${primaryBtn} text-white shadow-xl shadow-slate-950/50 transform hover:-translate-y-0.5 active:scale-95 transition text-center tracking-wide">
            ${finalCtaText} &rarr;
          </a>
        </div>

        <div class="text-[10px] text-slate-500 flex justify-between items-center pt-1.5 border-t border-slate-800/80 font-mono">
          <span>${loc.timerPrefix} <span class="text-slate-300 font-bold">{date}</span></span>
          <span class="text-rose-400 font-bold dynamic-countdown">14:59</span>
        </div>
      </div>

    </div>

    <!-- Live Social Proof Notification Banner -->
    <div id="liveProofToast" class="bg-slate-900/80 border border-slate-800/90 rounded-xl p-2 flex items-center space-x-2 text-[11px] text-slate-300">
      <span class="text-sm">🔔</span>
      <span class="truncate">${loc.socialProof}</span>
    </div>

    <!-- Trust Badges Bar -->
    <div class="grid grid-cols-3 gap-1.5 text-center text-[10px] text-slate-400 font-mono">
      ${activeTrustNotes.map(n => `
        <div class="bg-slate-900/50 border border-slate-800/60 rounded-lg py-1 px-1 truncate">
          ✓ ${n}
        </div>
      `).join('')}
    </div>

  </main>

  <!-- Footer -->
  <footer class="max-w-md mx-auto w-full text-center py-2 text-[10px] text-slate-600 border-t border-slate-900">
    ${loc.footer}
  </footer>

  <!-- Micro-Funnel Controller & Dynamic Tracking Script -->
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
      
      setTimeout(() => { if (bar) bar.style.width = '45%'; }, 200);
      setTimeout(() => { 
        if (bar) bar.style.width = '85%'; 
        if (text) text.innerText = '${loc.jsFilterText}';
      }, 900);
      setTimeout(() => {
        if (bar) bar.style.width = '100%';
        if (text) text.innerText = '${loc.jsSuccessText}';
      }, 1700);
      setTimeout(() => {
        document.getElementById('quizStep3').classList.add('hidden');
        document.getElementById('quizStep4').classList.remove('hidden');
      }, 2100);
    }

    // Dynamic Tracking & Macro Replacement Engine
    (function() {
      function resolveClickTracking() {
        var urlParams = new URLSearchParams(window.location.search);
        var clickId = urlParams.get('click_id') || 
                      urlParams.get('gclid') || 
                      urlParams.get('s1') || 
                      urlParams.get('ml_sub1') || 
                      urlParams.get('sub1') || 
                      ('clk_' + Math.random().toString(36).substring(2, 9));

        var cta = document.getElementById('ctaLink');
        if (cta) {
          var href = cta.getAttribute('href') || '';
          href = href.replace(/\\[ml_sub1\\]/g, clickId)
                     .replace(/\\[click_id\\]/g, clickId)
                     .replace(/\\[s1\\]/g, clickId);
          cta.setAttribute('href', href);

          cta.addEventListener('click', function(e) {
            // Safety double check on actual click
            var currentHref = cta.getAttribute('href');
            if (currentHref.indexOf('[ml_sub1]') !== -1) {
              cta.setAttribute('href', currentHref.replace(/\\[ml_sub1\\]/g, clickId));
            }
          });
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolveClickTracking);
      } else {
        resolveClickTracking();
      }
    })();
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
  let processed = injectDynamicCreatives(html, { defaultLang: opts.lang || 'DE' });
  processed = injectMicroClickstream(processed, opts.campaignId, opts.variant);

  const outDir = path.resolve(__dirname, `../../../campaigns/${opts.campaignId}/${opts.variant}`);
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.html');
  await fs.writeFile(outPath, processed, 'utf8');

  console.log(`✨ [Landing Architect Skill] Scaffolded ${opts.campaignId}/${opts.variant} -> ${outPath}`);
  return outPath;
}


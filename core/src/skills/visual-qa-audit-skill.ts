import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { generateContent } from '../llm-gateway';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
}

export const AUDIT_VIEWPORTS: ViewportConfig[] = [
  { name: 'iphone14_pro', width: 393, height: 852, deviceScaleFactor: 3, isMobile: true },
  { name: 'pixel_7', width: 412, height: 915, deviceScaleFactor: 2, isMobile: true },
  { name: 'desktop_fhd', width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false }
];

export interface VisualQAChecks {
  aboveTheFold: boolean;
  typographyAndTouchTargets: boolean;
  visualPolishAndImages: boolean;
  localizationAndNoRawTokens: boolean;
}

export interface VisualQAResult {
  campaignId: string;
  variant: string;
  score: number;
  passed: boolean;
  checks: VisualQAChecks;
  screenshots: Record<string, { atf: string; full: string }>;
  domTelemetry: {
    quizStep1AboveTheFold: boolean;
    quizStep1BoundingBox?: { top: number; bottom: number; height: number };
    rawTokensFound: string[];
    brokenImagesCount: number;
    touchTargetsMinHeight: number;
  };
  recommendations: string[];
  autoPatchesAppliedCount: number;
  timestamp: string;
}

export async function runVisualQAAudit(campaignId: string, variant: string = 'v1', options: { autoFix?: boolean } = {}): Promise<VisualQAResult> {
  const autoFix = options.autoFix ?? true;
  console.log(`\n🔍 [Visual QA Inspector] Starting multi-viewport audit for ${campaignId}/${variant}...`);

  const campaignDir = path.resolve(__dirname, `../../../campaigns/${campaignId}/${variant}`);
  const htmlPath = path.join(campaignDir, 'index.html');
  const auditArtifactsDir = path.resolve(__dirname, `../../../.antigravity/audits/${campaignId}_${variant}`);
  await fs.mkdir(auditArtifactsDir, { recursive: true });

  let iteration = 0;
  let finalResult: VisualQAResult | null = null;

  while (iteration < 3) {
    iteration++;
    console.log(`   --- Audit Iteration #${iteration} ---`);

    const result = await captureAndEvaluate(campaignId, variant, htmlPath, auditArtifactsDir);
    finalResult = result;

    if (result.score >= 95 || !autoFix) {
      break;
    }

    console.log(`   ⚠️ Score (${result.score}/100) is below 95 threshold. Applying automated CSS/DOM layout patches...`);
    const patched = await applyAutoPatches(htmlPath, result);
    if (!patched) break;
  }

  console.log(`\n🏆 [Visual QA Audit Complete] Final Score: ${finalResult?.score}/100 (Passed: ${finalResult?.passed})`);
  return finalResult!;
}

async function captureAndEvaluate(
  campaignId: string,
  variant: string,
  htmlPath: string,
  artifactsDir: string
): Promise<VisualQAResult> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const screenshotsMap: Record<string, { atf: string; full: string }> = {};
  let mobileQuizAtf = false;
  let rawTokensList: string[] = [];
  let brokenImages = 0;
  let minTouchTargetHeight = 48;
  let quizBounding: any = null;

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/') + '?city=Berlin&country=Deutschland&click_id=clk_audit_probe_99';

  for (const vp of AUDIT_VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.isMobile,
      userAgent: vp.isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800); // Allow dynamic token animation

    const atfPath = path.join(artifactsDir, `${vp.name}_atf.png`);
    const fullPath = path.join(artifactsDir, `${vp.name}_full.png`);

    // Capture Above-the-fold
    await page.screenshot({ path: atfPath, clip: { x: 0, y: 0, width: vp.width, height: vp.height } });
    // Capture Full Page
    await page.screenshot({ path: fullPath, fullPage: true });

    screenshotsMap[vp.name] = { atf: atfPath, full: fullPath };

    if (vp.name === 'iphone14_pro') {
      // Evaluate DOM bounding boxes on iPhone 14 Pro
      const quizElement = await page.$('#quizStep1');
      if (quizElement) {
        const box = await quizElement.boundingBox();
        if (box) {
          quizBounding = box;
          // Check if Step 1 bottom is within viewport height (852px)
          mobileQuizAtf = box.y + box.height <= vp.height + 30;
        }
      }

      // Check for raw unparsed template tokens
      const bodyText = await page.innerText('body');
      const tokenMatches = bodyText.match(/\{[a-zA-Z0-9_]+\}|\[ml_sub[0-9]\]/g);
      if (tokenMatches) {
        rawTokensList = Array.from(new Set(tokenMatches));
      }

      // Check broken images
      brokenImages = await page.$$eval('img', imgs => imgs.filter(i => !i.complete || i.naturalWidth === 0).length);

      // Check touch targets height for visible interactive elements
      const heights = await page.$$eval('button, .touch-target, a[href]:not(.hidden *)', els => 
        els.filter(e => e.offsetParent !== null && e.getBoundingClientRect().height > 0)
           .map(e => e.getBoundingClientRect().height)
      );
      if (heights.length > 0) {
        minTouchTargetHeight = Math.min(...heights);
      } else {
        minTouchTargetHeight = 48;
      }
    }

    await context.close();
  }

  await browser.close();

  // Compute Rubric Score
  let score = 0;
  const checks: VisualQAChecks = {
    aboveTheFold: mobileQuizAtf,
    typographyAndTouchTargets: minTouchTargetHeight >= 44,
    visualPolishAndImages: brokenImages === 0,
    localizationAndNoRawTokens: rawTokensList.length === 0
  };

  const recommendations: string[] = [];

  // 1. Above-The-Fold Rule (35 pts)
  if (checks.aboveTheFold) {
    score += 35;
  } else {
    recommendations.push('Reduce vertical padding on Header/Hero to ensure Step 1 Quiz card is 100% Above-the-Fold on mobile.');
  }

  // 2. Typography & Touch Targets (25 pts)
  if (checks.typographyAndTouchTargets) {
    score += 25;
  } else {
    recommendations.push(`Increase touch target button heights (currently ${Math.round(minTouchTargetHeight)}px, standard is >= 48px).`);
  }

  // 3. Visual Polish & Images (20 pts)
  if (checks.visualPolishAndImages) {
    score += 20;
  } else {
    recommendations.push(`Fix ${brokenImages} broken image asset(s) on the landing page.`);
  }

  // 4. Localization & Tokens (20 pts)
  if (checks.localizationAndNoRawTokens) {
    score += 20;
  } else {
    recommendations.push(`Unresolved raw template tokens detected in DOM: ${rawTokensList.join(', ')}.`);
  }

  return {
    campaignId,
    variant,
    score,
    passed: score >= 95,
    checks,
    screenshots: screenshotsMap,
    domTelemetry: {
      quizStep1AboveTheFold: mobileQuizAtf,
      quizStep1BoundingBox: quizBounding,
      rawTokensFound: rawTokensList,
      brokenImagesCount: brokenImages,
      touchTargetsMinHeight: minTouchTargetHeight
    },
    recommendations,
    autoPatchesAppliedCount: 0,
    timestamp: new Date().toISOString()
  };
}

/**
 * Automatically applies layout and CSS fixes to meet 95+ Score
 */
async function applyAutoPatches(htmlPath: string, result: VisualQAResult): Promise<boolean> {
  let html = await fs.readFile(htmlPath, 'utf8');
  let modified = false;

  // Patch 1: Above-the-fold padding optimization
  if (!result.checks.aboveTheFold) {
    html = html.replace(/py-4\s+space-y-4/g, 'py-2.5 space-y-3')
               .replace(/p-5\s+sm:p-6\s+space-y-5/g, 'p-4 sm:p-5 space-y-4')
               .replace(/space-y-4\s+transition-all/g, 'space-y-3 transition-all');
    modified = true;
  }

  // Patch 2: Enforce touch targets min-height 48px
  if (!result.checks.typographyAndTouchTargets) {
    html = html.replace(/\.touch-target\s*\{[^}]*\}/g, '.touch-target { min-height: 48px; }');
    modified = true;
  }

  if (modified) {
    await fs.writeFile(htmlPath, html, 'utf8');
    console.log(`   ✨ Applied automated layout patches to: ${htmlPath}`);
    return true;
  }

  return false;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const targetCamp = args[0] || 'cmp_elite_de';
  const targetVar = args[1] || 'v1';

  runVisualQAAudit(targetCamp, targetVar, { autoFix: true }).then(res => {
    console.log('\n📊 Visual QA Inspection Report:\n', JSON.stringify({
      campaign: res.campaignId,
      variant: res.variant,
      score: res.score,
      passed: res.passed,
      checks: res.checks,
      domTelemetry: res.domTelemetry,
      recommendations: res.recommendations
    }, null, 2));
    process.exit(res.passed ? 0 : 1);
  });
}

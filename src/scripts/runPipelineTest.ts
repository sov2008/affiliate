import path from 'path';
import dotenv from 'dotenv';
import { ContentPipeline, PipelineInput } from '../../core/src/workers/contentPipeline.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgBlue: '\x1b[44m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
};

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan} 🚀  AUTONOMOUS MULTI-STAGE CONTENT & ASSET PIPELINE TEST RUNNER${colors.reset}`);
  console.log(`${colors.dim} Node.js: ${process.version} | Timestamp: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================================${colors.reset}\n`);

  const sampleInput: PipelineInput = {
    topic: 'Authentic modern dating advice and meaningful lifestyle connections in 2026',
    niche: 'Dating & Lifestyle',
    campaignId: 'cmp_lospollos_dating',
    targetAudience: 'Single professionals (25-45) looking for verified genuine matches',
    targetPlatform: 'reddit',
    geo: 'US / CA / AU / UK',
    language: 'English (Engaging conversational tone)',
  };

  try {
    const result = await ContentPipeline.execute(sampleInput);

    console.log(`${colors.bold}📦 FINAL GENERATED PAYLOAD ARTIFACT:${colors.reset}`);
    console.log('+' + '-'.repeat(78) + '+');

    console.log(`| ${colors.bold}${'Campaign ID'.padEnd(20)}${colors.reset}: ${colors.cyan}${result.campaignId.padEnd(54)}${colors.reset}|`);
    console.log(`| ${colors.bold}${'Niche'.padEnd(20)}${colors.reset}: ${result.niche.padEnd(54)}|`);
    console.log(`| ${colors.bold}${'Topic'.padEnd(20)}${colors.reset}: ${result.topic.slice(0, 52).padEnd(54)}|`);
    console.log('+' + '-'.repeat(78) + '+');

    console.log(`\n${colors.bold}🧠 STAGE 1: RAW SCOUT STRATEGY & ANGLE:${colors.reset}`);
    console.log(`  ${colors.dim}Raw Hook:${colors.reset} "${result.rawAngle.hook}"`);
    console.log(`  ${colors.dim}Strategy:${colors.reset} ${result.rawAngle.angle}`);

    console.log(`\n${colors.bold}🎭 STAGE 2: HUMANIZER TRANSFORMATION (ANTI-AI DETECTION):${colors.reset}`);
    console.log(`  ${colors.yellow}${colors.bold}Humanized Hook:${colors.reset} "${result.copy.hook}"`);
    console.log(`  ${colors.bold}Humanized Body:${colors.reset} ${result.copy.body}`);
    console.log(`  ${colors.green}${colors.bold}Stealth CTA:${colors.reset}    ${result.copy.callToAction}`);
    console.log(`  ${colors.bold}AI Detection Risk:${colors.reset} ${colors.green}${result.humanizer.ai_detection_risk}${colors.reset}`);
    console.log(`  ${colors.bold}Slang Markers:${colors.reset}     [${colors.cyan}${result.humanizer.slang_markers_used.join(', ')}${colors.reset}]`);

    console.log(`\n${colors.bold}🛡️  STAGE 3: COMPLIANCE GATEKEEPER:${colors.reset}`);
    const statusColor = result.compliance.is_compliant ? colors.green : colors.red;
    console.log(`  Status:     ${statusColor}${result.compliance.is_compliant ? '✅ COMPLIANT' : '❌ VIOLATION'}${colors.reset}`);
    console.log(`  Risk Score: ${colors.cyan}${result.compliance.risk_score} / 100${colors.reset}`);
    console.log(`  Critique:   ${result.compliance.critique}`);
    if (result.compliance.flagged_terms.length > 0) {
      console.log(`  Flagged:    ${colors.yellow}${result.compliance.flagged_terms.join(', ')}${colors.reset}`);
    }

    console.log(`\n${colors.bold}🎨 STAGE 4: VISUAL PROMPT CRAFTING:${colors.reset}`);
    console.log(`  ${colors.dim}Prompt:${colors.reset} "${result.creative.prompt}"`);
    console.log(`  ${colors.dim}Style:${colors.reset}  ${result.creative.style} (${result.creative.aspectRatio})`);

    console.log(`\n${colors.bold}🖼️  STAGE 5: GENERATED ASSET & STORAGE URL:${colors.reset}`);
    console.log(`  Storage:    ${colors.bold}${result.creative.storageType.toUpperCase()}${colors.reset} (${(result.creative.bytes / 1024).toFixed(1)} KB)`);
    console.log(`  Asset URL:  ${colors.cyan}${colors.bold}${result.creative.imageUrl}${colors.reset}`);

    console.log(`\n${colors.bold}⚡ TELEMETRY & PERFORMANCE:${colors.reset}`);
    console.log(`  - Stage 1 (Angle Gen):      ${result.telemetry.stages.angleGenMs}ms`);
    console.log(`  - Stage 2 (Humanizer):      ${result.telemetry.stages.humanizeMs}ms`);
    console.log(`  - Stage 3 (Compliance):     ${result.telemetry.stages.complianceCheckMs}ms`);
    console.log(`  - Stage 4 (Visual Prompt):  ${result.telemetry.stages.promptCraftMs}ms`);
    console.log(`  - Stage 5 (Image & Upload): ${result.telemetry.stages.imageGenAndUploadMs}ms`);
    console.log(`  ${colors.bold}Total Pipeline Latency:      ${colors.green}${(result.telemetry.totalDurationMs / 1000).toFixed(2)}s${colors.reset}`);

    console.log(`\n${colors.bgGreen}${colors.bold}  ✅ PIPELINE EXECUTION COMPLETED WITH 100% PASSING TELEMETRY  ${colors.reset}\n`);
  } catch (err: any) {
    console.error(`\n${colors.red}${colors.bold}❌ Pipeline Execution Failed:${colors.reset}`, err);
    process.exit(1);
  }
}

main();

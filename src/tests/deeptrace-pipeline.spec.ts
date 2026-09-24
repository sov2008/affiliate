import sharp from 'sharp';
import { visionExtractor } from '../services/visionExtractor';
import { deepTraceAnalyzer } from '../services/deepTraceAnalyzer';
import {
  DeepTraceReportDTOSchema,
  DeepTraceInputMetadata,
  DeepTraceAnalysisInput
} from '../types/deeptrace';

async function runEndToEndPipelineTest() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   FLIRTCHECK DEEPTRACE™ END-TO-END INTEGRATION PIPELINE TEST        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  // STEP 1: Generate Mock Screenshot Image Buffer via Sharp
  console.log('📸 Step 1: Generating realistic synthetic chat screenshot via Sharp...');
  const svgOverlay = Buffer.from(`
    <svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0b141a"/>
      <!-- Header -->
      <rect width="100%" height="90" fill="#202c33"/>
      <circle cx="50" cy="45" r="25" fill="#00a884"/>
      <text x="90" y="52" fill="#e9edef" font-family="sans-serif" font-size="20" font-weight="bold">Elena Vance</text>
      <!-- Chat Bubble 1 (User) -->
      <rect x="350" y="150" width="410" height="70" rx="12" fill="#005c4b"/>
      <text x="370" y="190" fill="#e9edef" font-family="sans-serif" font-size="16">Hey Elena, how was work in Chicago today?</text>
      <!-- Chat Bubble 2 (Suspect) -->
      <rect x="40" y="250" width="480" height="90" rx="12" fill="#202c33"/>
      <text x="60" y="290" fill="#e9edef" font-family="sans-serif" font-size="16">Hello dear! I am studying the gold markets</text>
      <text x="60" y="315" fill="#e9edef" font-family="sans-serif" font-size="16">with my uncle who advises in international finance.</text>
    </svg>
  `);

  const initialImageBuffer = await sharp({
    create: {
      width: 800,
      height: 1200,
      channels: 4,
      background: { r: 11, g: 20, b: 26, alpha: 1 }
    }
  })
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();

  console.log(`   Generated PNG Buffer size: ${(initialImageBuffer.length / 1024).toFixed(1)} KB`);

  // STEP 2: Sharp Optimization Pass (as done in Next.js API route)
  console.log('\n⚙️  Step 2: Executing Sharp Optimization pipeline (Resize, EXIF strip, JPEG compress)...');
  const optimizedJpegBuffer = await sharp(initialImageBuffer)
    .rotate()
    .resize({
      width: 1600,
      height: 2400,
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();

  console.log(`   Optimized JPEG Buffer size: ${(optimizedJpegBuffer.length / 1024).toFixed(1)} KB`);
  if (optimizedJpegBuffer.length === 0) {
    throw new Error('Sharp optimization returned empty buffer');
  }

  // STEP 3: Vision Extractor Execution
  console.log('\n👁️  Step 3: Running Vision Extractor with declared metadata...');
  const metadata: DeepTraceInputMetadata = {
    declaredLocation: 'Chicago, IL',
    declaredTimezone: 'America/Chicago (UTC-5)',
    claimedAge: 29,
    platformType: 'WHATSAPP',
    suspectDisplayName: 'Elena Vance',
    targetHandle: '@elena_trade'
  };

  const visionResult = await visionExtractor.extractChatFromImage(
    optimizedJpegBuffer,
    metadata,
    'image/jpeg'
  );

  console.log('   Vision Extraction completed:');
  console.log(`   - Detected Platform: ${visionResult.extraction.detectedPlatform}`);
  console.log(`   - Total Messages: ${visionResult.extraction.totalMessagesExtracted}`);
  console.log(`   - Suspect Messages: ${visionResult.extraction.suspectMessageCount}`);
  console.log(`   - User Messages: ${visionResult.extraction.userMessageCount}`);
  console.log(`   - Extracted URLs: ${visionResult.extraction.extractedUrls.join(', ') || 'None'}`);

  // STEP 4: DeepTrace Analyzer Full Report Generation
  console.log('\n🧠 Step 4: Generating Full DeepTrace Forensic Report from extraction...');
  const analysisInput: DeepTraceAnalysisInput = {
    imageBuffer: optimizedJpegBuffer.toString('base64'),
    imageMimeType: 'image/jpeg',
    metadata,
    requestedForensicDepth: 'DEEP'
  };

  const report = deepTraceAnalyzer.generateFullReport(
    visionResult.visionChatExtraction,
    analysisInput
  );

  // STEP 5: Validate Master DTO Schema
  console.log('\n🛡️  Step 5: Verifying strict compliance with DeepTraceReportDTOSchema...');
  const validatedReport = DeepTraceReportDTOSchema.parse(report);

  console.log('   ✅ Master Report Schema Validation: 100% VALID');
  console.log(`   - Report ID: ${validatedReport.reportId}`);
  console.log(`   - Case Ref: ${validatedReport.caseReference}`);
  console.log(`   - Trust Score: ${validatedReport.overallTrustIndex.score}/100 [${validatedReport.overallTrustIndex.riskLevel}]`);
  console.log(`   - Inferred TZ: ${validatedReport.timezoneBioRhythmAnomalies.inferredTimezone}`);
  console.log(`   - Timezone Shift: ${validatedReport.timezoneBioRhythmAnomalies.timezoneOffsetDeltaHours} hours`);
  console.log(`   - Night Shift Flag: ${validatedReport.timezoneBioRhythmAnomalies.nightShiftFlag}`);
  console.log(`   - Scammer Patterns: ${validatedReport.stylometricBreakdown.detectedRomanceScamPatterns.length}`);
  console.log(`   - Synthetic Face Likelihood: ${validatedReport.visualAvatarForensics.syntheticFaceLikelihood}%`);
  console.log(`   - Defense Challenges: ${validatedReport.actionableDefenseMatrix.length} actionable items`);

  // Verify Chicago Local Anchor Question
  const chicagoAnchor = validatedReport.actionableDefenseMatrix.find(
    (item) => item.category === 'GEO_LOCAL_ANCHOR'
  );
  if (chicagoAnchor) {
    console.log(`   - Verified Geo Anchor Challenge: "${chicagoAnchor.questionText}"`);
  }

  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('🎉 END-TO-END PIPELINE INTEGRATION TEST COMPLETED SUCCESSFULLY!');
  console.log('══════════════════════════════════════════════════════════════════════');
}

runEndToEndPipelineTest().catch((err) => {
  console.error('❌ Pipeline Test Failed:', err);
  process.exit(1);
});

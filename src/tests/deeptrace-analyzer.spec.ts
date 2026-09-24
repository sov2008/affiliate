import { DeepTraceAnalyzerService } from '../services/deepTraceAnalyzer';
import { DeepTraceReportDTOSchema } from '../types/deeptrace';

async function runTestSuite() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   FLIRTCHECK DEEPTRACE™ CORE ANALYZER // UNIT & INTEGRATION TEST     ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  const analyzer = new DeepTraceAnalyzerService();

  // Test 1: High-Risk Pig Butchering Scenario (Chicago)
  console.log('--- TEST 1: High-Risk Pig Butchering Analysis (Chicago Location) ---');
  const highRiskInput = {
    imageBuffer: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    imageMimeType: 'image/png' as const,
    metadata: {
      declaredLocation: 'Chicago, IL',
      declaredTimezone: 'America/Chicago',
      claimedAge: 28,
      claimedGender: 'FEMALE' as const,
      platformType: 'TINDER' as const,
      suspectDisplayName: 'Elena Wealth'
    }
  };

  const highRiskReport = await analyzer.analyze(highRiskInput);
  DeepTraceReportDTOSchema.parse(highRiskReport); // Schema validation guard

  console.log(`✅ Report Generated: ${highRiskReport.caseReference}`);
  console.log(`   Trust Index Score: ${highRiskReport.overallTrustIndex.score}/100 [Level: ${highRiskReport.overallTrustIndex.riskLevel}]`);
  console.log(`   Claimed TZ: ${highRiskReport.timezoneBioRhythmAnomalies.claimedTimezone} | Inferred: ${highRiskReport.timezoneBioRhythmAnomalies.inferredTimezone}`);
  console.log(`   Night Shift Flag: ${highRiskReport.timezoneBioRhythmAnomalies.nightShiftFlag}`);
  console.log(`   Scam Patterns Matched: ${highRiskReport.stylometricBreakdown.detectedRomanceScamPatterns.length}`);
  console.log(`   Defense Matrix Items: ${highRiskReport.actionableDefenseMatrix.length}`);

  if (highRiskReport.overallTrustIndex.riskLevel !== 'CRITICAL' && highRiskReport.overallTrustIndex.riskLevel !== 'HIGH') {
    throw new Error(`Expected HIGH or CRITICAL risk, got ${highRiskReport.overallTrustIndex.riskLevel}`);
  }

  const hasGeoChallenge = highRiskReport.actionableDefenseMatrix.some(item =>
    item.category === 'GEO_LOCAL_ANCHOR' && item.questionText.includes('Kennedy Expressway')
  );
  if (!hasGeoChallenge) {
    throw new Error('Expected Chicago-specific Kennedy Expressway geo anchor in defense matrix');
  }
  console.log('   ✅ Chicago-specific geo challenge verified!');

  // Test 2: Kharkiv Hyper-Local Challenge Verification
  console.log('\n--- TEST 2: Hyper-Local Geo Anchor for Kharkiv ---');
  const kharkivInput = {
    imageBuffer: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    imageMimeType: 'image/png' as const,
    metadata: {
      declaredLocation: 'Kharkiv, Ukraine',
      platformType: 'TELEGRAM' as const
    }
  };

  const kharkivReport = await analyzer.analyze(kharkivInput);
  DeepTraceReportDTOSchema.parse(kharkivReport);

  const hasKharkivChallenge = kharkivReport.actionableDefenseMatrix.some(item =>
    item.category === 'GEO_LOCAL_ANCHOR' && item.questionText.includes('Saltivska metro line')
  );
  if (!hasKharkivChallenge) {
    throw new Error('Expected Kharkiv-specific Saltivska metro line geo challenge');
  }
  console.log('   ✅ Kharkiv-specific metro/Derzhprom geo challenge verified!');

  // Test 3: Custom Vision Executor Hook Verification
  console.log('\n--- TEST 3: Custom Vision Executor Injection ---');
  let customExecutorCalled = false;
  const customAnalyzer = new DeepTraceAnalyzerService({
    customVisionExecutor: async (payload) => {
      customExecutorCalled = true;
      return JSON.stringify({
        detectedPlatform: 'WHATSAPP',
        messages: [
          { sequenceIndex: 0, author: 'USER', text: 'Where are you from?', rawTimestampText: '11:00 AM', detectedLanguage: 'en' },
          { sequenceIndex: 1, author: 'SUSPECT', text: 'I am from Kyiv! Let us chat here.', rawTimestampText: '11:01 AM', detectedLanguage: 'en' }
        ],
        avatarInspection: {
          syntheticFaceLikelihood: 5.0,
          compressionArtifactScore: 20.0,
          irisPupilSymmetryScore: 98.0,
          earGeometryConsistencyScore: 95.0,
          backgroundDiffusionArtifactsDetected: false
        }
      });
    }
  });

  const customReport = await customAnalyzer.analyze({
    imageBuffer: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    imageMimeType: 'image/jpeg' as const,
    metadata: { declaredLocation: 'Kyiv, Ukraine', platformType: 'WHATSAPP' as const }
  });

  DeepTraceReportDTOSchema.parse(customReport);
  if (!customExecutorCalled) {
    throw new Error('Custom vision executor was not invoked');
  }
  console.log(`   ✅ Custom Vision Executor successfully invoked! Trust score: ${customReport.overallTrustIndex.score}/100`);

  console.log('\n🎉 ALL DEEPTRACE ANALYZER TESTS PASSED WITH 100% CONFORMANCE!');
}

runTestSuite().catch(err => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});

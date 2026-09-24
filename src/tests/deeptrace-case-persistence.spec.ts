import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { CaseRepository } from '../db/caseRepository';
import { deepTraceAnalyzer, VisionChatExtraction } from '../services/deepTraceAnalyzer';
import {
  DeepTraceReportDTOSchema,
  DeepTraceAnalysisInput,
  DeepTraceInputMetadata
} from '../types/deeptrace';

console.log('🧪 [Test Suite] FlirtCheck DeepTrace™ Case Persistence (SQLite) & Permalinks');

// Setup isolated test SQLite database in scratch directory
const testDbDir = path.resolve(process.cwd(), 'scratch/tests');
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}
const testDbPath = path.join(testDbDir, `test_cases_${Date.now()}.sqlite`);

// Generate an authentic report using deepTraceAnalyzer
const metadata: DeepTraceInputMetadata = {
  declaredLocation: 'Miami, FL',
  declaredTimezone: 'America/New_York (UTC-5)',
  claimedAge: 29,
  platformType: 'WHATSAPP',
  suspectDisplayName: 'Chloe Finance',
  targetHandle: '@chloe_gold'
};

const mockVisionExtraction: VisionChatExtraction = {
  detectedPlatform: 'WHATSAPP',
  messages: [
    {
      sequenceIndex: 1,
      rawTimestampText: '14:20',
      isoTimestamp: '2026-09-24T14:20:00Z',
      author: 'USER',
      text: 'Hey Chloe, are you still in Miami?'
    },
    {
      sequenceIndex: 2,
      rawTimestampText: '14:22',
      isoTimestamp: '2026-09-24T14:22:00Z',
      author: 'SUSPECT',
      text: 'Yes dear! Just checking my crypto platform investment returns.'
    }
  ],
  avatarInspection: {
    syntheticFaceLikelihood: 12,
    compressionArtifactScore: 0.15,
    irisPupilSymmetryScore: 0.9,
    earGeometryConsistencyScore: 0.88,
    backgroundDiffusionArtifactsDetected: false
  },
  extractedMetadata: {
    urls: ['https://gold-trading-portal.com'],
    phoneNumbers: [],
    cryptoAddresses: []
  }
};

const analysisInput: DeepTraceAnalysisInput = {
  imageBuffer: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  imageMimeType: 'image/png',
  metadata,
  requestedForensicDepth: 'DEEP'
};

const mockReport = deepTraceAnalyzer.generateFullReport(mockVisionExtraction, analysisInput);

async function runPersistenceTests() {
  console.log(`\n--- 1. Initializing CaseRepository on test DB: ${testDbPath} ---`);
  const repo = new CaseRepository(testDbPath);
  console.log('✅ SQLite Schema initialized successfully');

  // Test 2: Save Case
  console.log('\n--- 2. Saving Authentic DeepTrace Report ---');
  repo.saveCase(mockReport, 'WHATSAPP', 'Miami, FL');
  console.log(`✅ Case ${mockReport.caseReference} saved without error`);

  // Test 3: Fetch Case by Reference & Verify Schema Integrity
  console.log('\n--- 3. Fetching Case by Reference & Validating Zod Schema ---');
  const fetchedReport = repo.getCaseByRef(mockReport.caseReference);
  assert(fetchedReport !== null, `Case ${mockReport.caseReference} must exist in database`);
  assert.strictEqual(fetchedReport.caseReference, mockReport.caseReference);
  assert.strictEqual(fetchedReport.overallTrustIndex.score, mockReport.overallTrustIndex.score);
  assert.strictEqual(fetchedReport.overallTrustIndex.riskLevel, mockReport.overallTrustIndex.riskLevel);

  // Full strict Zod Schema validation
  const validated = DeepTraceReportDTOSchema.parse(fetchedReport);
  assert.strictEqual(validated.reportId, mockReport.reportId);
  console.log('✅ Retrieved report conforms 100% to DeepTraceReportDTOSchema');

  // Test 4: View Count & Telemetry Metadata
  console.log('\n--- 4. Checking Record Metadata & View Count Increment ---');
  const recordBefore = repo.getCaseRecord(mockReport.caseReference);
  assert(recordBefore !== null);
  assert.strictEqual(recordBefore.views_count, 0, 'Initial views count must be 0');
  assert.strictEqual(recordBefore.platform, 'WHATSAPP');
  assert.strictEqual(recordBefore.claimed_location, 'Miami, FL');

  repo.incrementViews(mockReport.caseReference);
  repo.incrementViews(mockReport.caseReference);

  const recordAfter = repo.getCaseRecord(mockReport.caseReference);
  assert(recordAfter !== null);
  assert.strictEqual(recordAfter.views_count, 2, 'Views count must be incremented to 2');
  console.log('✅ Views counter updated correctly to 2');

  // Test 5: Conflict Handling / Update Case
  console.log('\n--- 5. Testing ON CONFLICT Upsert Handling ---');
  const updatedReport = {
    ...mockReport,
    overallTrustIndex: {
      ...mockReport.overallTrustIndex,
      score: 15
    }
  };
  repo.saveCase(updatedReport, 'TELEGRAM', 'Miami, FL');
  const reFetched = repo.getCaseByRef(mockReport.caseReference);
  assert(reFetched !== null);
  assert.strictEqual(reFetched.overallTrustIndex.score, 15, 'Trust score must be updated to 15');
  const updatedRecord = repo.getCaseRecord(mockReport.caseReference);
  assert.strictEqual(updatedRecord?.platform, 'TELEGRAM', 'Platform updated to TELEGRAM');
  console.log('✅ Upsert correctly updated existing record');

  // Test 6: Missing Reference Handling
  console.log('\n--- 6. Testing Non-Existent Case Queries ---');
  const missingReport = repo.getCaseByRef('DT-9999-NONEXISTENT');
  assert.strictEqual(missingReport, null, 'Non-existent case must return null');
  const missingRecord = repo.getCaseRecord('DT-9999-NONEXISTENT');
  assert.strictEqual(missingRecord, null, 'Non-existent record must return null');
  console.log('✅ Graceful null handling on missing case references');

  repo.close();

  // Cleanup test DB file
  try {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  } catch {}

  console.log('\n🎉 ALL CASE PERSISTENCE & SCHEMA TESTS PASSED (0 ERRORS)\n');
}

runPersistenceTests().catch((err) => {
  console.error('❌ Case persistence test failed:', err);
  process.exit(1);
});

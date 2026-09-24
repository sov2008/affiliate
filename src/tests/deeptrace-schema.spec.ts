import { DeepTraceReportDTOSchema } from '../types/deeptrace';
import { mockHighRiskRomanceScamReport } from '../mocks/deeptraceReport.mock';

console.log('--- Validating FlirtCheck DeepTrace Schema & Mock Fixture ---');

try {
  const validatedReport = DeepTraceReportDTOSchema.parse(mockHighRiskRomanceScamReport);
  console.log('✅ DeepTraceReportDTOSchema validation PASSED flawlessly!');
  console.log(`Report ID: ${validatedReport.reportId}`);
  console.log(`Case Ref: ${validatedReport.caseReference}`);
  console.log(`Trust Index: ${validatedReport.overallTrustIndex.score}/100 [Risk: ${validatedReport.overallTrustIndex.riskLevel}]`);
  console.log(`Detected Scam Patterns: ${validatedReport.stylometricBreakdown.detectedRomanceScamPatterns.length}`);
  console.log(`Defense Matrix Action Items: ${validatedReport.actionableDefenseMatrix.length}`);
  process.exit(0);
} catch (error: any) {
  console.error('❌ Validation FAILED:', error);
  process.exit(1);
}

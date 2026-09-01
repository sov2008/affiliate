import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  BundleArtifact,
  BundleStatus,
  ComplianceReport,
  GeneratedCreative,
  RawContext,
  EmergencyStopController,
} from '../types/pipeline.js';
import { CopywriterAgent } from '../agents/copy.agent.js';
import { ComplianceGuardAgent } from '../agents/guard.agent.js';
import { MalformedJsonError } from '../agents/base.agent.js';

export interface PipelineOptions {
  concurrency?: number;
  runsDir?: string;
  stopOnError?: boolean;
}

export class PipelineOrchestrator {
  private copywriter: CopywriterAgent;
  private complianceGuard: ComplianceGuardAgent;
  private emergencyController: EmergencyStopController;
  private runsBaseDir: string;

  constructor(options: PipelineOptions = {}) {
    this.copywriter = new CopywriterAgent();
    this.complianceGuard = new ComplianceGuardAgent();
    this.emergencyController = EmergencyStopController.getInstance();

    this.runsBaseDir = options.runsDir || path.resolve(process.cwd(), 'runs');
    if (!fs.existsSync(this.runsBaseDir)) {
      fs.mkdirSync(this.runsBaseDir, { recursive: true });
    }
  }

  /**
   * Processes a single context item through the full pipeline:
   * [Emergency Check] -> [Discovery/Init] -> [CopywriterAgent] -> [ComplianceGuardAgent] -> [Evidence Bundle Persistence]
   */
  public async processSingle(context: RawContext, prelanderSlug: string): Promise<BundleArtifact> {
    const bundleId = crypto.randomUUID();
    const createdAt = Date.now();
    const tracePath: string[] = ['DISCOVERED'];

    // 1. Initial State
    let status: BundleStatus = 'DISCOVERED';
    let creative: GeneratedCreative | undefined;
    let compliance: ComplianceReport | undefined;

    try {
      // 2. Pre-execution Emergency Stop Check
      this.emergencyController.check();

      // 3. Execute CopywriterAgent
      console.log(
        `\x1b[36m[PipelineOrchestrator]\x1b[0m Generating copy for [${context.platform.toUpperCase()}] "${context.topicTitle.slice(0, 40)}..." (Bundle: ${bundleId.slice(0, 8)})`
      );
      creative = await this.copywriter.execute(context, prelanderSlug);
      status = 'GENERATED';
      tracePath.push('GENERATED');

      // 4. Pre-compliance Emergency Stop Check
      this.emergencyController.check();

      // 5. Execute ComplianceGuardAgent
      console.log(
        `\x1b[35m[PipelineOrchestrator]\x1b[0m Evaluating compliance for [${context.platform.toUpperCase()}] "${creative.headline.slice(0, 40)}..."`
      );
      compliance = await this.complianceGuard.evaluate(creative, context.platform);

      if (compliance.passed) {
        status = 'COMPLIANT';
        tracePath.push('COMPLIANT');
        console.log(`  \x1b[32m✅ COMPLIANT\x1b[0m (Score: ${compliance.score}/100)`);
      } else {
        status = 'REJECTED';
        tracePath.push('REJECTED');
        console.warn(`  \x1b[31m❌ REJECTED\x1b[0m (Score: ${compliance.score}/100 | Reason: ${compliance.reasoning})`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (this.emergencyController.isHalted() || errorMsg.includes('EMERGENCY_STOP')) {
        status = 'HALTED';
        tracePath.push('HALTED');
        console.error(`\x1b[41m\x1b[37m[HALTED]\x1b[0m Bundle ${bundleId.slice(0, 8)} stopped by Emergency Stop Controller.`);
      } else if (err instanceof MalformedJsonError || errorMsg.includes('MALFORMED_JSON')) {
        status = 'REJECTED_MALFORMED';
        tracePath.push('REJECTED_MALFORMED');
        console.warn(`\x1b[33m[MALFORMED SCHEMA]\x1b[0m Bundle ${bundleId.slice(0, 8)} marked as REJECTED_MALFORMED after retry failure.`);
      } else {
        status = 'REJECTED';
        tracePath.push('FAILED');
        console.error(`\x1b[31m[Pipeline Error]\x1b[0m Bundle ${bundleId.slice(0, 8)} failed: ${errorMsg}`);
      }
    }

    const artifact: BundleArtifact = {
      id: bundleId,
      createdAt,
      context,
      creative,
      compliance,
      status,
      tracePath,
    };

    // 6. Write Evidence Bundle to Disk atomically
    this.saveEvidenceBundle(artifact);

    return artifact;
  }

  /**
   * Processes a batch of raw context items with concurrency control and evidence bundle persistence.
   */
  public async processBatch(
    items: RawContext[],
    prelanderSlug: string,
    options: PipelineOptions = {}
  ): Promise<BundleArtifact[]> {
    const concurrency = options.concurrency ?? 2;
    console.log(
      `\n\x1b[1m\x1b[34m=== [PipelineOrchestrator] Starting Batch Processing (${items.length} items, concurrency: ${concurrency}) ===\x1b[0m`
    );

    const results: BundleArtifact[] = [];

    for (let i = 0; i < items.length; i += concurrency) {
      this.emergencyController.check();

      const batch = items.slice(i, i + concurrency);
      const batchPromises = batch.map((item) => this.processSingle(item, prelanderSlug));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const compliantCount = results.filter((r) => r.status === 'COMPLIANT').length;
    const rejectedCount = results.filter((r) => r.status === 'REJECTED' || r.status === 'REJECTED_MALFORMED').length;
    const haltedCount = results.filter((r) => r.status === 'HALTED').length;

    console.log(`\n\x1b[1m\x1b[32m=== [PipelineOrchestrator] Batch Completed ===\x1b[0m`);
    console.log(
      `📊 Summary: Total: ${results.length} | Compliant: ${compliantCount} | Rejected: ${rejectedCount} | Halted: ${haltedCount}\n`
    );

    return results;
  }

  /**
   * Persists Evidence Bundle to disk under /runs/{bundle_id}/bundle.json safely and atomically
   */
  private saveEvidenceBundle(artifact: BundleArtifact): void {
    const bundleDir = path.join(this.runsBaseDir, artifact.id);
    if (!fs.existsSync(bundleDir)) {
      fs.mkdirSync(bundleDir, { recursive: true });
    }

    const filePath = path.join(bundleDir, 'bundle.json');
    const tempPath = path.join(bundleDir, `bundle.json.tmp.${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);

    try {
      fs.writeFileSync(tempPath, JSON.stringify(artifact, null, 2), 'utf8');
      fs.renameSync(tempPath, filePath);
      console.log(`  💾 Evidence Bundle persisted (Atomic) -> \x1b[2m${filePath}\x1b[0m`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to write Evidence Bundle ${artifact.id}: ${errorMsg}`);
      // Clean up temp file if rename failed
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch {}
    }
  }
}

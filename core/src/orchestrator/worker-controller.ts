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
import { LlmGatewayService } from '../services/llm-gateway.service.js';
import { CopywriterAgent } from '../agents/copy.agent.js';
import { ComplianceGuardAgent } from '../agents/guard.agent.js';
import { ContentQueueRepository } from '../db/queueRepository.js';

export interface WorkerControllerOptions {
  runsDir?: string;
}

export class WorkerController {
  private readonly gateway: LlmGatewayService;
  private readonly copywriter: CopywriterAgent;
  private readonly complianceGuard: ComplianceGuardAgent;
  private readonly emergencyController: EmergencyStopController;
  private readonly runsBaseDir: string;
  private readonly pendingRunsDir: string;

  constructor(options: WorkerControllerOptions = {}) {
    this.gateway = LlmGatewayService.getInstance();
    this.copywriter = new CopywriterAgent();
    this.complianceGuard = new ComplianceGuardAgent();
    this.emergencyController = EmergencyStopController.getInstance();

    this.runsBaseDir = options.runsDir || path.resolve(process.cwd(), 'runs');
    this.pendingRunsDir = path.join(this.runsBaseDir, 'pending');

    if (!fs.existsSync(this.runsBaseDir)) {
      fs.mkdirSync(this.runsBaseDir, { recursive: true });
    }
    if (!fs.existsSync(this.pendingRunsDir)) {
      fs.mkdirSync(this.pendingRunsDir, { recursive: true });
    }
  }

  /**
   * Orchestrates the agent execution loop with live registry configuration,
   * tool permission checks, worker pause guards, and Review Gate routing.
   */
  public async executePipeline(context: RawContext, prelanderSlug: string): Promise<BundleArtifact> {
    const bundleId = crypto.randomUUID();
    const createdAt = Date.now();
    const tracePath: string[] = ['DISCOVERED'];

    // 1. Initial State
    let status: BundleStatus = 'DISCOVERED';
    let creative: GeneratedCreative | undefined;
    let compliance: ComplianceReport | undefined;

    try {
      // 2. Atomic Global E-STOP Check
      this.emergencyController.check();

      // 3. Inspect Live Agent Configurations
      this.gateway.loadRegistry();
      const copywriterConfig = this.gateway.getAgent('agent-context-copywriter-02');
      const guardConfig = this.gateway.getAgent('agent-compliance-guard-03');
      const workerConfig = this.gateway.getAgent('agent-distribution-worker-04');

      // 4. Worker Pause Check: Copywriter
      if (copywriterConfig?.isPaused) {
        console.warn(
          `\x1b[33m[WorkerController]\x1b[0m Copywriter agent (${copywriterConfig.name}) is PAUSED. Skipping execution without global E-STOP.`
        );
        status = 'WORKER_SKIPPED_PAUSED';
        tracePath.push('WORKER_SKIPPED_PAUSED');
        return this.saveAndReturnBundle(bundleId, createdAt, context, status, tracePath);
      }

      // 5. Generate Creative
      console.log(
        `\x1b[36m[WorkerController]\x1b[0m Running CopywriterAgent for [${context.platform.toUpperCase()}] "${context.topicTitle.slice(0, 35)}..."`
      );
      creative = await this.copywriter.execute(context, prelanderSlug);
      status = 'GENERATED';
      tracePath.push('GENERATED');

      // 6. Pre-compliance E-STOP Check
      this.emergencyController.check();

      // 7. Worker Pause Check: Compliance Guard
      if (guardConfig?.isPaused) {
        console.warn(
          `\x1b[33m[WorkerController]\x1b[0m ComplianceGuard agent (${guardConfig.name}) is PAUSED. Enforcing mandatory human review gate.`
        );
        status = 'AWAITING_HUMAN_APPROVAL';
        tracePath.push('AWAITING_HUMAN_APPROVAL');
        return this.saveAndReturnBundle(bundleId, createdAt, context, status, tracePath, creative);
      }

      // 8. Execute Compliance Audit
      console.log(
        `\x1b[35m[WorkerController]\x1b[0m Running ComplianceGuardAgent for [${context.platform.toUpperCase()}] "${creative.headline.slice(0, 35)}..."`
      );
      compliance = await this.complianceGuard.evaluate(creative, context.platform);

      if (!compliance.passed) {
        status = 'REJECTED';
        tracePath.push('REJECTED');
        console.warn(
          `  \x1b[31m❌ REJECTED\x1b[0m (Score: ${compliance.score}/100 | Reason: ${compliance.reasoning})`
        );
        return this.saveAndReturnBundle(bundleId, createdAt, context, status, tracePath, creative, compliance);
      }

      status = 'COMPLIANT';
      tracePath.push('COMPLIANT');
      console.log(`  \x1b[32m✅ COMPLIANT\x1b[0m (Score: ${compliance.score}/100)`);

      // 9. Tool Permission Boundary Enforcement: Distribution Worker
      const allowedTools = workerConfig?.allowedTools || [];
      const hasDispatchPermission =
        allowedTools.includes('PLAYWRIGHT_AUTOMATION') || allowedTools.includes('DIRECT_HTTP_POST');

      if (!hasDispatchPermission) {
        console.warn(
          `\x1b[31m[WorkerController]\x1b[0m DistributionWorker has NO dispatch permissions (PLAYWRIGHT_AUTOMATION / DIRECT_HTTP_POST disabled).`
        );
        status = 'PERMISSION_DENIED';
        tracePath.push('PERMISSION_DENIED');
        return this.saveAndReturnBundle(bundleId, createdAt, context, status, tracePath, creative, compliance);
      }

      // 10. Review Gate Enforcement
      const isReviewRequired =
        copywriterConfig?.requireHumanReview || workerConfig?.requireHumanReview || false;

      if (isReviewRequired) {
        status = 'AWAITING_HUMAN_APPROVAL';
        tracePath.push('AWAITING_HUMAN_APPROVAL');
        console.log(
          `  \x1b[33m⏳ REVIEW GATE ACTIVE\x1b[0m -> Routing Bundle ${bundleId.slice(0, 8)} to /runs/pending/ & SQLite Queue.`
        );

        // Enqueue into SQLite Content Queue for HITL review
        ContentQueueRepository.getInstance().enqueue({
          id: bundleId,
          campaign_id: (context.metadata?.campaign_id as string) || 'cmp_organic_v1',
          network: (context.metadata?.network as any) || 'mylead',
          hook: creative.headline,
          body: creative.body,
          stealth_cta: creative.callToAction,
          tracking_url: (context.metadata?.tracking_url as string) || '',
          image_path: (context.metadata?.image_path as string) || '',
          target_platform: (context.platform as any) || 'reddit',
          risk_score: Math.max(5, 100 - compliance.score),
          status: 'PENDING_APPROVAL',
        });
      } else {
        status = 'APPROVED';
        tracePath.push('APPROVED');
      }

      return this.saveAndReturnBundle(bundleId, createdAt, context, status, tracePath, creative, compliance);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (this.emergencyController.isHalted() || errorMsg.includes('EMERGENCY_STOP')) {
        status = 'HALTED';
        tracePath.push('HALTED');
        console.error(`\x1b[41m\x1b[37m[HALTED]\x1b[0m Bundle ${bundleId.slice(0, 8)} stopped by Emergency Stop Controller.`);
      } else {
        status = 'REJECTED';
        tracePath.push('FAILED');
        console.error(`\x1b[31m[WorkerController Error]\x1b[0m Bundle ${bundleId.slice(0, 8)}: ${errorMsg}`);
      }

      return this.saveAndReturnBundle(bundleId, createdAt, context, status, tracePath, creative, compliance);
    }
  }

  /**
   * Atomic Evidence Bundle persistence with pending routing support
   */
  private saveAndReturnBundle(
    id: string,
    createdAt: number,
    context: RawContext,
    status: BundleStatus,
    tracePath: string[],
    creative?: GeneratedCreative,
    compliance?: ComplianceReport
  ): BundleArtifact {
    const artifact: BundleArtifact = {
      id,
      createdAt,
      context,
      creative,
      compliance,
      status,
      tracePath,
    };

    try {
      const targetDir =
        status === 'AWAITING_HUMAN_APPROVAL'
          ? path.join(this.pendingRunsDir, id)
          : path.join(this.runsBaseDir, id);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const bundleFile = path.join(targetDir, 'bundle.json');
      const tmpFile = `${bundleFile}.tmp.${Date.now()}`;

      fs.writeFileSync(tmpFile, JSON.stringify(artifact, null, 2), 'utf8');
      fs.renameSync(tmpFile, bundleFile);

      // Also mirror to main /runs/{id}/ if in pending
      if (status === 'AWAITING_HUMAN_APPROVAL') {
        const mirrorDir = path.join(this.runsBaseDir, id);
        if (!fs.existsSync(mirrorDir)) fs.mkdirSync(mirrorDir, { recursive: true });
        fs.writeFileSync(path.join(mirrorDir, 'bundle.json'), JSON.stringify(artifact, null, 2), 'utf8');
      }
    } catch (err: unknown) {
      console.error(`[WorkerController] Failed to persist bundle:`, err);
    }

    return artifact;
  }
}
